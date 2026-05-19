# 📊 Portföy Yöneticisi

 Portföy Yöneticisi, kişisel yatırım portföyünüzü takip edebileceğiniz full-stack web uygulamasıdır. Kullanıcı kaydı ve girişi ile her kullanıcı kendi verilerini yönetir. Altın, döviz, kripto, hisse senedi ve fon işlemlerinizi kayıt altına alır, toplam yatırım tutarınızı ve ortalama maliyetlerinizi görür.

---

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Vanilla JavaScript (SPA) |
| Backend | Node.js + Express |
| Veritabanı | SQLite (better-sqlite3) |
| Kimlik Doğrulama | JWT (jsonwebtoken + bcryptjs) |
| API Dökümantasyon | Swagger UI |
| Test | Jest |

---

## Proje Yapısı

```
portfolio-manager/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── db.js                 # Veritabanı ve tablo oluşturma
│   │   ├── routes/
│   │   │   ├── auth.js               # Register/Login endpoint'leri
│   │   │   ├── assets.js             # Varlık endpoint'leri
│   │   │   └── transactions.js       # İşlem endpoint'leri
│   │   ├── services/
│   │   │   ├── authService.js        # JWT business logic
│   │   │   ├── assetService.js       # Varlık business logic
│   │   │   └── transactionService.js # İşlem business logic
│   │   ├── middleware.js             # JWT doğrulama middleware
│   │   └── app.js                    # Ana uygulama
│   ├── tests/
│   │   ├── authService.test.js
│   │   └── transactionService.test.js
│   └── package.json
└── frontend/
    ├── index.html
    ├── login.html
    ├── register.html
    └── app.js
```

---

## Kurulum ve Çalıştırma

### Gereksinimler

- Node.js v18 veya üzeri

### Adımlar

**1. Repoyu klonlayın:**

```bash
git clone https://github.com/edaozen/portfolio-manager.git
cd portfolio-manager
```

**2. Bağımlılıkları yükleyin:**

```bash
cd backend
npm install
```

**3. Sunucuyu başlatın:**

```bash
npm start
```

**4. Tarayıcıda açın:**

```
http://localhost:3000
```

---

## Kimlik Doğrulama (JWT)

Uygulama JWT tabanlı kimlik doğrulama kullanır.

**Kayıt:** `http://localhost:3000/register`

**Giriş:** `http://localhost:3000/login`

- Her kullanıcı yalnızca kendi varlık ve işlemlerini görebilir
- Şifreler bcrypt ile hashlenerek saklanır
- Token 24 saat geçerlidir
- Çıkış yapıldığında token silinir

---

## Testleri Çalıştırma

```bash
cd backend
npm test
```

Beklenen çıktı:

```
Test Suites: 2 passed, 2 total
Tests: 14 passed, 14 total
```

---

## 📡 API Kullanımı

Swagger UI: `http://localhost:3000/api-docs`

### Auth

| Method | URL | Açıklama |
|--------|-----|----------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Giriş, token döner |

### Varlıklar (Assets)

| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/assets` | Tüm varlıkları listele |
| GET | `/api/assets/:id` | Tek varlık getir |
| POST | `/api/assets` | Yeni varlık oluştur |
| PUT | `/api/assets/:id` | Varlık güncelle |
| DELETE | `/api/assets/:id` | Varlık sil |

### İşlemler (Transactions)

| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/transactions` | Tüm işlemleri listele |
| GET | `/api/transactions?type=ALTIN` | Tipe göre filtrele |
| GET | `/api/transactions?asset_id=1` | Varlığa göre filtrele |
| POST | `/api/transactions` | Yeni işlem ekle |
| PUT | `/api/transactions/:id` | İşlem güncelle |
| DELETE | `/api/transactions/:id` | İşlem sil |

### Portföy

| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/portfolio/summary` | Toplam portföy özeti |

---

## Veritabanı Modeli

### Users

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Primary key |
| username | TEXT | Kullanıcı adı (unique) |
| password | TEXT | Bcrypt ile hashlenmiş şifre |
| created_at | TEXT | Kayıt tarihi |

### Assets

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key → Users |
| name | TEXT | Varlık adı |
| type | TEXT | ALTIN / DOVIZ / KRIPTO / HISSE / FON |
| unit | TEXT | Birim (gram, adet vb.) |
| created_at | TEXT | Oluşturma tarihi |

### Transactions

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key → Users |
| asset_id | INTEGER | Foreign key → Assets |
| quantity | REAL | Miktar |
| buy_price | REAL | Alış fiyatı (TL) |
| date | TEXT | İşlem tarihi |
| notes | TEXT | Opsiyonel not |

---
