-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'EXECUTIVE', 'INTERN', 'DISTRICT_MANAGER', 'STATE_HEAD', 'ADMIN', 'HOD', 'TEACHER', 'PRINCIPAL');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateEnum
CREATE TYPE "CenterType" AS ENUM ('HQ', 'LOCAL', 'DISTRICT', 'STATE', 'COUNTRY', 'GLOBAL_PARTNER', 'PRIVATE_PARTNER', 'FRANCHISE', 'REGIONAL');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INACTIVE_WITH_DUE', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "BookType" AS ENUM ('TEXTBOOK', 'CAREERBOOK', 'WORKBOOK', 'REFERENCE', 'GUIDE', 'NOVEL', 'SUPPLEMENT');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "FrequencyType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ONCE');

-- CreateEnum
CREATE TYPE "FoodType" AS ENUM ('IMMUNITY', 'BRAIN_POWER', 'ENERGY_BOOST', 'DIGESTION', 'GROWTH', 'BALANCED', 'VITAMIN_RICH');

-- CreateEnum
CREATE TYPE "AdmissionApplicationStatus" AS ENUM ('PENDING', 'QUALIFIED', 'NOT_QUALIFIED', 'ADMITTED', 'SELECTED', 'REJECTED', 'BANNED');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'SELECTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AdmissionType" AS ENUM ('FRESH', 'READMISSION', 'DIRECT', 'MIGRATION');

-- CreateEnum
CREATE TYPE "AdmissionCategory" AS ENUM ('ECONOMICAL_PLUS_KSAT', 'ECONOMICAL_KSAT', 'STANDARD_KSAT', 'GENERAL_KSAT', 'GENERAL_DIRECT');

-- CreateEnum
CREATE TYPE "AdmissionFeeType" AS ENUM ('FRESH', 'READMISSION', 'MIGRATION');

-- CreateEnum
CREATE TYPE "FeePaymentMethod" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'ONLINE_GATEWAY', 'CHEQUE');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "BehaviourCategory" AS ENUM ('ACADEMIC', 'DISCIPLINE', 'ATTENDANCE', 'UNIFORM', 'DEVICE_MISUSE', 'EXAM_MISCONDUCT');

-- CreateEnum
CREATE TYPE "PunishmentType" AS ENUM ('BEHAVIORAL', 'ACADEMIC', 'PHYSICAL_TASK', 'PRIVILEGE_LOSS', 'COUNSELING');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'NET_BANKING', 'ONLINE_GATEWAY');

-- CreateEnum
CREATE TYPE "SuggestionCategory" AS ENUM ('DISCIPLINE', 'UNIFORM', 'SYLLABUS', 'HOMEWORK', 'TEACHER_BEHAVIOR', 'CLEANLINESS', 'TRANSPORT', 'EXTRACURRICULAR', 'TIMETABLE', 'OTHER');

-- CreateEnum
CREATE TYPE "SuggestionSubmittedBy" AS ENUM ('STUDENT', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "DutyRole" AS ENUM ('PRAYER', 'OATH');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HOLIDAY', 'WEEKLY_HOLIDAY');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'COMPLETED', 'NEEDS_IMPROVEMENT', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "AssignmentQualityTag" AS ENUM ('EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT', 'PLAGIARIZED');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('GENERAL', 'ALERT', 'CALL', 'SMS', 'EMAIL', 'MEETING');

-- CreateEnum
CREATE TYPE "CommunicationMethod" AS ENUM ('PHONE', 'SMS', 'WHATSAPP', 'EMAIL', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "LanguageMedium" AS ENUM ('BENGALI', 'HINDI', 'ENGLISH');

-- CreateEnum
CREATE TYPE "KnightsCdtpType" AS ENUM ('MOTIVATIONAL_STORY', 'TALENT_ZONE_UNLOCK', 'CAREER_FLASHCARD', 'SUPER_HABIT', 'CHARACTER_LESSON');

-- CreateEnum
CREATE TYPE "SemesterType" AS ENUM ('SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III');

-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('ACADEMIC', 'ADMINISTRATION', 'EXTRACURRICULAR', 'SPECIAL_EDUCATION', 'VOCATIONAL_TRAINING', 'GUIDANCE_COUNSELING', 'LIBRARY_SERVICES', 'TECHNICAL_SUPPORT', 'STUDENT_WELFARE', 'INTERN_FACULTY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INTERN', 'TEACHER', 'ADMIN', 'MANAGER', 'STAFF', 'SYSTEM_IN_CHARGE', 'ACADEMICS_IN_CHARGE', 'FINANCE_MANAGEMENT_OFFICER', 'PRINCIPAL_HEAD', 'GROUP_CEO', 'BOARD_OF_DIRECTORS', 'REGIONAL_DIRECTOR', 'DISTRICT_MANAGER', 'ASSISTANT_TEACHER', 'LIBRARIAN', 'EXAM_CONTROLLER', 'ACADEMIC_RESEARCHER', 'HR_OFFICER', 'TRANSPORT_MANAGER', 'INFRASTRUCTURE_MANAGER', 'EVENT_COORDINATOR', 'MEDIA_COORDINATOR', 'LEGAL_COMPLIANCE_OFFICER', 'STATE_EXPANSION_HEAD', 'BRANCH_DEVELOPMENT_OFFICER', 'FRANCHISE_SUPPORT_MANAGER', 'STUDENT_WELFARE_OFFICER', 'DISCIPLINE_OFFICER', 'ART_CULTURE_HEAD', 'SECURITY_HEAD', 'SCHOOL_MARKETING_MANAGER', 'CLASS_TEACHER_LKG', 'CLASS_TEACHER_UKG', 'CLASS_TEACHER_I', 'CLASS_TEACHER_II', 'CLASS_TEACHER_III', 'CLASS_TEACHER_IV', 'CLASS_TEACHER_V', 'CLASS_TEACHER_VI', 'CLASS_TEACHER_VII', 'CLASS_TEACHER_VIII', 'CLASS_TEACHER_IX', 'CLASS_TEACHER_X', 'CLASS_TEACHER_XS', 'CLASS_TEACHER_XI', 'CLASS_TEACHER_XII', 'CLASS_TEACHER_XIIS');

-- CreateEnum
CREATE TYPE "SalarySystem" AS ENUM ('Weekly', 'Monthly', 'Daily');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'SUV', 'VAN', 'TRUCK', 'PICKUP', 'BIKE', 'ELECTRIC_CAR', 'BUS', 'FORKLIFT', 'TRACTOR', 'OTHER');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG', 'OTHER');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC', 'CVT', 'OTHER');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('OWNED', 'LEASED', 'RENTED', 'FINANCED');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED', 'SOLD', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RC', 'INSURANCE', 'FITNESS', 'PUC', 'PERMIT', 'INVOICE', 'LEASE_AGREEMENT', 'WARRANTY', 'SERVICE_HISTORY', 'OTHER');

-- CreateEnum
CREATE TYPE "AvailabilityMode" AS ENUM ('ONLINE', 'OFFLINE', 'BOTH');

