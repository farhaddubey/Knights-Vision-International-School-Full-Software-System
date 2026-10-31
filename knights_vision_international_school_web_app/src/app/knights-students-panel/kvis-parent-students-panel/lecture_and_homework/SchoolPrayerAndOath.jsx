"use client";
import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";
const pinkAccent = "#ff69b4";
const violetAccent = "#8a2be2";

// Prayer and Oath texts
const oathBengali = `আমরা নই শুধু শিখছি, শিখাই জীবনের মর্ম,\nত্যাগ আর সংগ্রামে গড়ি আত্মার দৃঢ় ধর্ম।\nজীবনের প্রতিটি ধাপে সৎ পথে থাকি,\nঅসীম সাহস আর অধ্যবসায়ে জাগাই শক্তি।\n\nআমরা বিশ্বাস করি কর্মই সেরা ধর্ম,\nপ্রতিদিন করি শপথ সততার প্রতি মর্ম।\nলড়াইয়ের প্রতিটি ক্ষণে লক্ষ্য রাখি স্থির,\nস্বপ্ন পূরণের পথে থাকি অটল, দৃঢ় ও বিশ্বাসে অধীর।\n\nআমরা নই শুধুই যোদ্ধা, আমরা পথপ্রদর্শক,\nসংগ্রামের আগুনে ত্যাগের মন্ত্র জাগ্রত।\nনিজেকে সেরা বানানোই আমাদের অঙ্গীকার,\nবাধা যত আসুক, হৃদয়ে সাফল্যের ঝংকার।\n\nজ্ঞানকে করি সমর্পণ মানবতার পথে,\nশান্তি আর সৌহার্দ্য বজায় রাখি জীবনের রথে।\nত্যাগ আর সংগ্রামের পথে উদার মন রাখি,\nসবার কল্যাণে সর্বদা শক্তি উৎসর্গ করি।\n\nআমাদের প্রতিটি কাজ হোক এক দীপ্ত শপথ,\nমানবতার অগ্রগতিতে হোক অবিচল পথ।\nনাইটসদের প্রার্থনা প্রতিধ্বনি করুক বিশ্বময়,\nত্যাগ, সংগ্রাম, ও সাফল্যে হোক আলোচিত আকাশসীমায়।`;

const oathHindi = `हम न केवल सीखते हैं, सिखाते हैं जीवन का मर्म,\nत्याग और संघर्ष से बनाते आत्मा का दृढ़ धर्म।\nजीवन की हर सीढ़ी पर सत्य का मार्ग अपनाएं,\nअनंत साहस और तपस्या से शक्ति जगाएं।\n\nहम मानते हैं कि कर्म ही सर्वोत्तम धर्म है,\nहर दिन लेते हैं सत्यनिष्ठा का शपथ मर्म है।\nसंघर्ष के हर क्षण में रखते हैं लक्ष्य स्थिर,\nसपनों की राह पर रहते हैं अटल, दृढ़ और विश्वास में अधीर।\n\nहम केवल योद्धा नहीं, हम मार्गदर्शक हैं,\nसंघर्ष की आग में त्याग के मंत्र जाग्रत हैं।\nस्वयं को श्रेष्ठ बनाना हमारा दृढ़ संकल्प है,\nचाहे जितनी बाधाएँ आएं, हृदय में सफलता का स्वर गूंजता है।\n\nज्ञान को समर्पित करते हैं मानवता की राह पर,\nशांति और सौहार्द बनाए रखते हैं जीवन के रथ पर।\nत्याग और संघर्ष की राह पर रखते हैं उदार मन,\nसबकी भलाई के लिए सदैव शक्ति का अर्पण।\n\nहमारे हर कार्य में हो एक दीप्त शपथ,\nमानवता की प्रगति में हो अडिग पथ।\nनाइट्स की प्रार्थना गूंजे विश्वभर में,\nत्याग, संघर्ष और सफलता से हो गगन आलोकित।`;

