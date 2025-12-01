// Tab Navigation dengan animasi
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with animations
    initializeAnimations();
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.transform = 'translateY(0)';
            });
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.style.animation = 'none';
            });

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            button.style.transform = 'translateY(-2px)';
            
            const tabId = button.getAttribute('data-tab');
            const activePanel = document.getElementById(tabId);
            activePanel.classList.add('active');
            activePanel.style.animation = 'fadeIn 0.5s ease-in-out';

            // Add ripple effect
            createRippleEffect(button);
        });
    });

    // Enhanced slider functionality with real-time updates
    initializeSliders();

    // Initialize rule testing interface
    initializeRuleTesting();

    // Add intersection observer for scroll animations
    initializeScrollAnimations();
});

// Initialize animations on page load
function initializeAnimations() {
    // Add loading animation to main elements
    const elements = document.querySelectorAll('.form-section, .result-card, .rule-test-card');
    elements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });
}

// Enhanced slider initialization
function initializeSliders() {
    const sliders = [
        { slider: 'sleep-duration', value: 'sleep-duration-value', suffix: 'h' },
        { slider: 'sleep-quality', value: 'sleep-quality-value', suffix: '' },
        { slider: 'stress-level', value: 'stress-level-value', suffix: '' }
    ];

    sliders.forEach(({ slider, value, suffix }) => {
        const sliderElement = document.getElementById(slider);
        const valueElement = document.getElementById(value);

        if (sliderElement && valueElement) {
            // Set initial gradient
            updateSliderGradient(sliderElement);

            sliderElement.addEventListener('input', () => {
                const value = sliderElement.value;
                valueElement.textContent = suffix ? `${value}${suffix}` : value;
                updateSliderGradient(sliderElement);
                
                // Add pulse animation to value display
                valueElement.style.animation = 'pulse 0.3s ease';
                setTimeout(() => {
                    valueElement.style.animation = '';
                }, 300);
            });
        }
    });
}

