/**
 * BOOKING SYSTEM - API PAYLOADS & INTEGRATION EXAMPLES
 * 
 * This file documents all API requests/responses for backend integration
 */

// ============================================================================
// 1. AVAILABILITY CHECK REQUEST
// ============================================================================

// Frontend sends POST to /.netlify/functions/check-availability
POST /.netlify/functions/check-availability
Content-Type: application/json

{
    "checkIn": "2025-01-15T00:00:00.000Z",
    "checkOut": "2025-01-18T00:00:00.000Z"
}

// Expected Response (Available)
{
    "available": true,
    "nights": 3,
    "dateRange": ["2025-01-15", "2025-01-16", "2025-01-17"],
    "unavailableDates": [],
    "pricing": {
        "basePrice": 120,
        "nights": 3,
        "directTotal": 360,
        "otaTotal": 425,
        "savings": 65
    }
}

// Expected Response (Unavailable)
{
    "available": false,
    "nights": 3,
    "dateRange": ["2025-01-15", "2025-01-16", "2025-01-17"],
    "unavailableDates": ["2025-01-16"],
    "pricing": null
}

// ============================================================================
// 2. CREATE STRIPE SESSION REQUEST
// ============================================================================

// Frontend sends POST to /.netlify/functions/create-stripe-session
// TO BE IMPLEMENTED - Example payload below

POST /.netlify/functions/create-stripe-session
Content-Type: application/json

{
    "checkIn": "2025-01-15",
    "checkOut": "2025-01-18",
    "nights": 3,
    "guestCount": 2,
    "vehicle": "scooter",
    "totalPrice": 385,
    "guestEmail": "guest@example.com",
    "guestName": "John Doe",
    "guestPhone": "+1234567890"
}

// Expected Response
{
    "sessionId": "cs_test_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6Q7r8S9t0u1V2w3X4y5Z",
    "redirectUrl": "https://checkout.stripe.com/pay/cs_test_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6Q7r8S9t0u1V2w3X4y5Z",
    "bookingId": "booking_1704067200000"
}

// ============================================================================
// 3. SAVE BOOKING REQUEST (WhatsApp or Stripe)
// ============================================================================

// Frontend sends POST to /.netlify/functions/save-booking
// Called after WhatsApp message OR after successful Stripe payment

POST /.netlify/functions/save-booking
Content-Type: application/json

// WhatsApp Booking Example
{
    "id": "booking_1704067200000",
    "timestamp": "2024-01-01T12:00:00Z",
    "paymentMethod": "whatsapp",
    "checkIn": "2025-01-15",
    "checkOut": "2025-01-18",
    "nights": 3,
    "guests": 2,
    "vehicle": "scooter",
    "totalPrice": 385,
    "status": "pending",
    "contactInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
    }
}

// Stripe Booking Example
{
    "id": "booking_1704067200000",
    "timestamp": "2024-01-01T12:00:00Z",
    "paymentMethod": "stripe",
    "stripeSessionId": "cs_test_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6Q7r8S9t0u1V2w3X4y5Z",
    "stripePaymentIntentId": "pi_1234567890abcdef",
    "checkIn": "2025-01-15",
    "checkOut": "2025-01-18",
    "nights": 3,
    "guests": 2,
    "vehicle": "scooter",
    "totalPrice": 385,
    "status": "confirmed",
    "contactInfo": {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+9876543210"
    }
}

// Expected Response
{
    "success": true,
    "bookingId": "booking_1704067200000",
    "message": "Booking saved successfully",
    "confirmationNumber": "NH-2025-0001"
}

// ============================================================================
// 4. STRIPE WEBHOOK - PAYMENT INTENT SUCCEEDED
// ============================================================================

// Stripe sends POST to /.netlify/functions/stripe-webhook
// When payment is successfully processed

POST /.netlify/functions/stripe-webhook
Content-Type: application/json

