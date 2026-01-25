/**
 * NOMADS HIDEAWAY - BOOKING SYSTEM
 * Advanced booking with availability checking, guest selection, vehicle rental, and multiple payment methods
 */

// ==================== CONFIGURATION ====================
const BOOKING_CONFIG = {
    // Room pricing
    basePrice: 120, // USD per night
    
    // Vehicle rental options (USD per day)
    vehicles: {
        none: { name: 'No Vehicle', price: 0, description: 'Walking/Tuk-tuk only' },
        scooter: { name: 'Scooter Rental', price: 25, description: 'Automatic scooter (~100cc)' },
        car: { name: 'Car Rental', price: 60, description: 'Car with driver (optional)' }
    },
    
    // Guest capacity (max 2 for villa)
    maxGuests: 2,
    minGuests: 1,
    
    // Additional guests
    kidPrice: 25, // USD per night for child (10 years or younger)
    toddlerPrice: 0, // FREE
    petPrice: 15, // USD per night per pet
    maxKids: 1,
    maxToddlers: 1,
    maxPets: 2,
    
    // WhatsApp details
    whatsappNumber: '+6594252874', // Singapore number
    
    // Payment methods
    paymentMethods: {
        stripe: {
            name: 'Card Payment',
            icon: '💳',
            description: 'Visa, Mastercard, Amex'
        },
        whatsapp: {
            name: 'Book via WhatsApp',
            icon: '💬',
            description: 'Choose payment method with host'
        }
    },
    
    // Payment method options (shown in dropdown when WhatsApp is selected)
    paymentMethodOptions: {
        wise: { name: 'Wise', icon: '🔄', description: 'International transfers' },
        crypto: { name: 'Cryptocurrency', icon: '₿', description: 'Bitcoin, Ethereum' },
        paynow: { name: 'SG PayNow', icon: '🏦', description: 'Singapore PayNow' },
        bank: { name: 'Bank Transfer', icon: '🏧', description: 'Direct bank transfer' }
    }
};

// ==================== BOOKING STATE ====================
const bookingState = {
    checkInDate: null,
    checkOutDate: null,
    nights: 0,
    guestCount: 1,
    kids: 0,
    toddlers: 0,
    pets: 0,
    vehicle: 'none',
    termsAccepted: false,
    totalPrice: 0,
    
    reset() {
        this.checkInDate = null;
        this.checkOutDate = null;
        this.nights = 0;
        this.guestCount = 1;
        this.kids = 0;
        this.toddlers = 0;
        this.pets = 0;
        this.vehicle = 'none';
        this.termsAccepted = false;
        this.totalPrice = 0;
    }
};

// ==================== AVAILABILITY CHECKING ====================
class AvailabilityChecker {
    static formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    static async checkAvailability(checkInDate, checkOutDate) {
        try {
            // Call Netlify function which syncs with master Google Calendar + OTA calendars
            const response = await fetch('/.netlify/functions/check-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkIn: this.formatDate(checkInDate),
                    checkOut: this.formatDate(checkOutDate)
                })
            });
            
            if (!response.ok) {
                throw new Error('Availability check failed');
            }
            
            const data = await response.json();
            return {
                available: data.available,
                unavailableDates: data.unavailableDates || [],
                dateRange: data.dateRange || [],
                pricing: data.pricing || {}
            };
        } catch (error) {
            console.error('Error checking availability:', error);
            // Fallback: show error to user
            throw new Error('Unable to check availability. Please try again.');
        }
    }
}

