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
    analyzeBtn.querySelector('span').textContent = 'Analyzing...';
    hideError();
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    // Get user location if available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                formData.append('latitude', position.coords.latitude);
                formData.append('longitude', position.coords.longitude);
                sendAnalysisRequest(formData);
            },
            () => {
                // Location permission denied, continue without location
                sendAnalysisRequest(formData);
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
    .then(response => response.json())
    .then(data => {
        if (data.status === true) {
            displayResults(data.data);
        } else {
            showError(data.message || 'Failed to analyze image. Please try again.');
            resetAnalyzeButton();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('An error occurred. Please try again.');
        resetAnalyzeButton();
    });
}

function resetAnalyzeButton() {
    analyzeBtn.disabled = false;
    spinner.style.display = 'none';
    analyzeBtn.querySelector('span').textContent = 'Analyze My Beauty';
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
    
    // Skin Analysis
    if (analysis.skin) {
        html += `
            <div class="analysis-item">
                <h3><i class="fas fa-face-smile"></i> Skin Analysis</h3>
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
                <h3><i class="fas fa-cut"></i> Hair Analysis</h3>
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
                <h3><i class="fas fa-user"></i> Facial Features</h3>
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
                <h3><i class="fas fa-spa"></i> Recommended Services</h3>
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
    
    // Salons
    if (recommendations.salons && recommendations.salons.length > 0) {
        html += `
            <div class="recommendations-section">
                <h3><i class="fas fa-store"></i> Recommended Salons</h3>
                <div class="salon-list">
        `;
        
        recommendations.salons.forEach(salon => {
            html += `
                <div class="salon-item">
                    ${salon.image || salon.mainImage 
                        ? `<img src="${salon.image || salon.mainImage}" alt="${salon.name || 'Salon'}" onerror="this.style.display='none'">` 
                        : '<div style="width: 80px; height: 80px; background: #ddd; border-radius: 10px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-store" style="font-size: 30px; color: #999;"></i></div>'}
                    <div class="salon-info">
                        <h4>${salon.name || 'Salon'}</h4>
                        ${salon.review ? `<p class="rating"><i class="fas fa-star"></i> ${salon.review.toFixed(1)}</p>` : ''}
                        ${salon.address || (salon.addressDetails && salon.addressDetails.addressLine1) 
                            ? `<p>${salon.address || salon.addressDetails.addressLine1}</p>` 
                            : ''}
                    </div>
                    <i class="fas fa-chevron-right" style="color: #999;"></i>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Beauty Tips
    if (recommendations.beautyTips && recommendations.beautyTips.length > 0) {
        html += `
            <div class="beauty-tips">
                <h3><i class="fas fa-lightbulb"></i> Beauty Tips</h3>
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