{
    "id": "evt_1234567890abcdef",
    "object": "event",
    "api_version": "2023-10-16",
    "created": 1704067200,
    "data": {
        "object": {
            "id": "pi_1234567890abcdef",
            "object": "payment_intent",
            "amount": 38500,  // In cents: $385.00
            "amount_capturable": 0,
            "amount_details": {
                "tip": {}
            },
            "amount_received": 38500,
            "application": null,
            "application_fee_amount": null,
            "automatic_payment_methods": null,
            "canceled_at": null,
            "cancellation_reason": null,
            "capture_method": "automatic",
            "client_secret": "pi_1234567890abcdef_secret_abcdefg",
            "confirmation_method": "automatic",
            "created": 1704067200,
            "currency": "usd",
            "customer": null,
            "description": "Nomads Hideaway Booking - Jan 15-18, 2025",
            "last_payment_error": null,
            "livemode": false,
            "metadata": {
                "bookingId": "booking_1704067200000",
                "checkIn": "2025-01-15",
                "checkOut": "2025-01-18",
                "guestName": "John Doe",
                "guests": "2",
                "vehicle": "scooter"
            },
            "next_action": null,
            "on_behalf_of": null,
            "payment_method": "pm_1234567890abcdef",
            "payment_method_types": [
                "card"
            ],
            "processing": null,
            "receipt_email": "john@example.com",
            "review": null,
            "setup_future_usage": null,
            "shipping": null,
            "source": null,
            "statement_descriptor": null,
            "statement_descriptor_suffix": null,
            "status": "succeeded"
        }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
        "id": null,
        "idempotency_key": "abcdef1234567890"
    },
    "type": "payment_intent.succeeded"
}

// ============================================================================
// 5. EMAIL CONFIRMATION (Automated)
// ============================================================================

// System sends email when booking is confirmed

{
    "to": "guest@example.com",
    "subject": "Booking Confirmation - Nomads Hideaway",
    "template": "booking_confirmation",
    "data": {
        "guestName": "John Doe",
        "bookingId": "NH-2025-0001",
        "checkIn": "2025-01-15",
        "checkOut": "2025-01-18",
        "nights": 3,
        "guests": 2,
        "vehicle": "Scooter Rental",
        "roomCost": "$360",
        "vehicleCost": "$75",
        "totalPrice": "$435",
        "checkInTime": "2:00 PM",
        "checkOutTime": "11:00 AM",
        "cancelPolicyLink": "https://nomadshideaway.com/legal.html#cancellation",
        "supportEmail": "support@nomadshideaway.com",
        "whatsappLink": "https://wa.me/94702827221"
    }
}

// ============================================================================
// 6. ADMIN NOTIFICATION (WhatsApp Bookings)
// ============================================================================

// System sends email to admin when WhatsApp booking is received

{
    "to": "admin@nomadshideaway.com",
    "subject": "New Booking Request - Jan 15-18, 2025",
    "template": "admin_whatsapp_notification",
    "data": {
        "bookingId": "booking_1704067200000",
        "guestName": "John Doe",
        "guestEmail": "john@example.com",
        "guestPhone": "+1234567890",
        "checkIn": "2025-01-15",
        "checkOut": "2025-01-18",
        "nights": 3,
        "guests": 2,
        "vehicle": "Scooter Rental",
        "totalPrice": "$385",
        "paymentMethod": "WhatsApp (Awaiting Confirmation)",
        "message": "Booking request received via WhatsApp. Guest will contact to confirm payment method.",
        "actionLink": "https://admin.nomadshideaway.com/bookings/booking_1704067200000"
    }
}

// ============================================================================
// 7. DATABASE SCHEMA (MongoDB Example)
// ============================================================================

// Bookings Collection
db.bookings.insertOne({
    _id: ObjectId(),
    bookingId: "booking_1704067200000",
    confirmationNumber: "NH-2025-0001",
    createdAt: ISODate("2024-01-01T12:00:00Z"),
    
    // Guest Information
    guest: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        country: "USA"
    },
    
    // Booking Details
    checkIn: ISODate("2025-01-15T14:00:00Z"),
    checkOut: ISODate("2025-01-18T11:00:00Z"),
    nights: 3,
    guestCount: 2,
    
    // Vehicle
    vehicle: {
        type: "scooter",
        name: "Scooter Rental",
        pricePerNight: 25,
        totalCost: 75
    },
    
    // Pricing
    pricing: {
        roomPrice: 120,
        roomTotal: 360,
        vehicleTotal: 75,
        cleaningFee: 0,
        serviceFee: 0,
        total: 435
    },
    
    // Payment
    payment: {
        method: "stripe", // or "whatsapp"
        status: "confirmed", // or "pending"
        stripeSessionId: "cs_test_...",
        stripePaymentIntentId: "pi_...",
        paidAt: ISODate("2024-01-01T12:15:00Z"),
        amount: 43500
    },
    
    // Status
    status: "confirmed", // pending, confirmed, cancelled
    notes: "Special request: late check-in",
    
    // Metadata
    source: "direct_booking",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0..."
})

// ============================================================================
// 8. API ERROR RESPONSES
// ============================================================================

