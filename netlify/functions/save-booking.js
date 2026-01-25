/**
 * NETLIFY FUNCTION: save-booking
 * Path: netlify/functions/save-booking.js
 * 
 * Saves booking details for admin review
 * Sends confirmation emails and WhatsApp notifications
 */

const nodemailer = require('nodemailer');

// Configure email service (use SendGrid, AWS SES, etc.)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


// Simulated database (in production, use real database like MongoDB, PostgreSQL)
const bookingStorage = [];

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const booking = JSON.parse(event.body);

        // Validate booking data
        if (!booking.checkIn || !booking.checkOut || !booking.guests || !booking.totalPrice) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required booking fields' })
            };
        }

        // Add server-side timestamp
        booking.confirmedAt = new Date().toISOString();

        // Store booking (in production, save to database)
        bookingStorage.push(booking);
        console.log('Booking saved:', booking);

        // Send confirmation emails
        if (booking.paymentMethod === 'whatsapp') {
            // Send admin notification for WhatsApp bookings
            await sendAdminNotification(booking);
        } else if (booking.paymentMethod === 'stripe') {
            // Send Stripe confirmation
            await sendStripeConfirmation(booking);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                bookingId: booking.id,
                message: 'Booking saved successfully'
            })
        };

    } catch (error) {
        console.error('Booking error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to save booking',
                message: error.message
            })
        };
    }
};

async function sendAdminNotification(booking) {
    const vehicleInfo = getVehicleInfo(booking.vehicle);
    
    const htmlContent = `
        <h2>New WhatsApp Booking Request</h2>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Check-in:</strong> ${booking.checkIn}</p>
        <p><strong>Check-out:</strong> ${booking.checkOut}</p>
        <p><strong>Nights:</strong> ${booking.nights}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Vehicle:</strong> ${vehicleInfo}</p>
        <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
        <p><strong>Payment Method:</strong> WhatsApp (awaiting confirmation)</p>
        <hr>
        <p>Guest will contact via WhatsApp to confirm payment method.</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@nomadshideaway.com',
            to: process.env.ADMIN_EMAIL || 'admin@nomadshideaway.com',
            subject: `New Booking Request - ${booking.checkIn}`,
            html: htmlContent
        });
    } catch (error) {
        console.error('Failed to send admin notification:', error);
    }
}

async function sendStripeConfirmation(booking) {
    const vehicleInfo = getVehicleInfo(booking.vehicle);
    
    const htmlContent = `
        <h2>Booking Confirmation</h2>
        <p>Thank you for booking with Nomads Hideaway!</p>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Check-in:</strong> ${booking.checkIn}</p>
        <p><strong>Check-out:</strong> ${booking.checkOut}</p>
        <p><strong>Total Amount:</strong> $${booking.totalPrice}</p>
        <p>Payment will be processed via Stripe.</p>
    `;

    // TODO: Send email to guest
}

function getVehicleInfo(vehicleType) {
    const vehicles = {
        none: 'No Vehicle',
        scooter: 'Scooter Rental ($25/night)',
        car: 'Car Rental ($60/night)'
    };
    return vehicles[vehicleType] || 'Unknown';
}
