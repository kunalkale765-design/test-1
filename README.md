# 🥗 Fresh Vegetable Supply - Enterprise PWA

A **professional-grade, mobile-first Progressive Web App** for vegetable suppliers to manage customers, orders, inventory, and workers with enterprise features like unique customer access links, contract-based pricing, and real-time order tracking.

---

## 🚀 Revolutionary Features

### 🎯 **Industry-First Innovations**
- **Unique Access Links** - Generate magic links for customers (no login required)
- **Contract-Based Pricing** - Custom rates per customer, stored securely
- **PWA Technology** - Install as native app on any device
- **Token Authentication** - Secure, shareable customer links
- **Dual Access System** - Username/password OR unique link access
- **Real-Time Dashboard** - Live purchase lists for suppliers and workers

---

## 👥 User Roles

### 1. 🏢 **Supplier (Admin)**
**Login:** http://localhost:3000/supplier/login  
**Password:** `admin123`

**Capabilities:**
- ✅ Customer Management with unique access links
- ✅ Set contract rates per customer
- ✅ Add/manage vegetables with purchase & selling prices
- ✅ Quick order entry for phone orders
- ✅ Real-time purchase list aggregation
- ✅ Worker management
- ✅ Hotel contract management
- ✅ Order status tracking

### 2. 👨‍🍳 **Customer (Hotel/Restaurant)**

**Two Access Methods:**

**Method 1: Unique Link** (No login required!)
```
http://localhost:3000/c/{ACCESS_TOKEN}
```

**Method 2: Username/Password**
```
http://localhost:3000/customer/login
```

### 3. 👷 **Workers**
**Login:** http://localhost:3000/worker/login  
**Credentials:** `worker1/worker1` or `worker2/worker2`

---

## 🎯 How To Use

### **Step 1: Supplier Creates Customer**
1. Login as supplier (admin123)
2. Go to "Customers" tab
3. Add customer details (business name, contact, phone)
4. Set username & password
5. System generates unique access link automatically!

### **Step 2: Share Customer Link**
Copy the unique link and send via:
- WhatsApp ✅
- SMS ✅
- Email ✅

Example link:
```
http://192.168.1.4:3000/c/a7f3d9e2c1b0f4e8c
```

### **Step 3: Customer Orders**
- Customer clicks link → Auto-logged in!
- Selects vegetables & quantities
- Chooses delivery date
- Submits order ✅

### **Step 4: Worker Packs**
- Worker sees shopping list
- Buys vegetables from market
- Packs orders
- Marks as complete ✅

---

## 📱 Install as App (PWA)

### **On iPhone:**
1. Open in Safari
2. Tap Share button
3. "Add to Home Screen"
4. App installs!

### **On Android:**
1. Open in Chrome
2. Tap menu (3 dots)
3. "Install App" or "Add to Home screen"
4. App installs!

### **On Desktop:**
1. Chrome shows install icon in address bar
2. Click to install
3. Runs like native app!

---

## 🔐 Customer Management Features

### **Unique Access Links**
- Each customer gets a permanent, shareable link
- No password needed when using link
- Can be shared with multiple people
- Example: `http://yourserver/c/a7f3d9e2c1b0f4e8`

### **Contract Pricing**
- Set custom rates per customer
- Override default selling prices
- Example: Tomatoes ₹35 for Hotel A, ₹40 for Hotel B

### **Customer Controls**
- Activate/Deactivate accounts
- Delete customers
- View order history
- Update contract rates anytime

---

## 🌐 Mobile Access (Phone/Tablet)

### **Find Your IP Address:**
```
Mac: System Settings → Network → Wi-Fi → IP Address
Windows: ipconfig
Linux: ifconfig
```

### **Access from Phone:**
Replace `localhost` with your computer's IP:
```
http://192.168.1.4:3000
```

**Requirements:**
- Phone and computer on same Wi-Fi network
- Firewall allows port 3000

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start server
node server.js

# Access URLs
Supplier: http://localhost:3000/supplier/login
Customer: http://localhost:3000/customer/login
Worker:   http://localhost:3000/worker/login
```

---

## 💡 Key Features

### **For Suppliers:**
- Dashboard with real-time purchase needs
- Add new vegetables with emoji icons
- Update purchase rates from dashboard
- Generate customer access links
- Manual order entry for phone orders
- Worker management

### **For Customers:**
- Zero-friction ordering (via unique link)
- Mobile-optimized interface
- Order history tracking
- PWA installable on any device
- Custom contract pricing automatically applied

### **For Workers:**
- Aggregated shopping list
- Pending orders view
- Order packing workflow
- Purchase quantities by item

---

## 🎨 Technology Stack

- **Backend:** Node.js + Express.js
- **Templates:** EJS
- **Auth:** bcrypt + express-session
- **PWA:** Service Worker + Manifest
- **Design:** Mobile-first, Gradient UI
- **Storage:** In-memory (upgrade to MongoDB for production)

---

## 🔐 Customer Management Features

### **Unique Access Links**
- Each customer gets a permanent, shareable link
- No password needed when using link
- Can be shared with multiple people
- Example: `http://yourserver/c/a7f3d9e2c1b0f4e8`

### **Contract Pricing**
- Set custom rates per customer
- Override default selling prices
- Example: Tomatoes ₹35 for Hotel A, ₹40 for Hotel B

### **Customer Controls**
- Activate/Deactivate accounts
- Delete customers
- View order history
- Update contract rates anytime

---

## 🎨 Design Principles

- Mobile-first, PWA-ready, simple UX.

---

## 🚀 Run Locally

```bash
npm install
node server.js
```
