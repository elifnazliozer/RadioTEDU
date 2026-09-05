from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# .env dosyasını hem çalışılan dizinden hem de app.py'nin bulunduğu klasörden yükle
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)
load_dotenv()

app = Flask(__name__)
CORS(app)

# Environment Variable'dan API key alma
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    print("Gemini API Key basariyla yuklendi.")
else:
    print("UYARI: GEMINI_API_KEY cevre degiskeni (.env dosyasi) bulunamadi!")


generation_config = {
    "temperature": 0.7,
    "max_output_tokens": 500,
    "response_mime_type": "application/json",
}

AI_SYSTEM_INSTRUCTION = (
    "You are RadioTEDU's cool, friendly, empathetic college radio AI Music Director (like KEXP / BBC Radio 6).\n"
    "Recommend a fitting real song (Artist - Title) and a warm, concise DJ shout-out for the listener's mood or activity.\n"
    "CRITICAL RULES:\n"
    "1. LANGUAGE: Respond in the user's language! If the user query is in English OR if requested interface language is 'en', the DJ message MUST be written in English. If the user query is in Turkish OR if requested interface language is 'tr', write in Turkish.\n"
    "2. LENGTH: Keep the DJ message short, punchy, and conversational (exactly 1-2 natural sentences, max 30 words). Never write long paragraphs.\n"
    "3. FORMAT: Output MUST be valid JSON with keys: {\"song\": \"Artist - Title\", \"message\": \"DJ Message\"}."
)

model = genai.GenerativeModel(
    model_name="gemini-3.5-flash-lite",
    generation_config=generation_config,
    system_instruction=AI_SYSTEM_INSTRUCTION
)

import urllib.request
import re
import time

# Canlı çalan şarkı önbelleği
now_playing_cache = {}

STATION_MAP = {
    "radiotedu-main": "https://stream.radiotedu.com/radio",
    "radiotedu-classic": "https://stream.radiotedu.com/classic",
    "radiotedu-jazz": "https://stream.radiotedu.com/cazz",
    "radiotedu-lofi": "https://stream.radiotedu.com/lofi",
    "radiotedu-rock": "https://stream.radiotedu.com/rock",
    "radiotedu-spark": "https://stream.radiotedu.com/energize",
    "radiotedu-energize": "https://stream.radiotedu.com/energize",
}

def extract_metadata_from_stream(stream_url):
    """Icecast akışındaki Icy-MetaData başlıklarından ve baytlarından o an çalan şarkıyı okur."""
    try:
        req = urllib.request.Request(
            stream_url,
            headers={
                "Icy-MetaData": "1",
                "User-Agent": "RadioTEDU-Client/1.0"
            }
        )
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            metaint = int(resp.headers.get("icy-metaint", 0))
            if metaint > 0:
                resp.read(metaint)
                meta_len_byte = resp.read(1)
                if meta_len_byte:
                    meta_len = ord(meta_len_byte) * 16
                    if meta_len > 0:
                        raw_meta = resp.read(meta_len).decode("utf-8", errors="ignore")
                        match = re.search(r"StreamTitle='(.*?)';", raw_meta)
                        if match:
                            full_title = match.group(1).strip()
                            if full_title:
                                if " - " in full_title:
                                    parts = full_title.split(" - ", 1)
                                    return {
                                        "artist": parts[0].strip(),
                                        "song": parts[1].strip(),
                                        "title": full_title
                                    }
                                return {
                                    "artist": "",
                                    "song": full_title,
                                    "title": full_title
                                }
    except Exception as e:
        print(f"Stream metadata extraction error for {stream_url}: {e}")
    return None

import io
import urllib.parse
try:
    from PIL import Image
except ImportError:
    Image = None

artwork_cache = {}

def clean_search_term(text):
    if not text:
        return ""
    # Parantez ve köşeli parantez içlerini temizle (örn. (Official Video), [Radio Edit], (Live), (Remastered))
    cleaned = re.sub(r'[\(\[][^\)\]]*[\)\]]', '', text)
    # feat. / ft. ibarelerini temizle
    cleaned = re.sub(r'\b(feat|ft)\.?\s+.*$', '', cleaned, flags=re.I)
    # Fazla noktalama işaretlerini ve boşlukları sadeleştir
    cleaned = re.sub(r'[\-_/|]+', ' ', cleaned)
    return ' '.join(cleaned.split()).strip()

