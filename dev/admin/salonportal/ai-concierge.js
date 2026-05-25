// AI Concierge JavaScript
const API_BASE_URL = 'https://skedisy.com/';
const SECRET_KEY = 'r8Cs1WcSI9';
const API_ENDPOINT = API_BASE_URL + 'user/aiConcierge/analyzeSelfie';

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const uploadBtn = document.getElementById('uploadBtn');
const removeBtn = document.getElementById('removeBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeSection = document.getElementById('analyzeSection');
const spinner = document.getElementById('spinner');
const mainContent = document.getElementById('mainContent');
const resultsSection = document.getElementById('resultsSection');
const analysisContent = document.getElementById('analysisContent');
const recommendationsContent = document.getElementById('recommendationsContent');
const errorMessage = document.getElementById('errorMessage');
const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');

let selectedFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Upload button click
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Remove button
    removeBtn.addEventListener('click', removeImage);
    
    // Analyze button
    analyzeBtn.addEventListener('click', analyzeImage);
    
    // Analyze another button
    analyzeAnotherBtn.addEventListener('click', resetAnalysis);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Click on upload area
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target === uploadPlaceholder) {
            fileInput.click();
        }
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    } else {
        showError('Please select a valid image file');
    }
}

function processFile(file) {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
    }
    
    selectedFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadPlaceholder.style.display = 'none';
        imagePreview.style.display = 'block';
        analyzeSection.style.display = 'block';
        hideError();
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedFile = null;
    fileInput.value = '';
    uploadPlaceholder.style.display = 'flex';
    imagePreview.style.display = 'none';
    analyzeSection.style.display = 'none';
    hideError();
}

function analyzeImage() {
    if (!selectedFile) {
        showError('Please select an image first');
        return;
    }
    
    // Show loading state
    analyzeBtn.disabled = true;
    spinner.style.display = 'inline-block';
    analyzeBtn.querySelector('span').textContent = 'Analyse en cours…';
    hideError();
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    // Get user location if available
    // Use timeout to prevent hanging if geolocation is slow or blocked
    if (navigator.geolocation) {
        const locationTimeout = setTimeout(() => {
            // If location takes too long, proceed without it
            console.warn('Location request timed out, proceeding without location');
            sendAnalysisRequest(formData);
        }, 5000); // 5 second timeout
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(locationTimeout);
                // Validate coordinates (check for valid numbers and reasonable ranges)
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Check if coordinates are valid (not NaN and within valid ranges)
                if (!isNaN(lat) && !isNaN(lng) && 
                    lat >= -90 && lat <= 90 && 
                    lng >= -180 && lng <= 180) {
                    formData.append('latitude', lat);
                    formData.append('longitude', lng);
                    console.log('Location obtained:', lat, lng);
                } else {
                    console.warn('Invalid location coordinates, proceeding without location');
                }
                sendAnalysisRequest(formData);
            },
            (error) => {
                clearTimeout(locationTimeout);
                // Location permission denied or error, continue without location
                console.warn('Location error:', error.message);
                sendAnalysisRequest(formData);
            },
            {
                enableHighAccuracy: false, // Don't require high accuracy (faster)
                timeout: 4000, // 4 second timeout
                maximumAge: 300000 // Accept cached location up to 5 minutes old
            }
        );
    } else {
        sendAnalysisRequest(formData);
    }
}

