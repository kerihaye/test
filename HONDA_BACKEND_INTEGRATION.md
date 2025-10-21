# Honda Trademark Page - Backend Integration Guide

## Tổng quan
Trang Honda đã được chỉnh sửa để có cấu trúc giống một prompt, dễ dàng liên kết với backend. Trang này sử dụng data binding, API endpoints và event handlers để tương tác với backend.

## Cấu trúc dữ liệu

### Data Attributes
- `data-bind`: Liên kết dữ liệu từ backend
- `data-action`: Xác định hành động khi click
- `data-field`: Nhóm các trường dữ liệu liên quan
- `data-trademark-id`: ID của nhãn hiệu
- `data-api-endpoint`: Endpoint API cho nhãn hiệu

### Data Template
File HTML chứa template JSON với cấu trúc dữ liệu chuẩn:

```json
{
  "trademarkId": "1391311",
  "title": "Đơn đăng ký nhãn hiệu \"HONDA\" số 1391311 của HONDA MOTOR CO., LTD.",
  "status": {
    "text": "Cấp bằng",
    "note": "(thử nghiệm)"
  },
  "applicationNumber": "Đơn quốc tế 1391311",
  "filingDate": "27.10.2016",
  "applicant": {
    "name": "HONDA MOTOR CO., LTD.",
    "address": "1-1, Minami-Aoyama 2-chome, Minato-ku, Tokyo 107-8556 (JP)"
  },
  "productGroups": ["01", "02", "03", ...],
  "groupCount": 45,
  "imageUrl": "picture/madrid_1391311.jpg"
}
```

## API Endpoints

### Cấu hình API
```json
{
  "baseUrl": "/api",
  "endpoints": {
    "trademark": "/trademark",
    "search": "/search",
    "bookmark": "/bookmark",
    "track": "/track",
    "export": "/export",
    "contact": "/contact"
  }
}
```

### Các API cần implement

#### 1. GET /api/trademark/{id}
Lấy thông tin chi tiết nhãn hiệu
```javascript
// Response
{
  "trademarkId": "1391311",
  "title": "...",
  "status": {...},
  // ... các trường khác
}
```

#### 2. GET /api/search?q={query}
Tìm kiếm nhãn hiệu
```javascript
// Response
{
  "results": [...],
  "total": 100,
  "page": 1
}
```

#### 3. POST /api/bookmark
Đánh dấu nhãn hiệu
```javascript
// Request
{
  "trademarkId": "1391311"
}

// Response
{
  "success": true,
  "message": "Đã thêm vào danh sách đánh dấu"
}
```

#### 4. POST /api/track
Theo dõi nhãn hiệu
```javascript
// Request
{
  "trademarkId": "1391311"
}

// Response
{
  "success": true,
  "message": "Đã bắt đầu theo dõi nhãn hiệu"
}
```

#### 5. POST /api/export
Xuất PDF
```javascript
// Request
{
  "trademarkId": "1391311",
  "format": "pdf"
}

// Response
{
  "success": true,
  "url": "/downloads/trademark_1391311.pdf"
}
```

#### 6. POST /api/contact
Liên hệ hỗ trợ
```javascript
// Request
{
  "trademarkId": "1391311",
  "type": "support|feedback",
  "message": "Nội dung liên hệ"
}

// Response
{
  "success": true,
  "message": "Đã gửi yêu cầu hỗ trợ"
}
```

## Cách sử dụng

### 1. Khởi tạo trang
```javascript
// Trang sẽ tự động load dữ liệu khi DOM ready
document.addEventListener('DOMContentLoaded', async function() {
  const trademarkId = document.querySelector('[data-trademark-id]').getAttribute('data-trademark-id');
  const data = await trademarkAPI.fetchTrademarkData(trademarkId);
  dataBinder.bindData(data);
});
```

### 2. Data Binding
```javascript
// Tự động bind dữ liệu vào các element có data-bind
dataBinder.bindData(trademarkData);
```

### 3. Event Handling
```javascript
// Tự động xử lý các action
actionHandler.handleAction('bookmark', element);
actionHandler.handleAction('export-pdf', element);
```

