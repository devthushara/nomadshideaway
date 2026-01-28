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
        yourrentals: {
            name: 'Credit Card',
            icon: '💳',
            description: 'Pay via Your.Rentals'
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
            const response = await fetch('/.netlify/functions/check-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkIn: this.formatDate(checkInDate),
                    checkOut: this.formatDate(checkOutDate)
                })
            });
            
            if (!response.ok) throw new Error('Availability check failed');
            
            const data = await response.json();
            return {
                available: data.available,
                blockedBy: data.blockedBy || []
            };
        } catch (error) {
            console.error('Error checking availability:', error);
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
        this.currentStep = 1;
        this.wizardInPicker = null;
        this.wizardOutPicker = null;
    }
    
    create() {
        // Find existing modal in index.html instead of creating it dynamically below footer
        const modal = document.getElementById('booking-modal');
        if (!modal) {
            console.warn('Booking modal template not found in HTML. Fixing UI...');
            return;
        }

        const guestOptionsEl = document.getElementById('wizard-guest-options');
        if (guestOptionsEl) guestOptionsEl.innerHTML = this.createGuestOptions();

        const kidsLabelEl = document.getElementById('wizard-kids-label');
        if (kidsLabelEl) kidsLabelEl.textContent = `Children (10 years or younger)`;

        const kidsOptionsEl = document.getElementById('wizard-kids-options');
        if (kidsOptionsEl) kidsOptionsEl.innerHTML = this.createKidsOptions();

        const toddlersOptionsEl = document.getElementById('wizard-toddlers-options');
        if (toddlersOptionsEl) toddlersOptionsEl.innerHTML = this.createToddlersOptions();

        const petsLabelEl = document.getElementById('wizard-pets-label');
        if (petsLabelEl) petsLabelEl.textContent = `Pets`;

        const petsOptionsEl = document.getElementById('wizard-pets-options');
        if (petsOptionsEl) petsOptionsEl.innerHTML = this.createPetsOptions();

        const vehicleOptionsEl = document.getElementById('wizard-vehicle-options');
        if (vehicleOptionsEl) vehicleOptionsEl.innerHTML = this.createVehicleOptions();

        const whatsappMethodEl = document.getElementById('whatsapp-payment-method');
        if (whatsappMethodEl) {
            whatsappMethodEl.innerHTML = `
                <option value="">-- Choose a method --</option>
                ${Object.entries(BOOKING_CONFIG.paymentMethodOptions).map(([key, method]) => `
                    <option value="${key}">${method.icon} ${method.name} - ${method.description}</option>
                `).join('')}
            `;
        }

        this.state = {
            checkIn: null,
            checkOut: null
        };
        this.modal = modal;
        this.initWizardPickers();
    }
    
    initWizardPickers() {
        this.wizardInPicker = flatpickr("#wizard-checkin", {
            minDate: "today",
            onChange: (selectedDates) => {
                this.state.checkIn = selectedDates[0];
                if (this.state.checkIn) {
                    const minOut = new Date(this.state.checkIn);
                    minOut.setDate(minOut.getDate() + 1);
                    this.wizardOutPicker.set("minDate", minOut);
                    
                    // Robustly sync month for the checkout picker
                    this.wizardOutPicker.jumpToDate(minOut);
                    
                    // Auto-set checkout date if invalid or empty to ensure month sync and valid range
                    if (!this.state.checkOut || this.state.checkOut < minOut) {
                        this.wizardOutPicker.setDate(minOut);
                        this.state.checkOut = minOut;
                    }
                    
                    this.clearAvailability();
                }
            }
        });
        this.wizardOutPicker = flatpickr("#wizard-checkout", {
            minDate: "today",
            onOpen: () => {
                // Ensure calendar view matches checkin month if no checkout picked
                if (!this.state.checkOut && this.state.checkIn) {
                    const syncDate = new Date(this.state.checkIn);
                    syncDate.setDate(syncDate.getDate() + 1);
                    this.wizardOutPicker.jumpToDate(syncDate);
                }
            },
            onChange: (selectedDates) => {
                this.state.checkOut = selectedDates[0];
                this.clearAvailability();
            }
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    clearAvailability() {
        document.getElementById('wizard-availability-msg').textContent = '';
        document.getElementById('availability-summary').style.display = 'none';
        document.getElementById('wizard-next').style.display = 'none';
        document.getElementById('wizard-check-btn').style.display = 'block';
    }

    async recheckAvailability() {
        const msgEl = document.getElementById('wizard-availability-msg');
        const btn = document.getElementById('wizard-check-btn');

        if (!this.state.checkIn || !this.state.checkOut) {
            msgEl.textContent = 'Please select both dates';
            msgEl.style.color = '#d32f2f';
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Checking...';
        msgEl.textContent = '';

        try {
            const avail = await AvailabilityChecker.checkAvailability(this.state.checkIn, this.state.checkOut);
            if (avail.available) {
                msgEl.textContent = '✓ Dates are available!';
                msgEl.style.color = 'var(--leaf)';
                
                const nights = PriceCalculator.calculateNights(this.state.checkIn, this.state.checkOut);
                bookingState.checkInDate = this.state.checkIn;
                bookingState.checkOutDate = this.state.checkOut;
                bookingState.nights = nights;
                
                document.getElementById('wizard-nights').textContent = nights;
                document.getElementById('availability-summary').style.display = 'block';
                document.getElementById('wizard-next').style.display = 'block';
                btn.style.display = 'none';
                
                this.updateWizardSummary();
                this.updatePriceDisplay();
            } else {
                msgEl.textContent = 'Sorry, these dates are not available.';
                msgEl.style.color = '#d32f2f';
            }
        } catch (err) {
            msgEl.textContent = 'Error checking availability.';
            msgEl.style.color = '#d32f2f';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Check Availability';
        }
    }

    updateWizardSummary() {
        const datesStr = `${this.formatDateDisplay(bookingState.checkInDate)} - ${this.formatDateDisplay(bookingState.checkOutDate)} (${bookingState.nights} nights)`;
        const el1 = document.getElementById('wizard-summary-dates');
        const el2 = document.getElementById('wizard-summary-dates-2');
        if (el1) el1.textContent = datesStr;
        if (el2) el2.textContent = datesStr;
    }

    goToStep(stepNum) {
        this.currentStep = stepNum;
        
        // Update steps indicator
        document.querySelectorAll('.wizard-steps .step').forEach(step => {
            const s = parseInt(step.getAttribute('data-step'));
            step.classList.remove('active', 'completed');
            if (s === stepNum) step.classList.add('active');
            if (s < stepNum) step.classList.add('completed');
        });

        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`step-${stepNum}`).classList.add('active');

        // Actions visibility
        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        const checkoutBtn = document.getElementById('checkout-btn');

        prevBtn.style.display = stepNum > 1 ? 'block' : 'none';
        
        if (stepNum === 3) {
            nextBtn.style.display = 'none';
            checkoutBtn.style.display = 'block';
            
            // Ensure terms checkbox is in sync with state
            const termsCheck = document.getElementById('terms-check');
            if (termsCheck) {
                termsCheck.checked = bookingState.termsAccepted;
            }
            
            checkoutBtn.style.opacity = bookingState.termsAccepted ? '1' : '0.5';
            checkoutBtn.disabled = !bookingState.termsAccepted;
        } else {
            nextBtn.style.display = 'block';
            checkoutBtn.style.display = 'none';
        }

        // Scroll to top of modal
        document.querySelector('.booking-modal-content').scrollTop = 0;
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.goToStep(this.currentStep + 1);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    open(checkInDate, checkOutDate, availability) {
        bookingState.checkInDate = checkInDate;
        bookingState.checkOutDate = checkOutDate;
        this.state.checkIn = checkInDate;
        this.state.checkOut = checkOutDate;
        
        this.wizardInPicker.setDate(checkInDate);
        this.wizardOutPicker.setDate(checkOutDate);
        
        const nights = PriceCalculator.calculateNights(checkInDate, checkOutDate);
        bookingState.nights = nights;
        
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scroll
        
        // Since it came from home screen available, go straight to Step 2
        this.updateWizardSummary();
        this.updatePriceDisplay();
        
        // Default to Your.Rentals payment
        if (bookingSystem.payment) {
            bookingSystem.payment.selectMethod('yourrentals');
        }
        
        this.goToStep(2);
    }
    
    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    updatePriceDisplay() {
        const priceDetailsEl = document.getElementById('price-details');
        if (priceDetailsEl) {
            priceDetailsEl.innerHTML = `
                <div class="price-line">
                    <span>Stay Duration</span>
                    <span>${bookingState.nights} nights</span>
                </div>
                <div class="price-line">
                    <span>Adults</span>
                    <span>${bookingState.guestCount}</span>
                </div>
                ${bookingState.kids > 0 ? `
                    <div class="price-line">
                        <span>Children</span>
                        <span>${bookingState.kids}</span>
                    </div>
                ` : ''}
                ${bookingState.toddlers > 0 ? `
                    <div class="price-line">
                        <span>Infants</span>
                        <span>${bookingState.toddlers}</span>
                    </div>
                ` : ''}
                ${bookingState.pets > 0 ? `
                    <div class="price-line">
                        <span>Pets</span>
                        <span>${bookingState.pets}</span>
                    </div>
                ` : ''}
                <div class="price-line">
                    <span>Vehicle</span>
                    <span>${BOOKING_CONFIG.vehicles[bookingState.vehicle].name}</span>
                </div>
            `;
        }
    }
    
    formatDateDisplay(date) {
        if (!date) return '';
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    createGuestOptions() {
        let html = '';
        for (let i = BOOKING_CONFIG.minGuests; i <= BOOKING_CONFIG.maxGuests; i++) {
            html += `
                <label class="radio-label ${bookingState.guestCount === i ? 'active' : ''}">
                    <input 
                        type="radio" 
                        name="guests" 
                        value="${i}"
                        ${bookingState.guestCount === i ? 'checked' : ''}
                        onchange="bookingSystem.updateGuestCount(${i}); this.parentElement.parentElement.querySelectorAll('.radio-label').forEach(l => l.classList.remove('active')); this.parentElement.classList.add('active');"
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
                <label class="radio-label ${bookingState.kids === i ? 'active' : ''}">
                    <input 
                        type="radio" 
                        name="kids" 
                        value="${i}"
                        ${bookingState.kids === i ? 'checked' : ''}
                        onchange="bookingSystem.updateKids(${i}); this.parentElement.parentElement.querySelectorAll('.radio-label').forEach(l => l.classList.remove('active')); this.parentElement.classList.add('active');"
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
                <label class="radio-label ${bookingState.toddlers === i ? 'active' : ''}">
                    <input 
                        type="radio" 
                        name="toddlers" 
                        value="${i}"
                        ${bookingState.toddlers === i ? 'checked' : ''}
                        onchange="bookingSystem.updateToddlers(${i}); this.parentElement.parentElement.querySelectorAll('.radio-label').forEach(l => l.classList.remove('active')); this.parentElement.classList.add('active');"
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
                <label class="radio-label ${bookingState.pets === i ? 'active' : ''}">
                    <input 
                        type="radio" 
                        name="pets" 
                        value="${i}"
                        ${bookingState.pets === i ? 'checked' : ''}
                        onchange="bookingSystem.updatePets(${i}); this.parentElement.parentElement.querySelectorAll('.radio-label').forEach(l => l.classList.remove('active')); this.parentElement.classList.add('active');"
                    >
                    <span>${i === 0 ? 'None' : `${i} Pet${i > 1 ? 's' : ''}`}</span>
                </label>
            `;
        }
        return html;
    }
    
    createVehicleOptions() {
        return Object.entries(BOOKING_CONFIG.vehicles).map(([key, vehicle]) => `
            <label class="radio-label ${bookingState.vehicle === key ? 'active' : ''}">
                <input 
                    type="radio" 
                    name="vehicle" 
                    value="${key}"
                    ${bookingState.vehicle === key ? 'checked' : ''}
                    onchange="bookingSystem.updateVehicle('${key}'); this.parentElement.parentElement.querySelectorAll('.radio-label').forEach(l => l.classList.remove('active')); this.parentElement.classList.add('active');"
                >
                <span>
                    <strong>${vehicle.name}</strong>
                    <div class="small-text">${vehicle.description}</div>
                </span>
            </label>
        `).join('');
    }
}

// ==================== PAYMENT SYSTEM ====================
class PaymentSystem {
    constructor() {
        this.selectedMethod = 'yourrentals';
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
        
        if (this.selectedMethod === 'yourrentals') {
            this.handleYourRentalsCheckout();
        } else if (this.selectedMethod === 'whatsapp') {
            let selectedOption = document.getElementById('whatsapp-payment-method')?.value;
            // If no method selected, proceed with 'To be discussed'
            if (!selectedOption) {
                selectedOption = null;
            }
            this.handleWhatsAppCheckout(selectedOption);
        }
    }
    
    handleYourRentalsCheckout() {
        // Construct Your.Rentals URL
        // https://app.your.rentals/en/book/128668?scid=PMDR&check-in=2026-05-20&check-out=2026-05-21&adults=2&children=0&infants=1&cancel-policy-name=SuperFlexible&currency=USD
        
        const checkIn = bookingState.checkInDate.toISOString().split('T')[0];
        const checkOut = bookingState.checkOutDate.toISOString().split('T')[0];
        const adults = bookingState.guestCount;
        const children = bookingState.kids;
        const infants = bookingState.toddlers;
        
        const baseUrl = "https://app.your.rentals/en/book/128668";
        const params = new URLSearchParams({
            scid: 'PMDR',
            'check-in': checkIn,
            'check-out': checkOut,
            adults: adults,
            children: children,
            infants: infants,
            'cancel-policy-name': 'SuperFlexible',
            currency: 'USD'
        });
        
        const finalUrl = `${baseUrl}?${params.toString()}`;
        
        console.log('Redirecting to Your.Rentals:', finalUrl);
        
        // Store booking info locally before redirect
        this.storeBooking({
            checkIn,
            checkOut,
            adults,
            children,
            infants,
            vehicle: bookingState.vehicle,
            platform: 'yourrentals'
        }, 'yourrentals');

        // Open in new tab
        window.open(finalUrl, '_blank');
        
        // Close modal
        bookingSystem.modal.close();
        
        this.showSuccessMessage('Redirecting to secure payment page...');
    }
    
    handleWhatsAppCheckout(paymentMethod) {
        const paymentMethodInfo = paymentMethod ? BOOKING_CONFIG.paymentMethodOptions[paymentMethod] : null;
        const message = this.generateWhatsAppMessage(paymentMethodInfo);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${BOOKING_CONFIG.whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
        
        // Store booking
        const bookingDetails = {
            checkIn: bookingState.checkInDate.toISOString().split('T')[0],
            checkOut: bookingState.checkOutDate.toISOString().split('T')[0],
            nights: bookingState.nights,
            guests: bookingState.guestCount,
            vehicle: bookingState.vehicle,
            paymentMethod: paymentMethod || 'tbd',
            paymentMethodName: paymentMethodInfo ? paymentMethodInfo.name : 'To be discussed'
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
            return { available: false, error: 'Please select both dates' };
        }
        
        try {
            const availability = await AvailabilityChecker.checkAvailability(checkInDate, checkOutDate);
            
            if (availability.available) {
                this.modal.open(checkInDate, checkOutDate, availability);
            }
            
            return availability;
        } catch (error) {
            console.error('Availability check error:', error);
            throw new Error('Unable to check availability. Please try again.');
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