const oathHindiPronunciation = `Hum na keval seekhte hain, sikhate hain jeevan ka marm,\nTyaag aur sangharsh se banate aatma ka dridh dharm.\nJeevan ki har seedhi par satya ka maarg apnaayein,\nAnant saahas aur tapasya se shakti jagaayein.\n\nHum maante hain ki karm hi sarvottam dharm hai,\nHar din lete hain satyanishtha ka shapath marm hai.\nSangharsh ke har kshan mein rakhte hain lakshya sthir,\nSapno ki raah par rehte hain atal, dridh aur vishwas mein adheer.\n\nHum keval yoddha nahin, hum margdarshak hain,\nSangharsh ki aag mein tyaag ke mantra jagrat hain.\nSwayam ko shreshth banana hamara dridh sankalp hai,\nChahe jitni badhaayein aayein, hriday mein safalta ka swar goonjta hai.\n\nGyaan ko samarpit karte hain manavta ki raah par,\nShaanti aur sauhard banaye rakhte hain jeevan ke rth par.\nTyaag aur sangharsh ki raah par rakhte hain udaar man,\nSabki bhalai ke liye sadaiv shakti ka arpan.\n\nHamare har kaarya mein ho ek deept shapath,\nManavta ki pragati mein ho adig path.\nKnights ki prarthana goonje vishvabhar mein,\nTyaag, sangharsh aur safalta se ho gagan aalokit.`;

const oathEnglish = `We do not just learn, but teach the essence of life,\nThrough sacrifice and struggle, we build a spirit so rife.\nOn every step of life, we walk the path of truth,\nWith endless courage and perseverance, we ignite our youth.\n\nWe believe that work is the greatest creed,\nEvery day we pledge to uphold honesty indeed.\nIn every moment of struggle, we stay steady and clear,\nOn the path to fulfilling dreams, resolute and sincere.\n\nWe are not just warriors; we are guides of the way,\nIn the fire of struggle, we awaken sacrifice each day.\nTo become the best is our solemn aim,\nNo matter the obstacles, success echoes in our flame.\n\nWe dedicate knowledge to the path of humanity,\nWith peace and harmony, we drive life’s unity.\nOn the path of sacrifice, we keep a generous heart,\nFor the welfare of all, our strength we impart.\n\nLet every act of ours be a shining vow,\nTo advance humanity, unwavering we bow.\nLet the Knights’ prayer echo across the skies,\nThrough sacrifice, struggle, and success, let greatness arise.`;

const anthemHindi = `इतनी शक्ति हमें देना दाता\nमन का विश्वास कमज़ोर हो ना\nहम चलें नेक रस्ते पे हमसे\nभूलकर भी कोई भूल हो ना\n\nइतनी शक्ति हमें देना दाता\nमन का विश्वास कमज़ोर हो ना\n\nदूर अज्ञान के हों अंधेरे\nतू हमें ज्ञान की रौशनी दे\nहर बुराई से बचते रहें हम\nजितनी भी दे भली ज़िंदगी दे\n\nबैर हो ना किसीका किसीसे\nभावना मन में बदले की हो ना\nहम चलें नेक रस्ते पे हमसे\nभूलकर भी कोई भूल हो ना\n\nइतनी शक्ति हमें देना दाता\nमन का विश्वास कमज़ोर हो ना\nहम ना सोचें हमें क्या मिला है\nहम ये सोचें किया क्या है अर्पण\n\nफूल खुशियों के बाँटें सभी को\nसबका जीवन ही बन जाए मधुबन\nअपनी करुणा का जल तू बहा के\nकर दे पावन हर एक मन का कोना\n\nहम चलें नेक रस्ते पे हमसे\nभूलकर भी कोई भूल हो ना\nइतनी शक्ति हमें देना दाता\nमन का विश्वास कमज़ोर हो ना\n\nइतनी शक्ति हमें देना दाता\nमन का विश्वास कमज़ोर हो ना`;

