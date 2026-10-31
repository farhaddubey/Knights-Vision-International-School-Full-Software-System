"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

const PAGE_DETAILS = {
  "programs/academic": {
    eyebrow: "Learning at Sure Success Point School",
    title: "Academic Programmes",
    summary: "A structured school pathway that builds strong foundations, confidence, subject knowledge, and responsible learning habits from early years to senior secondary education.",
    highlights: ["Age-appropriate learning plans", "Regular assessment and feedback", "Parent-visible academic progress"],
    sections: [
      ["Foundation to senior secondary", "Early-years readiness, primary foundations, middle-school consolidation, and senior-secondary subject direction are planned as connected stages."],
      ["Teaching with evidence", "Attendance, homework, classroom work, assessments, and student support are reviewed together so a learner is never reduced to one score."],
      ["Clear school communication", "Families receive school notices, calendar information, and learner updates through the authorised school channels."],
    ],
    actions: [["Explore early-years programme", "/programs/early-years"], ["View student support", "/services/student-support"]],
  },
  "programs/early-years": {
    eyebrow: "Academic programmes",
    title: "Early-Years Programme",
    summary: "A secure and joyful start focused on language, early numeracy, routines, curiosity, play-based learning, and social confidence.",
    highlights: ["Foundational literacy", "Early numeracy", "Confidence and routines"],
    sections: [["Learning through guided activity", "Teachers use structured, age-appropriate activities to make early concepts understandable and memorable."], ["Family partnership", "Parents receive clear guidance on school routines and how to reinforce learning at home."], ["Healthy development", "The programme balances classroom learning, movement, creativity, communication, and wellbeing."]],
    actions: [["View academic programmes", "/programs/academic"], ["Start an admission enquiry", "/admissions/process"]],
  },
  "programs/primary": {
    eyebrow: "Academic programmes",
    title: "Primary School Programme",
    summary: "Primary learning strengthens reading, writing, mathematics, scientific curiosity, communication, discipline, and independent study habits.",
    highlights: ["Core subject foundations", "Reading and communication", "Regular learning feedback"],
    sections: [["Strong fundamentals", "The curriculum prioritises mastery of essential concepts before moving learners to more advanced work."], ["Visible progress", "Teachers and families can use academic records and feedback to act early where support is needed."], ["Whole-child growth", "Arts, sports, speaking opportunities, and collaborative activities develop confidence alongside academics."]],
    actions: [["Student learning support", "/services/student-support"], ["Explore activities", "/activities/extracurricular"]],
  },
  "programs/secondary": {
    eyebrow: "Academic programmes",
    title: "Middle and Secondary Programme",
    summary: "A focused programme for deeper subject understanding, disciplined study, responsible conduct, examination readiness, and future planning.",
    highlights: ["Subject depth", "Study discipline", "Exam preparation"],
    sections: [["Academic readiness", "Learners are guided to organise their work, understand assessment expectations, and build sustainable revision habits."], ["Mentored support", "Academic and class teams review learning patterns and direct students to timely help."], ["Responsible citizenship", "Communication, behaviour, teamwork, and school values remain part of daily growth."],],
    actions: [["Career guidance", "/services/career"], ["Academic innovation", "/academics/innovation"]],
  },
  "programs/senior-secondary": {
    eyebrow: "Academic programmes",
    title: "Senior Secondary Programme",
    summary: "Focused support for advanced studies, board-exam preparation, higher-education awareness, career choices, and independent learning.",
    highlights: ["Advanced subject preparation", "Higher-education guidance", "Exam readiness"],
    sections: [["Purposeful learning", "Students receive a structured environment for subject mastery, revision, mock assessment, and academic planning."], ["Future-ready guidance", "School guidance connects academic choices with students' strengths, ambitions, and next-step opportunities."], ["Digital access", "The student app gives authorised students access to their own academic updates and school information."],],
    actions: [["Open student app information", "/digital/student-app"], ["Admission process", "/admissions/process"]],
  },
  "services/student-support": {
    eyebrow: "Student services",
    title: "Student Support",
    summary: "Support systems help students stay connected to learning, attendance, wellbeing, communication, and timely academic guidance.",
    highlights: ["Academic follow-up", "Guardian communication", "Safe school escalation"],
    sections: [["Early attention", "Teachers identify attendance, learning, and wellbeing concerns early and use the appropriate school support process."], ["Guardian partnership", "Verified guardian communication keeps families informed while protecting student information."], ["Right support path", "Counselling, academic help, classroom support, and referrals are handled through the responsible school team."],],
    actions: [["Counselling support", "/services/counseling"], ["Student app", "/digital/student-app"]],
  },
  "services/counseling": {
    eyebrow: "Student services",
    title: "Counselling and Wellbeing",
    summary: "A respectful school support channel for learner wellbeing, adjustment, confidence, study pressure, and responsible decision-making.",
    highlights: ["Confidential support", "Age-appropriate guidance", "Responsible escalation"],
    sections: [["Listen before acting", "Concerns are considered carefully and directed to the responsible school professional or leadership path."], ["Student wellbeing", "Support promotes resilience, respectful behaviour, communication skills, and healthy learning habits."], ["Family coordination", "Where appropriate, the school works with guardians while maintaining the student's dignity and privacy."],],
    actions: [["Student support", "/services/student-support"], ["School policies", "/compliance"]],
  },
  "services/library": {
    eyebrow: "Student services",
    title: "Library and Learning Resources",
    summary: "Learning resources that encourage reading, research habits, subject exploration, and independent study.",
    highlights: ["Reading culture", "Learning resources", "Study support"],
    sections: [["Read widely", "Library access supports regular reading and the development of vocabulary, imagination, and research skills."], ["Use information well", "Students are guided to use learning resources responsibly and build reliable study habits."], ["Learning beyond the classroom", "Resources complement classroom work and help students extend understanding at their own pace."],],
    actions: [["Academic programmes", "/programs/academic"], ["Digital learning", "/academics/digital-learning"]],
  },
  "services/career": {
    eyebrow: "Student services",
    title: "Career and Future Guidance",
    summary: "Guidance that helps senior students connect their interests, strengths, subject choices, and educational goals.",
    highlights: ["Career awareness", "Subject-choice guidance", "Future planning"],
    sections: [["Explore options", "Students learn about education and career pathways in a structured, realistic way."], ["Plan with evidence", "Academic performance, interests, aptitude, and long-term goals inform meaningful decisions."], ["Prepare responsibly", "Guidance encourages disciplined study, appropriate applications, and reliable information sources."],],
    actions: [["Senior secondary programme", "/programs/senior-secondary"], ["Academic innovation", "/academics/innovation"]],
  },
  "academics/innovation": {
    eyebrow: "School excellence",
    title: "Innovation and Student Growth",
    summary: "Learning initiatives that strengthen critical thinking, communication, creative problem-solving, public speaking, and responsible use of technology.",
    highlights: ["Creative thinking", "Communication skills", "Technology-supported learning"],
    sections: [["Make learning active", "Projects, discussions, presentations, and guided challenges help students apply what they learn."], ["Grow confidence", "Structured opportunities for speaking, teamwork, and leadership support confident participation."], ["Use technology responsibly", "Digital tools are used to support learning, communication, and informed decision-making—not to replace teaching."],],
    actions: [["Digital learning", "/academics/digital-learning"], ["Activities and sports", "/activities/extracurricular"]],
  },
  "academics/digital-learning": {
    eyebrow: "School excellence",
    title: "Digital Learning and Communication",
    summary: "Authorised digital tools connect students, guardians, faculty, and school leadership with the right information at the right level of access.",
    highlights: ["Student-specific access", "Faculty operational tools", "Protected school records"],
    sections: [["Student app", "Students can access their own authorised attendance, homework, results, fee status, notices, and learning information."], ["Faculty app", "Faculty use controlled tools for school operations, academic work, and authorised student support."], ["Privacy by design", "Access is role-based and student data is kept within authorised school processes."],],
    actions: [["Student app access", "/digital/student-app"], ["Faculty app access", "/digital/faculty-app"]],
  },
  "activities/extracurricular": {
    eyebrow: "School community",
    title: "Activities and Student Life",
    summary: "Co-curricular experiences that develop confidence, creativity, teamwork, discipline, public expression, and a sense of belonging.",
    highlights: ["Sports and wellbeing", "Public speaking", "Clubs and events"],
    sections: [["Participation matters", "Activities give students structured chances to discover interests and build confidence beyond routine classwork."], ["Learn with others", "Events and teams teach cooperation, leadership, commitment, and respect."], ["Celebrate growth", "The school recognises effort, progress, responsible conduct, and achievement in varied forms."],],
    actions: [["Sports and wellbeing", "/activities/sports"], ["KiREAD Group", "/about/kiread-group"]],
  },
  "activities/sports": {
    eyebrow: "School community",
    title: "Sports, Wellbeing, and Healthy Habits",
    summary: "Movement, sportsmanship, healthy routines, and wellbeing activities support balanced student development.",
    highlights: ["Physical wellbeing", "Sportsmanship", "Team participation"],
    sections: [["Healthy routines", "Students are encouraged to value movement, nutrition, rest, discipline, and balanced daily habits."], ["Fair participation", "Sports and activity opportunities promote teamwork, respect for rules, and resilience."], ["Wellbeing culture", "Physical activity is part of a broader school culture that supports confidence and positive development."],],
    actions: [["Student life", "/activities/extracurricular"], ["Student support", "/services/student-support"]],
  },
  "community/parent-partnership": {
    eyebrow: "School community",
    title: "Parent and Guardian Partnership",
    summary: "A clear, respectful partnership between the school and verified guardians to support student learning, attendance, wellbeing, and growth.",
    highlights: ["Verified communication", "Constructive follow-up", "Shared responsibility"],
    sections: [["Reliable communication", "School updates use appropriate official channels so guardians receive useful, student-relevant information."], ["Work together early", "Families and school teams can address attendance, learning, or wellbeing concerns before they become larger problems."], ["Respect privacy", "Student records are shared only through authorised access and responsible school procedures."],],
    actions: [["Student support", "/services/student-support"], ["Privacy policy", "/privacy"]],
  },
  "community/leadership": {
    eyebrow: "School community",
    title: "Faculty and School Leadership",
    summary: "Faculty and leadership teams work through defined academic, operational, finance, communication, and student-support responsibilities.",
    highlights: ["Clear roles", "Accountable operations", "Student-centred decisions"],
    sections: [["Faculty excellence", "Teachers focus on classroom learning, attendance, homework, assessment, and appropriate student follow-up."], ["School leadership", "Authorised leadership coordinates academics, discipline, operations, finance, and school communication."], ["Secure systems", "Faculty access is controlled by role, school, branch, class, and assigned responsibilities."],],
    actions: [["Faculty app access", "/digital/faculty-app"], ["Terms of service", "/terms"]],
  },
  "admissions/process": {
    eyebrow: "Admissions",
    title: "Admission Process",
    summary: "A guided school admission process that collects accurate student information, confirms placement, and keeps fee verification separate from academic records.",
    highlights: ["Placement information", "Verified guardian details", "Clear document flow"],
    sections: [["Start with correct details", "School, branch, class, section, student identity, and verified guardian information are recorded carefully."], ["Placement and documentation", "The school confirms the appropriate class and documents before completing the admission workflow."], ["Fee custody is tracked", "Admission fee handling follows the authorised collection and verification process; it is not silently treated as settled."],],
    actions: [["Admission fee guidance", "/admissions/fees"], ["Contact the school office", "/contact"]],
  },
  "admissions/fees": {
    eyebrow: "Admissions",
    title: "Admission and Fee Guidance",
    summary: "Fee communication should be clear, documented, and handled only through authorised school processes and receipts.",
    highlights: ["Official receipt process", "Separate fee categories", "Authorised verification"],
    sections: [["Ask the school office", "Applicable fees, concessions, timing, and required documents are confirmed by the authorised school office."], ["Keep receipts safe", "Guardians should retain official acknowledgements and receipts for their records."], ["Controlled verification", "Collection, custody, verification, and settlement steps are recorded through the appropriate school workflow."],],
    actions: [["Admission process", "/admissions/process"], ["School policies", "/compliance"]],
  },
  "digital/student-app": {
    eyebrow: "Digital access",
    title: "Sure Success Connect Student App",
    summary: "A student-specific digital space for authorised learners to view their own school information and learning updates.",
    highlights: ["Personal academic updates", "School notices and calendar", "Secure first-time activation"],
    sections: [["Personal account", "Each student uses their own admission-linked account. UID and Aadhaar are never used as passwords."], ["First-time activation", "The school issues a one-time activation code privately to a verified student or guardian. The code is used once to set a password."], ["Useful daily information", "Access includes only information authorised for the student, such as attendance, homework, assignments, results, fee status, and notices."],],
    actions: [["Open student portal", "/knights-students-panel"], ["Student app privacy policy", "/privacy-policy/sure-success-connect-student-app"]],
  },
  "digital/faculty-app": {
    eyebrow: "Digital access",
    title: "Sure Success Faculty App",
    summary: "A role-controlled operational workspace for authorised faculty to manage assigned academic, attendance, communication, and school tasks.",
    highlights: ["Role-based access", "Assigned-school controls", "Accountable operations"],
    sections: [["Faculty-only access", "Only authorised non-student school personnel can sign in to the Faculty Panel and Faculty App."], ["Assigned responsibilities", "What a faculty user can view or act on depends on their role and school, branch, class, or duty assignment."], ["Protected records", "Sensitive student and school information remains behind role and scope checks."],],
    actions: [["Open faculty portal", "/knights-faculties-panel"], ["Faculty app privacy policy", "/privacy-policy/sure-success-connect-faculty-app"]],
  },
  "about/kiread-group": {
    eyebrow: "About the school group",
    title: "Sure Success Point School and KiREAD Group",
    summary: "Sure Success Point School is a school-focused learning community within the KiREAD Group, committed to academic development, responsible systems, and student growth.",
    highlights: ["Education-focused mission", "Student growth", "Responsible school systems"],
    sections: [["Our focus", "The school combines academic discipline, student support, co-curricular opportunity, and clear school communication."], ["Our community", "Students, guardians, faculty, and leadership each have important and defined responsibilities."], ["Our direction", "We continue strengthening practical learning, reliable digital systems, and safe, accountable school operations."],],
    actions: [["Academic programmes", "/programs/academic"], ["Admissions", "/admissions/process"]],
  },
  contact: {
    eyebrow: "School office",
    title: "Contact Sure Success Point School",
    summary: "For admissions, school visits, academic questions, or support, contact the school through the official school office channels.",
    highlights: ["Admissions support", "School-office guidance", "Official communication"],
    sections: [["Before you contact us", "Keep the student's name, class (if applicable), and the purpose of your enquiry ready so the school can direct you correctly."], ["Existing students", "For student-specific matters, use verified school communication channels or the relevant authorised portal."], ["Privacy first", "Never send passwords, activation codes, Aadhaar, or other sensitive identity details through public messages."],],
    actions: [["Admission process", "/admissions/process"], ["Student support", "/services/student-support"]],
  },
  terms: {
    eyebrow: "School policies",
    title: "Terms of Service",
    summary: "These terms explain the responsible use of Sure Success Point School public information, portals, and digital services.",
    highlights: ["Authorised access", "Responsible conduct", "Accurate information"],
    sections: [["Use accounts lawfully", "Student and faculty accounts are personal, role-limited, and must not be shared or used to access another person's records."], ["Keep information accurate", "Students, guardians, and staff should promptly correct school records through authorised school processes."], ["Respect school systems", "Do not attempt to bypass access controls, alter records, or misuse any school communication or digital service."],],
    actions: [["Privacy policy", "/privacy"], ["Compliance", "/compliance"]],
  },
  privacy: {
    eyebrow: "School policies",
    title: "Privacy and Data Protection",
    summary: "Sure Success Point School protects student, guardian, faculty, and school information through authorised access, defined responsibilities, and secure workflows.",
    highlights: ["Role-based access", "Purpose-limited records", "Secure activation"],
    sections: [["Only authorised access", "Records are available only to users whose assigned role and scope allow access for a valid school purpose."], ["No identity-document passwords", "UID and Aadhaar numbers are never used as Student App passwords. Student accounts use a one-time school activation code and a chosen password."], ["App-specific privacy", "Review the specific privacy notice for the Student App or Faculty App for details about those services."],],
    actions: [["Student app privacy", "/privacy-policy/sure-success-connect-student-app"], ["Faculty app privacy", "/privacy-policy/sure-success-connect-faculty-app"]],
  },
  compliance: {
    eyebrow: "School policies",
    title: "Compliance and Responsible School Operations",
    summary: "School processes are designed around accountable roles, protected records, appropriate approvals, and lawful handling of student and school information.",
    highlights: ["Protected student records", "Authorised approvals", "Accountable financial handling"],
    sections: [["Appropriate authority", "Faculty execute assigned school operations. Central administration controls headquarters-level policy and authorisation."], ["Financial accountability", "School fee handling follows recorded custody, verification, and authorised settlement workflows."], ["Report concerns safely", "Use official school channels to raise concerns about records, access, conduct, or school processes."],],
    actions: [["Terms of service", "/terms"], ["Contact school office", "/contact"]],
  },
};

function routeValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function SchoolInformationPage() {
  const params = useParams();
  const section = routeValue(params?.section);
  const topic = routeValue(params?.topic);
  const page = PAGE_DETAILS[[section, topic].filter(Boolean).join("/")];

  if (!page) {
    return (
      <Box sx={{ bgcolor: "#050505", color: "#fff", minHeight: "70vh", display: "grid", placeItems: "center", px: 2 }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <Typography variant="h4" fontWeight={800}>Page not found</Typography>
          <Typography color="grey.400">This school information page is not available.</Typography>
          <Button component={Link} href="/" variant="contained" sx={{ bgcolor: "#1f8e4d" }}>Return home</Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "72vh", bgcolor: "#050505", color: "#fff", py: { xs: 4, md: 7 } }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, color: "#fff", border: "1px solid rgba(39, 174, 96, .38)", background: "linear-gradient(135deg, #0c2518 0%, #07120d 48%, #16101f 100%)" }}>
          <Stack spacing={2.25}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "#78e6a0" }}><SchoolRoundedIcon fontSize="small" /><Typography variant="overline" fontWeight={800}>{page.eyebrow}</Typography></Stack>
            <Typography component="h1" variant="h2" sx={{ fontSize: { xs: "2rem", md: "3.3rem" }, fontWeight: 900, lineHeight: 1.1 }}>{page.title}</Typography>
            <Typography variant="h6" sx={{ maxWidth: 900, color: "grey.300", fontWeight: 400, lineHeight: 1.6 }}>{page.summary}</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">{page.highlights.map((item) => <Chip key={item} label={item} sx={{ color: "#dcffe8", bgcolor: "rgba(57, 164, 96, .18)", border: "1px solid rgba(126, 234, 164, .35)" }} />)}</Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2.25} sx={{ mt: 1 }}>
          {page.sections.map(([title, copy]) => (
            <Grid item xs={12} md={4} key={title}>
              <Paper sx={{ height: "100%", p: 3, bgcolor: "#101010", color: "#fff", border: "1px solid #272727", borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#a8f5be", mb: 1.2 }}>{title}</Typography>
                <Typography variant="body2" color="grey.300" sx={{ lineHeight: 1.75 }}>{copy}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
          {page.actions.map(([label, href], index) => (
            <Button key={href} component={Link} href={href} variant={index === 0 ? "contained" : "outlined"} endIcon={<ArrowForwardRoundedIcon />} sx={index === 0 ? { alignSelf: "flex-start", bgcolor: "#1f8e4d", "&:hover": { bgcolor: "#176f3c" } } : { alignSelf: "flex-start", color: "#c9f8d7", borderColor: "#438d5a", "&:hover": { borderColor: "#8aeba8", bgcolor: "rgba(64, 178, 97, .12)" } }}>{label}</Button>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
