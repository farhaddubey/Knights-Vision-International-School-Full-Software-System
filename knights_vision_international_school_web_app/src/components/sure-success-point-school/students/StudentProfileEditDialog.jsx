"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CloudUpload, OpenWith, RestartAlt, Save } from "@mui/icons-material";

const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const MAX_PASSPORT_PHOTO_BYTES = 100 * 1024;
const PASSPORT_WIDTH = 400;
const PASSPORT_HEIGHT = 500;
const PREVIEW_WIDTH = 144;
const PREVIEW_HEIGHT = 180;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const darkFieldSx = {
  "& .MuiInputLabel-root": { color: "#c7c7c7" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#66e895" },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "#151515",
    "& fieldset": { borderColor: "#424242" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#49d17b" },
  },
};

function fullName(student) {
  return [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ") || "Student";
}

function asDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function toText(value) {
  return value == null ? "" : String(value);
}

function loadBrowserImage(sourceUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected photo could not be opened."));
    image.src = sourceUrl;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The passport photo could not be prepared."));
    }, "image/webp", quality);
  });
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function cropGeometry({ sourceWidth, sourceHeight, targetWidth, targetHeight, zoom = 1, position = { x: 0, y: 0 } }) {
  const baseScale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const scale = baseScale * Math.max(1, Number(zoom) || 1);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const overflowX = Math.max(0, (width - targetWidth) / 2);
  const overflowY = Math.max(0, (height - targetHeight) / 2);
  return {
    width,
    height,
    left: (targetWidth - width) / 2 + clamp(Number(position?.x) || 0, -1, 1) * overflowX,
    top: (targetHeight - height) / 2 + clamp(Number(position?.y) || 0, -1, 1) * overflowY,
    overflowX,
    overflowY,
  };
}