const anthemEnglishPronounciation = `Itni shakti hamein dena daata\nMann ka vishwas kamzor ho na\nHum chalein nek raste pe humse\nBhoolkar bhi koi bhool ho na\n\nItni shakti hamein dena daata\nMann ka vishwas kamzor ho na\n\nDoor agyaan ke hon andhere\nTu hamein gyaan ki raushni de\nHar buraai se bachte rahen hum\nJitni bhi de bhali zindagi de\n\nBair ho na kisika kisi se\nBhaavna mann mein badle ki ho na\nHum chalein nek raste pe humse\nBhoolkar bhi koi bhool ho na\n\nItni shakti hamein dena daata\nMann ka vishwas kamzor ho na\nHum na sochein humein kya mila hai\nHum ye sochein kiya kya hai arpan\n\nPhool khushiyon ke baantein sabhi ko\nSabka jeevan hi ban jaaye madhuban\nApni karuna ka jal tu baha ke\nKar de paavan har ek mann ka kona\n\nHum chalein nek raste pe humse\nBhoolkar bhi koi bhool ho na\nItni shakti hamein dena daata\nMann ka vishwas kamzor ho na\n\nItni shakti hamein dena daata\nMann ka vishwas kamzor ho na`;

const anthemEnglish = `Grant us such strength, O Giver,\nLet not our faith ever waver.\nMay we walk the righteous path always,\nLet no mistake ever cross our ways.\n\nGrant us such strength, O Giver,\nLet not our faith ever waver.\n\nDispel the darkness of ignorance afar,\nGrant us the light of knowledge, our star.\nMay we steer clear of every vice,\nAnd live a life that’s good and wise.\n\nLet there be no enmity with anyone,\nLet no thought of vengeance ever be spun.\nMay we walk the righteous path always,\nLet no mistake ever cross our ways.\n\nGrant us such strength, O Giver,\nLet not our faith ever waver.\nLet us not think of what we gain,\nBut ponder what we offer, our aim.\n\nMay we share the flowers of joy with all,\nTurn every life into a garden’s call.\nWith your compassion’s flowing stream,\nPurify every heart’s innermost dream.\n\nMay we walk the righteous path always,\nLet no mistake ever cross our ways.\nGrant us such strength, O Giver,\nLet not our faith ever waver.\n\nGrant us such strength, O Giver,\nLet not our faith ever waver.`;

