function triggerArrival(carouselNum, city) {
    const alertBanner = document.getElementById('arrival-alert');
    const baggageBox = document.getElementById('carousel-display');
    const scrollWindow = document.getElementById('travel-guides');
    const baggageText = document.getElementById('baggage-text');
    const booking = document.getElementById('booking-link');
    const trip = document.getElementById('trip-link');
    const baggageTrip = document.getElementById('baggage-trip-link');

    // 1. Marketplace Intelligence Swap
    if (city === 'HK') {
        if (booking) { booking.innerText = "View Hong Kong Hotels (Booking.com)"; }
        if (trip) { trip.innerText = "Find Hong Kong Flights (Trip.com)"; }
        if (baggageTrip) { baggageTrip.innerText = "Find Hong Kong Flights (Trip.com)"; }
    } else {
        if (booking) { booking.innerText = "View Paris Hotels (Booking.com)"; }
        if (trip) { trip.innerText = "Find Paris Flights (Trip.com)"; }
        if (baggageTrip) { baggageTrip.innerText = "Find Paris Flights (Trip.com)"; }
    }

    // 2. UI Reveal & Automation
    if (baggageText && alertBanner && baggageBox) {
        baggageText.innerText = "CAROUSEL " + carouselNum;
        alertBanner.style.display = 'block';
        baggageBox.style.display = 'block';

        setTimeout(() => {
            if (scrollWindow) {
                scrollWindow.scrollTo({ top: scrollWindow.scrollHeight, behavior: 'smooth' });
            }
        }, 500);
    }
}

// --- SCANNER & UPLOAD LOGIC ---

/**
 * Handles Digital Tickets (Screenshots/Files)
 * Scans the uploaded image for airport codes (HKG, CDG).
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        console.log("VELOCIS: Processing Digital Ticket...");
        // For the demo, we simulate a 'Match' based on the file being present
        // In the next version, we add the QR-reader library here.
        triggerArrival('2', 'HK'); 
        alert("Digital Ticket Analyzed: Hong Kong Mission Activated.");
    }
}

/**
 * Handles Physical Tickets (Live Camera)
 */
function startCameraScan() {
    alert("Camera Access Requested. Point at Boarding Pass Barcode.");
    // This triggers our Arrival logic immediately for the demo
    triggerArrival('12', 'Paris');
}

// --- GPS AUTO-DETECTION ---

const GLOBAL_PORTS = [
    { name: 'Paris CDG', lat: 49.0097, lon: 2.5479, carousel: '12', city: 'Paris' },
    { name: 'Hong Kong HKG', lat: 22.3080, lon: 113.9185, carousel: '2', city: 'HK' }
];

function activateLocationIntelligence() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            GLOBAL_PORTS.forEach(port => {
                const distance = Math.sqrt(Math.pow(userLat - port.lat, 2) + Math.pow(userLon - port.lon, 2));
                if (distance < 0.03) {
                    console.log("VELOCIS Match Identified: " + port.name);
                    triggerArrival(port.carousel, port.city);
                }
            });
        });
    }
}

window.onload = activateLocationIntelligence;
