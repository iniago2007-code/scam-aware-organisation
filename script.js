// ScamAware Website JavaScript

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeScamFilters();
    initializeNavigation();
});

// Contact Form Handling
function initializeContactForm() {
    const contactForm = document.querySelector('form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                subject: document.getElementById('subject')?.value || '',
                message: document.getElementById('message')?.value || ''
            };
            
            // Validate form
            if (!validateForm(formData)) {
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Save to localStorage
            saveScamReport(formData);
            
            // Show success message
            showNotification('Your report has been submitted successfully! Thank you for helping keep our community safe.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Log the submission
            console.log('Scam Report Submitted:', formData);
        });
    }
}

// Form Validation
function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!data.name.trim()) {
        return false;
    }
    if (!emailRegex.test(data.email)) {
        return false;
    }
    if (!data.subject) {
        return false;
    }
    if (!data.message.trim() || data.message.trim().length < 10) {
        return false;
    }
    
    return true;
}

// Save Scam Report to LocalStorage
function saveScamReport(data) {
    const reports = JSON.parse(localStorage.getItem('scamReports')) || [];
    
    const report = {
        id: Date.now(),
        ...data,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    reports.push(report);
    localStorage.setItem('scamReports', JSON.stringify(reports));
}

// Retrieve Scam Reports
function getScamReports() {
    return JSON.parse(localStorage.getItem('scamReports')) || [];
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-in-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Scam Filters (for services page)
function initializeScamFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const scamCards = document.querySelectorAll('.scam-card');
    
    if (filterButtons.length === 0) return; // No filters on this page
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            scamCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease-in-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Navigation Active State
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPage = window.location.pathname;
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPage.includes(href) || (currentPage.endsWith('/') && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Risk Assessment Tool
function assessScamRisk(email, message) {
    let riskScore = 0;
    const riskFactors = [];
    
    // Check for common phishing indicators
    const urgencyWords = ['urgent', 'immediately', 'act now', 'confirm', 'verify', 'update'];
    const suspiciousPatterns = [
        /click here/gi,
        /verify account/gi,
        /confirm identity/gi,
        /payment required/gi,
        /limited time/gi
    ];
    
    const messageText = message.toLowerCase();
    
    // Check for urgency
    urgencyWords.forEach(word => {
        if (messageText.includes(word)) {
            riskScore += 10;
            riskFactors.push(`Contains urgency word: "${word}"`);
        }
    });
    
    // Check for suspicious patterns
    suspiciousPatterns.forEach(pattern => {
        if (pattern.test(messageText)) {
            riskScore += 15;
            riskFactors.push(`Suspicious pattern detected`);
        }
    });
    
    // Check email format
    if (!isValidEmail(email)) {
        riskScore += 20;
        riskFactors.push('Invalid email format');
    }
    
    return {
        score: Math.min(riskScore, 100),
        factors: riskFactors,
        isLikelySuspicious: riskScore > 30
    };
}

// Email Validation Helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Export reports as CSV
function exportReportsAsCSV() {
    const reports = getScamReports();
    
    if (reports.length === 0) {
        showNotification('No reports to export', 'info');
        return;
    }
    
    // Create CSV header
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Date', 'Status'];
    let csvContent = headers.join(',') + '\n';
    
    // Add report data
    reports.forEach(report => {
        const row = [
            report.id,
            `"${report.name}"`,
            report.email,
            report.phone || 'N/A',
            `"${report.subject}"`,
            `"${report.message.substring(0, 50)}..."`,
            new Date(report.timestamp).toLocaleDateString(),
            report.status
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scam-reports-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('Reports exported successfully!', 'success');
}

// Add animation styles to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    .notification {
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Debug: Log available functions
console.log('ScamAware JavaScript loaded successfully');
console.log('Available functions:');
console.log('- assessScamRisk(email, message)');
console.log('- getScamReports()');
console.log('- exportReportsAsCSV()');
console.log('- showNotification(message, type)');
