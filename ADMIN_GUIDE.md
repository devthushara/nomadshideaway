# ADMIN GUIDE - BOOKING SYSTEM MANAGEMENT

## Dashboard Overview

The booking system sends booking requests through two channels:

### 1. WhatsApp Bookings
- Guest sends booking details via WhatsApp
- Admin receives message in WhatsApp
- Admin confirms & sends payment instructions

### 2. Stripe Bookings
- Guest pays directly via Stripe
- Payment automatically confirmed
- Email receipt sent to guest

## Booking Status Flow

```
Guest Selects Dates
        ↓
[Check Availability]
        ↓
Modal Opens → Guest Adds Details
     ├─ Guests Count
     ├─ Vehicle Selection
     └─ Confirms Terms
        ↓
[Choose Payment]
     ├─ WhatsApp → Guest sends message → Admin confirms
     └─ Stripe → Payment processed → Auto-confirmed
        ↓
Booking Confirmed!
```

## Managing WhatsApp Bookings

### Receive Booking Request

When a guest chooses WhatsApp payment, they'll send:

```
🏡 NOMADS HIDEAWAY - BOOKING REQUEST

📅 Check-in: Jan 15, 2025
📅 Check-out: Jan 18, 2025
👥 Guests: 2
🚲 Vehicle: Scooter Rental

💰 Total: $385

Please confirm this booking and send payment instructions.
```

### Confirm Booking (WhatsApp Response Template)

```
Hi [Guest Name]! 👋

Thanks for your interest in Nomads Hideaway! ✨

We confirm your booking:
📅 Check-in: Jan 15, 2025 (2 PM check-in)
📅 Check-out: Jan 18, 2025 (11 AM check-out)
👥 Guests: 2
🚲 Vehicle: Scooter Rental
💰 Total: $385

🔐 Payment Options:
1. Stripe: https://pay.stripe.com/...
2. Wise Transfer: Account details below
3. Cryptocurrency: Bitcoin address below
4. SG PayNow: UEN details below
5. Bank Transfer: Account details below

[Include your payment details for each method]

Please let us know which method you'd prefer! 💙
```

### Payment Tracking

Keep a simple spreadsheet:

| Date Requested | Guest Name | Check-in | Check-out | Total | Payment Method | Paid? | Confirmation |
|---|---|---|---|---|---|---|---|
| Jan 10 | John Doe | Jan 15 | Jan 18 | $385 | Wise | ✅ | Jan 11 |
| Jan 12 | Jane Smith | Feb 1 | Feb 5 | $480 | Crypto | ⏳ | Pending |

## Managing Stripe Bookings

### Automatic Flow

1. Guest pays via Stripe
2. Payment processed instantly
3. Confirmation email sent automatically
4. Booking confirmed in system

### Monitor Stripe Dashboard

