// Honda Search Page Scripts - Backend Integration Ready

// Search API Configuration and Data Management
class SearchAPI {
  constructor() {
    this.config = this.loadAPIConfig();
    this.searchData = null;
    this.currentQuery = '';
    this.currentFilters = {};
  }

  loadAPIConfig() {
    const configElement = document.getElementById('api-config');
    return configElement ? JSON.parse(configElement.textContent) : {
      baseUrl: '/api',
      endpoints: {
        search: '/search',
        'advanced-search': '/search/advanced',
        'image-search': '/search/image',
        export: '/export',
        bookmark: '/bookmark',
        track: '/track'
      }
    };
  }

  async performSearch(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });
      
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.search}?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      this.searchData = await response.json();
      this.currentQuery = query;
      this.currentFilters = filters;
      return this.searchData;
    } catch (error) {
      console.error('Error performing search:', error);
      // Fallback to template data
      return this.loadTemplateData();
    }
  }

  async performAdvancedSearch(searchForm) {
    try {
      const formData = new FormData(searchForm);
      const filters = {};
      
      // Convert form data to filters object
      for (let [key, value] of formData.entries()) {
        if (value) filters[key] = value;
      }
      
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints['advanced-search']}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      this.searchData = await response.json();
      return this.searchData;
    } catch (error) {
      console.error('Error performing advanced search:', error);
      return this.loadTemplateData();
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
      
      this.searchData = await response.json();
      return this.searchData;
    } catch (error) {
      console.error('Error performing image search:', error);
      return this.loadTemplateData();
    }
  }

  loadTemplateData() {
    const templateElement = document.getElementById('search-results-template');
    if (templateElement) {
      this.searchData = JSON.parse(templateElement.textContent);
      return this.searchData;
    }
    return null;
  }

  async exportResults(format = 'excel') {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.export}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: this.currentQuery,
          filters: this.currentFilters,
          format: format
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-results.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting results:', error);
      return false;
    }
  }
}

// Search Results Data Binding
class SearchDataBinder {
  constructor(api) {
    this.api = api;
  }

  bindSearchResults(data) {
    if (!data || !data.results) return;

    // Update search summary
    this.updateElement('[data-bind="results-count"]', `Tìm thấy ${data.totalResults} kết quả`);
    this.updateElement('[data-bind="filter-count"]', `(${data.filterCount} điều kiện lọc)`);
    this.updateElement('[data-bind="export-count"]', `(${data.exportCount} nhãn hiệu)`);
    this.updateElement('[data-bind="search-query"]', data.query);

    // Bind table results
    this.bindTableResults(data.results);
  }

  bindTableResults(results) {
    const tbody = document.querySelector('[data-bind="search-results"]');
    if (!tbody) return;

    // Clear existing rows
    tbody.innerHTML = '';

    // Add new rows
    results.forEach((result, index) => {
      const row = this.createTableRow(result, index + 1);
      tbody.appendChild(row);
    });
  }

  createTableRow(result, index) {
    const row = document.createElement('tr');
    row.setAttribute('data-trademark-id', result.trademarkId);
    row.setAttribute('data-row', index);

    row.innerHTML = `
      <td class="hs-td" data-bind="row-index">${index}</td>
      <td class="hs-td">
        <div class="hs-trademark-cell-content">
          <img src="${result.imageUrl}" alt="${result.trademarkName} Trademark" class="hs-logo-img" 
               data-bind="trademark-image" data-image-url="${result.imageUrl}">
          <button class="hs-view-btn" data-action="view-image" 
                  data-image-url="${result.imageUrl}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a0dad" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
      </td>
      <td class="hs-td" data-bind="trademark-name">${result.trademarkName}</td>
      <td class="hs-td" data-bind="product-groups">${result.productGroups}</td>
      <td class="hs-td">
        <span class="hs-status ${this.getStatusClass(result.status)}" data-bind="status-text">${result.status}</span>
        ${result.statusDetails ? `<br><span class="hs-note" data-bind="status-details">${result.statusDetails}</span>` : ''}
      </td>
      <td class="hs-td" data-bind="filing-date">${result.filingDate}</td>
      <td class="hs-td">
        <a href="honda.html" class="hs-link" data-bind="application-number">${result.applicationNumber}</a>
        ${result.applicationType ? `<br><span class="hs-note" data-bind="application-type">${result.applicationType}</span>` : ''}
      </td>
      <td class="hs-td" data-bind="applicant-name">${result.applicantName}</td>
      <td class="hs-td" data-bind="representative-name">${result.representativeName}</td>
    `;

    return row;
  }

  getStatusClass(status) {
    switch (status.toLowerCase()) {
      case 'cấp bằng':
        return 'hs-status-active';
      case 'hết hạn':
        return 'hs-status-expired';
      case 'đang giải quyết':
        return 'hs-status-processing';
      case 'rút đơn':
        return 'hs-status-withdrawn';
      case 'từ chối':
        return 'hs-status-rejected';
      default:
        return 'hs-status-default';
    }
  }

  updateElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }
}

// Initialize API and Data Binder
const searchAPI = new SearchAPI();
const searchDataBinder = new SearchDataBinder(searchAPI);

function openImageInNewTab(imageUrl) {
  window.open(imageUrl, '_blank');
}

