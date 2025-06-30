// express js server file to llm to get context of how the ackend works

// server.js - Main Express server file
const express = require('express');
const cors = require('cors');
const pa11y = require('pa11y');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('./servicekey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const fs = require('fs');
const axios = require('axios');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store reports temporarily
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
}

// Create a directory for modified HTML files
const modifiedHtmlDir = path.join(__dirname, 'modified_html');
if (!fs.existsSync(modifiedHtmlDir)) {
    fs.mkdirSync(modifiedHtmlDir);
}

// Test Firestore endpoint
app.get('/firebasetest', async (req, res) => {
    try {
        const reportRef = db.collection('report');
        const testData = {
            data: "hello world",
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await reportRef.add(testData);

        res.json({
            success: true,
            message: 'Document added to Firestore',
            documentId: docRef.id
        });
    } catch (error) {
        console.error('Error adding document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add document to Firestore',
            error: error.message
        });
    }
});

// Routes
app.post('/api/test', async (req, res) => {
    console.log('=== Starting accessibility test ===');
    try {
        const { url, testId } = req.body;

        if (!url) {
            console.error('Error: URL is required');
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`[1/5] Starting accessibility test for URL: ${url}`);
        console.log(`[1/5] Initializing Pa11y with WCAG2AA standard...`);

        // Run Pa11y test (Pa11y already uses Puppeteer under the hood)
        console.log(`[2/5] Running accessibility tests... (This may take a moment)`);
        const startTime = Date.now();
        const results = await pa11y(url, {
            standard: 'WCAG2AA',
            includeNotices: true,
            includeWarnings: true,
            timeout: 50000,
            wait: 1000,
        });
        const testDuration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[2/5] Accessibility tests completed in ${testDuration} seconds`);
        console.log(`[2/5] Found ${results.issues.length} accessibility issues`);

        // Fetch the fully rendered HTML content with Puppeteer
        const { html, stylesheets } = await fetchFullWebpage(url);

        if (!html) {
            return res.status(500).json({ error: 'Failed to fetch webpage' });
        }

        // Fetch all external CSS
        const cssContent = await fetchAllCss(stylesheets);

        // Generate modified HTML with highlights and embedded CSS
        const modifiedHtml = generateModifiedHtml(html, results.issues, cssContent);

        // Create a unique report ID
        const reportId = uuidv4();

        // Save the modified HTML to a file
        const modifiedHtmlPath = path.join(modifiedHtmlDir, `${reportId}.html`);
        // Also save a screenshot of the page
        const screenshotPath = path.join(modifiedHtmlDir, `${uuidv4()}-screenshot.png`);
        await takeScreenshot(url, screenshotPath);

        // Generate report ID and prepare report data
        console.log(`[3/5] Generating report data...`);

        const report = {
            id: reportId,
            url,
            dateTime: new Date().toISOString(),
            issues: results.issues,
            modifiedHtml: modifiedHtml,
            documentTitle: results.documentTitle,
            pageUrl: results.pageUrl,
        };

        // Save the report to a file
        console.log(`[4/5] Saving report to filesystem...`);
        const reportPath = path.join(reportsDir, `${reportId}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report));
        console.log(`[4/5] Report saved to: ${reportPath}`);

        // Save to Firestore
        console.log(`[5/5] Saving report to Firestore...`);
        const firebaseReport = {
            ReportId: reportId,
            TestId: testId, // <-- Save testId in Firestore
            ReportUrl: url,
            ReportDateTime: new Date().toISOString(),
            ReportIssues: results.issues,
            ReportIssueCount: results.issues.length,
            ReportModifiedHtml: modifiedHtml,
            TestDuration: testDuration,
            DocumentTitle: results.documentTitle
        };

        const reportRef = db.collection('report');
        const docRef = await reportRef.add(firebaseReport);
        console.log(`[5/5] Report saved to Firestore with ID: ${docRef.id}`);
        console.log('=== Accessibility test completed successfully ===');

        res.json({
            reportId,
            summary: {
                total: results.issues.length,
                errors: results.issues.filter(issue => issue.type === 'error').length,
                warnings: results.issues.filter(issue => issue.type === 'warning').length,
                notices: results.issues.filter(issue => issue.type === 'notice').length
            },
            modifiedHtml: modifiedHtml, // Add the modified HTML
            modifiedHtmlPath: `/modified_html/${reportId}.html`,
            screenshotPath: `/modified_html/${reportId}-screenshot.png`
        });
    } catch (error) {
        console.error('=== ERROR during accessibility test ===');
        console.error('Error details:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        console.error('=== End of error details ===');
        res.status(500).json({
            error: 'Failed to run accessibility test',
            details: error.message
        });
    }
});