- Log in to [Stripe Dashboard](https://dashboard.stripe.com)
- Check "Payments" section
- Verify amounts match booking totals
- Setup alerts for failed payments

### Email Template for Stripe Bookings

```
Subject: Booking Confirmation - Nomads Hideaway

Dear [Guest Name],

Thank you for booking with Nomads Hideaway! 🏠

Your payment of $[AMOUNT] has been received.

Booking Details:
📅 Check-in: [DATE] at 2:00 PM
📅 Check-out: [DATE] at 11:00 AM
👥 Guests: [COUNT]
🚲 Vehicle: [VEHICLE TYPE]

Next Steps:
1. Check your email for check-in instructions
2. Contact us 7 days before arrival
3. Download our house guide

Questions? Reply to this email or WhatsApp us.

Looking forward to hosting you! 💙

Lionel & Priyanka
Nomads Hideaway
WhatsApp: +94 70 282 7221
```

## Availability Management

### Update Hardcoded Dates (Current System)

Edit `booking-system.js`:

```javascript
unavailableDates: [
    '2024-12-20', '2024-12-21', '2024-12-22',  // Holiday bookings
    '2024-12-25', '2024-12-26',                 // Christmas
    '2025-01-15', '2025-01-16',                 // Maintenance
    '2025-02-10', '2025-02-11', '2025-02-12'   // Another booking
]
```

### Auto-Sync with Calendar (Future)

Once Netlify function is configured:

1. Guest calendars (Airbnb, Booking.com, VRBO)
2. Master calendar automatically syncs
3. No manual date entry needed
4. Real-time availability

## Reporting & Analytics

### Monthly Booking Report

Track these metrics:

- **Total Bookings**: X
- **Total Revenue**: $X
- **Occupancy Rate**: X%
- **Average Guest Count**: X
- **Most Popular Vehicle**: [Vehicle]
- **Most Common Stay Length**: X nights

### Seasonal Trends

- Peak months
- Low months
- Pricing adjustments needed
- Marketing focus areas

## System Maintenance

### Daily Checklist

- [ ] Check WhatsApp for new booking requests
- [ ] Respond to all bookings within 2 hours
- [ ] Update availability calendar
- [ ] Confirm received payments

### Weekly Checklist

- [ ] Review Stripe dashboard
- [ ] Reconcile WhatsApp bookings with master list
- [ ] Check email confirmations sent
- [ ] Update occupancy forecast

### Monthly Checklist

- [ ] Generate booking report
- [ ] Analyze pricing effectiveness
- [ ] Review guest feedback
- [ ] Plan maintenance dates
- [ ] Update marketing strategy

## Pricing & Discounts

### Current Pricing

- **Base Rate**: $120/night
- **Scooter Add-on**: $25/night
- **Car Add-on**: $60/night
- **Cleaning Fee**: Included

### Seasonal Adjustments

To change pricing for seasons, edit `BOOKING_CONFIG`:

```javascript
// High Season (Dec 15 - Jan 15): +20%
// Low Season (May - Aug): -15%

// Example: Dynamic pricing function
function getPrice(checkInDate) {
    const month = checkInDate.getMonth();
    if (month >= 11 || month === 0) return 144; // High season
    if (month >= 4 && month <= 7) return 102;   // Low season
    return 120; // Regular
}
```

### Apply Discounts

For special cases, offer:
- Long stay discount (7+ nights): -10%
- Early booking discount (30+ days): -5%
- Group discount (3+ villas): -15%

Manually apply in WhatsApp confirmations.

## Guest Communication

### Pre-Check-in (7 Days Before)

```
Hi [Guest]! 

We're excited to welcome you to Nomads Hideaway in 7 days! 🌴

Quick reminders:
✓ Check-in: [DATE] at 2 PM
✓ Location: [ADDRESS]
✓ WiFi Password: [PASSWORD]
✓ Emergency Contact: [PHONE]

See you soon! 💙
```

### 24 Hours Before Check-in

```
One day to go! 🎉

Check-in details:
📍 Meeting point: [LOCATION]
🔑 Key pickup: [METHOD]
🚗 Parking: [INFO]
📞 Call/WhatsApp if you're running late

Safe travels! See you tomorrow! 🏠
```

### Post Check-out (24 Hours After)

```
Thanks for staying with us! 💙

We hope you loved Nomads Hideaway! 

Please leave us a review:
⭐ Google: [LINK]
⭐ TripAdvisor: [LINK]
⭐ Airbnb: [LINK]

Hope to see you again soon! 🌴
```

## Troubleshooting

### Booking Not Appearing in System

1. Check WhatsApp for messages
2. Verify dates in booking request
3. Check if guest completed payment
4. Look in Stripe dashboard for pending payments

### Guest Can't See Available Dates

1. Clear browser cache
2. Check current unavailable dates
3. Verify date format (YYYY-MM-DD)
4. Test in different browser

### WhatsApp Message Not Sending

1. Verify WhatsApp phone number is correct
2. Check guest has WhatsApp installed
3. Verify internet connection
4. Test link: `https://wa.me/94702827221`

### Payment Failed

1. Check Stripe dashboard for error
2. Contact guest about payment method
3. Offer alternative payment methods
4. Retry payment via WhatsApp

## Integration Checklist

- [ ] Configure Stripe keys in environment
- [ ] Setup Netlify function for Stripe sessions
- [ ] Configure email service (SMTP/SendGrid)
- [ ] Setup WhatsApp business account (optional)
- [ ] Create admin dashboard for bookings
- [ ] Setup payment notifications
- [ ] Configure auto-emails
- [ ] Test entire booking flow
- [ ] Train staff on system
- [ ] Deploy to production

## Security Protocols

1. **Payment Security**
   - Never ask for card details via WhatsApp
   - Always use Stripe for card payments
   - Keep Stripe keys secure

2. **Data Protection**
   - Store guest info securely
   - Delete old booking data after 2 years
   - GDPR compliant
   - Privacy policy linked in booking

3. **Communication**
   - Use WhatsApp Business (verified badge)
   - No personal account for business
   - Keep conversation history
   - Archive completed bookings

## Emergency Contacts

Keep ready:

- Stripe Support: [contact info]
- WhatsApp Business: [contact info]
- Email Provider: [contact info]
- Payment Processor: [contact info]

## Staff Training

When onboarding staff:

1. Show WhatsApp booking response process
2. Demonstrate Stripe dashboard
3. Practice guest communication
4. Review calendar management
5. Test emergency protocols
6. Review pricing policies
7. Show refund process

## Feedback & Improvement

Track issues & improvements:

- [ ] Guest feedback on booking process
- [ ] Staff suggestions
- [ ] Technical improvements needed
- [ ] Pricing adjustments
- [ ] Communication timing
- [ ] Payment method feedback

---

**Quick Links**

- 🏠 Main Site: https://nomadshideaway.com
- 📱 WhatsApp: https://wa.me/94702827221
- 💳 Stripe Dashboard: https://dashboard.stripe.com
- 📧 Email Manager: [Your email service]
- 📊 Booking Analytics: [Your analytics tool]

**Support Team**

- Manager: [Name] - [Email]
- Backup: [Name] - [Email]

---

*Last Updated: 2024*
*System Version: 1.0.0*
