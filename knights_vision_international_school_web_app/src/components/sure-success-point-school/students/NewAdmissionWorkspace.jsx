"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { downloadCollectionAcknowledgementPdf } from "@/src/components/sure-success-point-school/finance/collectionAcknowledgementPdf";
import { downloadAdmissionOnboardingPdf } from "@/src/components/sure-success-point-school/students/admissionOnboardingPdf";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
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
  "& .MuiSelect-icon": { color: "#fff" },
};

const blankForm = () => ({
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  studentCategory: "DIRECT_GENERAL",
  enrollmentMode: "DIRECT",
  rollNumber: "",
  bloodGroup: "",
  nationality: "Indian",
  religion: "",
  casteCategory: "",
  profileImageUrl: "",
  preferredLanguage: "",
  dreamOrAim: "",
  hobbies: "",
  specialTalents: "",
  healthNotes: "",
  guardianName: "",
  guardianRelation: "",
  guardianContact: "",
  guardianAddress: "",
  emergencyContact: "",
  fatherName: "",
  fatherContact: "",
  fatherEmail: "",
  fatherProfession: "",
  fatherQualification: "",
  fatherIncome: "",
  motherName: "",
  motherContact: "",
  motherEmail: "",
  motherProfession: "",
  motherQualification: "",
  motherIncome: "",
  residentialAddress: "",
  city: "",
  state: "",
  pinCode: "",
  previousSchoolName: "",
  lastExamPassed: "",
  lastExamResult: "",
  previousAdmissionFee: "",
  previousMonthlyFee: "",
  reasonOfTransfer: "",
  previousSchoolMedium: "",
  previousSchoolBoard: "",
  previousSchoolCity: "",
  isTransportRequired: false,
  isScholarshipHolder: false,
});

function classLabel(schoolClass) {
  return schoolClass ? `${schoolClass.name}${schoolClass.section ? ` - ${schoolClass.section}` : ""}` : "Not assigned";
}