app.get('/api/reports', (req, res) => {
    try {
        const files = fs.readdirSync(reportsDir);
        const reports = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const data = JSON.parse(fs.readFileSync(path.join(reportsDir, file)));
                return {
                    id: data.id,
                    url: data.url,
                    dateTime: data.dateTime,
                    summary: {
                        total: data.issues.length,
                        errors: data.issues.filter(issue => issue.type === 'error').length,
                        warnings: data.issues.filter(issue => issue.type === 'warning').length,
                        notices: data.issues.filter(issue => issue.type === 'notice').length
                    },
                    modifiedHtmlPath: data.modifiedHtmlPath,
                    screenshotPath: data.screenshotPath
                };
            });

        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

app.get('/api/reports/:id', (req, res) => {
    try {
        const { id } = req.params;
        const reportPath = path.join(reportsDir, `${id}.json`);

        if (!fs.existsSync(reportPath)) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const report = JSON.parse(fs.readFileSync(reportPath));

        // Read the modified HTML file if it exists
        const modifiedHtmlPath = path.join(modifiedHtmlDir, `${id}.html`);
        if (fs.existsSync(modifiedHtmlPath)) {
            report.modifiedHtml = fs.readFileSync(modifiedHtmlPath, 'utf8');
        }

        res.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Serve modified HTML files
app.use('/modified_html', express.static(modifiedHtmlDir));

// Helper Functions

// Fetch fully rendered webpage content with Puppeteer
async function fetchFullWebpage(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport size to desktop
        await page.setViewport({
            width: 1366,
            height: 768
        });

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to URL with timeout
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Use evaluate for waiting instead of waitForTimeout
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

        // Get all stylesheet URLs
        const stylesheets = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return links.map(link => link.href);
        });

        // Get inline styles
        const inlineStyles = await page.evaluate(() => {
            const styles = Array.from(document.querySelectorAll('style'));
            return styles.map(style => style.textContent);
        });

        // Get the final HTML content after JS execution
        const html = await page.content();

        await browser.close();
        browser = null;

        return {
            html,
            stylesheets,
            inlineStyles
        };
    } catch (error) {
        console.error(`Error fetching webpage with Puppeteer: ${error.message}`);
        if (browser) await browser.close();
        return { html: null, stylesheets: [], inlineStyles: [] };
    }
}

// Take a screenshot of the webpage
async function takeScreenshot(url, screenshotPath) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Use evaluate for waiting instead of waitForTimeout
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

        // Take screenshot
        await page.screenshot({ path: screenshotPath, fullPage: true });

        await browser.close();
        browser = null;

        return true;
    } catch (error) {
        console.error(`Error taking screenshot: ${error.message}`);
        if (browser) await browser.close();
        return false;
    }
}

// Fetch all CSS content
async function fetchAllCss(stylesheetUrls) {
    const cssContent = {};

    for (const url of stylesheetUrls) {
        try {
            const response = await axios.get(url);
            cssContent[url] = response.data;
        } catch (error) {
            console.error(`Error fetching CSS from ${url}: ${error.message}`);
        }
    }

    return cssContent;
}

// Function to generate modified HTML with highlights and embedded CSS
function generateModifiedHtml(html, issues, cssContent) {
    const $ = cheerio.load(html);

    // Add issue highlights
    issues.forEach((issue, index) => {
        if (issue.selector) {
            try {
                const element = $(issue.selector);
                if (element.length > 0) {
                    const issueId = `issue-${index}`;

                    // Add a class and data attributes
                    element.addClass('a11y-issue');
                    element.attr('data-issue-id', issueId);
                    element.attr('data-issue-type', issue.type);
                    element.attr('data-issue-code', issue.code);
                    element.attr('data-issue-message', issue.message);

                    // Add a style to highlight the element with a dotted border
                    element.css({
                        'border': issue.type === 'error' ? '2px dotted red' :
                            issue.type === 'warning' ? '2px dotted orange' : '2px dotted blue',
                        'position': 'relative'
                    });

                    // Add an overlay with issue number
                    const overlay = $(`<div class="a11y-issue-marker" data-issue-id="${issueId}">${index + 1}</div>`);
                    element.append(overlay);
                } else {
                    console.warn(`Element not found for selector: ${issue.selector}`);
                }
            } catch (error) {
                console.error(`Error highlighting element ${issue.selector}:`, error);
            }
        }
    });

    // Create a head tag if it doesn't exist
    if (!$('head').length) {
        if ($('html').length) {
            $('html').prepend('<head></head>');
        } else {
            $('body').before('<head></head>');
        }
    }

    // Add all CSS content as a single style tag
    let allCss = '\n/* Combined CSS */\n';
    for (const [url, content] of Object.entries(cssContent)) {
        allCss += `\n/* From: ${url} */\n${content}\n`;
    }

    // Add custom CSS for the overlays
    allCss += `
    /* Accessibility issue highlighting styles */
    .a11y-issue-marker {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: red;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      z-index: 9999;
      cursor: pointer;
    }
    .a11y-issue[data-issue-type="warning"] .a11y-issue-marker {
      background-color: orange;
    }
    .a11y-issue[data-issue-type="notice"] .a11y-issue-marker {
      background-color: blue;
    }
    
    /* Tooltip styles for issue details */
    .a11y-issue:hover::after {
      content: attr(data-issue-message);
      position: absolute;
      top: 20px;
      left: 0;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
      white-space: normal;
    }
  `;

    $('head').append(`<style>${allCss}</style>`);

    // Add a script to make the issue markers interactive
    $('body').append(`
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const issues = document.querySelectorAll('.a11y-issue');
        issues.forEach(issue => {
          issue.addEventListener('click', function() {
            const message = this.getAttribute('data-issue-message');
            const code = this.getAttribute('data-issue-code');
            const type = this.getAttribute('data-issue-type');
            
            alert('Accessibility Issue:\\nType: ' + type.toUpperCase() + 
                  '\\nMessage: ' + message + 
                  '\\nCode: ' + code);
          });
        });
      });
    </script>
  `);

    return $.html();
}

// Start server
app.listen(port, () => {
    console.log(`Accessibility testing server running on port ${port}`);
    console.log(`Modified HTML files available at: http://localhost:${port}/modified_html/`);
});