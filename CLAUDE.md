# SubGuard — Claude Çalışma Rehberi

## Proje Özeti

SubGuard, abonelik yönetim uygulamasıdır.
- **Backend:** .NET 7 ASP.NET Core Web API
- **Frontend:** React Native (Expo SDK 50)
- **Veritabanı:** PostgreSQL + EF Core 7
- **Auth:** ASP.NET Core Identity + JWT + RefreshToken rotasyonu

---

## Klasör Yapısı

```
SubGuard/
├── SubGuard.API/          # Controller'lar, Middleware, Program.cs
├── SubGuard.Core/         # Entity, DTO, Interface, Enum
├── SubGuard.Data/         # DbContext, Repository, Migration
├── SubGuard.Service/      # Business logic, Validator, Mapper, Servis
└── SubGuardApp/           # React Native / Expo frontend
    ├── App.tsx
    └── src/
        ├── api/           # agent.ts (Axios istek katmanı)
        ├── components/    # Yeniden kullanılabilir bileşenler
        ├── constants/     # theme.ts, colors
        ├── screens/       # Her sayfa bir dosya
        ├── store/         # Zustand store'ları
        ├── types/         # TypeScript tipleri
        └── utils/         # Yardımcı fonksiyonlar
```

---

## Mimari & Kural Notları

### Backend Katman Kuralları
- Controller → Service Interface → Service Implementation → Repository → DbContext
- Service katmanı her zaman `CustomResponseDto<T>` döner (hata kodu + mesaj birlikte)
- Repository sadece `IGenericRepository<T>` kullanır; özel sorgu varsa `IQueryable` + Specification pattern
- Tüm entity'ler `BaseEntity` (Id, CreatedDate, UpdatedDate, IsDeleted) kalıtır
- Global query filter: `IsDeleted == false` (soft delete)
- Tüm tarihler **UTC** olarak saklanır

### Kimlik Doğrulama
- JWT token süresi kısa (15 dk), RefreshToken süresi uzun (7 gün)
- Token rotasyonu: refresh çağrısında eski token geçersiz kalır, yeni çift üretilir
- Controller'da kullanıcı ID her zaman `User.FindFirstValue(ClaimTypes.NameIdentifier)` ile alınır, body'den asla alınmaz
- Rate limiting: `auth` policy tüm auth endpoint'lerine uygulanmıştır

### Frontend Kuralları
- State yönetimi: **Zustand** store'ları (`useUserSubscriptionStore`, `useCatalogStore`, vb.)
- API istekleri sadece `src/api/agent.ts` üzerinden yapılır (Axios instance)
- Tema sistemi: `useThemeColors()` hook'u dark/light mode destekler — inline renk kullanma
- Tüm ekranlar `SafeAreaView` + `StatusBar` ile başlar
- Navigation: Tab (Ana) + Stack (Auth) ayrımı `App.tsx`'te yapılır

### Bilinen İsimlendirme / Klasör Hataları
- `SubGuard.Service/Services/Decarators/` → doğrusu `Decorators/` (klasör adı yanlış, kod çalışıyor)
- Bazı Data katmanı namespace'lerde `SabGuard` yazım hatası var (düzeltilmeli)

---

## Önemli Servisler

| Servis | Açıklama |
|--------|----------|
| `UserSubscriptionService` | CRUD, paylaşım, kullanım geçmişi |
| `DashboardService` | Özet metrikler, yaklaşan ödemeler, bütçe |
| `NotificationService` | Kuyruk yönetimi, push/e-posta gönderimi |
| `CurrencyService` | Frankfurter API entegrasyonu, in-memory cache |
| `CachedCatalogService` | Decorator pattern ile katalog cache |
| `AuthService` | Register, Login |
| `TokenService` | JWT + RefreshToken yönetimi |
| `UserProfileService` | Profil güncelleme, şifre değişimi, hesap silme |

---

## Bilinen Teknik Borçlar

### Kritik
- `appsettings.json` içinde hardcoded DB şifresi ve JWT anahtarı → environment variable'a taşınmalı
- `GetSharedWithMeAsync` tüm paylaşımlı abonelikleri RAM'e yüklüyor, büyük veri setlerinde sorun olur
- `UpdateSubscriptionAsync` 204 dönerken `CustomResponseDto<bool>` tipi kullanıyor — tutarsız
- Kayıt sırasında e-posta doğrulama yok

### Orta
- `SharedWithJson` ve `UsageHistoryJson` JSON kolon anti-pattern; ilişkisel tabloya dönüştürülmeli
- Bütçe aşım bildirimi yok (MonthlyBudget alanı var, trigger yok)
- `CatalogService` pagination in-memory yapıyor (DB'de olmalı)
- Kontrat sona erme hatırlatması yok (HasContract/ContractEndDate alanları var)

### Düşük
- API versioning yok
- Unit / integration test yok
- `DELETE /auth/me` mevcut JWT token'ları iptal etmiyor
- Admin endpoint'leri kısıtlı: katalog/plan CRUD eksik doğrulamalar

---

## Geliştirme Ortamı

### Backend
```bash
cd SubGuard.API
dotnet run
# Varsayılan port: 5000 (appsettings.json veya launchSettings.json'da)
```

### Frontend
```bash
cd SubGuardApp
npx expo start
# iOS: i  |  Android: a  |  Web: w
```

### Veritabanı Migrations
```bash
cd SubGuard.API
dotnet ef migrations add <MigrationName> --project ../SubGuard.Data
dotnet ef database update
```

---

## Sık Yapılan Hatalar (Geçmiş Oturumlardan)

1. **Controller'da body'den userId alma** — her zaman token'dan al (`LoggedInUserId` property)
2. **Inline renk kullanma** — `useThemeColors()` hook'unu kullan, dark mode bozulur
3. **Servis katmanında direkt DbContext kullanma** — repository + unit of work pattern'e uy
4. **Transaction başlatmayı unutma** — kritik işlemlerde `BeginTransactionAsync` / `CommitTransactionAsync` / `RollbackTransactionAsync` şarttır
5. **Sayfalama parametrelerini validate etme** — page ≥ 1, pageSize 1–100 arası olmalı
6. **Frontend'de doğrudan API URL yazma** — her zaman `agent.ts` objesi üzerinden çağır

---

## Test Notları

- Şu an otomatik test yok
- Manuel test: Swagger UI `http://localhost:5000/swagger`
- Push notification testi: Expo Go uygulaması gerektirir
- E-posta testi: SMTP ayarları `appsettings.json`'da yapılandırılmalı

---

## Güvenlik Hatırlatmaları

- Asla `appsettings.json`'daki secretları commit etme
- CORS policy production'da kısıtlı olmalı (`AllowAnyOrigin` sadece dev)
- Rate limiting `auth` policy tüm auth endpoint'lerinde aktif — kaldırma
- Refresh token rotation'u bozma — eski token'ı geçersiz kılma adımı kritik

---

## Dil & Kod Stili

- Backend: C# (Turkish yorum satırları kabul edilir, değişken isimleri İngilizce)
- Frontend: TypeScript/TSX (Turkish UI metinleri normal, kod İngilizce)
- Commit mesajları: Türkçe veya İngilizce (proje geçmişine bak)
- Ekranlardaki metin: Türkçe (kullanıcıya gösterilen her şey)