// ==================== PRICE CALCULATION ====================
class PriceCalculator {
    static calculateNights(checkInDate, checkOutDate) {
        const timeDiff = checkOutDate - checkInDate;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    static calculateTotal(nights, guestCount, vehicleType, kids = 0, toddlers = 0, pets = 0) {
        const roomCost = nights * BOOKING_CONFIG.basePrice;
        const vehicleCost = nights * (BOOKING_CONFIG.vehicles[vehicleType]?.price || 0);
        const kidsCost = nights * kids * BOOKING_CONFIG.kidPrice;
        const toddlersCost = nights * toddlers * BOOKING_CONFIG.toddlerPrice; // Always 0
        const petsCost = nights * pets * BOOKING_CONFIG.petPrice;
        const total = roomCost + vehicleCost + kidsCost + toddlersCost + petsCost;
        
        return {
            roomCost,
            vehicleCost,
            kidsCost,
            toddlersCost,
            petsCost,
            total,
            breakdown: {
                'Room (per night)': `$${BOOKING_CONFIG.basePrice}`,
                'Nights': nights.toString(),
                'Room subtotal': `$${roomCost}`,
                'Vehicle': BOOKING_CONFIG.vehicles[vehicleType]?.name || 'None',
                'Vehicle cost': `$${vehicleCost}`,
                ...(kids > 0 && { 'Kids (per night)': `$${BOOKING_CONFIG.kidPrice} × ${kids}`, 'Kids subtotal': `$${kidsCost}` }),
                ...(pets > 0 && { 'Pets (per night)': `$${BOOKING_CONFIG.petPrice} × ${pets}`, 'Pets subtotal': `$${petsCost}` }),
                'Total': `$${total}`
            }
        };
    }
}

// ==================== MODAL MANAGEMENT ====================
class BookingModal {
    constructor() {
        this.modal = null;
    }
    
