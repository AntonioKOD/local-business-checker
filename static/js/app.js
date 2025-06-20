// Global variables
let currentResults = [];
let currentFilter = 'all';
let stripe;
let elements;
let paymentElement;

// DOM elements
const searchForm = document.getElementById('searchForm');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const statisticsCard = document.getElementById('statisticsCard');
const businessesGrid = document.getElementById('businessesGrid');
const errorMessage = document.getElementById('errorMessage');
const searchBtn = document.getElementById('searchBtn');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    searchForm.addEventListener('submit', handleSearch);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            setActiveFilter(filter);
            filterBusinesses(filter);
        });
    });
});

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(searchForm);
    const searchData = {
        query: formData.get('query'),
        location: formData.get('location'),
        radius: parseInt(formData.get('radius'))
    };
    
    // Validate form data
    if (!searchData.query.trim() || !searchData.location.trim()) {
        showError('Please fill in both business type and location fields.');
        return;
    }
    
    // Show loading state
    showLoading();
    disableSearchButton();
    
    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'An error occurred while searching');
        }
        
        // Store results and display them
        currentResults = data.businesses || [];
        displayResults(data);
        
        // Show upgrade notice if user is on free plan
        if (data.payment_info && data.payment_info.is_free_user && data.payment_info.remaining > 0) {
            showUpgradeNotice(data.payment_info);
        }
        
        // Show message if API key is not configured
        if (data.message) {
            showApiKeyMessage(data.message);
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
        enableSearchButton();
    }
}

// Show loading state
function showLoading() {
    hideAllSections();
    loadingSection.style.display = 'block';
}

// Show results
function displayResults(data) {
    hideAllSections();
    
    // Display statistics
    displayStatistics(data.statistics);
    
    // Display businesses
    displayBusinesses(data.businesses);
    
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
}

// Display statistics
function displayStatistics(stats) {
    if (!stats) {
        stats = {
            total_businesses: 0,
            businesses_with_websites: 0,
            accessible_websites: 0,
            website_percentage: 0
        };
    }
    
    statisticsCard.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${stats.total_businesses || 0}</div>
                <div class="stat-label">Total Businesses</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.businesses_with_websites || 0}</div>
                <div class="stat-label">Have Websites</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.accessible_websites || 0}</div>
                <div class="stat-label">Accessible Sites</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.website_percentage || 0}%</div>
                <div class="stat-label">Website Coverage</div>
            </div>
        </div>
    `;
}

// Show API key configuration message
function showApiKeyMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'api-key-message';
    messageDiv.style.cssText = `
        background: #ff9800;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        margin: 20px 0;
        text-align: center;
        font-weight: 500;
    `;
    messageDiv.innerHTML = `
        <i class="fas fa-key"></i> ${message}
    `;
    
    // Insert after statistics card
    statisticsCard.parentNode.insertBefore(messageDiv, statisticsCard.nextSibling);
    
    // Remove after 10 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 10000);
}

// Display businesses
function displayBusinesses(businesses) {
    if (businesses.length === 0) {
        businessesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No businesses found</h3>
                <p>Try adjusting your search criteria or location.</p>
            </div>
        `;
        return;
    }
    
    businessesGrid.innerHTML = businesses.map(business => createBusinessCard(business)).join('');
}

