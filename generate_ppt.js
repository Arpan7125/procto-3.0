const pptxgen = require("pptxgenjs");

let pptx = new pptxgen();

// Slide 1: Title Slide
let slide1 = pptx.addSlide();
slide1.addText("PROCTO: Backend Architecture & Workflow", { x: 1, y: 1, w: '80%', h: 1, fontSize: 36, bold: true, align: 'center', color: '363636' });
slide1.addText("A deep dive into the engine powering our Online Proctoring System\n\n• Designed for scale, security, and real-time assessment monitoring.\n• Built on modern Node.js principles using TypeScript.\n• Integrates advanced Generative AI and comprehensive cloud services.", { x: 1, y: 3, w: '80%', h: 2, fontSize: 18, color: '666666' });

// Slide 2: Tech Stack
let slide2 = pptx.addSlide();
slide2.addText("The Tech Stack", { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 24, bold: true, color: '363636' });
let text2 = [
    { text: "Runtime & Framework: Node.js with Express.js (TypeScript)", options: { bullet: true } },
    { text: "Database Operations: PostgreSQL managed via Prisma ORM for robust typing and relational data integrity.", options: { bullet: true } },
    { text: "Caching & Queueing: Redis paired with BullMQ to manage asynchronous, heavy tasks securely.", options: { bullet: true } },
    { text: "Real-Time Communication: Socket.io for instantaneous proctoring alerts and session management.", options: { bullet: true } },
    { text: "Security Mechanisms: Helmet, CORS, Express Rate Limit, Zod validation, and bcryptjs.", options: { bullet: true } }
];
slide2.addText(text2, { x: 0.5, y: 1.5, w: '90%', h: 4, fontSize: 16, color: '666666' });

// Slide 3: Authentication
let slide3 = pptx.addSlide();
slide3.addText("Secure User Access", { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 24, bold: true, color: '363636' });
let text3 = [
    { text: "Roles Defined: Three dynamic user roles: STUDENT, FACULTY, and ADMIN.", options: { bullet: true } },
    { text: "Primary Authentication: Local Email/Password with Bcrypt hashing alongside OAuth integrations via Passport.js (Google & GitHub).", options: { bullet: true } },
    { text: "Session Security: JSON Web Tokens (JWT) stored securely in HTTP-only cookies, combined with long-lived Refresh Tokens.", options: { bullet: true } },
    { text: "Two-Factor Authentication (2FA): Integrated speakeasy module supports MFA to safeguard faculty and admin accounts.", options: { bullet: true } }
];
slide3.addText(text3, { x: 0.5, y: 1.5, w: '90%', h: 4, fontSize: 16, color: '666666' });

// Slide 4: Course & Exam Creation
let slide4 = pptx.addSlide();
slide4.addText("Structuring Assessments (Faculty View)", { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 24, bold: true, color: '363636' });
let text4 = [
    { text: "Course Management: Faculty create distinct logical groupings (Courses) to enroll students.", options: { bullet: true } },
    { text: "Dynamic Questions: Questions cover diverse formats (Multiple Choice, Code, Essay, Numerical, etc.) and are stored dynamically as JSON structures.", options: { bullet: true } },
    { text: "Exam Rules & Parameters: Configurable properties like shuffleQuestions, maxAttempts, and negativeMarkingFactor dictate exam boundaries.", options: { bullet: true } },
    { text: "States: Exams can be transitioned globally from DRAFT to SCHEDULED to ACTIVE.", options: { bullet: true } }
];
slide4.addText(text4, { x: 0.5, y: 1.5, w: '90%', h: 4, fontSize: 16, color: '666666' });

// Slide 5: Test-Taking Process
let slide5 = pptx.addSlide();
slide5.addText("Real-Time Exam Execution (Student View)", { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 24, bold: true, color: '363636' });
let text5 = [
    { text: "Session Initiation: Students begin an ExamSession locked to their unique ID and IP Address.", options: { bullet: true } },
    { text: "Progress Tracking: Answers stream securely to the backend in real-time and bind to specific question IDs.", options: { bullet: true } },
    { text: "Timer Management: Exam start/end times strictly regulate session activities.", options: { bullet: true } },
    { text: "Result Finalization: Session transitions from PENDING -> ACTIVE -> SUBMITTED.", options: { bullet: true } }
];
slide5.addText(text5, { x: 0.5, y: 1.5, w: '90%', h: 4, fontSize: 16, color: '666666' });

// Slide 6: AI-Powered Live Proctoring
let slide6 = pptx.addSlide();
slide6.addText("Intelligent Cheating Detection", { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 24, bold: true, color: '363636' });
let text6 = [
    { text: "Media Ingestion & Storage: Uploads periodic snapshots dynamically using AWS S3.", options: { bullet: true } },
    { text: "Analyzing Integrity: Passes screenshots and metrics through AWS Rekognition.", options: { bullet: true } },
    { text: "Suspicious Events Tracked: FACE_NOT_DETECTED, MULTIPLE_FACES, LOOKING_AWAY, TAB_SWITCH, SCREEN_EXIT, RIGHT_CLICK, COPY_PASTE.", options: { bullet: true } },
    { text: "Severity Levels: Classifies each event (LOW, MEDIUM, HIGH), allowing faculty to review these flags manually or auto-terminate exams.", options: { bullet: true } }
];
slide6.addText(text6, { x: 0.5, y: 1.5, w: '90%', h: 4, fontSize: 16, color: '666666' });

// Slide 7: Assessment & Reporting
let slide7 = pptx.addSlide();
slide7.addText("Grading & Audit Tracking", { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 24, bold: true, color: '363636' });
let text7 = [
    { text: "Automated Evaluations: Immediate auto-scoring calculation.", options: { bullet: true } },
    { text: "Manual Input: Capability to add manual scores (e.g., Essay questions).", options: { bullet: true } },
    { text: "Comprehensive Results: Converts total scores into percentages and calculates active Percentile & Ranks.", options: { bullet: true } },
    { text: "System Audit Trails: Crucial events modify the AuditLog table permanently to preserve the chain of custody for any data alterations.", options: { bullet: true } }
];
slide7.addText(text7, { x: 0.5, y: 1.5, w: '90%', h: 4, fontSize: 16, color: '666666' });

pptx.writeFile({ fileName: "Procto_Backend_Architecture.pptx" }).then(fileName => {
    console.log(`Presentation generated successfully: \${fileName}`);
});
