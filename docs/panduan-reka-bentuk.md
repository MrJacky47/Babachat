# Panduan reka bentuk

## Fon

| Kegunaan | Fon | Berat |
|---|---|---|
| Tajuk, nombor besar | **Baloo 2** | 700–800 |
| Teks biasa, butang | **Lexend** | 400–600 |

## Warna utama

| Nama | Kod | Kegunaan |
|---|---|---|
| Dakwat | `#2E2238` | Teks utama, garis tepi butang |
| Ungu tua | `#5B3570` | Pautan, menu aktif |
| Kelabu ungu | `#5C4F63` | Teks kecil |
| Kuning matahari | `#FFE27A` → `#FFB020` | Butang utama, kad "Jom teroka" |
| Merah bantuan | `#FF5A4E` → `#C0221A` | Butang Saya Perlukan Bantuan |

Warna petak menu (kecerunan atas → bawah, kemudian warna garis tepi):

| Petak | Kecerunan | Garis tepi |
|---|---|---|
| Pendidikan | `#3BE3C8` → `#0B8F86` | `#065C56` |
| Sembang | `#FF9BD0` → `#D62A80` | `#8E1553` |
| Permainan | `#B58CFF` → `#6326D9` | `#3D1690` |
| Analisis | `#FFD95A` → `#F08A00` | `#9A5200` |

## Mod malam

| Unsur | Kod |
|---|---|
| Latar kad | `#1C2148` |
| Teks | `#EDEBFA` |
| Teks kecil | `#B8B3D9` |
| Kad utama (hero) | `#3A3F9E` → `#1E1D5C`, tajuk `#FFE27A` |
| Langit | `#090A2A` → `#1B1A52` |

Tukar mod melalui suis matahari/bulan di skrin Utama.

## Bentuk

- **Petak menu:** `border-radius: 34px 18px 30px 22px / 26px 30px 20px 32px`
- **Butang:** `border-radius: 22px 12px 22px 12px`
- **Garis tepi:** 3px `#2E2238` dengan bayang pejal di bawah (contoh `box-shadow: 0 5px 0 #2E2238`)
- **Kilauan:** jalur cahaya bergerak merentasi butang setiap 4 saat
- **Tekstur:** corak titik pada petak, jalur serong pada kad utama, butiran halus pada latar

## Latar setiap skrin (`assets/images/`)

| Fail | Skrin |
|---|---|
| `latar-utama-siang.webp` | Utama, Intro |
| `latar-pagi.webp` | Skrin tajuk, Semakan umur, Profil, Ganjaran |
| `latar-belajar.webp` | Pendidikan, Video |
| `latar-senja.webp` | Permainan, Kuiz, BabaCard, Simulasi, Menang |
| `latar-petang-gelap.webp` | Sembang, Kalah |
| `latar-bantuan-merah.webp` | Saya Perlukan Bantuan |
| `latar-ungu-twilight.webp` | Analisis, Tetapan, Almari |
| `latar-malam-bandar.webp` | Semua skrin dalam mod malam |

## Animasi Baba

| Fail | Bila digunakan |
|---|---|
| `baba-idle` | Sembang (sedia menunggu) |
| `baba-bercakap` | Sembang, Pendidikan, Video, Profil |
| `baba-lompat` | Menang; apabila Baba diketuk di Sembang |
| `baba-angguk` / `baba-geleng` | Jawapan betul / salah (Kuiz, BabaCard, Simulasi) |
| `baba-menangis` | Kalah |
| `baba-berfikir` | Semakan umur, BabaCard, Pendidikan |
| `baba-waspada` / `baba-terkejut` | Amaran dan tanda bahaya |
| `baba-lambai` | Utama, Intro, skrin tajuk |
| `baba-usap` / `baba-telinga` / `baba-geletek` / `baba-ekor` | Sembang: usap kepala, ketuk telinga, ketuk kaki, ketuk ekor |
| `baba-pusing.webp` | Memusingkan Baba di Sembang (24 bingkai dalam satu baris) |
| `baba-detektif-*` | Analisis Baba (topi detektif, tidak boleh ditukar) |
| `baba-polis-*` | Saya Perlukan Bantuan dan notifikasi bahaya (topi polis, tidak boleh ditukar) |
| `topi/baba-topi-*.webp` (angguk) | Almari Baba, Utama |
| `topi/baba-topi-*-idle`, `-bercakap`, `-lompat`, `-waspada`, `-berfikir`, `-angguk`, `-usap`, `-telinga`, `-geletek`, `-ekor` | Sembang, apabila Baba memakai topi |
| `topi/baba-topi-*-pusing.webp` | Sembang, Baba bertopi berpusing (24 bingkai) |

Semua animasi Baba dirender pada skala yang sama dengan tepi licin (anti-alias). Saiz paparan dikira daripada tinggi badan Baba (330 piksel dalam fail), jadi Baba tidak mengecil apabila animasi bertukar. Maklumat saiz ada dalam `data/baba-animasi.json`.

## Muzik (`assets/audio/muzik/`)

Semua lagu MP3 128 kbps mono, kekuatan bunyi diseragamkan (-16 LUFS) supaya tiada lagu yang terlalu kuat apabila bertukar skrin.

| Fail | Skrin | Ulang |
|---|---|---|
| `01-tema-baba.mp3` | Intro, skrin tajuk | Ya |
| `02-savana-pagi.mp3` | Utama | Ya |
| `03-belajar-bersama.mp3` | Pendidikan, Video | Ya |
| `04-kuiz-pantas.mp3` | Kuiz Pantas | Ya |
| `05-babacard-santai.mp3` | BabaCard | Ya |
| `06-simulasi.mp3` | Simulasi grooming | Ya |
| `07-detektif-baba.mp3` | Analisis Baba | Ya |
| `08-baba-ada-di-sini.mp3` | Saya Perlukan Bantuan | Ya |
| `09-bandar-malam.mp3` | Mod malam | Ya |
| `10-menang.mp3` | Skrin Menang | Sekali |
| `11-cuba-lagi.mp3` | Skrin Kalah | Sekali |

## Suara Baba (`assets/audio/suara-baba/`)

| Fail | Bila dimainkan |
|---|---|
| `baba-bual-1` hingga `baba-bual-6` | Setiap huruf atau perkataan dalam dialog RPG Baba (pilih secara rawak) |
| `baba-bual-gembira`, `-sedih`, `-terkejut`, `-berfikir` | Dialog mengikut perasaan Baba |
| `baba-ciri-khas`, `baba-ketawa`, `baba-ingin-tahu` | Apabila Baba diketuk |
| `baba-tenang`, `baba-ciap`, `baba-hidu` | Baba berehat (idle) di Sembang |
| `baba-gembira` | Jawapan betul, Menang |
| `baba-sedih` | Jawapan salah, Kalah |
| `baba-terkejut` | Tanda bahaya dikesan |
| `baba-amaran` | Notifikasi bahaya |

## Bunyi butang (`assets/audio/bunyi-ui/`)

| Fail | Bila dimainkan |
|---|---|
| `bunyi-ketik.mp3` | Menekan butang |
| `bunyi-dialog.mp3` | Teks dialog muncul |
| `bunyi-betul.mp3` / `bunyi-salah.mp3` | Jawapan betul / salah |
| `bunyi-amaran-bahaya.mp3` | Amaran bahaya |
| `bunyi-menang.mp3` | Menang, dapat lencana |
| `bunyi-notifikasi.mp3` | Notifikasi baharu |
| `bunyi-lompat.mp3` | Baba melompat |

Senarai lengkap dan skrin bagi setiap bunyi ada dalam `data/audio.json`.
