/**
 * NETLIFY FUNCTION: save-booking
 * Path: netlify/functions/save-booking.js
 * 
 * Saves booking details for admin review
 * Sends confirmation emails and WhatsApp notifications
 */



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

        // (Email sending removed. Add notification logic here if needed in the future.)

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


function getVehicleInfo(vehicleType) {
    const vehicles = {
        none: 'No Vehicle',
        scooter: 'Scooter Rental ($25/night)',
        car: 'Car Rental ($60/night)'
    };
    return vehicles[vehicleType] || 'Unknown';
}
