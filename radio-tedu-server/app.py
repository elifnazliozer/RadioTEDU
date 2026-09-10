
# radio-tedu backend api (flask sunucusu)
# gemini ai entegrasyonu, icecast canlı akış metaveri (now playing) okuma,
# itunes/lrclib/ovh şarkı sözleri ve renk paleti analiz servisleri

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# # .env dosyasını hem çalışılan dizinden hem de app.py'nin bulunduğu klasörden yükler
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)
load_dotenv()

app = Flask(__name__)

# production vs dev cors konfigürasyonu
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})

# çevre değişkeninden api key alma
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    print("Gemini API Key basariyla yuklendi.")
else:
    print("UYARI: GEMINI_API_KEY cevre degiskeni (.env dosyasi) bulunamadi!")


# yapay zeka yanıtının json formatında ve kısa kalmasını sağlar
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
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction=AI_SYSTEM_INSTRUCTION
)

import urllib.request
import re
import time

# canlı çalan şarkı önbelleği
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

# arama apilerinden en doğru sonucu almak için kelimeleri temizleyen fonksiyon
def clean_search_term(text):
    if not text:
        return ""
    # parantez ve köşeli parantez içlerini temizler
    cleaned = re.sub(r'[\(\]][^\)\]]*[\)\]]', '', text)
    # feat. / ft. ibarelerini temizle
    cleaned = re.sub(r'\b(feat|ft)\.?\s+.*$', '', cleaned, flags=re.I)
    return ' '.join(cleaned.split()).strip()

# itunes sonuçlarından en uygun parçayı puanlayıp seçer
def select_best_itunes_result(results, clean_song, clean_artist):
    if not results:
        return None

    def score(r):
        track_name = (r.get('trackName') or '').lower()
        artist_name = (r.get('artistName') or '').lower()
        collection_name = (r.get('collectionName') or '').lower()

        s = 0
        if clean_song and clean_song.lower() == track_name:
            s += 50
        elif clean_song and clean_song.lower() in track_name:
            s += 30

        if clean_artist and (clean_artist.lower() in artist_name or artist_name in clean_artist.lower()):
            s += 40

        # film müziği veya karma albümleri orijinal albümün arkasına atar
        if 'soundtrack' in collection_name or 'various artists' in collection_name:
            s -= 25

        # orijinal parça aranıyorsa remix versiyonları düşürür
        if clean_song and ('remix' in track_name or 'flip' in track_name) and 'remix' not in clean_song.lower():
            s -= 15

        return s

    return max(results, key=score)

# itunes'tan yüksek çözünürlüklü albüm kapağı arar ve renk paletini çıkartır
def get_artwork_and_palette(song, artist=""):
    if not song:
        return None
    cache_key = f"{artist}_{song}".lower().strip()
    if cache_key in artwork_cache:
        return artwork_cache[cache_key]

    clean_song = clean_search_term(song)
    clean_artist = clean_search_term(artist)
    term = f"{clean_artist} - {clean_song}".strip() if clean_artist and clean_song else (clean_song or song)

    # önbellek boyut kontrolü
    if len(artwork_cache) > 250:
        for old_k in list(artwork_cache.keys())[:50]:
            artwork_cache.pop(old_k, None)

    try:
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(term)}&entity=song&limit=8"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            
            # ilk arama sonuç vermezse sadece şarkı adıyla dener
            if not results and clean_song and clean_artist:
                fallback_url = f"https://itunes.apple.com/search?term={urllib.parse.quote(clean_song)}&entity=song&limit=8"
                with urllib.request.urlopen(urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=2.0) as fresp:
                    data = json.loads(fresp.read().decode('utf-8'))
                    results = data.get('results', [])

            best_match = select_best_itunes_result(results, clean_song, clean_artist)
            if best_match:
                art_hires = best_match.get('artworkUrl100', '').replace('100x100bb', '600x600bb')
                art_thumb = best_match.get('artworkUrl100', '')
                
                # küçük görsel üzerinden renk paleti çıkarır
                palette = None
                if Image is not None and art_thumb:
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
                                
                            # en canlı renk tonunu seçer
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
        if now - cached["time"] < 3:  # 3 saniye ultra hızlı gerçek zamanlı önbellek
            return jsonify(cached["data"])

    meta = None

    # 1. öncelik: doğrudan radiotedu.com resmi wordpress rest api verisi
    if station_id:
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

    # 2. öncelik: doğrudan icecast canlı yayın akış başlıkları
    if not meta:
        meta = extract_metadata_from_stream(stream_url)

    response_data = meta if meta else {
        "artist": "",
        "song": None,
        "title": None
    }

    # eğer şarkı bilgisi varsa albüm kapağını ve renk paletini zenginleştirir
    if response_data.get("song"):
        is_jingle = bool(re.search(r'^(tedu[_-]?\d*|jingle|radiotedu)$', response_data["song"], re.I))
        if not is_jingle:
            art_info = get_artwork_and_palette(response_data["song"], response_data.get("artist", ""))
            if art_info:
                # orijinal albüm kapağını genel istasyon afişlerinin önüne alır
                if art_info.get("artwork"):
                    response_data["artwork"] = art_info.get("artwork")
                response_data["palette"] = art_info.get("palette")

    now_playing_cache[cache_key] = {
        "time": now,
        "data": response_data
    }

    return jsonify(response_data)

