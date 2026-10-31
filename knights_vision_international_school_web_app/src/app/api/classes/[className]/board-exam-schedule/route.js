import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { existsSync } from "node:fs";

// `next start` also sets NODE_ENV=production on a local Windows machine.
// Only serverless deployment needs the @sparticuz Chromium binary.
const isServerlessRuntime = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);
const puppeteer = isServerlessRuntime ? require('puppeteer-core') : require('puppeteer');
const chromium = isServerlessRuntime ? require('@sparticuz/chromium') : null;

const resolveDevelopmentBrowser = () => {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  return candidates.find((browserPath) => existsSync(browserPath));
};

// Define ClassName enum values (matching the Prisma schema)
const validClassNames = [
  'LKG', 'UKG', 'I', 'II', 'III', 'IV', 
  'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const wbSeriesSubjectNames = new Set([
  'english',
  'bengali',
  'mathematics',
  'physical science',
  'life science',
  'history',
  'geography',
]);

// Helper function to format date as DD-MM-YYYY
const formatDate = (date) => {
  if (!date || isNaN(new Date(date))) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export async function GET(request, { params }) {
  const { className } = await params;
  console.log(`Received request for className: ${className}`);

  try {
    const { searchParams } = new URL(request.url);
    const academicYear = parseInt(searchParams.get('academicYear'), 10);
    const month = parseInt(searchParams.get('month'), 10);
    let branchId = parseInt(searchParams.get('branchId'), 10);

    // Default branchId to 1 if missing or invalid
    if (!branchId || isNaN(branchId)) {
      console.log(`branchId is missing or invalid, defaulting to 1`);
      branchId = 1;
    }

    console.log(`Parameters: academicYear=${academicYear}, month=${month}, branchId=${branchId}`);

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      console.log(`Validation failed: Invalid class name '${className}'`);
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Validate academicYear and month
    if (!academicYear || isNaN(academicYear)) {
      console.log(`Validation failed: Invalid academic year '${academicYear}'`);
      return NextResponse.json({ error: 'Invalid academic year' }, { status: 400 });
    }
    if (!month || isNaN(month) || month < 1 || month > 12) {
      console.log(`Validation failed: Invalid month '${month}'`);
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }

    // Get class record to fetch its id
    console.log(`Querying schoolClass for className: ${className.toUpperCase()}, branchId: ${branchId}, academicYear: ${academicYear}`);
    const schoolClass = await prisma.schoolClass.findFirst({
      where: {
        name: className.toUpperCase(),
        branchId,
        academicYear
      },
      select: { id: true },
    });

    if (!schoolClass) {
      console.log(`Class not found for className: ${className.toUpperCase()}, branchId: ${branchId}, academicYear: ${academicYear}`);
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    console.log(`Found schoolClass with id: ${schoolClass.id}`);

    // Subjects for this class
    console.log(`Querying subjects for classId: ${schoolClass.id}`);
    const allSubjects = await prisma.classSubject.findMany({
      where: { classId: schoolClass.id },
      include: { subject: { select: { name: true } } },
    });
    const subjects = allSubjects.filter((classSubject) =>
      wbSeriesSubjectNames.has(classSubject.subject.name.trim().toLowerCase()),
    );
    console.log(`Found ${subjects.length} subjects`);

    // Board exams for this class in the specified month
    console.log(`Querying board exams for subjects: ${subjects.map(s => s.id).join(', ')}, academicYear: ${academicYear}, month: ${month}`);
    // XS is the January-February continuation of the same academic session.
    const calendarYear = className.toUpperCase() === 'XS' && month <= 2
      ? academicYear + 1
      : academicYear;
    const startDate = new Date(Date.UTC(calendarYear, month - 1, 1));
    const endDate = new Date(Date.UTC(calendarYear, month, 1));

    const boardExams = await prisma.boardExam.findMany({
      where: {
        classSubjectId: { in: subjects.map((s) => s.id) },
        academicYear,
        examDate: { gte: startDate, lt: endDate },
      },
      include: {
        classSubject: {
          include: {
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: {
        examDate: 'asc' // Sort exams by date ascending
      },
    });
    console.log(`Found ${boardExams.length} board exams`);

    // Group exams by subject while preserving date order
    const groupedExams = boardExams.reduce((acc, exam) => {
      const subjectName = exam.classSubject.subject.name;
      if (!acc[subjectName]) acc[subjectName] = [];
      acc[subjectName].push(exam);
      return acc;
    }, {});
    console.log(`Grouped exams by subject: ${Object.keys(groupedExams).join(', ')}`);

    // Launch Puppeteer with environment-specific configuration
    console.log('Launching Puppeteer browser');
    const executablePath = isServerlessRuntime
      ? await chromium.executablePath()
      : resolveDevelopmentBrowser();
    if (!executablePath) {
      throw new Error('No local Chrome or Edge executable was found for schedule PDF generation.');
    }
    console.log(`Using executablePath: ${executablePath || 'default (puppeteer bundled Chromium)'}`);
    
    const browser = await puppeteer.launch({
      args: isServerlessRuntime ? chromium.args : [],
      defaultViewport: isServerlessRuntime ? chromium.defaultViewport : null,
      executablePath,
      headless: isServerlessRuntime ? chromium.headless : true,
    }).catch(err => {
      console.error('Failed to launch Puppeteer browser:', err);
      throw new Error(`Puppeteer launch failed: ${err.message}. Please ensure Chromium is correctly installed or configured. See https://pptr.dev/troubleshooting`);
    });
    console.log('Browser launched, creating new page');
    const page = await browser.newPage();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://future.sspointschool.in";
    console.log(`Using base URL: ${baseUrl}`);

    const monthName = monthNames[month - 1];
    console.log(`Generating PDF for month: ${monthName}`);

    // HTML content with updated styles
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@100..900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Nirmala UI', 'Noto Sans Bengali', sans-serif; margin: 10px; color: #000; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; }
            .logo-left { position: absolute; top: 65px; left: 20px; width: 90px; }
            .logo-right { position: absolute; top: 65px; right: 20px; width: 90px; }
            .school-name { font-size: 54px; color: #003087; font-weight: bold; }
            .motto { font-size: 14px; font-weight: bold; color: #333; }
            .report-title { font-size: 16px; font-weight: bold; margin-top: 10px; }
            .class-year { font-size: 14px; margin-top: 5px; }
            .divider { border-bottom: 2px solid #6a1b9a; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #7b1fa2; padding: 8px; text-align: left; font-size: 10px; }
            th { background-color: #6a1b9a; color: #fff; font-weight: bold; }
            tr:nth-child(even) { background-color: #f3e5f5; }
            .subject-cell { font-weight: bold; color: #6a1b9a; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${baseUrl}/knights.png" class="logo-left" alt="Sure Success Point School logo">
            <img src="${baseUrl}/knights.png" class="logo-right" alt="Sure Success Point School logo">
            <div class="header">
              <div class="school-name">Sure Success Point School</div>
              <div class="motto">Institution of Humanism, Hardwork, Discipline, Technology & Excellence</div>
              <div class="motto">www.sspointschool.in | Powered by Knights (KiREAD) Group</div>
              <div class="report-title">KWBBPTS BOARD EXAM SCHEDULE</div>
              <div class="class-year">Class: ${className.toUpperCase()} | Academic Year: ${academicYear} | Month: ${monthName} | Regd No.: S/1L 60976 | UDISE: 19060419693</div>
            </div>
            <div class="divider"></div>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Total Marks</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  // Flatten exams with subject info, keeping date order
                  const sortedExams = boardExams.map(exam => ({
                    subject: exam.classSubject.subject.name,
                    exam,
                    index: boardExams.indexOf(exam) + 1 // For numbering
                  }));
                  
                  // Group by subject to track rowspan
                  const subjectRowSpans = {};
                  sortedExams.forEach(({ subject }) => {
                    subjectRowSpans[subject] = (subjectRowSpans[subject] || 0) + 1;
                  });

                  // Track subjects already displayed to handle rowspan
                  const displayedSubjects = new Set();
                  
                  return sortedExams
                    .map(({ subject, exam, index }, idx) => {
                      const isFirstForSubject = !displayedSubjects.has(subject);
                      if (isFirstForSubject) displayedSubjects.add(subject);
                      return `
                        <tr>
                          ${
                            isFirstForSubject
                              ? `<td rowspan="${subjectRowSpans[subject]}" class="subject-cell">${index}. ${subject}</td>`
                              : ""
                          }
                          <td>${exam.title || "-"}</td>
                          <td>${formatDate(exam.examDate)}</td>
                          <td>${exam.totalMarks || "-"}</td>
                        </tr>
                      `;
                    })
                    .join("");
                })()}
              </tbody>
            </table>
            <div style="position: absolute; bottom: 5px; font-size: 12px;">
              Generated on: ${formatDate(new Date())} | Knights West Bengal Board Preparation Test Series
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Setting HTML content for PDF generation');
    // Set HTML content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    console.log('Generating PDF buffer');
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "4mm", right: "8mm", bottom: "8mm", left: "8mm" },
    });

    console.log('Closing browser');
    await browser.close();

    console.log('Returning PDF response');
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=BoardExamSchedule_${className}_${academicYear}_${monthName}.pdf`,
      },
    });
  } catch (error) {
    console.error(`GET /api/classes/${className}/board-exam-schedule Error:`, error);
    return NextResponse.json(
      { error: 'Failed to generate schedule PDF', detail: error.message },
      { status: 500 }
    );
  } finally {
    console.log('Disconnecting Prisma client');
    await prisma.$disconnect();
  }
}
