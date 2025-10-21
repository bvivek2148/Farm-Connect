# 🌱 Farm Connect - Detailed Features Guide

## 📑 Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [E-commerce Features](#e-commerce-features)
3. [AI Chatbot System](#ai-chatbot-system)
4. [Admin Dashboard](#admin-dashboard)
5. [Farmer Dashboard](#farmer-dashboard)
6. [Real-time Features](#real-time-features)
7. [Security Features](#security-features)
8. [Advanced Features](#advanced-features)

---

## 🔐 Authentication & Authorization

### 1. User Registration & Sign-up

**File:** `src/pages/sign-up.tsx`

**Features:**
- Username validation (unique, alphanumeric)
- Email validation (RFC-compliant)
- Password strength requirements
- Password confirmation matching
- Role assignment based on username
- Automatic account duplicate prevention
- Email verification ready (UI)

**Role Assignment Logic:**
```typescript
// Any username containing "farmer" becomes a farmer
if (username.toLowerCase().includes("farmer")) {
  role = "farmer";
} else {
  role = "customer";
}
```

**Backend Endpoint:**
```
POST /api/auth/signup
Body: {
  username: string,
  email: string,
  password: string,
  confirmPassword: string
}
Response: { success: boolean, user: User, token: string }
```

### 2. User Login & Authentication

**File:** `src/pages/login.tsx`

**Features:**
- Username/password authentication
- JWT token generation
- Session persistence
- "Remember me" functionality
- Secure token storage
- Automatic logout on token expiration
- Multi-device support

**Authentication Flow:**
1. User enters credentials
2. Validate with Zod schema
3. Query database for user
4. Verify password with bcrypt
5. Generate JWT token
6. Store token in localStorage
7. Update auth context
8. Redirect to dashboard

**Backend Endpoint:**
```
POST /api/auth/login
Body: { username: string, password: string }
Response: { success: boolean, token: string, user: User }
```

### 3. Admin Authentication

**File:** `src/pages/admin-login.tsx`

**Features:**
- Special admin login page
- Hardcoded admin credentials
- Admin-only dashboard access
- Admin role verification
- Enhanced security checks

**Admin Credentials:**
```
Username: admin
Password: 123456
```

**Backend Endpoint:**
```
POST /api/auth/admin-login
Body: { username: string, password: string }
Response: { success: boolean, token: string, user: AdminUser }
```

### 4. Protected Routes & Authorization

**File:** `src/components/AuthGuard.tsx` & `src/components/RoleGuard.tsx`

**Route Protection:**
```typescript
// AuthGuard - Requires authentication
<AuthGuard>
  <Checkout /> {/* Protected route */}
</AuthGuard>

// RoleGuard - Requires specific role
<RoleGuard requiredRole="farmer">
  <FarmerDashboard />
</RoleGuard>

<RoleGuard requiredRole="admin">
  <AdminDashboard />
</RoleGuard>
```

**Protected Routes:**
- `/checkout` - Customer only
- `/profile` - Authenticated users
- `/orders` - Authenticated users
- `/farmer-dashboard` - Farmer role
- `/admin-dashboard` - Admin role

---

## 🛍️ E-commerce Features

### 1. Product Catalog & Browsing

**File:** `src/pages/shop.tsx`

**Features:**
- Browse all products from all farmers
- Search functionality
- Filter by category
- Filter by price range
- Filter by distance
- Sort by price, name, rating
- Product pagination
- Real-time product updates

**Product Data Structure:**
```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  farmerId: number;
  farmerName: string;
  stock: number;
  organic: boolean;
  featured: boolean;
  image: string;
  distance: number; // km
  rating: number;
  createdAt: Date;
}
```

**Backend Endpoint:**
```
GET /api/products
Query Parameters:
  - category?: string
  - priceMin?: number
  - priceMax?: number
  - search?: string
  - sort?: string

Response: { success: boolean, products: Product[] }
```

### 2. Shopping Cart Management

**File:** `src/context/CartContext.tsx` & `src/pages/cart.tsx`

**Features:**
- Add/remove items
- Update quantities
- Persistent storage (localStorage)
- Real-time total calculation
- Tax calculation
- Shipping cost calculation
- Empty cart functionality
- Cart summary display

**Cart Data Structure:**
```typescript
interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  farmerId: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}
```

**Cart Operations:**
```typescript
// Add to cart
cart.addItem(product, quantity)

// Remove from cart
cart.removeItem(productId)

// Update quantity
cart.updateQuantity(productId, newQuantity)

// Clear cart
cart.clear()

// Get totals
cart.getSubtotal()
cart.getTax()
cart.getShipping()
cart.getTotal()
```

### 3. Checkout & Payment

**File:** `src/pages/checkout.tsx`

**Features:**
- Multi-step checkout process
- Shipping address entry
- Billing address option
- Multiple payment methods
- Real-time form validation
- Order summary display
- Order confirmation

**Checkout Flow:**
1. Review cart items
2. Enter shipping address
3. Review order
4. Select payment method
5. Process payment
6. Order confirmation

**Payment Methods Supported:**
1. **Credit/Debit Card**
   - Card number validation
   - Expiry date (MM/YY) validation
   - CVV validation
   - Cardholder name

2. **UPI Payment**
   - UPI ID validation
   - Support for all UPI apps

3. **Digital Wallets**
   - Paytm
   - Amazon Pay
   - Mobikwik

4. **Net Banking**
   - HDFC, ICICI, Axis, SBI
   - Other banks

5. **Cash on Delivery**
   - COD option
   - Delivery instructions

**Backend Endpoint:**
```
POST /api/orders
Body: {
  items: CartItem[],
  shippingAddress: Address,
  billingAddress?: Address,
  paymentMethod: string,
  paymentDetails: object
}
Response: { success: boolean, order: Order, confirmation: OrderConfirmation }
```

### 4. Order Management

**File:** `src/pages/orders.tsx`

**Features:**
- View order history
- Order status tracking
- Order details display
- Estimated delivery date
- Tracking information
- Order cancellation (if applicable)
- Reorder functionality

**Order Statuses:**
- `pending` - Awaiting confirmation
- `confirmed` - Order confirmed
- `shipped` - In transit
- `delivered` - Delivered
- `cancelled` - Cancelled

**Backend Endpoints:**
```
GET /api/orders
Response: { success: boolean, orders: Order[] }

GET /api/orders/:id
Response: { success: boolean, order: Order }

PUT /api/orders/:id/status
Body: { status: string }
Response: { success: boolean, order: Order }
```

---

## 🤖 AI Chatbot System

### Complete Implementation Overview

**Status:** ✅ PRODUCTION READY

### 1. AI Service Integration

**File:** `server/ai-service.ts`

**Features:**
- OpenRouter API integration
- Multi-model support (100+ models)
- Cost optimization
- Rate limiting
- Error handling
- Fallback responses

**Supported Models:**
```typescript
// Free Models
"meta-llama/llama-3.1-8b-instruct:free" // Default

// Budget Models
"anthropic/claude-3-haiku"
"google/gemini-flash-1.5-free"

// Premium Models
"anthropic/claude-3.5-sonnet"
"openai/gpt-4-turbo"
"google/gemini-2.0-flash"

// And 100+ more available on OpenRouter
```

**API Configuration:**
```typescript
const config = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  model: process.env.OPENROUTER_MODEL,
  maxTokens: 500,
  temperature: 0.7,
};
```

### 2. Chat Widget

**File:** `src/components/chat/ChatWidget.tsx`

**Features:**
- Floating chat widget (bottom-right)
- Minimizable/maximizable
- Message history
- Real-time typing indicator
- Message timestamps
- Quick action buttons
- Mobile responsive
- Dark/Light mode compatible

**Quick Actions (8 available):**
1. 🌱 **Crop Issues**
   - Plant diseases
   - Pest management
   - Nutrient deficiencies
   - Growing problems

2. 🌤️ **Weather Advice**
   - Farming tips based on weather
   - Seasonal recommendations
   - Frost/heat protection

3. 📦 **Track Order**
   - Order status
   - Delivery tracking
   - Shipping information

4. 🥕 **Fresh Produce**
   - Seasonal fruits
   - Seasonal vegetables
   - Product information
   - Storage tips

5. 🚜 **Farming Tips**
   - Best practices
   - Sustainable farming
   - Organic methods
   - Crop rotation

6. 🔐 **Account Help**
   - Login assistance
   - Profile management
   - Password reset
   - Settings help

7. 👨‍🌾 **Contact Farmer**
   - Direct farmer connection
   - Local farmer info
   - Farm details
   - Produce availability

8. 📅 **Seasonal Guide**
   - Planting schedules
   - Harvest timing
   - Seasonal advice
   - Crop calendar

### 3. Chat API Routes

**File:** `server/chat-routes.ts`

**Endpoints:**

```
GET /api/chat/messages
Query: { limit?: number, offset?: number }
Response: { success: boolean, messages: Message[] }

POST /api/chat/messages
Body: { content: string, quickActionId?: string }
Response: { success: boolean, message: Message }

POST /api/chat/stream
Body: { content: string }
Response: Streaming response with AI message

GET /api/chat/history/:userId
Response: { success: boolean, messages: Message[] }
```

### 4. Message Persistence

**File:** `drizzle/schema.ts` - Messages Table

**Features:**
- Store all chat messages in PostgreSQL
- User association
- Timestamp tracking
- Sender identification (user/bot)
- Message content storage
- Query by user
- Message history retrieval

**Message Schema:**
```typescript
messages: {
  id: integer,
  userId: integer (foreign key),
  content: text,
  sender: enum('user', 'bot'),
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

### 5. Smart Responses & Fallback System

**Features:**
- Context-aware responses
- Role-based assistance (farmer/customer)
- Fallback responses when API unavailable
- Error handling and retries
- Rate limit management
- Graceful degradation

**Fallback Response Examples:**
```
For Crop Issues:
"I'm here to help! Could you describe the specific issue you're facing with your crops? 
Tell me about the symptoms, affected plants, and affected area."

For Weather Advice:
"Great question! I recommend checking local weather patterns and consulting 
seasonal farming guides. What crop are you growing?"

For Order Tracking:
"To track your order, please provide your order ID and I'll help you 
get the latest delivery information."
```

### 6. Testing & Validation

**Test File:** `test-openrouter.js`
**Test Interface:** `test-chatbot.html`

**Testing Commands:**
```bash
# Test API connection
node test-openrouter.js

# Test chat interface
# Visit: http://localhost:5000/test-chatbot.html
```

**Testing Checklist:**
- [x] API connectivity
- [x] All 8 quick actions
- [x] Database message storage
- [x] Message retrieval
- [x] Error handling
- [x] Fallback responses
- [x] Mobile responsiveness
- [x] WebSocket updates

---

## 📊 Admin Dashboard

### Dashboard Structure

**File:** `src/pages/admin-dashboard.tsx`

The dashboard has 6 comprehensive tabs:

### Tab 1: Overview

**Features:**
- Real-time key metrics
- Total users count
- Total revenue
- System health status
- Active sessions
- Trend indicators with % changes
- Color-coded cards
- Interactive widgets

**Metrics Displayed:**
```
Total Users: 1,234 ↑ 12% (up from last week)
Total Revenue: $45,678 ↑ 8% (up from last week)
Active Orders: 89 ↑ 5% (up from last week)
System Health: 98% (excellent)
```

### Tab 2: Analytics

**Features:**
- Performance metrics
- Real-time activity feed
- Device analytics
- Conversion rates
- Customer satisfaction
- Growth tracking
- Charts and graphs
- Export capabilities

**Analytics Data:**
```
Performance:
  - Page Load Time: 1.2s
  - API Response Time: 150ms
  - Uptime: 99.9%

Activity:
  - Real-time user count: 45
  - API requests/min: 234
  - Database queries/min: 567

Device Analytics:
  - Desktop: 65%
  - Mobile: 30%
  - Tablet: 5%

Growth:
  - Monthly growth: +15%
  - Weekly growth: +3%
```

### Tab 3: Users

**Features:**
- List all registered users
- Advanced search
- Filter by role (admin, farmer, customer)
- Filter by status (active, inactive)
- Export user data
- Edit user information
- Activate/deactivate users
- Delete users
- User details view

**User Management Operations:**
```
Search: Find users by name, email, username
Filter: By role, status
Sort: By registration date, last login, name
Export: Download as CSV
Actions: Edit, Deactivate, Delete
```

### Tab 4: Products

**Features:**
- View all products
- Product search
- Filter by farmer
- Filter by category
- Filter by price
- Inventory tracking
- Product details
- Edit product info
- Delete products
- Price management

**Product Management:**
```
Search: By product name
Filter: By farmer, category, price
Sort: By price, name, stock, date added
Actions: Edit, Delete, View Details
```

### Tab 5: Orders

**Features:**
- View all orders
- Search orders by ID
- Filter by status
- Filter by date range
- Order details
- Update order status
- Track shipments
- Generate reports

**Order Management:**
```
Statuses: Pending, Confirmed, Shipped, Delivered, Cancelled
Filter: By date, status, customer
Actions: View details, Update status, Cancel order
```

### Tab 6: System

**Features:**
- CPU usage monitoring
- Memory usage tracking
- Disk space monitoring
- Security dashboard
- Login attempts log
- API requests log
- System configuration
- Health checks

**System Monitoring:**
```
CPU: 34% ↑ (normal)
Memory: 62% ↑ (normal)
Disk: 78% (warning level)

Security:
  - Failed logins/day: 5
  - API requests/day: 50,000
  - Database size: 2.3GB
  - Backup status: Current
```

### Admin Data APIs

**Backend Endpoints:**

```
GET /api/admin/users
Response: { success: boolean, users: User[] }

GET /api/admin/products
Response: { success: boolean, products: Product[] }

GET /api/admin/orders
Response: { success: boolean, orders: Order[] }

GET /api/admin/stats
Response: { success: boolean, stats: DashboardStats }

PUT /api/admin/users/:id
Body: { status: 'active'|'inactive', role: string }
Response: { success: boolean, user: User }

DELETE /api/admin/users/:id
Response: { success: boolean, message: string }
```

---

## 🚜 Farmer Dashboard

### Farmer-Specific Features

**File:** `src/pages/farmer-dashboard.tsx`

### 1. Product Management

**Features:**
- View all your products
- Add new products
- Edit existing products
- Delete products
- Track inventory
- View product analytics
- Price management
- Stock management

**Add Product Form:**
```typescript
{
  name: string,           // Product name
  description: string,    // Detailed description
  price: number,          // Price per unit
  category: string,       // Category
  unit: string,           // Unit (kg, lb, etc)
  stock: number,          // Stock quantity
  organic: boolean,       // Organic certification
  featured: boolean,      // Feature in shop
  distance: number,       // Distance from customer
  image: string,          // Product image URL
}
```

**Backend Endpoints:**
```
POST /api/products
Body: { name, description, price, ... }
Response: { success: boolean, product: Product }

PUT /api/products/:id
Body: { name, description, price, ... }
Response: { success: boolean, product: Product }

DELETE /api/products/:id
Response: { success: boolean, message: string }

GET /api/products?farmerId=:id
Response: { success: boolean, products: Product[] }
```

### 2. Sales Tracking

**Features:**
- View orders for your products
- Order status tracking
- Revenue tracking
- Sales analytics
- Customer feedback
- Delivery confirmation

### 3. Farm Profile

**Features:**
- Farm information display
- Farm location
- Contact details
- Farm images
- Certifications display
- Verification status

### 4. Inventory Management

**Features:**
- Stock level tracking
- Low stock alerts
- Stock updates
- Historical data
- Reorder suggestions

---

## 🔄 Real-time Features

### Socket.IO Implementation

**File:** `server/socket.ts`

**Features:**
- Real-time order updates
- Live notifications
- Instant product updates
- Chat notifications
- Presence tracking

**Socket Events:**
```typescript
// Client-side
socket.emit('product-update', productData)
socket.on('order-status-changed', handleUpdate)
socket.on('new-notification', handleNotification)

// Server-side
io.on('connection', (socket) => {
  socket.on('product-update', broadcastUpdate)
  socket.emit('order-status-changed', orderData)
})
```

---

## 🔒 Security Features

### 1. Password Security

**Features:**
- Bcrypt hashing (11 salt rounds)
- No plaintext storage
- Secure comparison
- Password strength validation
- Password reset flow

**Implementation:**
```typescript
// Hashing
const hashedPassword = await bcrypt.hash(password, 11)

// Verification
const isValid = await bcrypt.compare(inputPassword, hashedPassword)
```

### 2. JWT Token Security

**Features:**
- Signed tokens
- Token expiration (24 hours)
- Secure signature verification
- Token refresh capability
- Token revocation

**Token Structure:**
```typescript
{
  iss: "farm-connect",
  sub: userId,
  role: userRole,
  iat: issuedAt,
  exp: expiresAt,
  aud: "farm-connect-users"
}
```

### 3. API Security

**Features:**
- Rate limiting (100 requests/15 min)
- Input validation (Zod)
- SQL injection prevention (Drizzle ORM)
- CORS protection
- Helmet security headers
- XSS prevention

### 4. Data Security

**Features:**
- Encrypted sensitive data
- Secure cookies
- HTTPS only in production
- Database encryption
- Backup encryption

---

## 🎨 Advanced Features

### 1. Responsive Design

**Breakpoints:**
```css
Mobile: 320px - 768px
Tablet: 768px - 1024px
Desktop: 1024px - 1440px
Large: 1440px+
```

### 2. Dark Mode Support

**Implementation:**
- Next-themes integration
- System preference detection
- Manual toggle
- Persistent selection

### 3. Animations & Transitions

**Libraries:**
- Framer Motion
- Tailwind animate
- CSS transitions

### 4. Accessibility

**Features:**
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus indicators

### 5. Performance Optimization

**Techniques:**
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis
- Caching strategies

### 6. SEO Optimization

**Features:**
- Meta tags
- Open Graph tags
- Structured data
- Sitemap generation
- Robot.txt configuration

---

## 🔗 Integration Points

### External APIs

1. **OpenRouter API** (AI Chatbot)
   - Endpoint: https://openrouter.ai/api/v1
   - Models: 100+
   - Cost: Free tier available

2. **Firebase (Optional)**
   - Authentication
   - Real-time database
   - Cloud functions

3. **Email Service**
   - Nodemailer
   - Contact form notifications
   - Order confirmations

---

## 📱 Mobile Features

### Responsive Components

- Hamburger menu for navigation
- Touch-optimized buttons
- Mobile-optimized forms
- Responsive images
- Mobile-first CSS

### Progressive Web App (PWA)

- Service worker support
- Offline capabilities
- Install prompt
- Push notifications ready

---

## 🚀 Performance Features

### Optimization Techniques

1. **Frontend**
   - Code splitting per route
   - Lazy component loading
   - Image compression
   - CSS purging
   - JavaScript minification

2. **Backend**
   - Database query optimization
   - Caching strategies
   - Connection pooling
   - Compression middleware

3. **Deployment**
   - CDN integration
   - Edge caching
   - Lazy API responses
   - Database indexing

---

## 📊 Monitoring & Analytics

### Built-in Monitoring

- User activity tracking
- API performance metrics
- Database query logging
- Error tracking
- Performance monitoring

### Admin Analytics

- User growth metrics
- Revenue tracking
- Product performance
- Order analytics
- System health monitoring

---

**End of Features Guide**

For more information, refer to:
- `README.md` - Main documentation
- `PROJECT_OVERVIEW.md` - Project structure overview
- `OPENROUTER_SETUP.md` - AI setup guide
- Source code comments and type definitions
