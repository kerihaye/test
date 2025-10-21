// Honda Trademark Detail Page Scripts - Backend Integration Ready

// API Configuration and Data Management
class TrademarkAPI {
  constructor() {
    this.config = this.loadAPIConfig();
    this.data = null;
    this.trademarkId = null;
  }

  loadAPIConfig() {
    const configElement = document.getElementById('api-config');
    return configElement ? JSON.parse(configElement.textContent) : {
      baseUrl: '/api',
      endpoints: {
        trademark: '/trademark',
        search: '/search',
        bookmark: '/bookmark',
        track: '/track',
        export: '/export',
        contact: '/contact'
      }
    };
  }

  async fetchTrademarkData(trademarkId) {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.trademark}/${trademarkId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.data = await response.json();
      this.trademarkId = trademarkId;
      return this.data;
    } catch (error) {
      console.error('Error fetching trademark data:', error);
      // Fallback to template data
      return this.loadTemplateData();
    }
  }

  loadTemplateData() {
    const templateElement = document.getElementById('trademark-data-template');
    if (templateElement) {
      this.data = JSON.parse(templateElement.textContent);
      this.trademarkId = this.data.trademarkId;
      return this.data;
    }
    return null;
  }

  async performAction(action, data = {}) {
    const endpoint = this.config.endpoints[action];
    if (!endpoint) {
      console.error(`Unknown action: ${action}`);
      return null;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trademarkId: this.trademarkId,
          ...data
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      return null;
    }
  }
}

// Data Binding System
class DataBinder {
  constructor(api) {
    this.api = api;
    this.bindings = new Map();
  }

  bindData(data) {
    if (!data) return;

    // Bind all elements with data-bind attributes
    document.querySelectorAll('[data-bind]').forEach(element => {
      const binding = element.getAttribute('data-bind');
      const value = this.getNestedValue(data, binding);
      if (value !== undefined) {
        this.updateElement(element, value);
      }
    });

    // Bind product groups
    this.bindProductGroups(data.productGroups);
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  updateElement(element, value) {
    if (element.tagName === 'IMG' && element.hasAttribute('data-bind')) {
      element.src = value;
    } else if (element.tagName === 'A' && element.hasAttribute('href')) {
      element.textContent = value;
    } else {
      element.textContent = value;
    }
  }

  bindProductGroups(groups) {
    const groupsContainer = document.querySelector('[data-bind="product-groups"]');
    if (!groupsContainer || !groups) return;

    groupsContainer.innerHTML = groups.map(group => 
      `<a href="#" data-group="${group}">${group}</a>`
    ).join(', ');
  }
}

// Initialize API and Data Binder
const trademarkAPI = new TrademarkAPI();
const dataBinder = new DataBinder(trademarkAPI);

function openImageInNewTab(imageUrl) {
  window.open(imageUrl, '_blank');
}

// Event Handlers and Action Management
class ActionHandler {
  constructor(api) {
    this.api = api;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch(e.target.value);
        }
      });
    }

    // Action buttons
    document.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.getAttribute('data-action');
      if (action) {
        this.handleAction(action, e.target.closest('[data-action]'));
      }
    });
  }

  async handleAction(action, element) {
    switch (action) {
      case 'export-pdf':
        await this.exportToPDF();
        break;
      case 'print':
        this.printTrademark();
        break;
      case 'bookmark':
        await this.bookmarkTrademark();
        break;
      case 'copy':
        this.copyToClipboard(element.getAttribute('data-copy-value'));
        break;
      case 'view-image':
        this.openImageInNewTab(element.getAttribute('data-image-url'));
        break;
      case 'premium-upgrade':
        this.showLoginPopup();
        break;
      case 'contact-support':
      case 'contact-zalo':
        await this.contactSupport();
        break;
      case 'track-trademark':
        await this.trackTrademark();
        break;
      case 'feedback':
        this.showFeedbackForm();
        break;
      case 'advanced-search':
        this.toggleAdvancedSearch();
        break;
      case 'saved-trademarks':
      case 'tracked-trademarks':
      case 'pricing':
      case 'login':
        this.showLoginPopup();
        break;
    }
  }

  async handleSearch(query) {
    if (!query.trim()) return;
    
    try {
      const response = await fetch(`${this.api.config.baseUrl}${this.api.config.endpoints.search}?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      // Handle search results
      console.log('Search results:', results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  async exportToPDF() {
    const result = await this.api.performAction('export', { format: 'pdf' });
    if (result && result.url) {
      window.open(result.url, '_blank');
    }
  }

  printTrademark() {
    window.print();
  }

  async bookmarkTrademark() {
    const result = await this.api.performAction('bookmark');
    if (result) {
      this.showNotification('Đã thêm vào danh sách đánh dấu!', 'success');
    }
  }

  async trackTrademark() {
    const result = await this.api.performAction('track');
    if (result) {
      this.showNotification('Đã bắt đầu theo dõi nhãn hiệu!', 'success');
    }
  }

  async contactSupport() {
    const result = await this.api.performAction('contact', { 
      type: 'support',
      trademarkId: this.api.trademarkId 
    });
    if (result) {
      this.showNotification('Đã gửi yêu cầu hỗ trợ!', 'success');
    }
  }

  showFeedbackForm() {
    const feedback = prompt('Vui lòng nhập góp ý của bạn:');
    if (feedback) {
      this.api.performAction('contact', { 
        type: 'feedback',
        message: feedback,
        trademarkId: this.api.trademarkId 
      });
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Đã sao chép!', 'success');
    }).catch(() => {
      this.showNotification('Không thể sao chép', 'error');
    });
  }

  openImageInNewTab(imageUrl) {
    window.open(imageUrl, '_blank');
  }

  showLoginPopup() {
    document.getElementById('loginPopup').style.display = 'flex';
  }

  hideLoginPopup() {
    document.getElementById('loginPopup').style.display = 'none';
  }

  goToLogin() {
    window.location.href = '/login';
  }

  toggleAdvancedSearch() {
    alert('Tính năng tìm kiếm nâng cao sẽ được triển khai...');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize Action Handler
const actionHandler = new ActionHandler(trademarkAPI);

// Legacy functions for backward compatibility
function showLoginPopup() {
  actionHandler.showLoginPopup();
}

function hideLoginPopup() {
  actionHandler.hideLoginPopup();
}

function goToLogin() {
  actionHandler.goToLogin();
}

function toggleAdvancedSearch() {
  actionHandler.toggleAdvancedSearch();
}

function copyToClipboard(text) {
  actionHandler.copyToClipboard(text);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  // Add smooth scrolling for better UX
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Load trademark data
  const trademarkElement = document.querySelector('[data-trademark-id]');
  const trademarkId = trademarkElement?.getAttribute('data-trademark-id');
  
  if (trademarkId) {
    try {
      const data = await trademarkAPI.fetchTrademarkData(trademarkId);
      if (data) {
        dataBinder.bindData(data);
      }
    } catch (error) {
      console.error('Error loading trademark data:', error);
    }
  }
  
  // Add CSS for notifications
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .notification {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
  
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

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TrademarkAPI,
    DataBinder,
    ActionHandler,
    trademarkAPI,
    dataBinder,
    actionHandler
  };
}
