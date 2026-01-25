# BOOKING SYSTEM - QUICK START GUIDE

## For Users (Guests)

### How to Book

1. **Visit the booking section** on the homepage
2. **Select dates**
   - Click "Check In" field and pick arrival date
   - Click "Check Out" field and pick departure date
3. **Click "Check Availability"**
4. **Complete the booking modal:**
   - ✅ Confirm dates are available
   - 👥 Select number of guests (1 or 2)
   - 🚗 Choose vehicle (scooter, car, or none)
   - 💵 Review price breakdown
   - ☑️ Accept terms & conditions
5. **Choose payment method:**
   - 💳 **Card**: Pay with Stripe (Visa, Mastercard, Amex)
   - 💬 **WhatsApp**: Send booking details via WhatsApp

### Payment Methods

**Option 1: Card Payment (Stripe)**
- Most secure
- Instant confirmation
- Receipt sent to email

**Option 2: WhatsApp Booking**
- Send booking details via WhatsApp
- Hosts will confirm & send payment instructions
- Alternative payment methods available:
  - 🔄 Wise (TransferWise)
  - ₿ Cryptocurrency
  - 🏦 SG PayNow
  - 🏧 Bank Transfer

## For Developers

### Quick Configuration

**Edit `BOOKING_CONFIG` in `booking-system.js`:**

```javascript
const BOOKING_CONFIG = {
    basePrice: 120,              // Change nightly rate
    maxGuests: 2,               // Max guests
    whatsappNumber: '+94....',  // Your WhatsApp number
    
    vehicles: {
        none: { name: '...', price: 0 },
        scooter: { name: '...', price: 25 },
        car: { name: '...', price: 60 }
    },
    
    unavailableDates: [
        '2024-12-20',  // Add blocked dates here
        '2024-12-21'
    ]
};
```

### Setup Stripe

1. Get keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Replace `pk_test_YOUR_STRIPE_KEY` in `booking-system.js`
3. Create Netlify function: `netlify/functions/create-stripe-session.js`
4. Setup webhook listener

### Enable WhatsApp

1. Verify phone number in `BOOKING_CONFIG.whatsappNumber`
2. Make sure it's in international format: `+country_codenumber`
3. Test with: `https://wa.me/94702827221?text=Hello`

### Add Real Availability

Replace hardcoded dates with Netlify function:

```javascript
// In AvailabilityChecker.checkAvailability():
const response = await fetch('/.netlify/functions/check-availability', {
    method: 'POST',
    body: JSON.stringify({
        checkIn: startDate.toISOString(),
        checkOut: endDate.toISOString()
    })
});
const data = await response.json();
return { available: data.available, ... };
```

## File Locations

| File | Purpose | Edit? |
|------|---------|-------|
| `booking-system.js` | Main booking logic | ✏️ Config & customization |
| `index.html` | Booking bar & modal CSS | ⚠️ Only if needed |
| `netlify/functions/check-availability.js` | Calendar sync | ✏️ Add more calendars |
| `netlify/functions/save-booking.js` | Booking confirmation | ✏️ Add email/SMS |

## What's Included

### ✅ Features Already Built
- Date picker with flatpickr
- Availability checking (hardcoded)
- Guest count selector
- Vehicle rental options
- Price calculator with breakdown
- WhatsApp integration
- Terms & conditions checkbox
- Responsive modal design
- Mobile-friendly interface

### ⏳ Ready to Add
- Stripe payment processing
- Dynamic availability from calendar
- Email confirmations
- Admin dashboard
- Booking management system
- Multi-language support

## Testing Checklist

- [ ] Test date selection
- [ ] Test availability checking
- [ ] Test guest count changes (price updates)
- [ ] Test vehicle selection (price updates)
- [ ] Test WhatsApp message generation
- [ ] Test terms acceptance (button disabled without check)
- [ ] Test mobile responsiveness
- [ ] Test modal opening/closing
- [ ] Test all browser compatibility

## Customization Examples

### Change Colors to Match Your Brand

In `index.html` CSS:
```css
--mango: #FFB347;    /* Primary button color */
--leaf: #2E8B57;     /* Accent color */
--sand: #F9F7F2;     /* Background */
--text: #333333;     /* Text color */
```

### Add More Unavailable Dates

In `booking-system.js`:
```javascript
unavailableDates: [
    '2025-12-25',    // Christmas
    '2025-01-01',    // New Year
    '2025-05-01',    // Labour Day
    '2025-08-15'     // Your festival
]
```

### Change Vehicle Options

In `booking-system.js`:
```javascript
vehicles: {
    none: { 
        name: 'No Vehicle', 
        price: 0, 
        description: 'Walking/Tuk-tuk only' 
    },
    bicycle: { 
        name: 'Bicycle Rental', 
        price: 10, 
        description: 'Daily bike rental' 
    },
    jeep: { 
        name: 'Jeep Rental', 
        price: 85, 
        description: 'With or without driver' 
    }
}
```

## Common Questions

**Q: How do guests pay with WhatsApp?**  
A: They send the booking details via WhatsApp, and hosts confirm payment method (Wise, crypto, PayNow, bank transfer).

**Q: Can I add more than 2 guests?**  
A: Change `maxGuests` in `BOOKING_CONFIG`, but you'll need to update villa capacity docs.

**Q: How do I change the nightly rate?**  
A: Edit `basePrice: 120` to your desired price in `BOOKING_CONFIG`.

**Q: Can guests edit their booking after sending WhatsApp?**  
A: Yes, they contact via WhatsApp to discuss changes before payment.

**Q: How often do availability dates sync?**  
A: Currently hardcoded. For real-time sync, implement the Netlify function to fetch from Google Calendar, Airbnb, etc.

## Performance Tips

- Compress images for booking modal (if added)
- Lazy-load WhatsApp script if needed
- Cache availability data for 1 hour
- Minify `booking-system.js` for production

## Security Reminders

- ✅ Never expose Stripe secret key (use Netlify function)
- ✅ Validate all dates on server-side
- ✅ Use HTTPS only
- ✅ Verify WhatsApp phone number
- ✅ Setup CORS properly for API calls
- ✅ Require terms acceptance

## Next Steps

1. [ ] Test booking flow end-to-end
2. [ ] Setup Stripe account & keys
3. [ ] Create Stripe session Netlify function
4. [ ] Setup webhook for payment confirmation
5. [ ] Configure email notifications
6. [ ] Setup admin dashboard
7. [ ] Test with real dates
8. [ ] Deploy to production

## Support

- Check `BOOKING_SYSTEM.md` for detailed docs
- Review `booking-system.js` code comments
- Test in browser developer console
- Check Netlify function logs for errors

---

**Happy Booking! 🏠** 🌴
