# 📊 Portföy Yöneticisi

Kişisel yatırım portföyünüzü takip edebileceğiniz full-stack web uygulaması. Altın, döviz, kripto, hisse senedi ve fon işlemlerinizi kayıt altına alın, toplam yatırım tutarınızı ve ortalama maliyetlerinizi görün.

---

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Vanilla JavaScript (SPA) |
| Backend | Node.js + Express |
| Veritabanı | SQLite (better-sqlite3) |
| API Dökümantasyon | Swagger UI |
| Test | Jest |

---

## 📁 Proje Yapısı

```
portfolio-manager/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── db.js                 # Veritabanı bağlantısı ve tablo oluşturma
│   │   ├── routes/
│   │   │   ├── assets.js             # Varlık endpoint'leri
│   │   │   └── transactions.js       # İşlem endpoint'leri
│   │   ├── services/
│   │   │   ├── assetService.js       # Varlık business logic
│   │   │   └── transactionService.js # İşlem business logic
│   │   └── app.js                    # Ana uygulama
│   ├── tests/
│   │   └── transactionService.test.js
│   └── package.json
└── frontend/
    ├── index.html
    └── app.js
```

---

## 🚀 Kurulum ve Çalıştırma

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

## 🧪 Testleri Çalıştırma

```bash
cd backend
npm test
```

Beklenen çıktı:

```
Tests: 9 passed, 9 total
```

---

## 📡 API Kullanımı

### Swagger UI

Tüm endpoint'leri interaktif olarak test etmek için:

```
http://localhost:3000/api-docs
```

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

## 📝 Örnek İstekler

**Yeni varlık oluştur:**

```json
POST /api/assets
Content-Type: application/json

{
  "name": "Gram Altın",
  "type": "ALTIN",
  "unit": "gram"
}
```

**Yeni işlem ekle:**

```json
POST /api/transactions
Content-Type: application/json

{
  "asset_id": 1,
  "quantity": 5,
  "buy_price": 4250,
  "date": "2026-05-15",
  "notes": "Maaştan aldım"
}
```

---

## 🗄️ Veritabanı Modeli

### Assets (Varlıklar)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Primary key |
| name | TEXT | Varlık adı |
| type | TEXT | ALTIN / DOVIZ / KRIPTO / HISSE / FON |
| unit | TEXT | Birim (gram, adet vb.) |
| created_at | TEXT | Oluşturma tarihi |

### Transactions (İşlemler)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Primary key |
| asset_id | INTEGER | Foreign key → Assets |
| quantity | REAL | Miktar |
| buy_price | REAL | Alış fiyatı (TL) |
| date | TEXT | İşlem tarihi |
| notes | TEXT | Opsiyonel not |

---

## ✅ Değerlendirme Kriterleri

| Kriter | Karşılanma |
|--------|-----------|s
| CRUD Tamlığı | Assets ve Transactions için tam CRUD |
| Kod Kalitesi | Business logic route'lardan ayrı, `services/` katmanında |
| REST API | Standart HTTP metodları, uygun status kodları, JSON format |
| Swagger | Tüm endpoint'ler belgelenmiş, `/api-docs` adresinde |
| Test | 9 unit test, Jest ile — `npm test` |
| Versiyon Kontrol | Git + GitHub |