-- CreateEnum
CREATE TYPE "UploadMethod" AS ENUM ('DIRECT_UPLOAD', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'PARTIALLY_PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'ON_HOLD', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingMethod" AS ENUM ('ONLINE', 'IN_OFFICE', 'D2D');

-- CreateEnum
CREATE TYPE "CaseDistribution" AS ENUM ('PENDING', 'DISTRICT_ASSIGNED', 'STATE_ESCALATED', 'INTER_DISTRICT');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "VisibilityScope" AS ENUM ('PUBLIC', 'INTERNAL', 'PARTNER_ONLY');

-- CreateEnum
CREATE TYPE "AiSupportMode" AS ENUM ('NONE', 'BASIC', 'ADVANCED', 'GPT_ASSISTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('UPI', 'CARD', 'BANK_ACCOUNT', 'WALLET', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "EnquiryRole" AS ENUM ('STUDENT', 'GUARDIAN', 'TEACHER', 'OTHER');

-- CreateEnum
CREATE TYPE "EnquiryType" AS ENUM ('ADMISSION', 'FEE', 'HOMEWORK', 'TEST_RESULT', 'SYLLABUS', 'TRANSFER', 'DISCIPLINE', 'COMPLAINT', 'FEEDBACK', 'TECHNICAL_SUPPORT', 'GENERAL_QUERY');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('PENDING', 'RESPONDED', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('EMAIL', 'PHONE', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "Program" AS ENUM ('REPUBLIC_DAY', 'INDEPENDENCE_DAY', 'FAREWELL_DAY', 'TEACHERS_DAY', 'ANNUAL_SPORTS_DAY', 'ANNUAL_FUNCTION', 'SCIENCE_EXHIBITION', 'ART_CULTURAL_FEST', 'CHILDRENS_DAY', 'FOUNDATION_DAY', 'FRESHERS_WELCOME', 'CAREER_COUNSELLING_SEMINAR', 'BLOOD_DONATION_CAMP', 'SOCIAL_AWARENESS_DRIVE', 'QUIZ_COMPETITION', 'DEBATE_COMPETITION', 'SPELL_BEE', 'INTERHOUSE_COMPETITION', 'YOGA_DAY', 'STUDENTS_COUNCIL_ELECTION', 'INTERNATIONAL_ENGLISH_DAY', 'MATHS_WEEK', 'COMPUTER_LITERACY_WEEK', 'EDUCATIONAL_TOUR', 'PARENT_TEACHER_MEETING');

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "timezoneId" INTEGER NOT NULL,
    "contactInfo" VARCHAR(255),
    "translations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "headId" INTEGER,
    "contactInfo" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "stateId" INTEGER NOT NULL,
    "managerId" INTEGER,
    "contactInfo" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100),
    "description" VARCHAR(500),
    "type" "CenterType" NOT NULL DEFAULT 'LOCAL',
    "logoUrl" VARCHAR(300),
    "coverImageUrl" VARCHAR(300),
    "youtubeUrl" VARCHAR(300),
    "city" VARCHAR(100),
    "districtId" INTEGER,
    "stateId" INTEGER,
    "countryId" INTEGER,
    "address" VARCHAR(255) NOT NULL,
    "landmark" VARCHAR(150),
    "postalCode" VARCHAR(20),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "mapUrl" VARCHAR(300),
    "geoFenceArea" JSONB,
    "phoneCode" VARCHAR(10),
    "phoneNumber" VARCHAR(20),
    "receptionistName" VARCHAR(100),
    "receptionistContact" VARCHAR(100),
    "contactInfo" VARCHAR(255),
    "email" VARCHAR(255),
    "websiteUrl" VARCHAR(255),
    "socialLinks" JSONB,
    "languagesSpoken" TEXT[],
    "registrationNumber" VARCHAR(100),
    "legalEntityName" VARCHAR(200),
    "taxId" VARCHAR(100),
    "complianceCertificates" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isOperational" BOOLEAN NOT NULL DEFAULT true,
    "userRatingsCount" INTEGER NOT NULL DEFAULT 0,
    "avgRatingScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "testimonials" JSONB,
    "bookingUrl" VARCHAR(255),
    "acceptsWalkins" BOOLEAN NOT NULL DEFAULT true,
    "avgWaitTimeMinutes" INTEGER,
    "appointmentPolicy" VARCHAR(255),
    "specializations" TEXT[],
    "mostPopularServices" TEXT[],
    "hasFreeConsultation" BOOLEAN NOT NULL DEFAULT false,
    "offersHomeVisit" BOOLEAN NOT NULL DEFAULT false,
    "parentCenterId" INTEGER,
    "regionManagerId" INTEGER,
    "isFranchise" BOOLEAN NOT NULL DEFAULT false,
    "franchiseInfo" VARCHAR(255),
    "aiSupportEnabled" BOOLEAN NOT NULL DEFAULT false,
    "aiSupportUrl" VARCHAR(255),
    "liveChatSupport" BOOLEAN NOT NULL DEFAULT false,
    "liveChatHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolBranch" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "address" TEXT,
    "roomNumber" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "roomNumber" VARCHAR(50) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "floor" VARCHAR(20),
    "type" VARCHAR(30),
    "supervisor" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolClass" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "section" VARCHAR(5) NOT NULL,
    "roomNumber" VARCHAR(50) NOT NULL,
    "academicYear" INTEGER NOT NULL DEFAULT 2025,
    "classTeacherId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubject" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "syllabus" JSONB,
    "teacherId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectBook" (
    "id" SERIAL NOT NULL,
    "classSubjectId" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "author" VARCHAR(100),
    "publisher" VARCHAR(100),
    "isbn" VARCHAR(50),
    "edition" VARCHAR(50),
    "language" VARCHAR(30),
    "bookType" "BookType" NOT NULL DEFAULT 'TEXTBOOK',
    "downloadUrl" VARCHAR(300),
    "purchaseUrl" VARCHAR(300),
    "studyUrl" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassLifeSystemInstruction" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "timeOfDay" VARCHAR(20),
    "weekDay" "WeekDay",
    "frequency" "FrequencyType" NOT NULL DEFAULT 'DAILY',
    "mediaUrl" VARCHAR(300),
    "mediaUrl1" VARCHAR(300),
    "eudcation_link1" VARCHAR(300),
    "eudcation_link2" VARCHAR(300),
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassLifeSystemInstruction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassFoodInstruction" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "foodType" "FoodType" NOT NULL DEFAULT 'BRAIN_POWER',
    "suggestedItems" JSONB NOT NULL,
    "mediaUrl" VARCHAR(300),
    "timeOfDay" VARCHAR(30),
    "weekDay" "WeekDay",
    "frequency" "FrequencyType" NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassFoodInstruction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionTest" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL,
    "venue" VARCHAR(200),
    "classId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "academicYear" INTEGER NOT NULL DEFAULT 2025,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSubjectSyllabus" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "subjectName" VARCHAR(100) NOT NULL,
    "syllabus" TEXT NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TestSubjectSyllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionTestApplication" (
    "id" SERIAL NOT NULL,
    "studentUid" VARCHAR(30) NOT NULL,
    "guardian_uid" VARCHAR(30),
    "studentId" INTEGER,
    "firstName" VARCHAR(100) NOT NULL,
    "middleName" VARCHAR(100),
    "lastName" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "bloodGroup" VARCHAR(10),
    "nationality" VARCHAR(50),
    "religion" VARCHAR(50),
    "casteCategory" VARCHAR(50),
    "profileImageUrl" VARCHAR(300),
    "dreamOrAim" VARCHAR(200),
    "hobbies" VARCHAR(200),
    "specialTalents" VARCHAR(200),
    "fatherName" VARCHAR(100),
    "fatherContact" VARCHAR(20),
    "fatherEmail" VARCHAR(100),
    "fatherProfession" VARCHAR(100),
    "fatherQualification" VARCHAR(100),
    "fatherIncome" DOUBLE PRECISION,
    "motherName" VARCHAR(100),
    "motherContact" VARCHAR(20),
    "motherEmail" VARCHAR(100),
    "motherProfession" VARCHAR(100),
    "motherQualification" VARCHAR(100),
    "motherIncome" DOUBLE PRECISION,
    "guardianName" VARCHAR(100),
    "guardianContact" VARCHAR(20),
    "guardianRelation" VARCHAR(50),
    "guardianAddress" VARCHAR(300),
    "emergencyContact" VARCHAR(20),
    "residentialAddress" VARCHAR(300),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pinCode" VARCHAR(10),
    "isTransportRequired" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" VARCHAR(50),
    "previousSchoolName" VARCHAR(150),
    "lastExamPassed" VARCHAR(100),
    "lastExamResult" DOUBLE PRECISION,
    "previousAdmissionFee" DOUBLE PRECISION,
    "previousMonthlyFee" DOUBLE PRECISION,
    "reasonOfTransfer" VARCHAR(300),
    "previousSchoolMedium" VARCHAR(50),
    "previousSchoolBoard" VARCHAR(50),
    "previousSchoolCity" VARCHAR(100),
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "academicYear" INTEGER NOT NULL DEFAULT 2025,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "AdmissionCategory" NOT NULL,
    "admissionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "feeSchemeId" INTEGER,
    "qualified" BOOLEAN DEFAULT false,
    "totalMarks" DOUBLE PRECISION,
    "rank" INTEGER,
    "selectionRemarks" VARCHAR(300),
    "phaseSelected" VARCHAR(50),
    "admitCardNumber" VARCHAR(30),
    "admissionAllotmentDate" TIMESTAMP(3),
    "seatRoomId" INTEGER,
    "seatRollNumber" VARCHAR(20),
    "status" "AdmissionApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "finalAdmissionNumber" VARCHAR(30),
    "admissionConfirmedBy" VARCHAR(100),
    "remarksInternal" VARCHAR(300),

    CONSTRAINT "AdmissionTestApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admission" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "admissionType" "AdmissionType" NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'PENDING',
    "previousClassId" INTEGER,
    "transferCertificateId" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "applicationId" INTEGER,
    "feeSchemeId" INTEGER,
    "feeOverrideId" INTEGER,
    "finalAdmissionNumber" VARCHAR(30) NOT NULL,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionFeeTransaction" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "feeType" "AdmissionFeeType" NOT NULL DEFAULT 'FRESH',
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "FeePaymentMethod" NOT NULL,
    "transactionId" VARCHAR(100),
    "receivedBy" VARCHAR(100),
    "remarks" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionFeeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeScheme" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "category" "AdmissionCategory" NOT NULL,
    "monthlyFee" DOUBLE PRECISION NOT NULL,
    "admissionFee" DOUBLE PRECISION NOT NULL,
    "readmissionFee" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentBehaviourLog" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classSubjectId" INTEGER,
    "incidentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "BehaviourCategory" NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "severityLevel" INTEGER NOT NULL,
    "punishmentId" INTEGER,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" VARCHAR(100),
    "resolvedNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentBehaviourLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Punishment" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "type" "PunishmentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Punishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyFee" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "admissionId" INTEGER,
    "schoolId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDue" DOUBLE PRECISION NOT NULL,
    "status" "FeeStatus" NOT NULL DEFAULT 'UNPAID',
    "isWaived" BOOLEAN NOT NULL DEFAULT false,
    "waivedAmount" DOUBLE PRECISION DEFAULT 0,
    "remarks" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fineAmount" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "MonthlyFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyFeePayment" (
    "id" SERIAL NOT NULL,
    "monthlyFeeId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "PaymentMethod" NOT NULL,
    "transactionId" VARCHAR(100),
    "receivedBy" VARCHAR(100),
    "remarks" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyFeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "biometricId" VARCHAR(50),
    "loginEmail" VARCHAR(100),
    "admissionNumber" VARCHAR(30),
    "aadhaarNumber" VARCHAR(20),
    "loginPassword" VARCHAR(255),
    "academicYear" INTEGER DEFAULT 2025,
    "admittedViaTest" BOOLEAN DEFAULT false,
    "finalAdmissionId" INTEGER,
    "studentCategory" "AdmissionCategory",
    "enrollmentMode" VARCHAR(50),
    "isScholarshipHolder" BOOLEAN DEFAULT false,
    "feeSchemeId" INTEGER,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "middleName" VARCHAR(100),
    "lastName" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "dateOfBirth" TIMESTAMP(3),
    "admissionDate" TIMESTAMP(3),
    "rollNumber" VARCHAR(50),
    "status" "StudentStatus" DEFAULT 'ACTIVE',
    "guardianContact" VARCHAR(100),
    "bloodGroup" VARCHAR(10),
    "nationality" VARCHAR(50),
    "religion" VARCHAR(50),
    "casteCategory" VARCHAR(50),
    "profileImageUrl" VARCHAR(300),
    "dreamOrAim" VARCHAR(200),
    "hobbies" VARCHAR(200),
    "specialTalents" VARCHAR(200),
    "fatherName" VARCHAR(100),
    "fatherContact" VARCHAR(20),
    "fatherEmail" VARCHAR(100),
    "fatherProfession" VARCHAR(100),
    "fatherQualification" VARCHAR(100),
    "fatherIncome" DOUBLE PRECISION,
    "motherName" VARCHAR(100),
    "motherContact" VARCHAR(20),
    "motherEmail" VARCHAR(100),
    "motherProfession" VARCHAR(100),
    "motherQualification" VARCHAR(100),
    "motherIncome" DOUBLE PRECISION,
    "guardianName" VARCHAR(100),
    "guardianRelation" VARCHAR(50),
    "guardianAddress" VARCHAR(300),
    "emergencyContact" VARCHAR(20),
    "residentialAddress" VARCHAR(300),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pinCode" VARCHAR(10),
    "isTransportRequired" BOOLEAN DEFAULT false,
    "preferredLanguage" VARCHAR(50),
    "previousSchoolName" VARCHAR(150),
    "lastExamPassed" VARCHAR(100),
    "lastExamResult" DOUBLE PRECISION,
    "previousAdmissionFee" DOUBLE PRECISION,
    "previousMonthlyFee" DOUBLE PRECISION,
    "reasonOfTransfer" VARCHAR(300),
    "previousSchoolMedium" VARCHAR(50),
    "previousSchoolBoard" VARCHAR(50),
    "previousSchoolCity" VARCHAR(100),
    "healthImmunization" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovementSuggestion" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "submittedBy" "SuggestionSubmittedBy" NOT NULL DEFAULT 'GUARDIAN',
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "category" "SuggestionCategory" NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "responseMessage" VARCHAR(1000),
    "visibleToAdmin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImprovementSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerOathAssignment" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "role" "DutyRole" NOT NULL,
    "gender" "Gender" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "academicYear" INTEGER NOT NULL DEFAULT 2025,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerOathAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "leaveRequestId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolidayCalendar" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "appliesTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HolidayCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusScheduleDailyPlan" (
    "id" SERIAL NOT NULL,
    "classSubjectId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "topicTitle" VARCHAR(200) NOT NULL,
    "syllabusId" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionDate" TIMESTAMP(3),
    "articleLinks1" VARCHAR(300),
    "articleLinks2" VARCHAR(300),
    "videoLinks" VARCHAR(300),
    "videoLinks2" VARCHAR(300),
    "instructions_for_students" TEXT,
    "instructions_for_teachers" TEXT,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "homeworkDescription" TEXT,
    "homeworkDueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusScheduleDailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiWeeklyHomeworkReview" (
    "id" SERIAL NOT NULL,
    "classSubjectId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reviewedById" INTEGER NOT NULL,
    "generalRemarks" TEXT,
    "suggestions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiWeeklyHomeworkReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentHomeworkReview" (
    "id" SERIAL NOT NULL,
    "reviewPeriodId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "totalTopicsReviewed" INTEGER NOT NULL,
    "totalHomeworkCompleted" INTEGER NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentHomeworkReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "classSubjectId" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "biWeeklySlotStart" TIMESTAMP(3) NOT NULL,
    "biWeeklySlotEnd" TIMESTAMP(3) NOT NULL,
    "marks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAssignment" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "marksObtained" DOUBLE PRECISION,
    "remarks" TEXT,
    "qualityTag" "AssignmentQualityTag",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100),
    "classSubjectId" INTEGER NOT NULL,
    "testType" VARCHAR(50) NOT NULL,
    "syllabus" VARCHAR(300),
    "marks" INTEGER,
    "biWeeklySlotStart" TIMESTAMP(3) NOT NULL,
    "biWeeklySlotEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestMark" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "maxMarks" INTEGER NOT NULL DEFAULT 30,
    "marks" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fee" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianCommunicationLog" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "communicationType" "CommunicationType" NOT NULL,
    "method" "CommunicationMethod" NOT NULL,
    "summary" VARCHAR(200),
    "details" JSONB,
    "recordedById" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianCommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianCallLog" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "reportWeekStart" TIMESTAMP(3) NOT NULL,
    "reportWeekEnd" TIMESTAMP(3) NOT NULL,
    "callDate" TIMESTAMP(3) NOT NULL,
    "calledById" INTEGER,
    "issuesDiscussed" JSONB,
    "guardianResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentTeacherMeetingNote" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "takenById" INTEGER,
    "guardianInstruction" VARCHAR(500),
    "summary_realization" VARCHAR(300),
    "actionPoints" JSONB,
    "guardianFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentTeacherMeetingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSpeakingOccasion" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "occasionDate" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "languageMedium" "LanguageMedium" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSpeakingOccasion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSpeechSubmission" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "occasionId" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "language" "LanguageMedium" NOT NULL,
    "youtubeLink" VARCHAR(300),
    "facebookLink" VARCHAR(300),
    "instagramLink" VARCHAR(300),
    "youtubeViews" INTEGER DEFAULT 0,
    "facebookViews" INTEGER DEFAULT 0,
    "instagramViews" INTEGER DEFAULT 0,
    "isFirstPlaceYouTube" BOOLEAN NOT NULL DEFAULT false,
    "isFirstPlaceInstagram" BOOLEAN NOT NULL DEFAULT false,
    "isFirstPlaceFacebook" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedByTeacherId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSpeechSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnightsCdtpSession" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "sessionType" "KnightsCdtpType" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT,
    "videoLink" VARCHAR(300),
    "articleLink" VARCHAR(300),
    "imageUrl" VARCHAR(300),
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockReason" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnightsCdtpSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytic" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "day" VARCHAR(20) NOT NULL,
    "startTime" VARCHAR(10) NOT NULL,
    "endTime" VARCHAR(10) NOT NULL,
    "subjectId" INTEGER,
    "classSubjectId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemesterResult" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classSubjectId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "semester" "SemesterType" NOT NULL,
    "semesterExamMarks" DOUBLE PRECISION NOT NULL,
    "vivaMarks" DOUBLE PRECISION NOT NULL,
    "internalMarks" DOUBLE PRECISION NOT NULL,
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SemesterResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemesterExamSchedule" (
    "id" SERIAL NOT NULL,
    "classSubjectId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "semester" "SemesterType" NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "examHall" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SemesterExamSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectSyllabus" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "topic" VARCHAR(200) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionDate" TIMESTAMP(3),
    "lectureContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectSyllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "classId" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "slug" VARCHAR(100) NOT NULL,
    "type" "DepartmentType",
    "image" VARCHAR(500),
    "regionVisibility" JSONB,
    "seoMeta" JSONB,
    "translations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "curriculum" VARCHAR(255),
    "gradeLevels" VARCHAR(255),
    "capacity" INTEGER,
    "facilities" JSONB,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),
    "username" VARCHAR(255),
    "email" TEXT NOT NULL,
    "password" VARCHAR(255),
    "reset_password_token" VARCHAR(255),
    "registration_token" VARCHAR(255),
    "is_active" BOOLEAN DEFAULT true,
    "blocked" BOOLEAN DEFAULT false,
    "prefered_language" VARCHAR(255),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "role" "UserRole",
    "role_teacher" "UserRole",
    "department" "DepartmentType",
    "confirmation_token" VARCHAR(255),
    "rfid_card_no" VARCHAR(20),
    "confirmed" BOOLEAN DEFAULT false,
    "biometric_id" VARCHAR(255),
    "aggrement_work_hours_per_day" DECIMAL(10,2),
    "base_salary" DECIMAL(10,2),
    "extra_per_half_hour_salary" DECIMAL(10,2),
    "regular_entry_time" VARCHAR(8),
    "regular_leave_time" VARCHAR(8),
    "salary_system" "SalarySystem",
    "per_day_bonus_salary" DECIMAL(10,2),
    "per_day_salary" DECIMAL(10,2),
    "published_at" TIMESTAMP(6),
    "clg_name" VARCHAR(255),
    "highest_degree" VARCHAR(255),
    "highest_marks" VARCHAR(255),
    "years_experience" INTEGER,
    "specialization" VARCHAR(255),
    "bio" TEXT,
    "languages_known" VARCHAR(255),
    "bar_registration_no" VARCHAR(50),
    "address" VARCHAR(255),
    "fatherName" VARCHAR(255),
    "motherName" VARCHAR(255),
    "phone1" BIGINT,
    "phone2" BIGINT,
    "phone3" BIGINT,
    "uid_aadhar" BIGINT,
    "village" VARCHAR(255),
    "block" VARCHAR(255),
    "municiple" VARCHAR(255),
    "police_station" VARCHAR(255),
    "district" VARCHAR(255),
    "state" VARCHAR(255),
    "country" VARCHAR(255),
    "pincode" VARCHAR(20),
    "phone_prefix" VARCHAR(20),
    "whatsapp" VARCHAR(20),
    "aadhar_verified" BOOLEAN DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardExam" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "classSubjectId" INTEGER NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "totalMarks" INTEGER NOT NULL DEFAULT 100,
    "syllabus" VARCHAR(300),
    "academicYear" INTEGER NOT NULL DEFAULT 2025,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardExamResult" (
    "id" SERIAL NOT NULL,
    "boardExamId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "writtenMarks" DOUBLE PRECISION NOT NULL,
    "oralMarks" DOUBLE PRECISION NOT NULL,
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "remarks" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleDuty" (
    "id" SERIAL NOT NULL,
    "role" "UserRole" NOT NULL,
    "description" TEXT NOT NULL,
    "scope" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleDuty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutyAssignment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleDutyId" INTEGER NOT NULL,
    "classId" INTEGER,
    "branchId" INTEGER,
    "schoolId" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DutyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchRoleAssignment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsEvent" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "classSubjectId" INTEGER,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "liveStreamUrl" VARCHAR(300),
    "participants" JSONB,
    "results" JSONB,
    "managerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSubjectAssignment" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "assignedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherSubjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherCompanyExperience" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "company_name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "currently_working" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "TeacherCompanyExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherCertification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cert_title" TEXT NOT NULL,
    "issued_by" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "certificate_url" TEXT,

    CONSTRAINT "TeacherCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfileSpecializationTag" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "TeacherProfileSpecializationTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecializationTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "SpecializationTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "phonePrefix" VARCHAR(20),
    "uid_aadhar" BIGINT,
    "address" TEXT,
    "village" VARCHAR(255),
    "block" VARCHAR(255),
    "municipality" VARCHAR(255),
    "policeStation" VARCHAR(255),
    "district" VARCHAR(255),
    "state" VARCHAR(255),
    "country" VARCHAR(255),
    "pincode" VARCHAR(20),
    "resumeUrl" VARCHAR(500),
    "coverLetterUrl" VARCHAR(500),
    "certificates" TEXT[],
    "clgName" VARCHAR(255),
    "highestDegree" VARCHAR(255),
    "highestMarks" VARCHAR(255),
    "yearsExperience" INTEGER,
    "specialization" VARCHAR(255),
    "barRegistrationNo" VARCHAR(50),
    "languagesKnown" TEXT[],
    "role" VARCHAR(255) NOT NULL,
    "department" VARCHAR(255),
    "workTypeId" INTEGER,
    "brandId" INTEGER,
    "status" "AppStatus" NOT NULL DEFAULT 'SUBMITTED',
    "comments" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "userId" INTEGER,
    "interviewDateTime" TIMESTAMP(3),

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetVehicle" (
    "id" SERIAL NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "chassisNumber" TEXT NOT NULL,
    "engineNumber" TEXT NOT NULL,
    "vinNumber" TEXT,
    "vehicleType" "VehicleType" NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT,
    "fuelType" "FuelType" NOT NULL,
    "transmissionType" "TransmissionType" NOT NULL,
    "color" TEXT,
    "seatingCapacity" INTEGER NOT NULL,
    "loadingCapacityKg" INTEGER,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "modelYear" INTEGER NOT NULL,
    "rcExpiryDate" TIMESTAMP(3) NOT NULL,
    "fitnessExpiryDate" TIMESTAMP(3) NOT NULL,
    "insuranceCompany" TEXT,
    "insurancePolicyNumber" TEXT,
    "insuranceExpiryDate" TIMESTAMP(3) NOT NULL,
    "pucExpiryDate" TIMESTAMP(3) NOT NULL,
    "permitType" TEXT,
    "permitExpiryDate" TIMESTAMP(3) NOT NULL,
    "odometer" INTEGER NOT NULL DEFAULT 0,
    "lastServiceDate" TIMESTAMP(3),
    "nextServiceDueDate" TIMESTAMP(3),
    "warrantyExpiryDate" TIMESTAMP(3),
    "leaseExpiryDate" TIMESTAMP(3),
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownershipType" "OwnershipType" NOT NULL,
    "decommissionDate" TIMESTAMP(3),
    "remarks" TEXT,
    "assignedDriverId" INTEGER,
    "depotId" INTEGER,
    "gpsDeviceId" TEXT,
    "telematicsProfile" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FleetVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depot" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "contactNumber" TEXT,

    CONSTRAINT "Depot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleDocument" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "serviceCenter" TEXT,
    "cost" DOUBLE PRECISION,
    "nextDueDate" TIMESTAMP(3),
    "odoAtService" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salaries_employee_id_links" (
    "id" SERIAL NOT NULL,
    "employee_salary_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "employee_salary_order" DOUBLE PRECISION,

    CONSTRAINT "employee_salaries_employee_id_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_roles_links" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "role_id" INTEGER,
    "role_order" DOUBLE PRECISION,
    "user_order" DOUBLE PRECISION,

    CONSTRAINT "User_roles_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_homepage_carousel" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),

    CONSTRAINT "site_homepage_carousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_night_shift_attendance_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "is_present" BOOLEAN DEFAULT false,
    "is_half_day" BOOLEAN DEFAULT false,
    "is_absent" BOOLEAN DEFAULT false,
    "is_approved" BOOLEAN DEFAULT false,
    "day_type" TEXT,
    "leave_type" TEXT,
    "total_hours" DECIMAL(10,2),
    "late_minutes" DECIMAL(10,2),
    "overtime_minutes" DECIMAL(10,2),
    "base_day_salary" DECIMAL(10,2),
    "overtime_salary" DECIMAL(10,2),
    "penalty_deduction" DECIMAL(10,2),
    "bonus_salary" DECIMAL(10,2),
    "net_salary_of_day" DECIMAL(10,2),
    "remarks" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "employee_night_shift_attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_attendance_logs" (
    "id" SERIAL NOT NULL,
    "date" DATE,
    "entry_time" VARCHAR(8),
    "leave_time" VARCHAR(8),
    "total_hours" DECIMAL(10,2),
    "late_minutes" DECIMAL(10,2),
    "penalty" DECIMAL(10,2),
    "overtime_minutes" DECIMAL(10,2),
    "overtime_salary" DECIMAL(10,2),
    "bonus_salary_per_day" DECIMAL(10,2),
    "production_bonus_of_the_day" DECIMAL(10,2),
    "work_bonus_of_the_day" DECIMAL(10,2),
    "net_salary_of_the_day" DECIMAL(10,2),
    "created_at" TIMESTAMP(6),
    "if_mid_verified" BOOLEAN DEFAULT false,
    "mid_verified_time" TIME(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "user_id" INTEGER,

    CONSTRAINT "employee_attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salaries_attendance_logs_links" (
    "id" SERIAL NOT NULL,
    "employee_salary_id" INTEGER,
    "employee_attendance_log_id" INTEGER,
    "employee_attendance_log_order" DOUBLE PRECISION,

    CONSTRAINT "employee_salaries_attendance_logs_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_attendance_logs_user_links" (
    "id" SERIAL NOT NULL,
    "employee_attendance_log_id" INTEGER,
    "user_id" INTEGER,
    "employee_attendance_log_order" DOUBLE PRECISION,

    CONSTRAINT "employee_attendance_logs_user_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salaries" (
    "id" SERIAL NOT NULL,
    "total_hours_worked" DECIMAL(10,2),
    "payment_status" VARCHAR(255),
    "allowances" DECIMAL(10,2),
    "total_late_deduction" DECIMAL(10,2),
    "total_overtime_bonus" DECIMAL(10,2),
    "total_sell_bonus" DECIMAL(10,2),
    "net_salary" DECIMAL(10,2),
    "month_year" DATE,
    "salary_paid" DECIMAL(10,2),
    "remaining_salary_of_month" DECIMAL(10,2),
    "user_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "employee_salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_paid_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "date" DATE DEFAULT CURRENT_TIMESTAMP,
    "salary_id" INTEGER NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL,
    "paid_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_mode" VARCHAR(100),
    "note" VARCHAR(255),
    "paid_by_user_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "salary_paid_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "mime" VARCHAR(255) NOT NULL,
    "size" DECIMAL(10,2) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "folder_path" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files_folder_links" (
    "id" SERIAL NOT NULL,
    "file_id" INTEGER NOT NULL,
    "folder_id" INTEGER,
    "file_order" DOUBLE PRECISION,

    CONSTRAINT "files_folder_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_folders" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "upload_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files_related_morphs" (
    "id" SERIAL NOT NULL,
    "file_id" INTEGER,
    "related_id" INTEGER,
    "related_type" VARCHAR(255),
    "field" VARCHAR(255),
    "order" DOUBLE PRECISION,

    CONSTRAINT "files_related_morphs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_logistics_vehicles" (
    "id" SERIAL NOT NULL,
    "vehicle_id" VARCHAR(255),
    "vehicle_type" VARCHAR(255),
    "wright_capacity" VARCHAR(255),
    "capacity_volume" VARCHAR(255),
    "license_plate" VARCHAR(255),
    "chasis_no" VARCHAR(255),
    "registration_no" VARCHAR(255),
    "gps_tracker_id" VARCHAR(255),
    "vehicle_status" VARCHAR(255),
    "last_maintenance_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "fleet_logistics_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_reports_collections" (
    "id" SERIAL NOT NULL,
    "hr_report_id" VARCHAR(255),
    "total_employees" INTEGER,
    "attendance_rate" DECIMAL(10,2),
    "overtime_hours" DECIMAL(10,2),
    "salary_disbursement" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "hr_reports_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_locale" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "code" VARCHAR(255),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "i18n_locale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_logs" (
    "id" SERIAL NOT NULL,
    "payment_id" VARCHAR(255),
    "date" DATE,
    "amount_paid" DECIMAL(10,2),
    "payment_date" DATE,
    "payment_method" VARCHAR(255),
    "payment_status" VARCHAR(255),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_logs_employee_salary_links" (
    "id" SERIAL NOT NULL,
    "payment_log_id" INTEGER,
    "employee_salary_id" INTEGER,
    "payment_log_order" DOUBLE PRECISION,

    CONSTRAINT "payment_logs_employee_salary_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_logs_users_permissions_user_links" (
    "id" SERIAL NOT NULL,
    "payment_log_id" INTEGER,
    "user_id" INTEGER,
    "payment_log_order" DOUBLE PRECISION,

    CONSTRAINT "payment_logs_users_permissions_user_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingHours" (
    "id" SERIAL NOT NULL,
    "serviceCenterId" INTEGER NOT NULL,
    "dayOfWeek" VARCHAR(10) NOT NULL,
    "openTime" VARCHAR(5) NOT NULL,
    "closeTime" VARCHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherClasseMapping" (
    "id" SERIAL NOT NULL,
    "TeacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherClasseMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordFeatureGroup" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(300),
    "iconUrl" VARCHAR(255),
    "bannerUrl" VARCHAR(500),
    "tagColor" VARCHAR(20),
    "label" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxServices" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordFeatureGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordFeatureMapping" (
    "id" SERIAL NOT NULL,
    "featureId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordFeatureMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceReview" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "requestId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" BIGINT,
    "passwordHash" VARCHAR(255) NOT NULL,
    "whatsappNumber" VARCHAR(20),
    "districtId" INTEGER,
    "dataConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "address" VARCHAR(255),
    "village" VARCHAR(100),
    "block" VARCHAR(100),
    "pincode" VARCHAR(10),
    "phone1" BIGINT,
    "phone2" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stateId" INTEGER,
    "countryId" INTEGER,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianPaymentProfile" (
    "id" SERIAL NOT NULL,
    "GuardianId" INTEGER NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "accountHolder" VARCHAR(100),
    "upiId" VARCHAR(100),
    "cardNumber" VARCHAR(20),
    "walletProvider" VARCHAR(50),
    "bankName" VARCHAR(100),
    "accountNumber" VARCHAR(30),
    "ifscCode" VARCHAR(20),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianPaymentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER,
    "districtId" INTEGER,
    "stateId" INTEGER,
    "countryId" INTEGER,
    "requestCount" INTEGER,
    "completionRate" DOUBLE PRECISION,
    "avgResolutionTime" DOUBLE PRECISION,
    "slaCompliance" DOUBLE PRECISION,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "taxId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tax" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "GuardianId" INTEGER NOT NULL,
    "requestId" INTEGER,
    "type" VARCHAR(50) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "GuardianId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "requestId" INTEGER,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" SERIAL NOT NULL,
    "GuardianId" INTEGER NOT NULL,
    "requestId" INTEGER,
    "description" VARCHAR(500) NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" SERIAL NOT NULL,
    "GuardianId" INTEGER NOT NULL,
    "requestId" INTEGER,
    "userId" INTEGER,
    "type" VARCHAR(50) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "teamLeadId" INTEGER,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationalArticle" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "tags" VARCHAR(50)[],
    "image" VARCHAR(255),
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EducationalArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(300),
    "fileUrl" VARCHAR(255) NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "category" VARCHAR(100),

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" SERIAL NOT NULL,
    "GuardianId" INTEGER,
    "message" VARCHAR(250),
    "rating" INTEGER,
    "serviceId" INTEGER,
    "img_url" VARCHAR(250),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeTopic" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "wikigalaxy_link" VARCHAR(250),
    "youtube_link" VARCHAR(250),
    "slug" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20),

    CONSTRAINT "KnowledgeTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteHomePageNavbar" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "page_link" VARCHAR(300),

    CONSTRAINT "SiteHomePageNavbar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteFeaturePlatforms" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200),
    "page_link" VARCHAR(300),
    "img_url" VARCHAR(300),

    CONSTRAINT "SiteFeaturePlatforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_site_homepage_carousel" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),
    "title" VARCHAR(80),
    "subtitle" VARCHAR(120),

    CONSTRAINT "public_site_homepage_carousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_homepage_carousel" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),

    CONSTRAINT "app_homepage_carousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_carousel_two" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),
    "page_link" VARCHAR(300),
    "title_1" VARCHAR(50),
    "title_2" VARCHAR(50),

    CONSTRAINT "site_carousel_two_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolEnquiry" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" "EnquiryRole" NOT NULL,
    "enquiryType" "EnquiryType" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "schoolId" INTEGER,
    "classOrGrade" TEXT,
    "identification" TEXT,
    "preferredContactMethod" "ContactMethod" NOT NULL DEFAULT 'EMAIL',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureTechnology" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),
    "page_link" VARCHAR(300),
    "title_1" VARCHAR(50),
    "title_2" VARCHAR(150),

    CONSTRAINT "FeatureTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureSchoolCenterCities" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),
    "title" VARCHAR(50),

    CONSTRAINT "FeatureSchoolCenterCities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureStudentsResults" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),
    "title" VARCHAR(50),
    "position" VARCHAR(50),
    "marks" VARCHAR(50),
    "pass_year" VARCHAR(50),
    "college" VARCHAR(100),
    "designation" VARCHAR(100),
    "qualified_profession_year" VARCHAR(100),
    "highest_awards" VARCHAR(100),
    "highest_respect" VARCHAR(100),

    CONSTRAINT "FeatureStudentsResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureSchoolsPrograms" (
    "id" SERIAL NOT NULL,
    "img_url" VARCHAR(500),
    "title" VARCHAR(50),
    "description" VARCHAR(200),
    "type" "Program",

    CONSTRAINT "FeatureSchoolsPrograms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SchoolClassToTest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SchoolClassToTest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AdmissionTestBranch" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AdmissionTestBranch_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_StudentToTest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentToTest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AssignmentToSchoolClass" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssignmentToSchoolClass_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AssignmentToStudent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssignmentToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "State_slug_key" ON "State"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE UNIQUE INDEX "District_slug_key" ON "District"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "School_slug_key" ON "School"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolBranch_code_key" ON "SchoolBranch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolBranch_slug_key" ON "SchoolBranch"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomNumber_key" ON "Room"("roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_branchId_name_section_academicYear_key" ON "SchoolClass"("branchId", "name", "section", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_schoolId_branchId_name_section_academicYear_key" ON "SchoolClass"("schoolId", "branchId", "name", "section", "academicYear");

-- CreateIndex
CREATE INDEX "ClassSubject_classId_idx" ON "ClassSubject"("classId");

-- CreateIndex
CREATE INDEX "ClassSubject_subjectId_idx" ON "ClassSubject"("subjectId");

-- CreateIndex
CREATE INDEX "ClassSubject_branchId_idx" ON "ClassSubject"("branchId");

-- CreateIndex
CREATE INDEX "ClassSubject_teacherId_idx" ON "ClassSubject"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubject_classId_subjectId_key" ON "ClassSubject"("classId", "subjectId");

-- CreateIndex
CREATE INDEX "SubjectBook_classSubjectId_idx" ON "SubjectBook"("classSubjectId");

-- CreateIndex
CREATE INDEX "ClassLifeSystemInstruction_classId_idx" ON "ClassLifeSystemInstruction"("classId");

-- CreateIndex
CREATE INDEX "ClassFoodInstruction_classId_idx" ON "ClassFoodInstruction"("classId");

-- CreateIndex
CREATE INDEX "AdmissionTest_classId_idx" ON "AdmissionTest"("classId");

-- CreateIndex
CREATE INDEX "AdmissionTest_branchId_idx" ON "AdmissionTest"("branchId");

-- CreateIndex
CREATE INDEX "TestSubjectSyllabus_testId_idx" ON "TestSubjectSyllabus"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionTestApplication_studentUid_key" ON "AdmissionTestApplication"("studentUid");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionTestApplication_admissionId_key" ON "AdmissionTestApplication"("admissionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionTestApplication_admitCardNumber_key" ON "AdmissionTestApplication"("admitCardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionTestApplication_finalAdmissionNumber_key" ON "AdmissionTestApplication"("finalAdmissionNumber");

-- CreateIndex
CREATE INDEX "AdmissionTestApplication_branchId_idx" ON "AdmissionTestApplication"("branchId");

-- CreateIndex
CREATE INDEX "AdmissionTestApplication_classId_idx" ON "AdmissionTestApplication"("classId");

-- CreateIndex
CREATE INDEX "AdmissionTestApplication_studentUid_idx" ON "AdmissionTestApplication"("studentUid");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_applicationId_key" ON "Admission"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_feeOverrideId_key" ON "Admission"("feeOverrideId");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_finalAdmissionNumber_key" ON "Admission"("finalAdmissionNumber");

-- CreateIndex
CREATE INDEX "Admission_studentId_idx" ON "Admission"("studentId");

-- CreateIndex
CREATE INDEX "Admission_branchId_idx" ON "Admission"("branchId");

-- CreateIndex
CREATE INDEX "Admission_classId_idx" ON "Admission"("classId");

-- CreateIndex
CREATE INDEX "Admission_feeSchemeId_idx" ON "Admission"("feeSchemeId");

-- CreateIndex
CREATE INDEX "Admission_feeOverrideId_idx" ON "Admission"("feeOverrideId");

-- CreateIndex
CREATE INDEX "AdmissionFeeTransaction_studentId_idx" ON "AdmissionFeeTransaction"("studentId");

-- CreateIndex
CREATE INDEX "AdmissionFeeTransaction_admissionId_idx" ON "AdmissionFeeTransaction"("admissionId");

-- CreateIndex
CREATE INDEX "AdmissionFeeTransaction_academicYear_idx" ON "AdmissionFeeTransaction"("academicYear");

-- CreateIndex
CREATE INDEX "FeeScheme_classId_idx" ON "FeeScheme"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeScheme_classId_category_key" ON "FeeScheme"("classId", "category");

-- CreateIndex
CREATE INDEX "StudentBehaviourLog_studentId_incidentDate_idx" ON "StudentBehaviourLog"("studentId", "incidentDate");

-- CreateIndex
CREATE INDEX "Punishment_classId_idx" ON "Punishment"("classId");

-- CreateIndex
CREATE INDEX "MonthlyFee_studentId_idx" ON "MonthlyFee"("studentId");

-- CreateIndex
CREATE INDEX "MonthlyFee_admissionId_idx" ON "MonthlyFee"("admissionId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFee_studentId_month_year_key" ON "MonthlyFee"("studentId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Student_loginEmail_key" ON "Student"("loginEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNumber_key" ON "Student"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_finalAdmissionId_key" ON "Student"("finalAdmissionId");

-- CreateIndex
CREATE INDEX "Student_branchId_idx" ON "Student"("branchId");

-- CreateIndex
CREATE INDEX "Student_classId_idx" ON "Student"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ImprovementSuggestion_studentId_month_year_key" ON "ImprovementSuggestion"("studentId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerOathAssignment_studentId_date_role_key" ON "PrayerOathAssignment"("studentId", "date", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_date_key" ON "Attendance"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HolidayCalendar_date_appliesTo_key" ON "HolidayCalendar"("date", "appliesTo");

-- CreateIndex
CREATE INDEX "SyllabusScheduleDailyPlan_classSubjectId_idx" ON "SyllabusScheduleDailyPlan"("classSubjectId");

-- CreateIndex
CREATE INDEX "SyllabusScheduleDailyPlan_date_idx" ON "SyllabusScheduleDailyPlan"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusScheduleDailyPlan_classSubjectId_date_key" ON "SyllabusScheduleDailyPlan"("classSubjectId", "date");

-- CreateIndex
CREATE INDEX "BiWeeklyHomeworkReview_classSubjectId_idx" ON "BiWeeklyHomeworkReview"("classSubjectId");

-- CreateIndex
CREATE INDEX "BiWeeklyHomeworkReview_startDate_idx" ON "BiWeeklyHomeworkReview"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "BiWeeklyHomeworkReview_classSubjectId_startDate_endDate_key" ON "BiWeeklyHomeworkReview"("classSubjectId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "StudentHomeworkReview_studentId_idx" ON "StudentHomeworkReview"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentHomeworkReview_reviewPeriodId_studentId_key" ON "StudentHomeworkReview"("reviewPeriodId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssignment_studentId_assignmentId_key" ON "StudentAssignment"("studentId", "assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TestMark_studentId_testId_key" ON "TestMark"("studentId", "testId");

-- CreateIndex
CREATE INDEX "GuardianCallLog_studentId_reportWeekStart_reportWeekEnd_idx" ON "GuardianCallLog"("studentId", "reportWeekStart", "reportWeekEnd");

-- CreateIndex
CREATE INDEX "ParentTeacherMeetingNote_studentId_meetingDate_idx" ON "ParentTeacherMeetingNote"("studentId", "meetingDate");

-- CreateIndex
CREATE UNIQUE INDEX "PublicSpeechSubmission_studentId_occasionId_key" ON "PublicSpeechSubmission"("studentId", "occasionId");

-- CreateIndex
CREATE INDEX "KnightsCdtpSession_classId_sessionDate_idx" ON "KnightsCdtpSession"("classId", "sessionDate");

-- CreateIndex
CREATE INDEX "KnightsCdtpSession_schoolId_idx" ON "KnightsCdtpSession"("schoolId");

-- CreateIndex
CREATE INDEX "KnightsCdtpSession_branchId_idx" ON "KnightsCdtpSession"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "SemesterResult_studentId_classSubjectId_semester_key" ON "SemesterResult"("studentId", "classSubjectId", "semester");

-- CreateIndex
CREATE INDEX "SemesterExamSchedule_classId_idx" ON "SemesterExamSchedule"("classId");

-- CreateIndex
CREATE INDEX "SemesterExamSchedule_semester_idx" ON "SemesterExamSchedule"("semester");

-- CreateIndex
CREATE UNIQUE INDEX "SemesterExamSchedule_classSubjectId_semester_key" ON "SemesterExamSchedule"("classSubjectId", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "Department_slug_key" ON "Department"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_department_idx" ON "User"("department");

-- CreateIndex
CREATE UNIQUE INDEX "BoardExam_classSubjectId_title_key" ON "BoardExam"("classSubjectId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "BoardExamResult_studentId_boardExamId_key" ON "BoardExamResult"("studentId", "boardExamId");

-- CreateIndex
CREATE INDEX "RoleDuty_role_idx" ON "RoleDuty"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RoleDuty_role_description_key" ON "RoleDuty"("role", "description");

-- CreateIndex
CREATE INDEX "DutyAssignment_userId_idx" ON "DutyAssignment"("userId");

-- CreateIndex
CREATE INDEX "DutyAssignment_roleDutyId_idx" ON "DutyAssignment"("roleDutyId");

-- CreateIndex
CREATE INDEX "DutyAssignment_classId_idx" ON "DutyAssignment"("classId");

-- CreateIndex
CREATE INDEX "DutyAssignment_branchId_idx" ON "DutyAssignment"("branchId");

-- CreateIndex
CREATE INDEX "BranchRoleAssignment_userId_idx" ON "BranchRoleAssignment"("userId");

-- CreateIndex
CREATE INDEX "BranchRoleAssignment_branchId_idx" ON "BranchRoleAssignment"("branchId");

-- CreateIndex
CREATE INDEX "BranchRoleAssignment_role_idx" ON "BranchRoleAssignment"("role");

-- CreateIndex
CREATE UNIQUE INDEX "BranchRoleAssignment_branchId_role_key" ON "BranchRoleAssignment"("branchId", "role");

-- CreateIndex
CREATE INDEX "SportsEvent_classId_idx" ON "SportsEvent"("classId");

-- CreateIndex
CREATE INDEX "SportsEvent_branchId_idx" ON "SportsEvent"("branchId");

-- CreateIndex
CREATE INDEX "SportsEvent_schoolId_idx" ON "SportsEvent"("schoolId");

-- CreateIndex
CREATE INDEX "SportsEvent_managerId_idx" ON "SportsEvent"("managerId");

-- CreateIndex
CREATE INDEX "TeacherSubjectAssignment_teacherId_idx" ON "TeacherSubjectAssignment"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherSubjectAssignment_subjectId_idx" ON "TeacherSubjectAssignment"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubjectAssignment_teacherId_subjectId_key" ON "TeacherSubjectAssignment"("teacherId", "subjectId");

-- CreateIndex
CREATE INDEX "TeacherCompanyExperience_userId_idx" ON "TeacherCompanyExperience"("userId");

-- CreateIndex
CREATE INDEX "TeacherCertification_userId_idx" ON "TeacherCertification"("userId");

-- CreateIndex
CREATE INDEX "TeacherProfileSpecializationTag_userId_idx" ON "TeacherProfileSpecializationTag"("userId");

-- CreateIndex
CREATE INDEX "TeacherProfileSpecializationTag_tagId_idx" ON "TeacherProfileSpecializationTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecializationTag_name_key" ON "SpecializationTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SpecializationTag_slug_key" ON "SpecializationTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_userId_key" ON "JobApplication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FleetVehicle_registrationNumber_key" ON "FleetVehicle"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FleetVehicle_chassisNumber_key" ON "FleetVehicle"("chassisNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FleetVehicle_engineNumber_key" ON "FleetVehicle"("engineNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FleetVehicle_vinNumber_key" ON "FleetVehicle"("vinNumber");

-- CreateIndex
CREATE INDEX "User_roles_links_fk" ON "User_roles_links"("user_id");

-- CreateIndex
CREATE INDEX "User_roles_links_inv_fk" ON "User_roles_links"("role_id");

-- CreateIndex
CREATE INDEX "User_roles_links_order_fk" ON "User_roles_links"("role_order");

-- CreateIndex
CREATE INDEX "User_roles_links_order_inv_fk" ON "User_roles_links"("user_order");

-- CreateIndex
CREATE UNIQUE INDEX "User_roles_links_unique" ON "User_roles_links"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_logistics_vehicles_vehicle_id_unique" ON "fleet_logistics_vehicles"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_reports_collections_hr_report_id_unique" ON "hr_reports_collections"("hr_report_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_logs_payment_id_unique" ON "payment_logs"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "RecordFeatureGroup_slug_key" ON "RecordFeatureGroup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RecordFeatureMapping_featureId_serviceId_key" ON "RecordFeatureMapping"("featureId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceReview_userId_requestId_key" ON "ServiceReview"("userId", "requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_email_key" ON "Guardian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeTopic_slug_key" ON "KnowledgeTopic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteHomePageNavbar_slug_key" ON "SiteHomePageNavbar"("slug");

-- CreateIndex
CREATE INDEX "_SchoolClassToTest_B_index" ON "_SchoolClassToTest"("B");

-- CreateIndex
CREATE INDEX "_AdmissionTestBranch_B_index" ON "_AdmissionTestBranch"("B");

-- CreateIndex
CREATE INDEX "_StudentToTest_B_index" ON "_StudentToTest"("B");

-- CreateIndex
CREATE INDEX "_AssignmentToSchoolClass_B_index" ON "_AssignmentToSchoolClass"("B");

-- CreateIndex
CREATE INDEX "_AssignmentToStudent_B_index" ON "_AssignmentToStudent"("B");

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_parentCenterId_fkey" FOREIGN KEY ("parentCenterId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolBranch" ADD CONSTRAINT "SchoolBranch_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectBook" ADD CONSTRAINT "SubjectBook_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassLifeSystemInstruction" ADD CONSTRAINT "ClassLifeSystemInstruction_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassFoodInstruction" ADD CONSTRAINT "ClassFoodInstruction_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionTest" ADD CONSTRAINT "AdmissionTest_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubjectSyllabus" ADD CONSTRAINT "TestSubjectSyllabus_testId_fkey" FOREIGN KEY ("testId") REFERENCES "AdmissionTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionTestApplication" ADD CONSTRAINT "AdmissionTestApplication_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionTestApplication" ADD CONSTRAINT "AdmissionTestApplication_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionTestApplication" ADD CONSTRAINT "AdmissionTestApplication_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "AdmissionTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionTestApplication" ADD CONSTRAINT "AdmissionTestApplication_feeSchemeId_fkey" FOREIGN KEY ("feeSchemeId") REFERENCES "FeeScheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionTestApplication" ADD CONSTRAINT "AdmissionTestApplication_seatRoomId_fkey" FOREIGN KEY ("seatRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionTestApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_feeSchemeId_fkey" FOREIGN KEY ("feeSchemeId") REFERENCES "FeeScheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionFeeTransaction" ADD CONSTRAINT "AdmissionFeeTransaction_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionFeeTransaction" ADD CONSTRAINT "AdmissionFeeTransaction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeScheme" ADD CONSTRAINT "FeeScheme_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBehaviourLog" ADD CONSTRAINT "StudentBehaviourLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBehaviourLog" ADD CONSTRAINT "StudentBehaviourLog_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBehaviourLog" ADD CONSTRAINT "StudentBehaviourLog_punishmentId_fkey" FOREIGN KEY ("punishmentId") REFERENCES "Punishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyFee" ADD CONSTRAINT "MonthlyFee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyFee" ADD CONSTRAINT "MonthlyFee_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyFeePayment" ADD CONSTRAINT "MonthlyFeePayment_monthlyFeeId_fkey" FOREIGN KEY ("monthlyFeeId") REFERENCES "MonthlyFee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_finalAdmissionId_fkey" FOREIGN KEY ("finalAdmissionId") REFERENCES "Admission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_feeSchemeId_fkey" FOREIGN KEY ("feeSchemeId") REFERENCES "FeeScheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovementSuggestion" ADD CONSTRAINT "ImprovementSuggestion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerOathAssignment" ADD CONSTRAINT "PrayerOathAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerOathAssignment" ADD CONSTRAINT "PrayerOathAssignment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerOathAssignment" ADD CONSTRAINT "PrayerOathAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusScheduleDailyPlan" ADD CONSTRAINT "SyllabusScheduleDailyPlan_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusScheduleDailyPlan" ADD CONSTRAINT "SyllabusScheduleDailyPlan_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "SubjectSyllabus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiWeeklyHomeworkReview" ADD CONSTRAINT "BiWeeklyHomeworkReview_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiWeeklyHomeworkReview" ADD CONSTRAINT "BiWeeklyHomeworkReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentHomeworkReview" ADD CONSTRAINT "StudentHomeworkReview_reviewPeriodId_fkey" FOREIGN KEY ("reviewPeriodId") REFERENCES "BiWeeklyHomeworkReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentHomeworkReview" ADD CONSTRAINT "StudentHomeworkReview_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssignment" ADD CONSTRAINT "StudentAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssignment" ADD CONSTRAINT "StudentAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestMark" ADD CONSTRAINT "TestMark_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestMark" ADD CONSTRAINT "TestMark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianCommunicationLog" ADD CONSTRAINT "GuardianCommunicationLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianCommunicationLog" ADD CONSTRAINT "GuardianCommunicationLog_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianCallLog" ADD CONSTRAINT "GuardianCallLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianCallLog" ADD CONSTRAINT "GuardianCallLog_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentTeacherMeetingNote" ADD CONSTRAINT "ParentTeacherMeetingNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentTeacherMeetingNote" ADD CONSTRAINT "ParentTeacherMeetingNote_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSpeechSubmission" ADD CONSTRAINT "PublicSpeechSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSpeechSubmission" ADD CONSTRAINT "PublicSpeechSubmission_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "PublicSpeakingOccasion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytic" ADD CONSTRAINT "Analytic_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterResult" ADD CONSTRAINT "SemesterResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterResult" ADD CONSTRAINT "SemesterResult_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterExamSchedule" ADD CONSTRAINT "SemesterExamSchedule_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSyllabus" ADD CONSTRAINT "SubjectSyllabus_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BoardExam" ADD CONSTRAINT "BoardExam_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardExamResult" ADD CONSTRAINT "BoardExamResult_boardExamId_fkey" FOREIGN KEY ("boardExamId") REFERENCES "BoardExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardExamResult" ADD CONSTRAINT "BoardExamResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyAssignment" ADD CONSTRAINT "DutyAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyAssignment" ADD CONSTRAINT "DutyAssignment_roleDutyId_fkey" FOREIGN KEY ("roleDutyId") REFERENCES "RoleDuty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyAssignment" ADD CONSTRAINT "DutyAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchRoleAssignment" ADD CONSTRAINT "BranchRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchRoleAssignment" ADD CONSTRAINT "BranchRoleAssignment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsEvent" ADD CONSTRAINT "SportsEvent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsEvent" ADD CONSTRAINT "SportsEvent_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsEvent" ADD CONSTRAINT "SportsEvent_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubjectAssignment" ADD CONSTRAINT "TeacherSubjectAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubjectAssignment" ADD CONSTRAINT "TeacherSubjectAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCompanyExperience" ADD CONSTRAINT "TeacherCompanyExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCertification" ADD CONSTRAINT "TeacherCertification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfileSpecializationTag" ADD CONSTRAINT "TeacherProfileSpecializationTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfileSpecializationTag" ADD CONSTRAINT "TeacherProfileSpecializationTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "SpecializationTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetVehicle" ADD CONSTRAINT "FleetVehicle_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetVehicle" ADD CONSTRAINT "FleetVehicle_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "Depot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDocument" ADD CONSTRAINT "VehicleDocument_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "FleetVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "FleetVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries_employee_id_links" ADD CONSTRAINT "employee_salaries_employee_id_links_fk" FOREIGN KEY ("employee_salary_id") REFERENCES "employee_salaries"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_salaries_employee_id_links" ADD CONSTRAINT "employee_salaries_employee_id_links_user_fk" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_night_shift_attendance_logs" ADD CONSTRAINT "employee_night_shift_attendance_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_attendance_logs" ADD CONSTRAINT "employee_attendance_logs_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_attendance_logs" ADD CONSTRAINT "employee_attendance_logs_updated_by_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_attendance_logs" ADD CONSTRAINT "employee_attendance_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries_attendance_logs_links" ADD CONSTRAINT "employee_salaries_attendance_logs_links_fk" FOREIGN KEY ("employee_salary_id") REFERENCES "employee_salaries"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_salaries_attendance_logs_links" ADD CONSTRAINT "employee_salaries_attendance_logs_links_inv_fk" FOREIGN KEY ("employee_attendance_log_id") REFERENCES "employee_attendance_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_attendance_logs_user_links" ADD CONSTRAINT "employee_attendance_logs_user_links_fk" FOREIGN KEY ("employee_attendance_log_id") REFERENCES "employee_attendance_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_updated_by_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "salary_paid_logs" ADD CONSTRAINT "salary_paid_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_paid_logs" ADD CONSTRAINT "salary_paid_logs_salary_id_fkey" FOREIGN KEY ("salary_id") REFERENCES "employee_salaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_paid_logs" ADD CONSTRAINT "salary_paid_logs_paid_by_user_id_fkey" FOREIGN KEY ("paid_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "files_folder_links" ADD CONSTRAINT "files_folder_links_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "files_folder_links" ADD CONSTRAINT "files_folder_links_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "upload_folders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fleet_logistics_vehicles" ADD CONSTRAINT "fleet_logistics_vehicles_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fleet_logistics_vehicles" ADD CONSTRAINT "fleet_logistics_vehicles_updated_by_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hr_reports_collections" ADD CONSTRAINT "hr_reports_collections_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hr_reports_collections" ADD CONSTRAINT "hr_reports_collections_updated_by_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "i18n_locale" ADD CONSTRAINT "i18n_locale_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "i18n_locale" ADD CONSTRAINT "i18n_locale_updated_by_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_updated_by_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_logs_employee_salary_links" ADD CONSTRAINT "payment_logs_employee_salary_links_fk" FOREIGN KEY ("payment_log_id") REFERENCES "payment_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_logs_employee_salary_links" ADD CONSTRAINT "payment_logs_employee_salary_links_inv_fk" FOREIGN KEY ("employee_salary_id") REFERENCES "employee_salaries"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_logs_users_permissions_user_links" ADD CONSTRAINT "payment_logs_users_permissions_user_links_fk" FOREIGN KEY ("payment_log_id") REFERENCES "payment_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OperatingHours" ADD CONSTRAINT "OperatingHours_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordFeatureMapping" ADD CONSTRAINT "RecordFeatureMapping_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "RecordFeatureGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceReview" ADD CONSTRAINT "ServiceReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianPaymentProfile" ADD CONSTRAINT "GuardianPaymentProfile_GuardianId_fkey" FOREIGN KEY ("GuardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_GuardianId_fkey" FOREIGN KEY ("GuardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_GuardianId_fkey" FOREIGN KEY ("GuardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_GuardianId_fkey" FOREIGN KEY ("GuardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_GuardianId_fkey" FOREIGN KEY ("GuardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamLeadId_fkey" FOREIGN KEY ("teamLeadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_GuardianId_fkey" FOREIGN KEY ("GuardianId") REFERENCES "Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolEnquiry" ADD CONSTRAINT "SchoolEnquiry_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolClassToTest" ADD CONSTRAINT "_SchoolClassToTest_A_fkey" FOREIGN KEY ("A") REFERENCES "SchoolClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolClassToTest" ADD CONSTRAINT "_SchoolClassToTest_B_fkey" FOREIGN KEY ("B") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdmissionTestBranch" ADD CONSTRAINT "_AdmissionTestBranch_A_fkey" FOREIGN KEY ("A") REFERENCES "AdmissionTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdmissionTestBranch" ADD CONSTRAINT "_AdmissionTestBranch_B_fkey" FOREIGN KEY ("B") REFERENCES "SchoolBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToTest" ADD CONSTRAINT "_StudentToTest_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToTest" ADD CONSTRAINT "_StudentToTest_B_fkey" FOREIGN KEY ("B") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToSchoolClass" ADD CONSTRAINT "_AssignmentToSchoolClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToSchoolClass" ADD CONSTRAINT "_AssignmentToSchoolClass_B_fkey" FOREIGN KEY ("B") REFERENCES "SchoolClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToStudent" ADD CONSTRAINT "_AssignmentToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToStudent" ADD CONSTRAINT "_AssignmentToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