function sendAnalysisRequest(formData) {
    // Make API request
    fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'key': SECRET_KEY
        },
        body: formData
    })
    .then(response => {
        // Check if response is ok
        if (!response.ok) {
            // If response is not ok, try to parse error
            return response.json().then(errData => {
                throw new Error(errData.message || `Server error: ${response.status} ${response.statusText}`);
            }).catch(() => {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.status === true) {
            displayResults(data.data);
        } else {
            showError(data.message || data.error || 'Failed to analyze image. Please try again.');
            resetAnalyzeButton();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError(error.message || 'An error occurred. Please check your connection and try again.');
        resetAnalyzeButton();
    });
}

function resetAnalyzeButton() {
    analyzeBtn.disabled = false;
    spinner.style.display = 'none';
    analyzeBtn.querySelector('span').textContent = 'Analyser et trouver mon salon';
}

function displayResults(data) {
    // Hide main content, show results
    mainContent.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Display analysis
    if (data.analysis) {
        displayAnalysis(data.analysis);
    }
    
    // Display recommendations
    if (data.recommendations) {
        displayRecommendations(data.recommendations);
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayAnalysis(analysis) {
    let html = '';

    if (analysis.recommendedNeeds?.summary) {
        html += `
            <div class="analysis-item analysis-item--summary">
                <h3><i class="fas fa-star" aria-hidden="true"></i> Recommandation Skedisy</h3>
                <p>${escapeHtml(analysis.recommendedNeeds.summary)}</p>
                ${analysis.recommendedNeeds.primaryCategories?.length
                    ? `<p><strong>Catégories :</strong> ${escapeHtml(analysis.recommendedNeeds.primaryCategories.join(', '))}</p>`
                    : ''}
            </div>
        `;
    }
    
    // Skin Analysis
    if (analysis.skin) {
        html += `
            <div class="analysis-item">
                <h3><i class="fas fa-face-smile" aria-hidden="true"></i> Peau</h3>
                <p><strong>Type:</strong> ${analysis.skin.type || 'N/A'}</p>
                <p><strong>Tone:</strong> ${analysis.skin.tone || 'N/A'}</p>
                <p><strong>Undertone:</strong> ${analysis.skin.undertone || 'N/A'}</p>
                <p><strong>Condition:</strong> ${analysis.skin.condition || 'N/A'}</p>
                ${analysis.skin.concerns && analysis.skin.concerns.length > 0 
                    ? `<p><strong>Concerns:</strong> ${analysis.skin.concerns.join(', ')}</p>` 
                    : ''}
            </div>
        `;
    }
    
    // Hair Analysis
    if (analysis.hair) {
        html += `
            <div class="analysis-item">
                <h3><i class="fas fa-cut" aria-hidden="true"></i> Cheveux</h3>
                <p><strong>Type:</strong> ${analysis.hair.type || 'N/A'}</p>
                <p><strong>Texture:</strong> ${analysis.hair.texture || 'N/A'}</p>
                <p><strong>Color:</strong> ${analysis.hair.color || 'N/A'}</p>
                <p><strong>Condition:</strong> ${analysis.hair.condition || 'N/A'}</p>
                ${analysis.hair.length ? `<p><strong>Length:</strong> ${analysis.hair.length}</p>` : ''}
            </div>
        `;
    }
    
    // Face Analysis
    if (analysis.face) {
        html += `
            <div class="analysis-item">
                <h3><i class="fas fa-user" aria-hidden="true"></i> Visage</h3>
                <p><strong>Face Shape:</strong> ${analysis.face.shape || 'N/A'}</p>
                <p><strong>Eye Shape:</strong> ${analysis.face.eyeShape || 'N/A'}</p>
                <p><strong>Lip Shape:</strong> ${analysis.face.lipShape || 'N/A'}</p>
                ${analysis.face.eyebrowShape ? `<p><strong>Eyebrow:</strong> ${analysis.face.eyebrowShape}</p>` : ''}
            </div>
        `;
    }
    
    analysisContent.innerHTML = html;
}

function displayRecommendations(recommendations) {
    let html = '';
    
    // Services
    if (recommendations.services && recommendations.services.length > 0) {
        html += `
            <div class="recommendations-section">
                <h3><i class="fas fa-spa" aria-hidden="true"></i> Prestations suggérées</h3>
                <div class="services-grid">
        `;
        
        recommendations.services.forEach(service => {
            html += `
                <div class="service-card">
                    ${service.image ? `<img src="${service.image}" alt="${service.name || 'Service'}" onerror="this.style.display='none'">` : ''}
                    <h4>${service.name || 'Service'}</h4>
                    ${service.duration ? `<p style="color: #666; font-size: 12px;">${service.duration} min</p>` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Salons - Always show salon recommendations section
    html += `
        <div class="recommendations-section">
            <h3><i class="fas fa-store" aria-hidden="true"></i> Salons afro en Île-de-France</h3>
    `;
    
    if (recommendations.salons && recommendations.salons.length > 0) {
        html += `<div class="salon-list">`;
        
        recommendations.salons.forEach((salon) => {
            const salonId = salon._id || salon.id;
            let webUrl = salon.shareUrl;
            if (!webUrl && salonId) {
                const salonSlug = salon.slug || (salon.name ? salon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : 'salon');
                const shortId = salon.shortId || String(salonId).substring(0, 6);
                webUrl = `${API_BASE_URL.replace(/\/+$/, "")}/salon/${salonSlug}-${shortId}`;
            }
            const matchHint = formatSalonMatchHint(salon);
            const name = escapeHtml(salon.name || 'Salon');
            const addr = escapeHtml(salon.address || (salon.addressDetails && salon.addressDetails.addressLine1) || '');
            const img = salon.image || salon.mainImage;
            html += `
                <a class="salon-item salon-item--link" href="${escapeHtml(webUrl || '#')}" data-salon-id="${escapeHtml(String(salonId || ''))}">
                    ${img
                        ? `<img src="${escapeHtml(img)}" alt="${name}" onerror="this.style.display='none'">`
                        : '<div class="salon-item__placeholder"><i class="fas fa-store" aria-hidden="true"></i></div>'}
                    <div class="salon-info">
                        <h4>${name}</h4>
                        ${salon.review ? `<p class="rating"><i class="fas fa-star" aria-hidden="true"></i> ${salon.review.toFixed(1)}</p>` : ''}
                        ${matchHint ? `<p class="salon-match-hint">${matchHint}</p>` : ''}
                        ${addr ? `<p class="salon-address">${addr}</p>` : ''}
                        ${salon.distance != null ? `<p class="salon-distance"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${salon.distance.toFixed(1)} km</p>` : ''}
                        <p class="salon-cta">Voir le salon et réserver</p>
                    </div>
                    <i class="fas fa-chevron-right salon-item__chevron" aria-hidden="true"></i>
                </a>
            `;
        });
        
        html += `</div>`;
    } else {
        // Show message if no salons found
        html += `
            <div style="padding: 20px; text-align: center; color: #666;">
                <i class="fas fa-info-circle" style="font-size: 24px; margin-bottom: 10px; color: #999;"></i>
                <p>Aucun salon trouvé pour le moment. Essayez une autre photo ou parcourez les prestations sur l'accueil.</p>
            </div>
        `;
    }
    
    html += `</div>`;
    
    // Beauty Tips
    if (recommendations.beautyTips && recommendations.beautyTips.length > 0) {
        html += `
            <div class="beauty-tips">
                <h3><i class="fas fa-lightbulb" aria-hidden="true"></i> Conseils</h3>
                <ul>
        `;
        
        recommendations.beautyTips.forEach(tip => {
            html += `<li>${tip}</li>`;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    recommendationsContent.innerHTML = html;
}

function resetAnalysis() {
    // Reset everything
    selectedFile = null;
    fileInput.value = '';
    uploadPlaceholder.style.display = 'flex';
    imagePreview.style.display = 'none';
    analyzeSection.style.display = 'none';
    mainContent.style.display = 'block';
    resultsSection.style.display = 'none';
    analysisContent.innerHTML = '';
    recommendationsContent.innerHTML = '';
    resetAnalyzeButton();
    hideError();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatSalonMatchHint(salon) {
    const types = salon.matchingServiceTypes || [];
    const count = salon.matchingServiceCount || 0;
    if (types.length) {
        const labels = { tresses: 'Tresses', locks: 'Locks', perruques: 'Perruques', homme: 'Homme', esthetique: 'Esthétique', hair: 'Coiffure', skin: 'Soins peau' };
        const shown = types.slice(0, 2).map((t) => labels[t] || t).join(', ');
        return escapeHtml(`Adapté pour vous · ${shown}${count > 1 ? ` (${count} prestations)` : ''}`);
    }
    if (count > 0) {
        return escapeHtml(`${count} prestation(s) correspondante(s)`);
    }
    return '';
}

/** Ouvre la fiche salon web (réservation web activée). */
function handleSalonClick(salonId, webUrl) {
    if (!webUrl && salonId) {
        webUrl = `${API_BASE_URL.replace(/\/+$/, "")}/salon/${salonId}`;
    }
    if (!webUrl) {
        console.error("Salon URL manquante");
        return;
    }
    window.location.href = webUrl;
}

