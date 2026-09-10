# RadioTEDU
RadioTEDU, üniversite radyosu yayınlarını ve yapay zeka destekli AI Müzik Direktörünü bir araya getiren modern bir web uygulamasıdır.
---
## Uygulama Hakkında 
- **Canlı Radyo & Tematik Kanallar:** Ana yayının yanında Rock, Jazz, Retro gibi moduna göre dinleyebileceğin tematik kanallar.
- **Podcastler & Son Bölümler:** Stüdyodan çıkan orijinal podcast serilerini ve en yeni bölümleri doğrudan oynatabilme.
- **AI Müzik Direktörü (Gemini AI):** O anki modunu veya ne yaptığını (örneğin *"final haftasındayım ders çalışıyorum"* ya da *"kahve molası"*) yazıyorsun; yapay zeka sana özel müzik öneriyor. Ayrıca çalan şarkıların sözlerini (lyrics) anlık getiriyor.
- **Retro Vintage Konsol & Analog VU Meter:** Nostaljik frekans kadranı, müzikle beraber hareket eden gerçek zamanlı analog VU meter ibresi ve vinil çalar estetiği.
- **Kampüs Duvarı (Campus Wall):** Yayını dinlerken diğer öğrencilerle mesajlaşabileceğin ve şarkı isteği paylaşabileceğin canlı pano.
- **Yayın Akışı Widget'ı:** Hangi saatte hangi programın yayında olduğunu gösteren canlı akış rehberi.
- **Koyu/Aydınlık Tema & Çift Dil:** Tek tıkla gece/gündüz teması ve Türkçe / İngilizce dil seçeneği.
---
## Ön Gereksinimler
Projenin sorunsuz çalışabilmesi için bilgisayarınızda aşağıdakilerin yüklü olması gerekir:
- **Node.js**: (v18.0 veya üzeri) -> [nodejs.org](https://nodejs.org/)
- **Python**: (v3.9 veya üzeri) -> [python.org](https://www.python.org/)
- **Git**: [git-scm.com](https://git-scm.com/)
## Adım Adım Kurulum Rehberi

---

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/elifnazliozer/RadioTEDU.git
cd RadioTEDU
```

---

### 2. Backend (Sunucu) Kurulumu

Backend servisi Python ve Flask ile geliştirilmiştir.

```bash
cd radio-tedu-server

# (Opsiyonel ama Tavsiye Edilen) Python Sanal Ortamı (venv) Oluşturun
python -m venv venv

# Sanal Ortamı Aktifleştirin
# Windows (PowerShell):
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Bağımlılıkları Yükleyin
pip install -r requirements.txt

# Çevre Değişkenleri (.env) Dosyasını Oluşturun
# Windows (PowerShell):
copy .env.example .env
# Linux / macOS:
cp .env.example .env
```

**Önemli (API Anahtarı Ekleme):**
`.env` dosyasını bir metin düzenleyici ile açın ve [Google AI Studio](https://aistudio.google.com/) üzerinden ücretsiz alacağınız kendi Gemini API anahtarınızı ekleyin:
```env
GEMINI_API_KEY=kendi_gemini_api_anahtariniz
```

Backend sunucusunu başlatın:
```bash
python app.py
```
*(Sunucu varsayılan olarak `http://localhost:5000` adresinde çalışacaktır.)*

---

### 3. Frontend (Arayüz) Kurulumu

Frontend React + Vite + Tailwind CSS ile geliştirilmiştir.

Yeni bir terminal penceresinde projenin kök dizinine gelin ve:
```bash
cd radio-tedu-client

# Bağımlılıkları yükleyin
npm install

# Geliştirici sunucusunu başlatın
npm run dev
```

---

### 4. Uygulamaya Erişin
Arayüz sunucusu başladıktan sonra tarayıcınızda aşağıdaki adrese gidin:
**`http://localhost:5173`**

---

## Güvenlik Notu
Güvenlik standartları gereği kişisel API anahtarları `.env` dosyası içerisinde tutulur ve `.gitignore` ile korunur. Kod içerisine kesinlikle sabit API anahtarı eklenmez.
