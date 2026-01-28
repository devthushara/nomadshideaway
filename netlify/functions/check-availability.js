const ical = require('node-ical');

// MASTER LIST OF CALENDARS
const CALENDARS = [
  // 1. YOUR MASTER GOOGLE CALENDAR
  { 
    name: "Master Google Calendar", 
    url: "https://calendar.google.com/calendar/ical/cdaead7995b148f4bdfd8f5cede61fa5fcb3fd79a937784e90dd6dad6d499cca%40group.calendar.google.com/private-d6a064087e11f9355affc1aaa7dbc817/basic.ics" 
  },
  // 2. OTAs
  { name: "Agoda", url: "https://ycs.agoda.com/en-us/api/ari/icalendar?key=3H8q6KKRqLNpbdl%2bryd2lK85BS8jgGGN" },
  { name: "VRBO", url: "http://www.vrbo.com/icalendar/642b7d1b505a47f393f9e7335799917f.ics?nonTentative" },
  { name: "Ctrip", url: "https://ebooking.ctrip.com/ebkovsroom/icalendar/export/3cc2b32f-19e7-4c99-a321-13e97895876d.ics" },
  { name: "Your.rentals", url: "https://ical.your.rentals/export/ical/pBk2EXO0xQ3geY489ODY4a97znKN1dJ5/en.ics" },
  { name: "Booking.com", url: "https://ical.booking.com/v1/export?t=b691e70b-4304-4961-b94c-b1b0c0426eae" },
  { name: "Airbnb", url: "https://www.airbnb.com.sg/calendar/ical/1455899583985865476.ics?t=78329a5831774bbb932860d9dd5bb8f3" }
];

async function fetchCalendarSafely(calendarConfig) {
  try {
    const data = await ical.async.fromURL(calendarConfig.url);
    return { name: calendarConfig.name, data, success: true };
  } catch (error) {
    console.warn(`Failed to fetch ${calendarConfig.name}: ${error.message}`);
    return { name: calendarConfig.name, data: {}, success: false };
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const { checkIn, checkOut } = JSON.parse(event.body);
    if (!checkIn || !checkOut) throw new Error("Missing dates");

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    if (isNaN(start) || isNaN(end)) throw new Error("Invalid date format");
    if (start >= end) throw new Error("Check-out must be after check-in");

    let isBlocked = false;
    let blockedBy = [];
    
    const results = await Promise.all(CALENDARS.map(cal => fetchCalendarSafely(cal)));

    results.forEach(({ name, data, success }) => {
      if (!success) return;

      for (let k in data) {
        if (data.hasOwnProperty(k)) {
          const ev = data[k];
          if (ev && ev.type === 'VEVENT') {
            const evStart = new Date(ev.start);
            const evEnd = new Date(ev.end);
            
            if (evStart < end && evEnd > start) {
              if (ev.transparency !== 'TRANSPARENT') {
                isBlocked = true;
                blockedBy.push(name);
              }
            }
          }
        }
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        available: !isBlocked, 
        blockedBy: isBlocked ? [...new Set(blockedBy)] : [] 
      })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
