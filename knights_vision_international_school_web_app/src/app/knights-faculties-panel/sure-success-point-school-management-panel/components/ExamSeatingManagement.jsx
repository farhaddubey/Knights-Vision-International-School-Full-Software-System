"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box, Typography, Button, List, ListItem, TextField, CircularProgress,
  Pagination, PaginationItem, Stack, Paper, InputAdornment, Alert,
} from "@mui/material";
import { Badge, Print, Refresh, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";

const drawerWidth = 280;
const appBarHeight = 64;
const PAGE_SIZE = 60;
const GREEN = "#00c853";
const DEEP = [6, 77, 59];
const EMERALD = [19, 108, 71];
const safeString = (v, fallback = "N/A") => v === undefined || v === null || String(v).trim() === "" ? fallback : String(v);
const studentName = (s) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || s.name || "Unnamed Student";
const pdfSafe = (value) => String(value || "").replace(/[^a-z0-9_-]/gi, "_");

const loadImageAsBase64 = (url) => new Promise((resolve) => {
  if (!url || typeof window === "undefined") return resolve(null);
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d").drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    } catch (error) {
      console.warn("Unable to convert logo:", error);
      resolve(null);
    }
  };
  image.onerror = () => resolve(null);
  image.src = url;
});

// Student photographs are deliberately private. Unlike the public school
// logo, this request must carry the active faculty token to the scoped photo
// route, then turn the response into a data URL that jsPDF can embed.
const loadStudentPhotoAsDataUrl = async (url, token) => {
  if (!url || !token || typeof window === "undefined") return null;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Photo request failed (${response.status}).`);
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) throw new Error("Photo response was not an image.");
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read the student photo."));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // A missing historic photo must never block every other ID card.
    console.warn("Student photo unavailable for ID card:", error);
    return null;
  }
};

const ExamSeatingManagement = ({ className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPage = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const [page, setPage] = useState(urlPage);
  const [students, setStudents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const classKey = String(className || "").trim().toLowerCase();

  const fetchPage = useCallback(async (pageNumber, query = "", signal) => {
    const token = Cookies.get("faculties_token");
    if (!token) throw new Error("User not authenticated.");
    if (!classKey) throw new Error("Class name is missing.");
    const response = await axios.get(`/api-schools-panel/students/direct/${encodeURIComponent(classKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: pageNumber, pageSize: PAGE_SIZE, searchQuery: query },
      signal,
    });
    if (!Array.isArray(response.data?.students)) throw new Error("Student API did not return a students array.");
    return response.data;
  }, [classKey]);

  useEffect(() => {
    setPage(1);
    setSearchQuery("");
  }, [classKey]);

  useEffect(() => {
    setPage(urlPage);
  }, [urlPage]);

  useEffect(() => {
    if (!classKey) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchPage(page, searchQuery.trim(), controller.signal);
        if (controller.signal.aborted) return;
        setStudents(result.students);
        const count = Number(result.totalStudents ?? result.totalCount ?? result.total ?? result.pagination?.total);
        setTotalStudents(Number.isFinite(count) ? count : result.students.length);
        setTotalPages(Math.max(1, Number(result.totalPages ?? result.pagination?.totalPages) || (Number.isFinite(count) ? Math.ceil(count / PAGE_SIZE) : 1)));
      } catch (err) {
        if (controller.signal.aborted || err.code === "ERR_CANCELED") return;
        console.error("Student fetch failed:", err.response?.data || err);
        setStudents([]);
        setError(err.response?.data?.error || err.response?.data?.message || err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, searchQuery ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [fetchPage, page, searchQuery, classKey]);

  const changePage = (_, nextPage) => {
    setPage(nextPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Download operations fetch all students in 60-record batches, not just the visible page.
  const fetchAllStudents = async () => {
    const first = await fetchPage(1, "");
    const records = [...first.students];
    const knownTotal = Number(first.totalStudents ?? first.totalCount ?? first.total ?? first.pagination?.total);
    const declaredPages = Number(first.totalPages ?? first.pagination?.totalPages);
    let maxPages = Number.isFinite(declaredPages) && declaredPages > 0
      ? Math.ceil(declaredPages)
      : Number.isFinite(knownTotal) && knownTotal >= 0
        ? Math.max(1, Math.ceil(knownTotal / PAGE_SIZE))
        : null;
    let nextPage = 2;
    while (maxPages ? nextPage <= maxPages : records.length > 0 && nextPage <= 1000) {
      const response = await fetchPage(nextPage, "");
      if (!response.students.length) break;
      records.push(...response.students);
      if (!maxPages && response.students.length < PAGE_SIZE) break;
      nextPage++;
    }
    const seen = new Set();
    return records.filter((student) => {
      const key = student.id ?? student.admissionNumber;
      if (key == null) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const runDownload = async (kind, generator) => {
    if (downloading) return;
    setDownloading(kind);
    try {
      const records = await fetchAllStudents();
      if (!records.length) { toast.info("No students found for this class."); return; }
      await generator(records);
      toast.success(`${kind} PDF downloaded for ${records.length} students.`);
    } catch (err) {
      console.error(`${kind} generation failed:`, err.response?.data || err);
      toast.error(err.response?.data?.message || err.message || `Unable to generate ${kind}.`);
    } finally { setDownloading(""); }
  };

  const generateStudentList = async (records) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const groups = new Map();
    records.forEach((s) => {
      const section = safeString(s.class?.section, "Unassigned");
      if (!groups.has(section)) groups.set(section, []);
      groups.get(section).push(s);
    });
    let y = 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Sure Success Point School", 105, y, { align: "center" });
    y += 8;
    doc.setFontSize(11);
    doc.text(`Class ${classKey.toUpperCase()} | Student List | ${academicYear}`, 105, y, { align: "center" });
    y += 10;
    for (const [section, list] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      if (y > 265) { doc.addPage(); y = 16; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Section ${section}`, 12, y);
      y += 7;
      for (const [index, s] of list.entries()) {
        if (y > 280) { doc.addPage(); y = 16; }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const name = doc.splitTextToSize(`${index + 1}. ${studentName(s)}`, 80)[0];
        doc.text(name, 12, y);
        doc.text(`Roll: ${safeString(s.rollNumber)}`, 100, y);
        doc.text(`Adm: ${safeString(s.admissionNumber)}`, 135, y, { maxWidth: 65 });
        y += 6;
      }
      y += 5;
    }
    doc.save(`student_list_${pdfSafe(classKey)}_${academicYear}.pdf`);
  };

  // Retained original seating-chart function (room-wise and combined PDFs removed).
  const generateSeatingChart = async (records) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const logo = await loadImageAsBase64("/knights.png");
    const cardW = 92, cardH = 42, gapX = 5, gapY = 5;
    for (let i = 0; i < records.length; i++) {
      if (i && i % 12 === 0) doc.addPage();
      const index = i % 12;
      const x = 10 + (index % 2) * (cardW + gapX);
      const y = 10 + Math.floor(index / 2) * (cardH + gapY);
      const s = records[i];
      doc.setDrawColor(80);
      doc.rect(x, y, cardW, cardH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Sure Success Point School", x + 3, y + 7, { maxWidth: 64 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("www.suresuccesspoint.com", x + 3, y + 12);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(`Name: ${studentName(s)}`, 62)[0], x + 3, y + 19);
      doc.text(`Class: ${classKey.toUpperCase()}`, x + 3, y + 25);
      doc.text(`Roll: ${safeString(s.rollNumber)}`, x + 3, y + 31);
      doc.setFontSize(8);
      doc.text(`Adm: ${safeString(s.admissionNumber)}`, x + 3, y + 37, { maxWidth: 62 });
      if (logo) doc.addImage(logo, "PNG", x + 68, y + 9, 21, 21);
    }
    doc.save(`seating_chart_${pdfSafe(classKey)}_${academicYear}.pdf`);
  };

  // Portrait CR80-style student ID cards: 54 x 86 mm, 3 columns x 3 rows per A4 sheet.
 



const generateIdCards = async (records) => {
  const token = Cookies.get("faculties_token");

  if (!token) {
    toast.error("User not authenticated.");
    return;
  }

  try {
    // ============================================================
    // 1. FETCH ALL STUDENTS
    // ============================================================

    const data = Array.isArray(records) ? records : await fetchAllStudents();

    if (!Array.isArray(data) || data.length === 0) {
      toast.error("No students found for ID card generation.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // ============================================================
    // 2. STANDARD VERTICAL ID CARD CONFIGURATION
    // ============================================================

    const CARD_W = 54;
    const CARD_H = 86;

    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();

    const COLS = 3;
    const ROWS = 3;
    const PER_PAGE = COLS * ROWS;

    const GAP_X = 7;
    const GAP_Y = 8;

    const START_X =
      (PAGE_W - (COLS * CARD_W + (COLS - 1) * GAP_X)) / 2;

    const START_Y =
      (PAGE_H - (ROWS * CARD_H + (ROWS - 1) * GAP_Y)) / 2;

    // Uniform-inspired institutional colors
    const BLACK = [22, 23, 26];
    const CHARCOAL = [43, 44, 48];
    const RED = [176, 28, 45];
    const WHITE = [255, 255, 255];
    const LIGHT = [247, 248, 250];
    const GRAY = [125, 130, 140];
    const BORDER = [215, 218, 223];

    const year = academicYear || new Date().getFullYear();

    // ============================================================
    // 3. LOAD SCHOOL LOGO ONCE
    // ============================================================

    let logoData = null;

    try {
      logoData = await loadImageAsBase64("/knights.png");
    } catch (error) {
      console.warn("School logo unavailable:", error);
    }

    // Read each unique private profile photo once. Small batches keep PDF
    // preparation responsive for large classes while preserving a card even
    // when one individual legacy record has no photograph.
    const studentPhotos = new Map();
    const PHOTO_BATCH_SIZE = 8;
    for (let start = 0; start < data.length; start += PHOTO_BATCH_SIZE) {
      const batch = data.slice(start, start + PHOTO_BATCH_SIZE);
      await Promise.all(batch.map(async (student) => {
        if (student?.id == null || !student.profileImageUrl) return;
        const photo = await loadStudentPhotoAsDataUrl(student.profileImageUrl, token);
        if (photo) studentPhotos.set(String(student.id), photo);
      }));
    }

    // ============================================================
    // 4. TEXT HELPERS
    // ============================================================

    const fitText = (
      value,
      maxWidth,
      startSize = 7,
      minSize = 4.8
    ) => {
      let text = String(value ?? "N/A").trim() || "N/A";
      let size = startSize;

      doc.setFontSize(size);

      while (
        doc.getTextWidth(text) > maxWidth &&
        size > minSize
      ) {
        size = Math.max(minSize, size - 0.2);
        doc.setFontSize(size);
      }

      if (doc.getTextWidth(text) > maxWidth) {
        while (
          text.length > 1 &&
          doc.getTextWidth(`${text}...`) > maxWidth
        ) {
          text = text.slice(0, -1);
        }

        text += "...";
      }

      return text;
    };

    const drawCenteredText = (
      value,
      centerX,
      baselineY,
      maxWidth,
      startSize = 8,
      minSize = 5
    ) => {
      const text = fitText(
        value,
        maxWidth,
        startSize,
        minSize
      );

      doc.text(text, centerX, baselineY, {
        align: "center",
      });
    };

    const getAdmissionNumber = (student) => {
      const candidates = [
        student.schoolAdmissionNumber,
        student.admissionNo,
        student.admissionNumber,
      ];

      for (const candidate of candidates) {
        const value = String(candidate ?? "").trim();

        if (!value) continue;

        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            value
          );

        const isObjectId = /^[0-9a-f]{24}$/i.test(value);
        const isLongHex = /^[0-9a-f]{20,}$/i.test(value);

        if (isUUID || isObjectId || isLongHex) {
          continue;
        }

        return value;
      }

      return "N/A";
    };

    // ============================================================
    // 5. DRAW A SINGLE STUDENT ID CARD
    // ============================================================

    const drawIDCard = (student, x, y) => {
      const studentName = (
        student.name ||
        student.fullName ||
        [
          student.firstName,
          student.middleName,
          student.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        "STUDENT NAME"
      ).toUpperCase();

      const studentClass =
        student.class?.name ||
        student.className ||
        className ||
        "N/A";

      const section =
        student.class?.section ||
        student.section ||
        "";

      const roll = student.rollNumber ?? "N/A";
      const admission = getAdmissionNumber(student);

      // ----------------------------------------------------------
      // A. WHITE CARD BODY
      // ----------------------------------------------------------

      doc.setFillColor(...WHITE);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.25);

      doc.roundedRect(
        x,
        y,
        CARD_W,
        CARD_H,
        2.5,
        2.5,
        "FD"
      );

      // ----------------------------------------------------------
      // B. 1.4X TALLER BLACK ANGULAR HEADER
      // ----------------------------------------------------------

      const HEADER_H = 26.6;
      const HEADER_SHOULDER = 19.6;
      const HEADER_INSET = 10;

      doc.setFillColor(...BLACK);

      doc.lines(
        [
          [CARD_W, 0],
          [0, HEADER_SHOULDER],
          [
            -HEADER_INSET,
            HEADER_H - HEADER_SHOULDER,
          ],
          [
            -(CARD_W - HEADER_INSET * 2),
            0,
          ],
          [
            -HEADER_INSET,
            -(HEADER_H - HEADER_SHOULDER),
          ],
          [0, -HEADER_SHOULDER],
        ],
        x,
        y,
        [1, 1],
        "F",
        true
      );

      // ----------------------------------------------------------
      // C. 75%-WIDTH CHARCOAL INNER LAYER
      // ----------------------------------------------------------

      const INNER_W = CARD_W * 0.75;
      const INNER_X = x + (CARD_W - INNER_W) / 2;

      doc.setFillColor(...CHARCOAL);

      doc.lines(
        [
          [INNER_W, 0],
          [0, 17.8],
          [-7, 5],
          [-(INNER_W - 14), 0],
          [-7, -5],
          [0, -17.8],
        ],
        INNER_X,
        y,
        [1, 1],
        "F",
        true
      );

      // ----------------------------------------------------------
      // D. CENTERED SCHOOL LOGO
      // ----------------------------------------------------------

      if (logoData) {
        try {
          doc.addImage(
            logoData,
            "PNG",
            x + 22.5,
            y + 2.3,
            9,
            9
          );
        } catch (error) {
          console.warn("Logo rendering failed:", error);
        }
      }

      // ----------------------------------------------------------
      // E. SCHOOL NAME — SINGLE LINE
      // ----------------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);

      drawCenteredText(
        "SURE SUCCESS POINT SCHOOL",
        x + CARD_W / 2,
        y + 17.3,
        CARD_W - 4,
        8.2,
        5.8
      );

      // ----------------------------------------------------------
      // F. CRIMSON ANGULAR ACCENT
      // ----------------------------------------------------------

      doc.setDrawColor(...RED);
      doc.setLineWidth(1.1);

      doc.line(x + 1, y + 24, x + 10, y + 29);
      doc.line(x + 10, y + 29, x + 44, y + 29);
      doc.line(x + 44, y + 29, x + 53, y + 24);

      // ----------------------------------------------------------
      // G. STUDENT PHOTO — 24 × 28 MM
      // ----------------------------------------------------------

      const PHOTO_W = 24;
      const PHOTO_H = 28;

      const PHOTO_X = x + (CARD_W - PHOTO_W) / 2;
      const PHOTO_Y = y + 31;

      doc.setFillColor(...LIGHT);
      doc.setDrawColor(...BLACK);
      doc.setLineWidth(0.55);

      doc.rect(
        PHOTO_X,
        PHOTO_Y,
        PHOTO_W,
        PHOTO_H,
        "FD"
      );

      const photo = studentPhotos.get(String(student.id));
      let photoRendered = false;
      if (photo) {
        try {
          doc.addImage(photo, undefined, PHOTO_X + 0.45, PHOTO_Y + 0.45, PHOTO_W - 0.9, PHOTO_H - 0.9);
          photoRendered = true;
        } catch (error) {
          console.warn("Student photo rendering failed:", error);
        }
      }

      if (!photoRendered) {
        // Neutral photograph placeholder for historic records without a
        // profile photo. It preserves the existing card composition.
        doc.setFillColor(190, 194, 201);
        doc.circle(PHOTO_X + PHOTO_W / 2, PHOTO_Y + 8, 3.8, "F");
        doc.ellipse(PHOTO_X + PHOTO_W / 2, PHOTO_Y + 18.5, 7.2, 4.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.8);
        doc.setTextColor(...GRAY);
        doc.text("STUDENT PHOTO", PHOTO_X + PHOTO_W / 2, PHOTO_Y + 26, { align: "center" });
      }

      // ----------------------------------------------------------
      // H. STUDENT NAME
      // ----------------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLACK);

      drawCenteredText(
        studentName,
        x + CARD_W / 2,
        y + 63,
        CARD_W - 5,
        8.8,
        5.5
      );

      doc.setFillColor(...RED);

      doc.rect(
        x + 20,
        y + 64.5,
        14,
        0.65,
        "F"
      );

      // ----------------------------------------------------------
      // I. THREE-ROW STUDENT DETAILS
      // ----------------------------------------------------------

      const drawCompactDetail = (
        label,
        value,
        baselineY
      ) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...BLACK);

        doc.text(label, x + 5, baselineY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...BLACK);

        const fittedValue = fitText(
          value,
          CARD_W - 24,
          6,
          4.8
        );

        doc.text(
          fittedValue,
          x + 20,
          baselineY
        );
      };

      drawCompactDetail(
        "CLASS",
        `${studentClass}${section ? ` - ${section}` : ""}`,
        y + 69
      );

      drawCompactDetail(
        "ROLL NO.",
        roll,
        y + 73
      );

      drawCompactDetail(
        "ADM NO.",
        admission,
        y + 77
      );

      // ----------------------------------------------------------
      // J. CLEAN BLACK VALIDITY FOOTER
      // ----------------------------------------------------------

      // Crimson accent above footer
      doc.setFillColor(...RED);

      doc.rect(
        x + 3,
        y + 78.2,
        CARD_W - 6,
        1,
        "F"
      );

      // Solid black footer
      doc.setFillColor(...BLACK);

      doc.rect(
        x + 0.4,
        y + 79.8,
        CARD_W - 0.8,
        5.8,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...WHITE);

      doc.text(
        `VALID YEAR: ${year}`,
        x + CARD_W / 2,
        y + 83.8,
        { align: "center" }
      );
    };

    // ============================================================
    // 6. GENERATE ALL CARDS — 9 PER A4 SHEET
    // ============================================================

    data.forEach((student, index) => {
      if (index > 0 && index % PER_PAGE === 0) {
        doc.addPage();
      }

      const position = index % PER_PAGE;

      const row = Math.floor(position / COLS);
      const col = position % COLS;

      const x = START_X + col * (CARD_W + GAP_X);
      const y = START_Y + row * (CARD_H + GAP_Y);

      drawIDCard(student, x, y);
    });

    // ============================================================
    // 7. DOWNLOAD PDF
    // ============================================================

    const safeClassName = String(className || "ALL")
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    doc.save(
      `SSPS_ID_Cards_${safeClassName}_${year}.pdf`
    );

    toast.success(
      `${data.length} student ID cards generated successfully!`
    );
  } catch (error) {
    console.error("ID card generation failed:", error);
    toast.error("Failed to generate student ID cards.");
  }
};







  return (
    <Box sx={{ position: "fixed", width: { xs: "100vw", md: `calc(100vw - ${drawerWidth}px)` }, height: `calc(100vh - ${appBarHeight}px)`, bgcolor: "#212121", color: "#fff", overflow: "auto", p: 2 }}>
      <Paper sx={{ bgcolor: "#181818", p: 2, mb: 2, color: "#fff" }}>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="center">
          <Typography sx={{ fontWeight: 700, mr: "auto" }}>Student Records — {classKey.toUpperCase()}</Typography>
          <TextField size="small" value={searchQuery} onChange={handleSearch} placeholder="Search name or admission no." InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: "#aaa" }} /></InputAdornment> }} sx={{ width: 260, bgcolor: "#333", borderRadius: 1, input: { color: "#fff" } }} />
          <TextField size="small" label="Academic Year" type="number" value={academicYear} onChange={(e) => setAcademicYear(e.target.value === "" ? "" : Number(e.target.value))} inputProps={{ min: 2000, max: 2100 }} sx={{ width: 145, bgcolor: "#333", borderRadius: 1, input: { color: "#fff" }, label: { color: "#bbb" } }} />
          <Button variant="outlined" title="Refresh" onClick={() => { setPage(1); setSearchQuery(""); }} sx={{ color: GREEN, borderColor: GREEN }}><Refresh /></Button>
          <Button variant="contained" startIcon={<Print />} disabled={!!downloading || !Number.isInteger(academicYear)} onClick={() => runDownload("Seating Chart", generateSeatingChart)} sx={{ bgcolor: GREEN, color: "#000", "&:hover": { bgcolor: "#00a548" } }}>Seating Chart</Button>
          <Button variant="contained" startIcon={<Print />} disabled={!!downloading || !Number.isInteger(academicYear)} onClick={() => runDownload("Student List", generateStudentList)} sx={{ bgcolor: GREEN, color: "#000", "&:hover": { bgcolor: "#00a548" } }}>Student List</Button>
          <Button variant="contained" startIcon={downloading === "ID Cards" ? <CircularProgress size={17} /> : <Badge />} disabled={!!downloading || !Number.isInteger(academicYear)} onClick={() => runDownload("ID Cards", generateIdCards)} sx={{ bgcolor: "#087b63", color: "#fff", "&:hover": { bgcolor: "#065d4b" } }}>Download ID Cards</Button>
        </Stack>
        {downloading && <Typography sx={{ mt: 1, fontSize: 12, color: "#aaa" }}>Preparing {downloading} for all students in batches of {PAGE_SIZE}...</Typography>}
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ bgcolor: "#181818", color: "#fff", overflow: "hidden" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Typography variant="h6">{classKey.toUpperCase()} Students</Typography>
          <Typography variant="caption" sx={{ color: "#bbb" }}>{totalStudents} total • {PAGE_SIZE} per page</Typography>
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: "0.6fr 2fr 1.5fr 1fr", bgcolor: "#333", p: 1.5, gap: 2 }}>
          {['ID', 'Name', 'Admission No.', 'Roll No.'].map((label) => <Typography key={label} fontWeight="bold" fontSize={13}>{label}</Typography>)}
        </Box>
        {loading ? <Box sx={{ py: 7, textAlign: "center" }}><CircularProgress sx={{ color: GREEN }} /></Box> : (
          <List sx={{ p: 0, maxHeight: `calc(100vh - ${appBarHeight + 270}px)`, overflowY: "auto" }}>
            {students.length ? students.map((s) => (
              <ListItem key={s.id ?? s.admissionNumber} sx={{ display: "grid", gridTemplateColumns: "0.6fr 2fr 1.5fr 1fr", gap: 2, borderBottom: "1px solid #333", bgcolor: "#181818", "&:hover": { bgcolor: "#242424" } }}>
                <Typography fontSize={13} noWrap>{safeString(s.id)}</Typography>
                <Typography fontSize={13}>{studentName(s)}</Typography>
                <Typography fontSize={13} sx={{ overflowWrap: "anywhere" }}>{safeString(s.admissionNumber)}</Typography>
                <Typography fontSize={13}>{safeString(s.rollNumber)}</Typography>
              </ListItem>
            )) : <Typography sx={{ p: 4, textAlign: "center" }}>No students found.</Typography>}
          </List>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Pagination count={totalPages} page={Math.min(page, totalPages)} onChange={changePage} renderItem={(item) => <PaginationItem components={{ previous: ChevronLeft, next: ChevronRight }} {...item} />} sx={{ "& .MuiPaginationItem-root": { color: "#fff" }, "& .Mui-selected": { bgcolor: `${GREEN} !important`, color: "#000 !important" } }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default ExamSeatingManagement;
