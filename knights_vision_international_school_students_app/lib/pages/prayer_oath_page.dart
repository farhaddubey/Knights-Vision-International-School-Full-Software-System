import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class PrayerOathPage extends StatefulWidget {
  const PrayerOathPage({super.key});

  @override
  _PrayerOathPageState createState() => _PrayerOathPageState();
}

class _PrayerOathPageState extends State<PrayerOathPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _content = [
    {
      'label': 'Oath (Bengali)',
      'text': '''আমরা নই শুধু শিখছি, শিখাই জীবনের মর্ম,
ত্যাগ আর সংগ্রামে গড়ি আত্মার দৃঢ় ধর্ম।
জীবনের প্রতিটি ধাপে সৎ পথে থাকি,
অসীম সাহস আর অধ্যবসায়ে জাগাই শক্তি।

আমরা বিশ্বাস করি কর্মই সেরা ধর্ম,
প্রতিদিন করি শপথ সততার প্রতি মর্ম।
লড়াইয়ের প্রতিটি ক্ষণে লক্ষ্য রাখি স্থির,
স্বপ্ন পূরণের পথে থাকি অটল, দৃঢ় ও বিশ্বাসে অধীর।

আমরা নই শুধুই যোদ্ধা, আমরা পথপ্রদর্শক,
সংগ্রামের আগুনে ত্যাগের মন্ত্র জাগ্রত।
নিজেকে সেরা বানানোই আমাদের অঙ্গীকার,
বাধা যত আসুক, হৃদয়ে সাফল্যের ঝংকার।

জ্ঞানকে করি সমর্পণ মানবতার পথে,
শান্তি আর সৌহার্দ্য বজায় রাখি জীবনের রথে।
ত্যাগ আর সংগ্রামের পথে উদার মন রাখি,
সবার কল্যাণে সর্বদা শক্তি উৎসর্গ করি।

আমাদের প্রতিটি কাজ হোক এক দীপ্ত শপথ,
মানবতার অগ্রগতিতে হোক অবিচল পথ।
নাইটসদের প্রার্থনা প্রতিধ্বনি করুক বিশ্বময়,
ত্যাগ, সংগ্রাম, ও সাফল্যে হোক আলোচিত আকাশসীমায়।''',
      'color': const Color(0xFF00c853),
    },
    {
      'label': 'Oath (Hindi)',
      'text': '''हम न केवल सीखते हैं, सिखाते हैं जीवन का मर्म,
त्याग और संघर्ष से बनाते आत्मा का दृढ़ धर्म।
जीवन की हर सीढ़ी पर सत्य का मार्ग अपनाएं,
अनंत साहस और तपस्या से शक्ति जगाएं।

हम मानते हैं कि कर्म ही सर्वोत्तम धर्म है,
हर दिन लेते हैं सत्यनिष्ठा का शपथ मर्म है।
संघर्ष के हर क्षण में रखते हैं लक्ष्य स्थिर,
सपनों की राह पर रहते हैं अटल, दृढ़ और विश्वास में अधीर।

हम केवल योद्धा नहीं, हम मार्गदर्शक हैं,
संघर्ष की आग में त्याग के मंत्र जाग्रत हैं।
स्वयं को श्रेष्ठ बनाना हमारा दृढ़ संकल्प है,
चाहे जितनी बाधाएँ आएं, हृदय में सफलता का स्वर गूंजता है।

ज्ञान को समर्पित करते हैं मानवता की राह पर,
शांति और सौहार्द बनाए रखते हैं जीवन के रथ पर।
त्याग और संघर्ष की राह पर रखते हैं उदार मन,
सबकी भलाई के लिए सदैव शक्ति का अर्पण।

हमारे हर कार्य में हो एक दीप्त शपथ,
मानवता की प्रगति में हो अडिग पथ।
नाइट्स की प्रार्थना गूंजे विश्वभर में,
त्याग, संघर्ष और सफलता से हो गगन आलोकित।''',
      'color': const Color(0xFFff69b4),
    },
    {
      'label': 'Oath (Hindi Pro.)',
      'text': '''Hum na keval seekhte hain, sikhate hain jeevan ka marm,
Tyaag aur sangharsh se banate aatma ka dridh dharm.
Jeevan ki har seedhi par satya ka maarg apnaayein,
Anant saahas aur tapasya se shakti jagaayein.

Hum maante hain ki karm hi sarvottam dharm hai,
Har din lete hain satyanishtha ka shapath marm hai.
Sangharsh ke har kshan mein rakhte hain lakshya sthir,
Sapno ki raah par rehte hain atal, dridh aur vishwas mein adheer.

Hum keval yoddha nahin, hum margdarshak hain,
Sangharsh ki aag mein tyaag ke mantra jagrat hain.
Swayam ko shreshth banana hamara dridh sankalp hai,
Chahe jitni badhaayein aayein, hriday mein safalta ka swar goonjta hai.

Gyaan ko samarpit karte hain manavta ki raah par,
Shaanti aur sauhard banaye rakhte hain jeevan ke rth par.
Tyaag aur sangharsh ki raah par rakhte hain udaar man,
Sabki bhalai ke liye sadaiv shakti ka arpan.

Hamare har kaarya mein ho ek deept shapath,
Manavta ki pragati mein ho adig path.
Knights ki prarthana goonje vishvabhar mein,
Tyaag, sangharsh aur safalta se ho gagan aalokit.''',
      'color': const Color(0xFFff69b4),
    },
    {
      'label': 'Anthem (Hindi)',
      'text': '''इतनी शक्ति हमें देना दाता
मन का विश्वास कमज़ोर हो ना
हम चलें नेक रस्ते पे हमसे
भूलकर भी कोई भूल हो ना

इतनी शक्ति हमें देना दाता
मन का विश्वास कमज़ोर हो ना

दूर अज्ञान के हों अंधेरे
तू हमें ज्ञान की रौशनी दे
हर बुराई से बचते रहें हम
जितनी भी दे भली ज़िंदगी दे

बैर हो ना किसीका किसीसे
भावना मन में बदले की हो ना
हम चलें नेक रस्ते पे हमसे
भूलकर भी कोई भूल हो ना

इतनी शक्ति हमें देना दाता
मन का विश्वास कमज़ोर हो ना
हम ना सोचें हमें क्या मिला है
हम ये सोचें किया क्या है अर्पण

फूल खुशियों के बाँटें सभी को
सबका जीवन ही बन जाए मधुबन
अपनी करुणा का जल तू बहा के
कर दे पावन हर एक मन का कोना

हम चलें नेक रस्ते पे हमसे
भूलकर भी कोई भूल हो ना
इतनी शक्ति हमें देना दाता
मन का विश्वास कमज़ोर हो ना

इतनी शक्ति हमें देना दाता
मन का विश्वास कमज़ोर हो ना''',
      'color': const Color(0xFF00c853),
    },
    {
      'label': 'Anthem (English Pro.)',
      'text': '''Itni shakti hamein dena daata
Mann ka vishwas kamzor ho na
Hum chalein nek raste pe humse
Bhoolkar bhi koi bhool ho na

Itni shakti hamein dena daata
Mann ka vishwas kamzor ho na

Door agyaan ke hon andhere
Tu hamein gyaan ki raushni de
Har buraai se bachte rahen hum
Jitni bhi de bhali zindagi de

Bair ho na kisika kisi se
Bhaavna mann mein badle ki ho na
Hum chalein nek raste pe humse
Bhoolkar bhi koi bhool ho na

Itni shakti hamein dena daata
Mann ka vishwas kamzor ho na
Hum na sochein humein kya mila hai
Hum ye sochein kiya kya hai arpan

Phool khushiyon ke baantein sabhi ko
Sabka jeevan hi ban jaaye madhuban
Apni karuna ka jal tu baha ke
Kar de paavan har ek mann ka kona

Hum chalein nek raste pe humse
Bhoolkar bhi koi bhool ho na
Itni shakti hamein dena daata
Mann ka vishwas kamzor ho na

Itni shakti hamein dena daata
Mann ka vishwas kamzor ho na''',
      'color': const Color(0xFF00c853),
    },
    {
      'label': 'Oath (English)',
      'text': '''We do not just learn, but teach the essence of life,
Through sacrifice and struggle, we build a spirit so rife.
On every step of life, we walk the path of truth,
With endless courage and perseverance, we ignite our youth.

We believe that work is the greatest creed,
Every day we pledge to uphold honesty indeed.
In every moment of struggle, we stay steady and clear,
On the path to fulfilling dreams, resolute and sincere.

We are not just warriors; we are guides of the way,
In the fire of struggle, we awaken sacrifice each day.
To become the best is our solemn aim,
No matter the obstacles, success echoes in our flame.

We dedicate knowledge to the path of humanity,
With peace and harmony, we drive life’s unity.
On the path of sacrifice, we keep a generous heart,
For the welfare of all, our strength we impart.

Let every act of ours be a shining vow,
To advance humanity, unwavering we bow.
Let the Knights’ prayer echo across the skies,
Through sacrifice, struggle, and success, let greatness arise.''',
      'color': const Color(0xFF8a2be2),
    },
    {
      'label': 'Anthem (English)',
      'text': '''Grant us such strength, O Giver,
Let not our faith ever waver.
May we walk the righteous path always,
Let no mistake ever cross our ways.

Grant us such strength, O Giver,
Let not our faith ever waver.

Dispel the darkness of ignorance afar,
Grant us the light of knowledge, our star.
May we steer clear of every vice,
And live a life that’s good and wise.

Let there be no enmity with anyone,
Let no thought of vengeance ever be spun.
May we walk the righteous path always,
Let no mistake ever cross our ways.

Grant us such strength, O Giver,
Let not our faith ever waver.
Let us not think of what we gain,
But ponder what we offer, our aim.

May we share the flowers of joy with all,
Turn every life into a garden’s call.
With your compassion’s flowing stream,
Purify every heart’s innermost dream.

May we walk the righteous path always,
Let no mistake ever cross our ways.
Grant us such strength, O Giver,
Let not our faith ever waver.

Grant us such strength, O Giver,
Let not our faith ever waver.''',
      'color': const Color(0xFFff69b4),
    },
    {
      'label': 'Few Good Words (Bengali)',
      'text': '''শিক্ষার্থীদের দায়িত্ব: <b>সৎ ও নীতিবান হওয়ার পথে এগিয়ে চলা</b>

<b>নিজের প্রতি সৎ ও বিশ্বস্ত থাকো:</b> <i>নিজস্ব মূল্যবোধ ও লক্ষ্যগুলোর প্রতি বিশ্বাস রেখে</i> সঠিক পথে অটল থেকো।

<b>সঠিক বন্ধু নির্বাচন করো:</b> <i>এমন বন্ধু বেছে নাও, যারা তোমাকে পড়াশোনা ও ভালো কাজের প্রতি উৎসাহিত করে</i>, খারাপ পথে টেনে নিয়ে যায় না।

<b>খারাপ সঙ্গ থেকে দূরে থাকো:</b> এমন ছেলেদের সঙ্গ এড়িয়ে চলো, যারা খারাপ অভ্যাস বা অনৈতিক কার্যকলাপে লিপ্ত।

<b>নৈতিক সাহস ও আদর্শ বজায় রাখো:</b> চাপের মুখেও সঠিক সিদ্ধান্ত নিতে শেখো এবং অন্যায়কে না বলো।

<b>ধৈর্য এবং অধ্যবসায় অনুশীলন করো:</b> ধীরে ধীরে সাফল্য অর্জনের পথে এগিয়ে যাও, দ্রুত বা অনৈতিক পথে সাফল্য পেতে চেষ্টা কোরো না।

<b>অন্যায় প্রলোভনে পা দিও না:</b> খারাপ কাজের সুফল সাময়িক, কিন্তু এর পরিণতি দীর্ঘস্থায়ী ও ধ্বংসাত্মক।

<b>আত্মনিয়ন্ত্রণ বজায় রাখো:</b> <i>খারাপ কাজের প্রতি আকর্ষণ দূরে সরিয়ে নিজের মনোবল শক্ত করো</i>।

<b>বাস্তবিক বন্ধুত্বের মানে বোঝো:</b> প্রকৃত বন্ধু সেই, যে তোমাকে সঠিক পথে নিয়ে যায় এবং তোমার ভুল সংশোধনে সাহায্য করে।

<b>পরামর্শদাতা ও অভিভাবকদের সম্মান করো:</b> অভিজ্ঞ ব্যক্তিদের পরামর্শ গ্রহণ করো এবং জীবনের সঠিক দিক নির্দেশনা মেনে চলো।

<b>প্রতিটি কাজে দায়িত্বশীল হও:</b> নিজের কাজ ও সিদ্ধান্তের প্রতি দায়িত্বশীল হও এবং ভালো অভ্যাস ও নীতিবোধের চর্চা করো।

<b>প্রতিষ্ঠানের গৌরব রক্ষা করা:</b> একজন দায়িত্বশীল শিক্ষার্থী হিসেবে, আমাদের উচিত প্রতিষ্ঠানটির গৌরব এবং মর্যাদা রক্ষা করা। আমাদের কাজ এবং আচরণের মাধ্যমে প্রতিষ্ঠানটির সম্মান বৃদ্ধি করা উচিত।

<b>নিষ্ঠার সঙ্গে অধ্যয়ন করা:</b> প্রতিষ্ঠানের প্রতি আমাদের প্রথম দায়িত্ব হল, নিয়মিতভাবে এবং নিষ্ঠার সঙ্গে পড়াশোনা করা। যাতে আমরা আমাদের শিক্ষা জীবনে সফলতা অর্জন করতে পারি এবং প্রতিষ্ঠানের নাম উজ্জ্বল করতে পারি।

<b>অভ্যন্তরীণ শৃঙ্খলা মেনে চলা:</b> শিক্ষাপ্রতিষ্ঠানে শৃঙ্খলা রক্ষা করা আমাদের সবার দায়িত্ব। এর মাধ্যমে আমরা একটি সুষ্ঠু ও শান্তিপূর্ণ শিক্ষার পরিবেশ গড়ে তুলতে পারি, যা আমাদের শিক্ষা ও নৈতিক উন্নতির পথে সহায়ক। শৃঙ্খলা মেনে চলার মাধ্যমে আমরা প্রতিষ্ঠানের নিয়ম-কানুনের প্রতি শ্রদ্ধা প্রদর্শন করি এবং সকলের জন্য একটি ইতিবাচক পরিবেশ নিশ্চিত করি।''',
      'color': const Color(0xFF2196f3),
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _content.length, vsync: this);
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
        title: Text(
          'School Oath & Prayer',
          style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: _content
              .map((item) => Tab(
            child: Text(
              item['label'],
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
        children: _content.map((item) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['label'],
                  style: GoogleFonts.poppins(
                    color: item['color'],
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  item['text'],
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontSize: 16,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}