function Field({ label, value, onChange, type = "text", required = false, multiline = false }) {
  return (
    <TextField
      label={label}
      value={value ?? ""}
      type={type}
      required={required}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      fullWidth
      sx={darkFieldSx}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function FieldRow({ children }) {
  return <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>{children}</Stack>;
}

function Section({ title, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#121212", borderColor: "#343434", color: "#fff" }}>
      <Typography variant="subtitle2" sx={{ color: "#77e7a2", fontWeight: 800, mb: 1.25 }}>{title}</Typography>
      <Stack spacing={1.25}>{children}</Stack>
    </Paper>
  );
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("The server returned an unexpected response.");
  }
  if (!response.ok) throw new Error(payload.error || "The admission could not be saved.");
  return payload;
}

export default function NewAdmissionWorkspace({ className, authorization }) {
  const permissions = authorization?.permissions || [];
  const roleCodes = new Set([
    authorization?.user?.role,
    ...(authorization?.roles || []).map((role) => role.code),
  ].filter(Boolean).map((role) => String(role).toUpperCase()));
  const canCreate = permissions.includes("*") || permissions.includes("STUDENT_ADMISSION_CREATE");
  const canCollect = (permissions.includes("*") || permissions.includes("fee.collect.provisional"))
    && ["GCI", "HOD", "HEAD_OF_DEPARTMENTS", "COEF"].some((role) => roleCodes.has(role));
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [feeSchemeId, setFeeSchemeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [created, setCreated] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentTransactionId, setPaymentTransactionId] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const classOptions = useMemo(() => classes.filter((item) => item.name === className), [classes, className]);
  const schools = useMemo(() => {
    const byId = new Map();
    classOptions.forEach((item) => {
      if (item.branch?.school?.id) byId.set(String(item.branch.school.id), item.branch.school);
    });
    return [...byId.values()];
  }, [classOptions]);
  const branches = useMemo(() => {
    const byId = new Map();
    classOptions
      .filter((item) => String(item.branch?.school?.id || "") === String(selectedSchoolId))
      .forEach((item) => { if (item.branch?.id) byId.set(String(item.branch.id), item.branch); });
    return [...byId.values()];
  }, [classOptions, selectedSchoolId]);
  const classSections = useMemo(() => classOptions.filter((item) => String(item.branchId) === String(selectedBranchId)), [classOptions, selectedBranchId]);
  const selectedClass = useMemo(
    () => classSections.find((item) => String(item.id) === String(selectedClassId)) || null,
    [classSections, selectedClassId],
  );
  const selectedScheme = useMemo(
    () => selectedClass?.FeeScheme?.find((item) => String(item.id) === String(feeSchemeId)) || null,
    [selectedClass, feeSchemeId],
  );
  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const downloadCreatedAcknowledgement = (record) => {
    if (!record?.collection || !record?.student) return;
    downloadCollectionAcknowledgementPdf({
      collection: record.collection,
      student: record.student,
      classLabel: classLabel(selectedClass),
    });
  };

  const downloadCreatedDigitalAccessSheet = (record) => {
    if (!record?.student || !record?.accountActivation) return;
    downloadAdmissionOnboardingPdf({
      student: record.student,
      activation: record.accountActivation,
      classLabel: classLabel(selectedClass),
    });
  };

  const loadTestExample = () => {
    setForm({
      ...blankForm(),
      firstName: "Demo",
      middleName: "Admission",
      lastName: "Student",
      dateOfBirth: "2018-04-12",
      gender: "MALE",
      rollNumber: "TEST-001",
      bloodGroup: "O+",
      guardianName: "Demo Guardian",
      guardianRelation: "Parent",
      guardianContact: "9000000000",
      emergencyContact: "9000000001",
      guardianAddress: "Demo Address - replace before saving",
      fatherName: "Demo Parent One",
      fatherContact: "9000000000",
      fatherProfession: "Self employed",
      motherName: "Demo Parent Two",
      motherContact: "9000000001",
      motherProfession: "Teacher",
      residentialAddress: "Demo Address - replace before saving",
      city: "Patna",
      state: "Bihar",
      pinCode: "800001",
      previousSchoolName: "Demo Previous School",
      lastExamPassed: "UKG",
      previousSchoolMedium: "English",
      previousSchoolBoard: "State Board",
      preferredLanguage: "Hindi / English",
      dreamOrAim: "Engineer",
      hobbies: "Reading and drawing",
      specialTalents: "Art",
    });
    setMessage({ severity: "info", text: "Test values loaded. Replace the Demo fields before creating a real admission." });
  };

  useEffect(() => {
    let active = true;
    requestJson("/api/student-lifecycle/catalog")
      .then((payload) => { if (active) setClasses(payload.classes || []); })
      .catch((error) => { if (active) setMessage({ severity: "error", text: error.message }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setSelectedSchoolId((current) => schools.some((school) => String(school.id) === String(current)) ? current : String(schools[0]?.id || ""));
  }, [schools]);

  useEffect(() => {
    setSelectedBranchId((current) => branches.some((branch) => String(branch.id) === String(current)) ? current : String(branches[0]?.id || ""));
  }, [branches]);

  useEffect(() => {
    setSelectedClassId((current) => classSections.some((schoolClass) => String(schoolClass.id) === String(current)) ? current : String(classSections[0]?.id || ""));
  }, [classSections]);

  useEffect(() => {
    if (!selectedClass) return;
    setFeeSchemeId((current) => (
      selectedClass.FeeScheme?.some((item) => String(item.id) === String(current))
        ? current
        : String(selectedClass.FeeScheme?.[0]?.id || "")
    ));
  }, [selectedClass]);

  useEffect(() => {
    if (selectedScheme?.admissionFee != null) setPaymentAmount(String(selectedScheme.admissionFee));
  }, [selectedScheme?.id, selectedScheme?.admissionFee]);

  const submit = async () => {
    if (!canCreate) return;
    if (!selectedSchoolId || !selectedBranchId || !selectedClass || !feeSchemeId || !form.firstName.trim() || !form.lastName.trim() || !form.guardianName.trim() || !form.guardianContact.trim()) {
      setMessage({ severity: "error", text: "School, branch, class-section, fee scheme, student name, guardian name, and guardian contact are required." });
      return;
    }
    if (!canCollect) {
      setMessage({ severity: "error", text: "This admission requires the mandatory guardian fee collection. Use an authorised GCI, HOD, or COEF account to complete it." });
      return;
    }
    if (!Number.isFinite(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      setMessage({ severity: "error", text: "Enter the full configured admission fee before creating this admission." });
      return;
    }
    if (Math.abs(Number(paymentAmount) - Number(selectedScheme?.admissionFee || 0)) > 0.00001) {
      setMessage({ severity: "error", text: "The amount must equal the full configured admission fee before the admission can be created." });
      return;
    }
    if (paymentMethod !== "CASH" && !paymentTransactionId.trim()) {
      setMessage({ severity: "error", text: "A payment reference is required for non-cash guardian payment." });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const payload = await requestJson("/api/student-lifecycle/admissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass.id,
          feeSchemeId: Number(feeSchemeId),
          academicYear: selectedClass.academicYear || new Date().getFullYear(),
          admissionDate: new Date().toISOString(),
          rollNumber: form.rollNumber || null,
          enrollmentMode: form.enrollmentMode,
          student: {
            ...form,
            healthImmunization: form.healthNotes.trim() ? { notes: form.healthNotes.trim() } : null,
          },
          collectedAmount: Number(paymentAmount),
          paymentMethod,
          transactionId: paymentTransactionId.trim() || null,
          paymentRemarks: paymentRemarks.trim() || null,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const createdRecord = {
        student: payload.student,
        configuredFee: payload.configuredFee,
        collection: payload.collection || null,
        accountActivation: payload.accountActivation || null,
      };
      setCreated(createdRecord);
      if (createdRecord.collection) downloadCreatedAcknowledgement(createdRecord);
      if (createdRecord.accountActivation) downloadCreatedDigitalAccessSheet(createdRecord);
      setForm(blankForm());
      setPaymentAmount(String(selectedScheme?.admissionFee || ""));
      setPaymentMethod("CASH");
      setPaymentTransactionId("");
      setPaymentRemarks("");
      setMessage({ severity: "success", text: `Admission ${payload.student.admissionNumber} is created. The guardian payment acknowledgement and private digital-access sheet were downloaded.` });
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100%", p: { xs: 1.5, md: 2.5 }, bgcolor: "#0b0b0b", color: "#fff" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>New Admission - Class {className}</Typography>
          <Typography variant="body2" sx={{ color: "#bdbdbd", mt: 0.5 }}>
            Guardian-facing intake with mandatory admission-fee custody recording. The payment acknowledgement and private student digital-access sheet download immediately after admission.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" onClick={loadTestExample} sx={{ color: "#75e59d", borderColor: "#3f7751", textTransform: "none" }}>Load test example</Button>
          {selectedScheme && (
            <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: "#121212", borderColor: "#3f7751", color: "#fff" }}>
              <Typography variant="caption" sx={{ color: "#a7a7a7" }}>Configured admission fee</Typography>
              <Typography sx={{ color: "#75e59d", fontWeight: 800 }}>{money.format(selectedScheme.admissionFee || 0)}</Typography>
            </Paper>
          )}
        </Stack>
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
      {created && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCreated(null)}>
          <Stack spacing={0.75}>
            <Typography>Student UID <strong>#{created.student.id}</strong> and admission number <strong>{created.student.admissionNumber}</strong> are reserved.</Typography>
            <Typography><strong>Guardian paid:</strong> {money.format(created.collection.amount)} is recorded as school custody. The PDF acknowledgement was downloaded; it remains pending handover, COEF verification, bank submission, and Administration confirmation.</Typography>
            <Button size="small" onClick={() => downloadCreatedAcknowledgement(created)} sx={{ alignSelf: "flex-start", px: 0, color: "#0d6b35", textTransform: "none" }}>Download admission acknowledgement again</Button>
            {created.accountActivation && <>
              <Typography><strong>One-time Student App code:</strong> <Box component="span" sx={{ color: "#4b7", fontFamily: "monospace", fontWeight: 800 }}>{created.accountActivation.activationCode}</Box> <Typography component="span" variant="caption">(expires {new Date(created.accountActivation.expiresAt).toLocaleString("en-IN")})</Typography></Typography>
              <Typography variant="body2">Give this one-time code only to the verified guardian or student. They activate their account in the Student App or Student Portal with the admission number and a new 12-character password. UID and Aadhaar are never passwords.</Typography>
              <Button size="small" onClick={() => downloadCreatedDigitalAccessSheet(created)} sx={{ alignSelf: "flex-start", px: 0, color: "#0d6b35", textTransform: "none" }}>Download student digital-access sheet again</Button>
            </>}
          </Stack>
        </Alert>
      )}
      {!canCreate && <Alert severity="warning" sx={{ mb: 2 }}>Your account may view this desk but cannot create a new admission.</Alert>}
      {canCreate && !canCollect && <Alert severity="warning" sx={{ mb: 2 }}>This account cannot complete an admission because a full admission-fee collection is mandatory. Use an authorised GCI, HOD, or COEF account.</Alert>}

      {loading ? (
        <Typography sx={{ color: "#bdbdbd", p: 2 }}>Loading admission desk...</Typography>
      ) : !selectedClass ? (
        <Alert severity="error">Class {className} is not available in your assigned scope.</Alert>
      ) : (
        <Stack spacing={1.5}>
          <Alert severity="info">No Aadhaar/UID password is used or generated. A full guardian admission payment is mandatory; the system records it as school custody, then issues one private one-time activation code and downloads both documents immediately.</Alert>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 1.5 }}>
            <Section title="Student identity and placement">
              <FormControl fullWidth required sx={darkFieldSx}>
                <InputLabel>School</InputLabel>
                <Select label="School" value={selectedSchoolId} onChange={(event) => setSelectedSchoolId(event.target.value)}>
                  {schools.map((school) => <MenuItem key={school.id} value={String(school.id)}>{school.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth required sx={darkFieldSx}>
                <InputLabel>Branch</InputLabel>
                <Select label="Branch" value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} disabled={!selectedSchoolId}>
                  {branches.map((branch) => <MenuItem key={branch.id} value={String(branch.id)}>{branch.name}{branch.code ? ` (${branch.code})` : ""}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth required sx={darkFieldSx}>
                <InputLabel>Class and section</InputLabel>
                <Select label="Class and section" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} disabled={!selectedBranchId}>
                  {classSections.map((schoolClass) => <MenuItem key={schoolClass.id} value={String(schoolClass.id)}>{classLabel(schoolClass)} - Class ID {schoolClass.id}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="System student UID" value="Generated after the admission is created" disabled fullWidth sx={darkFieldSx} helperText="The generated SSPS admission number is the safe, globally unique student identity." />
              <FormControl fullWidth sx={darkFieldSx}>
                <InputLabel>Fee scheme</InputLabel>
                <Select label="Fee scheme" value={feeSchemeId} onChange={(event) => setFeeSchemeId(event.target.value)}>
                  {(selectedClass.FeeScheme || []).map((item) => <MenuItem key={item.id} value={String(item.id)}>{item.category} - {money.format(item.admissionFee || 0)}</MenuItem>)}
                </Select>
              </FormControl>
              <FieldRow><Field label="First name" required value={form.firstName} onChange={update("firstName")} /><Field label="Last name" required value={form.lastName} onChange={update("lastName")} /></FieldRow>
              <FieldRow><Field label="Middle name" value={form.middleName} onChange={update("middleName")} /><Field label="Roll no. (optional)" value={form.rollNumber} onChange={update("rollNumber")} /></FieldRow>
              <FieldRow><Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} /><Field label="Gender" value={form.gender} onChange={update("gender")} /></FieldRow>
              <FieldRow>
                <FormControl fullWidth sx={darkFieldSx}>
                  <InputLabel>Admission category</InputLabel>
                  <Select label="Admission category" value={form.studentCategory} onChange={(event) => update("studentCategory")(event.target.value)}>
                    {["DIRECT_GENERAL", "KSAT_SUPPORT_PLUS", "KSAT_SUPPORT", "KSAT_STANDARD", "KSAT_GENERAL"].map((item) => <MenuItem key={item} value={item}>{item.replaceAll("_", " ")}</MenuItem>)}
                  </Select>
                </FormControl>
                <Field label="Enrollment mode" value={form.enrollmentMode} onChange={update("enrollmentMode")} />
              </FieldRow>
              <FieldRow><Field label="Blood group" value={form.bloodGroup} onChange={update("bloodGroup")} /><Field label="Nationality" value={form.nationality} onChange={update("nationality")} /></FieldRow>
              <FieldRow><Field label="Religion" value={form.religion} onChange={update("religion")} /><Field label="Caste category" value={form.casteCategory} onChange={update("casteCategory")} /></FieldRow>
              <FormControlLabel control={<Checkbox checked={form.isTransportRequired} onChange={(event) => update("isTransportRequired")(event.target.checked)} sx={{ color: "#75e59d", "&.Mui-checked": { color: "#75e59d" } }} />} label="Transport required" />
              <FormControlLabel control={<Checkbox checked={form.isScholarshipHolder} onChange={(event) => update("isScholarshipHolder")(event.target.checked)} sx={{ color: "#75e59d", "&.Mui-checked": { color: "#75e59d" } }} />} label="Scholarship holder" />
            </Section>

            <Section title="Guardian and contact">
              <FieldRow><Field label="Guardian name" required value={form.guardianName} onChange={update("guardianName")} /><Field label="Guardian relation" value={form.guardianRelation} onChange={update("guardianRelation")} /></FieldRow>
              <FieldRow><Field label="Guardian contact" required value={form.guardianContact} onChange={update("guardianContact")} /><Field label="Emergency contact" value={form.emergencyContact} onChange={update("emergencyContact")} /></FieldRow>
              <Field label="Guardian address" value={form.guardianAddress} multiline onChange={update("guardianAddress")} />
              <FieldRow><Field label="Father name" value={form.fatherName} onChange={update("fatherName")} /><Field label="Father contact" value={form.fatherContact} onChange={update("fatherContact")} /></FieldRow>
              <FieldRow><Field label="Father email" value={form.fatherEmail} onChange={update("fatherEmail")} /><Field label="Father profession" value={form.fatherProfession} onChange={update("fatherProfession")} /></FieldRow>
              <FieldRow><Field label="Father qualification" value={form.fatherQualification} onChange={update("fatherQualification")} /><Field label="Father annual income" type="number" value={form.fatherIncome} onChange={update("fatherIncome")} /></FieldRow>
              <FieldRow><Field label="Mother name" value={form.motherName} onChange={update("motherName")} /><Field label="Mother contact" value={form.motherContact} onChange={update("motherContact")} /></FieldRow>
              <FieldRow><Field label="Mother email" value={form.motherEmail} onChange={update("motherEmail")} /><Field label="Mother profession" value={form.motherProfession} onChange={update("motherProfession")} /></FieldRow>
              <FieldRow><Field label="Mother qualification" value={form.motherQualification} onChange={update("motherQualification")} /><Field label="Mother annual income" type="number" value={form.motherIncome} onChange={update("motherIncome")} /></FieldRow>
              <Field label="Residential address" value={form.residentialAddress} multiline onChange={update("residentialAddress")} />
              <FieldRow><Field label="City" value={form.city} onChange={update("city")} /><Field label="State" value={form.state} onChange={update("state")} /><Field label="PIN code" value={form.pinCode} onChange={update("pinCode")} /></FieldRow>
            </Section>

            <Section title="Admission payment at desk">
              {canCollect ? <>
                <Alert severity="success">The full configured admission fee is required. It will be recorded as <strong>Guardian paid - school custody pending</strong> and the acknowledgement PDF will download automatically. It is not a final ledger settlement.</Alert>
                <FieldRow><Field label="Full admission fee collected" type="number" value={paymentAmount} onChange={setPaymentAmount} /><FormControl fullWidth sx={darkFieldSx}><InputLabel>Payment method</InputLabel><Select label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><MenuItem value="CASH">Cash</MenuItem><MenuItem value="UPI">UPI</MenuItem><MenuItem value="NET_BANKING">Net banking</MenuItem><MenuItem value="ONLINE_GATEWAY">Online gateway</MenuItem></Select></FormControl></FieldRow>
                <Field label="Payment reference (required for non-cash)" value={paymentTransactionId} onChange={setPaymentTransactionId} />
                <Field label="Collection note" value={paymentRemarks} multiline onChange={setPaymentRemarks} />
              </> : <Alert severity="warning">This account cannot complete an admission because the admission fee is mandatory. Use an authorised GCI, HOD, or COEF account to collect the fee and issue the acknowledgement.</Alert>}
            </Section>

            <Section title="Previous school and academic background">
              <Field label="Previous school" value={form.previousSchoolName} onChange={update("previousSchoolName")} />
              <FieldRow><Field label="Last exam passed" value={form.lastExamPassed} onChange={update("lastExamPassed")} /><Field label="Last exam result" type="number" value={form.lastExamResult} onChange={update("lastExamResult")} /></FieldRow>
              <FieldRow><Field label="Previous school medium" value={form.previousSchoolMedium} onChange={update("previousSchoolMedium")} /><Field label="Previous school board" value={form.previousSchoolBoard} onChange={update("previousSchoolBoard")} /></FieldRow>
              <FieldRow><Field label="Previous admission fee" type="number" value={form.previousAdmissionFee} onChange={update("previousAdmissionFee")} /><Field label="Previous monthly fee" type="number" value={form.previousMonthlyFee} onChange={update("previousMonthlyFee")} /></FieldRow>
              <Field label="Previous school city" value={form.previousSchoolCity} onChange={update("previousSchoolCity")} />
              <Field label="Reason for transfer" value={form.reasonOfTransfer} multiline onChange={update("reasonOfTransfer")} />
            </Section>

            <Section title="Student profile">
              <FieldRow><Field label="Preferred language" value={form.preferredLanguage} onChange={update("preferredLanguage")} /><Field label="Dream / aim" value={form.dreamOrAim} onChange={update("dreamOrAim")} /></FieldRow>
              <Field label="Profile image URL (optional)" value={form.profileImageUrl} onChange={update("profileImageUrl")} />
              <Field label="Health / immunisation notes (optional)" value={form.healthNotes} multiline onChange={update("healthNotes")} />
              <Field label="Hobbies" value={form.hobbies} onChange={update("hobbies")} />
              <Field label="Special talents" value={form.specialTalents} onChange={update("specialTalents")} />
              <Alert severity="warning">Admission details can be completed over time. A guardian payment is never a silent ledger settlement: it is first recorded as school custody, then passes through COEF and Administration controls.</Alert>
            </Section>
          </Box>
          <Stack direction="row" justifyContent="flex-end">
            <Button disabled={!canCreate || !canCollect || submitting} variant="contained" size="large" startIcon={<PersonAdd />} onClick={submit} sx={{ bgcolor: "#218c4c", "&:hover": { bgcolor: "#176f3d" } }}>
              Create admission and issue acknowledgement
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
