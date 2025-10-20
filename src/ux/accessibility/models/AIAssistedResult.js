/**
 * Represents an AI-assisted accessibility test result model
 * This model stores the analysis results from ChromaCheck, AnchorSense, and ImgTagTip tools
 */
export default class AIAssistedResult {
    /**
     * @param {Object} data - The data to initialize the result with
     */
    constructor(data = {}) {
        // Primary identifiers
        this.testId = data.testId || null;
        
        // Input source information
        this.url = data.url || '';
        this.sourceFile = data.sourceFile || ''; // Firebase Storage reference
        this.sourceFileName = data.sourceFileName || '';
        this.inputType = data.inputType || 'url'; // 'url' or 'file'
        
        // Tool analysis results
        this.chroma_check = data.chroma_check || null;
        this.anchor_sense = data.anchor_sense || null;
        this.img_tip = data.img_tip || null;
        
        // Metadata
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.lastAnalyzedTool = data.lastAnalyzedTool || null;
        
        // Analysis summary (computed from tool results)
        this.totalIssues = data.totalIssues || 0;
        this.toolsCompleted = data.toolsCompleted || [];
    }

    /**
     * Converts the model to a plain object for Firestore
     * @returns {Object} Plain object representation of the model
     */
    toFirestore() {
        return {
            testId: this.testId,
            url: this.url,
            sourceFile: this.sourceFile,
            sourceFileName: this.sourceFileName,
            inputType: this.inputType,
            chroma_check: this.chroma_check,
            anchor_sense: this.anchor_sense,
            img_tip: this.img_tip,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastAnalyzedTool: this.lastAnalyzedTool,
            totalIssues: this.totalIssues,
            toolsCompleted: this.toolsCompleted
        };
    }

    /**
     * Creates an AIAssistedResult instance from Firestore document
     * @param {Object} doc - Firestore document snapshot
     * @returns {AIAssistedResult} New instance of AIAssistedResult
     */
    static fromFirestore(doc) {
        if (!doc.exists()) {
            return null;
        }

        const data = doc.data();
        return new AIAssistedResult({
            ...data,
            testId: doc.id
        });
    }

    /**
     * Update ChromaCheck analysis results
     * @param {Object} chromaData - ChromaCheck analysis data
     */
    updateChromaCheck(chromaData) {
        this.chroma_check = {
            source: chromaData.source || 'html_content',
            violations: chromaData.violations || [],
            total_issues: chromaData.total_issues || 0,
            passed: chromaData.passed || false,
            marked_html: chromaData.marked_html || '',
            analyzed_at: new Date().toISOString()
        };
        
        this.lastAnalyzedTool = 'chroma_check';
        this.updatedAt = new Date().toISOString();
        
        if (!this.toolsCompleted.includes('chroma_check')) {
            this.toolsCompleted.push('chroma_check');
        }
        
        this._updateTotalIssues();
    }

    /**
     * Update AnchorSense analysis results
     * @param {Object} anchorData - AnchorSense analysis data
     */
    updateAnchorSense(anchorData) {
        this.anchor_sense = {
            issues: anchorData.issues || [],
            total_issues: anchorData.total_issues || 0,
            passed: anchorData.passed || false,
            analyzed_at: new Date().toISOString()
        };
        
        this.lastAnalyzedTool = 'anchor_sense';
        this.updatedAt = new Date().toISOString();
        
        if (!this.toolsCompleted.includes('anchor_sense')) {
            this.toolsCompleted.push('anchor_sense');
        }
        
        this._updateTotalIssues();
    }

    /**
     * Update ImgTagTip analysis results
     * @param {Object} imgTipData - ImgTagTip analysis data
     */
    updateImgTip(imgTipData) {
        this.img_tip = {
            images: imgTipData.images || [],
            total_images: imgTipData.total_images || 0,
            issues_found: imgTipData.issues_found || 0,
            analyzed_at: new Date().toISOString()
        };
        
        this.lastAnalyzedTool = 'img_tip';
        this.updatedAt = new Date().toISOString();
        
        if (!this.toolsCompleted.includes('img_tip')) {
            this.toolsCompleted.push('img_tip');
        }
        
        this._updateTotalIssues();
    }

    /**
     * Calculate total issues across all tools
     * @private
     */
    _updateTotalIssues() {
        let total = 0;
        
        if (this.chroma_check) {
            total += this.chroma_check.total_issues || 0;
        }
        
        if (this.anchor_sense) {
            total += this.anchor_sense.total_issues || 0;
        }
        
        if (this.img_tip) {
            total += this.img_tip.issues_found || 0;
        }
        
        this.totalIssues = total;
    }

    /**
     * Check if a specific tool has been completed
     * @param {string} toolName - Name of the tool ('chroma_check', 'anchor_sense', 'img_tip')
     * @returns {boolean}
     */
    isToolCompleted(toolName) {
        return this.toolsCompleted.includes(toolName);
    }

    /**
     * Get completion percentage (0-100)
     * @returns {number}
     */
    getCompletionPercentage() {
        const totalTools = 3;
        return Math.round((this.toolsCompleted.length / totalTools) * 100);
    }

    /**
     * Check if all tools have been completed
     * @returns {boolean}
     */
    isFullyAnalyzed() {
        return this.toolsCompleted.length === 3;
    }

    /**
     * Get a summary of the analysis
     * @returns {Object}
     */
    getSummary() {
        return {
            testId: this.testId,
            inputType: this.inputType,
            url: this.url,
            sourceFileName: this.sourceFileName,
            totalIssues: this.totalIssues,
            toolsCompleted: this.toolsCompleted,
            completionPercentage: this.getCompletionPercentage(),
            isFullyAnalyzed: this.isFullyAnalyzed(),
            chromaIssues: this.chroma_check?.total_issues || 0,
            anchorIssues: this.anchor_sense?.total_issues || 0,
            imgTipIssues: this.img_tip?.issues_found || 0,
            lastAnalyzed: this.lastAnalyzedTool,
            updatedAt: this.updatedAt
        };
    }
}
