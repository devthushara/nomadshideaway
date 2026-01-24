const ical = require('node-ical');

// MASTER LIST OF CALENDARS
const CALENDARS = [
  // 1. YOUR MASTER GOOGLE CALENDAR (The Source of Truth)
  { 
    name: "Master Google Calendar", 
    url: "https://calendar.google.com/calendar/ical/cdaead7995b148f4bdfd8f5cede61fa5fcb3fd79a937784e90dd6dad6d499cca%40group.calendar.google.com/private-d6a064087e11f9355affc1aaa7dbc817/basic.ics" 
  },
  // 2. OTAs (Backups for safety)
  { name: "Agoda", url: "https://ycs.agoda.com/en-us/api/ari/icalendar?key=3H8q6KKRqLNpbdl%2bryd2lK85BS8jgGGN" },
  { name: "VRBO", url: "http://www.vrbo.com/icalendar/642b7d1b505a47f393f9e7335799917f.ics?nonTentative" },
  { name: "Ctrip", url: "https://ebooking.ctrip.com/ebkovsroom/icalendar/export/3cc2b32f-19e7-4c99-a321-13e97895876d.ics" },
  { name: "Your.rentals", url: "https://ical.your.rentals/export/ical/pBk2EXO0xQ3geY489ODY4a97znKN1dJ5/en.ics" },
  { name: "Booking.com", url: "https://ical.booking.com/v1/export?t=b691e70b-4304-4961-b94c-b1b0c0426eae" },
  { name: "Airbnb", url: "https://www.airbnb.com.sg/calendar/ical/1455899583985865476.ics?t=78329a5831774bbb932860d9dd5bb8f3" }
];

const PRICING = {
  baseNightlyRate: 35,
  directBookingDiscount: 0.15,
  cleaningFee: 25,
  serviceFee: 0.1
};

async function fetchCalendarSafely(calendarConfig) {
  try {
    const data = await ical.async.fromURL(calendarConfig.url);
    return { name: calendarConfig.name, data, success: true };
  } catch (error) {
    console.warn(`Failed to fetch ${calendarConfig.name}: ${error.message}`);
    return { name: calendarConfig.name, data: {}, success: false };
  }
}

function calculatePrice(checkInDate, checkOutDate) {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  if (nights < 1) return null;

  const roomCost = nights * PRICING.baseNightlyRate;
  const serviceFee = roomCost * PRICING.serviceFee;
  const otaPrice = roomCost + serviceFee + PRICING.cleaningFee;
  const directPrice = otaPrice * (1 - PRICING.directBookingDiscount);
  
  return {
    nights,
    roomCost,
    cleaningFee: PRICING.cleaningFee,
    serviceFee,
    otaTotal: Math.round(otaPrice),
    directTotal: Math.round(directPrice),
    savings: Math.round(otaPrice - directPrice)
  };
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
    
    // Validate dates
    if (isNaN(start) || isNaN(end)) throw new Error("Invalid date format");
    if (start >= end) throw new Error("Check-out must be after check-in");

    let isBlocked = false;
    let blockedBy = [];
    
    // Fetch all calendars
    const results = await Promise.all(CALENDARS.map(cal => fetchCalendarSafely(cal)));

    results.forEach(({ name, data, success }) => {
      if (!success) return;

      for (let k in data) {
        if (data.hasOwnProperty(k)) {
          const ev = data[k];
          if (ev && ev.type === 'VEVENT') {
            const evStart = new Date(ev.start);
            const evEnd = new Date(ev.end);
            
            // Availability Logic: (EventStart < UserEnd) AND (EventEnd > UserStart)
            if (evStart < end && evEnd > start) {
              // Ignore "Transparent" events (usually notes, not bookings)
              if (ev.transparency !== 'TRANSPARENT') {
                isBlocked = true;
                blockedBy.push({ platform: name, start: evStart, end: evEnd });
              }
            }
          }
        }
      }
    });

    const pricing = calculatePrice(checkIn, checkOut);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ available: !isBlocked, pricing, blockedBy })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};