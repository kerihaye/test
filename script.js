// Honda Search Page Scripts
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

// Advanced Search Functions
function toggleAdvancedSearch() {
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

function clearAdvancedSearch() {
  // Clear all form inputs
  const form = document.getElementById('advancedSearchForm');
  const inputs = form.querySelectorAll('input[type="text"], input[type="checkbox"], select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      input.checked = false;
    } else {
      input.value = '';
    }
  });
}

// Nút đóng thanh hướng dẫn
const closeBtn = document.querySelector('.close-btn');
const topBanner = document.querySelector('.top-banner');

closeBtn.addEventListener('click', () => {
  topBanner.style.display = 'none';
});

// Upload hình ảnh
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

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

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn đúng định dạng hình ảnh!');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('Kích thước ảnh vượt quá 5MB!');
    return;
  }
  dropZone.innerHTML = `<p>📷 Hình đã chọn: <b>${file.name}</b></p>`;
  dropZone.style.borderColor = '#00cc66';
  dropZone.style.background = '#e9fff1';
}

// Toggle advanced search panel
const advToggle = document.getElementById('advToggle');
const advancedPanel = document.getElementById('advancedPanel');
if (advToggle && advancedPanel) {
  advToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const open = document.body.classList.toggle('advanced-open');
    advancedPanel.setAttribute('aria-hidden', !open);
    advToggle.textContent = open ? 'Đóng tìm kiếm nâng cao' : 'Tìm kiếm nâng cao';
    // scroll to the advanced panel when opening
    if (open) advancedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Popup login when clicking info or FAQ links
function showLoginPopup() {
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

// Attach to info and FAQ links
[...document.querySelectorAll('.info-box a, .faq-box a')].forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginPopup();
  });
});

// Attach to language change links
[...document.querySelectorAll('.lang a')].forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginPopup();
  });
});

// Attach to 'Nhãn hiệu đã lưu' and 'Nhãn hiệu theo dõi' links
[...document.querySelectorAll('.small-links a')].forEach(link => {
  if (link.textContent.includes('Nhãn hiệu đã lưu') || link.textContent.includes('Nhãn hiệu theo dõi')) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showLoginPopup();
    });
  }
});

// Search redirect logic
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-box input');
if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();
    if (keyword === 'honda') {
      window.location.href = 'honda-search.html';
    } else {
      alert('Không tìm thấy kết quả cho từ khóa: ' + keyword);
    }
  });
}
