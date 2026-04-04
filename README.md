# 🍕 Restaurant QR Order System

## Step 1 — Project Setup (Complete!)

### آپ کے لیپ ٹاپ پر کیسے چلائیں:

**1. Node.js انسٹال کریں:**
- https://nodejs.org پر جائیں
- "LTS" ورژن ڈاؤن لوڈ کریں
- انسٹال کریں (Next, Next, Finish)

**2. یہ فولڈر اپنے لیپ ٹاپ پر رکھیں**

**3. Terminal/CMD کھولیں اور:**
```bash
cd restaurant-qr-system
npm install
node server.js
```

**4. براؤزر میں کھولیں:**
- Customer Menu: http://localhost:3000/?table=1
- Admin Panel: http://localhost:3000/admin

### فولڈر سٹرکچر:
```
restaurant-qr-system/
├── server.js          ← مین سرور (Express + Socket.io)
├── package.json       ← پیکجز کی لسٹ
├── database/
│   └── data.json      ← مینو + آرڈرز کا ڈیٹا
├── public/            ← کسٹمر کا مینو پیج (Step 3)
│   └── index.html
├── admin/             ← ایڈمن ڈیش بورڈ (Step 5)
│   └── index.html
└── qr-codes/          ← QR کوڈ امیجز (Step 7)
```

### API Endpoints:
| Method | URL | کام |
|--------|-----|-----|
| GET | /api/categories | سب کیٹیگریز |
| GET | /api/menu | پورا مینو |
| GET | /api/menu/category/:id | کیٹیگری کے آئٹمز |
| GET | /api/extras/:itemId | آئٹم کے ایکسٹراز |
| POST | /api/orders | نیا آرڈر بھیجیں |
| GET | /api/orders | سب آرڈرز (ایڈمن) |
| PUT | /api/orders/:id/status | آرڈر سٹیٹس اپڈیٹ |

### اگلے سٹیپس:
- Step 2: ✅ Database (already done in Step 1!)
- Step 3: Customer Menu Page (mobile-first)
- Step 4: Order + Customization Panel
- Step 5: Admin Dashboard
- Step 6: Real-time Socket.io
- Step 7: QR Code Generation (10 tables)
- Step 8: Local WiFi Deployment
