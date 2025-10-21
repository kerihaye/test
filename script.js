// Home Page Scripts - Backend Integration Ready

// Home API Configuration and Data Management
class HomeAPI {
  constructor() {
    this.config = this.loadAPIConfig();
    this.homeData = null;
    this.currentLanguage = 'vi';
  }

  loadAPIConfig() {
    const configElement = document.getElementById('api-config');
    return configElement ? JSON.parse(configElement.textContent) : {
      baseUrl: '/api',
      endpoints: {
        search: '/search',
        'advanced-search': '/search/advanced',
        'image-search': '/search/image',
        articles: '/articles',
        faq: '/faq',
        language: '/language',
        banner: '/banner'
      }
    };
  }

  async performSearch(query) {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.search}?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error performing search:', error);
      // Redirect to search results page
      if (query.toLowerCase() === 'honda') {
        window.location.href = 'honda-search.html';
      } else {
        this.showNotification('Không tìm thấy kết quả cho từ khóa: ' + query, 'error');
      }
      return null;
    }
  }

  async performImageSearch(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints['image-search']}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error performing image search:', error);
      this.showNotification('Lỗi tìm kiếm hình ảnh. Vui lòng thử lại.', 'error');
      return null;
    }
  }

  async loadHomeData() {
    try {
      const response = await fetch(`${this.config.baseUrl}/home`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      this.homeData = await response.json();
      return this.homeData;
    } catch (error) {
      console.error('Error loading home data:', error);
      // Fallback to template data
      return this.loadTemplateData();
    }
  }

  loadTemplateData() {
    const templateElement = document.getElementById('home-data-template');
    if (templateElement) {
      this.homeData = JSON.parse(templateElement.textContent);
      return this.homeData;
    }
    return null;
  }

  async changeLanguage(lang) {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.language}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: lang })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      this.currentLanguage = lang;
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  }

  async hideBanner() {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.banner}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      return true;
    } catch (error) {
      console.error('Error hiding banner:', error);
      return false;
    }
  }
}

// Home Data Binding
class HomeDataBinder {
  constructor(api) {
    this.api = api;
  }