const fewGoodWordsBengali = `শিক্ষার্থীদের দায়িত্ব: <b>সৎ ও নীতিবান হওয়ার পথে এগিয়ে চলা</b>\n\n<b>নিজের প্রতি সৎ ও বিশ্বস্ত থাকো:</b> <i>নিজস্ব মূল্যবোধ ও লক্ষ্যগুলোর প্রতি বিশ্বাস রেখে</i> সঠিক পথে অটল থেকো।\n\n<b>সঠিক বন্ধু নির্বাচন করো:</b> <i>এমন বন্ধু বেছে নাও, যারা তোমাকে পড়াশোনা ও ভালো কাজের প্রতি উৎসাহিত করে</i>, খারাপ পথে টেনে নিয়ে যায় না।\n\n<b>খারাপ সঙ্গ থেকে দূরে থাকো:</b> এমন ছেলেদের সঙ্গ এড়িয়ে চলো, যারা খারাপ অভ্যাস বা অনৈতিক কার্যকলাপে লিপ্ত।\n\n<b>নৈতিক সাহস ও আদর্শ বজায় রাখো:</b> চাপের মুখেও সঠিক সিদ্ধান্ত নিতে শেখো এবং অন্যায়কে না বলো।\n\n<b>ধৈর্য এবং অধ্যবসায় অনুশীলন করো:</b> ধীরে ধীরে সাফল্য অর্জনের পথে এগিয়ে যাও, দ্রুত বা অনৈতিক পথে সাফল্য পেতে চেষ্টা কোরো না।\n\n<b>অন্যায় প্রলোভনে পা দিও না:</b> খারাপ কাজের সুফল সাময়িক, কিন্তু এর পরিণতি দীর্ঘস্থায়ী ও ধ্বংসাত্মক।\n\n<b>আত্মনিয়ন্ত্রণ বজায় রাখো:</b> <i>খারাপ কাজের প্রতি আকর্ষণ দূরে সরিয়ে নিজের মনোবল শক্ত করো</i>।\n\n<b>বাস্তবিক বন্ধুত্বের মানে বোঝো:</b> প্রকৃত বন্ধু সেই, যে তোমাকে সঠিক পথে নিয়ে যায় এবং তোমার ভুল সংশোধনে সাহায্য করে।\n\n<b>পরামর্শদাতা ও অভিভাবকদের সম্মান করো:</b> অভিজ্ঞ ব্যক্তিদের পরামর্শ গ্রহণ করো এবং জীবনের সঠিক দিক নির্দেশনা মেনে চলো।\n\n<b>প্রতিটি কাজে দায়িত্বশীল হও:</b> নিজের কাজ ও সিদ্ধান্তের প্রতি দায়িত্বশীল হও এবং ভালো অভ্যাস ও নীতিবোধের চর্চা করো।\n\n<b>প্রতিষ্ঠানের গৌরব রক্ষা করা:</b> একজন দায়িত্বশীল শিক্ষার্থী হিসেবে, আমাদের উচিত প্রতিষ্ঠানটির গৌরব এবং মর্যাদা রক্ষা করা। আমাদের কাজ এবং আচরণের মাধ্যমে প্রতিষ্ঠানটির সম্মান বৃদ্ধি করা উচিত।\n\n<b>নিষ্ঠার সঙ্গে অধ্যয়ন করা:</b> প্রতিষ্ঠানের প্রতি আমাদের প্রথম দায়িত্ব হল, নিয়মিতভাবে এবং নিষ্ঠার সঙ্গে পড়াশোনা করা। যাতে আমরা আমাদের শিক্ষা জীবনে সফলতা অর্জন করতে পারি এবং প্রতিষ্ঠানের নাম উজ্জ্বল করতে পারি।\n\n<b>অভ্যন্তরীণ শৃঙ্খলা মেনে চলা:</b> শিক্ষাপ্রতিষ্ঠানে শৃঙ্খলা রক্ষা করা আমাদের সবার দায়িত্ব। এর মাধ্যমে আমরা আমাদের প্রতিষ্ঠানকে সম্মানিত করে তুলি এবং অন্যদের জন্য একটি ইতিবাচক পরিবেশ সৃষ্টি করি।\n\n<b>সামাজিক ও সাংস্কৃতিক কর্মকাণ্ডে অংশগ্রহণ:</b> প্রতিষ্ঠানের সামাজিক এবং সাংস্কৃতিক কর্মকাণ্ডে অংশ নিয়ে, আমরা শুধু নিজেদের উন্নতি করি না, বরং প্রতিষ্ঠানের খ্যাতি বাড়াতে সহায়তা করি।\n\n<b>প্রতিষ্ঠানের নীতিমালা অনুসরণ করা:</b> একজন ছাত্র হিসেবে, আমাদের উচিত প্রতিষ্ঠানের নিয়ম এবং নীতিমালা মেনে চলা। এর মাধ্যমে আমরা প্রতিষ্ঠানটির প্রতি আমাদের শ্রদ্ধা এবং দায়িত্ব প্রকাশ করি।`;

