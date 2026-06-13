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
let clientLocation = { lat: null, lng: null, active: false };
let captureMode = false;

function t(key) {
    if (typeof getTranslation === 'function') return getTranslation(key);
    return key;
}

function isCaptureMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get('capture') === '1' || params.get('capture') === 'true';
}

function applyCaptureModeUI() {
    captureMode = isCaptureMode();
    const title = document.getElementById('conciergeTitle');
    const subtitle = document.getElementById('conciergeSubtitle');
    const description = document.getElementById('conciergeDescription');
    const captureLinkRow = document.getElementById('captureLinkRow');
    const capturePrivacy = document.getElementById('capturePrivacy');
    const uploadKicker = document.querySelector('.sq-upload-kicker');
    const uploadH3 = document.querySelector('#uploadPlaceholder h3');
    const uploadLead = document.querySelector('.sq-upload-lead');
    const analyzeLabel = document.getElementById('analyzeBtnLabel');
    const uploadBtnLabel = document.getElementById('uploadBtnLabel');

    if (captureMode) {
        if (title) title.textContent = t('capture.screenTitle');
        if (subtitle) subtitle.textContent = t('capture.heroTitle');
        if (description) description.innerHTML = t('capture.heroBody');
        if (captureLinkRow) captureLinkRow.style.display = 'block';
        if (capturePrivacy) capturePrivacy.style.display = 'block';
        if (uploadKicker) uploadKicker.textContent = t('capture.uploadKicker');
        if (uploadH3) uploadH3.textContent = t('capture.uploadTitle');
        if (uploadLead) uploadLead.innerHTML = t('capture.uploadLead');
        if (analyzeLabel) analyzeLabel.textContent = t('capture.analyzeLook');
        if (uploadBtnLabel) uploadBtnLabel.textContent = t('capture.choosePhoto');
        document.title = t('capture.screenTitle') + ' | Skedisy';
    } else {
        if (analyzeLabel) analyzeLabel.textContent = t('concierge.analyzeBtn');
    }
}

function isMobileConcierge() {
    return window.matchMedia('(max-width: 768px)').matches;
}

function sortSalonsByDistance(salons) {
    if (!salons || !salons.length) return salons;
    return [...salons].sort((a, b) => {
        const da = a.distance != null ? a.distance : 9999;
        const db = b.distance != null ? b.distance : 9999;
        if (da !== db) return da - db;
        return (b.review || 0) - (a.review || 0);
    });
}

function updateLocationStatusUI() {
    const el = document.getElementById('locationStatus');
    if (!el) return;
    if (clientLocation.active) {
        el.textContent = 'Localisation activée — salons proches de vous en priorité.';
        el.classList.add('sq-location-status--ok');
    } else if (isMobileConcierge()) {
        el.textContent = 'Autorisez la localisation pour des salons afro près de chez vous (recommandé).';
        el.classList.remove('sq-location-status--ok');
    } else {
        el.textContent = '';
    }
}

