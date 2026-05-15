📊 Portföy Yöneticisi
Kişisel yatırım portföyünüzü takip edebileceğiniz full-stack web uygulaması. Altın, döviz, kripto, hisse senedi ve fon işlemlerinizi kayıt altına alın, toplam yatırım tutarınızı ve ortalama maliyetlerinizi görün.
🛠️ Teknolojiler

Frontend: Vanilla JavaScript (SPA)
Backend: Node.js + Express
Veritabanı: SQLite (better-sqlite3)
API Dökümantasyon: Swagger UI
Test: Jest

📁 Proje Yapısı
portfolio-manager/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── db.js                    # Veritabanı bağlantısı ve tablo oluşturma
│   │   ├── routes/
│   │   │   ├── assets.js                # Varlık endpoint'leri
│   │   │   └── transactions.js          # İşlem endpoint'leri
│   │   ├── services/
│   │   │   ├── assetService.js          # Varlık business logic
│   │   │   └── transactionService.js    # İşlem business logic
│   │   └── app.js                       # Ana uygulama
│   ├── tests/
│   │   └── transactionService.test.js
│   └── package.json
└── frontend/
    ├── index.html
    └── app.js
🚀 Kurulum ve Çalıştırma
Gereksinimler

Node.js v18 veya üzeri

Adımlar

Repoyu klonlayın:

bashgit clone https://github.com/KULLANICI_ADI/portfolio-manager.git
cd portfolio-manager

Bağımlılıkları yükleyin:

bashcd backend
npm install

Sunucuyu başlatın:

bashnpm start

Tarayıcıda açın:

http://localhost:3000
🧪 Testleri Çalıştırma
bashcd backend
npm test
Çıktı:
Tests: 9 passed, 9 total
📡 API Kullanımı
Swagger UI
Tüm endpoint'leri interaktif olarak test etmek için:
http://localhost:3000/api-docs
Endpoint'ler
Varlıklar
MethodURLAçıklamaGET/api/assetsTüm varlıkları listeleGET/api/assets/:idTek varlık getirPOST/api/assetsYeni varlık oluşturPUT/api/assets/:idVarlık güncelleDELETE/api/assets/:idVarlık sil
İşlemler
MethodURLAçıklamaGET/api/transactionsTüm işlemleri listeleGET/api/transactions?type=ALTINTipe göre filtreleGET/api/transactions?asset_id=1Varlığa göre filtrelePOST/api/transactionsYeni işlem eklePUT/api/transactions/:idİşlem güncelleDELETE/api/transactions/:idİşlem sil
Portföy
MethodURLAçıklamaGET/api/portfolio/summaryToplam portföy özeti
Örnek İstekler
Yeni varlık oluştur:
bashPOST /api/assets
Content-Type: application/json

{
  "name": "Gram Altın",
  "type": "ALTIN",
  "unit": "gram"
}
Yeni işlem ekle:
bashPOST /api/transactions
Content-Type: application/json

{
  "asset_id": 1,
  "quantity": 5,
  "buy_price": 4250,
  "date": "2026-05-15",
  "notes": "Maaştan aldım"
}
🗄️ Veritabanı Modeli
Assets (Varlıklar)
AlanTipAçıklamaidINTEGERPrimary keynameTEXTVarlık adıtypeTEXTALTIN/DOVIZ/KRIPTO/HISSE/FONunitTEXTBirim (gram, adet vb.)created_atTEXTOluşturma tarihi
Transactions (İşlemler)
AlanTipAçıklamaidINTEGERPrimary keyasset_idINTEGERForeign key → AssetsquantityREALMiktarbuy_priceREALAlış fiyatı (TL)dateTEXTİşlem tarihinotesTEXTOpsiyonel not
✅ Değerlendirme Kriterleri Karşılama

CRUD: Assets ve Transactions için tam CRUD
Kod Kalitesi: Business logic route'lardan ayrı, services/ katmanında
REST API: Standart HTTP metodları, uygun status kodları, JSON format
Swagger: Tüm endpoint'ler belgelenmiş, /api-docs adresinde
Test: 9 unit test, Jest ile
Versiyon Kontrol: Git + GitHub