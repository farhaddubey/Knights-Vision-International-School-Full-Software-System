import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { books, className, academicYear } = await request.json();

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // HTML content with MUI styles and Nirmala UI/Noto Sans Bengali
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
            .logo-left { position: absolute; top: 80px; left: 20px; width: 90px; }
            .logo-right { position: absolute; top: 80px; right: 20px; width: 90px; }
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
            <img src="http://localhost:3000/knights.png" class="logo-left" alt="Sure Success Point School logo">
            <img src="http://localhost:3000/knights.png" class="logo-right" alt="Sure Success Point School logo">
            <div class="header">
              <div class="school-name">Sure Success Point School</div>
              <div class="motto">Institution of Humanism, Hardwork, Discipline, Technology & Excellence</div>
              <div class="motto">www.sspointschool.in | Powered by Knights (KiREAD) Group</div>
              <div class="report-title">BOOKLIST REPORT</div>
              <div class="class-year">Class: ${className.toUpperCase()} | Academic Year: ${academicYear} | Regd No.: S/1L 60976 | UDISE: 19060419693</div>
            </div>
            <div class="divider"></div>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Book Type</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  const groupedBooks = books.reduce((acc, book) => {
                    if (!acc[book.subjectName]) acc[book.subjectName] = [];
                    acc[book.subjectName].push(book);
                    return acc;
                  }, {});
                  return Object.keys(groupedBooks)
                    .sort()
                    .map((subject, subjIndex) => {
                      const group = groupedBooks[subject];
                      return group
                        .map(
                          (book, bookIndex) => `
                            <tr>
                              ${
                                bookIndex === 0
                                  ? `<td rowspan="${group.length}" class="subject-cell">${subjIndex + 1}. ${subject}</td>`
                                  : ""
                              }
                              <td>${book.title || "-"}</td>
                              <td>${book.author || "-"}</td>
                              <td>${book.bookType || "-"}</td>
                            </tr>
                          `
                        )
                        .join("");
                    })
                    .join("");
                })()}
              </tbody>
            </table>
            <div style="position: absolute; bottom: 5px; font-size: 8px;">
              Generated on: ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `;

    // Set HTML content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "4mm", right: "8mm", bottom: "8mm", left: "8mm" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=AllBooks_${className}_${academicYear}.pdf`,
      },
    });
  } catch (err) {
    console.error("Error generating PDF:", err.message);
    return new NextResponse(JSON.stringify({ error: "Failed to generate PDF" }), { status: 500 });
  }
}