lyrics_cache = {}

# 4 aşamalı şarkı sözü arama hattı
def fetch_lyrics_from_sources(song, artist=""):
    if not song:
        return {"lyrics": None, "error": "No song specified"}
        
    clean_song = clean_search_term(song)
    clean_artist = clean_search_term(artist)
    
    cache_key = f"{clean_artist}_{clean_song}".lower().strip()
    if cache_key in lyrics_cache:
        return lyrics_cache[cache_key]

    if re.search(r'^(tedu[_-]?\d*|jingle|radiotedu)$', clean_song, re.I):
        res = {"lyrics": None, "is_jingle": True, "message": "RadioTEDU Jingle / Tanıtım Yayını", "song": song, "artist": artist}
        lyrics_cache[cache_key] = res
        return res

    # 1. lrclib direct get
    if clean_artist and clean_song:
        try:
            url = f"https://lrclib.net/api/get?artist_name={urllib.parse.quote(clean_artist)}&track_name={urllib.parse.quote(clean_song)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'RadioTEDU-Client/1.0'})
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                lyrics = data.get('plainLyrics') or data.get('syncedLyrics')
                if lyrics:
                    if data.get('syncedLyrics') and not data.get('plainLyrics'):
                        lyrics = re.sub(r'\[\d+:\d+\.\d+\]\s*', '', lyrics)
                    res = {"lyrics": lyrics.strip(), "source": "lrclib", "song": song, "artist": artist}
                    lyrics_cache[cache_key] = res
                    return res
        except Exception:
            pass

    # 2. lrclib search query
    query_term = f"{clean_artist} {clean_song}".strip() or clean_song or song
    if query_term:
        try:
            url = f"https://lrclib.net/api/search?q={urllib.parse.quote(query_term)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'RadioTEDU-Client/1.0'})
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                results = json.loads(resp.read().decode('utf-8'))
                if results and isinstance(results, list):
                    for item in results[:3]:
                        lyrics = item.get('plainLyrics') or item.get('syncedLyrics')
                        if lyrics:
                            if item.get('syncedLyrics') and not item.get('plainLyrics'):
                                lyrics = re.sub(r'\[\d+:\d+\.\d+\]\s*', '', lyrics)
                            res = {
                                "lyrics": lyrics.strip(),
                                "source": "lrclib",
                                "song": item.get('trackName', song),
                                "artist": item.get('artistName', artist)
                            }
                            lyrics_cache[cache_key] = res
                            return res
        except Exception:
            pass

    # 3. lyrics ovh api
    if clean_artist and clean_song:
        try:
            url = f"https://api.lyrics.ovh/v1/{urllib.parse.quote(clean_artist)}/{urllib.parse.quote(clean_song)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'RadioTEDU-Client/1.0'})
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data.get('lyrics'):
                    res = {"lyrics": data['lyrics'].strip(), "source": "ovh", "song": song, "artist": artist}
                    lyrics_cache[cache_key] = res
                    return res
        except Exception:
            pass

    # 4. gemini ai fallback (yapılandırılmışsa)
    if model and api_key and (clean_song or song):
        try:
            prompt = (
                f"Provide the official lyrics for the song '{artist} - {song}'. "
                f"Output ONLY the plain lyrics text. "
                f"If lyrics are unavailable or if the song is instrumental/jingle, reply with 'NOT_FOUND'."
            )
            response = model.generate_content(prompt)
            txt = response.text.strip()
            if txt and "NOT_FOUND" not in txt and len(txt) > 20:
                res = {"lyrics": txt, "source": "ai", "song": song, "artist": artist}
                lyrics_cache[cache_key] = res
                return res
        except Exception as e:
            print("Gemini lyrics lookup error:", e)

    res = {"lyrics": None, "error": "Lyrics not found", "song": song, "artist": artist}
    lyrics_cache[cache_key] = res
    return res