const fewGoodWordsHindi = `शिक्षार्थियों का कर्तव्य: <b>सत्यनिष्ठा और नैतिकता के पथ पर आगे बढ़ना</b>\n\n<b>स्वयं के प्रति ईमानदार और विश्वसनीय रहें:</b> <i>अपने मूल्यों और लक्ष्यों में विश्वास रखते हुए</i> सही मार्ग पर अडिग रहें।\n\n<b>सही मित्र चुनें:</b> <i>ऐसे मित्रों का चयन करें जो आपको पढ़ाई और अच्छे कार्यों के लिए प्रोत्साहित करें</i>, न कि गलत रास्ते पर ले जाएं।\n\n<b>बुरी संगति से दूर रहें:</b> उन लोगों की संगति से बचें जो बुरी आदतों या अनैतिक गतिविधियों में लिप्त हों।\n\n<b>नैतिक साहस और आदर्श बनाए रखें:</b> दबाव में भी सही निर्णय लें और अन्याय को ना कहें।\n\n<b>धैर्य और लगन का अभ्यास करें:</b> धीरे-धीरे सफलता की ओर बढ़ें, जल्दबाजी या अनैतिक रास्तों से सफलता पाने की कोशिश न करें।\n\n<b>अनुचित प्रलोभनों में न फंसें:</b> बुरे कार्यों का लाभ अस्थायी होता है, लेकिन इसके परिणाम लंबे समय तक और विनाशकारी होते हैं।\n\n<b>आत्म-नियंत्रण बनाए रखें:</b> <i>बुरी चीजों के प्रति आकर्षण को दूर करें और अपनी इच्छाशक्ति को मजबूत करें</i>।\n\n<b>वास्तविक मित्रता का अर्थ समझें:</b> सच्चा मित्र वही है जो आपको सही रास्ते पर ले जाए और आपकी गलतियों को सुधारने में मदद करे।\n\n<b>सलाहकारों और अभिभावकों का सम्मान करें:</b> अनुभवी लोगों की सलाह लें और जीवन में सही दिशा-निर्देशों का पालन करें।\n\n<b>हर कार्य में जिम्मेदार रहें:</b> अपने कार्यों और निर्णयों के प्रति जिम्मेदार रहें और अच्छी आदतों व नैतिकता का अभ्यास करें।\n\n<b>संस्थान की गरिमा बनाए रखें:</b> एक जिम्मेदार छात्र के रूप में, हमें संस्थान की गरिमा और सम्मान की रक्षा करनी चाहिए। हमारे कार्यों और व्यवहार से संस्थान का सम्मान बढ़ाना चाहिए।\n\n<b>निष्ठा के साथ अध्ययन करें:</b> संस्थान के प्रति हमारा पहला कर्तव्य है नियमित और निष्ठा के साथ पढ़ाई करना, ताकि हम अपनी शैक्षिक यात्रा में सफलता प्राप्त करें और संस्थान का नाम रोशन करें।\n\n<b>आंतरिक अनुशासन का पालन करें:</b> शैक्षिक संस्थान में अनुशासन बनाए रखना हम सभी का कर्तव्य है। इससे हम अपने संस्थान को सम्मानित करते हैं और दूसरों के लिए एक सकारात्मक वातावरण बनाते हैं।\n\n<b>सामाजिक और सांस्कृतिक गतिविधियों में भाग लें:</b> संस्थान की सामाजिक और सांस्कृतिक गतिविधियों में भाग लेकर, हम न केवल अपनी प्रगति करते हैं, बल्कि संस्थान की ख्याति बढ़ाने में भी मदद करते हैं।\n\n<b>संस्थान के नियमों का पालन करें:</b> एक छात्र के रूप में, हमें संस्थान के नियमों और नीतियों का पालन करना चाहिए। इससे हम संस्थान के प्रति अपनी श्रद्धा और जिम्मेदारी व्यक्त करते हैं।`;

