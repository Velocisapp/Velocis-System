/**
 * VELOCIS™ GLOBAL MOBILITY COMMAND
 * Logic: Icons = Security Hub | GPS/Scanner = Baggage & OTAs
 */

// 1. THIS IS FOR THE ICONS ONLY (The Security Hub)
function showSecurityHub(type) {
    const baggageBox = document.getElementById('carousel-display');
    const baggageText = document.getElementById('baggage-text');
    
    if (baggageBox && baggageText) {
        baggageBox.style.display = 'block';
        baggageBox.style.borderColor = "#FFD700"; // Gold for Security
        baggageText.innerText = type.toUpperCase() + " SECURITY HUB ACTIVE";
        // Note: This does NOT trigger the OTA links
    }
}

// 2. THIS IS FOR GPS/SCANNER ONLY (Baggage & OTAs)
function triggerArrival(carouselNum, city) {
    const baggageBox = document.getElementById('carousel-display');
    const baggageText = document.getElementById('baggage-text');
    const booking = document.getElementById('booking-link');
    const trip = document.getElementById('trip-link');

    // Marketplace Intelligence (OTAs)
    if (city === 'HK') {
        if (booking) booking.innerText = "View Hong Kong Hotels (Booking.com)";
        if (trip) trip.innerText = "Find Hong Kong Flights (Trip.com)";
    } else {
        if (booking) booking.innerText = "View Paris Hotels (Booking.com)";
        if (trip) trip.innerText = "Find Paris Flights (Trip.com)";
    }

    // Baggage Display
    if (baggageBox && baggageText) {
        baggageBox.style.display = 'block';
        baggageBox.style.borderColor = "orange"; 
        baggageText.innerText = "CAROUSEL " + carouselNum;
    }
}

// GPS Logic remains linked to triggerArrival
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
                    triggerArrival(port.carousel, port.city);
                }
            });
        });
    }
}
window.onload = activateLocationIntelligence;
