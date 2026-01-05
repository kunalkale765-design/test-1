const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: 'vegetable-supply-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// Load vegetables data
const vegetables = require('./data/vegetables.js');

// In-memory storage
let orders = [];
let hotels = []; // Hotel contract rates
let customers = []; // Customer accounts with unique access tokens
let workers = [
    { id: 1, username: 'worker1', password: '$2b$10$q.3/O5dOUnfM4qZ015Vn7OC9YiPr/luCsp4Qmpkc5aoHqQzhjvQ3O', name: 'Worker One' },
    { id: 2, username: 'worker2', password: '$2b$10$9oZHnxISuyTcZbaa0yH3f.3enn3hhLLsqQa.gJSinrNpG2L/bcJRq', name: 'Worker Two' }
];

// Supplier credentials - Password: admin123
const supplierPassword = '$2b$10$0kyfNF7VNxcHs2zJqSeNCuaBh1s7HNNAu0SNK39G9M7ER0.R02pJS';

// Utility function to generate unique access token
function generateAccessToken() {
    return require('crypto').randomBytes(16).toString('hex');
}

// Authentication middleware
function isSupplier(req, res, next) {
    if (req.session && req.session.userType === 'supplier') {
        return next();
    }
    res.redirect('/supplier/login');
}

function isWorker(req, res, next) {
    if (req.session && req.session.userType === 'worker') {
        return next();
    }
    res.redirect('/worker/login');
}

function isCustomer(req, res, next) {
    if (req.session && req.session.userType === 'customer') {
        return next();
    }
    res.redirect('/customer/login');
}

// Customer token-based access (for unique links)
app.get('/c/:token', (req, res) => {
    const customer = customers.find(c => c.accessToken === req.params.token && c.active);
    if (customer) {
        req.session.userType = 'customer';
        req.session.customerId = customer.id;
        req.session.customerName = customer.name;
        res.redirect('/customer/dashboard');
    } else {
        res.redirect('/customer/login');
    }
});

// Public Routes - Customer facing
app.get('/', (req, res) => {
    res.redirect('/customer/login');
});

// Customer Authentication
app.get('/customer/login', (req, res) => {
    res.render('customer/login', { error: req.query.error });
});

app.post('/customer/login', async (req, res) => {
    const customer = customers.find(c => c.username === req.body.username && c.active);
    if (customer && await bcrypt.compare(req.body.password, customer.password)) {
        req.session.userType = 'customer';
        req.session.customerId = customer.id;
        req.session.customerName = customer.name;
        res.redirect('/customer/dashboard');
    } else {
        res.redirect('/customer/login?error=1');
    }
});

app.get('/customer/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/customer/login');
});

// Customer Dashboard
app.get('/customer/dashboard', isCustomer, (req, res) => {
    const customerOrders = orders.filter(o => o.customerId === req.session.customerId);
    res.render('customer/dashboard', {
        customerName: req.session.customerName,
        orders: customerOrders.slice().reverse()
    });
});

app.get('/order', isCustomer, (req, res) => {
    res.render('customer/order', {
        vegetables,
        customerName: req.session.customerName,
        customerId: req.session.customerId
    });
});

app.post('/order', isCustomer, (req, res) => {
    const customer = customers.find(c => c.id === req.session.customerId);

    const order = {
        id: orders.length + 1,
        customerId: req.session.customerId,
        hotelName: customer.businessName,
        contactPerson: customer.contactPerson,
        phone: customer.phone,
        email: customer.email || '',
        deliveryDate: req.body.deliveryDate,
        items: [],
        totalAmount: 0,
        orderDate: new Date().toISOString(),
        status: 'pending',
        packedBy: null
    };

    // Find customer contract rates
    const contractRates = customer.rates || {};

    vegetables.forEach(veg => {
        const quantity = parseFloat(req.body[`quantity_${veg.id}`]) || 0;
        if (quantity > 0) {
            const price = contractRates[veg.id] || veg.sellingPrice;
            order.items.push({
                vegId: veg.id,
                name: veg.name,
                quantity: quantity,
                unit: veg.unit,
                price: price,
                total: quantity * price
            });
            order.totalAmount += quantity * price;
        }
    });

    orders.push(order);
    res.render('customer/confirmation', { order });
});

// Supplier Authentication
app.get('/supplier/login', (req, res) => {
    const error = req.session.loginError;
    req.session.loginError = null;
    res.render('supplier/login', { error });
});

app.post('/supplier/login', async (req, res) => {
    const { password } = req.body;

    try {
        const isValid = await bcrypt.compare(password, supplierPassword);

        if (isValid) {
            req.session.userType = 'supplier';
            req.session.userId = 'supplier';
            res.redirect('/supplier/dashboard');
        } else {
            req.session.loginError = 'Invalid password';
            res.redirect('/supplier/login');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.session.loginError = 'An error occurred';
        res.redirect('/supplier/login');
    }
});

app.get('/supplier/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/supplier/login');
});