async function createPassportPhotoFile(file, zoom, position) {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await loadBrowserImage(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = PASSPORT_WIDTH;
    canvas.height = PASSPORT_HEIGHT;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("The passport photo editor is not available in this browser.");

    const crop = cropGeometry({
      sourceWidth: image.naturalWidth,
      sourceHeight: image.naturalHeight,
      targetWidth: PASSPORT_WIDTH,
      targetHeight: PASSPORT_HEIGHT,
      zoom,
      position,
    });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, PASSPORT_WIDTH, PASSPORT_HEIGHT);
    context.drawImage(image, crop.left, crop.top, crop.width, crop.height);

    let optimized = null;
    for (const quality of [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42]) {
      const candidate = await canvasToBlob(canvas, quality);
      if (candidate.size <= MAX_PASSPORT_PHOTO_BYTES) {
        optimized = candidate;
        break;
      }
    }
    if (!optimized) throw new Error("This photo cannot be reduced below 100 KB. Choose a clearer, smaller source photo.");

    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-") || "student-photo";
    return new File([optimized], `${baseName}-passport.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function formFromStudent(student) {
  return {
    firstName: toText(student?.firstName),
    middleName: toText(student?.middleName),
    lastName: toText(student?.lastName),
    rollNumber: toText(student?.rollNumber),
    dateOfBirth: asDateInput(student?.dateOfBirth),
    gender: toText(student?.gender),
    guardianContact: toText(student?.guardianContact),
    bloodGroup: toText(student?.bloodGroup),
    nationality: toText(student?.nationality),
    religion: toText(student?.religion),
    casteCategory: toText(student?.casteCategory),
    preferredLanguage: toText(student?.preferredLanguage),
    dreamOrAim: toText(student?.dreamOrAim),
    hobbies: toText(student?.hobbies),
    specialTalents: toText(student?.specialTalents),
    fatherName: toText(student?.fatherName),
    fatherContact: toText(student?.fatherContact),
    fatherEmail: toText(student?.fatherEmail),
    fatherProfession: toText(student?.fatherProfession),
    fatherQualification: toText(student?.fatherQualification),
    fatherIncome: toText(student?.fatherIncome),
    motherName: toText(student?.motherName),
    motherContact: toText(student?.motherContact),
    motherEmail: toText(student?.motherEmail),
    motherProfession: toText(student?.motherProfession),
    motherQualification: toText(student?.motherQualification),
    motherIncome: toText(student?.motherIncome),
    guardianName: toText(student?.guardianName),
    guardianRelation: toText(student?.guardianRelation),
    guardianAddress: toText(student?.guardianAddress),
    emergencyContact: toText(student?.emergencyContact),
    residentialAddress: toText(student?.residentialAddress),
    city: toText(student?.city),
    state: toText(student?.state),
    pinCode: toText(student?.pinCode),
    previousSchoolName: toText(student?.previousSchoolName),
    lastExamPassed: toText(student?.lastExamPassed),
    lastExamResult: toText(student?.lastExamResult),
    previousAdmissionFee: toText(student?.previousAdmissionFee),
    previousMonthlyFee: toText(student?.previousMonthlyFee),
    reasonOfTransfer: toText(student?.reasonOfTransfer),
    previousSchoolMedium: toText(student?.previousSchoolMedium),
    previousSchoolBoard: toText(student?.previousSchoolBoard),
    previousSchoolCity: toText(student?.previousSchoolCity),
    isTransportRequired: Boolean(student?.isTransportRequired),
    isScholarshipHolder: Boolean(student?.isScholarshipHolder),
    healthImmunization: student?.healthImmunization ? JSON.stringify(student.healthImmunization, null, 2) : "",
    profileImageUrl: toText(student?.profileImageUrl),
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(response.ok ? "The server returned an unexpected response." : "The request could not be completed.");
  }
  if (!response.ok) throw new Error(payload.error || payload.message || "The request could not be completed.");
  return payload;
}

function Field({ label, value, onChange, type = "text", multiline = false, required = false }) {
  return (
    <TextField
      label={label}
      value={value ?? ""}
      type={type}
      required={required}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      fullWidth
      InputLabelProps={type === "date" ? { shrink: true } : undefined}
      sx={darkFieldSx}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Section({ title, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#121212", borderColor: "#343434", color: "#fff" }}>
      <Typography variant="subtitle2" sx={{ color: "#77e7a2", fontWeight: 800, mb: 1.25 }}>{title}</Typography>
      <Stack spacing={1.25}>{children}</Stack>
    </Paper>
  );
}

export default function StudentProfileEditDialog({ open, studentId, onClose, onSaved }) {
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState(() => formFromStudent(null));
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoDimensions, setPhotoDimensions] = useState(null);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [draggingPhoto, setDraggingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const dragStartRef = useRef(null);

  const photoUrl = previewUrl || form.profileImageUrl;
  const photoMissing = !photoFile && !form.profileImageUrl;
  const previewCrop = useMemo(() => {
    if (!previewUrl || !photoDimensions) return null;
    return cropGeometry({
      sourceWidth: photoDimensions.width,
      sourceHeight: photoDimensions.height,
      targetWidth: PREVIEW_WIDTH,
      targetHeight: PREVIEW_HEIGHT,
      zoom: photoZoom,
      position: photoPosition,
    });
  }, [photoDimensions, photoPosition, photoZoom, previewUrl]);
  const placementLabel = useMemo(() => {
    if (!student) return "";
    const classLabel = student.class ? `${student.class.name}${student.class.section ? ` - ${student.class.section}` : ""}` : "Not assigned";
    return `Student ID ${student.id} - Admission ${student.admissionNumber || "pending"} - ${classLabel}`;
  }, [student]);

  useEffect(() => {
    if (!open || !studentId) return undefined;
    let active = true;
    setLoading(true);
    setMessage(null);
    setPhotoFile(null);
    setPreviewUrl("");
    setPhotoZoom(1);
    setPhotoDimensions(null);
    setPhotoPosition({ x: 0, y: 0 });
    requestJson(`/api/student-lifecycle/students/${studentId}`)
      .then((payload) => {
        if (!active) return;
        setStudent(payload.student);
        setForm(formFromStudent(payload.student));
      })
      .catch((error) => { if (active) setMessage({ severity: "error", text: error.message }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, studentId]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const choosePhoto = async (event) => {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) return;
    if (!acceptedPhotoTypes.has(next.type)) {
      setMessage({ severity: "error", text: "Use a JPEG, PNG, WebP, or GIF photo." });
      return;
    }
    if (next.size <= 0 || next.size > MAX_PHOTO_BYTES) {
      setMessage({ severity: "error", text: "The student photo must be between 1 byte and 12 MB." });
      return;
    }
    const nextPreviewUrl = URL.createObjectURL(next);
    try {
      const image = await loadBrowserImage(nextPreviewUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPhotoFile(next);
      setPreviewUrl(nextPreviewUrl);
      setPhotoDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setPhotoZoom(1);
      setPhotoPosition({ x: 0, y: 0 });
      setMessage(null);
    } catch (error) {
      URL.revokeObjectURL(nextPreviewUrl);
      setMessage({ severity: "error", text: error.message || "The selected photo could not be opened." });
    }
  };

  const beginPhotoDrag = (event) => {
    if (!previewCrop) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStartRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      position: photoPosition,
      overflowX: previewCrop.overflowX,
      overflowY: previewCrop.overflowY,
    };
    setDraggingPhoto(true);
  };

  const movePhoto = (event) => {
    const drag = dragStartRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPhotoPosition({
      x: drag.overflowX > 0 ? clamp(drag.position.x + (event.clientX - drag.clientX) / drag.overflowX, -1, 1) : 0,
      y: drag.overflowY > 0 ? clamp(drag.position.y + (event.clientY - drag.clientY) / drag.overflowY, -1, 1) : 0,
    });
  };

  const endPhotoDrag = (event) => {
    if (dragStartRef.current?.pointerId !== event.pointerId) return;
    dragStartRef.current = null;
    setDraggingPhoto(false);
  };

  const parseHealth = () => {
    if (!form.healthImmunization.trim()) return null;
    try {
      const parsed = JSON.parse(form.healthImmunization);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid");
      return parsed;
    } catch {
      throw new Error("Health / immunisation notes must be a valid JSON object, for example {\"notes\": \"Allergy information\"}.");
    }
  };

  const save = async () => {
    if (!student) return;
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage({ severity: "error", text: "First name and last name are required." });
      return;
    }
    if (photoMissing) {
      setMessage({ severity: "error", text: "A student photo is mandatory for the result card, admit card, and ID card. Upload one before saving." });
      return;
    }

    let healthImmunization;
    try {
      healthImmunization = parseHealth();
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      let savedStudent = student;
      if (photoFile) {
        const passportPhoto = await createPassportPhotoFile(photoFile, photoZoom, photoPosition);
        const photoData = new FormData();
        photoData.append("file", passportPhoto, passportPhoto.name);
        const uploaded = await requestJson(`/api/student-lifecycle/students/${student.id}/photo`, { method: "POST", body: photoData });
        savedStudent = { ...savedStudent, ...uploaded.student };
        setForm((current) => ({ ...current, profileImageUrl: uploaded.student.profileImageUrl }));
      }

      const profile = {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        rollNumber: form.rollNumber,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender,
        guardianContact: form.guardianContact,
        bloodGroup: form.bloodGroup,
        nationality: form.nationality,
        religion: form.religion,
        casteCategory: form.casteCategory,
        preferredLanguage: form.preferredLanguage,
        dreamOrAim: form.dreamOrAim,
        hobbies: form.hobbies,
        specialTalents: form.specialTalents,
        fatherName: form.fatherName,
        fatherContact: form.fatherContact,
        fatherEmail: form.fatherEmail,
        fatherProfession: form.fatherProfession,
        fatherQualification: form.fatherQualification,
        fatherIncome: form.fatherIncome,
        motherName: form.motherName,
        motherContact: form.motherContact,
        motherEmail: form.motherEmail,
        motherProfession: form.motherProfession,
        motherQualification: form.motherQualification,
        motherIncome: form.motherIncome,
        guardianName: form.guardianName,
        guardianRelation: form.guardianRelation,
        guardianAddress: form.guardianAddress,
        emergencyContact: form.emergencyContact,
        residentialAddress: form.residentialAddress,
        city: form.city,
        state: form.state,
        pinCode: form.pinCode,
        previousSchoolName: form.previousSchoolName,
        lastExamPassed: form.lastExamPassed,
        lastExamResult: form.lastExamResult,
        previousAdmissionFee: form.previousAdmissionFee,
        previousMonthlyFee: form.previousMonthlyFee,
        reasonOfTransfer: form.reasonOfTransfer,
        previousSchoolMedium: form.previousSchoolMedium,
        previousSchoolBoard: form.previousSchoolBoard,
        previousSchoolCity: form.previousSchoolCity,
        isTransportRequired: form.isTransportRequired,
        isScholarshipHolder: form.isScholarshipHolder,
        healthImmunization,
      };
      const result = await requestJson(`/api/student-lifecycle/students/${student.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(profile),
      });
      const completedStudent = { ...savedStudent, ...result.student };
      setStudent(completedStudent);
      setPhotoFile(null);
      setPhotoZoom(1);
      setPhotoDimensions(null);
      setPhotoPosition({ x: 0, y: 0 });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
      setMessage({ severity: "success", text: "Student profile and photo requirement saved." });
      onSaved?.(completedStudent);
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to save the student profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose?.()} fullWidth maxWidth="lg" PaperProps={{ sx: { bgcolor: "#0d0d0d", color: "#fff", border: "1px solid #3a3a3a" } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Edit Student Profile</DialogTitle>
      <DialogContent dividers sx={{ borderColor: "#343434" }}>
        {message && <Alert severity={message.severity} sx={{ mb: 1.5 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
        {loading && <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress sx={{ color: "#75e59d" }} /><Typography sx={{ mt: 1.5, color: "#bdbdbd" }}>Loading the selected student profile...</Typography></Stack>}
        {!loading && student && <Stack spacing={1.5} sx={{ pt: .5 }}>
          <Alert severity="info">Correct editable student information here. Permanent admission number, school, branch, class placement, and login credentials are protected by their own controlled workflows.</Alert>
          <Paper variant="outlined" sx={{ p: 1.25, bgcolor: "#111", borderColor: "#3b6648", color: "#fff" }}>
            <Typography variant="body2" sx={{ color: "#75e59d", fontWeight: 700 }}>{placementLabel}</Typography>
          </Paper>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
            <Section title="Identity and required student photo">
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="First name" required value={form.firstName} onChange={update("firstName")} /><Field label="Middle name" value={form.middleName} onChange={update("middleName")} /><Field label="Last name" required value={form.lastName} onChange={update("lastName")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Roll number" value={form.rollNumber} onChange={update("rollNumber")} /><Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} /><Field label="Gender" value={form.gender} onChange={update("gender")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems="center">
                <Box
                  onPointerDown={beginPhotoDrag}
                  onPointerMove={movePhoto}
                  onPointerUp={endPhotoDrag}
                  onPointerCancel={endPhotoDrag}
                  sx={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, border: "1px dashed #4f8b63", borderRadius: 1.5, overflow: "hidden", bgcolor: "#171717", display: "grid", placeItems: "center", flexShrink: 0, position: "relative", cursor: previewCrop ? (draggingPhoto ? "grabbing" : "grab") : "default", touchAction: "none", userSelect: "none" }}
                >
                  {previewCrop ? <Box component="img" draggable={false} src={previewUrl} alt={`${fullName(student)} passport crop preview`} sx={{ position: "absolute", width: previewCrop.width, height: previewCrop.height, left: previewCrop.left, top: previewCrop.top, pointerEvents: "none" }} /> : photoUrl ? <Box component="img" src={photoUrl} alt={`${fullName(student)} profile`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Typography variant="caption" align="center" sx={{ color: "#ffd36b", px: 1 }}>Photo required</Typography>}
                  {previewCrop && <Box sx={{ position: "absolute", inset: 0, border: "1px solid rgba(117, 229, 157, .65)", pointerEvents: "none" }} />}
                </Box>
                <Stack spacing={.75} sx={{ flex: 1, width: "100%" }}>
                  <Button component="label" variant="outlined" startIcon={<CloudUpload />} sx={{ color: "#75e59d", borderColor: "#4a8a60", alignSelf: "flex-start" }}>
                    {photoUrl ? "Replace student photo" : "Upload required student photo"}
                    <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={choosePhoto} />
                  </Button>
                  {previewUrl && <Box sx={{ px: .5, pt: .25 }}>
                    <Stack direction="row" spacing={.75} alignItems="center" sx={{ mb: .25 }}>
                      <OpenWith fontSize="small" sx={{ color: "#75e59d" }} />
                      <Typography variant="caption" sx={{ color: "#75e59d", flex: 1 }}>Drag photo to position face — 4:5 passport format</Typography>
                      <Button size="small" startIcon={<RestartAlt fontSize="small" />} onClick={() => setPhotoPosition({ x: 0, y: 0 })} sx={{ color: "#bdbdbd", minWidth: 0 }}>Centre</Button>
                    </Stack>
                    <Slider value={photoZoom} min={1} max={3} step={0.01} valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(2)}×`} onChange={(_, value) => setPhotoZoom(Array.isArray(value) ? value[0] : value)} sx={{ color: "#63de91" }} />
                  </Box>}
                  <Typography variant="caption" sx={{ color: photoMissing ? "#ffd36b" : "#9d9d9d" }}>{photoFile ? "Drag to position the face, then zoom. The selected 400 × 500 WebP crop is uploaded below 100 KB." : photoMissing ? "A photo is required before this record can be saved." : "This photo is used on result cards, admit cards, and ID cards."}</Typography>
                </Stack>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Guardian contact" value={form.guardianContact} onChange={update("guardianContact")} /><Field label="Emergency contact" value={form.emergencyContact} onChange={update("emergencyContact")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Blood group" value={form.bloodGroup} onChange={update("bloodGroup")} /><Field label="Nationality" value={form.nationality} onChange={update("nationality")} /><Field label="Preferred language" value={form.preferredLanguage} onChange={update("preferredLanguage")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Religion" value={form.religion} onChange={update("religion")} /><Field label="Caste category" value={form.casteCategory} onChange={update("casteCategory")} /></Stack>
              <FormControlLabel control={<Checkbox checked={form.isTransportRequired} onChange={(event) => update("isTransportRequired")(event.target.checked)} sx={{ color: "#75e59d", "&.Mui-checked": { color: "#75e59d" } }} />} label="Transport required" />
              <FormControlLabel control={<Checkbox checked={form.isScholarshipHolder} onChange={(event) => update("isScholarshipHolder")(event.target.checked)} sx={{ color: "#75e59d", "&.Mui-checked": { color: "#75e59d" } }} />} label="Scholarship holder" />
            </Section>

            <Section title="Guardian and family contact">
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Guardian name" value={form.guardianName} onChange={update("guardianName")} /><Field label="Guardian relation" value={form.guardianRelation} onChange={update("guardianRelation")} /></Stack>
              <Field label="Guardian address" value={form.guardianAddress} multiline onChange={update("guardianAddress")} />
              <Divider sx={{ borderColor: "#343434" }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Father name" value={form.fatherName} onChange={update("fatherName")} /><Field label="Father contact" value={form.fatherContact} onChange={update("fatherContact")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Father email" value={form.fatherEmail} onChange={update("fatherEmail")} /><Field label="Father profession" value={form.fatherProfession} onChange={update("fatherProfession")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Father qualification" value={form.fatherQualification} onChange={update("fatherQualification")} /><Field label="Father annual income" type="number" value={form.fatherIncome} onChange={update("fatherIncome")} /></Stack>
              <Divider sx={{ borderColor: "#343434" }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Mother name" value={form.motherName} onChange={update("motherName")} /><Field label="Mother contact" value={form.motherContact} onChange={update("motherContact")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Mother email" value={form.motherEmail} onChange={update("motherEmail")} /><Field label="Mother profession" value={form.motherProfession} onChange={update("motherProfession")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Mother qualification" value={form.motherQualification} onChange={update("motherQualification")} /><Field label="Mother annual income" type="number" value={form.motherIncome} onChange={update("motherIncome")} /></Stack>
            </Section>

            <Section title="Address and student profile">
              <Field label="Residential address" value={form.residentialAddress} multiline onChange={update("residentialAddress")} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="City" value={form.city} onChange={update("city")} /><Field label="State" value={form.state} onChange={update("state")} /><Field label="PIN code" value={form.pinCode} onChange={update("pinCode")} /></Stack>
              <Field label="Dream / aim" value={form.dreamOrAim} onChange={update("dreamOrAim")} />
              <Field label="Hobbies" value={form.hobbies} onChange={update("hobbies")} />
              <Field label="Special talents" value={form.specialTalents} onChange={update("specialTalents")} />
              <Field label="Health / immunisation JSON (optional)" value={form.healthImmunization} multiline onChange={update("healthImmunization")} />
              <Typography variant="caption" sx={{ color: "#a9a9a9" }}>For structured health data use JSON, for example {`{"notes":"Peanut allergy"}`}.</Typography>
            </Section>

            <Section title="Previous school and academic background">
              <Field label="Previous school" value={form.previousSchoolName} onChange={update("previousSchoolName")} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Last exam passed" value={form.lastExamPassed} onChange={update("lastExamPassed")} /><Field label="Last exam result" type="number" value={form.lastExamResult} onChange={update("lastExamResult")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Previous school medium" value={form.previousSchoolMedium} onChange={update("previousSchoolMedium")} /><Field label="Previous school board" value={form.previousSchoolBoard} onChange={update("previousSchoolBoard")} /></Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Field label="Previous admission fee" type="number" value={form.previousAdmissionFee} onChange={update("previousAdmissionFee")} /><Field label="Previous monthly fee" type="number" value={form.previousMonthlyFee} onChange={update("previousMonthlyFee")} /></Stack>
              <Field label="Previous school city" value={form.previousSchoolCity} onChange={update("previousSchoolCity")} />
              <Field label="Reason for transfer" value={form.reasonOfTransfer} multiline onChange={update("reasonOfTransfer")} />
            </Section>
          </Box>
        </Stack>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={saving} onClick={() => onClose?.()} sx={{ color: "#ddd" }}>Cancel</Button>
        <Button disabled={loading || saving || !student} variant="contained" startIcon={saving ? <CircularProgress size={17} color="inherit" /> : <Save />} onClick={save} sx={{ bgcolor: "#218c4c", "&:hover": { bgcolor: "#176f3d" } }}>Save student profile</Button>
      </DialogActions>
    </Dialog>
  );
}
