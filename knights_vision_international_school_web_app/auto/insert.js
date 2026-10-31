const axios = require('axios');
const rawMappings =
[
{
"id": 1,
"date": "2025-01-01",
"title": "New Year's Day"
},
{
"id": 2,
"date": "2025-01-06",
"title": "Guru Govind Singh Jayanti"
},
{
"id": 3,
"date": "2025-01-14",
"title": "Pongal"
},
{
"id": 4,
"date": "2025-01-14",
"title": "Makar Sankranti"
},
{
"id": 5,
"date": "2025-01-14",
"title": "Hazarat Ali's Birthday"
},
{
"id": 6,
"date": "2025-01-26",
"title": "Republic Day"
},
{
"id": 7,
"date": "2025-02-02",
"title": "Vasant Panchami"
},
{
"id": 8,
"date": "2025-02-12",
"title": "Guru Ravidas Jayanti"
},
{
"id": 9,
"date": "2025-02-19",
"title": "Shivaji Jayanti"
},
{
"id": 10,
"date": "2025-02-23",
"title": "Maharishi Dayanand Saraswati Jayanti"
},
{
"id": 11,
"date": "2025-02-26",
"title": "Maha Shivaratri/Shivaratri"
},
{
"id": 12,
"date": "2025-03-13",
"title": "Holika Dahana"
},
{
"id": 13,
"date": "2025-03-14",
"title": "Holi"
},
{
"id": 14,
"date": "2025-03-14",
"title": "Dolyatra"
},
{
"id": 15,
"date": "2025-03-28",
"title": "Jamat Ul-Vida"
},
{
"id": 16,
"date": "2025-03-30",
"title": "Chaitra Sukhladi"
},
{
"id": 17,
"date": "2025-03-30",
"title": "Ugadi"
},
{
"id": 18,
"date": "2025-03-30",
"title": "Gudi Padwa"
},
{
"id": 19,
"date": "2025-03-31",
"title": "Ramzan Id"
},
{
"id": 20,
"date": "2025-04-06",
"title": "Rama Navami"
},
{
"id": 21,
"date": "2025-04-10",
"title": "Mahavir Jayanti"
},
{
"id": 22,
"date": "2025-04-13",
"title": "Vaisakhi"
},
{
"id": 23,
"date": "2025-04-14",
"title": "Mesadi"
},
{
"id": 24,
"date": "2025-04-15",
"title": "Bahag Bihu/Vaisakhadi"
},
{
"id": 25,
"date": "2025-04-18",
"title": "Good Friday"
},
{
"id": 26,
"date": "2025-04-20",
"title": "Easter Day"
},
{
"id": 27,
"date": "2025-05-12",
"title": "Buddha Purnima/Vesak"
},
{
"id": 28,
"date": "2025-06-07",
"title": "Bakrid"
},
{
"id": 29,
"date": "2025-06-27",
"title": "Rath Yatra"
},
{
"id": 30,
"date": "2025-07-06",
"title": "Muharram/Ashura"
},
{
"id": 31,
"date": "2025-08-09",
"title": "Raksha Bandhan (Rakhi)"
},
{
"id": 32,
"date": "2025-08-15",
"title": "Independence Day"
},
{
"id": 33,
"date": "2025-08-27",
"title": "Ganesh Chaturthi/Vinayaka Chaturthi"
},
{
"id": 34,
"date": "2025-09-05",
"title": "Milad un-Nabi/Id-e-Milad"
},
{
"id": 35,
"date": "2025-09-07",
"title": "Janmashtami"
},
{
"id": 36,
"date": "2025-09-22",
"title": "Onam"
},
{
"id": 37,
"date": "2025-09-29",
"title": "First Day of Sharad Navratri"
},
{
"id": 38,
"date": "2025-10-02",
"title": "Mahatma Gandhi Jayanti"
},
{
"id": 39,
"date": "2025-10-02",
"title": "Dussehra"
},
{
"id": 40,
"date": "2025-10-21",
"title": "Diwali/Deepavali"
},
{
"id": 41,
"date": "2025-10-22",
"title": "Kali Puja"
},
{
"id": 42,
"date": "2025-11-05",
"title": "Guru Nanak Jayanti"
},
{
"id": 43,
"date": "2025-12-25",
"title": "Christmas Day"
},
{
"id": 44,
"date": "2026-01-01",
"title": "New Year's Day"
},
{
"id": 45,
"date": "2026-01-03",
"title": "Hazarat Ali's Birthday"
},
{
"id": 46,
"date": "2026-01-14",
"title": "Pongal"
},
{
"id": 47,
"date": "2026-01-14",
"title": "Makar Sankranti"
},
{
"id": 48,
"date": "2026-01-23",
"title": "Vasant Panchami"
},
{
"id": 49,
"date": "2026-01-26",
"title": "Republic Day"
},
{
"id": 50,
"date": "2026-02-01",
"title": "Guru Ravidas Jayanti"
},
{
"id": 51,
"date": "2026-02-12",
"title": "Maharishi Dayanand Saraswati Jayanti"
},
{
"id": 52,
"date": "2026-02-15",
"title": "Maha Shivaratri/Shivaratri"
},
{
"id": 53,
"date": "2026-02-19",
"title": "Shivaji Jayanti"
},
{
"id": 54,
"date": "2026-03-03",
"title": "Holika Dahana"
},
{
"id": 55,
"date": "2026-03-04",
"title": "Holi"
},
{
"id": 56,
"date": "2026-03-19",
"title": "Ugadi"
},
{
"id": 57,
"date": "2026-03-19",
"title": "Gudi Padwa"
},
{
"id": 58,
"date": "2026-03-20",
"title": "Jamat Ul-Vida"
},
{
"id": 59,
"date": "2026-03-21",
"title": "Ramzan Id"
},
{
"id": 60,
"date": "2026-03-26",
"title": "Rama Navami"
},
{
"id": 61,
"date": "2026-03-31",
"title": "Mahavir Jayanti"
},
{
"id": 62,
"date": "2026-04-03",
"title": "Good Friday"
},
{
"id": 63,
"date": "2026-04-05",
"title": "Easter Day"
},
{
"id": 64,
"date": "2026-04-14",
"title": "Vaisakhi"
},
{
"id": 65,
"date": "2026-04-14",
"title": "Mesadi"
},
{
"id": 66,
"date": "2026-04-15",
"title": "Bahag Bihu/Vaisakhadi"
},
{
"id": 67,
"date": "2026-05-01",
"title": "Buddha Purnima/Vesak"
},
{
"id": 68,
"date": "2026-05-27",
"title": "Bakrid"
},
{
"id": 69,
"date": "2026-06-26",
"title": "Muharram/Ashura"
},
{
"id": 70,
"date": "2026-07-16",
"title": "Rath Yatra"
},
{
"id": 71,
"date": "2026-08-15",
"title": "Independence Day"
},
{
"id": 72,
"date": "2026-08-26",
"title": "Milad un-Nabi/Id-e-Milad"
},
{
"id": 73,
"date": "2026-08-26",
"title": "Onam"
},
{
"id": 74,
"date": "2026-08-28",
"title": "Raksha Bandhan (Rakhi)"
},
{
"id": 75,
"date": "2026-09-04",
"title": "Janmashtami"
},
{
"id": 76,
"date": "2026-09-14",
"title": "Ganesh Chaturthi/Vinayaka Chaturthi"
},
{
"id": 77,
"date": "2026-10-02",
"title": "Mahatma Gandhi Jayanti"
},
{
"id": 78,
"date": "2026-10-07",
"title": "Dussehra"
},
{
"id": 79,
"date": "2026-10-20",
"title": "Diwali/Deepavali"
},
{
"id": 80,
"date": "2026-10-21",
"title": "Kali Puja"
},
{
"id": 81,
"date": "2026-11-07",
"title": "Guru Nanak Jayanti"
},
{
"id": 82,
"date": "2026-12-25",
"title": "Christmas Day"
},
{
"id": 83,
"date": "2027-01-01",
"title": "New Year's Day"
},
{
"id": 84,
"date": "2027-01-15",
"title": "Pongal"
},
{
"id": 85,
"date": "2027-01-15",
"title": "Makar Sankranti"
},
{
"id": 86,
"date": "2027-01-26",
"title": "Republic Day"
},
{
"id": 87,
"date": "2027-02-11",
"title": "Vasant Panchami"
},
{
"id": 88,
"date": "2027-02-19",
"title": "Shivaji Jayanti"
},
{
"id": 89,
"date": "2027-03-06",
"title": "Maha Shivaratri/Shivaratri"
},
{
"id": 90,
"date": "2027-03-10",
"title": "Ramzan Id"
},
{
"id": 91,
"date": "2027-03-22",
"title": "Holi"
},
{
"id": 92,
"date": "2027-03-26",
"title": "Good Friday"
},
{
"id": 93,
"date": "2027-03-28",
"title": "Easter Day"
},
{
"id": 94,
"date": "2027-04-07",
"title": "Ugadi"
},
{
"id": 95,
"date": "2027-04-07",
"title": "Gudi Padwa"
},
{
"id": 96,
"date": "2027-04-14",
"title": "Ambedkar Jayanti"
},
{
"id": 97,
"date": "2027-04-15",
"title": "Rama Navami"
},
{
"id": 98,
"date": "2027-05-17",
"title": "Bakrid"
},
{
"id": 99,
"date": "2027-06-16",
"title": "Muharram/Ashura"
},
{
"id": 100,
"date": "2027-07-05",
"title": "Rath Yatra"
},
{
"id": 101,
"date": "2027-08-15",
"title": "Independence Day"
},
{
"id": 102,
"date": "2027-08-17",
"title": "Raksha Bandhan (Rakhi)"
},
{
"id": 103,
"date": "2027-08-25",
"title": "Janmashtami"
},
{
"id": 104,
"date": "2027-09-04",
"title": "Ganesh Chaturthi/Vinayaka Chaturthi"
},
{
"id": 105,
"date": "2027-09-12",
"title": "Onam"
},
{
"id": 106,
"date": "2027-10-02",
"title": "Mahatma Gandhi Jayanti"
},
{
"id": 107,
"date": "2027-10-09",
"title": "Dussehra"
},
{
"id": 108,
"date": "2027-10-18",
"title": "Karaka Chaturthi (Karva Chauth)"
},
{
"id": 109,
"date": "2027-10-29",
"title": "Diwali/Deepavali"
},
{
"id": 110,
"date": "2027-11-08",
"title": "Guru Nanak Jayanti"
},
{
"id": 111,
"date": "2027-12-25",
"title": "Christmas Day"
}
]
async function insertAll() {
  for (const mapping of rawMappings) {
    try {
      const response = await axios.post('http://localhost:3000/api/holidays', mapping);
      console.log("response", response.status)
      console.log(`✅ Inserted:  ${mapping.problemId} with [${mapping.serviceIds.join(', ')}]`);
    } catch (error) {
      console.error(`❌ Error inserting${mapping.problemId}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  }
}

insertAll();
