# RadioTEDU - Flutter Mobil Uygulama Master Blueprint (Mimarî Rehber)

Bu döküman, RadioTEDU web projesinde geliştirilen tüm mimariyi, radyo frekanslarını, API uçlarını, tasarım sistemini ve durum yönetimini Flutter mobil projesine 1-e-1 aktarmak için hazırlanmış **ana başvuru kaynağıdır**. Yeni projede yapay zeka ajanına bu dosyayı okutmanız tüm hafızayı eksiksiz yüklemesini sağlayacaktır.

---

## 1. Canlı Radyo Akışları (Icecast Streams)

Uygulamanın `just_audio` veya `audio_service` ile çalacağı Icecast akış linkleri:

| İstasyon | ID | Akış URL | Tür / Açıklama |
| :--- | :--- | :--- | :--- |
| **RadioTEDU Ana Yayın** | `radiotedu-main` | `https://stream.radiotedu.com/radio` | Karma Üniversite Yayını (Hit, Pop, Indie) |
| **Classic TEDU** | `radiotedu-classic` | `https://stream.radiotedu.com/classic` | Klasik Müzik & Enstrümantal (Çalışma / Odak) |
| **Jazz & Blues** | `radiotedu-jazz` | `https://stream.radiotedu.com/cazz` | Caz, Soul, Blues |
| **Lo-Fi Study Beats** | `radiotedu-lofi` | `https://stream.radiotedu.com/lofi` | Lo-Fi Hip Hop, Chillhop (Ders / Gece) |
| **Rock & Alternative** | `radiotedu-rock` | `https://stream.radiotedu.com/rock` | Rock, Alternative, Indie Rock |
| **Energize / Pop** | `radiotedu-energize` | `https://stream.radiotedu.com/energize` | Yüksek Enerji, Elektronik, Pop |

---

## 2. Backend API Sözleşmeleri (Flask Sunucusu)

Mobil uygulama, mevcut Python Flask sunucumuz (`http://localhost:5000` veya canlı sunucu IP/Domain) ile haberleşir:

### A. Canlı Şarkı Bilgisi & Albüm Kapağı (`GET /api/now-playing`)
* **İstek**: `GET /api/now-playing?station=radiotedu-main&stream_url=https://stream.radiotedu.com/radio`
* **İşlev**: Icecast akışının `Icy-MetaData` başlığından canlı parça adını okur, Apple iTunes Search API üzerinden yüksek çözünürlüklü (600x600) albüm kapağını bulur ve kapaktan renk paletini çıkarır.
* **Yanıt Formatı (JSON)**:
```json
{
  "artist": "Futuristic",
  "song": "Not Enough (The Rise)",
  "title": "Futuristic - Not Enough (The Rise)",
  "artwork": "https://is1-ssl.mzstatic.com/.../600x600bb.jpg",
  "palette": {
    "dominant": "#ffffff",
    "vibrant": "#f1d1aa",
    "rgb": [255, 255, 255],
    "vibrant_rgb": [241, 209, 170],
    "avg_rgb": [193, 184, 171]
  }
}
```

### B. Gemini 3.5 AI Müzik Direktörü (`POST /api/ai-director`)
* **İstek**: `POST /api/ai-director`
* **Gövde (Body)**:
```json
{
  "mood": "yarınki vizeler için enerjiye ihtiyacım var",
  "lang": "tr"
}
```
* **İşlev**: Gemini 3.5 Flash Lite modeli kullanıcının ruh halini ve dilini analiz eder, tam 1-2 cümlelik samimi bir DJ anonsu ve şarkı önerisi üretir.
* **Yanıt Formatı (JSON)**:
```json
{
  "song": "Queen - Don't Stop Me Now",
  "message": "Vizeler seni durduramaz! Şimdi sesi aç ve bu enerjiyle dersin başına geç."
}
```

---

## 3. Flutter İçin Önerilen Paketler (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Ses Oynatma & Arka Plan (Kilit Ekranı / Bluetooth)
  just_audio: ^0.9.40
  audio_service: ^0.18.16
  audio_session: ^0.1.21

  # Ağ & API
  http: ^1.2.2

  # Görsel & Dinamik Renk Çıkarma
  palette_generator: ^0.3.3+4
  cached_network_image: ^3.4.1

  # Durum Yönetimi
  provider: ^6.1.2

  # Animasyonlar & UI
  flutter_animate: ^4.5.0
  google_fonts: ^6.2.1
  url_launcher: ^6.3.0       # Spotify doğrudan arama bağlantısı için
  shared_preferences: ^2.3.2 # Ses düzeyi ve dil tercihi kaydetme
```

---

## 4. Mobil Özelinde Kritik Fonksiyonlar & Mimarî

### 1. Arka Planda Çalma (Background Playback & Lock Screen)
- Android için `AndroidManifest.xml`'e `FOREGROUND_SERVICE` ve `WAKE_LOCK` izinleri.
- iOS için `Info.plist`'e `UIBackgroundModes: [audio]` eklenmelidir.
- `audio_service` ile kilit ekranında:
  - Canlı çalan parça adı & sanatçı
  - iTunes'dan gelen yüksek çözünürlüklü albüm kapağı
  - Oynat / Durdur / İstasyon Değiştir butonları gösterilir.

### 2. Dinamik Plak & Arkaplan Renk Geçişi
- Albüm kapağı geldiğinde `palette_generator` ile baskın ve canlı renk çıkarılır.
- Arka plan degradeli renk geçişi (AnimatedContainer / LinearGradient) albüm kapağının tonlarına yumuşakça bürünür.
- Çalan şarkı sırasında dönen plak animasyonu (`AnimationController` ile continuous rotation).

### 3. Çift Dil Desteği (TR / EN)
- Web'deki `LanguageContext.jsx` sözlüğü:
  - TR: "TEDÜ'nün Özgür Sesi", "Yapay Zeka Müzik Direktörü", "Şimdi Çalıyor", "Bağlanıyor..."
  - EN: "The Free Voice of TEDU", "AI Music Director", "Now Playing", "Connecting..."

### 4. Görsel Varlıklar (Assets)
Web projesinden kopyalanacak görseller:
- `logo_light.png` (Açık mod logosu)
- `logo_dark.png` (Koyu mod logosu)
- `radioTedu_logo.png` (İkon / App ikonu)

---

## 5. Klasör Mimarisi Önerisi (`lib/`)

```text
lib/
├── main.dart
├── models/
│   ├── track.dart
│   └── station.dart
├── providers/
│   ├── audio_provider.dart    (just_audio & audio_service sarmalayıcısı)
│   ├── theme_provider.dart    (Dark / Light mode)
│   └── language_provider.dart (TR / EN dil seçimi)
├── services/
│   ├── api_service.dart       (now-playing ve ai-director çağrıları)
│   └── audio_handler.dart     (AudioService arka plan kontrolü)
├── screens/
│   ├── home_screen.dart       (Ana çalar, plak & istasyon listesi)
│   └── ai_director_sheet.dart (AI Müzik Direktörü sohbet penceresi)
└── widgets/
    ├── vinyl_player.dart      (Dönen plak & albüm kapağı)
    ├── station_card.dart      (Alt istasyonlar)
    └── mini_player.dart       (Aşağı kaydırıldığında yapışkan mini bar)
```