// Supplier Dashboard Routes (Protected)
app.get('/supplier/dashboard', isSupplier, (req, res) => {
    const quantityNeeded = {};
    const today = new Date().toISOString().split('T')[0];

    orders.forEach(order => {
        if (order.status === 'pending') {
            order.items.forEach(item => {
                if (quantityNeeded[item.name]) {
                    quantityNeeded[item.name].quantity += item.quantity;
                    quantityNeeded[item.name].total += item.total;
                } else {
                    quantityNeeded[item.name] = {
                        quantity: item.quantity,
                        unit: item.unit,
                        total: item.total
                    };
                }
            });
        }
    });

    const todayOrders = orders.filter(o => o.deliveryDate === today && o.status === 'pending');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.render('supplier/dashboard', {
        orders: orders.slice().reverse(),
        quantityNeeded,
        todayOrders,
        pendingCount: pendingOrders.length,
        completedCount: completedOrders.length,
        todayCount: todayOrders.length,
        totalRevenue,
        vegetables
    });
});

// Hotel Contract Management
app.get('/supplier/hotels', isSupplier, (req, res) => {
    res.render('supplier/hotels', { hotels, vegetables });
});

app.post('/supplier/add-hotel', isSupplier, (req, res) => {
    const newHotel = {
        id: hotels.length + 1,
        name: req.body.hotelName,
        contact: req.body.contact,
        phone: req.body.phone,
        rates: {}
    };

    vegetables.forEach(veg => {
        const rate = parseFloat(req.body[`rate_${veg.id}`]);
        if (!isNaN(rate) && rate > 0) {
            newHotel.rates[veg.id] = rate;
        }
    });

    hotels.push(newHotel);
    res.redirect('/supplier/hotels');
});

app.get('/supplier/edit-hotel/:id', isSupplier, (req, res) => {
    const hotel = hotels.find(h => h.id === parseInt(req.params.id));
    if (hotel) {
        res.render('supplier/edit-hotel', { hotel, vegetables });
    } else {
        res.redirect('/supplier/hotels');
    }
});

app.post('/supplier/update-hotel/:id', isSupplier, (req, res) => {
    const hotel = hotels.find(h => h.id === parseInt(req.params.id));

    if (hotel) {
        hotel.name = req.body.hotelName;
        hotel.contact = req.body.contact;
        hotel.phone = req.body.phone;
        hotel.rates = {};

        vegetables.forEach(veg => {
            const rate = parseFloat(req.body[`rate_${veg.id}`]);
            if (!isNaN(rate) && rate > 0) {
                hotel.rates[veg.id] = rate;
            }
        });
    }

    res.redirect('/supplier/hotels');
});

app.post('/supplier/delete-hotel/:id', isSupplier, (req, res) => {
    hotels = hotels.filter(h => h.id !== parseInt(req.params.id));
    res.json({ success: true });
});

// Market Rates (Daily Purchase Rates)
app.get('/supplier/market-rates', isSupplier, (req, res) => {
    res.render('supplier/market-rates', { vegetables });
});

app.post('/supplier/market-rates', isSupplier, (req, res) => {
    vegetables.forEach(veg => {
        const purchasePrice = parseFloat(req.body[`price_${veg.id}`]);
        if (!isNaN(purchasePrice)) {
            veg.purchasePrice = purchasePrice;
        }
    });
    res.redirect('/supplier/dashboard');
});

// Add New Vegetable
app.post('/supplier/add-vegetable', isSupplier, (req, res) => {
    const newId = vegetables.length > 0 ? Math.max(...vegetables.map(v => v.id)) + 1 : 1;
    const newVegetable = {
        id: newId,
        name: req.body.name,
        sellingPrice: parseFloat(req.body.sellingPrice),
        purchasePrice: parseFloat(req.body.purchasePrice),
        unit: req.body.unit,
        image: req.body.image
    };
    vegetables.push(newVegetable);
    res.redirect('/supplier/dashboard');
});

// Customer Management
app.get('/supplier/customers', isSupplier, (req, res) => {
    res.render('supplier/customers', { customers, vegetables });
});