# çalan şarkının sözlerini getiren endpoint
@app.route('/api/lyrics', methods=['GET'])
def lyrics():
    song = request.args.get('song', '').strip()
    artist = request.args.get('artist', '').strip()
    if not song:
        return jsonify({"lyrics": None, "error": "Song title missing"}), 400
    res = fetch_lyrics_from_sources(song, artist)
    return jsonify(res)


import concurrent.futures
import random

# gemini api key olmadığında veya bağlantı koptuğunda devreye giren şarkılar
FALLBACK_MUSIC_DATABASE = {
    "sleepy": [
        {"song": "Lofi Girl - Snowman", "msg_tr": "Yorgunluğunu ve uykunu üzerinizden alacak sakin, huzurlu tınılarla stüdyodayız. Arkana yaslan ve ritme bırak!", "msg_en": "Unwind and let these soothing lo-fi beats wash away your exhaustion. Take a deep breath!"},
        {"song": "Cigarettes After Sex - Apocalypse", "msg_tr": "Geceye veya yorgun bir ana en çok yakışan bu rüya gibi melodi seninle.", "msg_en": "A dreamy track to companion your restful moments."},
        {"song": "Joji - Glimpse of Us", "msg_tr": "Ruhunu dinlendirecek ve zihnini boşaltacak yumuşak bir melodi stüdyodan geliyor.", "msg_en": "A soft, emotional track to help you relax and recharge."},
        {"song": "Mac DeMarco - Chamber of Reflection", "msg_tr": "Kendi kabuğuna çekilip dinlenmek isteyenler için harika bir synth tınısı.", "msg_en": "Chill synth vibes to reflect and relax."},
        {"song": "Yiruma - River Flows in You", "msg_tr": "Su gibi akan pürüzsüz piyano tınılarıyla tüm yorgunluğunu geride bırak.", "msg_en": "Smooth piano melodies to wash away the day's fatigue."}
    ],
    "study": [
        {"song": "ChilledCow - Lofi Study Beats", "msg_tr": "Finaller ve odaklanma maratonu için tam frekansttayız. Zihnini tazeleyecek bu parça seninle!", "msg_en": "Locking into study mode! Here is a focused track to keep your productivity flowing."},
        {"song": "Ludovico Einaudi - Nuvole Bianche", "msg_tr": "Derin odaklanma ve ders maratonları için ilham verici piyano ezgileri.", "msg_en": "Inspiring piano melodies for deep focus and study sessions."},
        {"song": "Kiasmos - Looped", "msg_tr": "Ders çalışırken ritmini kaybetmeyeceğin minimalist ambient elektronik akış.", "msg_en": "Minimalist ambient beats to keep your mind locked in."},
        {"song": "Sufjan Stevens - Mystery of Love", "msg_tr": "Kütüphanede veya masanda çizerken/yazarken sana eşlik edecek huzurlu tınılar.", "msg_en": "Peaceful acoustic vibes for your reading and writing sessions."},
        {"song": "Massive Attack - Teardrop", "msg_tr": "Odaklanmayı artıran hipnotik bir trip-hop klasiği stüdyoda.", "msg_en": "A hypnotic classic to elevate your focus."}
    ],
    "coffee": [
        {"song": "Norah Jones - Don't Know Why", "msg_tr": "Taze kahve kokusuna eşlik eden harika bir caz tınısı seçtik. Molanın tadını çıkar!", "msg_en": "Sip your coffee and enjoy this smooth jazz vibe. You deserve this break!"},
        {"song": "Tom Misch - Disco Yes", "msg_tr": "Kahve molanı keyifli bir ritimle renklendirecek tatlı bir funk-pop parçası.", "msg_en": "A catchy funk-pop track to brighten up your coffee break!"},
        {"song": "Chet Baker - My Funny Valentine", "msg_tr": "Kolej kafesinde hissettiren nostaljik ve sıcak caz melodisi.", "msg_en": "Warm and nostalgic jazz vibes for your coffee break."},
        {"song": "Peggy Gou - It Makes You Forget", "msg_tr": "Kahveyle gelen tatlı bir enerji patlaması! Keyfini çıkar.", "msg_en": "A smooth, uplifting beat for your quick coffee reset."}
    ],
    "happy": [
        {"song": "Dua Lipa - Levitating", "msg_tr": "Pozitif enerjin stüdyoya kadar ulaştı! Modunu zirveye taşıyacak bu hit parçayla ritme katıl!", "msg_en": "Your positive energy is contagious! Turn up the volume and dance along to this hit!"},
        {"song": "Daft Punk - One More Time", "msg_tr": "Neşeni ve modunu katlayacak zamansız bir dans klasiği sizinle!", "msg_en": "A timeless dance anthem to multiply your good mood!"},
        {"song": "The Weeknd - Blinding Lights", "msg_tr": "Işıkları yak ve ritme katıl! Yüksek enerjili retro synth ritimleri stüdyomuzdan yükseliyor.", "msg_en": "High-energy synthwave beats coming straight to your speakers!"},
        {"song": "Earth, Wind & Fire - September", "msg_tr": "Yüzünü güldürecek ve modunu tavan yaptıracak saf funk enerjisi!", "msg_en": "Pure funk joy that will instantly make you smile!"},
        {"song": "Pharrell Williams - Happy", "msg_tr": "Pozitif titreşimler dalga dalga yayılıyor! Gülümse ve müziğe eşlik et.", "msg_en": "Pure positive vibrations! Smile and sing along."}
    ],
    "sad": [
        {"song": "Radiohead - High and Dry", "msg_tr": "Duygularına tercüman olacak derin bir melodi hazırladık. Yalnız değilsin, RadioTEDU seninle!", "msg_en": "A soulful melody to companion your quiet moments. You are never alone on RadioTEDU."},
        {"song": "Coldplay - The Scientist", "msg_tr": "Derin hislere ve iç döküşlere birebir dokunan zamansız bir piyano klasiği.", "msg_en": "A timeless piano classic for deep reflection."},
        {"song": "Phoebe Bridgers - Motion Sickness", "msg_tr": "Duygusal anlarına eşlik edecek harika bir indie dokunuşu.", "msg_en": "A beautiful indie track for your introspective moments."},
        {"song": "Lana Del Rey - Video Games", "msg_tr": "Nostaljik ve melankolik bir atmosfer stüdyodan odana yayılıyor.", "msg_en": "A cinematic, melancholic atmosphere coming from our studio."}
    ],
    "rock": [
        {"song": "Arctic Monkeys - Do I Wanna Know?", "msg_tr": "Gitar basları stüdyoyu sallıyor! Moduna tam uyacak bu saf rock klasiği sana gelsin.", "msg_en": "Heavy guitar riffs coming straight to your speakers! Turn it up and rock out."},
        {"song": "The Strokes - The Less I Know The Better", "msg_tr": "Akılda kalıcı gitar yürüyüşleriyle enerjiyi yükselten indie-rock rüzgarı.", "msg_en": "Catchy basslines and indie-rock grooves to turn up the volume."},
        {"song": "Red Hot Chili Peppers - Californication", "msg_tr": "Efsanevi gitar tonları ve zamansız melodiler stüdyomuzdan yükseliyor.", "msg_en": "Legendary guitar tones and timeless rock melodies."},
        {"song": "Mor ve Ötesi - Bir Derdim Var", "msg_tr": "Türkçe rock sahnesinin başyapıtlarından biriyle sesimizi yükseltiyoruz!", "msg_en": "An iconic rock masterpiece echoing from our radio tower!"},
        {"song": "Duman - Seni Kendime Sakladım", "msg_tr": "Gitar soloları ve tutkulu vokallerle kampüse ses veriyoruz!", "msg_en": "Passionate vocals and iconic guitar solos for your day."}
    ],
    "general": [
        {"song": "Beach House - Space Song", "msg_tr": "Harika bir tercih! Kampüsün havasına ve senin moduna en çok yakışan bu tını stüdyomuzdan sana geliyor.", "msg_en": "A classic vibe selected just for you. Sit back and enjoy the broadcast!"},
        {"song": "Fleetwood Mac - Dreams", "msg_tr": "Zamansız ve büyüleyici bir klasik! Radyo frekanslarımızın en sevilen parçası seninle.", "msg_en": "A timeless, enchanting classic! One of our most loved radio favorites."},
        {"song": "The XX - Intro", "msg_tr": "Stüdyomuzun imza parçalarından biri! Derin atmosferik ritimlerle anın tadını çıkar.", "msg_en": "One of our signature station tracks! Enjoy the atmospheric rhythm."},
        {"song": "Men I Trust - Show Me How", "msg_tr": "Yumuşak ve akıcı indie-pop tınılarıyla gününe tatlı bir dokunuş yapıyoruz.", "msg_en": "Smooth indie-pop melodies to add a sweet touch to your broadcast."},
        {"song": "M83 - Midnight City", "msg_tr": "Şehrin ve kampüsün ritmini yakalayan muhteşem bir synth-pop klasiği!", "msg_en": "An epic synth-pop anthem capturing the pulse of the city!"},
        {"song": "Glass Animals - Heat Waves", "msg_tr": "Çok istenen ve sevilen bu güncel parçayla yayınımıza devam ediyoruz!", "msg_en": "Continuing our broadcast with this highly requested hit!"},
        {"song": "MGMT - Kids", "msg_tr": "Gençlik enerjisini ve radyo ruhunu yansıtan efsanevi bir elektronik pop parçası!", "msg_en": "An iconic electro-pop track embodying the youthful spirit of RadioTEDU!"}
    ]
}

