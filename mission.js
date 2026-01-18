/**
 * VELOCIS™ MODULAR COMMAND - RESTORED SECURITY HUB
 * Task A: Icons -> Security Hub (Passport & Customs)
 * Task B: GPS/Scanner -> Baggage & OTAs
 */

// --- TASK A: THE SECURITY HUB (Manual Control via Icons) ---
function showSecurityHub(type) {
    const baggageBox = document.getElementById('carousel-display');
    const baggageText = document.getElementById('baggage-text');
    const alertBanner = document.getElementById('arrival-alert');

    // 1. Identify the specific security task based on the icon
    let securityDetail = "";
    if (type === 'Air') securityDetail = "PASSPORT CONTROL & CUSTOMS";
    else if (type === 'Sea') securityDetail = "PORT SECURITY & IMMIGRATION";
    else if (type === 'Train') securityDetail = "RAILWAY BORDER CHECK";
    else if (type === 'Subway') securityDetail = "STATION SAFETY CLEARANCE";

    // 2. Update the UI without touching the OTA links
    if (baggageBox && baggageText && alertBanner) {
        alertBanner.style.display = 'block';
        baggageBox.style.display = 'block';
        baggageBox.style.borderColor = "#FFD700"; // Gold for Security focus
        baggageText.innerHTML = `<span style="color:#FFD700;">${type.toUpperCase()} SECURITY HUB</span><br><small>${securityDetail}</small>`;
    }
}

// --- TASK B: THE ARRIVAL HUB (Automated via GPS or Scanner) ---
function triggerArrival(carouselNum, city) {
    const baggageBox = document.getElementById('carousel-display');
    const baggageText = document.getElementById('baggage-text');
    const booking = document.getElementById('booking-link');
    const trip = document.getElementById('trip-link');

    // 1. Update Revenue Links (OTAs) 
    if (city === 'HK') {
        if (booking) booking.innerText = "View Hong Kong Hotels (Booking.com)";
        if (trip) trip.innerText = "Find Hong Kong Flights (Trip.com)";
    } else if (city === 'Paris') {
        if (booking) booking.innerText = "View Paris Hotels (Booking.com)";
        if (trip) trip.innerText = "Find Paris Flights (Trip.com)";
    }

    // 2. Update Baggage Info
    if (baggageBox && baggageText) {
        baggageBox.style.display = 'block';
        baggageBox.style.borderColor = "orange"; 
        baggageText.innerText = "CAROUSEL " + carouselNum;
    }
}

// --- GPS INTELLIGENCE (Triggers Task B) ---
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