// 400 Bad Request - Missing dates
{
    "error": true,
    "code": "MISSING_DATES",
    "message": "Check-in and check-out dates are required",
    "status": 400
}

// 400 Bad Request - Invalid date format
{
    "error": true,
    "code": "INVALID_DATE_FORMAT",
    "message": "Dates must be in YYYY-MM-DD format",
    "status": 400
}

// 400 Bad Request - Check-out before check-in
{
    "error": true,
    "code": "INVALID_DATE_RANGE",
    "message": "Check-out date must be after check-in date",
    "status": 400
}

// 400 Bad Request - Dates in the past
{
    "error": true,
    "code": "PAST_DATES",
    "message": "Cannot book dates in the past",
    "status": 400
}

// 409 Conflict - Dates unavailable
{
    "error": true,
    "code": "DATES_UNAVAILABLE",
    "message": "Selected dates are not available",
    "unavailableDates": ["2025-01-16"],
    "status": 409
}

// 500 Internal Server Error
{
    "error": true,
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_1234567890abcdef",
    "status": 500
}

// ============================================================================
// 9. STRIPE TEST CARDS
// ============================================================================

/*
Use these test card numbers in development:

✅ Visa - Success
4242 4242 4242 4242

❌ Visa - Decline
4000 0000 0000 0002

⚠️ Visa - Requires 3D Secure
4000 0025 0000 3155

All cards:
- Any future expiry date
- Any 3-digit CVC
- Any name
*/

// ============================================================================
// 10. CALENDAR SYNC - GOOGLE CALENDAR ICS FEED
// ============================================================================

/*
To sync with Google Calendar:

1. Get your calendar's ICS feed URL:
   https://calendar.google.com/calendar/ical/your-email@gmail.com/public/basic.ics

2. Parse events with ical library:
   const ical = require('node-ical');
   const events = await ical.async.fromURL(calendarUrl);

3. Check for conflicts:
   event.startDate < userCheckOut && event.endDate > userCheckIn

4. Integrate in check-availability function:
   const googleEvents = await fetchGoogleCalendar(calendarUrl);
   const hasConflict = googleEvents.some(isConflicting);
   const available = !hasConflict;
*/

// ============================================================================
// 11. EXAMPLE - Complete Booking Flow (Code Reference)
// ============================================================================

/*
// Frontend code flow:

1. User selects dates and clicks "Check Availability"
   handleBookingClick() → validates dates

2. System checks availability
   AvailabilityChecker.checkAvailability() → returns { available, ... }

3. If available, modal opens
   BookingModal.open(checkIn, checkOut) → displays modal

4. User selects guests, vehicle, accepts terms
   bookingState.guestCount = 2
   bookingState.vehicle = "scooter"
   bookingState.termsAccepted = true

5. Price automatically updates
   PriceCalculator.calculateTotal() → $435

6. User chooses payment method
   - Stripe: PaymentSystem.handleStripeCheckout()
   - WhatsApp: PaymentSystem.handleWhatsAppCheckout()

7. For Stripe:
   - Create Stripe session via Netlify function
   - Redirect to Stripe checkout
   - Stripe webhook confirms payment

8. For WhatsApp:
   - Generate message with booking details
   - Open WhatsApp with pre-filled message
   - Save booking as "pending"
   - Admin confirms via WhatsApp

9. Backend saves booking
   fetch('/.netlify/functions/save-booking', { ... })

10. Guest receives confirmation email
    Email template with booking details

11. Admin notified
    Admin email or WhatsApp notification
*/

// ============================================================================
// 12. MONITORING & LOGGING
// ============================================================================

/*
Log these events:

{
    timestamp: "2024-01-01T12:00:00Z",
    event: "booking_created",
    bookingId: "booking_1704067200000",
    severity: "info",
    details: {
        checkIn: "2025-01-15",
        checkOut: "2025-01-18",
        paymentMethod: "stripe",
        totalPrice: 435
    }
}

{
    timestamp: "2024-01-01T12:15:00Z",
    event: "payment_processed",
    bookingId: "booking_1704067200000",
    severity: "info",
    details: {
        stripePaymentIntentId: "pi_...",
        amount: 43500,
        status: "succeeded"
    }
}

{
    timestamp: "2024-01-01T12:20:00Z",
    event: "confirmation_email_sent",
    bookingId: "booking_1704067200000",
    severity: "info",
    details: {
        recipientEmail: "john@example.com",
        subject: "Booking Confirmation - Nomads Hideaway"
    }
}
*/

// ============================================================================
// END OF API PAYLOADS
// ============================================================================