# dinleyicinin dilini (tr/en) otomatik tespit eden fonksiyon
def detect_language(text, default_lang='tr'):
    if not text:
        return default_lang
    text_lower = text.lower()
    tr_indicators = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'hissediyorum', 'yorgun', 'uykulu', 'ders', 'çalış', 'kahve', 'mola', 'güzel', 'mutlu', 'üzgün', 'gece', 'sabah', 'finaller', 'sınav', 'çimler', 'başka', 'baska', 'farklı', 'farkli', 'değişik', 'degisik']
    if any(ind in text_lower for ind in tr_indicators):
        return 'tr'
    en_indicators = ['feel', 'feeling', 'tired', 'sleepy', 'study', 'studying', 'coffee', 'break', 'happy', 'sad', 'good', 'great', 'finals', 'exam', 'night', 'morning', 'another', 'different', 'more', 'else']
    if any(ind in text_lower for ind in en_indicators):
        return 'en'
    return default_lang

# gemini api yoksa ya da bağlantı koparsa çalışan yerel önerici motoru
def get_smart_fallback_recommendation(user_mood, lang='tr', last_song=''):
    mood_lower = (user_mood or '').lower()
    target_lang = detect_language(user_mood, lang)

    # 1. kategori belirleme
    cat = "general"
    if any(k in mood_lower for k in ['uyku', 'yorgun', 'hissediyorum', 'dinlen', 'bitkin', 'halsiz', 'sleep', 'tired', 'exhausted', 'cozy', 'bed']):
        cat = "sleepy"
    elif any(k in mood_lower for k in ['ders', 'çalış', 'final', 'sınav', 'kütüphane', 'ödev', 'proje', 'study', 'finals', 'exam', 'focus', 'library', 'work']):
        cat = "study"
    elif any(k in mood_lower for k in ['kahve', 'çay', 'mola', 'dinlenme', 'coffee', 'tea', 'break', 'relax']):
        cat = "coffee"
    elif any(k in mood_lower for k in ['mutlu', 'enerji', 'keyif', 'dans', 'parti', 'harika', 'süper', 'güneş', 'happy', 'energetic', 'dance', 'good', 'great', 'party', 'sun']):
        cat = "happy"
    elif any(k in mood_lower for k in ['üzgün', 'kırgın', 'dram', 'yalnız', 'efkar', 'hüzün', 'sad', 'lonely', 'heartbreak', 'blue', 'cry']):
        cat = "sad"
    elif any(k in mood_lower for k in ['rock', 'gitar', 'metal', 'alternatif', 'indie', 'guitar']):
        cat = "rock"

    # kullanıcı alternatif istekte bulunduysa
    is_asking_another = any(k in mood_lower for k in ['başka', 'baska', 'farklı', 'farkli', 'değişik', 'degisik', 'bir tane daha', 'diğer', 'diger', 'yeniden', 'yine', 'another', 'different', 'more', 'else', 'next'])

    pool = list(FALLBACK_MUSIC_DATABASE.get(cat, FALLBACK_MUSIC_DATABASE["general"]))
    if is_asking_another or cat == "general":
        extended_pool = []
        for c_items in FALLBACK_MUSIC_DATABASE.values():
            extended_pool.extend(c_items)
        pool = extended_pool

    # son önerilen şarkıyı havuzdan çıkarır aynı şarkı üst üste gelmesin
    if last_song:
        filtered_pool = [item for item in pool if item["song"].lower() != last_song.lower()]
        if filtered_pool:
            pool = filtered_pool

    selected = random.choice(pool)
    msg = selected["msg_tr"] if target_lang == 'tr' else selected["msg_en"]
    
    return {
        "song": selected["song"],
        "message": msg
    }