## Classes và Methods

### TrademarkAPI
- `fetchTrademarkData(id)`: Lấy dữ liệu nhãn hiệu
- `performAction(action, data)`: Thực hiện hành động
- `loadTemplateData()`: Load dữ liệu từ template

### DataBinder
- `bindData(data)`: Bind dữ liệu vào DOM
- `getNestedValue(obj, path)`: Lấy giá trị nested
- `updateElement(element, value)`: Cập nhật element

### ActionHandler
- `handleAction(action, element)`: Xử lý hành động
- `handleSearch(query)`: Xử lý tìm kiếm
- `showNotification(message, type)`: Hiển thị thông báo

## Responsive Design

### Breakpoints
- Desktop: > 768px
- Tablet: 768px - 480px
- Mobile: < 480px

### Features
- Grid layout tự động responsive
- Floating buttons di chuyển theo màn hình
- Notification system responsive
- Touch-friendly interactions

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Lưu ý khi implement backend

1. **CORS**: Cấu hình CORS để cho phép frontend gọi API
2. **Authentication**: Thêm JWT token vào headers nếu cần
3. **Error Handling**: Trả về error response chuẩn
4. **Rate Limiting**: Giới hạn số request từ client
5. **Caching**: Cache dữ liệu nhãn hiệu để tăng performance

## Example Backend Implementation (Node.js/Express)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// GET trademark details
app.get('/api/trademark/:id', async (req, res) => {
  try {
    const trademark = await Trademark.findById(req.params.id);
    res.json(trademark);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST bookmark
app.post('/api/bookmark', async (req, res) => {
  try {
    const { trademarkId } = req.body;
    await Bookmark.create({ trademarkId, userId: req.user.id });
    res.json({ success: true, message: 'Đã thêm vào danh sách đánh dấu' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Testing

### Unit Tests
```javascript
// Test API calls
describe('TrademarkAPI', () => {
  test('should fetch trademark data', async () => {
    const api = new TrademarkAPI();
    const data = await api.fetchTrademarkData('1391311');
    expect(data).toBeDefined();
  });
});
```

### Integration Tests
```javascript
// Test data binding
describe('DataBinder', () => {
  test('should bind data to DOM', () => {
    const binder = new DataBinder();
    binder.bindData(mockData);
    expect(document.querySelector('[data-bind="title"]').textContent).toBe(mockData.title);
  });
});
```

## Performance Optimization

1. **Lazy Loading**: Load hình ảnh khi cần
2. **Debouncing**: Debounce search input
3. **Caching**: Cache API responses
4. **Compression**: Nén CSS/JS files
5. **CDN**: Sử dụng CDN cho static assets

## Security Considerations

1. **Input Validation**: Validate tất cả input từ client
2. **SQL Injection**: Sử dụng prepared statements
3. **XSS Protection**: Escape HTML output
4. **CSRF Protection**: Sử dụng CSRF tokens
5. **Rate Limiting**: Giới hạn API calls

## Deployment

### Frontend
```bash
# Build for production
npm run build

# Deploy to CDN
aws s3 sync dist/ s3://your-bucket/
```

### Backend
```bash
# Deploy to server
docker build -t trademark-api .
docker run -p 3000:3000 trademark-api
```

## Monitoring và Analytics

1. **Error Tracking**: Sử dụng Sentry hoặc tương tự
2. **Performance Monitoring**: Monitor API response times
3. **User Analytics**: Track user interactions
4. **Logging**: Log tất cả API calls

## Troubleshooting

### Common Issues

1. **CORS Error**: Cấu hình CORS headers
2. **Data Binding Issues**: Kiểm tra data-bind attributes
3. **API Timeout**: Tăng timeout hoặc retry logic
4. **Mobile Issues**: Test trên thiết bị thật

### Debug Tools

```javascript
// Enable debug mode
window.DEBUG = true;

// Log API calls
trademarkAPI.debug = true;
```

## Kết luận

Trang Honda đã được cấu trúc lại để dễ dàng tích hợp với backend. Với data binding, API endpoints và event handlers, việc kết nối với backend sẽ rất đơn giản và maintainable.
