# AZZA ERP - Kurulum Rehberi

## ✅ Tamamlanan Adımlar

1. ✅ Next.js projesi kuruldu
2. ✅ Supabase entegrasyonu yapıldı
3. ✅ Database schema oluşturuldu
4. ✅ Örnek veriler eklendi
5. ✅ Login/Signup UI hazır

## 🔧 Supabase Ayarları (ÖNEMLİ!)

### Email Confirmation'ı Devre Dışı Bırakma (Development)

1. **Supabase Dashboard'a gidin:**
   ```
   https://supabase.com/dashboard/project/cpmjyxecvkyfzdwsscck
   ```

2. **Authentication > Settings**

3. **Email Auth Settings** bölümünde:
   - ✅ **Enable Email Confirmations** → **KAPATIN** (development için)
   - ✅ **Enable Email Change Confirmations** → **KAPATIN**
   - ✅ **Secure Email Change** → **KAPATIN**

4. **Save** butonuna tıklayın

### Alternatif: Manuel Email Confirmation

Eğer email confirmation'ı açık tutmak isterseniz, yeni kullanıcıları manuel onaylamak için:

```sql
-- Kullanıcıyı onaylama
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'kullanici@email.com';
```

## 🚀 Sistemi Çalıştırma

### 1. Development Server

```bash
npm run dev
```

Server başladı: http://localhost:3001

### 2. İlk Giriş

**Test Kullanıcısı:**
```
Email: test@gmail.com
Şifre: 123456**
```

**Yeni Kullanıcı Kaydı:**
- http://localhost:3001/login sayfasına gidin
- "Kayıt Ol" butonuna tıklayın
- Email ve şifre girin
- Kayıt olduktan sonra otomatik giriş yapılacak

## 📊 Veritabanı Trigger'ları

Aşağıdaki trigger otomatik olarak çalışıyor:

**`handle_new_user()`** - Yeni kullanıcı kaydı olduğunda:
1. `auth.users` tablosuna kullanıcı eklenir (Supabase Auth)
2. Trigger otomatik olarak `profiles` tablosuna profil oluşturur
3. Varsayılan rol: `'user'`
4. İsim: Email'den otomatik oluşturulur

## 🔍 Sorun Giderme

### "Database error saving new user" Hatası

**Çözüm:**
1. Supabase Dashboard'da Email Confirmation'ı devre dışı bırakın (yukarıdaki adımlar)
2. Browser cache'i temizleyin
3. Sayfayı yenileyin ve tekrar deneyin

### Trigger Çalışmıyor

Trigger'ın çalışıp çalışmadığını kontrol edin:

```sql
-- Trigger var mı?
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Function var mı?
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

### Profil Oluşturulmadı

Manuel profil oluşturma:

```sql
INSERT INTO profiles (id, full_name, email, role)
VALUES (
  'USER_UUID_BURAYA',
  'Kullanıcı Adı',
  'email@example.com',
  'user'
);
```

## 📋 Örnek Veriler

Sistemde halihazırda şu veriler mevcut:

- **4 Şirket** (2 müşteri, 2 tedarikçi)
- **3 Banka Hesabı** (TRY, USD, EUR)
- **5 Makine** (Caterpillar, Komatsu, Volvo, JCB, Hitachi)
- **3 Proforma Invoice**
- **2 Sevkiyat**
- **5 Gider**
- **3 Ödeme**

## 🎯 Sonraki Adımlar

1. Email confirmation'ı devre dışı bırakın
2. Yeni bir kullanıcı kaydı yapın
3. Dashboard'u inceleyin
4. Modülleri geliştirmeye başlayın:
   - Makine yönetimi
   - Proforma invoice oluşturma
   - Sevkiyat takibi
   - Muhasebe raporları

## ⚠️ Production Notları

**Production'a geçerken:**
- Email confirmation'ı tekrar **AÇIN**
- SMTP ayarlarını yapılandırın
- Email template'lerini özelleştirin
- RLS policy'lerini gözden geçirin
- Environment variables'ı güvence altına alın

## 📞 Yardım

Herhangi bir sorun için:
1. `PROJECT_STATUS.md` - Proje durumu
2. `README.md` - Genel bilgiler
3. `CLAUDE.md` - Teknik dokümantasyon