def get_artwork_and_palette(song, artist=""):
    if not song:
        return None
    cache_key = f"{artist}_{song}".lower().strip()
    if cache_key in artwork_cache:
        return artwork_cache[cache_key]

    # Şarkı veya sanatçı adındaki gereksiz parantezleri ve ekleri temizleyip aramayı netleştir
    clean_song = clean_search_term(song)
    clean_artist = clean_search_term(artist)
    term = f"{clean_artist} {clean_song}".strip() or song

    # Önbellek boyut kontrolü (bellek şişmesini önle)
    if len(artwork_cache) > 250:
        for old_k in list(artwork_cache.keys())[:50]:
            artwork_cache.pop(old_k, None)

    try:
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(term)}&entity=song&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            
            # İlk arama sonuç vermezse sadece şarkı adıyla dene
            if not data.get('results') and clean_song and clean_artist:
                fallback_url = f"https://itunes.apple.com/search?term={urllib.parse.quote(clean_song)}&entity=song&limit=1"
                with urllib.request.urlopen(urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=2.0) as fresp:
                    data = json.loads(fresp.read().decode('utf-8'))

            if data.get('results'):
                r = data['results'][0]
                art_hires = r.get('artworkUrl100', '').replace('100x100bb', '600x600bb')
                art_thumb = r.get('artworkUrl100', '')
                
                # Küçük görsel üzerinden mikrosaniyeler içinde renk paleti çıkar
                palette = None
                if Image is not None:
                    try:
                        with urllib.request.urlopen(urllib.request.Request(art_thumb, headers={'User-Agent': 'Mozilla/5.0'}), timeout=1.5) as aresp:
                            img = Image.open(io.BytesIO(aresp.read())).convert('RGB')
                            img = img.resize((32, 32))
                            pixels = list(img.getdata())
                            n = len(pixels)
                            avg_r = sum(p[0] for p in pixels) // n
                            avg_g = sum(p[1] for p in pixels) // n
                            avg_b = sum(p[2] for p in pixels) // n
                            
                            colors = img.getcolors(32 * 32)
                            colors.sort(key=lambda x: x[0], reverse=True)
                            dom_r, dom_g, dom_b = colors[0][1]
                            
                            def sat(red, grn, blu):
                                mx, mn = max(red, grn, blu), min(red, grn, blu)
                                return (mx - mn) / (mx if mx > 0 else 1)
                                
                            # En canlı renk tonunu seç
                            vibrant = max(colors[:25], key=lambda c: sat(*c[1]) * (c[0] ** 0.5))[1]
                            palette = {
                                "dominant": f"#{dom_r:02x}{dom_g:02x}{dom_b:02x}",
                                "vibrant": f"#{vibrant[0]:02x}{vibrant[1]:02x}{vibrant[2]:02x}",
                                "rgb": [dom_r, dom_g, dom_b],
                                "vibrant_rgb": list(vibrant),
                                "avg_rgb": [avg_r, avg_g, avg_b]
                            }
                    except Exception as pe:
                        print("Palette calculation error:", pe)

                result = {
                    "artwork": art_hires,
                    "palette": palette
                }
                artwork_cache[cache_key] = result
                return result
    except Exception as e:
        print(f"iTunes artwork lookup error for {term}: {e}")

    return None