// Update slider gradient based on value
function updateSliderGradient(slider) {
    const value = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary) ${value}%, var(--border) ${value}%)`;
}

// Create ripple effect for buttons
function createRippleEffect(button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Initialize scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.form-section, .result-card, .rule-test-card').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced form submission with better animations
document.getElementById('diagnosis-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    const formData = collectFormData();

    if (!validateForm(formData)) {
        showNotification('Please check your input values', 'error');
        return;
    }

    try {
        // Enhanced loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner loading-spinner"></i> Analyzing Clinical Data...';
        submitBtn.disabled = true;
        
        // Add progress bar animation
        showProgressBar();

        const result = await performAnalysis(formData);
        
        // Hide progress bar
        hideProgressBar();
        
        // Display results with enhanced animations
        displayResults(result);
        
        // Show results section with animation
        showResultsPanel();

    } catch (error) {
        console.error('Error:', error);
        showNotification('Error performing analysis. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Enhanced form data collection
function collectFormData() {
    return {
        Age: parseInt(document.getElementById('age').value),
        Gender: document.getElementById('gender').value,
        "Sleep Duration": parseFloat(document.getElementById('sleep-duration').value),
        "Quality of Sleep": parseInt(document.getElementById('sleep-quality').value),
        "Stress Level": parseInt(document.getElementById('stress-level').value),
        "Physical Activity Level": parseInt(document.getElementById('activity-minutes').value),
        "BMI Category": document.getElementById('bmi-category').value,
        "Blood Pressure": document.getElementById('blood-pressure').value,
        "Heart Rate": parseInt(document.getElementById('heart-rate').value),
        "Daily Steps": parseInt(document.getElementById('daily-steps').value)
    };
}

// Form validation
function validateForm(formData) {
    if (!formData["Blood Pressure"] || !formData["Blood Pressure"].includes('/')) {
        return false;
    }
    if (formData.Age < 1 || formData.Age > 120) {
        return false;
    }
    return true;
}

// Show progress bar
function showProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    progressBar.style.margin = '1rem 0';
    
    const formActions = document.querySelector('.form-actions');
    formActions.parentNode.insertBefore(progressBar, formActions);
}

// Hide progress bar
function hideProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.opacity = '0';
        setTimeout(() => progressBar.remove(), 300);
    }
}

// Show results panel with animation
function showResultsPanel() {
    const resultsPanel = document.getElementById('results');
    resultsPanel.style.display = 'block';
    
    // Reset animations for results
    const resultElements = resultsPanel.querySelectorAll('.result-card');
    resultElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
        element.style.animation = 'fadeInUp 0.6s ease-out both';
    });
    
    // Scroll to results
    resultsPanel.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Enhanced display results with sequential animations
function displayResults(result) {
    animateResultSequentially([
        () => displayDiagnosis(result),
        () => displayRiskAssessment(result),
        () => displayLifestyleIssues(result),
        () => displayRecommendations(result),
        () => displayFiredRules(result)
    ]);
}

// Animate results sequentially
function animateResultSequentially(animationFunctions) {
    animationFunctions.forEach((func, index) => {
        setTimeout(() => {
            func();
        }, index * 300);
    });
}

// Enhanced individual display functions
function displayDiagnosis(result) {
    const diagnosisElement = document.getElementById('diagnosis-result');
    diagnosisElement.innerHTML = `
        <div class="diagnosis-badge">
            <i class="fas fa-diagnoses"></i>
            ${result.diagnosis}
        </div>
    `;
    diagnosisElement.style.animation = 'bounceIn 0.8s ease-out';
}

function displayRiskAssessment(result) {
    const riskAssessmentElement = document.getElementById('risk-assessment');
    riskAssessmentElement.innerHTML = `
        <div class="risk-item ${result.insomniaRisk.toLowerCase()}" style="animation-delay: 0.1s">
            <div class="risk-label">
                <i class="fas fa-bed"></i>
                <span>Insomnia Risk</span>
            </div>
            <span class="risk-value ${result.insomniaRisk.toLowerCase()}">${result.insomniaRisk}</span>
        </div>
        <div class="risk-item ${result.apneaRisk.toLowerCase()}" style="animation-delay: 0.2s">
            <div class="risk-label">
                <i class="fas fa-lungs"></i>
                <span>Sleep Apnea Risk</span>
            </div>
            <span class="risk-value ${result.apneaRisk.toLowerCase()}">${result.apneaRisk}</span>
        </div>
    `;
}

function displayLifestyleIssues(result) {
    const lifestyleIssuesElement = document.getElementById('lifestyle-issues');
    const issues = result.lifestyleIssues;
    lifestyleIssuesElement.innerHTML = `
        <div class="factor-item ${issues.sleep ? 'positive' : 'negative'}" style="animation-delay: 0.1s">
            <div class="risk-label">
                <i class="fas fa-moon"></i>
                <span>Sleep Duration Issue</span>
            </div>
            <span class="factor-status ${issues.sleep ? 'positive' : 'negative'}">
                ${issues.sleep ? 'Present' : 'Absent'}
            </span>
        </div>
        <div class="factor-item ${issues.stress ? 'positive' : 'negative'}" style="animation-delay: 0.2s">
            <div class="risk-label">
                <i class="fas fa-brain"></i>
                <span>Stress Issue</span>
            </div>
            <span class="factor-status ${issues.stress ? 'positive' : 'negative'}">
                ${issues.stress ? 'Present' : 'Absent'}
            </span>
        </div>
        <div class="factor-item ${issues.activity ? 'positive' : 'negative'}" style="animation-delay: 0.3s">
            <div class="risk-label">
                <i class="fas fa-running"></i>
                <span>Activity Level Issue</span>
            </div>
            <span class="factor-status ${issues.activity ? 'positive' : 'negative'}">
                ${issues.activity ? 'Present' : 'Absent'}
            </span>
        </div>
        <div class="factor-item ${issues.weight ? 'positive' : 'negative'}" style="animation-delay: 0.4s">
            <div class="risk-label">
                <i class="fas fa-weight-scale"></i>
                <span>Weight Issue</span>
            </div>
            <span class="factor-status ${issues.weight ? 'positive' : 'negative'}">
                ${issues.weight ? 'Present' : 'Absent'}
            </span>
        </div>
    `;
}

function displayRecommendations(result) {
    const recommendationsElement = document.getElementById('recommendations');
    if (result.recommendations && result.recommendations.length > 0) {
        recommendationsElement.innerHTML = result.recommendations.map((rec, index) => `
            <div class="recommendation-item" style="animation-delay: ${index * 0.1}s">
                <i class="fas fa-check-circle"></i>
                <div class="recommendation-content">
                    <h4>${rec.id}</h4>
                    <p>${rec.text}</p>
                </div>
            </div>
        `).join('');
    } else {
        recommendationsElement.innerHTML = `
            <div class="recommendation-item">
                <i class="fas fa-info-circle"></i>
                <div class="recommendation-content">
                    <h4>No Specific Recommendations</h4>
                    <p>Current lifestyle factors appear to be within healthy ranges.</p>
                </div>
            </div>
        `;
    }
}

function displayFiredRules(result) {
    const firedRulesElement = document.getElementById('fired-rules');
    if (result.firedRules && result.firedRules.length > 0) {
        firedRulesElement.innerHTML = result.firedRules.map((rule, index) => `
            <div class="rule-badge" style="animation-delay: ${index * 0.05}s">
                <i class="fas fa-link"></i>
                ${rule}
            </div>
        `).join('');
    } else {
        firedRulesElement.innerHTML = `
            <div class="rule-badge">
                <i class="fas fa-info-circle"></i>
                No rules triggered
            </div>
        `;
    }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${getNotificationColor(type)};
        color: white;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.5s ease-out reverse';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        info: 'var(--info)'
    };
    return colors[type] || 'var(--info)';
}

// Perform analysis (mock function - replace with actual API call)
async function performAnalysis(formData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response - replace with actual API call
    return {
        diagnosis: "Mixed Sleep Disorder (Insomnia + Sleep Apnea)",
        insomniaRisk: "high",
        apneaRisk: "moderate",
        lifestyleIssues: {
            sleep: true,
            stress: true,
            activity: true,
            weight: true
        },
        recommendations: [
            { id: "REC_SLEEP_HYGIENE", text: "Improve sleep hygiene" },
            { id: "REC_STRESS_MANAGEMENT", text: "Practice stress reduction / stress management" },
            { id: "REC_WEIGHT_MANAGEMENT", text: "Weight management program" }
        ],
        firedRules: ["R1", "R5", "R9", "R10", "R11", "R12", "R13", "R14", "R15", "R17", "R19", "R20"]
    };
}

// ... (rest of the rule testing functions remain similar but with enhanced animations)

// Enhanced rule testing with better animations
async function testRule(ruleId) {
    const ruleInfo = RULE_TEST_DATA[ruleId];
    const button = event.target;
    const originalText = button.innerHTML;
    
    try {
        button.innerHTML = '<i class="fas fa-spinner loading-spinner"></i> Testing...';
        button.disabled = true;

        // Add loading animation to card
        const ruleCard = button.closest('.rule-test-card');
        ruleCard.style.animation = 'pulse 1s infinite';

        const result = await performAnalysis(ruleInfo.data);
        
        // Remove loading animation
        ruleCard.style.animation = '';
        
        showRuleTestResult(ruleCard, ruleId, ruleInfo, result);
        
    } catch (error) {
        console.error('Error testing rule:', error);
        showNotification('Error testing rule. Please try again.', 'error');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function showRuleTestResult(ruleCard, ruleId, ruleInfo, result) {
    const ruleFired = result.firedRules.includes(ruleId);
    const statusClass = ruleFired ? 'success' : 'failed';
    
    const notification = document.createElement('div');
    notification.className = `test-result-item ${statusClass}`;
    notification.innerHTML = `
        <div class="test-result-status ${statusClass}">
            <i class="fas ${ruleFired ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            ${ruleFired ? 'SUCCESS' : 'FAILED'}
        </div>
        <div>
            <strong>${ruleId}:</strong> ${ruleInfo.name}<br>
            <small>Diagnosis: ${result.diagnosis}</small><br>
            <small>Rules Fired: ${result.firedRules.join(', ')}</small>
        </div>
    `;
    
    // Add animation
    notification.style.animation = 'fadeInUp 0.6s ease-out';
    
    ruleCard.appendChild(notification);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeInUp 0.6s ease-out reverse';
        setTimeout(() => notification.remove(), 600);
    }, 5000);
}

// Rule Test Data (complete set)
const RULE_TEST_DATA = {
    "R1": {
        "name": "Insomnia High Risk - Short sleep + Poor quality",
        "data": {
            "Age": 35,
            "Gender": "Female",
            "Sleep Duration": 4.0,
            "Quality of Sleep": 2,
            "Stress Level": 5,
            "Physical Activity Level": 30,
            "BMI Category": "Normal",
            "Blood Pressure": "120/80",
            "Heart Rate": 70,
            "Daily Steps": 5000
        }
    },
    "R2": {
        "name": "Insomnia Moderate Risk - Medium sleep + High stress",
        "data": {
            "Age": 40,
            "Gender": "Male",
            "Sleep Duration": 6.0,
            "Quality of Sleep": 6,
            "Stress Level": 8,
            "Physical Activity Level": 45,
            "BMI Category": "Normal",
            "Blood Pressure": "125/85",
            "Heart Rate": 75,
            "Daily Steps": 6000
        }
    },
    // ... include all other 18 rules
    "R20": {
        "name": "Recommendation - Weight + Apnea Eval",
        "data": {
            "Age": 55,
            "Gender": "Male",
            "Sleep Duration": 6.0,
            "Quality of Sleep": 3,
            "Stress Level": 6,
            "Physical Activity Level": 12,
            "BMI Category": "Obese",
            "Blood Pressure": "160/100",
            "Heart Rate": 95,
            "Daily Steps": 2200
        }
    }
};