# ruh haline göre ai dj önerisi sunan endpoint
@app.route('/api/ai-director', methods=['POST'])
def ai_director():
    try:
        data = request.get_json() or {}
        user_mood = (data.get('mood') or '').strip()[:200]  # maksimum 200 karakter sınırı
        lang = (data.get('lang') or 'tr').strip().lower()
        last_song = (data.get('last_song') or '').strip()
        if lang not in ['tr', 'en']:
            lang = 'tr'
        
        target_lang = detect_language(user_mood, lang)

        if not user_mood:
            fallback_msg = "Please share your mood or activity with us!" if target_lang == 'en' else "Lütfen ruh halini bizimle paylaş!"
            return jsonify({"song": "RadioTEDU", "message": fallback_msg})

        # gemini api key tanımlıysa dene
        if api_key and model:
            prompt = (
                f"Listener input: '{user_mood}'. "
                f"Current interface language: '{lang}'. "
                f"LANGUAGE DIRECTIVE: Analyze the language of the listener's input ('{user_mood}'). "
                f"1. If the listener's message is in English (e.g. 'tired, finals again', 'coffee break', 'happy'), the DJ message MUST be in English. "
                f"2. If the listener's message is in Turkish, the DJ message MUST be in Turkish. "
                f"3. If the language of the message is ambiguous, use the interface language ('{lang}'). "
                f"Never reply in Turkish to an English query. "
                f"CRITICAL: Do NOT recommend the song '{last_song}' if provided! Recommend a DIFFERENT song! "
                f"Provide a fitting song (Artist - Title) and a warm, punchy 1-2 sentence DJ shout-out."
            )
            
            def call_gemini():
                try:
                    return model.generate_content(prompt)
                except Exception as model_err:
                    print("Primary model error, trying fallback:", model_err)
                    fallback_model = genai.GenerativeModel(
                        model_name="gemini-1.5-pro",
                        generation_config=generation_config,
                        system_instruction=AI_SYSTEM_INSTRUCTION
                    )
                    return fallback_model.generate_content(prompt)

            # 6sn timeout ile dene
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(call_gemini)
                try:
                    response = future.result(timeout=6.0)
                    raw_text = response.text.strip()
                    match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                    if match:
                        json_str = match.group(0)
                        result = json.loads(json_str)
                    else:
                        result = json.loads(raw_text)

                    if isinstance(result, dict) and result.get("song") and result.get("message"):
                        return jsonify(result)
                except Exception as api_err:
                    print("Gemini API call or parsing error:", api_err)

        # api yoksa ya da hata aldıysa yerel önericiyi çalıştırır
        fallback_result = get_smart_fallback_recommendation(user_mood, target_lang, last_song)
        return jsonify(fallback_result)

    except Exception as e:
        print("Hata:", str(e).encode("ascii", errors="ignore").decode("ascii"))
        fallback_result = get_smart_fallback_recommendation(user_mood, lang, last_song)
        return jsonify(fallback_result)

# prod ortamında client dist klasörünü sunan fallback
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
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "True").lower() in ["true", "1"]
    app.run(host="0.0.0.0", port=port, debug=debug)