app.post('/supplier/add-customer', isSupplier, async (req, res) => {
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const accessToken = generateAccessToken();
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newCustomer = {
        id: newId,
        username: req.body.username,
        password: hashedPassword,
        businessName: req.body.businessName,
        contactPerson: req.body.contactPerson,
        phone: req.body.phone,
        email: req.body.email || '',
        accessToken: accessToken,
        rates: {},
        active: true,
        createdAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    res.redirect('/supplier/customers');
});

app.post('/supplier/update-customer-rates/:id', isSupplier, (req, res) => {
    const customer = customers.find(c => c.id === parseInt(req.params.id));

    if (customer) {
        customer.rates = {};
        vegetables.forEach(veg => {
            const rate = parseFloat(req.body[`rate_${veg.id}`]);
            if (!isNaN(rate) && rate > 0) {
                customer.rates[veg.id] = rate;
            }
        });
    }

    res.redirect('/supplier/customers');
});

app.post('/supplier/toggle-customer/:id', isSupplier, (req, res) => {
    const customer = customers.find(c => c.id === parseInt(req.params.id));
    if (customer) {
        customer.active = !customer.active;
    }
    res.json({ success: true, active: customer.active });
});

app.post('/supplier/delete-customer/:id', isSupplier, (req, res) => {
    customers = customers.filter(c => c.id !== parseInt(req.params.id));
    res.json({ success: true });
});

// Quick Add Order
app.get('/supplier/quick-order', isSupplier, (req, res) => {
    res.render('supplier/quick-order', { vegetables, hotels });
});

app.post('/supplier/quick-order', isSupplier, (req, res) => {
    const hotelId = parseInt(req.body.hotelId);
    const hotel = hotels.find(h => h.id === hotelId);

    const order = {
        id: orders.length + 1,
        hotelName: hotel ? hotel.name : req.body.hotelName,
        contactPerson: hotel ? hotel.contact : req.body.contactPerson,
        phone: hotel ? hotel.phone : req.body.phone,
        email: '',
        deliveryDate: req.body.deliveryDate,
        items: [],
        totalAmount: 0,
        orderDate: new Date().toISOString(),
        status: 'pending',
        packedBy: null
    };

    const contractRates = hospital ? hotel.rates : {};

    vegetables.forEach(veg => {
        const quantity = parseFloat(req.body[`quantity_${veg.id}`]) || 0;
        if (quantity > 0) {
            const price = contractRates[veg.id] || veg.sellingPrice;
            order.items.push({
                vegId: veg.id,
                name: veg.name,
                quantity: quantity,
                unit: veg.unit,
                price: price,
                total: quantity * price
            });
            order.totalAmount += quantity * price;
        }
    });

    orders.push(order);
    res.redirect('/supplier/dashboard');
});

app.post('/supplier/update-status/:id', isSupplier, (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
    }

    res.json({ success: true });
});

// Worker Management
app.get('/supplier/workers', isSupplier, (req, res) => {
    res.render('supplier/workers', { workers });
});

app.post('/supplier/add-worker', isSupplier, async (req, res) => {
    const { username, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    workers.push({
        id: workers.length + 1,
        username,
        password: hashedPassword,
        name
    });

    res.redirect('/supplier/workers');
});

app.post('/supplier/delete-worker/:id', isSupplier, (req, res) => {
    const workerId = parseInt(req.params.id);
    workers = workers.filter(w => w.id !== workerId);
    res.json({ success: true });
});

// Worker Authentication
app.get('/worker/login', (req, res) => {
    const error = req.session.loginError;
    req.session.loginError = null;
    res.render('worker/login', { error });
});

app.post('/worker/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const worker = workers.find(w => w.username === username);

        if (worker) {
            const isValid = await bcrypt.compare(password, worker.password);

            if (isValid) {
                req.session.userType = 'worker';
                req.session.userId = worker.id;
                req.session.workerName = worker.name;
                res.redirect('/worker/packing');
            } else {
                req.session.loginError = 'Wrong password';
                res.redirect('/worker/login');
            }
        } else {
            req.session.loginError = 'Worker not found';
            res.redirect('/worker/login');
        }
    } catch (error) {
        console.error('Worker login error:', error);
        req.session.loginError = 'Something went wrong';
        res.redirect('/worker/login');
    }
});

app.get('/worker/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/worker/login');
});

// Worker Packing Routes
app.get('/worker/packing', isWorker, (req, res) => {
    const pendingOrders = orders.filter(o => o.status === 'pending');

    // Calculate total quantities needed for purchase
    const quantityNeeded = {};
    orders.forEach(order => {
        if (order.status === 'pending') {
            order.items.forEach(item => {
                if (quantityNeeded[item.name]) {
                    quantityNeeded[item.name].quantity += item.quantity;
                } else {
                    quantityNeeded[item.name] = {
                        quantity: item.quantity,
                        unit: item.unit
                    };
                }
            });
        }
    });

    res.render('worker/packing', {
        orders: pendingOrders,
        quantityNeeded,
        workerName: req.session.workerName
    });
});

app.get('/worker/order/:id', isWorker, (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = orders.find(o => o.id === orderId);

    if (order) {
        res.render('worker/order-detail', {
            order,
            workerName: req.session.workerName
        });
    } else {
        res.redirect('/worker/packing');
    }
});

app.post('/worker/mark-packed/:id', isWorker, (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = orders.find(o => o.id === orderId);

    if (order) {
        order.packedBy = req.session.workerName;
        order.packedAt = new Date().toISOString();
    }

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`   Fresh Vegetable Supply - Running   `);
    console.log(`========================================`);
    console.log(`\n📱 Customer: http://localhost:${PORT}`);
    console.log(`📱 Phone:    http://192.168.1.4:${PORT}`);
    console.log(`\n🏢 Supplier: http://localhost:${PORT}/supplier/login`);
    console.log(`   Password: admin123`);
    console.log(`\n👷 Worker:   http://localhost:${PORT}/worker/login`);
    console.log(`   worker1 / worker1`);
    console.log(`   worker2 / worker2`);
    console.log(`========================================\n`);
});