    create() {
        const modal = document.createElement('div');
        modal.id = 'booking-modal';
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="booking-modal-content">
                <!-- Close Button -->
                <button class="modal-close" onclick="bookingSystem.modal.close()">✕</button>
                
                <!-- Modal Tabs -->
                <div class="modal-tabs">
                    <button class="tab-btn active" data-tab="availability">Check Availability</button>
                    <button class="tab-btn" data-tab="details">Booking Details</button>
                    <button class="tab-btn" data-tab="payment">Payment</button>
                </div>
                
                <!-- TAB 1: AVAILABILITY -->
                <div class="tab-content active" id="tab-availability">
                    <h3>✓ Your Dates are Available!</h3>
                    <div id="availability-details" class="availability-details">
                        <p><strong>Check-in:</strong> <span id="avail-checkin"></span></p>
                        <p><strong>Check-out:</strong> <span id="avail-checkout"></span></p>
                        <p><strong>Nights:</strong> <span id="avail-nights"></span></p>
                    </div>
                    <button class="btn btn-primary" onclick="bookingSystem.modal.switchTab('details')">
                        Continue to Details →
                    </button>
                </div>
                
                <!-- TAB 2: BOOKING DETAILS -->
                <div class="tab-content" id="tab-details">
                    <div class="booking-form-section">
                        <h3>Number of Guests</h3>
                        <div class="guest-selector">
                            ${this.createGuestOptions()}
                        </div>
                    </div>
                    
                    <div class="booking-form-section">
                        <h3>Children & Toddlers</h3>
                        <div class="kids-selector">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Kids (10 years or younger) - $${BOOKING_CONFIG.kidPrice}/night</label>
                                ${this.createKidsOptions()}
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Toddlers (Free)</label>
                                ${this.createToddlersOptions()}
                            </div>
                        </div>
                    </div>
                    
                    <div class="booking-form-section">
                        <h3>Pets</h3>
                        <div class="pets-selector">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Pets (Max 2) - $${BOOKING_CONFIG.petPrice}/night each</label>
                            ${this.createPetsOptions()}
                        </div>
                    </div>
                    
                    <div class="booking-form-section">
                        <h3>Vehicle Rental (Optional)</h3>
                        <div class="vehicle-selector">
                            ${this.createVehicleOptions()}
                        </div>
                    </div>
                    
                    <!-- Price Breakdown -->
                    <div class="price-breakdown">
                        <h4>Price Breakdown</h4>
                        <div id="price-details" class="price-details"></div>
                    </div>
                    
                    <!-- Terms & Conditions -->
                    <div class="terms-section">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                id="terms-check" 
                                onchange="bookingSystem.updateTermsAcceptance(this.checked)"
                            >
                            <span>I agree to the <a href="legal.html#terms" target="_blank">Terms & Conditions</a> and <a href="legal.html#privacy" target="_blank">Privacy Policy</a></span>
                        </label>
                    </div>
                    
                    <button class="btn btn-primary" onclick="bookingSystem.modal.switchTab('payment')">
                        Choose Payment Method →
                    </button>
                </div>
                
                <!-- TAB 3: PAYMENT -->
                <div class="tab-content" id="tab-payment">
                    <h3>Select Payment Method</h3>
                    
                    <!-- Payment Methods -->
                    <div class="payment-methods-grid">
                        <button 
                            class="payment-method-btn" 
                            onclick="bookingSystem.payment.selectMethod('stripe')"
                            id="payment-stripe"
                        >
                            <div class="payment-icon">💳</div>
                            <div class="payment-name">Card Payment</div>
                            <div class="payment-desc">Visa, Mastercard, Amex</div>
                        </button>
                        
                        <button 
                            class="payment-method-btn" 
                            onclick="bookingSystem.payment.selectMethod('whatsapp')"
                            id="payment-whatsapp"
                        >
                            <div class="payment-icon">💬</div>
                            <div class="payment-name">Book via WhatsApp</div>
                            <div class="payment-desc">Choose payment method with host</div>
                        </button>
                    </div>
                    
                    <!-- WhatsApp Payment Method Dropdown -->
                    <div id="whatsapp-method-selector" style="display:none; margin-top:20px;">
                        <label for="whatsapp-payment-method" style="display:block; margin-bottom:10px; font-weight:600;">Select Payment Method:</label>
                        <select id="whatsapp-payment-method" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd; font-size:14px;">
                            <option value="">-- Choose a method --</option>
                            ${Object.entries(BOOKING_CONFIG.paymentMethodOptions).map(([key, method]) => `
                                <option value="${key}">${method.icon} ${method.name} - ${method.description}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Total Price Display -->
                    <div class="total-price-display">
                        <span>Total Amount:</span>
                        <span id="total-amount" class="amount">$0</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="bookingSystem.modal.close()">Cancel</button>
                    <button 
                        class="btn btn-primary" 
                        id="checkout-btn"
                        onclick="bookingSystem.payment.checkout()"
                        style="display:none;"
                    >
                        Complete Booking
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        this.attachTabListeners();
    }
    
    createGuestOptions() {
        let html = '';
        for (let i = BOOKING_CONFIG.minGuests; i <= BOOKING_CONFIG.maxGuests; i++) {
            html += `
                <label class="radio-label">
                    <input 
                        type="radio" 
                        name="guests" 
                        value="${i}"
                        ${i === 1 ? 'checked' : ''}
                        onchange="bookingSystem.updateGuestCount(${i})"
                    >
                    <span>${i} Guest${i > 1 ? 's' : ''}</span>
                </label>
            `;
        }
        return html;
    }
    
    createKidsOptions() {
        let html = '';
        for (let i = 0; i <= BOOKING_CONFIG.maxKids; i++) {
            html += `
                <label class="radio-label">
                    <input 
                        type="radio" 
                        name="kids" 
                        value="${i}"
                        ${i === 0 ? 'checked' : ''}
                        onchange="bookingSystem.updateKids(${i})"
                    >
                    <span>${i === 0 ? 'None' : `${i} Kid${i > 1 ? 's' : ''}`}</span>
                </label>
            `;
        }
        return html;
    }
    
    createToddlersOptions() {
        let html = '';
        for (let i = 0; i <= BOOKING_CONFIG.maxToddlers; i++) {
            html += `
                <label class="radio-label">
                    <input 
                        type="radio" 
                        name="toddlers" 
                        value="${i}"
                        ${i === 0 ? 'checked' : ''}
                        onchange="bookingSystem.updateToddlers(${i})"
                    >
                    <span>${i === 0 ? 'None' : `${i} Toddler${i > 1 ? 's' : ''}`}</span>
                </label>
            `;
        }
        return html;
    }
    
    createPetsOptions() {
        let html = '';
        for (let i = 0; i <= BOOKING_CONFIG.maxPets; i++) {
            html += `
                <label class="radio-label">
                    <input 
                        type="radio" 
                        name="pets" 
                        value="${i}"
                        ${i === 0 ? 'checked' : ''}
                        onchange="bookingSystem.updatePets(${i})"
                    >
                    <span>${i === 0 ? 'None' : `${i} Pet${i > 1 ? 's' : ''}`}</span>
                </label>
            `;
        }
        return html;
    }
    
    createVehicleOptions() {
        return Object.entries(BOOKING_CONFIG.vehicles).map(([key, vehicle]) => `
            <label class="radio-label">
                <input 
                    type="radio" 
                    name="vehicle" 
                    value="${key}"
                    ${key === 'none' ? 'checked' : ''}
                    onchange="bookingSystem.updateVehicle('${key}')"
                >
                <span>
                    <strong>${vehicle.name}</strong>
                    ${vehicle.price > 0 ? `<span class="price"> +$${vehicle.price}/night</span>` : ''}
                    <div class="small-text">${vehicle.description}</div>
                </span>
            </label>
        `).join('');
    }
    
    open(checkInDate, checkOutDate, availability) {
        bookingState.checkInDate = checkInDate;
        bookingState.checkOutDate = checkOutDate;
        
        // Set availability info
        const nights = PriceCalculator.calculateNights(checkInDate, checkOutDate);
        bookingState.nights = nights;
        
        document.getElementById('avail-checkin').textContent = this.formatDateDisplay(checkInDate);
        document.getElementById('avail-checkout').textContent = this.formatDateDisplay(checkOutDate);
        document.getElementById('avail-nights').textContent = nights;
        
        this.modal.style.display = 'flex';
        this.updatePriceDisplay();
        
        // Reset to availability tab
        this.switchTab('availability');
    }
    
    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
    
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const tab = document.getElementById(`tab-${tabName}`);
        const btn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (tab) tab.classList.add('active');
        if (btn) btn.classList.add('active');
        
        // Update checkout button visibility
        const checkoutBtn = document.getElementById('checkout-btn');
        if (tabName === 'payment' && bookingState.termsAccepted) {
            checkoutBtn.style.display = 'block';
        } else {
            checkoutBtn.style.display = 'none';
        }
    }
    
    attachTabListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }
    
    updatePriceDisplay() {
        const prices = PriceCalculator.calculateTotal(
            bookingState.nights,
            bookingState.guestCount,
            bookingState.vehicle,
            bookingState.kids,
            bookingState.toddlers,
            bookingState.pets
        );
        bookingState.totalPrice = prices.total;
        
        // Update price details in modal
        const priceDetailsEl = document.getElementById('price-details');
        if (priceDetailsEl) {
            priceDetailsEl.innerHTML = `
                <div class="price-line">
                    <span>Room (${bookingState.nights} nights × $${BOOKING_CONFIG.basePrice})</span>
                    <span>$${prices.roomCost}</span>
                </div>
                ${prices.vehicleCost > 0 ? `
                    <div class="price-line">
                        <span>${BOOKING_CONFIG.vehicles[bookingState.vehicle].name} (${bookingState.nights} nights × $${BOOKING_CONFIG.vehicles[bookingState.vehicle].price})</span>
                        <span>$${prices.vehicleCost}</span>
                    </div>
                ` : ''}
                ${prices.kidsCost > 0 ? `
                    <div class="price-line">
                        <span>Kids (${bookingState.nights} nights × ${bookingState.kids} × $${BOOKING_CONFIG.kidPrice})</span>
                        <span>$${prices.kidsCost}</span>
                    </div>
                ` : ''}
                ${prices.petsCost > 0 ? `
                    <div class="price-line">
                        <span>Pets (${bookingState.nights} nights × ${bookingState.pets} × $${BOOKING_CONFIG.petPrice})</span>
                        <span>$${prices.petsCost}</span>
                    </div>
                ` : ''}
                <div class="price-line total">
                    <span>Total</span>
                    <span>$${prices.total}</span>
                </div>
            `;
        }
        
        // Update total amount in payment tab
        const totalAmountEl = document.getElementById('total-amount');
        if (totalAmountEl) {
            totalAmountEl.textContent = `$${prices.total}`;
        }
    }
    
    formatDateDisplay(date) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}

// ==================== PAYMENT SYSTEM ====================
class PaymentSystem {
    constructor() {
        this.selectedMethod = null;
        this.stripePublicKey = 'pk_test_YOUR_STRIPE_KEY'; // TODO: Replace with actual key
    }
    
    selectMethod(method) {
        this.selectedMethod = method;
        
        // Update button states
        document.querySelectorAll('.payment-method-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById(`payment-${method}`)?.classList.add('selected');
        
        // Show/hide WhatsApp payment method selector
        const selector = document.getElementById('whatsapp-method-selector');
        if (method === 'whatsapp') {
            selector.style.display = 'block';
        } else {
            selector.style.display = 'none';
        }
    }
    
    checkout() {
        if (!this.selectedMethod) {
            alert('Please select a payment method');
            return;
        }
        
        if (this.selectedMethod === 'stripe') {
            this.handleStripeCheckout();
        } else if (this.selectedMethod === 'whatsapp') {
            let selectedOption = document.getElementById('whatsapp-payment-method')?.value;
            // If no method selected, proceed with 'To be discussed'
            if (!selectedOption) {
                selectedOption = null;
            }
            this.handleWhatsAppCheckout(selectedOption);
        }
    }
    
    handleStripeCheckout() {
        console.log('Redirecting to Stripe checkout...');
        
        const bookingDetails = {
            checkIn: bookingState.checkInDate.toISOString().split('T')[0],
            checkOut: bookingState.checkOutDate.toISOString().split('T')[0],
            nights: bookingState.nights,
            guests: bookingState.guestCount,
            vehicle: bookingState.vehicle,
            totalPrice: bookingState.totalPrice
        };
        
        // TODO: In production, call Netlify function to create Stripe session
        // For now, show confirmation
        console.log('Stripe Checkout Details:', bookingDetails);
        
        // Simulate Stripe redirect (in production, use actual Stripe.redirectToCheckout)
        alert(`
            🔐 Stripe Checkout
            
            Total: $${bookingState.totalPrice}
            Dates: ${bookingDetails.checkIn} to ${bookingDetails.checkOut}
            Guests: ${bookingDetails.guests}
            Vehicle: ${BOOKING_CONFIG.vehicles[bookingState.vehicle].name}
            
            In production, this would redirect to Stripe payment page.
        `);
        
        // Store booking for backend processing
        this.storeBooking(bookingDetails, 'stripe');
    }
    
    handleWhatsAppCheckout(paymentMethod) {
        const paymentMethodInfo = paymentMethod ? BOOKING_CONFIG.paymentMethodOptions[paymentMethod] : null;
        const message = this.generateWhatsAppMessage(paymentMethodInfo);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${BOOKING_CONFIG.whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
        
        // Store booking for backend processing
        const bookingDetails = {
            checkIn: bookingState.checkInDate.toISOString().split('T')[0],
            checkOut: bookingState.checkOutDate.toISOString().split('T')[0],
            nights: bookingState.nights,
            guests: bookingState.guestCount,
            vehicle: bookingState.vehicle,
            paymentMethod: paymentMethod || 'tbd',
            paymentMethodName: paymentMethodInfo ? paymentMethodInfo.name : 'To be discussed',
            totalPrice: bookingState.totalPrice
        };
        this.storeBooking(bookingDetails, 'whatsapp');
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Close modal
        bookingSystem.modal.close();
        
        // Show success message
        this.showSuccessMessage('WhatsApp message sent! We will confirm your booking shortly.');
    }
    
    generateWhatsAppMessage(paymentMethodInfo) {
        const checkIn = bookingState.checkInDate.toLocaleDateString();
        const checkOut = bookingState.checkOutDate.toLocaleDateString();
        const vehicle = BOOKING_CONFIG.vehicles[bookingState.vehicle].name;
        const paymentMethod = paymentMethodInfo ? `${paymentMethodInfo.icon} ${paymentMethodInfo.name}` : 'To be discussed';
        
        let message = `
🏡 NOMADS HIDEAWAY - BOOKING REQUEST

📅 Check-in: ${checkIn}
📅 Check-out: ${checkOut}
👥 Adults: ${bookingState.guestCount}`;

        if (bookingState.kids > 0) {
            message += `
👦 Kids: ${bookingState.kids}`;
        }
        
        if (bookingState.toddlers > 0) {
            message += `
👶 Toddlers: ${bookingState.toddlers}`;
        }
        
        if (bookingState.pets > 0) {
            message += `
🐾 Pets: ${bookingState.pets}`;
        }
        
        message += `
🚲 Vehicle: ${vehicle}

💰 Total: $${bookingState.totalPrice}
💳 Preferred Payment: ${paymentMethod}

Please confirm this booking.`;
        
        return message.trim();
    }
    
    storeBooking(details, method) {
        // Store in localStorage for now
        // In production, send to Netlify function
        const booking = {
            id: 'booking_' + Date.now(),
            timestamp: new Date().toISOString(),
            paymentMethod: method,
            ...details,
            status: 'pending'
        };
        
        console.log('Storing booking:', booking);
        
        // TODO: Send to Netlify function: POST /.netlify/functions/save-booking
        fetch('/.netlify/functions/save-booking', {
            method: 'POST',
            body: JSON.stringify(booking)
        }).catch(() => {
            console.log('Booking stored locally (Netlify function not available)');
        });
    }
    
    showSuccessMessage(message) {
        const div = document.createElement('div');
        div.className = 'success-message';
        div.textContent = message;
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.remove();
        }, 5000);
    }
}

// ==================== MAIN BOOKING SYSTEM ====================
class BookingSystem {
    constructor() {
        this.modal = new BookingModal();
        this.payment = new PaymentSystem();
        this.checkInDate = null;
        this.checkOutDate = null;
    }
    
    init() {
        this.modal.create();
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Close modal on background click
        const modal = document.getElementById('booking-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.modal.close();
                }
            });
        }
    }
    
    async handleBookingSubmit(checkInDate, checkOutDate) {
        if (!checkInDate || !checkOutDate) {
            alert('Please select both check-in and check-out dates');
            return;
        }
        
        if (checkOutDate <= checkInDate) {
            alert('Check-out date must be after check-in date');
            return;
        }
        
        // Show loading state
        const submitButton = document.querySelector('[data-booking-dates] .btn-primary');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Checking availability...';
        }
        
        try {
            // Check availability (async call to Netlify function)
            const availability = await AvailabilityChecker.checkAvailability(checkInDate, checkOutDate);
            
            if (!availability.available) {
                alert(`
Sorry, the following dates are not available:
${availability.unavailableDates.join(', ')}

Please select different dates.
                `);
                return;
            }
            
            // Open modal with booking details
            this.modal.open(checkInDate, checkOutDate, availability);
        } catch (error) {
            console.error('Availability check error:', error);
            alert('Unable to check availability. Please try again.');
        } finally {
            // Restore button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Check Availability';
            }
        }
    }
    
    updateGuestCount(count) {
        bookingState.guestCount = count;
        this.modal.updatePriceDisplay();
    }
    
    updateKids(count) {
        bookingState.kids = count;
        this.modal.updatePriceDisplay();
    }
    
    updateToddlers(count) {
        bookingState.toddlers = count;
        this.modal.updatePriceDisplay();
    }
    
    updatePets(count) {
        bookingState.pets = count;
        this.modal.updatePriceDisplay();
    }
    
    updateVehicle(vehicle) {
        bookingState.vehicle = vehicle;
        this.modal.updatePriceDisplay();
    }
    
    updateTermsAcceptance(accepted) {
        bookingState.termsAccepted = accepted;
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = !accepted;
            checkoutBtn.style.opacity = accepted ? '1' : '0.5';
        }
    }
}

// ==================== INITIALIZATION ====================
// Create global booking system instance
const bookingSystem = new BookingSystem();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bookingSystem.init();
    });
} else {
    bookingSystem.init();
}