const fewGoodWordsEnglish = `Students' Duty: <b>Progress on the Path of Honesty and Morality</b>\n\n<b>Be Honest and Faithful to Yourself:</b> <i>Stay steadfast on the right path, trusting in your own values and goals</i>.\n\n<b>Choose the Right Friends:</b> <i>Select friends who encourage you in studies and good deeds</i>, not those who lead you astray.\n\n<b>Avoid Bad Company:</b> Stay away from individuals involved in harmful habits or unethical activities.\n\n<b>Uphold Moral Courage and Ideals:</b> Learn to make the right decisions under pressure and say no to injustice.\n\n<b>Practice Patience and Perseverance:</b> Move toward success gradually, avoiding quick or unethical shortcuts.\n\n<b>Resist Unjust Temptations:</b> The benefits of wrongdoing are temporary, but their consequences are long-lasting and destructive.\n\n<b>Maintain Self-Control:</b> <i>Ward off attraction to harmful actions and strengthen your willpower</i>.\n\n<b>Understand True Friendship:</b> A true friend guides you to the right path and helps correct your mistakes.\n\n<b>Respect Mentors and Guardians:</b> Accept advice from experienced individuals and follow their guidance for the right direction in life.\n\n<b>Be Responsible in Every Task:</b> Take responsibility for your actions and decisions, and practice good habits and ethics.\n\n<b>Preserve the Institution’s Honor:</b> As responsible students, we must protect the institution’s dignity and prestige. Our actions and behavior should enhance its reputation.\n\n<b>Study with Dedication:</b> Our primary duty to the institution is to study regularly and sincerely, achieving success in our academic journey and bringing glory to the institution.\n\n<b>Adhere to Internal Discipline:</b> Maintaining discipline in the educational institution is everyone’s responsibility. This honors our institution and creates a positive environment for others.\n\n<b>Participate in Social and Cultural Activities:</b> By engaging in the institution’s social and cultural activities, we not only improve ourselves but also contribute to enhancing its reputation.\n\n<b>Follow the Institution’s Policies:</b> As students, we should adhere to the institution’s rules and policies, expressing our respect and responsibility toward it.`;

const content = [
  { label: "Oath (Bengali)", text: oathBengali, color: greenAccent },
  { label: "Oath (Hindi)", text: oathHindi, color: pinkAccent },
  { label: "Oath (Hindi Pro.)", text: oathHindiPronunciation, color: pinkAccent },
  { label: "Anthem (Hindi)", text: anthemHindi, color: greenAccent },
  { label: "Anthem (English Pro.)", text: anthemEnglishPronounciation, color: greenAccent },
  { label: "Oath (English)", text: oathEnglish, color: violetAccent },
  { label: "Anthem (English)", text: anthemEnglish, color: pinkAccent },
  { label: "Few Good Words (Bengali)", text: fewGoodWordsBengali, color: violetAccent },
  { label: "Few Good Words (Hindi)", text: fewGoodWordsHindi, color: greenAccent },
  { label: "Few Good Words (English)", text: fewGoodWordsEnglish, color: pinkAccent },
];

const PrayerOath = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    toast.info(`Switched to ${content[newValue].label}`, {
      position: "bottom-center",
      autoClose: 2000,
      theme: "dark",
    });
  };

  const renderContent = () => {
    const selectedText = content[tabValue].text;
    const stanzas = selectedText.split("\n\n"); // Split by empty lines to separate stanzas
    const colors = [greenAccent, pinkAccent, violetAccent]; // Cycle through colors

    return (
      <Box sx={{ p: 4 }}>
        {stanzas.map((stanza, index) => {
          const color = colors[index % colors.length]; // Cycle colors for each stanza
          const lines = stanza.split("\n");
          return (
            <div key={index}>
              {lines.map((line, lineIndex) => (
                <Typography
                  key={`${index}-${lineIndex}`}
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: "1.8",
                    mb: line.trim() === "" ? 2 : 0,
                    whiteSpace: "pre-wrap",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: `<span style="color: ${color}">${line}</span>`,
                  }}
                />
              ))}
              {index < stanzas.length - 1 && <br />}
            </div>
          );
        })}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        top: `${appBarHeight}px`,
        left: `${drawerWidth}px`,
        bgcolor: "#181818",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
        display: "flex",
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Box sx={{ width: "15vw", bgcolor: "#333", overflowY: "auto", height: "100%" }}>
        <Tabs
          orientation="vertical"
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              color: "#fff",
              textAlign: "left",
              alignItems: "flex-start",
              padding: "12px 16px",
              "&.Mui-selected": {
                bgcolor: "#444",
              },
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          {content.map((item, index) => (
            <Tab
              key={index}
              label={item.label}
              sx={{
                "&.Mui-selected": { color: item.color },
                "&:hover": { bgcolor: "#555" },
              }}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ width: "65vw", p: 4, overflowY: "scroll" }}>
        <Typography variant="h5" sx={{ color: greenAccent, mb: 2 }}>
          Institutional Prayer, Oath & Good Words
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default PrayerOath;