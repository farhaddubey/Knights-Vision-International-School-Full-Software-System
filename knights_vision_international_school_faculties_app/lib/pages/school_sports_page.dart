import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CompetitionsSportsPage extends StatefulWidget {
  const CompetitionsSportsPage({super.key});

  @override
  _CompetitionsSportsPageState createState() => _CompetitionsSportsPageState();
}

class _CompetitionsSportsPageState extends State<CompetitionsSportsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedLanguage = 'English';

  final List<String> languages = ['English', 'Bengali', 'Hindi'];

  final Map<String, List<Map<String, dynamic>>> translations = {
    'English': [
      {
        'label': 'Academic & Intellectual',
        'color': const Color(0xFF00c853),
        'subsections': [
          {
            'title': 'School Logo & Vision Speech',
            'content': [
              'Eligibility: Classes VI–XII (Individual)',
              'How: Record 1–2 min speech on school logo, values & vision; post on LinkedIn/FB.',
              'Example: “Our logo shows the Book of Knowledge… I am proud to be a Knight…”',
              'Timeline: Practice (Sem 1) → Refine (Sem 2) → Upload & Judge (Sem 3).',
              'Nomination: 3–5 best per class → final upload.',
              'Award: Top 10 (Gold, Silver, Bronze, + Excellence Certificates).',
              'Rule: School uniform (tie & ID) mandatory.'
            ]
          },
          {
            'title': 'Self-Intro Challenge',
            'content': [
              'Eligibility: LKG–XII (All classes).',
              'How: Short 30s–1min intro video (name, dream, school pride).',
              'Timeline: English period practice (Sem 1) → Record & Submit (Sem 2–3).',
              'Nomination: Top 5 per class selected by teacher.',
              'Award: Top 10 overall.'
            ]
          },
          {
            'title': 'English Challenge',
            'content': [
              'Eligibility: All classes, levels adjusted.',
              'Events: Spell Bee, Extempore, Essay Writing, Reading Marathon, Debate.',
              'Timeline: Word banks & prep (Sem 1) → Mock rounds (Sem 2) → Final (Sem 3).',
              'Nomination: Teams A–J (100 students split in 10 groups).',
              'Award: Gold, Silver, Bronze team + top 3 individuals.'
            ]
          },
          {
            'title': 'Math Challenge',
            'content': [
              'Eligibility: All classes.',
              'Events: Quick Calcs, Sudoku, Puzzle Race, Real-Life Math Apps.',
              'Timeline: Same as English Challenge.',
              'Nomination: Teachers assign team reps A–J.',
              'Award: Gold, Silver, Bronze team + top 3 individuals.'
            ]
          },
          {
            'title': 'Essay Writing – “Discipline is the Bridge to Success”',
            'content': [
              'Eligibility: VI–XII.',
              'How: 300–500 words, English or regional language.',
              'Timeline: Sem 2 submission → Sem 3 results.',
              'Nomination: Teacher shortlists.',
              'Award: Top 3 winners.'
            ]
          },
          {
            'title': 'Digital Art – “Future School in 2050”',
            'content': [
              'Eligibility: VI–XII.',
              'How: Use Paint, Canva, Photoshop, or free apps.',
              'Example: Floating schools, AI teachers.',
              'Timeline: Practice in labs (Sem 1–2) → Submit (Sem 3).',
              'Award: Top 3 per class.'
            ]
          }
        ]
      },
      {
        'label': 'Creative & Literary',
        'color': const Color(0xFF26a69a),
        'subsections': [
          {
            'title': 'Poster Making – “Sports & Education Together”',
            'content': [
              'Eligibility: LKG–XII (by class levels).',
              'How: Draw/paint poster linking sports & education.',
              'Timeline: Sem 2 activity → Display/judging (Sem 3 Fest).',
              'Participation: 1 entry per student.',
              'Award: Top 3 per group (Primary, Middle, Senior).'
            ]
          },
          {
            'title': 'Storytelling & Recitation',
            'content': [
              'Eligibility: LKG–VIII.',
              'How: Recite poem/story with expression.',
              'Timeline: Sem 2 selection → Sem 3 finals.',
              'Award: Top 3 per category.'
            ]
          }
        ]
      },
      {
        'label': 'Sports & Physical Fitness',
        'color': const Color(0xFFffa000),
        'subsections': [
          {
            'title': 'Track & Field Events',
            'content': [
              'LKG–III: 30m dash, spoon race, sack race.',
              'IV–VIII: 100m, 200m, long jump, relay.',
              'IX–XII: 400m, 800m, shot put, discus, tug of war.',
              'Award: Top 3 medals per event.'
            ]
          },
          {
            'title': 'Team Games',
            'content': [
              'Primary (LKG–V): Kho-Kho, Throwball, Dodgeball.',
              'Middle (VI–VIII): Cricket (mini), Volleyball, Football (5-a-side).',
              'Senior (IX–XII): Basketball, Handball, Badminton.',
              'Award: Gold, Silver, Bronze team.'
            ]
          },
          {
            'title': 'Fun Games',
            'content': [
              'Events: Obstacle Run, Musical Chair, Balance Race.',
              'Award: Certificates + medals for winners.'
            ]
          }
        ]
      },
      {
        'label': 'Performing Arts',
        'color': const Color(0xFFab47bc),
        'subsections': [
          {
            'title': 'School Anthem Performance',
            'content': [
              'Eligibility: All classes (group/solo).',
              'How: Singing, instrumental, creative renditions.',
              'Timeline: Practice (Sem 1–2) → Finals (Annual Fest, Sem 3).',
              'Nomination: Shortlisted by Music Teacher.',
              'Award: Top 3 teams (min 6 students).'
            ]
          },
          {
            'title': 'Singing',
            'content': [
              'Eligibility: All classes.',
              'How: Solo, Group, Folk, Classical, Patriotic, Modern.',
              'Timeline: Practice (Sem 1) → Rehearsals (Sem 2) → Finals (Sem 3 Fest).',
              'Award: Gold, Silver, Bronze per sub-event.'
            ]
          },
          {
            'title': 'Dance',
            'content': [
              'Eligibility: All classes.',
              'How: Solo Classical, Folk, Fusion, Group.',
              'Timeline: Practice (Sem 1) → Rehearsals (Sem 2) → Finals (Sem 3 Fest).',
              'Award: Gold, Silver, Bronze per sub-event.'
            ]
          },
          {
            'title': 'Drama / Skit',
            'content': [
              'Eligibility: All classes.',
              'How: Social message, historical, comedy.',
              'Timeline: Practice (Sem 1) → Rehearsals (Sem 2) → Finals (Sem 3 Fest).',
              'Award: Gold, Silver, Bronze per sub-event.'
            ]
          }
        ]
      },
      {
        'label': '21st Century Skills & Innovation',
        'color': const Color(0xFFef5350),
        'subsections': [
          {
            'title': 'Innovation Fair – “Young Inventors”',
            'content': [
              'Eligibility: VI–XII.',
              'How: Exhibit models/projects (science, tech, environment).',
              'Award: Top 3 innovations.'
            ]
          },
          {
            'title': 'Debate & Extempore (Social Topics)',
            'content': [
              'Eligibility: VI–XII.',
              'How: Random topic; 2 min prep; 2–3 min speech.',
              'Award: Top 3.'
            ]
          },
          {
            'title': 'Quiz Competitions',
            'content': [
              'Eligibility: All classes (by level).',
              'Topics: GK, Science, Sports, Current Affairs.',
              'Award: Team Gold, Silver, Bronze.'
            ]
          },
          {
            'title': 'Role Play / Mock Parliament',
            'content': [
              'Eligibility: VI–XII.',
              'How: Students enact leaders, scientists, parliamentarians.',
              'Award: Top 3.'
            ]
          }
        ]
      },
      {
        'label': 'Recognition & Excellence',
        'color': const Color(0xFF00c853),
        'subsections': [
          {
            'title': 'Academic Excellence Award',
            'content': [
              'Eligibility: Students with 90%+ in Annual Exams.',
              'How: No competition – direct recognition.',
              'Award: Large Gold Medal + Certificate.',
              'Timeline: After Final Exams (Sem 3).'
            ]
          }
        ]
      },
      {
        'label': 'Religion & Humanism',
        'color': const Color(0xFF26a69a),
        'subsections': [
          {
            'title': 'Humanism Through Religion Challenge',
            'content': [
              'Eligibility: VI–XII (Individual).',
              'How: Explain Humanism through any religion (Hinduism, Islam, Christianity, Sikhism, Buddhism, Jainism, etc.) in speech, essay, or creative format.',
              'Timeline: Research guidance in moral science classes (Sem 1) → Mock presentations & practice (Sem 2) → Final round (Sem 3).',
              'Award: Only Top 10 Winners.',
              'Objective: Promote interfaith respect, tolerance, and the value of humanity.',
              'Rule: Strictly positive, inclusive, and non-controversial explanations only.'
            ]
          }
        ]
      },
      {
        'label': 'Cultural Identity & Social Awareness',
        'color': const Color(0xFFffa000),
        'subsections': [
          {
            'title': 'Uniform Importance Video',
            'content': [
              'Eligibility: VI–XII.',
              'How: Create a short video explaining the importance of school uniform.',
              'Timeline: Practice (Sem 1–2) → Submit (Sem 3).',
              'Award: Top 3 per class.'
            ]
          },
          {
            'title': 'National Festivals',
            'content': [
              'Eligibility: All classes.',
              'How: Performances or projects on national festivals.',
              'Timeline: Sem 2 preparation → Sem 3 showcase.',
              'Award: Top 3 per group.'
            ]
          },
          {
            'title': 'Environmental Projects',
            'content': [
              'Eligibility: All classes.',
              'How: Projects on sustainability, recycling, or green initiatives.',
              'Timeline: Sem 1–2 planning → Sem 3 presentation.',
              'Award: Top 3 projects.'
            ]
          },
          {
            'title': 'Social Service Challenge',
            'content': [
              'Eligibility: VI–XII.',
              'How: Participate in community service activities and document impact.',
              'Timeline: Sem 1–2 activities → Sem 3 report.',
              'Award: Top 3 teams.'
            ]
          }
        ]
      }
    ],
    'Bengali': [
      {
        'label': 'শিক্ষাগত ও বুদ্ধিবৃত্তিক চ্যালেঞ্জ',
        'color': const Color(0xFF00c853),
        'subsections': [
          {
            'title': 'স্কুল লোগো ও ভিশন বক্তৃতা',
            'content': [
              'যোগ্যতা: ষষ্ঠ থেকে দ্বাদশ শ্রেণি (ব্যক্তিগত)',
              'কীভাবে: স্কুল লোগো, মূল্যবোধ ও ভিশন নিয়ে ১-২ মিনিটের বক্তৃতা রেকর্ড করুন; লিঙ্কডইন/ফেসবুকে পোস্ট করুন।',
              'উদাহরণ: "আমাদের লোগো জ্ঞানের বই দেখায়… আমি একজন নাইট হতে গর্বিত…"',
              'সময়সীমা: অনুশীলন (১ম সেম) → পরিমার্জন (২য় সেম) → আপলোড ও বিচার (৩য় সেম)।',
              'মনোনয়ন: প্রতি শ্রেণিতে ৩-৫ জন সেরা → চূড়ান্ত আপলোড।',
              'পুরস্কার: শীর্ষ ১০ (স্বর্ণ, রৌপ্য, ব্রোঞ্জ + শ্রেষ্ঠত্ব সার্টিফিকেট)।',
              'নিয়ম: স্কুল ইউনিফর্ম (টাই ও আইডি) বাধ্যতামূলক।'
            ]
          },
          {
            'title': 'স্ব-পরিচয় চ্যালেঞ্জ',
            'content': [
              'যোগ্যতা: এলকেজি-দ্বাদশ (সকল শ্রেণি)।',
              'কীভাবে: ৩০ সেকেন্ড-১ মিনিটের ভিডিও (নাম, স্বপ্ন, স্কুল গৌরব)।',
              'সময়সীমা: ইংরেজি ক্লাসে অনুশীলন (১ম সেম) → রেকর্ড ও জমা (২য়-৩য় সেম)।',
              'মনোনয়ন: শিক্ষক দ্বারা প্রতি শ্রেণিতে শীর্ষ ৫ জন নির্বাচিত।',
              'পুরস্কার: সামগ্রিক শীর্ষ ১০।'
            ]
          },
          {
            'title': 'ইংরেজি চ্যালেঞ্জ',
            'content': [
              'যোগ্যতা: সকল শ্রেণি, স্তর অনুযায়ী।',
              'ইভেন্ট: বানান প্রতিযোগিতা, তাৎক্ষণিক বক্তৃতা, প্রবন্ধ রচনা, পঠন ম্যারাথন, বিতর্ক।',
              'সময়সীমা: শব্দ তালিকা ও প্রস্তুতি (১ম সেম) → মক রাউন্ড (২য় সেম) → চূড়ান্ত (৩য় সেম)।',
              'মনোনয়ন: দল A-J (১০০ জন ছাত্র ১০টি গ্রুপে বিভক্ত)।',
              'পুরস্কার: স্বর্ণ, রৌপ্য, ব্রোঞ্জ দল + শীর্ষ ৩ জন ব্যক্তি।'
            ]
          },
          {
            'title': 'গণিত চ্যালেঞ্জ',
            'content': [
              'যোগ্যতা: সকল শ্রেণি।',
              'ইভেন্ট: দ্রুত গণনা, সুডোকু, পাজল রেস, বাস্তব জীবনের গণিত অ্যাপ্লিকেশন।',
              'সময়সীমা: ইংরেজি চ্যালেঞ্জের মতো।',
              'মনোনয়ন: শিক্ষকরা দলের প্রতিনিধি A-J নিয়োগ করেন।',
              'পুরস্কার: স্বর্ণ, রৌপ্য, ব্রোঞ্জ দল + শীর্ষ ৩ জন ব্যক্তি।'
            ]
          },
          {
            'title': 'প্রবন্ধ রচনা – "শৃঙ্খলা সাফল্যের সেতু"',
            'content': [
              'যোগ্যতা: ষষ্ঠ-দ্বাদশ।',
              'কীভাবে: ৩০০-৫০০ শব্দ, ইংরেজি বা আঞ্চলিক ভাষায়।',
              'সময়সীমা: ২য় সেম জমা → ৩য় সেম ফলাফল।',
              'মনোনয়ন: শিক্ষক শর্টলিস্ট করেন।',
              'পুরস্কার: শীর্ষ ৩ বিজয়ী।'
            ]
          },
          {
            'title': 'ডিজিটাল আর্ট – "২০৫০ সালে ভবিষ্যতের স্কুল"',
            'content': [
              'যোগ্যতা: ষষ্ঠ-দ্বাদশ।',
              'কীভাবে: পেইন্ট, ক্যানভা, ফটোশপ বা বিনামূল্যের অ্যাপ ব্যবহার।',
              'উদাহরণ: ভাসমান স্কুল, এআই শিক্ষক।',
              'সময়সীমা: ল্যাবে অনুশীলন (১ম-২য় সেম) → জমা (৩য় সেম)।',
              'পুরস্কার: প্রতি শ্রেণিতে শীর্ষ ৩।'
            ]
          }
        ]
      },
      {
        'label': 'সৃজনশীল ও সাহিত্যিক',
        'color': const Color(0xFF26a69a),
        'subsections': [
          {
            'title': 'পোস্টার তৈরি – "ক্রীড়া ও শিক্ষা একসাথে"',
            'content': [
              'যোগ্যতা: এলকেজি-দ্বাদশ (শ্রেণি স্তর অনুযায়ী)।',
              'কীভাবে: ক্রীড়া ও শিক্ষার সংযোগে পোস্টার আঁকুন/রঙ করুন।',
              'সময়সীমা: ২য় সেম কার্যক্রম → প্রদর্শন/বিচার (৩য় সেম উৎসব)।',
              'অংশগ্রহণ: প্রতি ছাত্রের ১টি এন্ট্রি।',
              'পুরস্কার: প্রাথমিক, মাধ্যমিক, সিনিয়র গ্রুপে শীর্ষ ৩।'
            ]
          },
          {
            'title': 'গল্প বলা ও আবৃত্তি',
            'content': [
              'যোগ্যতা: এলকেজি-অষ্টম।',
              'কীভাবে: অভিব্যক্তি সহ কবিতা/গল্প আবৃত্তি।',
              'সময়সীমা: ২য় সেম নির্বাচন → ৩য় সেম ফাইনাল।',
              'পুরস্কার: প্রতি বিভাগে শীর্ষ ৩।'
            ]
          }
        ]
      },
      {
        'label': 'ক্রীড়া ও শারীরিক সুস্থতা',
        'color': const Color(0xFFffa000),
        'subsections': [
          {
            'title': 'ট্র্যাক ও ফিল্ড ইভেন্ট',
            'content': [
              'এলকেজি-তৃতীয়: ৩০ মিটার দৌড়, চামচ দৌড়, বস্তা দৌড়।',
              'চতুর্থ-অষ্টম: ১০০ মিটার, ২০০ মিটার, লম্বা লাফ, রিলে।',
              'নবম-দ্বাদশ: ৪০০ মিটার, ৮০০ মিটার, শট পুট, ডিসকাস, টাগ অফ ওয়ার।',
              'পুরস্কার: প্রতি ইভেন্টে শীর্ষ ৩ পদক।'
            ]
          },
          {
            'title': 'দলীয় খেলা',
            'content': [
              'প্রাথমিক (এলকেজি-পঞ্চম): খো-খো, থ্রোবল, ডজবল।',
              'মাধ্যমিক (ষষ্ঠ-অষ্টম): ক্রিকেট (মিনি), ভলিবল, ফুটবল (৫-এ-সাইড)।',
              'সিনিয়র (নবম-দ্বাদশ): বাস্কেটবল, হ্যান্ডবল, ব্যাডমিন্টন।',
              'পুরস্কার: স্বর্ণ, রৌপ্য, ব্রোঞ্জ দল।'
            ]
          },
          {
            'title': 'মজার খেলা',
            'content': [
              'ইভেন্ট: বাধা দৌড়, মিউজিক্যাল চেয়ার, ভারসাম্য দৌড়।',
              'পুরস্কার: সার্টিফিকেট + বিজয়ীদের জন্য পদক।'
            ]
          }
        ]
      },
      {
        'label': 'প্রদর্শনী শিল্প',
        'color': const Color(0xFFab47bc),
        'subsections': [
          {
            'title': 'স্কুল সঙ্গীত পরিবেশন',
            'content': [
              'যোগ্যতা: সকল শ্রেণি (দল/একক)।',
              'কীভাবে: গান, বাদ্যযন্ত্র, সৃজনশীল পরিবেশন।',
              'সময়সীমা: অনুশীলন (১ম-২য় সেম) → ফাইনাল (বার্ষিক উৎসব, ৩য় সেম)।',
              'মনোনয়ন: সঙ্গীত শিক্ষক দ্বারা শর্টলিস্ট।',
              'পুরস্কার: শীর্ষ ৩ দল (ন্যূনতম ৬ জন ছাত্র)।'
            ]
          },
          {
            'title': 'গান',
            'content': [
              'যোগ্যতা: সকল শ্রেণি।',
              'কীভাবে: একক, দল, লোকসঙ্গীত, শাস্ত্রীয়, দেশাত্মবোধক, আধুনিক।',
              'সময়সীমা: অনুশীলন (১ম সেম) → রিহার্সাল (২য় সেম) → ফাইনাল (৩য় সেম উৎসব)।',
              'পুরস্কার: প্রতি উপ-ইভেন্টে স্বর্ণ, রৌপ্য, ব্রোঞ্জ।'
            ]
          },
          {
            'title': 'নৃত্য',
            'content': [
              'যোগ্যতা: সকল শ্রেণি।',
              'কীভাবে: একক শাস্ত্রীয়, লোকনৃত্য, ফিউশন, দলীয়।',
              'সময়সীমা: অনুশীলন (১ম সেম) → রিহার্সাল (২য় সেম) → ফাইনাল (৩য় সেম উৎসব)।',
              'পুরস্কার: প্রতি উপ-ইভেন্টে স্বর্ণ, রৌপ্য, ব্রোঞ্জ।'
            ]
          },
          {
            'title': 'নাটক / স্কিট',
            'content': [
              'যোগ্যতা: সকল শ্রেণি।',
              'কীভাবে: সামাজিক বার্তা, ঐতিহাসিক, কমেডি।',
              'সময়সীমা: অনুশীলন (১ম সেম) → রিহার্সাল (২য় সেম) → ফাইনাল (৩য় সেম উৎসব)।',
              'পুরস্কার: প্রতি উপ-ইভেন্টে স্বর্ণ, রৌপ্য, ব্রোঞ্জ।'
            ]
          }
        ]
      },
      {
        'label': '২১শ শতাব্দীর দক্ষতা ও উদ্ভাবন',
        'color': const Color(0xFFef5350),
        'subsections': [
          {
            'title': 'উদ্ভাবন মেলা – "তরুণ উদ্ভাবক"',
            'content': [
              'যোগ্যতা: ষষ্ঠ-দ্বাদশ।',
              'কীভাবে: বিজ্ঞান, প্রযুক্তি, পরিবেশ বিষয়ে মডেল/প্রকল্প প্রদর্শন।',
              'পুরস্কার: শীর্ষ ৩ উদ্ভাবন।'
            ]
          },
          {
            'title': 'বিতর্ক ও তাৎক্ষণিক বক্তৃতা (সামাজিক বিষয়)',
            'content': [
              'যোগ্যতা: ষষ্ঠ-দ্বাদশ।',
              'কীভাবে: এলোমেলো বিষয়; ২ মিনিট প্রস্তুতি; ২-৩ মিনিট বক্তৃতা।',
              'পুরস্কার: শীর্ষ ৩।'
            ]
          },
          {
            'title': 'কুইজ প্রতিযোগিতা',
            'content': [
              'যোগ্যতা: সকল শ্রেণি (স্তর অনুযায়ী)।',
              'বিষয়: সাধারণ জ্ঞান, বিজ্ঞান, ক্রীড়া, বর্তমান ঘটনা।',
              'পুরস্কার: দলীয় স্বর্ণ, রৌপ্য, ব্রোঞ্জ।'
            ]
          },
          {
            'title': 'রোল প্লে / মক পার্লামেন্ট',
            'content': [
              'যোগ্যতা: ষষ্ঠ-দ্বাদশ।',
              'কীভাবে: ছাত্ররা নেতা, বিজ্ঞানী, সংসদ সদস্যের ভূমিকায় অভিনয় করে।',
              'পুরস্কার: শীর্ষ ৩।'
            ]
          }
        ]
      },
      {
        'label': 'স্বীকৃতি ও শ্রেষ্ঠত্ব',
        'color': const Color(0xFF00c853),
        'subsections': [
          {
            'title': 'শিক্ষাগত শ্রেষ্ঠত্ব পুরস্কার',
            'content': [
              'যোগ্যতা: বার্ষিক পরীক্ষায় ৯০%+ প্রাপ্ত ছাত্র।',
              'কীভাবে: কোনো প্রতিযোগিতা নয় – সরাসরি স্বীকৃতি।',
              'পুরস্কার: বড় স্বর্ণপদক + সার্টিফিকেট।',
              'সময়সীমা: চূড়ান্ত পরীক্ষার পর (৩য় সেম)।'
            ]
          }
        ]
      },
      {
        'label': 'ধর্ম ও মানবতাবাদ',
        'color': const Color(0xFF26a69a),
        'subsections': [
          {
            'title': 'ধর্মের মাধ্যমে মানবতাবাদ চ্যালেঞ্জ',
            'content': [
              'যোগ্যতা: ষষ্ঠ-দ্বাদশ (ব্যক্তিগত)।',
              'কীভাবে: যেকোনো ধর্মের মাধ্যমে মানবতাবাদ ব্যাখ্যা (হিন্দুধর্ম, ইসলাম, খ্রিস্টধর্ম, শিখধর্ম, বৌদ্ধধর্ম, জৈনধর্ম ইত্যাদি) বক্তৃতা, প্রবন্ধ বা সৃজনশীল ফরম্যাটে।',
              'সময়সীমা: নৈতিক বিজ্ঞান ক্লাসে গবেষণা নির্দেশনা (১ম সেম) → মক উপস্থাপনা ও অনুশীলন (২য় সেম) → চূড়ান্ত রাউন্ড (৩য় সেম)।',
              'পুরস্কার: শুধুমাত্র শীর্ষ ১০ বিজয়ী।',
              'উদ্দেশ্য: আন্তঃধর্মীয় সম্মান, সহনশীলতা এবং মানবতার মূল্য প্রচার।',
              'নিয়ম: শুধুমাত্র ইতিবাচক, অন্তর্ভুক্তিমূলক এবং অবিবাদমূলক ব্যাখ্যা।'
            ]
          }
        ]
      },
      {
        'label': 'সাংস্কৃতিক পরিচয় ও সামাজিক সচেতনতা',
        'color': const Color(0xFFffa000),
        'subsections': [
          {
            'title': 'ইউনিফর্মের গুরুত্ব ভিডিও',
            'content': [
              'যোগ্যতা: ষষ্ঠ-দ্বাদশ।',
              'কীভাবে: স্কুল ইউনিফর্মের গুরুত্ব ব্যাখ্যা করে সংক্ষিপ্ত ভিডিও তৈরি।',
              'সময়সীমা: অনুশীলন (১ম-২য় সেম) → জমা (৩য় সেম)।',
              'পুরস্কার: প্রতি শ্রেণিতে শীর্ষ ৩।'
            ]
          },
          {
            'title': 'জাতীয় উৎসব',
            'content': [
              'যোগ্যতা: সকল শ্রেণি।',
              'কীভাবে: জাতীয় উৎসব নিয়ে পারফরম্যান্স বা প্রকল্প।',
              'সময়সীমা: ২য় সেম প্রস্তুতি → ৩য় সেম প্রদর্শন।',
              'পুরস্কার: প্রতি গ্রুপে শীর্ষ ৩।'
            ]
          },
          {
            'title': 'পরিবেশ প্রকল্প',
            'content': [
              'যোগ্যতা: সকল শ্রেণি।',
              'কীভাবে: টেকসই উন্নয়ন, পুনর্ব্যবহার বা সবুজ উদ্যোগে প্রকল্প।',
              'সময়সীমা: ১ম-২য় সেম পরিকল্পনা → ৩য় সেম উপস্থাপন।',
              'পুরস্কার: শীর্ষ ৩ প্রকল্প।'
            ]
          },
          {
            'title': 'সামাজিক সেবা চ্যালেঞ্জ',
            'content': [
              'যোগ্যতা: ষষ্ঠ-দ্বাদশ।',
              'কীভাবে: সম্প্রদায় সেবা কার্যক্রমে অংশগ্রহণ এবং প্রভাব নথিভুক্ত করুন।',
              'সময়সীমা: ১ম-২য় সেম কার্যক্রম → ৩য় সেম রিপোর্ট।',
              'পুরস্কার: শীর্ষ ৩ দল।'
            ]
          }
        ]
      }
    ],
    'Hindi': [
      {
        'label': 'शैक्षिक और बौद्धिक चुनौतियाँ',
        'color': const Color(0xFF00c853),
        'subsections': [
          {
            'title': 'स्कूल लोगो और विजन भाषण',
            'content': [
              'पात्रता: कक्षा VI–XII (व्यक्तिगत)',
              'कैसे: स्कूल लोगो, मूल्यों और विजन पर 1-2 मिनट का भाषण रिकॉर्ड करें; लिंक्डइन/फेसबुक पर पोस्ट करें।',
              'उदाहरण: "हमारा लोगो ज्ञान की पुस्तक दर्शाता है… मुझे नाइट होने पर गर्व है…"',
              'समयरेखा: अभ्यास (सेम 1) → परिष्कार (सेम 2) → अपलोड और मूल्यांकन (सेम 3)।',
              'नामांकन: प्रत्येक कक्षा से 3-5 सर्वश्रेष्ठ → अंतिम अपलोड।',
              'पुरस्कार: शीर्ष 10 (स्वर्ण, रजत, कांस्य + उत्कृष्टता प्रमाणपत्र)।',
              'नियम: स्कूल यूनिफॉर्म (टाई और आईडी) अनिवार्य।'
            ]
          },
          {
            'title': 'स्व-परिचय चुनौती',
            'content': [
              'पात्रता: LKG–XII (सभी कक्षाएँ)।',
              'कैसे: 30 सेकंड-1 मिनट का परिचय वीडियो (नाम, सपना, स्कूल गौरव)।',
              'समयरेखा: अंग्रेजी कक्षा में अभ्यास (सेम 1) → रिकॉर्ड और जमा (सेम 2-3)।',
              'नामांकन: शिक्षक द्वारा प्रत्येक कक्षा से शीर्ष 5 चयनित।',
              'पुरस्कार: समग्र शीर्ष 10।'
            ]
          },
          {
            'title': 'अंग्रेजी चुनौती',
            'content': [
              'पात्रता: सभी कक्षाएँ, स्तर समायोजित।',
              'इवेंट: वर्तनी प्रतियोगिता, तात्कालिक भाषण, निबंध लेखन, पढ़ने का मैराथन, वाद-विवाद।',
              'समयरेखा: शब्द सूची और तैयारी (सेम 1) → मॉक राउंड (सेम 2) → फाइनल (सेम 3)।',
              'नामांकन: टीमें A-J (100 छात्रों को 10 समूहों में विभाजित)।',
              'पुरस्कार: स्वर्ण, रजत, कांस्य टीम + शीर्ष 3 व्यक्ति।'
            ]
          },
          {
            'title': 'गणित चुनौती',
            'content': [
              'पात्रता: सभी कक्षाएँ।',
              'इवेंट: त्वरित गणना, सुडोकू, पहेली दौड़, वास्तविक जीवन गणित अनुप्रयोग।',
              'समयरेखा: अंग्रेजी चुनौती के समान।',
              'नामांकन: शिक्षक टीमें A-J के प्रतिनिधि नियुक्त करते हैं।',
              'पुरस्कार: स्वर्ण, रजत, कांस्य टीम + शीर्ष 3 व्यक्ति।'
            ]
          },
          {
            'title': 'निबंध लेखन – "अनुशासन सफलता का सेतु है"',
            'content': [
              'पात्रता: VI–XII।',
              'कैसे: 300-500 शब्द, अंग्रेजी या क्षेत्रीय भाषा में।',
              'समयरेखा: सेम 2 जमा → सेम 3 परिणाम।',
              'नामांकन: शिक्षक शॉर्टलिस्ट करते हैं।',
              'पुरस्कार: शीर्ष 3 विजेता।'
            ]
          },
          {
            'title': 'डिजिटल कला – "2050 में भविष्य का स्कूल"',
            'content': [
              'पात्रता: VI–XII।',
              'कैसे: पेंट, कैनवा, फोटोशॉप, या मुफ्त ऐप्स का उपयोग।',
              'उदाहरण: तैरते स्कूल, एआई शिक्षक।',
              'समयरेखा: लैब में अभ्यास (सेम 1-2) → जमा (सेम 3)।',
              'पुरस्कार: प्रत्येक कक्षा में शीर्ष 3।'
            ]
          }
        ]
      },
      {
        'label': 'रचनात्मक और साहित्यिक',
        'color': const Color(0xFF26a69a),
        'subsections': [
          {
            'title': 'पोस्टर निर्माण – "खेल और शिक्षा एक साथ"',
            'content': [
              'पात्रता: LKG–XII (कक्षा स्तरों के अनुसार)।',
              'कैसे: खेल और शिक्षा को जोड़ने वाला पोस्टर बनाएँ/रंगें।',
              'समयरेखा: सेम 2 गतिविधि → प्रदर्शन/मूल्यांकन (सेम 3 उत्सव)।',
              'भागीदारी: प्रत्येक छात्र से 1 प्रविष्टि।',
              'पुरस्कार: प्राथमिक, मध्य, वरिष्ठ समूह में शीर्ष 3।'
            ]
          },
          {
            'title': 'कहानी कहना और आबृत्ति',
            'content': [
              'पात्रता: LKG–VIII।',
              'कैसे: कविता/कहानी को अभिव्यक्ति के साथ सुनाएँ।',
              'समयरेखा: सेम 2 चयन → सेम 3 फाइनल।',
              'पुरस्कार: प्रत्येक श्रेणी में शीर्ष 3।'
            ]
          }
        ]
      },
      {
        'label': 'खेल और शारीरिक स्वास्थ्य',
        'color': const Color(0xFFffa000),
        'subsections': [
          {
            'title': 'ट्रैक और फील्ड इवेंट',
            'content': [
              'LKG–III: 30 मीटर दौड़, चम्मच दौड़, बोरी दौड़।',
              'IV–VIII: 100 मीटर, 200 मीटर, लंबी कूद, रिले।',
              'IX–XII: 400 मीटर, 800 मीटर, शॉट पुट, डिस्कस, रस्साकशी।',
              'पुरस्कार: प्रत्येक इवेंट में शीर्ष 3 पदक।'
            ]
          },
          {
            'title': 'टीम गेम्स',
            'content': [
              'प्राथमिक (LKG–V): खो-खो, थ्रोबॉल, डॉजबॉल।',
              'मध्य (VI–VIII): क्रिकेट (मिनी), वॉलीबॉल, फुटबॉल (5-ए-साइड)।',
              'वरिष्ठ (IX–XII): बास्केटबॉल, हैंडबॉल, बैडमिंटन।',
              'पुरस्कार: स्वर्ण, रजत, कांस्य टीम।'
            ]
          },
          {
            'title': 'मजेदार खेल',
            'content': [
              'इवेंट: बाधा दौड़, म्यूजिकल चेयर, संतुलन दौड़।',
              'पुरस्कार: प्रमाणपत्र + विजेताओं के लिए पदक।'
            ]
          }
        ]
      },
      {
        'label': 'प्रदर्शन कला',
        'color': const Color(0xFFab47bc),
        'subsections': [
          {
            'title': 'स्कूल गान प्रदर्शन',
            'content': [
              'पात्रता: सभी कक्षाएँ (समूह/एकल)।',
              'कैसे: गायन, वाद्ययंत्र, रचनात्मक प्रस्तुति।',
              'समयरेखा: अभ्यास (सेम 1-2) → फाइनल (वार्षिक उत्सव, सेम 3)।',
              'नामांकन: संगीत शिक्षक द्वारा शॉर्टलिस्ट।',
              'पुरस्कार: शीर्ष 3 टीमें (न्यूनतम 6 छात्र)।'
            ]
          },
          {
            'title': 'गायन',
            'content': [
              'पात्रता: सभी कक्षाएँ।',
              'कैसे: एकल, समूह, लोक, शास्त्रीय, देशभक्ति, आधुनिक।',
              'समयरेखा: अभ्यास (सेम 1) → रिहर्सल (सेम 2) → फाइनल (सेम 3 उत्सव)।',
              'पुरस्कार: प्रत्येक उप-इवेंट में स्वर्ण, रजत, कांस्य।'
            ]
          },
          {
            'title': 'नृत्य',
            'content': [
              'पात्रता: सभी कक्षाएँ।',
              'कैसे: एकल शास्त्रीय, लोक, फ्यूजन, समूह।',
              'समयरेखा: अभ्यास (सेम 1) → रिहर्सल (सेम 2) → फाइनल (सेम 3 उत्सव)।',
              'पुरस्कार: प्रत्येक उप-इवेंट में स्वर्ण, रजत, कांस्य।'
            ]
          },
          {
            'title': 'नाटक / स्किट',
            'content': [
              'पात्रता: सभी कक्षाएँ।',
              'कैसे: सामाजिक संदेश, ऐतिहासिक, हास्य।',
              'समयरेखा: अभ्यास (सेम 1) → रिहर्सल (सेम 2) → फाइनल (सेम 3 उत्सव)।',
              'पुरस्कार: प्रत्येक उप-इवेंट में स्वर्ण, रजत, कांस्य।'
            ]
          }
        ]
      },
      {
        'label': '21वीं सदी के कौशल और नवाचार',
        'color': const Color(0xFFef5350),
        'subsections': [
          {
            'title': 'नवाचार मेला – "युवा आविष्कारक"',
            'content': [
              'पात्रता: VI–XII।',
              'कैसे: विज्ञान, प्रौद्योगिकी, पर्यावरण पर मॉडल/परियोजनाएँ प्रदर्शित करें।',
              'पुरस्कार: शीर्ष 3 नवाचार।'
            ]
          },
          {
            'title': 'वाद-विवाद और तात्कालिक भाषण (सामाजिक विषय)',
            'content': [
              'पात्रता: VI–XII।',
              'कैसे: यादृच्छिक विषय; 2 मिनट तैयारी; 2-3 मिनट भाषण।',
              'पुरस्कार: शीर्ष 3।'
            ]
          },
          {
            'title': 'क्विज़ प्रतियोगिताएँ',
            'content': [
              'पात्रता: सभी कक्षाएँ (स्तर के अनुसार)।',
              'विषय: सामान्य ज्ञान, विज्ञान, खेल, समसामयिक घटनाएँ।',
              'पुरस्कार: टीम स्वर्ण, रजत, कांस्य।'
            ]
          },
          {
            'title': 'रोल प्ले / मॉक पार्लियामेंट',
            'content': [
              'पात्रता: VI–XII।',
              'कैसे: छात्र नेता, वैज्ञानिक, सांसदों की भूमिका निभाते हैं।',
              'पुरस्कार: शीर्ष 3।'
            ]
          }
        ]
      },
      {
        'label': 'मान्यता और उत्कृष्टता',
        'color': const Color(0xFF00c853),
        'subsections': [
          {
            'title': 'शैक्षिक उत्कृष्टता पुरस्कार',
            'content': [
              'पात्रता: वार्षिक परीक्षा में 90%+ प्राप्त छात्र।',
              'कैसे: कोई प्रतियोगिता नहीं – सीधी मान्यता।',
              'पुरस्कार: बड़ा स्वर्ण पदक + प्रमाणपत्र।',
              'समयरेखा: अंतिम परीक्षा के बाद (सेम 3)।'
            ]
          }
        ]
      },
      {
        'label': 'धर्म और मानवतावाद',
        'color': const Color(0xFF26a69a),
        'subsections': [
          {
            'title': 'धर्म के माध्यम से मानवतावाद चुनौती',
            'content': [
              'पात्रता: VI–XII (व्यक्तिगत)।',
              'कैसे: किसी भी धर्म (हिंदू, इस्लाम, ईसाई, सिख, बौद्ध, जैन आदि) के माध्यम से मानवतावाद को भाषण, निबंध या रचनात्मक प्रारूप में समझाएँ।',
              'समयरेखा: नैतिक विज्ञान कक्षा में शोध मार्गदर्शन (सेम 1) → मॉक प्रस्तुति और अभ्यास (सेम 2) → अंतिम राउंड (सेम 3)।',
              'पुरस्कार: केवल शीर्ष 10 विजेता।',
              'उद्देश्य: अंतरधार्मिक सम्मान, सहनशीलता और मानवता के मूल्य को बढ़ावा देना।',
              'नियम: केवल सकारात्मक, समावेशी और गैर-विवादास्पद व्याख्याएँ।'
            ]
          }
        ]
      },
      {
        'label': 'सांस्कृतिक पहचान और सामाजिक जागरूकता',
        'color': const Color(0xFFffa000),
        'subsections': [
          {
            'title': 'यूनिफॉर्म महत्व वीडियो',
            'content': [
              'पात्रता: VI–XII।',
              'कैसे: स्कूल यूनिफॉर्म के महत्व को समझाने वाला संक्षिप्त वीडियो बनाएँ।',
              'समयरेखा: अभ्यास (सेम 1-2) → जमा (सेम 3)।',
              'पुरस्कार: प्रत्येक कक्षा में शीर्ष 3।'
            ]
          },
          {
            'title': 'राष्ट्रीय त्योहार',
            'content': [
              'पात्रता: सभी कक्षाएँ।',
              'कैसे: राष्ट्रीय त्योहारों पर प्रदर्शन या परियोजनाएँ।',
              'समयरेखा: सेम 2 तैयारी → सेम 3 प्रदर्शन।',
              'पुरस्कार: प्रत्येक समूह में शीर्ष 3।'
            ]
          },
          {
            'title': 'पर्यावरण परियोजनाएँ',
            'content': [
              'पात्रता: सभी कक्षाएँ।',
              'कैसे: स्थिरता, पुनर्चक्रण, या हरी पहल पर परियोजनाएँ।',
              'समयरेखा: सेम 1-2 योजना → सेम 3 प्रस्तुति।',
              'पुरस्कार: शीर्ष 3 परियोजनाएँ।'
            ]
          },
          {
            'title': 'सामाजिक सेवा चुनौती',
            'content': [
              'पात्रता: VI–XII।',
              'कैसे: सामुदायिक सेवा गतिविधियों में भाग लें और प्रभाव को दस्तावेज करें।',
              'समयरेखा: सेम 1-2 गतिविधियाँ → सेम 3 रिपोर्ट।',
              'पुरस्कार: शीर्ष 3 टीमें।'
            ]
          }
        ]
      }
    ]
  };

  final List<Color> _categoryColors = [
    const Color(0xFF00c853), // Green
    const Color(0xFF26a69a), // Teal
    const Color(0xFFffa000), // Amber
    const Color(0xFFab47bc), // Purple
    const Color(0xFFef5350), // Red
    const Color(0xFF00c853), // Green (repeated for cycling)
    const Color(0xFF26a69a), // Teal
    const Color(0xFFffa000), // Amber
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: translations['English']!.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF181818),
      appBar: AppBar(
        backgroundColor: const Color(0xFFb71c1c),
        title: Row(
          children: [
            Text(
              'Competitions & Sports',
              style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
            ),
            const SizedBox(width: 32),
            DropdownButton<String>(
              value: _selectedLanguage,
              icon: const Icon(Icons.language, color: Colors.white),
              dropdownColor: const Color(0xFFb71c1c),
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
              onChanged: (String? newValue) {
                if (newValue != null) {
                  setState(() {
                    _selectedLanguage = newValue;
                    _tabController = TabController(length: translations[_selectedLanguage]!.length, vsync: this);
                  });
                }
              },
              items: languages.map<DropdownMenuItem<String>>((String lang) {
                return DropdownMenuItem<String>(
                  value: lang,
                  child: Text(
                    lang,
                    style: GoogleFonts.poppins(color: Colors.white),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: translations[_selectedLanguage]!
              .asMap()
              .entries
              .map((entry) => Tab(
            child: Text(
              entry.value['label'],
              style: GoogleFonts.poppins(color: Colors.white),
            ),
          ))
              .toList(),
          indicatorColor: const Color(0xFF00c757),
          labelColor: const Color(0xFF00c757),
          unselectedLabelColor: Colors.white70,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: translations[_selectedLanguage]!.asMap().entries.map((entry) {
          final categoryIndex = entry.key;
          final category = entry.value;
          final colorIndex = categoryIndex % _categoryColors.length;

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              Center(
                child: Image.asset(
                  'assets/images/knights.png',
                  height: 100,
                  width: 100,
                ),
              ),
              const SizedBox(height: 10),
              ...category['subsections'].asMap().entries.map((subEntry) {
                final subsection = subEntry.value;
                final subColorIndex = ((colorIndex + subEntry.key) % _categoryColors.length).toInt();

                return Card(
                  color: const Color(0xFF111111),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0x3300c853), width: 1),
                  ),
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  child: ExpansionTile(
                    title: Text(
                      subsection['title'].toString(),
                      style: GoogleFonts.poppins(
                        color: _categoryColors[subColorIndex],
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    children: (subsection['content'] as List<String>).map<Widget>((point) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '• ',
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF00c853),
                                fontSize: 14,
                              ),
                            ),
                            Expanded(
                              child: Text(
                                point,
                                style: GoogleFonts.poppins(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                );
              }).toList(),
            ],
          );
        }).toList(),
      ),
    );
  }
}