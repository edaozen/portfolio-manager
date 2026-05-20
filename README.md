# 📊 Portföy Yöneticisi

 Portföy Yöneticisi, kişisel yatırım portföyünüzü takip edebileceğiniz bir web uygulamasıdır. Kullanıcı kaydı ve girişi ile her kullanıcı kendi verilerini yönetir. Altın, döviz, kripto, hisse senedi ve fon alış/satış işlemlerini kayıt altına alın, kar/zarar hesaplamalarını ve portföy dağılımınızı görün.

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
│   │   │   └── db.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── assets.js
│   │   │   └── transactions.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── assetService.js
│   │   │   └── transactionService.js
│   │   ├── middleware.js
│   │   └── app.js
│   ├── tests/
│   │   ├── authService.test.js
│   │   ├── assetService.test.js
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
# veya PowerShell'de script hatası alırsanız:
node src/app.js
```

>  Veritabanı (`portfolio.db`) ilk çalıştırmada otomatik olarak oluşturulur.

**4. Tarayıcıda açın:**
```
http://localhost:3000
```

---

## Kimlik Doğrulama (JWT)

**Kayıt:** `http://localhost:3000/register`

**Giriş:** `http://localhost:3000/login`

- Her kullanıcı yalnızca kendi varlık ve işlemlerini görebilir
- Şifreler bcrypt ile hashlenerek saklanır
- Token 24 saat geçerlidir

---

## Testleri Çalıştırma

```bash
cd backend
npm test
```

Beklenen çıktı:
```
Test Suites: 3 passed, 3 total
Tests:       26 passed, 26 total
```

---

## API Kullanımı

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
| DELETE | `/api/assets` | Tüm varlıkları ve işlemleri sil |

### İşlemler (Transactions)
| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/transactions` | Tüm işlemleri listele |
| GET | `/api/transactions?type=ALTIN` | Tipe göre filtrele |
| GET | `/api/transactions?transaction_type=ALIS` | Alış/Satış filtrele |
| POST | `/api/transactions` | Yeni alış veya satış ekle |
| PUT | `/api/transactions/:id` | İşlem güncelle |
| DELETE | `/api/transactions/:id` | İşlem sil |
| DELETE | `/api/transactions` | Tüm işlemleri sil |

### Portföy
| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/portfolio/summary` | Toplam portföy özeti |

---

## Kar/Zarar Hesabı

Her varlık için ayrı hesaplanır:

```
Ortalama Maliyet = Toplam Alış Tutarı / Toplam Alınan Miktar
Kar/Zarar = (Satış Fiyatı - Ortalama Maliyet) × Satılan Miktar
```

---

## Veritabanı Modeli

### Users
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Primary key |
| username | TEXT | Kullanıcı adı (unique) |
| password | TEXT | Bcrypt ile hashlenmiş |
| created_at | TEXT | Kayıt tarihi |

### Assets
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key → Users |
| name | TEXT | Varlık adı |
| type | TEXT | ALTIN/DOVIZ/KRIPTO/HISSE/FON |
| unit | TEXT | Birim |
| created_at | TEXT | Oluşturma tarihi |

### Transactions
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key → Users |
| asset_id | INTEGER | Foreign key → Assets |
| transaction_type | TEXT | ALIS veya SATIS |
| quantity | REAL | Miktar |
| buy_price | REAL | Alış fiyatı (alışta dolu) |
| sell_price | REAL | Satış fiyatı (satışta dolu) |
| date | TEXT | İşlem tarihi |
| notes | TEXT | Opsiyonel not |

---
