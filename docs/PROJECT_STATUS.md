# AZZA ERP - Proje Durumu

**Son Güncelleme:** 2025-11-16

## ✅ Tamamlanan İşler

### 1. Temel Kurulum
- ✅ Next.js 16 + TypeScript + Tailwind CSS
- ✅ shadcn/ui component library
- ✅ Supabase client (browser & server)
- ✅ Authentication middleware
- ✅ Environment variables (.env.local)

### 2. Veritabanı
- ✅ Kapsamlı database schema (schema.sql)
- ✅ TypeScript type definitions
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers (updated_at)
- ✅ Database documentation

**Tablolar:**
- `profiles` - Kullanıcı profilleri
- `companies` - Müşteri/Tedarikçi şirketler
- `bank_accounts` - Banka hesapları
- `machines` - Makine envanteri
- `proforma_invoices` - Proforma faturalar
- `shipments` - Sevkiyat takibi
- `expenses` - Gider kayıtları
- `payments` - Ödeme kayıtları
- `financial_summaries` - Mali özet/raporlama

### 3. Authentication
- ✅ Login/Signup sayfaları
- ✅ Email/Password authentication
- ✅ Protected routes (middleware)
- ✅ Auth callback handler
- ✅ Logout functionality

### 4. Dashboard
- ✅ Modern dashboard layout (shadcn)
- ✅ Sidebar navigation
- ✅ Stats cards (real-time data)
- ✅ Recent activity widgets
- ✅ Quick action buttons
- ✅ Responsive design

### 5. MCP Server
- ✅ Supabase MCP configured
- ✅ Ready for advanced database operations

## 🔄 Devam Eden İşler

### Machine Management Module
**Durum:** Başlanacak
**İçerik:**
- Makine listesi sayfası
- Makine detay sayfası
- Makine ekleme formu
- Makine düzenleme formu
- Makine arama ve filtreleme
- Görsel yükleme

## ⏳ Yapılacaklar

### 1. Proforma Invoice System
- Form tasarımı (example.pdf'e göre)
- Müşteri seçimi
- Makine seçimi
- Fiyatlandırma ve para birimi
- Teslimat koşulları
- Banka hesabı seçimi
- PDF oluşturma ve export
- Depozito takibi

### 2. Shipments Module
- Sevkiyat listesi
- Sevkiyat detayları
- Liman takibi (loading → destination)
- Durum güncellemeleri
- Timeline görünümü
- Konteyner bilgileri

### 3. Expenses Module
- Gider ekleme formu
- Gider kategorileri
- Fatura yükleme
- Ödeme durumu takibi
- Proforma ile ilişkilendirme

### 4. Companies Module
- Müşteri/Tedarikçi listesi
- Şirket detayları
- İletişim bilgileri
- Şirket ekleme/düzenleme

### 5. Accounting/Reports
- Mali özet dashboard
- Kar/Zarar raporları
- Aylık/Yıllık raporlar
- Gelir vergisi hesaplamaları
- Export to Excel/PDF

### 6. Settings & Configuration
- Banka hesapları yönetimi
- Kullanıcı profil ayarları
- Sistem ayarları

## 🚀 Nasıl Başlatılır?

### 1. Veritabanını Kurun
```bash
# Supabase Dashboard'a gidin
https://supabase.com/dashboard/project/cpmjyxecvkyfzdwsscck

# SQL Editor → New Query
# lib/database/schema.sql dosyasını kopyalayın ve çalıştırın
```

### 2. Development Server
```bash
npm run dev
```

### 3. Tarayıcıda Açın
```
http://localhost:3001
```

### 4. İlk Kullanıcı Oluşturun
- Login sayfasından "Kayıt Ol" butonuna tıklayın
- Email ve şifre ile kayıt olun
- Email'inizi onaylayın (Supabase email)
- Giriş yapın

## 📁 Proje Yapısı

```
azza/
├── app/
│   ├── dashboard/          # Dashboard ve alt modüller
│   │   ├── machines/      # Makine yönetimi
│   │   ├── invoices/      # Proforma invoice
│   │   ├── shipments/     # Sevkiyat
│   │   ├── expenses/      # Giderler
│   │   ├── layout.tsx     # Dashboard layout
│   │   └── page.tsx       # Dashboard ana sayfa
│   ├── login/             # Login sayfası
│   ├── auth/              # Auth callbacks
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── layout/            # Layout components
│   ├── ui/                # shadcn/ui components
│   ├── app-sidebar.tsx    # Sidebar navigation
│   ├── site-header.tsx    # Header component
│   └── ...                # Other components
├── lib/
│   ├── database/
│   │   ├── schema.sql     # Database schema
│   │   └── README.md      # DB documentation
│   ├── supabase/
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── middleware.ts  # Auth middleware
│   └── utils.ts           # Utility functions
├── types/
│   └── database.ts        # TypeScript types
├── .env.local             # Environment variables
└── middleware.ts          # Next.js middleware
```

## 🔐 Güvenlik

- Row Level Security (RLS) etkin
- Authenticated users only
- HTTPS enforcement
- Secure cookie handling
- XSS protection

## 📊 Veritabanı İlişkileri

```
machines → proforma_invoices (1:N)
companies → proforma_invoices (1:N)
bank_accounts → proforma_invoices (1:N)
proforma_invoices → shipments (1:N)
proforma_invoices → expenses (1:N)
proforma_invoices → payments (1:N)
proforma_invoices → financial_summaries (1:1)
```

## 🎯 Öncelikli Görevler

1. **Makine Yönetimi** - CRUD operations
2. **Proforma Invoice** - Form + PDF generation
3. **Sevkiyat Takibi** - Logistics tracking
4. **Gider Yönetimi** - Expense tracking
5. **Raporlama** - Financial reports

## 📝 Notlar

- Veritabanı şeması tamamen hazır
- Authentication çalışıyor
- Dashboard gerçek verilerle çalışıyor
- MCP server yapılandırılmış
- Tüm TypeScript types tanımlı

## 🐛 Bilinen Sorunlar

- Middleware deprecation warning (Next.js 16)
  - "proxy" kullanımına geçilecek
- Port 3000 kullanımda, 3001'e yönlendirme

## 📞 Yardım

Herhangi bir sorun için:
1. README.md dosyasını kontrol edin
2. lib/database/README.md - Veritabanı kurulumu
3. PROJECT_STATUS.md (bu dosya) - Mevcut durum