  bindHomeData(data) {
    if (!data) return;

    // Bind all elements with data-bind attributes
    document.querySelectorAll('[data-bind]').forEach(element => {
      const binding = element.getAttribute('data-bind');
      const value = this.getNestedValue(data, binding);
      if (value !== undefined) {
        this.updateElement(element, value);
      }
    });

    // Bind dynamic lists
    this.bindInfoLinks(data.infoLinks);
    this.bindFaqLinks(data.faqLinks);
    this.bindFooterLinks(data.footerLinks);
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

  bindInfoLinks(links) {
    const container = document.querySelector('[data-bind="info-links"]');
    if (!container || !links) return;

    container.innerHTML = links.map(link => 
      `<li><a href="#" data-action="view-article" data-article="${link.article}">${link.title}</a></li>`
    ).join('');
  }

  bindFaqLinks(links) {
    const container = document.querySelector('[data-bind="faq-links"]');
    if (!container || !links) return;

    container.innerHTML = links.map(link => 
      `<li><a href="#" data-action="view-faq" data-faq="${link.faq}">${link.title}</a></li>`
    ).join('');
  }

  bindFooterLinks(links) {
    const container = document.querySelector('[data-bind="footer-links"]');
    if (!container || !links) return;

    container.innerHTML = links.map(link => 
      `<a href="#" data-action="${link.action}">${link.title}</a>`
    ).join(' | ');
  }
}

// Initialize API and Data Binder
const homeAPI = new HomeAPI();
const homeDataBinder = new HomeDataBinder(homeAPI);

function openImageInNewTab(imageUrl) {
  window.open(imageUrl, '_blank');
}

// Home Action Handler
class HomeActionHandler {
  constructor(api, dataBinder) {
    this.api = api;
    this.dataBinder = dataBinder;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-box input');
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSearch(searchInput.value.trim());
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSearch(e.target.value.trim());
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
      case 'search':
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
          this.handleSearch(searchInput.value.trim());
        }
        break;
      case 'advanced-search':
        this.toggleAdvancedSearch();
        break;
      case 'upload-image':
        this.triggerImageUpload();
        break;
      case 'close-banner':
        await this.closeBanner();
        break;
      case 'change-language':
        const lang = element.getAttribute('data-lang');
        if (lang) {
          await this.changeLanguage(lang);
        }
        break;
      case 'view-guide':
      case 'view-article':
      case 'view-faq':
      case 'view-pricing':
      case 'view-partnership':
      case 'view-announcements':
      case 'view-disclaimer':
      case 'saved-trademarks':
      case 'tracked-trademarks':
      case 'pricing':
      case 'login':
        this.showLoginPopup();
        break;
    }
  }

  async handleSearch(query) {
    if (!query) {
      this.showNotification('Vui lòng nhập từ khóa tìm kiếm', 'error');
      return;
    }
    
    try {
      const data = await this.api.performSearch(query);
      if (data) {
        // Redirect to search results page
        window.location.href = 'honda-search.html';
      }
    } catch (error) {
      console.error('Search error:', error);
      this.showNotification('Lỗi tìm kiếm. Vui lòng thử lại.', 'error');
    }
  }

  async handleImageSearch(imageFile) {
    try {
      const data = await this.api.performImageSearch(imageFile);
      if (data) {
        // Redirect to search results page
        window.location.href = 'honda-search.html';
      }
    } catch (error) {
      console.error('Image search error:', error);
      this.showNotification('Lỗi tìm kiếm hình ảnh. Vui lòng thử lại.', 'error');
    }
  }

  toggleAdvancedSearch() {
    const advToggle = document.getElementById('advToggle');
    const advancedPanel = document.getElementById('advancedPanel');
    if (advToggle && advancedPanel) {
      const open = document.body.classList.toggle('advanced-open');
      advancedPanel.setAttribute('aria-hidden', !open);
      advToggle.textContent = open ? 'Đóng tìm kiếm nâng cao' : 'Tìm kiếm nâng cao';
      // scroll to the advanced panel when opening
      if (open) advancedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  triggerImageUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  async closeBanner() {
    try {
      const success = await this.api.hideBanner();
      if (success) {
        const topBanner = document.querySelector('.top-banner');
        if (topBanner) {
          topBanner.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error closing banner:', error);
      // Still hide the banner locally
      const topBanner = document.querySelector('.top-banner');
      if (topBanner) {
        topBanner.style.display = 'none';
      }
    }
  }

  async changeLanguage(lang) {
    try {
      const success = await this.api.changeLanguage(lang);
      if (success) {
        this.showNotification(`Đã chuyển sang ngôn ngữ ${lang}`, 'success');
        // Update UI elements
        const langElement = document.querySelector('[data-bind="current-language"]');
        if (langElement) {
          langElement.textContent = `${lang} ▼`;
        }
      }
    } catch (error) {
      console.error('Error changing language:', error);
      this.showNotification('Lỗi chuyển đổi ngôn ngữ', 'error');
    }
  }

  showLoginPopup() {
    let modal = document.getElementById('loginModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'loginModal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.25)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';
      modal.innerHTML = '<div style="background:#fff;padding:32px 28px;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.12);text-align:center;max-width:320px;">' +
        '<h2 style="margin-bottom:18px;font-size:20px;">Đăng nhập để sử dụng tính năng này</h2>' +
        '<button id="closeLoginModal" style="margin-top:12px;padding:8px 18px;border-radius:6px;border:none;background:#1a73e8;color:#fff;font-size:16px;cursor:pointer;">Đóng</button>' +
        '</div>';
      document.body.appendChild(modal);
      document.getElementById('closeLoginModal').onclick = function() {
        modal.remove();
      };
    }
  }

  showNotification(message, type = 'info') {
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
const homeActionHandler = new HomeActionHandler(homeAPI, homeDataBinder);

// Legacy functions for backward compatibility
function showLoginPopup() {
  homeActionHandler.showLoginPopup();
}

function hideLoginPopup() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.remove();
  }
}

function goToLogin() {
  window.location.href = '/login';
}

// Image Upload Handler
function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    homeActionHandler.showNotification('Vui lòng chọn đúng định dạng hình ảnh!', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    homeActionHandler.showNotification('Kích thước ảnh vượt quá 5MB!', 'error');
    return;
  }
  
  const dropZone = document.getElementById('dropZone');
  dropZone.innerHTML = `<p>📷 Hình đã chọn: <b>${file.name}</b></p>`;
  dropZone.style.borderColor = '#00cc66';
  dropZone.style.background = '#e9fff1';
  
  // Process the image
  homeActionHandler.handleImageSearch(file);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  // Load home data
  try {
    const data = await homeAPI.loadHomeData();
    if (data) {
      homeDataBinder.bindHomeData(data);
    }
  } catch (error) {
    console.error('Error loading home data:', error);
  }
  
  // Upload hình ảnh
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#0078ff';
      dropZone.style.background = '#f0f8ff';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '#aaa';
      dropZone.style.background = '#fafafa';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      handleFile(file);
    });
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
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
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HomeAPI,
    HomeDataBinder,
    HomeActionHandler,
    homeAPI,
    homeDataBinder,
    homeActionHandler
  };
}