// Create business card HTML
function createBusinessCard(business) {
    const websiteStatus = business.website_status;
    const hasWebsite = business.website && business.website !== 'N/A';
    
    let cardClass = 'business-card';
    let statusClass = '';
    let statusIcon = '';
    let statusText = '';
    
    if (!hasWebsite) {
        cardClass += ' no-website';
        statusClass = 'no-website';
        statusIcon = 'fas fa-times-circle';
        statusText = 'No Website Found';
    } else if (websiteStatus.accessible) {
        cardClass += ' has-website';
        statusClass = 'accessible';
        statusIcon = 'fas fa-check-circle';
        statusText = 'Website Accessible';
    } else {
        cardClass += ' not-accessible';
        statusClass = 'not-accessible';
        statusIcon = 'fas fa-exclamation-triangle';
        statusText = websiteStatus.error || 'Website Not Accessible';
    }
    
    const rating = business.rating !== 'N/A' ? business.rating : null;
    const stars = rating ? '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '') : '';
    
    return `
        <div class="${cardClass}" data-filter-category="${getFilterCategory(business)}">
            <div class="business-header">
                <div>
                    <h3 class="business-name">${escapeHtml(business.name)}</h3>
                    ${rating ? `
                        <div class="business-rating">
                            <span class="stars">${stars}</span>
                            <span>${rating}</span>
                            ${business.total_ratings !== 'N/A' ? `<span>(${business.total_ratings} reviews)</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="business-info">
                <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(business.address)}</p>
                ${business.phone !== 'N/A' ? `<p><i class="fas fa-phone"></i> ${escapeHtml(business.phone)}</p>` : ''}
                ${business.types && business.types.length > 0 ? `
                    <p><i class="fas fa-tags"></i> ${business.types.slice(0, 3).map(type => 
                        type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    ).join(', ')}</p>
                ` : ''}
            </div>
            
            <div class="website-status ${statusClass}">
                <h4><i class="${statusIcon}"></i> ${statusText}</h4>
                ${hasWebsite ? `
                    <a href="${business.website}" target="_blank" rel="noopener noreferrer" class="website-link">
                        ${business.website}
                    </a>
                    ${websiteStatus.title ? `<p><strong>Page Title:</strong> ${escapeHtml(websiteStatus.title)}</p>` : ''}
                    ${websiteStatus.status_code ? `<p><strong>Status Code:</strong> ${websiteStatus.status_code}</p>` : ''}
                ` : ''}
                ${websiteStatus.error && websiteStatus.error !== 'No website provided' ? `
                    <p><strong>Error:</strong> ${escapeHtml(websiteStatus.error)}</p>
                ` : ''}
            </div>
        </div>
    `;
}

// Get filter category for business
function getFilterCategory(business) {
    const hasWebsite = business.website && business.website !== 'N/A';
    
    if (!hasWebsite) {
        return 'no-website';
    } else if (business.website_status.accessible) {
        return 'accessible';
    } else {
        return 'not-accessible';
    }
}

// Filter businesses
function filterBusinesses(filter) {
    const businessCards = document.querySelectorAll('.business-card');
    
    businessCards.forEach(card => {
        const category = card.getAttribute('data-filter-category');
        let show = false;
        
        switch (filter) {
            case 'all':
                show = true;
                break;
            case 'with-website':
                show = category === 'accessible' || category === 'not-accessible';
                break;
            case 'no-website':
                show = category === 'no-website';
                break;
            case 'accessible':
                show = category === 'accessible';
                break;
            case 'not-accessible':
                show = category === 'not-accessible';
                break;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
    
    currentFilter = filter;
}

// Set active filter button
function setActiveFilter(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
}

// Show error
function showError(message) {
    hideAllSections();
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

// Hide error
function hideError() {
    errorSection.style.display = 'none';
}

// Hide all sections
function hideAllSections() {
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// Disable/Enable search button
function disableSearchButton() {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
}

function enableSearchButton() {
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i> Search Businesses';
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-complete location using browser geolocation (optional enhancement)
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
                    const data = await response.json();
                    
                    if (data.city && data.principalSubdivisionCode) {
                        document.getElementById('location').value = `${data.city}, ${data.principalSubdivisionCode}`;
                    }
                } catch (error) {
                    console.log('Could not get location name:', error);
                }
            },
            (error) => {
                console.log('Geolocation error:', error);
            }
        );
    }
}

// Add location button (optional)
document.addEventListener('DOMContentLoaded', function() {
    const locationInput = document.getElementById('location');
    const locationButton = document.createElement('button');
    locationButton.type = 'button';
    locationButton.innerHTML = '<i class="fas fa-location-arrow"></i>';
    locationButton.className = 'location-btn';
    locationButton.title = 'Use current location';
    locationButton.onclick = getCurrentLocation;
    
    // Add some basic styling for the location button
    locationButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: #667eea;
        color: white;
        border: none;
        padding: 8px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
    `;
    
    // Make location input container relative
    locationInput.parentElement.style.position = 'relative';
    locationInput.style.paddingRight = '45px';
    locationInput.parentElement.appendChild(locationButton);
});

// Payment functionality
function showUpgradeNotice(paymentInfo) {
    const upgradeNotice = document.getElementById('upgradeNotice');
    const showingCount = document.getElementById('showingCount');
    const totalCount = document.getElementById('totalCount');
    const remainingCount = document.getElementById('remainingCount');
    const upgradeBtn = document.getElementById('upgradeBtn');
    
    showingCount.textContent = paymentInfo.showing;
    totalCount.textContent = paymentInfo.total_found;
    remainingCount.textContent = paymentInfo.remaining;
    
    // Update button text to be more dynamic
    const resultText = paymentInfo.remaining === 1 ? 'result' : 'results';
    upgradeBtn.innerHTML = `
        <i class="fas fa-unlock"></i>
        Unlock ${paymentInfo.remaining} More ${resultText.charAt(0).toUpperCase() + resultText.slice(1)} - $6
    `;
    
    upgradeNotice.style.display = 'block';
    
    // Add click handler for upgrade button
    upgradeBtn.onclick = openPaymentModal;
}

async function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    const closeModal = document.getElementById('closeModal');
    
    // Show modal
    modal.style.display = 'block';
    
    // Close modal handlers
    closeModal.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
    
    // Initialize Stripe payment
    await initializePayment();
}

async function initializePayment() {
    try {
        // Create payment intent
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to initialize payment');
        }
        
        // Initialize Stripe
        stripe = Stripe(data.publishable_key);
        elements = stripe.elements({
            clientSecret: data.client_secret
        });
        
        // Create payment element
        paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        
        // Add form submit handler
        const form = document.getElementById('payment-form');
        form.addEventListener('submit', handlePaymentSubmit);
        
    } catch (error) {
        console.error('Payment initialization error:', error);
        showPaymentMessage(error.message, 'error');
    }
}

async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    if (!stripe || !elements) {
        return;
    }
    
    setPaymentLoading(true);
    
    try {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (paymentIntent.status === 'succeeded') {
            // Confirm payment with backend
            const confirmResponse = await fetch('/confirm-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_intent_id: paymentIntent.id
                })
            });
            
            const confirmData = await confirmResponse.json();
            
            if (confirmResponse.ok && confirmData.success) {
                showPaymentMessage('Payment successful! Refreshing results...', 'success');
                
                // Close modal after delay and refresh search
                setTimeout(() => {
                    document.getElementById('paymentModal').style.display = 'none';
                    // Trigger a new search to get full results
                    handleSearch({ preventDefault: () => {} });
                }, 2000);
            } else {
                throw new Error(confirmData.error || 'Payment confirmation failed');
            }
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        showPaymentMessage(error.message, 'error');
    } finally {
        setPaymentLoading(false);
    }
}

function setPaymentLoading(isLoading) {
    const submitButton = document.getElementById('submit-payment');
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('spinner');
    
    if (isLoading) {
        submitButton.disabled = true;
        buttonText.textContent = 'Processing...';
        spinner.classList.remove('hidden');
    } else {
        submitButton.disabled = false;
        buttonText.textContent = 'Pay Now - $6';
        spinner.classList.add('hidden');
    }
}

function showPaymentMessage(message, type) {
    const messageElement = document.getElementById('payment-message');
    messageElement.textContent = message;
    messageElement.className = type;
    messageElement.classList.remove('hidden');
    
    // Hide message after 5 seconds for success, keep error messages
    if (type === 'success') {
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 5000);
    }
} 