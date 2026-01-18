function showSecurityHub(type) {
    console.log("VELOCIS: Activating Security Hub for " + type);
    
    const alertBanner = document.getElementById('arrival-alert');
    const baggageBox = document.getElementById('carousel-display');
    const baggageText = document.getElementById('baggage-text');

    // Define specific security data for each transport mode
    let securityData = {
        'Air': 'PASSPORT CONTROL & CUSTOMS - TERMINAL 1',
        'Sea': 'PORT SECURITY & IMMIGRATION CHECK',
        'Train': 'RAILWAY BORDER CLEARANCE',
        'Subway': 'STATION SAFETY & EXIT PROTOCOL'
    };

    if (alertBanner && baggageBox && baggageText) {
        // Task: Force visibility of the Security Hub
        alertBanner.style.display = 'block';
        baggageBox.style.display = 'block';
        
        // Task: Style the box Gold to distinguish it from Baggage
        baggageBox.style.borderColor = "#FFD700";
        baggageText.innerHTML = `<span style="color:#FFD700;">${type.toUpperCase()} SECURITY HUB</span><br><small>${securityData[type]}</small>`;
    }
}

/** * VELOCIS™ TASK B: ARRIVAL HUB (GPS/SCANNER DRIVEN)
 * (Your existing GPS triggerArrival function stays here)
 */
function triggerArrival(carouselNum, city) {
    // This remains untouched to preserve your Baggage & OTA work
    document.getElementById('carousel-display').style.display = 'block';
    document.getElementById('baggage-text').innerText = "CAROUSEL " + carouselNum;
    document.getElementById('carousel-display').style.borderColor = "orange";
}