// Search Action Handler
class SearchActionHandler {
  constructor(api, dataBinder) {
    this.api = api;
    this.dataBinder = dataBinder;
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

    // Table sorting
    document.addEventListener('click', (e) => {
      const sortField = e.target.closest('[data-sort]')?.getAttribute('data-sort');
      if (sortField) {
        this.handleSort(sortField);
      }
    });
  }

  async handleAction(action, element) {
    switch (action) {
      case 'advanced-search':
        this.toggleAdvancedSearch();
        break;
      case 'save-trademarks':
        await this.saveTrademarks();
        break;
      case 'export-excel':
        await this.exportExcel();
        break;
      case 'view-image':
        this.openImageInNewTab(element.getAttribute('data-image-url'));
        break;
      case 'upload-image':
        this.triggerImageUpload();
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
      const data = await this.api.performSearch(query);
      if (data) {
        this.dataBinder.bindSearchResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
      this.showNotification('Lỗi tìm kiếm. Vui lòng thử lại.', 'error');
    }
  }

  async handleAdvancedSearch() {
    const form = document.getElementById('advancedSearchForm');
    if (!form) return;

    try {
      const data = await this.api.performAdvancedSearch(form);
      if (data) {
        this.dataBinder.bindSearchResults(data);
        this.toggleAdvancedSearch(); // Close the form
      }
    } catch (error) {
      console.error('Advanced search error:', error);
      this.showNotification('Lỗi tìm kiếm nâng cao. Vui lòng thử lại.', 'error');
    }
  }

  async handleImageSearch(imageFile) {
    try {
      const data = await this.api.performImageSearch(imageFile);
      if (data) {
        this.dataBinder.bindSearchResults(data);
      }
    } catch (error) {
      console.error('Image search error:', error);
      this.showNotification('Lỗi tìm kiếm hình ảnh. Vui lòng thử lại.', 'error');
    }
  }

  async saveTrademarks() {
    this.showLoginPopup();
  }

  async exportExcel() {
    try {
      const success = await this.api.exportResults('excel');
      if (success) {
        this.showNotification('Đã xuất file Excel thành công!', 'success');
      } else {
        this.showNotification('Lỗi xuất file. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      this.showNotification('Lỗi xuất file. Vui lòng thử lại.', 'error');
    }
  }

  handleSort(field) {
    // Implement sorting logic
    console.log('Sorting by:', field);
    this.showNotification(`Đang sắp xếp theo ${field}...`, 'info');
  }

  toggleAdvancedSearch() {
  const form = document.getElementById('advancedSearchForm');
  const caret = document.querySelector('.hs-caret');
  
  if (form.style.display === 'none' || form.style.display === '') {
    form.style.display = 'block';
    caret.textContent = '▲';
  } else {
    form.style.display = 'none';
    caret.textContent = '▼';
  }
}

  triggerImageUpload() {
    const fileInput = document.getElementById('hsFileInput');
    if (fileInput) {
      fileInput.click();
    }
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
const searchActionHandler = new SearchActionHandler(searchAPI, searchDataBinder);

// Legacy functions for backward compatibility
function showLoginPopup() {
  searchActionHandler.showLoginPopup();
}

function hideLoginPopup() {
  searchActionHandler.hideLoginPopup();
}

function goToLogin() {
  searchActionHandler.goToLogin();
}

function toggleAdvancedSearch() {
  searchActionHandler.toggleAdvancedSearch();
}

// Image Upload Handler
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      searchActionHandler.showNotification('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.', 'error');
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      searchActionHandler.showNotification('Chỉ hỗ trợ file JPG, PNG, GIF.', 'error');
      return;
    }
    
    // Process the image
    console.log('Image uploaded:', file.name);
    searchActionHandler.handleImageSearch(file);
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  // Load initial search results
  try {
    const data = await searchAPI.loadTemplateData();
    if (data) {
      searchDataBinder.bindSearchResults(data);
    }
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
  
  // Add event listener for image upload
  const imageUpload = document.getElementById('hsFileInput');
  if (imageUpload) {
    imageUpload.addEventListener('change', handleImageUpload);
  }
  
  // Add click functionality to upload box
  const uploadBox = document.getElementById('hsDropZone');
  if (uploadBox) {
    uploadBox.addEventListener('click', function() {
      document.getElementById('hsFileInput').click();
    });
  }
  
  // Add drag and drop functionality for image upload
  const uploadArea = document.querySelector('.hs-upload-box');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      uploadArea.style.borderColor = '#1a73e8';
      uploadArea.style.backgroundColor = '#f0f8ff';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      uploadArea.style.borderColor = '#ccc';
      uploadArea.style.backgroundColor = '#f9f9f9';
    });
    
    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      uploadArea.style.borderColor = '#ccc';
      uploadArea.style.backgroundColor = '#f9f9f9';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          // Create a fake event to reuse the existing handler
          const fakeEvent = {
            target: {
              files: [file]
            }
          };
          handleImageUpload(fakeEvent);
        } else {
          searchActionHandler.showNotification('Vui lòng chỉ kéo thả file hình ảnh.', 'error');
        }
      }
    });
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
    SearchAPI,
    SearchDataBinder,
    SearchActionHandler,
    searchAPI,
    searchDataBinder,
    searchActionHandler
  };
}
