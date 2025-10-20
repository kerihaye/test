// Honda Trademark Detail Page Scripts

function openImageInNewTab(imageUrl) {
  window.open(imageUrl, '_blank');
}

// Login Popup Functions
function showLoginPopup() {
  document.getElementById('loginPopup').style.display = 'flex';
}

function hideLoginPopup() {
  document.getElementById('loginPopup').style.display = 'none';
}

function goToLogin() {
  // Redirect to login page or show login form
  alert('Chuyển đến trang đăng nhập...');
  hideLoginPopup();
}

// Advanced Search Functions (placeholder for header functionality)
function toggleAdvancedSearch() {
  alert('Tính năng tìm kiếm nâng cao sẽ được triển khai...');
}

// Copy to Clipboard Function
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    // Show success feedback
    const copyBtn = event.target.closest('.copy-btn');
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"></polyline></svg>';
    copyBtn.style.color = '#28a745';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.style.color = '#666';
    }, 2000);
  }).catch(function(err) {
    console.error('Could not copy text: ', err);
    alert('Không thể sao chép. Vui lòng thử lại.');
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Add smooth scrolling for better UX
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Add click handlers for floating buttons
  const zaloBtn = document.querySelector('.zalo-btn');
  if (zaloBtn) {
    zaloBtn.addEventListener('click', function() {
      alert('Mở ứng dụng Zalo hỗ trợ...');
    });
  }
  
  const feedbackBtn = document.querySelector('.feedback-btn');
  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', function() {
      alert('Mở form góp ý...');
    });
  }
  
  // Add hover effects for interactive elements
  const interactiveElements = document.querySelectorAll('.company-link, .zalo-link, .premium-notice a');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-1px)';
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Add loading animation for images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('load', function() {
      this.style.opacity = '1';
    });
    
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
  });
});

// Utility function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

// Function to handle premium feature clicks
function handlePremiumFeature(featureName) {
  showLoginPopup();
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Escape key to close popup
  if (e.key === 'Escape') {
    hideLoginPopup();
  }
  
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('.hs-input');
    if (searchInput) {
      searchInput.focus();
    }
  }
});
