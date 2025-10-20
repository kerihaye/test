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
  const inputs = form.querySelectorAll('input[type="text"], input[type="checkbox"]');
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      input.checked = false;
    } else {
      input.value = '';
    }
  });
}

// Image Upload Handler
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ hỗ trợ file JPG, PNG, GIF.');
      return;
    }
    
    // Process the image (you can add more functionality here)
    console.log('Image uploaded:', file.name);
    alert('Hình ảnh đã được tải lên thành công!');
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
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
          alert('Vui lòng chỉ kéo thả file hình ảnh.');
        }
      }
    });
  }
});