function requestClientLocation(onDone) {
    if (!navigator.geolocation) {
        updateLocationStatusUI();
        if (onDone) onDone();
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (!isNaN(lat) && !isNaN(lng)) {
                clientLocation = { lat, lng, active: true };
            }
            updateLocationStatusUI();
            if (onDone) onDone();
        },
        () => {
            clientLocation = { lat: null, lng: null, active: false };
            updateLocationStatusUI();
            if (onDone) onDone();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
}

function appendLocationToFormData(formData) {
    if (clientLocation.active && clientLocation.lat != null && clientLocation.lng != null) {
        formData.append('latitude', clientLocation.lat);
        formData.append('longitude', clientLocation.lng);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    applyCaptureModeUI();
    setupEventListeners();
    if (isMobileConcierge()) {
        requestClientLocation();
    } else {
        updateLocationStatusUI();
    }
});

document.addEventListener('skedisy:language-changed', applyCaptureModeUI);

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
    const analyzeLabel = document.getElementById('analyzeBtnLabel');
    if (analyzeLabel) analyzeLabel.textContent = t('concierge.analyzing');
    hideError();
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    const runAnalyze = () => {
        appendLocationToFormData(formData);
        if (window.SkedisyHairProfile) {
            SkedisyHairProfile.appendToFormData(formData);
        }
        if (isMobileConcierge() && !clientLocation.active) {
            const ok = window.confirm(
                'Sans localisation, les salons ne seront pas triés par distance.\n\nAutoriser la position maintenant ?'
            );
            if (ok) {
                requestClientLocation(() => {
                    appendLocationToFormData(formData);
                    sendAnalysisRequest(formData);
                });
                return;
            }
        }
        sendAnalysisRequest(formData);
    };

    if (!clientLocation.active && navigator.geolocation) {
        requestClientLocation(runAnalyze);
    } else {
        runAnalyze();
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
    const label = document.getElementById('analyzeBtnLabel');
    if (label) {
        label.textContent = captureMode ? t('capture.analyzeLook') : t('concierge.analyzeBtn');
    }
}

function displayResults(data) {
    // Hide main content, show results
    mainContent.style.display = 'none';
    resultsSection.style.display = 'block';

    const locationUsed = data.locationUsed || data.recommendations?.locationUsed;
    
    // Display analysis
    if (data.analysis) {
        displayAnalysis(data.analysis);
    }
    
    // Display recommendations
    if (data.recommendations) {
        displayRecommendations(data.recommendations, locationUsed);
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

function renderSalonCard(salon) {
    const salonId = salon._id || salon.id;
    let webUrl = salon.shareUrl;
    if (!webUrl && salonId) {
        const salonSlug =
            salon.slug ||
            (salon.name
                ? salon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                : 'salon');
        const shortId = salon.shortId || String(salonId).substring(0, 6);
        webUrl = `${API_BASE_URL.replace(/\/+$/, '')}/salon/${salonSlug}-${shortId}`;
    }
    const matchHint = formatSalonMatchHint(salon);
    const name = escapeHtml(salon.name || 'Salon');
    const addr = escapeHtml(
        salon.address || (salon.addressDetails && salon.addressDetails.addressLine1) || ''
    );
    const img = salon.image || salon.mainImage;
    const mobile = isMobileConcierge();

    if (mobile) {
        return `
            <a class="salon-item salon-item--link salon-item--mobile" href="${escapeHtml(webUrl || '#')}">
                <div class="salon-item__media">
                    ${
                        img
                            ? `<img src="${escapeHtml(img)}" alt="${name}" loading="lazy" onerror="this.parentElement.classList.add('salon-item__media--fallback')">`
                            : '<div class="salon-item__placeholder"><i class="fas fa-store" aria-hidden="true"></i></div>'
                    }
                </div>
                <div class="salon-item__body">
                    ${addr ? `<p class="salon-address salon-address--primary"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${addr}</p>` : ''}
                    <h4 class="salon-item__name">${name}</h4>
                    ${salon.distance != null ? `<p class="salon-distance">${salon.distance.toFixed(1)} km · près de vous</p>` : ''}
                    ${salon.review ? `<p class="rating"><i class="fas fa-star" aria-hidden="true"></i> ${salon.review.toFixed(1)}</p>` : ''}
                    ${matchHint ? `<p class="salon-match-hint">${matchHint}</p>` : ''}
                    <span class="salon-cta">Voir le salon et réserver</span>
                </div>
            </a>
        `;
    }

    return `
        <a class="salon-item salon-item--link" href="${escapeHtml(webUrl || '#')}" data-salon-id="${escapeHtml(String(salonId || ''))}">
            ${
                img
                    ? `<img src="${escapeHtml(img)}" alt="${name}" onerror="this.style.display='none'">`
                    : '<div class="salon-item__placeholder"><i class="fas fa-store" aria-hidden="true"></i></div>'
            }
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
}

function displayRecommendations(recommendations, locationUsed) {
    let html = '';
    const mobile = isMobileConcierge();
    let salons = recommendations.salons || [];
    if (locationUsed || clientLocation.active) {
        salons = sortSalonsByDistance(salons);
    }
    
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
    const leadText = locationUsed || clientLocation.active
        ? 'Salons afro en Île-de-France, classés selon votre position et votre profil.'
        : 'Salons afro en Île-de-France classés selon vos besoins (prestations, catégories).';

    html += `
        <div class="recommendations-section${mobile ? ' recommendations-section--mobile' : ''}">
            <h3><i class="fas fa-store" aria-hidden="true"></i> Salons afro en Île-de-France</h3>
            <p class="recommendations-lead">${escapeHtml(leadText)}</p>
    `;

    if (salons.length > 0) {
        html += `<div class="salon-list${mobile ? ' salon-list--mobile' : ''}">`;
        salons.forEach((salon) => {
            html += renderSalonCard(salon);
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