@app.route('/api/now-playing', methods=['GET'])
def now_playing():
    station_id = request.args.get('station', 'radiotedu-main')
    stream_url = request.args.get('stream_url', '')

    if not stream_url:
        stream_url = STATION_MAP.get(station_id, "https://stream.radiotedu.com/radio")

    now = time.time()
    cache_key = station_id or stream_url
    if cache_key in now_playing_cache:
        cached = now_playing_cache[cache_key]
        if now - cached["time"] < 10:  # 10 saniye önbellek
            return jsonify(cached["data"])

    # 1. Öncelik: Doğrudan Icecast canlı akış metaverisi
    meta = extract_metadata_from_stream(stream_url)

    # 2. İkincil Öncelik: RadioTEDU WordPress REST API
    if not meta and station_id:
        try:
            api_url = f"https://radiotedu.com/wp-json/radiotedu/v1/stations/{station_id}/live"
            req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data.get('track'):
                    meta = {
                        "artist": data.get('artist') or "",
                        "song": data.get('track'),
                        "title": f"{data.get('artist')} - {data.get('track')}" if data.get('artist') else data.get('track'),
                        "artwork": data.get('artwork_url')
                    }
        except Exception:
            pass

    response_data = meta if meta else {
        "artist": "",
        "song": None,
        "title": None
    }

    # Eğer şarkı bilgisi varsa, albüm kapağını ve renk paletini bul
    if response_data.get("song"):
        is_jingle = bool(re.search(r'^(tedu[_-]?\d*|jingle|radiotedu)$', response_data["song"], re.I))
        if not is_jingle:
            art_info = get_artwork_and_palette(response_data["song"], response_data.get("artist", ""))
            if art_info:
                response_data["artwork"] = art_info.get("artwork")
                response_data["palette"] = art_info.get("palette")

    now_playing_cache[cache_key] = {
        "time": now,
        "data": response_data
    }

    return jsonify(response_data)

@app.route('/api/ai-director', methods=['POST'])
def ai_director():
    try:
        data = request.get_json() or {}
        user_mood = (data.get('mood') or '').strip()
        lang = (data.get('lang') or 'tr').strip().lower()
        
        if not user_mood:
            fallback_msg = "Please share your mood or activity with us!" if lang == 'en' else "Lütfen ruh halini bizimle paylaş!"
            return jsonify({"song": "RadioTEDU", "message": fallback_msg})

        prompt = (
            f"Listener input: '{user_mood}'. "
            f"Current interface language: '{lang}'. "
            f"LANGUAGE DIRECTIVE: Analyze the language of the listener's input ('{user_mood}'). "
            f"1. If the listener's message is in English (e.g. 'tired, finals again', 'coffee break', 'happy'), the DJ message MUST be in English. "
            f"2. If the listener's message is in Turkish, the DJ message MUST be in Turkish. "
            f"3. If the language of the message is ambiguous, use the interface language ('{lang}'). "
            f"Never reply in Turkish to an English query. "
            f"Provide a fitting song (Artist - Title) and a warm, punchy 1-2 sentence DJ shout-out."
        )
        
        try:
            response = model.generate_content(prompt)
        except Exception as model_err:
            print("Primary model error, trying fallback:", model_err)
            fallback_model = genai.GenerativeModel(
                model_name="gemini-3.5-flash",
                generation_config=generation_config,
                system_instruction=AI_SYSTEM_INSTRUCTION
            )
            response = fallback_model.generate_content(prompt)

        raw_text = response.text.strip()
        
        # Regex ile JSON objesini çıkar ({ ... })
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            result = json.loads(json_str)
        else:
            result = json.loads(raw_text)

        return jsonify(result)

    except Exception as e:
        print("Hata:", str(e).encode("ascii", errors="ignore").decode("ascii"))
        error_msg = (
            "The AI DJ experienced a brief static burst, but the broadcast continues!"
            if lang == 'en' else
            "Yapay zeka müziği sezerken minik bir frekans kopması yaşadı, ama yayın devam ediyor!"
        )
        return jsonify({
            "song": "RadioTEDU",
            "message": error_msg
        })

CLIENT_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'radio-tedu-client', 'dist'))

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_client(path):
    if path.startswith('api/'):
        return jsonify({"error": "API route not found"}), 404
    if path and os.path.exists(os.path.join(CLIENT_DIST, path)):
        return send_from_directory(CLIENT_DIST, path)
    if os.path.exists(os.path.join(CLIENT_DIST, 'index.html')):
        return send_from_directory(CLIENT_DIST, 'index.html')
    return jsonify({
        "status": "RadioTEDU Backend API Active",
        "frontend": "http://localhost:5173",
        "endpoints": ["/api/now-playing", "/api/ai-director"]
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)