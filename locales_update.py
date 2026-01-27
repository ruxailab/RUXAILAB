import json
import os

locales_dir = '/Users/revaa/Desktop/orgs/RUXAILAB/RUXAILAB/src/app/plugins/locales'
locales = ['en', 'es', 'hi', 'fr', 'pt_br', 'ar', 'de', 'ja', 'ru', 'zh']

translations_base = {
    'en': {
        "UserTestTaskDialog": {
            "titles": {
                "createTask": "Create New Task",
                "configureStepByStep": "Configure your task step by step"
            },
            "steps": {
                "basicInfo": "Basic Info",
                "configuration": "Configuration",
                "advanced": "Advanced",
                "preview": "Preview",
                "step1Title": "Step 1: Task Basic Information",
                "step1Desc": "Define what participants will do in this task. This is the foundation of your user test - be clear and specific about the goals and expectations.",
                "step2Title": "Step 2: Task Configuration",
                "step2Desc": "Configure where the task takes place and how participants will provide their responses. This determines the user experience and data collection method.",
                "step3Title": "Step 3: Advanced Options",
                "step3Desc": "Enable additional data collection methods to gather deeper insights. All options are optional but can provide valuable behavioral data and user feedback.",
                "step4Title": "Step 4: Preview"
            },
            "fields": {
                "taskTitle": "Task title",
                "taskTitleHint": "Give your task a clear, concise name that describes what participants need to accomplish",
                "taskTitlePlaceholder": "e.g., 'Find product information', 'Complete checkout process'",
                "taskDescription": "Task Description",
                "taskDescriptionHint": "Provide detailed instructions for participants. Include the goal, context, and any specific steps they should follow.",
                "taskDescriptionPlaceholder": "Describe the task in detail. What should the participant do?",
                "taskTip": "Tip",
                "taskTipHint": "Optional guidance or hints to help participants during the task",
                "taskTipPlaceholder": "e.g., 'Focus on the main navigation', 'Take your time to explore'",
                "taskLink": "Task Link (URL)",
                "taskLinkHint": "The website or application URL where participants will perform the task",
                "taskLinkPlaceholder": "https://example.com",
                "estimatedTime": "Estimated Time (minutes)",
                "estimatedTimeHint": "The estimated time participants will need to complete this task",
                "estimatedTimePlaceholder": "e.g. 10",
                "answerType": "Answer Type",
                "answerTypeHint": "Choose how participants will provide feedback after completing the task",
                "postTestQuestion": "Post-Test Question",
                "postTestQuestionHint": "Enter the specific question you want to ask participants after they complete the task",
                "postTestQuestionPlaceholder": "e.g., 'How easy was it to find the product information?'",
                "postFormUrl": "Post-Task Form URL",
                "postFormUrlHint": "URL to an external form that participants will fill out after completing the task",
                "postFormUrlPlaceholder": "https://forms.google.com/d/your-form-id"
            },
            "answerTypes": {
                "noAnswer": "No Answer Required",
                "noAnswerDesc": "Participants complete the task without providing feedback",
                "textArea": "Text Area",
                "textAreaDesc": "Participants provide written feedback after the task",
                "postTest": "Post-Test Questions",
                "postTestDesc": "Participants answer specific questions after the task",
                "postForm": "External Form",
                "postFormDesc": "Participants fill out an external form after the task",
                "nasaTlx": "NASA-TLX",
                "nasaTlxDesc": "NASA Task Load Index - measures workload",
                "sus": "System Usability Scale",
                "susDesc": "System Usability Scale - measures usability",
                "tam1": "TAM-1 (Basic)",
                "tam1Desc": "TAM-1 (Basic Acceptance) - measures perceived usefulness and ease of use",
                "tam2": "TAM-2 (Extended)",
                "tam2Desc": "TAM-2 (Extended) - adds external influences and results demonstrability",
                "tam3": "TAM-3 (Comprehensive)",
                "tam3Desc": "TAM-3 (Comprehensive) - includes anxiety, playfulness, and objective usability",
                "sart": "SART",
                "sartDesc": "Situation Awareness Rating Technique - measures situational awareness"
            },
            "advanced": {
                "eyeTracking": "Eye Tracking",
                "eyeTrackingDesc": "Track where participants look during the task. Provides heatmaps and gaze patterns to understand visual attention and navigation behavior.",
                "screenRecord": "Screen Recording",
                "screenRecordDesc": "Record the participant's screen activity. Captures clicks, scrolling, and interactions to analyze user behavior and identify pain points.",
                "camera": "Camera Recording",
                "cameraDesc": "Record participant's facial expressions and reactions. Captures emotions, confusion, and satisfaction to understand user experience beyond interactions.",
                "audioRecord": "Audio Recording",
                "audioRecordDesc": "Record participant's verbal feedback and comments. Captures think-aloud protocols, frustrations, and insights that reveal thought processes.",
                "privacyNotice": "Privacy Notice",
                "privacyNoticeDesc": "Recording features require explicit consent from participants. Make sure to:",
                "privacyPoint1": "Clearly inform participants about data collection",
                "privacyPoint2": "Obtain proper consent before starting the test",
                "privacyPoint3": "Follow data protection regulations (GDPR, etc.)",
                "privacyPoint4": "Secure storage and handling of recorded data"
            },
            "preview": {
                "taskSummary": "Task Summary",
                "untitledTask": "Untitled Task",
                "noDescription": "No description provided",
                "participantTip": "Participant Tip",
                "taskUrl": "Task URL",
                "answerType": "Answer Type",
                "recordingFeatures": "Recording Features",
                "postTaskQuestion": "Post-Task Question",
                "postTaskForm": "Post-Task Form",
                "externalForm": "External Form",
                "taskReady": "Task Ready!",
                "taskReadyDesc": "Your task is properly configured and ready to be used in your study.",
                "reviewRequired": "Review Required",
                "reviewRequiredDesc": "Please review the previous steps to ensure all required fields are completed."
            },
            "buttons": {
                "prev": "Previous",
                "next": "Next"
            },
            "validation": {
                "fieldRequired": "Field Required",
                "validUrl": "Must be a valid URL starting with http:// or https://",
                "positiveNumber": "Must be a positive number"
            }
        },
        "UserTestAnswerPreview": {
            "noAnswer": {
                "completed": "Task completed! No additional feedback required."
            },
            "textArea": {
                "placeholder": "Participants will provide their feedback here...",
                "submit": "Submit Feedback"
            },
            "postTest": {
                "title": "Post-Task Questions",
                "q1": "1. How would you rate the difficulty of this task?",
                "q2": "2. Any additional comments?",
                "optional": "Optional feedback..."
            },
            "postForm": {
                "notice": "Participants will be redirected to complete an external form after the task.",
                "button": "Open External Form"
            },
            "nasaTlx": {
                "mental": "Mental Demand",
                "physical": "Physical Demand",
                "lowHigh": "Low - High",
                "more": "+ 4 more dimensions"
            },
            "sus": {
                "q1": "1. I think that I would like to use this system frequently.",
                "disagree": "Strongly Disagree",
                "agree": "Strongly Agree",
                "more": "+ 9 more statements"
            },
            "sart": {
                "instability": "Instability of Situation",
                "complexity": "Complexity of Situation",
                "stable": "Very Stable",
                "unstable": "Very Unstable",
                "simple": "Very Simple",
                "complex": "Very Complex",
                "more": "+ 8 more SART dimensions"
            },
            "tam1": {
                "title": "TAM-1: Technology Acceptance Model (Basic)",
                "items": "10 items across 2 dimensions",
                "pu": "Perceived Usefulness (5 items)",
                "q1": "1. Using the system improves my job performance.",
                "peu": "Perceived Ease of Use (5 items)",
                "q6": "6. The system is easy to use."
            },
            "tam2": {
                "title": "TAM-2: Technology Acceptance Model (Extended)",
                "items": "25 items across 7 dimensions",
                "dimensions": {
                    "pu": "Perceived Usefulness",
                    "peu": "Perceived Ease of Use",
                    "sn": "Subjective Norm",
                    "image": "Image",
                    "jr": "Job Relevance",
                    "oq": "Output Quality",
                    "rd": "Result Demonstrability"
                },
                "note": "Participants rate 25 statements on a 5-point Likert scale (Strongly Disagree - Strongly Agree)"
            },
            "tam3": {
                "title": "TAM-3: Technology Acceptance Model (Comprehensive)",
                "items": "39 items across 13 dimensions",
                "dimensions": {
                    "pu": "Perceived Usefulness",
                    "peu": "Perceived Ease of Use",
                    "sn": "Subjective Norm",
                    "image": "Image",
                    "jr": "Job Relevance",
                    "oq": "Output Quality",
                    "rd": "Result Demonstrability",
                    "ce": "Computer Self-Efficacy",
                    "ec": "External Control",
                    "anx": "Anxiety",
                    "play": "Playfulness",
                    "enj": "Enjoyment",
                    "ou": "Objective Usability"
                },
                "note": "Comprehensive assessment with 39 statements across 13 dimensions on a 5-point Likert scale"
            },
            "default": {
                "selectType": "Select an answer type to see preview"
            }
        }
    },
    'hi': {
        "UserTestTaskDialog": {
            "titles": {
                "createTask": "नया कार्य बनाएं",
                "configureStepByStep": "अपने कार्य को चरण दर चरण कॉन्फ़िगर करें"
            },
            "steps": {
                "basicInfo": "बेसिक जानकारी",
                "configuration": "कॉन्फ़िगरेशन",
                "advanced": "उन्नत विकल्प",
                "preview": "पूर्वावलोकन",
                "step1Title": "चरण 1: कार्य की बुनियादी जानकारी",
                "step1Desc": "निर्धारित करें कि प्रतिभागी इस कार्य में क्या करेंगे। यह आपके उपयोगकर्ता परीक्षण की नींव है - लक्ष्यों और अपेक्षाओं के बारे में स्पष्ट और विशिष्ट रहें।",
                "step2Title": "चरण 2: कार्य कॉन्फ़िगरेशन",
                "step2Desc": "कॉन्फ़िगर करें कि कार्य कहाँ होता है और प्रतिभागी अपनी प्रतिक्रियाएँ कैसे देंगे। यह उपयोगकर्ता अनुभव और डेटा संग्रह पद्धति निर्धारित करता है।",
                "step3Title": "चरण 3: उन्नत विकल्प",
                "step3Desc": "गहरी अंतर्दृष्टि प्राप्त करने के लिए अतिरिक्त डेटा संग्रह विधियों को सक्षम करें। सभी विकल्प वैकल्पिक हैं लेकिन मूल्यवान व्यवहार डेटा और उपयोगकर्ता प्रतिक्रिया प्रदान कर सकते हैं।",
                "step4Title": "चरण 4: पूर्वावलोकन"
            },
            "fields": {
                "taskTitle": "कार्य का शीर्षक",
                "taskTitleHint": "अपने कार्य को एक स्पष्ट, संक्षिप्त नाम दें जो प्रतिभागी द्वारा किए जाने वाले कार्य का वर्णन करता हो",
                "taskTitlePlaceholder": "उदा., 'उत्पाद जानकारी खोजें', 'चेकआउट प्रक्रिया पूरी करें'",
                "taskDescription": "कार्य विवरण",
                "taskDescriptionHint": "प्रतिभागियों के लिए विस्तृत निर्देश प्रदान करें। लक्ष्य, संदर्भ और उनके द्वारा पालन किए जाने वाले किसी भी विशिष्ट चरण को शामिल करें।",
                "taskDescriptionPlaceholder": "कार्य का विस्तार से वर्णन करें। प्रतिभागी को क्या करना चाहिए?",
                "taskTip": "टिप",
                "taskTipHint": "कार्य के दौरान प्रतिभागियों की सहायता के लिए वैकल्पिक मार्गदर्शन या संकेत",
                "taskTipPlaceholder": "उदा., 'मुख्य नेविगेशन पर ध्यान केंद्रित करें', 'नेविगे़ट करने के लिए अपना समय लें'",
                "taskLink": "कार्य लिंक (URL)",
                "taskLinkHint": "वह वेबसाइट या एप्लिकेशन URL जहां प्रतिभागी कार्य करेंगे",
                "taskLinkPlaceholder": "https://example.com",
                "estimatedTime": "अनुमानित समय (मिनट)",
                "estimatedTimeHint": "इस कार्य को पूरा करने के लिए प्रतिभागियों को आवश्यक अनुमानित समय",
                "estimatedTimePlaceholder": "उदा. 10",
                "answerType": "उत्तर प्रकार",
                "answerTypeHint": "चुनें कि प्रतिभागी कार्य पूरा करने के बाद प्रतिक्रिया कैसे देंगे",
                "postTestQuestion": "पोस्ट-टेस्ट प्रश्न",
                "postTestQuestionHint": "वह विशिष्ट प्रश्न दर्ज करें जो आप प्रतिभागियों से कार्य पूरा करने के बाद पूछना चाहते हैं",
                "postTestQuestionPlaceholder": "उदा., 'उत्पाद जानकारी खोजना कितना आसान था?'",
                "postFormUrl": "पोस्ट-टास्क फॉर्म URL",
                "postFormUrlHint": "एक बाहरी फॉर्म का URL जिसे प्रतिभागी कार्य पूरा करने के बाद भरेंगे",
                "postFormUrlPlaceholder": "https://forms.google.com/d/your-form-id"
            },
            "answerTypes": {
                "noAnswer": "किसी उत्तर की आवश्यकता नहीं",
                "noAnswerDesc": "प्रतिभागी प्रतिक्रिया दिए बिना कार्य पूरा करते हैं",
                "textArea": "टेक्स्ट क्षेत्र",
                "textAreaDesc": "प्रतिभागी कार्य के बाद लिखित प्रतिक्रिया प्रदान करते हैं",
                "postTest": "पोस्ट-टेस्ट प्रश्न",
                "postTestDesc": "प्रतिभागी कार्य के बाद विशिष्ट प्रश्नों के उत्तर देते हैं",
                "postForm": "बाहरी फॉर्म",
                "postFormDesc": "प्रतिभागी कार्य के बाद एक बाहरी फॉर्म भरते हैं",
                "nasaTlx": "NASA-TLX",
                "nasaTlxDesc": "NASA कार्य भार सूचकांक - कार्यभार मापता है",
                "sus": "सिस्टम उपयोगिता पैमाना",
                "susDesc": "सिस्टम उपयोगिता पैमाना - उपयोगिता मापता है",
                "tam1": "TAM-1 (बेसिक)",
                "tam1Desc": "TAM-1 (बेसिक स्वीकृति) - कथित उपयोगिता और उपयोग में आसानी को मापता है",
                "tam2": "TAM-2 (विस्तारित)",
                "tam2Desc": "TAM-2 (विस्तारित) - बाहरी प्रभावों और परिणामों की प्रदर्शन क्षमता को जोड़ता है",
                "tam3": "TAM-3 (व्यापक)",
                "tam3Desc": "TAM-3 (व्यापक) - चिंता, चंचलता और वस्तुनिष्ठ उपयोगिता शामिल है",
                "sart": "SART",
                "sartDesc": "स्थिति जागरूकता रेटिंग तकनीक - स्थितिजन्य जागरूकता मापता है"
            },
            "advanced": {
                "eyeTracking": "आई ट्रैकिंग",
                "eyeTrackingDesc": "ट्रैक करें कि प्रतिभागी कार्य के दौरान कहाँ देखते हैं। दृश्य ध्यान और नेविगेशन व्यवहार को समझने के लिए हीटमैप और गेज़ पैटर्न प्रदान करता है।",
                "screenRecord": "स्क्रीन रिकॉर्डिंग",
                "screenRecordDesc": "प्रतिभागी की स्क्रीन गतिविधि रिकॉर्ड करें। उपयोगकर्ता व्यवहार का विश्लेषण करने और दर्द बिंदुओं की पहचान करने के लिए क्लिक, स्क्रॉलिंग और इंटरैक्शन कैप्चर करता है।",
                "camera": "कैमरा रिकॉर्डिंग",
                "cameraDesc": "प्रतिभागी के चेहरे के भावों और प्रतिक्रियाओं को रिकॉर्ड करें। बातचीत से परे उपयोगकर्ता अनुभव को समझने के लिए भावनाओं, भ्रम और संतुष्टि को कैप्चर करता है।",
                "audioRecord": "ऑडियो रिकॉर्डिंग",
                "audioRecordDesc": "प्रतिभागी की मौखिक प्रतिक्रिया और टिप्पणियाँ रिकॉर्ड करें। थिंक-अलाउड प्रोटोकॉल, हताशा और अंतर्दृष्टि प्राप्त करता है जो विचार प्रक्रियाओं को प्रकट करते हैं।",
                "privacyNotice": "गोपनीयता सूचना",
                "privacyNoticeDesc": "रिकॉर्डिंग सुविधाओं के लिए प्रतिभागियों से स्पष्ट सहमति की आवश्यकता होती है। सुनिश्चित करें कि:",
                "privacyPoint1": "प्रतिभागियों को डेटा संग्रह के बारे में स्पष्ट रूप से सूचित करें",
                "privacyPoint2": "परीक्षण शुरू करने से पहले उचित सहमति प्राप्त करें",
                "privacyPoint3": "डेटा सुरक्षा नियमों (GDPR, आदि) का पालन करें",
                "privacyPoint4": "रिकॉर्ड किए गए डेटा का सुरक्षित भंडारण और प्रबंधन"
            },
            "preview": {
                "taskSummary": "कार्य सारांश",
                "untitledTask": "बिना शीर्षक वाला कार्य",
                "noDescription": "कोई विवरण प्रदान नहीं किया गया",
                "participantTip": "प्रतिभागी टिप",
                "taskUrl": "कार्य URL",
                "answerType": "उत्तर प्रकार",
                "recordingFeatures": "रिकॉर्डिंग सुविधाएँ",
                "postTaskQuestion": "पोस्ट-टास्क प्रश्न",
                "postTaskForm": "पोस्ट-टास्क फॉर्म",
                "externalForm": "बाहरी फॉर्म",
                "taskReady": "कार्य तैयार है!",
                "taskReadyDesc": "आपका कार्य ठीक से कॉन्फ़िगर किया गया है और आपके अध्ययन में उपयोग किए जाने के लिए तैयार है।",
                "reviewRequired": "समीक्षा आवश्यक",
                "reviewRequiredDesc": "कृपया यह सुनिश्चित करने के लिए पिछले चरणों की समीक्षा करें कि सभी आवश्यक फ़ील्ड पूरे हो गए हैं।"
            },
            "buttons": {
                "prev": "पिछला",
                "next": "अगला"
            },
            "validation": {
                "fieldRequired": "फ़ील्ड आवश्यक है",
                "validUrl": "http:// या https:// से शुरू होने वाला एक मान्य URL होना चाहिए",
                "positiveNumber": "एक सकारात्मक संख्या होनी चाहिए"
            }
        },
        "UserTestAnswerPreview": {
            "noAnswer": {
                "completed": "कार्य पूरा हुआ! किसी अतिरिक्त प्रतिक्रिया की आवश्यकता नहीं है।"
            },
            "textArea": {
                "placeholder": "प्रतिभागी अपनी प्रतिक्रिया यहाँ प्रदान करेंगे...",
                "submit": "प्रतिक्रिया जमा करें"
            },
            "postTest": {
                "title": "पोस्ट-टास्क प्रश्न",
                "q1": "1. आप इस कार्य की कठिनाई को कैसे रेट करेंगे?",
                "q2": "2. कोई अतिरिक्त टिप्पणी?",
                "optional": "वैकल्पिक प्रतिक्रिया..."
            },
            "postForm": {
                "notice": "प्रतिभागियों को कार्य पूरा करने के बाद एक बाहरी फॉर्म पूरा करने के लिए निर्देशित किया जाएगा।",
                "button": "बाहरी फॉर्म खोलें"
            },
            "nasaTlx": {
                "mental": "मानसिक माँग",
                "physical": "शारीरिक माँग",
                "lowHigh": "कम - अधिक",
                "more": "+ 4 और आयाम"
            },
            "sus": {
                "q1": "1. मुझे लगता है कि मैं इस प्रणाली का बार-बार उपयोग करना चाहूँगा।",
                "disagree": "कड़ाई से असहमत",
                "agree": "कड़ाई से सहमत",
                "more": "+ 9 और कथन"
            },
            "sart": {
                "instability": "स्थिति की अस्थिरता",
                "complexity": "स्थिति की जटिलता",
                "stable": "बहुत स्थिर",
                "unstable": "बहुत अस्थिर",
                "simple": "बहुत सरल",
                "complex": "बहुत जटिल",
                "more": "+ 8 और SART आयाम"
            },
            "tam1": {
                "title": "TAM-1: प्रौद्योगिकी स्वीकृति मॉडल (बुनियादी)",
                "items": "2 आयामों में 10 आइटम",
                "pu": "कथित उपयोगिता (5 आइटम)",
                "q1": "1. प्रणाली का उपयोग करने से मेरे कार्य प्रदर्शन में सुधार होता है।",
                "peu": "उपयोग में कथित आसानी (5 आइटम)",
                "q6": "6. प्रणाली का उपयोग करना आसान है।"
            },
            "tam2": {
                "title": "TAM-2: प्रौद्योगिकी स्वीकृति मॉडल (विस्तारित)",
                "items": "7 आयामों में 25 आइटम",
                "dimensions": {
                    "pu": "कथित उपयोगिता",
                    "peu": "उपयोग में कथित आसानी",
                    "sn": "व्यक्तिगत मानक",
                    "image": "छवि",
                    "jr": "कार्य प्रासंगिकता",
                    "oq": "आउटपुट गुणवत्ता",
                    "rd": "परिणाम प्रदर्शन क्षमता"
                },
                "note": "प्रतिभागी 5-पॉइंट लिकर्ट स्केल (कड़ाई से असहमत - कड़ाई से सहमत) पर 25 कथनों को रेट करते हैं"
            },
            "tam3": {
                "title": "TAM-3: प्रौद्योगिकी स्वीकृति मॉडल (व्यापक)",
                "items": "13 आयामों में 39 आइटम",
                "dimensions": {
                    "pu": "कथित उपयोगिता",
                    "peu": "उपयोग में कथित आसानी",
                    "sn": "व्यक्तिगत मानक",
                    "image": "छवि",
                    "jr": "कार्य प्रासंगिकता",
                    "oq": "आउटपुट गुणवत्ता",
                    "rd": "परिणाम प्रदर्शन क्षमता",
                    "ce": "कंप्यूटर आत्म-प्रभावकारिता",
                    "ec": "बाहरी नियंत्रण",
                    "anx": "चिंता",
                    "play": "चंचलता",
                    "enj": "आनंद",
                    "ou": "वस्तुनिष्ठ उपयोगिता"
                },
                "note": "5-पॉइंट लिकर्ट स्केल पर 13 आयामों में 39 कथनों के साथ व्यापक मूल्यांकन"
            },
            "default": {
                "selectType": "पूर्वावलोकन देखने के लिए एक उत्तर प्रकार चुनें"
            }
        }
    },
    'es': {
        "UserTestTaskDialog": {
            "titles": {
                "createTask": "Crear Nueva Tarea",
                "configureStepByStep": "Configure su tarea paso a paso"
            },
            "steps": {
                "basicInfo": "Información Básica",
                "configuration": "Configuración",
                "advanced": "Opciones Avanzadas",
                "preview": "Vista Previa",
                "step1Title": "Paso 1: Información Básica de la Tarea",
                "step1Desc": "Defina qué harán los participantes en esta tarea. Esta es la base de su prueba de usuario: sea claro y específico sobre los objetivos y expectativas.",
                "step2Title": "Paso 2: Configuración de la Tarea",
                "step2Desc": "Configure dónde se lleva a cabo la tarea y cómo los participantes proporcionarán sus respuestas. Esto determina la experiencia del usuario y el método de recolección de datos.",
                "step3Title": "Paso 3: Opciones Avanzadas",
                "step3Desc": "Habilite métodos adicionales de recolección de datos para obtener información más profunda. Todas las opciones son opcionales pero pueden proporcionar datos de comportamiento valiosos y comentarios de los usuarios.",
                "step4Title": "Paso 4: Vista Previa"
            },
            "fields": {
                "taskTitle": "Título de la tarea",
                "taskTitleHint": "Dé a su tarea un nombre claro y conciso que describa lo que los participantes deben lograr",
                "taskTitlePlaceholder": "p. ej., 'Buscar información del producto', 'Completar proceso de pago'",
                "taskDescription": "Descripción de la Tarea",
                "taskDescriptionHint": "Proporcione instrucciones detalladas para los participantes. Incluya el objetivo, el contexto y cualquier paso específico que deban seguir.",
                "taskDescriptionPlaceholder": "Describa la tarea en detalle. ¿Qué debe hacer el participante?",
                "taskTip": "Consejo",
                "taskTipHint": "Guía opcional o sugerencias para ayudar a los participantes durante la tarea",
                "taskTipPlaceholder": "p. ej., 'Concéntrese en la navegación principal', 'Tómese su tiempo para explorar'",
                "taskLink": "Enlace de la Tarea (URL)",
                "taskLinkHint": "La URL del sitio web o aplicación donde los participantes realizarán la tarea",
                "taskLinkPlaceholder": "https://ejemplo.com",
                "estimatedTime": "Tiempo Estimado (minutos)",
                "estimatedTimeHint": "El tiempo estimado que los participantes necesitarán para completar esta tarea",
                "estimatedTimePlaceholder": "p. ej. 10",
                "answerType": "Tipo de Respuesta",
                "answerTypeHint": "Elija cómo los participantes proporcionarán sus comentarios después de completar la tarea",
                "postTestQuestion": "Pregunta Post-Prueba",
                "postTestQuestionHint": "Ingrese la pregunta específica que desea hacer a los participantes después de que completen la tarea",
                "postTestQuestionPlaceholder": "p. ej., '¿Qué tan fácil fue encontrar la información del producto?'",
                "postFormUrl": "URL del Formulario Post-Tarea",
                "postFormUrlHint": "URL a un formulario externo que los participantes completarán después de realizar la tarea",
                "postFormUrlPlaceholder": "https://forms.google.com/d/id-de-tu-formulario"
            },
            "answerTypes": {
                "noAnswer": "No se Requiere Respuesta",
                "noAnswerDesc": "Los participantes completan la tarea sin proporcionar comentarios",
                "textArea": "Área de Texto",
                "textAreaDesc": "Los participantes proporcionan comentarios escritos después de la tarea",
                "postTest": "Preguntas Post-Prueba",
                "postTestDesc": "Los participantes responden preguntas específicas después de la tarea",
                "postForm": "Formulario Externo",
                "postFormDesc": "Los participantes completan un formulario externo después de la tarea",
                "nasaTlx": "NASA-TLX",
                "nasaTlxDesc": "NASA Task Load Index - mide la carga de trabajo",
                "sus": "Escala de Usabilidad del Sistema (SUS)",
                "susDesc": "System Usability Scale - mide la usabilidad",
                "tam1": "TAM-1 (Básico)",
                "tam1Desc": "TAM-1 (Aceptación Básica) - mide la utilidad percibida y la facilidad de uso",
                "tam2": "TAM-2 (Extendido)",
                "tam2Desc": "TAM-2 (Extendido) - añade influencias externas y demostrabilidad de resultados",
                "tam3": "TAM-3 (Completo)",
                "tam3Desc": "TAM-3 (Completo) - incluye ansiedad, alegría y usabilidad objetiva",
                "sart": "SART",
                "sartDesc": "Situation Awareness Rating Technique - mide la conciencia situacional"
            },
            "advanced": {
                "eyeTracking": "Seguimiento Ocular",
                "eyeTrackingDesc": "Rastrea dónde miran los participantes durante la tarea. Proporciona mapas de calor y patrones de mirada para entender la atención visual y el comportamiento de navegación.",
                "screenRecord": "Grabación de Pantalla",
                "screenRecordDesc": "Graba la actividad de la pantalla del participante. Captura clics, desplazamiento e interacciones para analizar el comportamiento del usuario e identificar puntos de fricción.",
                "camera": "Grabación de Cámara",
                "cameraDesc": "Graba las expresiones faciales y reacciones del participante. Captura emociones, confusión y satisfacción para entender la experiencia del usuario más allá de las interacciones.",
                "audioRecord": "Grabación de Audio",
                "audioRecordDesc": "Graba los comentarios y la retroalimentación verbal del participante. Captura protocolos de pensamiento en voz alta, frustraciones e ideas que revelan procesos de pensamiento.",
                "privacyNotice": "Aviso de Privacidad",
                "privacyNoticeDesc": "Las funciones de grabación requieren el consentimiento explícito de los participantes. Asegúrese de:",
                "privacyPoint1": "Informar claramente a los participantes sobre la recolección de datos",
                "privacyPoint2": "Obtener el consentimiento adecuado antes de comenzar la prueba",
                "privacyPoint3": "Seguir las regulaciones de protección de datos (GDPR, etc.)",
                "privacyPoint4": "Almacenamiento y manejo seguro de los datos grabados"
            },
            "preview": {
                "taskSummary": "Resumen de la Tarea",
                "untitledTask": "Tarea sin Título",
                "noDescription": "No se proporcionó descripción",
                "participantTip": "Consejo para el Participante",
                "taskUrl": "URL de la Tarea",
                "answerType": "Tipo de Respuesta",
                "recordingFeatures": "Funciones de Grabación",
                "postTaskQuestion": "Pregunta Post-Tarea",
                "postTaskForm": "Formulario Post-Tarea",
                "externalForm": "Formulario Externo",
                "taskReady": "¡Tarea Lista!",
                "taskReadyDesc": "Su tarea está configurada correctamente y lista para ser utilizada en su estudio.",
                "reviewRequired": "Revisión Requerida",
                "reviewRequiredDesc": "Revise los pasos anteriores para asegurarse de que todos los campos obligatorios estén completos."
            },
            "buttons": {
                "prev": "Anterior",
                "next": "Siguiente"
            },
            "validation": {
                "fieldRequired": "Campo Obligatorio",
                "validUrl": "Debe ser una URL válida que comience con http:// o https://",
                "positiveNumber": "Debe ser un número positivo"
            }
        },
        "UserTestAnswerPreview": {
            "noAnswer": {
                "completed": "¡Tarea completada! No se requiere retroalimentación adicional."
            },
            "textArea": {
                "placeholder": "Los participantes proporcionarán su retroalimentación aquí...",
                "submit": "Enviar Retroalimentación"
            },
            "postTest": {
                "title": "Preguntas Post-Tarea",
                "q1": "1. ¿Cómo calificaría la dificultad de esta tarea?",
                "q2": "2. ¿Algún comentario adicional?",
                "optional": "Retroalimentación opcional..."
            },
            "postForm": {
                "notice": "Los participantes serán redirigidos para completar un formulario externo después de la tarea.",
                "button": "Abrir Formulario Externo"
            },
            "nasaTlx": {
                "mental": "Demanda Mental",
                "physical": "Demanda Física",
                "lowHigh": "Baja - Alta",
                "more": "+ 4 dimensiones más"
            },
            "sus": {
                "q1": "1. Creo que me gustaría usar este sistema con frecuencia.",
                "disagree": "Muy en desacuerdo",
                "agree": "Muy de acuerdo",
                "more": "+ 9 declaraciones más"
            },
            "sart": {
                "instability": "Inestabilidad de la Situación",
                "complexity": "Complejidad de la Situación",
                "stable": "Muy Estable",
                "unstable": "Muy Inestable",
                "simple": "Muy Simple",
                "complex": "Muy Compleja",
                "more": "+ 8 dimensiones SART más"
            },
            "tam1": {
                "title": "TAM-1: Modelo de Aceptación de Tecnología (Básico)",
                "items": "10 elementos en 2 dimensiones",
                "pu": "Utilidad Percibida (5 elementos)",
                "q1": "1. El uso del sistema mejora mi desempeño laboral.",
                "peu": "Facilidad de Uso Percibida (5 elementos)",
                "q6": "6. El sistema es fácil de usar."
            },
            "tam2": {
                "title": "TAM-2: Modelo de Aceptación de Tecnología (Extendido)",
                "items": "25 elementos en 7 dimensiones",
                "dimensions": {
                    "pu": "Utilidad Percibida",
                    "peu": "Facilidad de Uso Percibida",
                    "sn": "Norma Subjetiva",
                    "image": "Imagen",
                    "jr": "Relevancia del Trabajo",
                    "oq": "Calidad del Resultado",
                    "rd": "Demostrabilidad de Resultados"
                },
                "note": "Los participantes califican 25 declaraciones en una escala Likert de 5 puntos (Muy en desacuerdo - Muy de acuerdo)"
            },
            "tam3": {
                "title": "TAM-3: Modelo de Aceptación de Tecnología (Integral)",
                "items": "39 elementos en 13 dimensiones",
                "dimensions": {
                    "pu": "Utilidad Percibida",
                    "peu": "Facilidad de Uso Percibida",
                    "sn": "Norma Subjetiva",
                    "image": "Imagen",
                    "jr": "Relevancia del Trabajo",
                    "oq": "Calidad del Resultado",
                    "rd": "Demostrabilidad de Resultados",
                    "ce": "Autoeficacia Computacional",
                    "ec": "Control Externo",
                    "anx": "Ansiedad",
                    "play": "Lúdica",
                    "enj": "Disfrute",
                    "ou": "Usabilidad Objetiva"
                },
                "note": "Evaluación integral con 39 declaraciones en 13 dimensiones en una escala Likert de 5 puntos"
            },
            "default": {
                "selectType": "Seleccione un tipo de respuesta para ver la vista previa"
            }
        }
    }
}

for lang in locales:
    file_path = os.path.join(locales_dir, f'{lang}.json')
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update both sections
    data['UserTestTaskDialog'] = translations_base.get(lang, translations_base['en'])['UserTestTaskDialog']
    data['UserTestAnswerPreview'] = translations_base.get(lang, translations_base['en'])['UserTestAnswerPreview']
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'Updated {lang}.json with TaskDialog and AnswerPreview')
