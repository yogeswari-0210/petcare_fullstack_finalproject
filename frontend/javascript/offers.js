async function loadOffers() {
    try {
        const response = await fetch('http://127.0.0.1:8000/offers/');
        if (!response.ok) throw new Error('Failed to fetch offers');

        const offers = await response.json();
        const offerContainer = document.querySelector('.filter'); // Assuming aside.filter is where offers go

        if (!offerContainer) return;

        // Remove existing static offers
        const existingOffers = offerContainer.querySelectorAll('.offer');
        existingOffers.forEach(off => off.remove());

        // Add dynamic offers
        offers.forEach(offer => {
            const offerDiv = document.createElement('div');
            offerDiv.className = 'offer';
            // Use discount_percentage if description is just text, or keep original description
            const displayTitle = offer.title || `Extra ${offer.discount_percentage}% OFF`;
            offerDiv.innerHTML = `
                ${offer.image_url ? `<img src="${offer.image_url}" alt="Offer Icon">` : '<i class="bi bi-tag-fill" style="font-size: 24px; color: #ff9d00;"></i>'}
                <p><strong>${displayTitle}</strong><br>${offer.description}</p>
                <div class="code">${offer.code || 'NOCODE'}</div>
            `;
            offerContainer.appendChild(offerDiv);
        });
    } catch (error) {
        console.error('Error loading offers:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadOffers);
