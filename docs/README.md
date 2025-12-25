# AZZA - İş Makineleri ERP Sistemi

AZZA İş Makineleri için geliştirilmiş kapsamlı ERP (Enterprise Resource Planning) sistemi.

## 🚀 Özellikler

### ✅ Tamamlanan

- **Next.js 16** + TypeScript kurulumu
- **Tailwind CSS** ve **shadcn/ui** entegrasyonu
- **Supabase** authentication ve database kurulumu
- Kapsamlı veritabanı şeması
- Login/Signup sayfaları
- Dashboard temel yapısı

### 🔄 Geliştirme Aşamasında

- Makine yönetimi modülü
- Proforma invoice oluşturma ve PDF export
- Sevkiyat takip sistemi
- Muhasebe ve gider yönetimi
- Raporlama ve analytics

## 📋 Veritabanı Yapısı

### Ana Tablolar

1. **machines** - Makine envanteri
   - Marka, model, şase numarası
   - Durum takibi (available, reserved, in_transit, sold)
   - Satın alma bilgileri

2. **proforma_invoices** - Proforma faturalar
   - Müşteri ve makine bağlantısı
   - Fiyatlandırma ve para birimi
   - Teslimat ve ödeme koşulları
   - Banka bilgileri

3. **shipments** - Sevkiyat takibi
   - Liman bilgileri (yükleme/varış)
   - Konteyner ve nakliye şirketi
   - Durum takibi (loading → in_transit → arrived)

4. **expenses** - Giderler
   - Kategorilendirilmiş giderler
   - Fatura takibi
   - Ödeme durumu

5. **payments** - Ödemeler
   - Müşteri ödemeleri
   - Depozito takibi
   - Ödeme yöntemleri

6. **companies** - Şirketler (Müşteri/Tedarikçi)
   - İletişim bilgileri
   - Ticari detaylar

7. **bank_accounts** - Banka Hesapları
   - Çoklu para birimi desteği
   - IBAN/SWIFT bilgileri

8. **financial_summaries** - Mali Özet
   - Otomatik kar/zarar hesaplama
   - Aylık/yıllık raporlama

## 🔧 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

2. **Environment variables**
   `.env.local` dosyası zaten oluşturuldu. Supabase bilgileri mevcut.

3. **Veritabanı kurulumu**
   - Supabase Dashboard'a gidin: https://supabase.com/dashboard/project/cpmjyxecvkyfzdwsscck
   - SQL Editor'ü açın
   - `lib/database/schema.sql` dosyasının içeriğini kopyalayıp çalıştırın

4. **Development server'ı başlatın**
   ```bash
   npm run dev
   ```

5. **Tarayıcıda açın**
   http://localhost:3001

## 📁 Proje Yapısı

```
azza/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Dashboard sayfası
│   ├── login/             # Login sayfası
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Ana sayfa
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── database/         # Database schema and docs
│   │   ├── schema.sql    # Veritabanı şeması
│   │   └── README.md     # Veritabanı dokümantasyonu
│   ├── supabase/         # Supabase clients
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server client
│   │   └── middleware.ts # Middleware helper
│   └── utils.ts          # Utility functions
├── types/                 # TypeScript types
│   └── database.ts       # Database types
├── public/               # Static files
├── .env.local            # Environment variables
├── middleware.ts         # Next.js middleware
├── next.config.js        # Next.js config
├── tailwind.config.ts    # Tailwind config
└── tsconfig.json         # TypeScript config
```

## 🔐 Kimlik Doğrulama

- **Supabase Auth** kullanılıyor
- Email/Password authentication
- Row Level Security (RLS) etkin
- Middleware ile route koruması

## 💻 Teknoloji Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (önerilir)

## 📊 İş Akışı

1. **Makine Satın Alma**
   - Arabistan'da bir makine bulunur
   - Kapora verilir
   - Sisteme makine kaydı yapılır

2. **Proforma Invoice**
   - Müşteri için proforma fatura oluşturulur
   - Makine detayları, fiyat, teslimat koşulları
   - PDF olarak export edilebilir

3. **Sevkiyat**
   - Nakliye süreci başlar
   - Yükleme limanı → Varış limanı takibi
   - Her aşama kaydedilir

4. **Gider Takibi**
   - Tüm giderler kategorize edilir
   - Faturalarla eşleştirilir
   - Muhasebe raporu oluşturulur

5. **Ödeme ve Kar Hesaplama**
   - Müşteri ödemeleri kaydedilir
   - Gelen para = Satış faturası - Giderler
   - Kar/Zarar otomatik hesaplanır
   - Gelir vergisi için raporlama

## 🎯 Sonraki Adımlar

1. ✅ Temel kurulum ve veritabanı
2. 🔄 Makine yönetimi CRUD
3. ⏳ Proforma invoice form ve PDF
4. ⏳ Sevkiyat takip ekranları
5. ⏳ Gider ve muhasebe modülü
6. ⏳ Dashboard analytics
7. ⏳ Raporlama sistemi

## 📞 Destek

Sorularınız için proje dokümantasyonunu kontrol edin veya geliştirici ile iletişime geçin.

## 📄 Lisans

Bu proje AZZA İş Makineleri için özel olarak geliştirilmiştir.
