# 📻 RadioTEDU

RadioTEDU, üniversite radyosu yayınlarını ve yapay zeka destekli AI Müzik Direktörünü bir araya getiren modern bir web uygulamasıdır.

---

## 🛠️ Kurulum ve Çalıştırma Rehberi

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayabilirsiniz:

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

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Environment Variables (.env) Dosyasını Oluşturun
# .env.example dosyasının bir kopyasını oluşturup adını .env yapın
# Windows (PowerShell):
copy .env.example .env
# Linux / macOS:
cp .env.example .env
```

📌 **Önemli (API Key Ekleme):**
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

Frontend React + Vite ile geliştirilmiştir.

Yeni bir terminal penceresinde:
```bash
cd radio-tedu-client

# Bağımlılıkları yükleyin
npm install

# Geliştirici sunucusunu başlatın
npm run dev
```
*(Arayüz varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.)*

---

## 🔒 Güvenlik Notu
Güvenlik standartları gereği kişisel API anahtarları `.env` dosyası içerisinde tutulur ve `.gitignore` ile korunur. Kod içerisine kesinlikle sabit API anahtarı eklenmez.
