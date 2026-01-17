// VELOCIS™ Mission Intelligence - Isolated Logic
function triggerArrival(carouselNum) {
    const alertBanner = document.getElementById('arrival-alert');
    const baggageBox = document.getElementById('carousel-display');
    const scrollWindow = document.getElementById('travel-guides');
    const baggageText = document.getElementById('baggage-text');

    if (baggageText) {
        baggageText.innerText = "CAROUSEL " + carouselNum;
        alertBanner.style.display = 'block';
        baggageBox.style.display = 'block';

        // Direct scroll to the data without touching other elements
        setTimeout(() => {
            scrollWindow.scrollTo({ top: scrollWindow.scrollHeight, behavior: 'smooth' });
        }, 500);
    }
}
