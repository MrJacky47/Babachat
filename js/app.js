/* Baba Chat · aplikasi utama
   Kumpulan 10 · Kerja Sosial UniSZA
   Kandungan dibaca daripada folder data/ (lihat docs/). Kod ini hanya memaparkannya. */
(() => {
'use strict';

/* =========================================================
   1. Alat kecil
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const todayStr = (d = new Date()) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

/* =========================================================
   2. Simpanan (localStorage, hanya dalam pelayar kanak-kanak)
   ========================================================= */
const store = {
  get(k, d) { try { const v = localStorage.getItem('babachat.' + k); return v ? JSON.parse(v) : d; } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem('babachat.' + k, JSON.stringify(v)); } catch (_) { /* mod peribadi: abaikan */ } }
};
const DEF_KEMAJUAN = { bintang: 0, lencana: [], topi: 'tiada', kiraan: { kuiz: 0, kuizSempurna: 0, kad: 0, sim: 0, analisis: 0, infografik: [], sembang: 0 }, hari: { akhir: null, berturut: 0 } };
const S = {
  profil: store.get('profil', null),
  tetapan: Object.assign({ muzik: true, bunyi: true, suara: true, gelap: false, volMuzik: 0.55, setuju: false }, store.get('tetapan', {})),
  kemajuan: (() => { const k = store.get('kemajuan', {}); return Object.assign({}, DEF_KEMAJUAN, k, { kiraan: Object.assign({}, DEF_KEMAJUAN.kiraan, k.kiraan || {}), hari: Object.assign({}, DEF_KEMAJUAN.hari, k.hari || {}) }); })()
};
const save = () => { store.set('profil', S.profil); store.set('tetapan', S.tetapan); store.set('kemajuan', S.kemajuan); };

/* =========================================================
   3. Data (folder data/)
   ========================================================= */
const D = {};
async function loadData() {
  const files = { sembang: 'data/qna-sembang.json', main: 'data/qna-permainan.json', info: 'data/qna-infografik.json', analisis: 'data/qna-analisis.json', audio: 'data/audio.json', anim: 'data/baba-animasi.json' };
  await Promise.all(Object.entries(files).map(async ([k, f]) => {
    const r = await fetch(f, { cache: 'no-cache' });
    if (!r.ok) throw new Error(f);
    D[k] = await r.json();
  }));
  Chat.prepare(D.sembang.soalan);
}
// senario simulasi (fail besar): dimuat hanya apabila skrin Simulasi dibuka
async function loadSim() {
  if (D.sim) return D.sim;
  const r = await fetch('data/qna-simulasi-senario.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error('data/qna-simulasi-senario.json');
  D.sim = await r.json();
  return D.sim;
}

/* =========================================================
   4. Aset
   ========================================================= */
const A = {
  baba: (n) => 'assets/baba/baba-' + n + '.webp',
  topi: (n) => 'assets/baba/topi/baba-topi-' + n + '.webp',
  topiIkon: (n) => 'assets/baba/topi/ikon-topi-' + n + '.png',
  topiAnim: (n, st) => 'assets/baba/topi/baba-topi-' + n + '-' + st + '.webp',
  topiPusing: (n) => 'assets/baba/topi/baba-topi-' + n + '-pusing.png',
  ikon: (n) => 'assets/icons/ikon-' + n + '.svg',
  avatar: (n) => 'assets/avatars/avatar-' + n + '.svg',
  latar: (n) => 'assets/images/latar-' + n + '.webp',
  logo: 'assets/images/logo-babachat-512.png',
  logoUnisza: 'assets/images/logo-unisza.png'
};
// Semua animasi Baba dirender pada skala yang sama. Saiz paparan dikira daripada tinggi badan Baba (tanpa topi),
// supaya Baba tidak mengecil atau membesar apabila animasi bertukar.
const TOPI_SET = { beanie: 'beanie', besbol: 'cap', songkok: 'songkok', parti: 'party', mahkota: 'crown' };
const BADAN = 330; // tinggi badan Baba (piksel) dalam fail animasi
const setOf = (state) => (!state ? 'none' : state.startsWith('detektif-') ? 'detective' : state.startsWith('polis-') ? 'police' : 'none');
function babaH(set, h) {
  const m = D.anim && D.anim.set[set];
  return Math.round(h * (m ? m.h : 426) / BADAN);
}
const AVATARS = [['kucing', 'Kucing'], ['arnab', 'Arnab'], ['panda', 'Panda'], ['harimau', 'Harimau'], ['burung-hantu', 'Burung hantu'], ['katak', 'Katak']];
const HATS = [
  { id: 'tiada', nama: 'Tiada', min: 0 }, { id: 'beanie', nama: 'Beanie', min: 0 }, { id: 'besbol', nama: 'Topi Besbol', min: 20 },
  { id: 'songkok', nama: 'Songkok', min: 40 }, { id: 'parti', nama: 'Topi Parti', min: 60 }, { id: 'mahkota', nama: 'Mahkota', min: 100 }
];
const BADGES = [
  { id: 'kuiz1', nama: 'Kuiz pertama', ikon: 'kuiz', ok: (k) => k.kiraan.kuiz >= 1 },
  { id: 'kuiz10', nama: 'Kuiz sempurna', ikon: 'bintang', ok: (k) => k.kiraan.kuizSempurna >= 1 },
  { id: 'kad', nama: 'Pakar BabaCard', ikon: 'babacard', ok: (k) => k.kiraan.kad >= 1 },
  { id: 'sim', nama: 'Wira Simulasi', ikon: 'simulasi', ok: (k) => k.kiraan.sim >= 1 },
  { id: 'det', nama: 'Detektif Muda', ikon: 'analisis', ok: (k) => k.kiraan.analisis >= 1 },
  { id: 'baca', nama: 'Pembaca Bijak (20 kad)', ikon: 'pendidikan', ok: (k) => k.kiraan.infografik.length >= 20 },
  { id: 'sembang', nama: 'Kawan Sembang', ikon: 'sembang', ok: (k) => k.kiraan.sembang >= 10 },
  { id: 'hari3', nama: '3 hari berturut', ikon: 'api-hari-berturut', ok: (k) => k.hari.berturut >= 3 },
  { id: 'b100', nama: '100 bintang', ikon: 'lencana', ok: (k) => k.bintang >= 100 }
];
// ikon dan warna untuk setiap kategori infografik
const CAT = {
  'Maklumat peribadi': ['kunci-privasi', '#6FA8FF', '#2257E0'], 'Kata laluan': ['kunci-privasi', '#B58CFF', '#6326D9'],
  'Kenali grooming': ['perisai-amaran', '#FF8A8A', '#D62A3A'], 'Tanda amaran': ['perisai-amaran', '#FF9F43', '#E2591A'],
  'Rahsia & hadiah': ['hadiah', '#FF9BD0', '#D62A80'], 'Gambar & kamera': ['simulasi', '#5FD3F0', '#1F86C9'],
  'Berjumpa & lokasi': ['simulasi', '#FFB86B', '#E07A10'], 'Ugutan': ['perisai-amaran', '#FF7A7A', '#B0182A'],
  'Dapatkan bantuan': ['sembang', '#5BE09A', '#13924A'], 'Buli siber': ['sembang', '#C9A6FF', '#7B3FE4'],
  'Penipuan': ['kunci-privasi', '#FFD95A', '#E08A00'], 'Game & media sosial': ['permainan', '#6EF0A0', '#13924A'],
  'Sempadan diri': ['perisai-amaran', '#FFA6C9', '#C2397A'], 'Kesejahteraan digital': ['bintang', '#3BE3C8', '#0B8F86']
};

/* ikon garis kecil untuk antara muka */
const svg = (p, w = 2.2) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
const I = {
  back: svg('<path d="M19 12H5M11 18l-6-6 6-6"/>'),
  next: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 2.4),
  send: svg('<path d="M4 12l16-8-6 16-2.5-6.5z"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>', 2),
  phone: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>', 2),
  home: svg('<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  hanger: svg('<path d="M12 6a2 2 0 1 1 2-2M12 6v2L3 15.5a1.5 1.5 0 0 0 1 2.5h16a1.5 1.5 0 0 0 1-2.5L12 8"/>', 2),
  gift: svg('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5M12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5"/>', 2),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', 2),
  bulb: svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  sun: '<svg class="s" viewBox="0 0 24 24" fill="none" stroke="#F08A00" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>',
  moon: '<svg class="m" viewBox="0 0 24 24" fill="none" stroke="#7B8BD9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  wa: svg('<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1.2-1.2 1.8.8c-.2 1.2-1.2 1.9-2.4 1.8-3.3-.4-6-3.1-6.4-6.4-.1-1.2.6-2.2 1.8-2.4l.8 1.8z"/>', 1.6),
  alert: svg('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>'),
  check: svg('<path d="M5 12l5 5 9-10"/>', 3),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>', 3),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', 2)
};

/* =========================================================
   5. Audio (Web Audio API: ulangan muzik tanpa jeda)
   ========================================================= */
const AU = {
  ctx: null, bufs: {}, music: null, musicId: null, want: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    this.ctx = new C();
    this.mg = this.ctx.createGain(); this.mg.gain.value = S.tetapan.volMuzik; this.mg.connect(this.ctx.destination);
    this.fx = this.ctx.createGain(); this.fx.gain.value = 0.9; this.fx.connect(this.ctx.destination);
    if (this.want) { const w = this.want; this.want = null; this.playMusic(w); }
  },
  load(url) {
    if (!this.bufs[url]) {
      this.bufs[url] = fetch(url).then((r) => r.arrayBuffer()).then((b) => new Promise((res, rej) => this.ctx.decodeAudioData(b, res, rej)));
      this.bufs[url].catch(() => { delete this.bufs[url]; });
    }
    return this.bufs[url];
  },
  async playMusic(id) {
    this.want = id;
    if (!this.ctx || !D.audio) return;
    if (!S.tetapan.muzik) { this.stopMusic(); return; }
    if (this.musicId === id && this.music) return;
    const m = D.audio.muzik.find((x) => x.id === id);
    if (!m) return;
    this.stopMusic();
    this.musicId = id;
    let buf;
    try { buf = await this.load(m.fail); } catch (_) { return; }
    if (this.musicId !== id) return;
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = m.ulang;
    const g = this.ctx.createGain(); const t = this.ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1, t + 0.6);
    src.connect(g); g.connect(this.mg); src.start();
    this.music = { src, g };
    if (!m.ulang) src.onended = () => { if (this.music && this.music.src === src) { this.music = null; this.musicId = null; } };
  },
  stopMusic() {
    if (this.music) {
      const { src, g } = this.music; const t = this.ctx.currentTime;
      try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); src.stop(t + 0.45); } catch (_) { /* sudah berhenti */ }
    }
    this.music = null; this.musicId = null;
  },
  setVol(v) { if (this.mg) this.mg.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05); },
  async play(url, vol = 1) {
    if (!this.ctx || !url) return;
    try {
      const b = await this.load(url);
      const s = this.ctx.createBufferSource(); s.buffer = b;
      const g = this.ctx.createGain(); g.gain.value = vol;
      s.connect(g); g.connect(this.fx); s.start();
    } catch (_) { /* fail tiada */ }
  },
  sfx(name, vol = 0.6) { if (S.tetapan.bunyi && D.audio) this.play(D.audio.bunyi_ui[name], vol); },
  voice(key, vol = 0.8) {
    if (!S.tetapan.suara || !D.audio) return;
    let v = D.audio.suara_baba[key];
    if (Array.isArray(v)) v = rand(v);
    this.play(v, vol);
  }
};

/* =========================================================
   6. Enjin Sembang Baba (padanan soalan, tanpa AI dalam talian)
   ========================================================= */
const SLANG = {
  x: 'tak', tk: 'tak', tdk: 'tidak', sy: 'saya', sye: 'saya', sya: 'saya', aku: 'saya', nk: 'nak', nok: 'nak', org: 'orang', dy: 'dia', mcm: 'macam',
  camne: 'macam mana', cmne: 'macam mana', camana: 'macam mana', mcmana: 'macam mana', je: 'sahaja', jer: 'sahaja', dpt: 'dapat', utk: 'untuk', ntuk: 'untuk',
  yg: 'yang', bg: 'bagi', bgi: 'bagi', kat: 'di', dgn: 'dengan', ngan: 'dengan', tgk: 'tengok', gmbr: 'gambar', gbr: 'gambar', pic: 'gambar', pics: 'gambar',
  ckp: 'cakap', bgtau: 'beritahu', bgtahu: 'beritahu', btau: 'beritahu', bagitau: 'beritahu', bagitahu: 'beritahu', jmpa: 'jumpa', jmp: 'jumpa', knp: 'kenapa',
  napa: 'kenapa', apsal: 'kenapa', ape: 'apa', pe: 'apa', ni: 'ini', tu: 'itu', skrg: 'sekarang', skang: 'sekarang', blh: 'boleh', bole: 'boleh', leh: 'boleh',
  tlg: 'tolong', psl: 'pasal', hntr: 'hantar', antar: 'hantar', msg: 'mesej', kwn: 'kawan', fren: 'kawan', frend: 'kawan', pw: 'password', pass: 'password',
  okay: 'okey', ok: 'okey', dah: 'sudah', da: 'sudah', tau: 'tahu', taw: 'tahu', camtu: 'macam itu', cenggini: 'macam ini', mmg: 'memang', sgt: 'sangat',
  tkut: 'takut', tkot: 'takut', sbb: 'sebab', pstu: 'lepas itu', lps: 'lepas', bt: 'buat', wat: 'buat', bwt: 'buat', kene: 'kena', kne: 'kena', vc: 'video call'
};
const QWORDS = new Set(['siapa', 'kenapa', 'apa', 'apakah', 'bagaimana', 'macam', 'mana', 'bila', 'berapa', 'boleh', 'suka', 'rasa', 'buat', 'orang', 'tahu', 'patut', 'perlu', 'nak', 'mahu', 'sangat', 'dia', 'saya', 'what', 'why', 'who', 'how', 'can']);
const STOP = new Set(['saya', 'kamu', 'awak', 'ke', 'ini', 'itu', 'yang', 'dan', 'di', 'nak', 'ada', 'la', 'lah', 'kah', 'pun', 'ya', 'okey', 'ni', 'tu', 'sahaja', 'dengan', 'untuk', 'the', 'a', 'to', 'is', 'i', 'my', 'me', 'do', 'what', 'kena', 'sudah']);
// corak yang menunjukkan bahaya: semak dahulu sebelum padanan biasa
const DANGER = [
  /(minta|nak|hantar|suruh|mintak|send).{0,20}(gambar|video|selfie|photo)/, /(ajak|nak|jom|ajak saya|mahu).{0,16}(jumpa|berjumpa|meet|keluar malam)/,
  /\b(rahsia|rahsiakan|jangan beritahu|jangan bagitahu)\b/, /\b(ugut|ugutan|blackmail|sebar gambar|nak sebar)\b/, /\b(sentuh|badan saya|pasal badan)\b/,
  /(bunuh diri|cederakan diri|sakiti diri|tak nak hidup|nak mati|hurt myself)/, /(tanya|minta|nak tahu).{0,16}(alamat|rumah saya|sekolah saya)/,
  /seorang (di|dalam) rumah|sorang (di|dalam) rumah/, /(video call|buka kamera|on cam)/, /(tawar|bagi|bayar).{0,12}(duit|wang|diamond)/, /(dia ikut saya|ada orang ikut|diekori)/
];

const Chat = {
  items: [], fu: [], last: null,
  norm(s) {
    s = String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/[^a-z0-9\s]/g, ' ').replace(/(.)\1{2,}/g, '$1');
    return s.split(/\s+/).filter(Boolean).map((w) => SLANG[w] || w).join(' ');
  },
  tokens(n) { return n.split(' ').filter((w) => w && !STOP.has(w)); },
  tri(s) { const t = new Set(); const p = '  ' + s + ' '; for (let i = 0; i < p.length - 2; i++) t.add(p.slice(i, i + 3)); return t; },
  dice(a, b) { if (!a.size || !b.size) return 0; let n = 0; a.forEach((x) => { if (b.has(x)) n++; }); return (2 * n) / (a.size + b.size); },
  prepare(list) {
    const mk = (p) => { const n = this.norm(p); const tk = this.tokens(n); return { n, tri: this.tri(n), tk, tkTri: tk.map((w) => this.tri(w)) }; };
    this.items = list.filter((e) => e.jenis !== 'susulan').map((e) => ({ e, phrases: [e.soalan].concat(e.variasi || []).map(mk), kw: (e.kata_kunci || []).map((k) => this.norm(k)).filter(Boolean) }));
    // susulan: sembang ringkas seperti "Boleh bagi contoh?" yang merujuk jawapan terakhir
    this.fu = list.filter((e) => e.jenis === 'susulan').map((e) => ({ e, phrases: [e.soalan].concat(e.variasi || []).map((p) => this.norm(p).replace(/\bbaba\b/g, '').trim()).filter(Boolean) }));
  },
  tokScore(qt, qtTri, p) {
    if (!qt.length || !p.tk.length) return [0, 0];
    let hit = 0, content = 0;
    qt.forEach((w, i) => {
      let best = 0;
      p.tk.forEach((v, j) => { const s = w === v ? 1 : this.dice(qtTri[i], p.tkTri[j]); if (s > best) best = s; });
      if (best >= 0.62) { hit += best; if (best >= 0.75 && !QWORDS.has(w)) content++; }
    });
    return [(2 * hit) / (qt.length + p.tk.length), content];
  },
  score(q, it) {
    let best = 0, content = 0;
    for (const p of it.phrases) {
      const [ts, c] = this.tokScore(q.tk, q.tkTri, p);
      const s = 0.6 * ts + 0.4 * this.dice(q.tri, p.tri);
      if (s > best) best = s;
      if (c > content) content = c;
    }
    let bonus = 0;
    for (const k of it.kw) { if (!QWORDS.has(k) && (' ' + q.n + ' ').includes(' ' + k + ' ')) { bonus += 0.15; content = Math.max(content, 1); } }
    const s = Math.min(1, best + Math.min(bonus, 0.3));
    return content ? s : Math.min(s, 0.28);
  },
  followUp(n) {
    const q = n.replace(/\bbaba\b/g, '').trim();
    if (!q || q.split(' ').length > 7) return null;
    const qt = this.tri(q);
    let best = null, bs = 0;
    for (const f of this.fu) for (const p of f.phrases) {
      const s = p === q ? 1 : this.dice(qt, this.tri(p));
      if (s > bs) { bs = s; best = f.e; }
    }
    return bs >= 0.72 ? best : null;
  },
  // maklumat konteks daripada jawapan terakhir, untuk mengisi templat susulan
  context(e) {
    const K = (D.sembang && D.sembang.konteks) || {};
    let c = null;
    if (typeof e.konteks === 'string' && e.konteks.startsWith('k:')) c = K[e.konteks.slice(2)];
    else if (e.konteks && typeof e.konteks === 'object') c = e.konteks;
    if (!c) {
      const hay = (e.soalan + ' ' + e.jawapan + ' ' + (e.kata_kunci || []).join(' ')).toLowerCase();
      const name = Object.keys(K).find((k) => hay.includes(k.toLowerCase()) || hay.includes(k.split(' ')[0].toLowerCase() + ' ' + (k.split(' ')[1] || '').toLowerCase()));
      c = name ? K[name] : null;
    }
    const first = (t) => (String(t).match(/^[^.!?]+[.!?]/) || [t])[0];
    c = Object.assign({ topik: (e.topik || 'perkara ini').toLowerCase(), contoh: e.jawapan, huraian: e.jawapan, ringkas: first(e.jawapan), langkah: 'Berhenti, simpan bukti, dan beritahu orang dewasa yang kamu percayai.' }, c || {});
    c.jawapan = e.jawapan;
    c.contoh2 = c.contoh2 || c.contoh; c.langkah1 = c.langkah1 || c.langkah;
    c.kesan = c.kesan || 'masalah boleh menjadi lebih besar dan kamu mungkin menanggungnya seorang diri.';
    c.tanda = c.tanda || 'rasa tidak selesa, disuruh berahsia, atau diminta maklumat peribadi.';
    c.bantu = c.bantu || 'Dengar cerita kawan kamu tanpa menghakimi, dan ajak dia beritahu orang dewasa bersama kamu.';
    return c;
  },
  fill(t, c) { return t.replace(/\{(\w+)\}/g, (m, k) => (c[k] != null ? c[k] : '')).replace(/\s+/g, ' ').trim(); },
  pick(e) { return e.jawapan_rawak && e.jawapan_rawak.length ? rand(e.jawapan_rawak) : e.jawapan; },
  answer(text) {
    const n = this.norm(text); const tk = this.tokens(n);
    // 1. sembang susulan ("Boleh bagi contoh?", "Kenapa?", "Ok")
    const fu = this.followUp(n);
    if (fu) {
      const has = /\{\w+\}/.test(fu.templat || '');
      const t = this.last && fu.templat ? this.fill(fu.templat, this.context(this.last)) : (has || !fu.templat ? fu.jawapan : fu.templat);
      return { type: 'jawab', e: fu, text: t, s: 1, danger: false };
    }
    const q = { n, tri: this.tri(n), tk, tkTri: tk.map((w) => this.tri(w)) };
    const ranked = this.items.map((it) => ({ it, s: this.score(q, it) })).sort((a, b) => b.s - a.s);
    let top = ranked[0];
    const isDanger = (e) => !!e.bahaya && !['Dapatkan bantuan', 'Tentang Baba'].includes(e.topik);
    // 2. corak bahaya: utamakan jawapan bahaya, kecuali soalan maklumat yang jelas (contoh: "Apa beza kejutan dan rahsia?")
    const danger = DANGER.some((r) => r.test(n));
    const info = top && top.s >= 0.8 && !top.it.e.bahaya && (top.it.e.jenis === 'kbat' || ['KBAT', 'Perbandingan', 'Istilah', 'Kemahiran'].includes(top.it.e.topik));
    if (danger && !info) {
      const d = ranked.find((r) => r.it.e.bahaya);
      if (d) { this.last = d.it.e; return { type: 'jawab', e: d.it.e, text: this.pick(d.it.e), s: d.s, danger: true }; }
    }
    if (top && top.s >= 0.42) { this.last = top.it.e; return { type: 'jawab', e: top.it.e, text: this.pick(top.it.e), s: top.s, danger: isDanger(top.it.e) }; }
    const sug = ranked.filter((r) => r.s >= 0.3).slice(0, 3).map((r) => r.it.e);
    if (sug.length) return { type: 'cadang', sug };
    return { type: 'tidak' };
  }
};
// pecahkan jawapan panjang kepada beberapa halaman dialog
function pages(t, max = 190) {
  const parts = String(t).match(/[^.!?]+[.!?]+["')]*\s*|[^.!?]+$/g) || [t];
  const out = []; let cur = '';
  parts.forEach((p) => { if ((cur + p).length > max && cur) { out.push(cur.trim()); cur = p; } else cur += p; });
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// tapis maklumat peribadi daripada mesej kanak-kanak
function censor(text) {
  let hit = false;
  let t = text.replace(/(\+?\d[\d\s-]{6,}\d)/g, () => { hit = true; return '███'; });
  t = t.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, () => { hit = true; return '███'; });
  t = t.replace(/\b(no\.?|lot|jalan|jln|lorong|taman|tmn)\s+[\w\s,/-]{2,30}\d+[\w/-]*/gi, () => { hit = true; return '███'; });
  return { t, hit };
}

/* =========================================================
   7. Navigasi skrin
   ========================================================= */
const SCREENS = {};
let cur = null, curParams = {}, cleanup = null, handlers = {};
const BG = {
  splash: 'malam-bandar', intro: 'malam-bandar', tajuk: 'pagi', umur: 'pagi', profil: 'pagi', utama: 'utama-siang', sembang: 'petang-gelap', pendidikan: 'belajar',
  permainan: 'senja', kuiz: 'senja', babacard: 'senja', simulasi: 'senja', menang: 'senja', kalah: 'petang-gelap', analisis: 'ungu-twilight', hasil: 'ungu-twilight',
  bantuan: 'bantuan-merah', ganjaran: 'pagi', almari: 'ungu-twilight', tetapan: 'ungu-twilight', ralat: 'malam-bandar'
};
const MUSIC = {
  intro: '01-tema-baba', tajuk: '01-tema-baba', umur: '01-tema-baba', profil: '01-tema-baba', utama: '02-savana-pagi', sembang: '02-savana-pagi', ganjaran: '02-savana-pagi',
  almari: '02-savana-pagi', tetapan: '02-savana-pagi', pendidikan: '03-belajar-bersama', permainan: '04-kuiz-pantas', kuiz: '04-kuiz-pantas', babacard: '05-babacard-santai',
  simulasi: '06-simulasi', analisis: '07-detektif-baba', hasil: '07-detektif-baba', bantuan: '08-baba-ada-di-sini', menang: '10-menang', kalah: '11-cuba-lagi'
};
const NIGHT_OK = new Set(['utama', 'sembang', 'ganjaran', 'almari', 'tetapan']);
const BACK = {
  intro: 'tajuk', umur: 'tajuk', utama: 'tajuk', sembang: 'utama', pendidikan: 'utama', permainan: 'utama', analisis: 'utama', hasil: 'utama', bantuan: 'utama',
  ganjaran: 'utama', almari: 'utama', tetapan: 'utama', kuiz: 'permainan', babacard: 'permainan', simulasi: 'permainan', menang: 'permainan', kalah: 'permainan'
};

function applyTheme() {
  document.body.classList.toggle('dk', !!S.tetapan.gelap);
  const name = S.tetapan.gelap && cur !== 'bantuan' ? 'malam-bandar' : (BG[cur] || 'utama-siang');
  $('#bg').style.backgroundImage = 'url("' + A.latar(name) + '")';
  const meta = $('meta[name=theme-color]'); if (meta) meta.content = S.tetapan.gelap ? '#0C0C2A' : '#1E8CFF';
}
function musicFor(name) { if (S.tetapan.gelap && NIGHT_OK.has(name)) return '09-bandar-malam'; return MUSIC[name]; }

function go(name, params = {}, opts = {}) {
  if (cleanup) { try { cleanup(); } catch (_) { /* abaikan */ } }
  cleanup = null; handlers = {};
  closeModal();
  cur = name; curParams = params;
  const el = $('#screen');
  const res = SCREENS[name](params) || {};
  el.innerHTML = '<section class="scr ' + (res.cls || '') + '" aria-label="' + esc(res.title || name) + '">' + res.html + '</section>';
  handlers = res.on || {};
  applyTheme();
  const m = res.music !== undefined ? res.music : musicFor(name);
  if (m) AU.playMusic(m);
  if (res.mount) cleanup = res.mount($('.scr', el)) || null;
  el.focus({ preventScroll: true });
  if (!opts.noHistory) history.pushState({ s: name }, '');
}
function back() {
  if ($('#overlay').children.length) { closeModal(); return; }
  if (cur === 'tajuk') { exitDialog(); return; }
  if (cur === 'splash' || cur === 'ralat') return;
  go(BACK[cur] || 'utama', {}, { noHistory: true });
}
window.addEventListener('popstate', () => { back(); history.pushState({ s: cur }, ''); });

// klik global: data-go (navigasi), data-act (tindakan skrin), bunyi ketik
document.addEventListener('click', (ev) => {
  AU.init();
  const t = ev.target.closest('[data-go],[data-act],button,a');
  if (!t) return;
  if (t.matches('button,a,[data-go],[data-act]') && !t.hasAttribute('data-silent')) AU.sfx(t.getAttribute('data-sfx') || 'ketik', 0.5);
  if (t.hasAttribute('data-go')) { ev.preventDefault(); const g = t.getAttribute('data-go'); if (g === '__back') back(); else go(g, t.dataset.p ? JSON.parse(t.dataset.p) : {}); return; }
  if (t.hasAttribute('data-act')) {
    const a = t.getAttribute('data-act');
    const fn = handlers[a] || GLOBAL_ACT[a];
    if (fn) { ev.preventDefault(); fn(t, ev); }
  }
});
const GLOBAL_ACT = {
  closeModal: () => closeModal(),
  bantuan: () => go('bantuan'),
  toggleMode: () => { S.tetapan.gelap = !S.tetapan.gelap; save(); applyTheme(); const m = musicFor(cur); if (m) AU.playMusic(m); }
};

/* =========================================================
   8. Komponen
   ========================================================= */
const topBar = (title, sub, opts = {}) =>
  '<header class="top">' + (opts.noBack ? '' : '<button class="ib" data-go="__back" aria-label="Kembali">' + I.back + '</button>') +
  '<div style="flex:1;min-width:0"><h1>' + esc(title) + '</h1>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div>' + (opts.right || '') + '</header>';
const modeToggle = () => '<button class="mode-toggle" data-act="toggleMode" aria-label="Tukar mod siang atau malam">' + I.sun + I.moon + '<span class="knob" aria-hidden="true"></span></button>';
const babaImg = (state, h, alt, extra = '') => '<img class="baba" data-h="' + h + '" src="' + A.baba(state) + '" alt="' + esc(alt || 'Baba') + '" style="height:' + babaH(setOf(state), h) + 'px" ' + extra + '>';
let restartTick = 0;
function setBaba(img, state, src, set) {
  if (!img) return;
  restartTick = 1 - restartTick;
  img.src = (src || A.baba(state)) + '?r=' + restartTick; // ulang animasi dari awal
  if (img.dataset.h) img.style.height = babaH(set || setOf(state), +img.dataset.h) + 'px';
}

function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  $('#phone').appendChild(t); setTimeout(() => t.remove(), ms);
}
function openModal(html, opts = {}) {
  const ov = $('#overlay');
  ov.innerHTML = '<div class="modal-bg ' + (opts.mid ? 'mid' : '') + '" ' + (opts.lock ? '' : 'data-bgclose') + '><div class="modal" role="dialog" aria-modal="true">' + html + '</div></div>';
  const bg = $('.modal-bg', ov);
  bg.addEventListener('click', (e) => { if (e.target === bg && !opts.lock) closeModal(); });
  if (opts.on) Object.assign(handlers, opts.on);
  const f = $('button', ov); if (f) f.focus({ preventScroll: true });
  return $('.modal', ov);
}
function closeModal() { const ov = $('#overlay'); if (ov) ov.innerHTML = ''; }

/* dialog RPG: tulisan muncul satu demi satu dengan suara Baba */
function rpg(box, lines, opts = {}) {
  lines = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
  const mood = opts.mood ? 'dialog_' + opts.mood : 'dialog';
  box.innerHTML = '<span class="name">' + esc(opts.name || 'Baba') + '</span><div class="txt" aria-live="polite"></div><span class="more" aria-hidden="true" hidden>▼</span>';
  const txt = $('.txt', box), more = $('.more', box);
  let i = 0, timer = null, full = false, done = false, resolve;
  const p = new Promise((r) => { resolve = r; });
  const show = () => {
    const line = lines[i]; let c = 0; full = false; more.hidden = true; txt.textContent = '';
    clearInterval(timer);
    timer = setInterval(() => {
      c++; txt.textContent = line.slice(0, c);
      if (c % 4 === 1 && line[c - 1] !== ' ') AU.voice(c < 3 ? mood : 'dialog', 0.45);
      if (c >= line.length) { clearInterval(timer); full = true; more.hidden = i >= lines.length - 1 && !opts.keepArrow; if (i >= lines.length - 1) finish(); }
    }, 26);
  };
  const finish = () => { if (!done) { done = true; resolve(); } };
  box.onclick = () => {
    if (!full) { clearInterval(timer); txt.textContent = lines[i]; full = true; more.hidden = i >= lines.length - 1; if (i >= lines.length - 1) finish(); return; }
    if (i < lines.length - 1) { i++; show(); }
  };
  box.setAttribute('role', 'button'); box.setAttribute('tabindex', '0');
  box.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.onclick(); } };
  if (lines.length) show(); else finish();
  return { done: p, stop: () => clearInterval(timer) };
}

function addStars(n) {
  if (n <= 0) return;
  S.kemajuan.bintang += n; save(); checkBadges();
}
function checkBadges() {
  const k = S.kemajuan; let got = null;
  BADGES.forEach((b) => { if (!k.lencana.includes(b.id) && b.ok(k)) { k.lencana.push(b.id); got = b; } });
  if (got) { save(); setTimeout(() => { toast('🏅 Lencana baharu: ' + got.nama + '!'); AU.sfx('menang'); }, 600); }
  const unlocked = HATS.filter((h) => h.min > 0 && k.bintang >= h.min && !(k.topiBuka || []).includes(h.id));
  if (unlocked.length) { k.topiBuka = (k.topiBuka || []).concat(unlocked.map((h) => h.id)); save(); setTimeout(() => toast('🎩 Topi baharu di Almari: ' + unlocked.map((h) => h.nama).join(', ')), 3400); }
}
function updateStreak() {
  const h = S.kemajuan.hari, t = todayStr();
  if (h.akhir === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  h.berturut = h.akhir === todayStr(y) ? h.berturut + 1 : 1; h.akhir = t; save(); checkBadges();
}

/* modal bahaya (dipakai oleh Sembang dan ujian dalam Tetapan) */
function showDanger(opts = {}) {
  AU.sfx('amaran-bahaya', 0.6); setTimeout(() => AU.voice('amaran'), 450);
  if (navigator.vibrate) { try { navigator.vibrate([120, 80, 120]); } catch (_) { /* tiada getaran */ } }
  openModal(
    '<div class="card danger"><div class="bar">' + I.alert + ' Baba kesan tanda bahaya</div>' +
    '<div style="display:flex;gap:12px;align-items:center">' + babaImg('polis-waspada', 120, 'Baba polis') +
    '<div><b style="font-size:16px">' + esc(opts.tajuk || 'Baba risau tentang perbualan ini.') + '</b><p class="muted small" style="margin:6px 0 0">' +
    esc(opts.teks || 'Kamu tidak salah. Jangan balas, simpan bukti dan beritahu orang dewasa yang kamu percayai.') + '</p></div></div>' +
    (opts.petikan ? '<div class="msg" style="margin-top:10px;max-width:100%;background:var(--card-2)">“' + esc(opts.petikan) + '”</div>' : '') +
    '</div>' +
    '<button class="btn btn-r" data-act="bantuan">' + I.phone + ' Saya Perlukan Bantuan</button>' +
    '<button class="btn" data-act="tamat">Tamatkan perbualan</button>' +
    '<button class="btn" data-act="closeModal" style="min-height:46px;font-size:14px">Saya okey, teruskan</button>',
    { lock: true, on: { tamat: () => { closeModal(); go('utama'); toast('Perbualan ditamatkan. Kamu selamat sekarang.'); } } });
}

function exitDialog() {
  openModal(
    '<div class="card" style="text-align:center">' + babaImg('menangis', 150, 'Baba sedih') +
    '<h2 style="font-size:24px;margin-top:6px">Eh, nak keluar dah?</h2><p class="muted" style="margin:6px 0 0">Baba akan rindu kamu. Jumpa lagi ya!</p></div>' +
    '<div class="row"><button class="btn" data-act="closeModal">Tidak</button><button class="btn btn-r" data-act="keluar">Ya, keluar</button></div>',
    { mid: true, on: { keluar: () => { AU.stopMusic(); closeModal(); try { window.close(); } catch (_) { /* pelayar tidak benarkan */ } go('selamatTinggal', {}, { noHistory: true }); } } });
}

/* =========================================================
   9. Skrin
   ========================================================= */
SCREENS.splash = () => ({
  cls: 'intro', music: null,
  html: '<div class="body center" style="gap:18px"><img class="splash-logo r" src="' + A.logo + '" alt="Logo Baba Chat">' +
    '<h1 class="r" style="font-size:44px;animation-delay:.15s"><span style="color:#FFC65C">Baba</span> Chat</h1>' +
    '<button class="btn btn-y r" style="max-width:300px;animation-delay:.3s" data-act="mula" data-silent>Ketik untuk mula</button>' +
    '<p class="small r" style="opacity:.7;animation-delay:.45s">Bunyi akan dimainkan. Kamu boleh matikannya dalam Tetapan.</p></div>',
  on: { mula: () => { AU.init(); AU.sfx('ketik'); go('intro'); } }
});

SCREENS.intro = () => {
  const M = ['MUHAMMAD DANIEL AIMAN BIN KAMARUZAMAN', 'MUHAMMAD NABIL IRSYAD BIN MAZLAN', 'NUR AMIRA SHAHIRAH BINTI SYAMELI', 'NUR FATINI BINTI ABDUL HADI',
    'SITI FATIMAH AZ-ZAHRAH ALBI BINTI ZUFABILLAH', 'WAN NURUL WARDINA FAKRIYYAH BINTI WAN MOHD ASRI', 'NUR IZZATI BINTI ROSLANI@ROSLAINI', 'MUHAMMAD HUSAINI BIN MANSOR'];
  const E = [['three.js', 'three.js · WebGL', 'Enjin 3D yang memaparkan dan menggerakkan Baba', '#7EC8FF'], ['Python', 'Python · NumPy · SciPy', 'Memodel, menghidupkan Baba 3D dan menjana muzik', '#FFE27A'],
    ['Web Audio', 'Web Audio API', 'Muzik, suara Baba dan bunyi butang', '#FF9BD0'], ['HTML · JS', 'HTML, CSS & JavaScript', 'Antara muka aplikasi', '#7BEA9B']];
  const stage = [
    '<div class="lg-wrap"><span class="lg-ring" aria-hidden="true"></span><span class="lg-ring b" aria-hidden="true"></span>' +
    '<div class="lg-card"><img src="' + A.logoUnisza + '" alt="Logo Universiti Sultan Zainal Abidin (UniSZA)"></div></div>' +
    '<div class="r" style="animation-delay:1.1s;font:800 24px/1.1 \'Baloo 2\';color:#FFE27A">Projek Kerja Sosial</div>',
    '<div class="r" style="font-size:13px;font-weight:600;letter-spacing:.28em;color:#C9D2FF">UNISZA · PROJEK KERJA SOSIAL</div>' +
    '<div class="r" style="animation-delay:.25s;width:168px;height:168px;border-radius:48px 26px 48px 26px;border:4px solid #FFE27A;background:linear-gradient(160deg,#3D2FB0,#1B1A52);display:grid;place-items:center"><span style="font:800 96px/1 \'Baloo 2\';color:#FFE27A;text-shadow:0 6px 0 #8A5A00">10</span></div>' +
    '<h1 class="r" style="animation-delay:.5s;font-size:40px">Kumpulan 10</h1><div class="r" style="animation-delay:.75s;color:#E4DEF2">mempersembahkan</div>',
    '<div class="r" style="font-size:13px;font-weight:600;letter-spacing:.24em;color:#C9D2FF">KUMPULAN 10</div><h1 class="r" style="font-size:32px">Ahli kumpulan</h1>' +
    '<ol class="members">' + M.map((n, i) => '<li class="r" style="animation-delay:' + (0.15 + i * 0.12).toFixed(2) + 's"><b>' + (i + 1) + '.</b><span>' + esc(n) + '</span></li>').join('') + '</ol>',
    '<div class="r" style="font-size:13px;font-weight:600;letter-spacing:.24em;color:#C9D2FF">DIBINA DENGAN</div>' +
    E.map((e, i) => '<div class="engine r" style="--c:' + e[3] + ';animation-delay:' + (0.15 + i * 0.18).toFixed(2) + 's"><span class="tg">' + e[0] + '</span><span><b style="display:block">' + e[1] + '</b><span class="small" style="color:#D5D0EA">' + e[2] + '</span></span></div>').join('') +
    '<div class="small r" style="animation-delay:1s;color:#B8B3D9">Fon: Baloo 2 &amp; Lexend (Google Fonts)</div>',
    babaImg('lambai', 230, 'Baba melambai') + '<h1 class="r" style="font-size:56px;line-height:.95"><span style="color:#FFC65C">Baba</span> Chat</h1>' +
    '<p class="r" style="margin:0;color:#E4DEF2;animation-delay:.2s">Kawan selamat kamu di internet</p>' +
    '<button class="btn btn-y r" style="animation-delay:.4s" data-go="tajuk">Ketik untuk mula</button>'
  ];
  return {
    cls: 'intro',
    html: '<header class="top" style="justify-content:space-between"><div class="dots-step" role="img" aria-label="Langkah pengenalan"></div>' +
      '<button class="btn" data-go="tajuk" style="width:auto;min-height:38px;font-size:13px;padding:0 14px;background:transparent;color:#fff;border-color:rgba(255,255,255,.6);box-shadow:none">Langkau ⏭</button></header>' +
      '<div class="body center" id="introBody" style="gap:14px"></div><div class="small" style="text-align:center;padding:0 0 calc(18px + var(--safe-b));color:#8E89B3">© 2026 Kumpulan 10 · Baba Chat</div>',
    mount: (el) => {
      let s = 0;
      const render = () => {
        $('#introBody', el).innerHTML = stage[s];
        $('.dots-step', el).innerHTML = [0, 1, 2, 3, 4].map((i) => '<i class="' + (i === s ? 'on' : i < s ? 'done' : '') + '"></i>').join('');
      };
      render();
      const t = setInterval(() => { if (s >= 4) { clearInterval(t); return; } s++; render(); AU.sfx(s === 4 ? 'menang' : 'notifikasi', 0.4); }, 4200);
      return () => clearInterval(t);
    }
  };
};

SCREENS.tajuk = () => ({
  html: '<div class="body center" style="align-items:center;text-align:center;gap:12px">' +
    '<img src="' + A.logo + '" alt="" style="width:84px;height:84px;border-radius:24px;box-shadow:0 8px 20px rgba(0,0,0,.25)">' +
    '<h1 class="on-bg" style="font-size:52px;line-height:.95"><span style="color:#FFE27A">Baba</span> Chat</h1>' +
    '<p class="on-bg" style="margin:0">Kawan selamat kamu di internet</p>' + babaImg('lambai', 230, 'Baba melambai') +
    '<div style="width:100%;display:grid;gap:14px;margin-top:4px">' +
    '<button class="btn btn-y shine" data-act="mula" style="min-height:62px;font-size:19px">' + (S.profil ? 'Sambung' : 'Mula') + '</button>' +
    '<div class="row"><button class="btn" data-go="intro">Pengenalan</button><button class="btn" data-act="keluar">Keluar</button></div></div></div>',
  on: { mula: () => go(S.profil ? 'utama' : (S.tetapan.setuju ? 'profil' : 'umur')), keluar: () => exitDialog() }
});

SCREENS.selamatTinggal = () => ({
  music: null, cls: 'intro',
  html: '<div class="body center" style="align-items:center;text-align:center">' + babaImg('lambai', 220, 'Baba melambai') +
    '<h1 style="font-size:34px">Terima kasih!</h1><p style="color:#E4DEF2">Kamu boleh tutup tab atau aplikasi ini sekarang.</p>' +
    '<button class="btn btn-y" data-go="tajuk">Kembali ke Baba Chat</button></div>'
});

SCREENS.umur = () => ({
  html: topBar('Sebelum mula', 'Baca bersama ibu bapa atau penjaga') +
    '<div class="body"><div class="card soft" style="display:flex;gap:12px;align-items:center">' + babaImg('berfikir', 130, 'Baba berfikir') +
    '<div><b>Baba Chat dibina untuk kanak-kanak berumur 7 hingga 12 tahun.</b><p class="muted small" style="margin:6px 0 0">Aplikasi ini tidak meminta nama sebenar, alamat atau nombor telefon. Semua kemajuan disimpan dalam peranti ini sahaja.</p></div></div>' +
    '<div class="card soft" style="display:grid;gap:12px">' +
    ['Saya tidak akan menaip nama penuh, alamat, sekolah atau nombor telefon dalam aplikasi ini.', 'Saya akan beritahu orang dewasa jika ada apa-apa yang membuat saya risau.', 'Ibu bapa atau penjaga saya tahu saya menggunakan aplikasi ini.']
      .map((t, i) => '<label style="display:flex;gap:12px;align-items:flex-start;font-size:14px;font-weight:600"><input type="checkbox" data-c="' + i + '" style="width:24px;height:24px;flex-shrink:0;accent-color:#F08A00"> ' + t + '</label>').join('') +
    '</div><button class="btn btn-y" data-act="ok" disabled>Saya faham</button></div>',
  mount: (el) => {
    const btn = $('[data-act=ok]', el);
    el.addEventListener('change', () => { btn.disabled = $$('input[type=checkbox]', el).some((c) => !c.checked); });
  },
  on: { ok: () => { S.tetapan.setuju = true; save(); go('profil'); } }
});

SCREENS.profil = (p) => {
  const pr = S.profil || { nama: '', avatar: 'kucing' };
  let pick = pr.avatar;
  return {
    html: topBar(p.edit ? 'Tukar profil' : 'Cipta profil', 'Tiada log masuk, tiada e-mel') +
      '<div class="body"><div class="card soft" style="display:flex;gap:12px;align-items:center">' + babaImg('bercakap', 110, 'Baba bercakap') +
      '<p style="margin:0;font-size:14px">Pilih <b>nama samaran</b> dan haiwan kegemaran kamu. Jangan guna nama sebenar ya!</p></div>' +
      '<label class="on-bg" style="font-weight:700" for="nama">Nama samaran</label><input class="field" id="nama" maxlength="16" autocomplete="off" placeholder="Contoh: BintangCeria" value="' + esc(pr.nama) + '">' +
      '<div class="small on-bg" id="namaWarn" role="alert"></div>' +
      '<div class="on-bg" style="font-weight:700">Pilih avatar</div><div class="avatars">' +
      AVATARS.map(([id, n]) => '<button data-act="av" data-id="' + id + '" aria-pressed="' + (id === pick) + '" aria-label="' + n + '"><img src="' + A.avatar(id) + '" alt=""></button>').join('') +
      '</div><button class="btn btn-y" data-act="simpan">Simpan</button></div>',
    on: {
      av: (t) => { pick = t.dataset.id; $$('.avatars button').forEach((b) => b.setAttribute('aria-pressed', b === t)); AU.voice('ciap', 0.6); },
      simpan: () => {
        const v = $('#nama').value.trim(); const warn = $('#namaWarn');
        if (v.length < 2) { warn.textContent = 'Nama samaran perlu sekurang-kurangnya 2 huruf.'; return; }
        if (/\d{4,}/.test(v) || /\b(bin|binti|bt|b\.)\b/i.test(v)) { warn.textContent = 'Nampak macam maklumat sebenar. Cuba nama samaran yang lain, contohnya "MeerkatBerani".'; return; }
        S.profil = { nama: v, avatar: pick }; save(); AU.voice('gembira');
        go(p.edit ? 'tetapan' : 'utama');
      }
    }
  };
};

SCREENS.utama = () => {
  updateStreak();
  const pr = S.profil || { nama: 'kawan', avatar: 'kucing' };
  const TIPS = D.info.infografik.map((x) => x.nasihat);
  let ti = Math.floor(Math.random() * TIPS.length);
  const hat = S.kemajuan.topi && S.kemajuan.topi !== 'tiada';
  const tile = (go2, cls, ic, lbl) => '<button class="tile shine ' + cls + '" data-go="' + go2 + '" aria-label="' + lbl + '"><span class="bubble-glass" style="width:130px;height:130px;top:-50px;right:-36px"></span><span class="dots"></span><img src="' + A.ikon(ic) + '" alt=""><span>' + lbl + '</span></button>';
  return {
    html: '<header class="top"><button class="ib" data-go="tajuk" aria-label="Kembali ke skrin tajuk">' + I.back + '</button>' +
      '<img src="' + A.avatar(pr.avatar) + '" alt="" style="width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.5)">' +
      '<div style="flex:1;min-width:0"><div class="sub">Selamat datang</div><h1 style="font-size:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Hai, ' + esc(pr.nama) + '!</h1></div>' + modeToggle() + '</header>' +
      '<div class="body">' +
      '<div class="hero shine"><span class="bubble-glass" style="width:220px;height:220px;right:-40px;top:-10px"></span><span class="stripes"></span>' +
      '<h2>Jom teroka internet dengan selamat!</h2><p>Belajar, bermain dan kenali tanda bahaya bersama Baba.</p>' +
      '<img class="baba" id="heroBaba" src="' + (hat ? A.topi(S.kemajuan.topi) : A.baba('lambai')) + '" alt="Baba" data-act="tapBaba" style="height:' + babaH(hat ? TOPI_SET[S.kemajuan.topi] : 'none', 172) + 'px"></div>' +
      '<div class="tiles">' + tile('pendidikan', 't-edu', 'pendidikan', 'Pendidikan') + tile('sembang', 't-chat', 'sembang', 'Sembang Baba') + tile('permainan', 't-game', 'permainan', 'Permainan') + tile('analisis', 't-ana', 'analisis', 'Analisis Baba') + '</div>' +
      '<div class="card tip"><span class="dots-ink"></span><span class="ico">' + I.bulb + '</span><div style="flex:1;position:relative"><div class="lbl">TIP BABA HARI INI</div><div id="tip" style="font-size:13px;font-weight:600;line-height:1.35" aria-live="polite">' + esc(TIPS[ti]) + '</div></div>' +
      '<button class="ib" data-act="tip" aria-label="Tip seterusnya" style="width:38px;height:38px;position:relative">' + I.next + '</button></div>' +
      '<button class="btn btn-r shine" data-go="bantuan">' + I.phone + '<span style="flex:1;text-align:left">Saya Perlukan Bantuan</span>' + I.next + '</button>' +
      '</div>' + navBar('utama'),
    on: {
      tip: () => { ti = (ti + 1) % TIPS.length; $('#tip').textContent = TIPS[ti]; },
      tapBaba: () => { AU.voice('diketuk'); }
    }
  };
};
function navBar(on) {
  const b = (id, ic, lbl) => '<button class="' + (on === id ? 'on' : '') + '" data-go="' + id + '"' + (on === id ? ' aria-current="page"' : '') + '>' + ic + lbl + '</button>';
  return '<nav class="nav" aria-label="Navigasi utama">' + b('utama', I.home, 'Utama') + b('almari', I.hanger, 'Almari') + b('ganjaran', I.gift, 'Ganjaran') + b('tetapan', I.user, 'Tetapan') + '</nav>';
}

/* ---------- Sembang dengan Baba ---------- */
let chatLog = [];
SCREENS.sembang = () => {
  const starters = ['Apa itu grooming?', 'Ada orang minta gambar saya.', 'Siapa yang saya boleh beritahu?', 'Baba, buat lawak.'];
  const hat = S.kemajuan.topi && S.kemajuan.topi !== 'tiada' ? S.kemajuan.topi : null;
  const set = hat ? TOPI_SET[hat] : 'none';
  const M = D.anim.set[set];
  const KB = 176 / BADAN; // skala paparan: badan Baba ~176 piksel tinggi
  const W = Math.round(M.w * KB), H = Math.round(M.h * KB);
  const T = M.pusing, TW = Math.round(T.w * KB), TH = Math.round(T.h * KB);
  return {
    html: topBar('Sembang dengan Baba', 'Tanya apa-apa tentang keselamatan dalam talian', { right: modeToggle() }) +
      '<div class="chat-stage" id="stage" style="height:' + (H - Math.round(M.badan[1] * KB) + 34) + 'px">' +
      '<span class="hint">Usap kepala · Ketuk telinga, kaki, ekor · Leret untuk pusing</span>' +
      '<div class="bb-wrap" id="bbw" style="width:' + W + 'px;height:' + H + 'px" role="img" aria-label="Baba. Usap kepala Baba, ketuk telinga, kaki atau ekor, atau leret untuk memusingkan Baba.">' +
      '<span class="gshadow" aria-hidden="true"></span>' +
      '<img class="baba bb" id="chatBaba" src="' + (hat ? A.topiAnim(hat, 'idle') : A.baba('idle')) + '" alt="" draggable="false" style="width:' + W + 'px;height:' + H + 'px">' +
      '<div class="spin" id="spin" aria-hidden="true" style="width:' + TW + 'px;height:' + TH + 'px;background-image:url(\'' + T.fail + '\')"></div>' +
      '<div class="hearts" id="hearts" aria-hidden="true"></div></div></div>' +
      '<div style="padding:0 18px"><div class="rpg" id="rpg"></div></div>' +
      '<div class="msgs" id="msgs" aria-live="polite"></div>' +
      '<div style="padding:0 18px 8px"><div class="chips" id="chips">' + starters.map((s) => '<button class="chip" data-act="ask" data-q="' + esc(s) + '">' + esc(s) + '</button>').join('') + '</div></div>' +
      '<form class="composer" id="composer" autocomplete="off"><input id="q" maxlength="200" placeholder="Taip soalan kamu…" aria-label="Soalan kamu"><button type="submit" aria-label="Hantar">' + I.send + '</button></form>',
    mount: (el) => {
      const img = $('#chatBaba', el), wrap = $('#bbw', el), stage = $('#stage', el), spin = $('#spin', el), msgs = $('#msgs', el), hearts = $('#hearts', el);
      const src = (st) => (hat ? A.topiAnim(hat, st) : A.baba(st));
      const ms = (st) => (M.klip[st] ? M.klip[st].ms : 1200);
      let mood = 'idle', busy = null, dlg = null, idleT = null, backT = null;
      const show = (st) => { restartTick = 1 - restartTick; img.src = src(st) + '?r=' + restartTick; };
      const rest = () => { busy = null; show(mood); };
      const setMood = (m) => { mood = M.klip[m] ? m : 'bercakap'; if (!busy) show(mood); };
      // animasi sekali (sentuhan): kembali ke mood selepas tamat
      const once = (st, extra = 0) => {
        busy = st; clearTimeout(backT); show(st); backT = setTimeout(rest, ms(st) + extra);
        wrap.classList.remove('jumping'); if (st === 'lompat' || st === 'geletek') { void wrap.offsetWidth; wrap.classList.add('jumping'); }
      };
      const say = (lines, md, anim) => {
        if (dlg) dlg.stop();
        setMood(anim || 'bercakap');
        dlg = rpg($('#rpg', el), lines, { mood: md });
        dlg.done.then(() => { setTimeout(() => setMood('idle'), 1200); });
      };
      const addMsg = (cls, html) => { const d = document.createElement('div'); d.className = 'msg ' + cls; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; };
      chatLog.forEach((m) => addMsg(m[0], m[1]));
      const nama = S.profil ? S.profil.nama : 'kawan';
      say(['Hai ' + nama + '! Baba sedia mendengar.', 'Tanya apa-apa tentang keselamatan dalam talian, atau pilih soalan di bawah.', 'Kamu juga boleh usap kepala Baba!'], 'gembira');
      const setChips = (list) => { $('#chips', el).innerHTML = list.map((s) => '<button class="chip" data-act="ask" data-q="' + esc(s) + '">' + esc(s) + '</button>').join(''); };
      const actionChip = (t) => {
        const map = { bantuan: ['bantuan', 'Buka Saya Perlukan Bantuan'], analisis: ['analisis', 'Cuba Analisis Baba'], pendidikan: ['pendidikan', 'Belajar di Pendidikan'], permainan: ['permainan', 'Main permainan'] };
        if (!map[t]) return;
        $('#chips', el).insertAdjacentHTML('afterbegin', '<button class="chip on" data-go="' + map[t][0] + '">' + map[t][1] + ' →</button>');
      };
      const FOLLOW = ['Boleh bagi contoh?', 'Cuba terangkan lagi.', 'Jadi apa saya patut buat?'];
      const ask = (raw) => {
        const text = raw.trim(); if (!text) return;
        const c = censor(text);
        addMsg('me', esc(c.t)); chatLog.push(['me', esc(c.t)]);
        if (c.hit) { addMsg('sys', '🛡️ Baba sorokkan maklumat peribadi kamu. Jangan kongsi nombor telefon atau alamat ya!'); AU.sfx('notifikasi'); }
        S.kemajuan.kiraan.sembang++; save(); checkBadges();
        const r = Chat.answer(c.t);
        setChips([]);
        if (r.type === 'jawab') {
          const e = r.e;
          say(pages(r.text), r.danger ? 'terkejut' : e.jenis === 'kbat' ? 'berfikir' : 'gembira', r.danger ? 'waspada' : e.jenis === 'kbat' ? 'berfikir' : 'bercakap');
          chatLog.push(['', esc(r.text)]);
          if (e.tindakan) actionChip(e.tindakan);
          if (r.danger) setTimeout(() => showDanger({ petikan: c.t }), 1600);
          else if (e.jenis !== 'susulan' && Chat.last === e) setChips(FOLLOW);
        } else if (r.type === 'cadang') {
          say(['Hmm, Baba kurang pasti. Adakah kamu maksudkan salah satu soalan ini?'], 'berfikir', 'berfikir');
          setChips(r.sug.map((e) => e.soalan));
        } else {
          say([D.sembang.fallback.jawapan], 'berfikir', 'berfikir');
          actionChip(D.sembang.fallback.tindakan);
        }
        if (chatLog.length > 40) chatLog = chatLog.slice(-40);
      };
      handlers.ask = (t) => ask(t.dataset.q);
      $('#composer', el).addEventListener('submit', (ev) => { ev.preventDefault(); AU.init(); const i = $('#q', el); ask(i.value); i.value = ''; });

      // ---------- sentuhan: kepala/telinga, usap kepala, kaki, ekor, badan, pusing ----------
      let down = null, frame = 0, patting = false;
      const heart = (x, y) => {
        const h = document.createElement('i'); h.textContent = '♥';
        h.style.left = x + 'px'; h.style.top = y + 'px'; h.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
        hearts.appendChild(h); setTimeout(() => h.remove(), 1250);
      };
      const zone = (e) => {
        const r = wrap.getBoundingClientRect(), k = M.w / r.width;
        const x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
        const u = (x - (M.w / 2 - 97)) / 194, v = (y - (M.badan[3] - BADAN)) / BADAN;
        const backView = stage.classList.contains('spinning') && frame >= 6 && frame <= 18;
        let z = 'badan';
        if ((backView && v > 0.55) || (v > 0.55 && (u < 0.04 || u > 0.96))) z = 'ekor';
        else if (v < 0.36) z = 'kepala';
        else if (v > 0.88) z = 'kaki';
        return { z, x: e.clientX - r.left, y: e.clientY - r.top };
      };
      const LINE = {
        telinga: ['Eh, telinga Baba geli! Baba dengar kamu dengan baik.', 'Telinga meerkat boleh tertutup semasa menggali, tahu?'],
        geletek: ['Hihihi! Jangan geletek kaki Baba!', 'Hahaha, geli! Baba nak lompat!'],
        ekor: ['Ekor Baba? Ekor ini bantu Baba berdiri tegak semasa berjaga.', 'Hehe, kamu jumpa ekor Baba!'],
        usap: ['Hehe… sedapnya diusap kepala. Terima kasih, kawan!', 'Baba suka diusap kepala. Kamu baik hati!']
      };
      const react = (clip, sfx, voice) => {
        if (stage.classList.contains('spinning')) { stage.classList.remove('spinning'); frame = 0; }
        once(clip); if (sfx) AU.sfx(sfx, 0.5); if (voice) AU.voice(voice, 0.7);
        if (LINE[clip]) { if (dlg) dlg.stop(); dlg = rpg($('#rpg', el), [rand(LINE[clip])], { mood: 'gembira' }); }
      };
      wrap.addEventListener('pointerdown', (e) => {
        down = { x: e.clientX, last: e.clientX, f: frame, moved: false, z: zone(e), dir: 0, flips: 0 };
        try { wrap.setPointerCapture(e.pointerId); } catch (_) { /* tiada */ }
      });
      wrap.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - down.x;
        if (down.z.z === 'kepala' && !stage.classList.contains('spinning')) {
          const step = e.clientX - down.last;
          if (Math.abs(step) > 6) {
            const dir = Math.sign(step);
            if (down.dir && dir !== down.dir) {
              down.flips++;
              if (down.flips >= 2) {
                const r = wrap.getBoundingClientRect(); heart(e.clientX - r.left, e.clientY - r.top);
                if (!patting) { patting = true; react('usap', null, 'gembira'); }
                else if (busy === 'usap') { clearTimeout(backT); backT = setTimeout(rest, ms('usap')); }
              }
            }
            down.dir = dir; down.last = e.clientX; down.moved = true;
          }
          return;
        }
        if (!down.moved && Math.abs(dx) > 8) { down.moved = true; stage.classList.add('spinning'); }
        if (down.moved) { frame = ((down.f + Math.round(-dx / 14)) % T.n + T.n) % T.n; spin.style.backgroundPosition = (frame * 100 / (T.n - 1)) + '% 0'; }
      });
      const up = () => {
        if (!down) return;
        const d = down; down = null;
        if (patting) { patting = false; return; }
        if (d.moved) { if (d.z.z !== 'kepala') setTimeout(() => { if (!down) { stage.classList.remove('spinning'); frame = 0; } }, 900); return; }
        if (d.z.z === 'kepala') { react('telinga', null, 'idle'); heart(d.z.x, d.z.y); }
        else if (d.z.z === 'kaki') { react('geletek', 'lompat', 'diketuk'); heart(d.z.x, d.z.y); }
        else if (d.z.z === 'ekor') react('ekor', null, 'diketuk');
        else react('lompat', 'lompat', 'diketuk');
      };
      wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
      const idle = () => { idleT = setTimeout(() => { AU.voice('idle', 0.35); idle(); }, 30000 + Math.random() * 20000); };
      idle();
      return () => { clearTimeout(idleT); clearTimeout(backT); if (dlg) dlg.stop(); };
    }
  };
};

/* ---------- Pendidikan (infografik) ---------- */
SCREENS.pendidikan = () => {
  const cats = ['Semua'].concat(Object.keys(CAT));
  let cat = 'Semua', shown = 12;
  const read = new Set(S.kemajuan.kiraan.infografik);
  const card = (x) => {
    const c = CAT[x.kategori] || ['bintang', '#6FA8FF', '#2257E0'];
    return '<button class="card ig" data-act="ig" data-id="' + x.id + '" style="--a:' + c[1] + ';--b:' + c[2] + '"><div class="head"><span class="dots"></span><img src="' + A.ikon(c[0]) + '" alt=""><div><small>' + esc(x.kategori) + (read.has(x.id) ? ' · ✓ dibaca' : '') + '</small><h3>' + esc(x.tajuk) + '</h3></div></div>' +
      '<div class="bodyi"><div><div class="tag">FAKTA</div>' + esc(x.fakta) + '</div><div><div class="tag">NASIHAT</div>' + esc(x.nasihat) + '</div><span class="tap">Ketuk untuk dengar Baba ▶</span></div></button>';
  };
  const list = () => D.info.infografik.filter((x) => cat === 'Semua' || x.kategori === cat);
  const renderList = () => {
    const L = list();
    $('#igList').innerHTML = L.slice(0, shown).map(card).join('') + (L.length > shown ? '<button class="btn" data-act="lagi">Tunjuk lagi (' + (L.length - shown) + ')</button>' : '');
    $('#igCount').textContent = read.size + ' / ' + D.info.infografik.length + ' kad dibaca';
  };
  return {
    html: topBar('Pendidikan', 'Ketuk kad untuk dengar nasihat Baba') +
      '<div style="padding:4px 18px 8px;overflow-x:auto"><div class="chips" style="flex-wrap:nowrap;width:max-content">' + cats.map((c) => '<button class="chip' + (c === 'Semua' ? ' on' : '') + '" data-act="cat" data-c="' + esc(c) + '">' + esc(c) + '</button>').join('') + '</div></div>' +
      '<div class="body" style="padding-top:4px"><div class="small on-bg" id="igCount"></div><div id="igList" style="display:grid;gap:14px"></div></div>',
    mount: () => { renderList(); },
    on: {
      cat: (t) => { cat = t.dataset.c; shown = 12; $$('[data-act=cat]').forEach((b) => b.classList.toggle('on', b === t)); renderList(); $('.body').scrollTop = 0; },
      lagi: () => { shown += 12; renderList(); },
      ig: (t) => {
        const x = D.info.infografik.find((y) => y.id === t.dataset.id); if (!x) return;
        read.add(x.id); S.kemajuan.kiraan.infografik = Array.from(read);
        if (!S.kemajuan.kiraan.infografik.includes(x.id)) S.kemajuan.kiraan.infografik.push(x.id);
        addStars(read.size % 5 === 0 ? 1 : 0); save(); checkBadges();
        const m = openModal('<div style="display:flex;justify-content:center">' + babaImg('bercakap', 170, 'Baba bercakap', 'id="igBaba"') + '</div><div class="rpg" id="igRpg"></div>' +
          '<div class="card soft"><b>' + esc(x.tajuk) + '</b><p class="small muted" style="margin:6px 0 0">' + esc(x.nasihat) + '</p></div><button class="btn btn-y" data-act="closeModal">Faham!</button>');
        rpg($('#igRpg', m), x.dialog_baba).done.then(() => setBaba($('#igBaba', m), 'angguk'));
        renderList();
      }
    }
  };
};

/* ---------- Permainan ---------- */
SCREENS.permainan = () => {
  const g = (go2, ic, t, d, cls) => '<button class="card shine" data-go="' + go2 + '" style="display:flex;align-items:center;gap:14px;text-align:left;overflow:hidden"><span class="dots-ink"></span><img src="' + A.ikon(ic) + '" alt="" style="width:64px;height:64px;position:relative"><span style="flex:1;position:relative"><b style="font-size:17px;display:block">' + t + '</b><span class="small muted">' + d + '</span></span><span class="badge-n" style="position:relative;background:' + cls + '">MAIN</span></button>';
  return {
    html: topBar('Permainan', '⭐ ' + S.kemajuan.bintang + ' bintang terkumpul') +
      '<div class="body"><div class="hero shine" style="min-height:170px"><span class="stripes"></span><h2>Mari bermain bersama Baba!</h2><p>Kumpul bintang setiap kali kamu membuat pilihan yang selamat.</p>' +
      '<img class="baba" src="' + A.baba('angguk') + '" alt="Baba gembira" style="height:200px;bottom:-40px"></div>' +
      g('kuiz', 'kuiz', 'Kuiz Pantas', '10 soalan · 15 saat setiap soalan', '#E2591A') +
      g('babacard', 'babacard', 'BabaCard', 'Selamat atau bahaya? Seret atau tekan', '#13924A') +
      g('simulasi', 'simulasi', 'Simulasi Grooming', 'Belajar mengenal taktik orang asing', '#6326D9') + '</div>'
  };
};

function gameEnd(dari, skor, jumlah, lulus) {
  const bintang = skor;
  addStars(bintang);
  go(skor >= lulus ? 'menang' : 'kalah', { dari, skor, jumlah, bintang });
}

SCREENS.kuiz = () => {
  const Q = shuffle(D.main.kuiz_pantas).slice(0, 10);
  let i = 0, skor = 0, timer = null, left = 15;
  return {
    html: topBar('Kuiz Pantas', 'Jawab sebelum masa tamat!', { right: '<div class="timer" id="timer">15</div>' }) +
      '<div class="body"><div class="prog"><i id="prog" style="width:0"></i></div><div style="display:flex;align-items:flex-end;gap:10px">' + babaImg('berfikir', 120, 'Baba', 'id="qBaba"') +
      '<div class="card soft qbox" style="flex:1"><span class="badge-n" id="qn"></span><div class="q" id="qq" style="margin-top:8px"></div></div></div><div id="opts" style="display:grid;gap:10px"></div><div id="fb"></div></div>',
    mount: (el) => {
      const show = () => {
        const q = Q[i]; left = 15;
        $('#qn', el).textContent = 'SOALAN ' + (i + 1) + ' / ' + Q.length; $('#qq', el).textContent = q.soalan;
        $('#prog', el).style.width = (i / Q.length * 100) + '%'; $('#fb', el).innerHTML = '';
        $('#opts', el).innerHTML = Object.entries(q.pilihan).map(([k, v]) => '<button class="opt" data-act="pick" data-k="' + k + '"><b>' + k + '</b>' + esc(v) + '</button>').join('');
        setBaba($('#qBaba', el), 'berfikir');
        const tEl = $('#timer', el); tEl.textContent = left; tEl.classList.remove('low');
        clearInterval(timer);
        timer = setInterval(() => { left--; tEl.textContent = Math.max(0, left); tEl.classList.toggle('low', left <= 5); if (left <= 5 && left > 0) AU.sfx('ketik', 0.25); if (left <= 0) answer(null); }, 1000);
      };
      const answer = (k) => {
        clearInterval(timer);
        const q = Q[i], ok = k === q.jawapan;
        $$('.opt', el).forEach((b) => { b.disabled = true; if (b.dataset.k === q.jawapan) b.classList.add('ok'); else if (b.dataset.k === k) b.classList.add('no'); });
        if (ok) skor++;
        setBaba($('#qBaba', el), ok ? 'angguk' : 'geleng'); AU.sfx(ok ? 'betul' : 'salah'); AU.voice(ok ? 'gembira' : 'sedih', 0.6);
        $('#fb', el).innerHTML = '<div class="rpg"><span class="name">' + (ok ? 'Betul!' : k ? 'Hampir!' : 'Masa tamat!') + '</span><div class="txt">' + esc(q.penerangan) + '</div></div>' +
          '<button class="btn btn-y" style="margin-top:12px" data-act="next">' + (i < Q.length - 1 ? 'Seterusnya' : 'Lihat keputusan') + '</button>';
      };
      handlers.pick = (t) => answer(t.dataset.k);
      handlers.next = () => {
        if (i < Q.length - 1) { i++; show(); return; }
        S.kemajuan.kiraan.kuiz++; if (skor === Q.length) S.kemajuan.kiraan.kuizSempurna++; save();
        gameEnd('kuiz', skor, Q.length, 7);
      };
      show();
      return () => clearInterval(timer);
    }
  };
};

SCREENS.babacard = () => {
  const C = shuffle(D.main.babacard).slice(0, 10);
  let i = 0, skor = 0, busy = false;
  return {
    html: topBar('BabaCard', 'Selamat atau bahaya?') +
      '<div class="body"><div class="prog"><i id="prog" style="width:0"></i></div><div style="display:flex;justify-content:center">' + babaImg('berfikir', 130, 'Baba', 'id="cBaba"') + '</div>' +
      '<div class="card bcard" id="bcard"></div><div class="small on-bg" style="text-align:center">Seret kad ke kiri untuk Bahaya, ke kanan untuk Selamat</div>' +
      '<div class="row"><button class="btn btn-r" data-act="ans" data-a="Bahaya">' + I.x + ' Bahaya</button><button class="btn btn-g" data-act="ans" data-a="Selamat">' + I.check + ' Selamat</button></div><div id="fb"></div></div>',
    mount: (el) => {
      const cardEl = $('#bcard', el);
      const show = () => {
        busy = false; cardEl.className = 'card bcard';
        cardEl.innerHTML = '<span class="badge-n">KAD ' + (i + 1) + ' / ' + C.length + '</span><div>' + esc(C[i].kad) + '</div>';
        $('#prog', el).style.width = (i / C.length * 100) + '%'; $('#fb', el).innerHTML = '';
        $$('[data-act=ans]', el).forEach((b) => { b.disabled = false; });
        setBaba($('#cBaba', el), 'berfikir');
      };
      const answer = (a) => {
        if (busy) return; busy = true;
        const c = C[i], ok = a === c.jawapan; if (ok) skor++;
        cardEl.classList.add(a === 'Selamat' ? 'goR' : 'goL');
        $$('[data-act=ans]', el).forEach((b) => { b.disabled = true; });
        setBaba($('#cBaba', el), ok ? 'angguk' : 'geleng'); AU.sfx(ok ? 'betul' : 'salah'); AU.voice(ok ? 'gembira' : 'sedih', 0.6);
        setTimeout(() => {
          cardEl.className = 'card bcard';
          cardEl.innerHTML = '<span class="badge-n" style="background:' + (c.jawapan === 'Selamat' ? '#13924A' : '#C0221A') + '">' + c.jawapan.toUpperCase() + '</span><div>' + esc(c.kad) + '</div><div class="small muted" style="font-weight:500">' + esc(c.penerangan) + '</div>';
          $('#fb', el).innerHTML = '<button class="btn btn-y" data-act="next">' + (ok ? 'Betul! ' : 'Hampir! ') + (i < C.length - 1 ? 'Seterusnya' : 'Lihat keputusan') + '</button>';
        }, 320);
      };
      handlers.ans = (t) => answer(t.dataset.a);
      handlers.next = () => { if (i < C.length - 1) { i++; show(); } else { S.kemajuan.kiraan.kad++; save(); gameEnd('babacard', skor, C.length, 7); } };
      let sx = null;
      cardEl.addEventListener('pointerdown', (e) => { sx = e.clientX; });
      cardEl.addEventListener('pointerup', (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 60) answer(dx > 0 ? 'Selamat' : 'Bahaya'); });
      show();
    }
  };
};

SCREENS.simulasi = () => {
  const pr = S.profil || { nama: 'Kamu', avatar: 'kucing' };
  const ME_AV = A.avatar(pr.avatar || 'kucing'), THEM_AV = A.avatar('orang-asing');
  const ICO = {
    back: svg('<path d="M15 18l-6-6 6-6"/>'), x: svg('<path d="M18 6L6 18M6 6l12 12"/>', 2.6),
    video: svg('<path d="M15 10l4.5-3v10L15 14M3 7h12v10H3z"/>', 2), phone: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>', 2),
    mic: svg('<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3"/>'), spk: svg('<path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
    pad: svg('<path d="M5 4h3v3H5zM10.5 4h3v3h-3zM16 4h3v3h-3zM5 10h3v3H5zM10.5 10h3v3h-3zM16 10h3v3h-3zM10.5 16h3v3h-3z"/>'),
    end: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 9c-3.4 0-6.6 1-9 2.9-.6.5-.7 1.4-.2 2l1.7 2c.5.6 1.3.7 1.9.3l2.2-1.4c.4-.3.6-.8.5-1.3l-.3-1.6c2-.6 4.4-.6 6.4 0l-.3 1.6c-.1.5.1 1 .5 1.3l2.2 1.4c.6.4 1.4.3 1.9-.3l1.7-2c.5-.6.4-1.5-.2-2C18.6 10 15.4 9 12 9z"/></svg>',
    camOff: svg('<path d="M3 3l18 18M15 10l4.5-3v10L15 14M3 7h9"/>', 2.4), menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>', 2.4),
    chat: svg('<path d="M4 5h16v11H9l-5 4z"/>', 2.2), bag: svg('<path d="M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0"/>', 2.2), up: svg('<path d="M6 14l6-6 6 6"/>', 2.6), ban: svg('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>', 2.6), cam: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', 2.2)
  };
  const NC = { mesej: '#008069', game: '#FF8A3D', sosial: '#050505', server: '#F47FFF', dm: '#E7E9EA', thread: '#000000', panggilan: '#FFFFFF', video: '#FFFFFF' };
  const MC = { mesej: '#008069', game: '#7BEA9B', sosial: '#050505', server: '#5BE0FF', dm: '#E7E9EA', thread: '#000000', panggilan: '#FFFFFF', video: '#FFFFFF' };
  return {
    cls: 'simscr', title: 'Simulasi grooming',
    html: '<div class="simx" id="simx"><div class="body center"><p class="on-bg">Menyediakan senario…</p></div></div>',
    mount: (el) => {
      const root = $('#simx', el);
      let sc = null, step = 0, res = [], clock = 0, timers = [], lastThem = '', blocked = false;
      const later = (fn, t) => timers.push(setTimeout(fn, t));
      const clear = () => { timers.forEach(clearTimeout); timers = []; };
      const call = () => sc.platform === 'panggilan' || sc.platform === 'video';
      const tm = (c) => '8:' + String((40 + c) % 60).padStart(2, '0') + ' PTG';
      const resolve = (x) => {
        if (x.steps) return Object.assign({ kenal: '' }, x);
        const P = D.sim.persona[x.p];
        const f = (t) => String(t).replace(/\{topik\}/g, P.topik).replace(/\{hadiah\}/g, P.hadiah);
        const st = (x.jenis === 'asing' ? [P.buka[x.b]] : []).concat(x.l.map((id) => D.sim.langkah[id]));
        return { id: x.id, jenis: x.jenis, platform: P.platform, app: P.app, who: P.who, sub: P.sub, post: P.post, kenal: P.kenal || '',
          steps: st.map((y) => ({ tag: y.tag, msg: y.msg.map(f), opt: y.opt.map((o) => [f(o[0]), o[1], f(o[2] || '')]) })) };
      };
      const pickScenario = () => {
        const seen = store.get('simLepas', []);
        const jenis = Math.random() < 0.5 ? 'kawan' : 'asing';
        let pool = D.sim.senario.filter((x) => x.jenis === jenis && !seen.includes(x.id));
        if (!pool.length) pool = D.sim.senario;
        const x = rand(pool);
        store.set('simLepas', seen.concat(x.id).slice(-60));
        return resolve(x);
      };
      const head = () => {
        const p = sc.platform;
        if (p === 'panggilan') return '<div class="callhead"><img src="' + THEM_AV + '" alt="Pemanggil tidak dikenali"><b>' + esc(sc.who) + '</b><span>' + esc(sc.sub) + '</span><span class="tm" id="sxTimer">00:05</span></div>';
        if (p === 'video' || p === 'game') return '';
        return '<div class="ahead">' + ICO.back + '<img class="hav" src="' + THEM_AV + '" alt="">' +
          '<div class="ht"><b>' + esc(p === 'thread' ? 'Kiriman' : sc.who) + '</b><span>' + esc(p === 'thread' ? 'Balasan kepada kiriman kamu' : sc.sub) + '</span></div>' +
          '<div class="ic">' + ICO.video + ICO.phone + '</div></div>';
      };
      const scene = () => {
        const p = sc.platform;
        if (p === 'game') return '<div class="world" aria-hidden="true"><div class="floor"></div>' +
          '<i class="blk" style="left:7%;top:52%;width:70px;height:26px;background:#E8453C"></i><i class="blk" style="left:36%;top:48%;width:56px;height:22px;background:#F5CD30"></i>' +
          '<i class="blk" style="left:64%;top:44%;width:54px;height:22px;background:#2F9BEA"></i><i class="blk" style="left:82%;top:34%;width:60px;height:22px;background:#7BCB3A"></i>' +
          '<div class="fig" style="left:25%;bottom:58px"><span class="tag" style="color:#7BEA9B">' + esc(pr.nama) + '</span><div class="hd" style="background:#F5CD30"><i></i></div><div class="bd"><b style="width:9px;height:24px;background:#F5CD30"></b><b style="width:26px;height:24px;background:#0D69AC"></b><b style="width:9px;height:24px;background:#F5CD30"></b></div><div class="lg"><b style="background:#A4BD47"></b><b style="background:#A4BD47"></b></div></div>' +
          '<div class="fig" style="left:60%;bottom:66px"><span class="gbub" id="sxBub" hidden></span><span class="tag">' + esc(sc.who) + '</span><div class="hd" style="background:#2B2B2B"><i style="border-color:#E8453C"></i></div><div class="bd"><b style="width:9px;height:24px;background:#2B2B2B"></b><b style="width:26px;height:24px;background:#1B1B1B;border-top:4px solid #E8453C"></b><b style="width:9px;height:24px;background:#2B2B2B"></b></div><div class="lg"><b style="background:#333"></b><b style="background:#333"></b></div></div>' +
          '<span class="stick"></span><span class="jmp">' + ICO.up + '</span></div>' +
          '<div class="hudtop" aria-hidden="true"><span>' + ICO.menu + '</span><span class="on">' + ICO.chat + '</span><span>' + ICO.bag + '</span></div>' +
          '<div class="lb" aria-hidden="true"><div><span>Pemain</span><span>Mata</span></div><div><span>' + esc(sc.who) + '</span><span>12</span></div><div class="me"><span>' + esc(pr.nama) + '</span><span>9</span></div><div><span>LilyBunny_7</span><span>7</span></div><div><span>Aqil_Gamer</span><span>4</span></div></div>' +
          '<div class="gin" aria-hidden="true">Ketik di sini untuk berbual</div>';
        if (p === 'video') return '<div class="vfeed" aria-hidden="true"></div><div class="vcenter"><img src="' + THEM_AV + '" alt="Pemanggil video tidak dikenali"><b>' + esc(sc.who) + '</b><span class="off">' + ICO.camOff + 'Kamera dimatikan · <span id="sxTimer">00:05</span></span></div>' +
          '<div class="selfcam"><img src="' + ME_AV + '" alt="">Kamera kamu<br>tertutup</div>';
        return '';
      };
      const post = () => sc.platform !== 'thread' ? '' : '<div class="post"><img class="pa" src="' + ME_AV + '" alt=""><div style="flex:1;min-width:0"><div style="font-weight:700">' + esc(pr.nama) + ' <span style="font-weight:400;color:#999">@' + esc(pr.nama.toLowerCase().replace(/\s+/g, '.')) + ' · 1j</span></div><div style="margin-top:2px">' + esc(sc.post || '') + '</div><div class="art" aria-hidden="true"></div><div class="stats"><span>♡ 24</span><span>💬 <b id="sxRep">0</b></span><span>↻ 2</span></div></div></div>';
      const build = () => {
        root.className = 'simx sk-' + sc.platform;
        root.innerHTML = '<div class="train"><button class="x" data-go="permainan" aria-label="Keluar simulasi">' + ICO.x + '</button>' +
          '<div style="min-width:0;flex:1"><b>Simulasi · ' + esc(sc.app) + '</b><small id="sxStep"></small><div class="sxdots" id="sxDots" aria-hidden="true"></div></div>' +
          '<button class="sxblock" data-act="sxBlock" aria-label="Sekat ' + esc(sc.who) + '">' + ICO.ban + '<span>Sekat</span></button></div>' +
          '<div class="app">' + head() + '<div class="achat">' + scene() + '<div class="scroll" aria-live="polite"><div class="inner" id="sxIn">' + post() + '</div></div><div id="sxEnd"></div></div>' +
          '<div class="areply" id="sxReply"></div></div>';
      };
      const updTop = () => {
        const n = sc.steps.length, g = res.filter((x) => x === 'g').length;
        $('#sxStep', root).textContent = (sc.jenis === 'kawan' ? 'Kawan dalam talian · ' : 'Orang tidak dikenali · ') + (step >= n ? 'Selesai · ' + g + ' / ' + n + ' pilihan selamat' : 'Langkah ' + (step + 1) + ' / ' + n + ' · ' + sc.steps[step].tag);
        $('#sxDots', root).innerHTML = sc.steps.map((_, k) => '<i class="' + (k < res.length ? { g: 'ok', b: 'no', n: 'neu' }[res[k]] : k === step ? 'on' : '') + '"></i>').join('');
        const t = $('#sxTimer', root); if (t) { const s2 = 5 + clock * 9; t.textContent = String(Math.floor(s2 / 60)).padStart(2, '0') + ':' + String(s2 % 60).padStart(2, '0'); }
        const r = $('#sxRep', root); if (r) r.textContent = $$('.srow', root).length;
      };
      const GB = (k) => 'assets/images/sim/gambar-' + k + '.svg';
      const msgHtml = (t) => { const m = /^\[gambar:([\w-]+)\]$/.exec(t); return m ? '<img class="sximg" src="' + GB(m[1]) + '" alt="' + esc((D.sim.gambar[m[1]] || {}).nama || 'Gambar') + '">' : esc(t); };
      const row = (who, text) => {
        const p = sc.platform, me = who === 'me', sys = who === 'sys';
        const name = me ? (p === 'game' ? pr.nama + ':' : 'Kamu') : (p === 'game' ? sc.who + ':' : call() ? (p === 'video' ? sc.who : 'Pemanggil') : sc.who);
        const ts = p === 'thread' ? ' ' + (me ? '@kamu' : sc.sub) + ' · ' + Math.max(1, 9 - clock) + 'm' : ' Hari ini pada ' + tm(clock);
        const d = document.createElement('div');
        d.className = 'srow ' + who;
        d.innerHTML = '<img class="av" src="' + (me ? ME_AV : THEM_AV) + '" alt=""><div class="bub"><div class="nm" style="color:' + (me ? MC[p] : NC[p]) + '">' + esc(name) + '<span class="ts">' + esc(ts) + '</span></div><div class="tx">' + msgHtml(text) + '</div>' +
          (sys ? '' : '<div class="meta">' + tm(clock) + (me && p === 'mesej' ? '<span class="tick">✓✓</span>' : '') + '</div>') + '</div>';
        $('#sxIn', root).appendChild(d);
        if (!me && !sys && p === 'game') { const b = $('#sxBub', root); b.hidden = false; b.textContent = text.startsWith('[gambar:') ? '📷 Gambar' : text.length > 60 ? text.slice(0, 58) + '…' : text; }
        updTop();
      };
      const typing = (on) => {
        const t = $('#sxTyping', root); if (t) t.remove();
        if (!on) return;
        const d = document.createElement('div'); d.className = 'srow them typing'; d.id = 'sxTyping';
        d.innerHTML = '<img class="av" src="' + THEM_AV + '" alt=""><div class="bub"><span class="nm" style="color:' + NC[sc.platform] + '">' + esc(call() ? (sc.platform === 'video' ? sc.who : 'Pemanggil') : sc.who) + '</span><span class="tdots"><i></i><i></i><i></i></span></div>';
        $('#sxIn', root).appendChild(d);
      };
      const fake = (t) => { $('#sxReply', root).innerHTML = cbtns() + (call() ? '' : '<div class="fake">' + esc(t) + '</div>'); };
      const cbtns = () => !call() ? '' : '<div class="cbtns" aria-hidden="false"><span>' + ICO.mic + '</span><span>' + (sc.platform === 'video' ? ICO.video : ICO.pad) + '</span><span>' + ICO.spk + '</span><button class="end" data-go="permainan" aria-label="Tamatkan panggilan">' + ICO.end + '</button></div>';
      const feed = () => {
        const msgs = sc.steps[step].msg;
        typing(true); fake(sc.who + (call() ? ' sedang bercakap…' : ' sedang menaip…'));
        msgs.forEach((m, k) => later(() => {
          typing(false); AU.sfx('notifikasi', 0.4); row('them', m); clock++;
          if (k < msgs.length - 1) typing(true); else choose();
        }, 1100 + k * 1300));
      };
      const choose = () => {
        const st = sc.steps[step];
        const order = shuffle(st.opt.map((_, i) => i));
        $('#sxReply', root).innerHTML = cbtns() + '<div class="lbl">' + (call() ? 'APA KAMU AKAN CAKAP?' : 'PILIH BALASAN KAMU') + '</div>' +
          order.map((i) => '<button class="sx-opt" data-act="sxPick" data-i="' + i + '">' + esc(st.opt[i][0]) + '</button>').join('') +
          (call() ? '' : '<button class="sx-pic" data-act="sxTray">' + ICO.cam + 'Hantar gambar</button><div class="sx-tray" id="sxTray" hidden>' +
            Object.keys(D.sim.gambar).map((k) => '<button data-act="sxSend" data-g="' + k + '" aria-label="Hantar ' + esc(D.sim.gambar[k].nama) + '"><img src="' + GB(k) + '" alt=""><span>' + esc(D.sim.gambar[k].nama.replace('Gambar ', '')) + '</span></button>').join('') + '</div>');
      };
      handlers.sxTray = () => { const t = $('#sxTray', root); t.hidden = !t.hidden; if (!t.hidden) t.scrollIntoView({ block: 'nearest' }); };
      handlers.sxSend = (t) => {
        const k = t.dataset.g, g = D.sim.gambar[k];
        row('me', '[gambar:' + k + ']'); clock++;
        if (g.jenis !== 'peribadi') { res.push('n'); AU.sfx('ketik', 0.4); fake(''); updTop(); later(next, 900); return; }
        res.push('b'); updTop(); AU.sfx('salah'); AU.voice('sedih', 0.6);
        feedback(false, g.fb + ' Kongsi gambar peribadi dengan keluarga sahaja.');
      };
      const feedback = (ok, text) => {
        $('#sxReply', root).innerHTML = cbtns() + '<div class="sxfb ' + (ok ? 'good' : 'bad') + '" role="status"><div class="top">' + babaImg(ok ? 'angguk' : 'geleng', 84, 'Baba') +
          '<div><h3>' + (ok ? 'Pilihan yang selamat!' : 'Tunggu dulu!') + '</h3><p>' + esc(text) + '</p></div></div>' +
          '<button class="btn btn-y" data-act="sxNext">' + (step >= sc.steps.length - 1 ? 'Lihat keputusan' : 'Teruskan') + '</button></div>';
      };
      // sekat: menang terus dan ke senario seterusnya
      handlers.sxBlock = () => {
        if (blocked) return;
        blocked = true; clear();
        typing(false); row('sys', 'Kamu telah menyekat ' + sc.who + '. Dia tidak boleh menghubungi kamu lagi.');
        res = sc.steps.map(() => 'g'); step = sc.steps.length; updTop();
        $('#sxEnd', root).innerHTML = '';
        S.kemajuan.kiraan.sim++; addStars(3); save(); checkBadges();
        AU.sfx('menang'); AU.voice('gembira', 0.7);
        let n = 4;
        $('#sxReply', root).innerHTML = '<div class="sxfb good" role="status"><div class="top">' + babaImg('lompat', 96, 'Baba melompat gembira') +
          '<div><h3>Kamu menang! +3 ⭐</h3><p>Menyekat ialah langkah paling pantas untuk kekal selamat. Jangan lupa beritahu orang dewasa juga.</p></div></div>' +
          '<button class="btn btn-y" data-act="sxAgain">Senario seterusnya (<span id="sxCd">' + n + '</span>)</button></div>';
        const tick = () => { n--; const c = $('#sxCd', root); if (!c) return; if (n <= 0) { start(); return; } c.textContent = n; later(tick, 1000); };
        later(tick, 1000);
      };
      handlers.sxPick = (t) => {
        const st = sc.steps[step], o = st.opt[+t.dataset.i];
        row('me', o[0]); clock++;
        if (o[1] === 2) {
          // pilihan neutral: Baba tidak memberi reaksi, perbualan diteruskan
          res.push('n'); AU.sfx('ketik', 0.4); fake(''); updTop();
          later(next, 900); return;
        }
        const ok = o[1] === 1; res.push(ok ? 'g' : 'b'); updTop();
        AU.sfx(ok ? 'betul' : 'salah'); AU.voice(ok ? 'gembira' : 'sedih', 0.6);
        feedback(ok, o[2]);
      };
      const next = () => {
        if (step >= sc.steps.length - 1) { step++; end(); return; }
        step++; updTop(); feed();
      };
      handlers.sxNext = next;
      const end = () => {
        updTop();
        const n = sc.steps.length, g = res.filter((x) => x === 'g').length, b = res.filter((x) => x === 'b').length, nn = n - g - b;
        const great = b === 0 && g >= 3;
        AU.sfx(great ? 'menang' : 'notifikasi');
        fake('');
        $('#sxEnd', root).innerHTML = '<div class="scrim"></div><div class="sxfb end" role="dialog" aria-label="Keputusan simulasi"><div class="top">' + babaImg(great ? 'lompat' : 'berfikir', 96, 'Baba') +
          '<div><h3>' + (great ? 'Hebat! ' : 'Cuba lagi! ') + g + ' / ' + n + '</h3><p>' + (great ? 'Kamu kenal taktik orang asing dan tahu cara menjaga diri.' : b === 0 ? 'Kamu tidak dalam bahaya, tetapi balasan neutral membiarkan perbualan berterusan. Lebih baik berhenti dan beritahu orang dewasa.' : 'Tak apa. Ingat: jangan berahsia, jangan kongsi maklumat, dan beritahu orang dewasa.') + '</p></div></div>' +
          '<div class="cnt">' + g + ' selamat · ' + nn + ' neutral · ' + b + ' berisiko</div><div style="font-weight:700;font-size:13px">Tanda bahaya dalam perbualan ini:</div><ul>' + sc.steps.map((x) => '<li>' + esc(x.tag) + '</li>').join('') + '</ul>' +
          '<button class="btn btn-y" data-act="sxAgain">Cuba senario lain</button><button class="btn" data-act="sxDone">Selesai</button></div>';
      };
      const start = () => {
        clear(); sc = pickScenario(); step = 0; res = []; clock = 0; blocked = false;
        build();
        if (sc.kenal) row('sys', sc.kenal);
        row('sys', call() ? 'Panggilan latihan. Pemanggil ini tidak wujud. Baba ada bersama kamu.' : 'Ini latihan. Orang dalam sembang ini tidak wujud. Baba ada bersama kamu.');
        feed();
      };
      handlers.sxAgain = () => { if (!blocked) { S.kemajuan.kiraan.sim++; save(); } start(); };
      handlers.sxDone = () => {
        const n = sc.steps.length, g = res.filter((x) => x === 'g').length, b = res.filter((x) => x === 'b').length;
        S.kemajuan.kiraan.sim++; save();
        gameEnd('simulasi', g, n, b === 0 && g >= 3 ? g : g + 1);
      };
      loadSim().then(start).catch(() => go('ralat', { file: 'data/qna-simulasi-senario.json' }));
      return clear;
    }
  };
};

SCREENS.menang = (p) => ({
  html: '<div class="body center" style="align-items:center;text-align:center">' + babaImg('lompat', 250, 'Baba melompat gembira') +
    '<h1 class="on-bg" style="font-size:46px">Hebat!</h1><div class="card soft" style="width:100%"><div style="font:800 40px \'Baloo 2\'">' + p.skor + ' / ' + p.jumlah + '</div><div class="muted">+' + p.bintang + ' ⭐ bintang</div></div>' +
    '<p class="on-bg" style="margin:0">Kamu tahu cara menjaga diri di internet!</p>' +
    '<div style="display:grid;gap:12px;width:100%"><button class="btn btn-y" data-go="' + p.dari + '">Main lagi</button><button class="btn" data-go="permainan">Kembali ke Permainan</button></div></div>',
  mount: () => { setTimeout(() => AU.voice('gembira'), 300); }
});
SCREENS.kalah = (p) => ({
  html: '<div class="body center" style="align-items:center;text-align:center">' + babaImg('menangis', 230, 'Baba menangis') +
    '<h1 class="on-bg" style="font-size:42px">Cuba lagi!</h1><div class="card soft" style="width:100%"><div style="font:800 40px \'Baloo 2\'">' + p.skor + ' / ' + p.jumlah + '</div><div class="muted">+' + p.bintang + ' ⭐ bintang</div></div>' +
    '<p class="on-bg" style="margin:0">Tak apa! Setiap kali mencuba, kamu belajar sesuatu yang baharu.</p>' +
    '<div style="display:grid;gap:12px;width:100%"><button class="btn btn-y" data-go="' + p.dari + '">Cuba lagi</button><button class="btn" data-go="pendidikan">Belajar dahulu</button></div></div>',
  mount: () => { setTimeout(() => AU.voice('sedih'), 300); }
});

/* ---------- Analisis Baba ---------- */
let ANS = null; // jawapan disimpan dalam memori sahaja, tidak dihantar ke mana-mana
SCREENS.analisis = () => {
  const Q = D.analisis.soalan;
  const faces = { 1: 'detektif-bercakap', 2: 'detektif-berfikir', 3: 'detektif-waspada', 4: 'detektif-berfikir', 5: 'detektif-bercakap' };
  let i = -1, dlg = null;
  ANS = Q.map(() => []);
  return {
    html: topBar('Analisis Baba', 'Detektif Baba akan bantu kamu') +
      '<div class="body" id="anBody"></div>',
    mount: (el) => {
      const body = $('#anBody', el);
      const intro = () => {
        body.innerHTML = '<div style="display:flex;justify-content:center">' + babaImg('detektif-bercakap', 220, 'Baba detektif') + '</div><div class="rpg" id="anRpg"></div>' +
          '<div class="card soft small"><b>Sebelum mula:</b><ul class="list" style="margin-top:6px"><li>Ada 50 soalan dalam 5 fasa (lebih kurang 10 minit).</li><li>Jawab dengan jujur. Tiada jawapan yang salah.</li><li>Jawapan kamu tidak disimpan dan tidak dihantar ke mana-mana.</li><li>Ini alat pembelajaran, bukan penilaian profesional.</li></ul></div>' +
          '<button class="btn btn-y" data-act="start">Mula siasatan</button>';
        dlg = rpg($('#anRpg', body), ['Detektif Baba melapor diri!', 'Baba akan tanya beberapa soalan tentang dunia dalam talian kamu, kemudian beri nasihat yang sesuai.'], { mood: 'berfikir' });
      };
      const show = () => {
        const q = Q[i], multi = q.jenis === 'banyak';
        const newPhase = i === 0 || Q[i - 1].fasa !== q.fasa;
        body.innerHTML = '<div style="display:flex;align-items:center;gap:10px"><span class="badge-n">FASA ' + q.fasa + ' / 5 · ' + esc(q.nama_fasa.toUpperCase()) + '</span><span class="small on-bg" style="margin-left:auto">' + (i + 1) + ' / ' + Q.length + '</span></div>' +
          '<div class="prog"><i style="width:' + (i / Q.length * 100) + '%"></i></div>' +
          '<div style="display:flex;align-items:flex-end;gap:10px">' + babaImg(faces[q.fasa], 120, 'Baba detektif', 'id="anBaba"') + '<div class="rpg" id="anRpg" style="flex:1"></div></div>' +
          '<div class="card soft qbox"><div class="q">' + esc(q.soalan) + '</div><div class="small muted" style="margin-top:4px">' + (multi ? 'Boleh pilih lebih daripada satu' : 'Pilih satu') + '</div></div>' +
          '<div style="display:grid;gap:10px">' + q.pilihan.map((p, k) => '<button class="opt' + (ANS[i].includes(k) ? ' sel' : '') + '" data-act="opt" data-k="' + k + '" aria-pressed="' + ANS[i].includes(k) + '"><b>' + (multi ? (ANS[i].includes(k) ? '✓' : '') : String.fromCharCode(65 + k)) + '</b>' + esc(p.teks) + '</button>').join('') + '</div>' +
          '<div class="row"><button class="btn" data-act="prev"' + (i === 0 ? ' disabled' : '') + '>Sebelum</button><button class="btn btn-y" data-act="nextQ"' + (ANS[i].length ? '' : ' disabled') + '>' + (i === Q.length - 1 ? 'Lihat keputusan' : 'Seterusnya') + '</button></div>';
        if (dlg) dlg.stop();
        dlg = rpg($('#anRpg', body), newPhase ? ['Fasa ' + q.fasa + ': ' + q.nama_fasa + '!', q.dialog_baba] : [q.dialog_baba], { mood: 'berfikir' });
        body.scrollTop = 0;
      };
      handlers.start = () => { i = 0; show(); };
      handlers.opt = (t) => {
        const k = +t.dataset.k, q = Q[i];
        if (q.jenis === 'banyak') { ANS[i] = ANS[i].includes(k) ? ANS[i].filter((x) => x !== k) : ANS[i].concat(k); }
        else ANS[i] = [k];
        $$('.opt', body).forEach((b) => { const on = ANS[i].includes(+b.dataset.k); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); if (q.jenis === 'banyak') $('b', b).textContent = on ? '✓' : ''; });
        $('[data-act=nextQ]', body).disabled = !ANS[i].length;
      };
      handlers.prev = () => { if (i > 0) { i--; show(); } };
      handlers.nextQ = () => { if (i < Q.length - 1) { i++; show(); } else { S.kemajuan.kiraan.analisis++; save(); checkBadges(); go('hasil'); } };
      intro();
      return () => { if (dlg) dlg.stop(); };
    }
  };
};

function scoreAnalysis() {
  const Q = D.analisis.soalan, K = D.analisis.keputusan;
  let skor = 0, kritikal = false, fasa3 = false;
  const nasihat = [], apps = [];
  Q.forEach((q, i) => {
    (ANS[i] || []).forEach((k) => {
      const p = q.pilihan[k];
      skor += p.skor;
      if (p.kritikal) kritikal = true;
      if (q.fasa === 3 && p.skor >= 3) fasa3 = true;
      if (i <= 1) { if (!apps.includes(p.teks)) apps.push(p.teks); }
      else if (p.nasihat && p.skor > 0) nasihat.push({ s: p.skor, t: p.nasihat });
    });
  });
  let lv = K.findIndex((k) => skor >= k.skor_min && skor <= k.skor_max);
  if (lv < 0) lv = K.length - 1;
  if (fasa3) lv = Math.max(lv, 2);
  if (kritikal) lv = 3;
  const mintaBantuan = (ANS[Q.length - 1] || []).includes(2);
  const appTips = apps.map((a) => (Q[0].pilihan.find((p) => p.teks === a) || {}).nasihat).filter(Boolean);
  return { skor, level: K[lv], lv, kritikal, nasihat: nasihat.sort((a, b) => b.s - a.s).slice(0, 5).map((x) => x.t), appTips: Array.from(new Set(appTips)).slice(0, 3), mintaBantuan };
}

SCREENS.hasil = () => {
  if (!ANS) return SCREENS.analisis();
  const r = scoreAnalysis(), k = r.level;
  const anim = ['detektif-angguk', 'detektif-berfikir', 'detektif-waspada', 'polis-bercakap'][r.lv];
  const igs = (k.infografik_id || []).map((id) => D.info.infografik.find((x) => x.id === id)).filter(Boolean).slice(0, 3);
  const act = { permainan: ['permainan', 'Main permainan', 'btn-p'], pendidikan: ['pendidikan', 'Belajar di Pendidikan', 'btn-g'], bantuan: ['bantuan', 'Saya Perlukan Bantuan', 'btn-r'] };
  const acts = (r.mintaBantuan && !k.tindakan.includes('bantuan') ? ['bantuan'] : []).concat(k.tindakan);
  return {
    html: topBar('Keputusan Analisis', 'Detektif Baba dah selesai menyiasat', { right: '' }) +
      '<div class="body"><div class="level shine" style="background:linear-gradient(160deg,' + k.warna + ',' + k.warna + 'CC)"><span class="dots"></span>' +
      '<div style="font-size:12px;font-weight:700;letter-spacing:.14em;position:relative">TAHAP ' + esc(k.tahap.toUpperCase()) + '</div><h2 style="position:relative">' + esc(k.label) + '</h2><p style="margin:6px 0 0;position:relative">' + esc(k.ringkasan) + '</p></div>' +
      '<div style="display:flex;align-items:flex-end;gap:10px">' + babaImg(anim, 140, k.reaksi) + '<div class="rpg" id="hRpg" style="flex:1"></div></div>' +
      '<div class="card soft"><h3 style="font-size:18px;margin-bottom:8px">Nasihat Baba</h3><ol class="list">' + k.nasihat.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ol></div>' +
      (r.nasihat.length ? '<div class="card soft"><h3 style="font-size:18px;margin-bottom:8px">Nasihat khas untuk kamu</h3><ul class="list">' + r.nasihat.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul></div>' : '') +
      (r.appTips.length ? '<div class="card soft"><h3 style="font-size:18px;margin-bottom:8px">Tip untuk aplikasi kamu</h3><ul class="list">' + r.appTips.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul></div>' : '') +
      (igs.length ? '<div class="on-bg" style="font-weight:700">Infografik untuk kamu</div>' + igs.map((x) => { const c = CAT[x.kategori] || ['bintang', '#6FA8FF', '#2257E0']; return '<div class="card ig" style="--a:' + c[1] + ';--b:' + c[2] + '"><div class="head"><span class="dots"></span><img src="' + A.ikon(c[0]) + '" alt=""><div><small>' + esc(x.kategori) + '</small><h3>' + esc(x.tajuk) + '</h3></div></div><div class="bodyi">' + esc(x.fakta) + '<b>' + esc(x.nasihat) + '</b></div></div>'; }).join('') : '') +
      acts.map((a) => act[a] ? '<button class="btn ' + act[a][2] + '" data-go="' + act[a][0] + '">' + act[a][1] + '</button>' : '').join('') +
      '<div class="row"><button class="btn" data-go="analisis">Ulang analisis</button><button class="btn" data-go="utama">Utama</button></div>' +
      '<p class="small on-bg" style="margin:0;opacity:.85">Analisis ini alat pembelajaran dan saringan awal, bukan penilaian profesional. Jawapan kamu tidak disimpan.</p></div>',
    mount: (el) => {
      const d = rpg($('#hRpg', el), k.dialog, { mood: r.lv >= 2 ? 'sedih' : 'gembira' });
      AU.voice(r.lv === 0 ? 'gembira' : r.lv === 3 ? 'amaran' : 'terkejut');
      if (r.lv === 3) setTimeout(() => showDanger({ tajuk: 'Kamu berhak mendapat bantuan sekarang.', teks: 'Ini bukan salah kamu. Tekan butang di bawah untuk melihat siapa yang boleh membantu.' }), 2500);
      return () => d.stop();
    }
  };
};

/* ---------- Saya Perlukan Bantuan ---------- */
SCREENS.bantuan = () => {
  const line = (href, bg, ic, t, n, d) => '<a class="card line-row" href="' + href + '" target="_blank" rel="noopener"><span class="ico" style="background:' + bg + '">' + ic + '</span><span style="flex:1"><b style="display:block">' + t + '</b><span class="small muted">' + d + '</span></span><span class="num">' + n + '</span></a>';
  return {
    html: topBar('Saya Perlukan Bantuan', 'Kamu tidak keseorangan') +
      '<div class="body"><div style="display:flex;align-items:flex-end;gap:10px">' + babaImg('polis-bercakap', 160, 'Baba berpakaian polis') + '<div class="rpg" id="hpRpg" style="flex:1"></div></div>' +
      line('tel:999', 'linear-gradient(180deg,#FF5A4E,#C0221A)', I.phone, 'Kecemasan', '999', 'Jika kamu dalam bahaya sekarang') +
      line('tel:15999', 'linear-gradient(180deg,#5BE09A,#13924A)', I.phone, 'Talian Kasih', '15999', 'Bantuan untuk kanak-kanak dan keluarga') +
      line('https://wa.me/60192615999', 'linear-gradient(180deg,#5BE09A,#0B8F46)', I.wa, 'WhatsApp Talian Kasih', '019-261 5999', 'Jika susah untuk bercakap') +
      '<div class="card soft"><h3 style="font-size:18px;margin-bottom:8px">3 langkah penting</h3><ol class="list"><li><b>Simpan</b> bukti: ambil screenshot mesej itu.</li><li><b>Sekat</b> orang itu dan jangan balas.</li><li><b>Cerita</b> kepada orang dewasa yang kamu percayai.</li></ol></div>' +
      '<div class="card soft"><h3 style="font-size:18px;margin-bottom:8px">Siapa boleh membantu?</h3><ul class="list"><li>Ibu bapa atau penjaga</li><li>Guru atau kaunselor sekolah</li><li>Saudara dewasa yang kamu percayai</li><li>Polis (999) jika kamu dalam bahaya</li></ul>' +
      '<p class="small muted" style="margin:10px 0 0">Tak tahu nak mula? Cuba katakan: <b>"Ada orang tidak dikenali dalam talian buat saya rasa tak selamat. Boleh tolong saya?"</b></p></div>' +
      '<button class="btn btn-p" data-go="analisis">Cuba Analisis Baba</button></div>',
    mount: (el) => { const d = rpg($('#hpRpg', el), ['Baba ada di sini untuk kamu.', 'Kamu tidak salah, dan kamu sangat berani kerana mahu meminta bantuan.'], { mood: 'sedih' }); return () => d.stop(); }
  };
};

/* ---------- Ganjaran ---------- */
SCREENS.ganjaran = () => {
  const k = S.kemajuan, tahap = Math.floor(k.bintang / 50) + 1, baki = 50 - (k.bintang % 50);
  const gelaran = ['Peneroka Cilik', 'Peneroka Berani', 'Pengawal Savana', 'Wira Internet', 'Legenda Meerkat'][Math.min(4, tahap - 1)];
  return {
    html: topBar('Ganjaran', 'Kumpul bintang dan lencana') +
      '<div class="body"><div class="hero shine" style="min-height:0"><span class="stripes"></span><div style="display:flex;align-items:center;gap:14px;position:relative"><img src="' + A.ikon('bintang') + '" alt="" style="width:80px">' +
      '<div><div style="font:800 44px/1 \'Baloo 2\'">' + k.bintang + '</div><div style="font-weight:600">bintang terkumpul</div></div></div>' +
      '<div style="position:relative;margin-top:12px;display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span>Tahap ' + tahap + ' · ' + gelaran + '</span><span>' + baki + ' lagi</span></div>' +
      '<div class="prog" style="position:relative;margin-top:6px;background:rgba(255,255,255,.55)"><i style="width:' + ((k.bintang % 50) * 2) + '%;background:linear-gradient(90deg,#7B3FE4,#D62A80)"></i></div></div>' +
      '<div class="card soft" style="display:flex;align-items:center;gap:14px"><img src="' + A.ikon('api-hari-berturut') + '" alt="" style="width:52px"><div><b style="font-size:16px">' + k.hari.berturut + ' hari berturut-turut</b><div class="small muted">Buka Baba Chat setiap hari untuk kekalkan api!</div></div></div>' +
      '<div class="on-bg" style="font-weight:700">Lencana (' + k.lencana.length + ' / ' + BADGES.length + ')</div>' +
      '<div class="grid3">' + BADGES.map((b) => { const got = k.lencana.includes(b.id); return '<div class="card soft medal' + (got ? '' : ' lock') + '"><img src="' + A.ikon(b.ikon) + '" alt=""><div>' + esc(b.nama) + '</div>' + (got ? '' : '<div class="small muted">Terkunci</div>') + '</div>'; }).join('') + '</div>' +
      '<button class="btn btn-p" data-go="almari">Lihat topi di Almari Baba</button></div>' + navBar('ganjaran')
  };
};

/* ---------- Almari Baba ---------- */
SCREENS.almari = () => {
  const k = S.kemajuan;
  const prev = () => (k.topi === 'tiada' ? A.baba('angguk') : A.topi(k.topi));
  const prevSet = () => (k.topi === 'tiada' ? 'none' : TOPI_SET[k.topi]);
  return {
    html: topBar('Almari Baba', 'Pilih topi untuk Baba') +
      '<div class="body"><div class="card soft" style="display:flex;justify-content:center;padding:18px"><img class="baba" id="hatBaba" data-h="185" src="' + prev() + '" alt="Baba" style="height:' + babaH(prevSet(), 185) + 'px"></div>' +
      '<div class="small on-bg">Topi baharu dibuka apabila kamu mengumpul bintang. Kamu ada ⭐ ' + k.bintang + '.</div>' +
      '<div class="grid3">' + HATS.map((h) => { const open = k.bintang >= h.min; return '<button class="card hat' + (k.topi === h.id ? ' on' : '') + (open ? '' : ' lock') + '" data-act="hat" data-id="' + h.id + '" aria-pressed="' + (k.topi === h.id) + '"' + (open ? '' : ' aria-disabled="true"') + '><img src="' + A.topiIkon(h.id) + '" alt=""><div>' + esc(h.nama) + '</div>' + (open ? '' : '<div class="small">🔒 ' + h.min + ' ⭐</div>') + '</button>'; }).join('') + '</div></div>' + navBar('almari'),
    on: {
      hat: (t) => {
        const h = HATS.find((x) => x.id === t.dataset.id);
        if (k.bintang < h.min) { toast('Kumpul ' + (h.min - k.bintang) + ' bintang lagi untuk ' + h.nama + '!'); AU.voice('sedih', 0.5); return; }
        k.topi = h.id; save();
        $$('.hat').forEach((b) => { const on = b === t; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
        setBaba($('#hatBaba'), null, prev(), prevSet()); AU.voice('gembira');
      }
    }
  };
};

/* ---------- Tetapan ---------- */
SCREENS.tetapan = () => {
  const T = S.tetapan, pr = S.profil || { nama: '-', avatar: 'kucing' };
  const sw = (key, label) => '<div class="set-row"><span class="l">' + label + '</span><button class="switch" role="switch" aria-checked="' + !!T[key] + '" aria-label="' + label + '" data-act="sw" data-k="' + key + '"></button></div>';
  const tests = [['ketik', 'Ketik'], ['dialog', 'Dialog'], ['betul', 'Betul'], ['salah', 'Salah'], ['menang', 'Menang'], ['notifikasi', 'Notifikasi'], ['lompat', 'Lompat'], ['amaran-bahaya', 'Amaran']];
  const voices = [['dialog', 'Bual'], ['gembira', 'Gembira'], ['sedih', 'Sedih'], ['terkejut', 'Terkejut'], ['diketuk', 'Diketuk'], ['amaran', 'Amaran']];
  return {
    html: topBar('Tetapan', 'Profil, bunyi dan paparan') +
      '<div class="body"><div class="card soft" style="display:flex;align-items:center;gap:12px"><img src="' + A.avatar(pr.avatar) + '" alt="" style="width:60px"><div style="flex:1"><b style="font-size:17px">' + esc(pr.nama) + '</b><div class="small muted">Profil disimpan dalam peranti ini sahaja</div></div><button class="btn" style="width:auto;min-height:44px;font-size:14px" data-go="profil" data-p=\'{"edit":true}\'>Tukar</button></div>' +
      '<div class="card soft">' + sw('muzik', 'Muzik') + '<div class="set-row"><span class="l">Kelantangan muzik</span><input type="range" min="0" max="1" step="0.05" value="' + T.volMuzik + '" id="vol" aria-label="Kelantangan muzik"></div>' +
      sw('bunyi', 'Bunyi butang') + sw('suara', 'Suara Baba') + sw('gelap', 'Mod malam') + '</div>' +
      '<div class="card soft"><h3 style="font-size:17px;margin-bottom:8px">Uji bunyi</h3><div class="chips">' + tests.map(([k, n]) => '<button class="chip" data-act="tsfx" data-k="' + k + '" data-silent>' + n + '</button>').join('') + '</div>' +
      '<h3 style="font-size:17px;margin:12px 0 8px">Uji suara Baba</h3><div class="chips">' + voices.map(([k, n]) => '<button class="chip" data-act="tvoice" data-k="' + k + '" data-silent>' + n + '</button>').join('') + '</div></div>' +
      '<button class="btn btn-r" data-act="tdanger">' + I.alert + ' Uji notifikasi bahaya</button>' +
      '<div class="row"><button class="btn" data-go="intro">Pengenalan</button><button class="btn" data-act="reset">Set semula</button></div>' +
      '<div class="card soft small"><b>Baba Chat</b> · Projek Kerja Sosial UniSZA, Kumpulan 10.<br>Nombor bantuan: Kecemasan 999 · Talian Kasih 15999.</div></div>' + navBar('tetapan'),
    mount: (el) => { $('#vol', el).addEventListener('input', (e) => { T.volMuzik = +e.target.value; AU.setVol(T.volMuzik); save(); }); },
    on: {
      sw: (t) => {
        const key = t.dataset.k; T[key] = !T[key]; t.setAttribute('aria-checked', T[key]); save();
        if (key === 'gelap') { applyTheme(); AU.playMusic(musicFor(cur)); }
        if (key === 'muzik') { if (T.muzik) AU.playMusic(musicFor(cur)); else AU.stopMusic(); }
      },
      tsfx: (t) => { if (!S.tetapan.bunyi) toast('Bunyi butang dimatikan.'); else AU.play(D.audio.bunyi_ui[t.dataset.k], 0.7); },
      tvoice: (t) => { if (!S.tetapan.suara) toast('Suara Baba dimatikan.'); else AU.voice(t.dataset.k, 0.9); },
      tdanger: () => showDanger({ tajuk: 'Ini hanya ujian notifikasi bahaya.', teks: 'Beginilah rupa amaran apabila Baba mengesan mesej yang berbahaya dalam Sembang.', petikan: 'Jangan beritahu sesiapa. Jom jumpa esok.' }),
      reset: () => {
        openModal('<div class="card"><b style="font-size:17px">Set semula semua kemajuan?</b><p class="muted small" style="margin:6px 0 0">Bintang, lencana, topi dan profil akan dipadam daripada peranti ini.</p></div><div class="row"><button class="btn" data-act="closeModal">Batal</button><button class="btn btn-r" data-act="doReset">Set semula</button></div>',
          { mid: true, on: { doReset: () => { try { ['profil', 'tetapan', 'kemajuan'].forEach((k) => localStorage.removeItem('babachat.' + k)); } catch (_) { /* abaikan */ } location.reload(); } } });
      }
    }
  };
};

SCREENS.ralat = (p) => ({
  music: null, cls: 'intro',
  html: '<div class="body center" style="text-align:center;align-items:center"><img src="' + A.logo + '" alt="" style="width:110px;border-radius:30px"><h1>Alamak!</h1>' +
    '<p style="color:#E4DEF2;max-width:330px">Fail data tidak dapat dibaca' + (p.file ? ' (' + esc(p.file) + ')' : '') + '.</p>' +
    (location.protocol === 'file:' ? '<div class="card" style="text-align:left;font-size:14px">Aplikasi dibuka terus daripada fail. Buka melalui pelayan:<ol class="list" style="margin-top:8px"><li>Visual Studio Code → sambungan <b>Live Server</b></li><li>Klik kanan <b>index.html</b> → <b>Open with Live Server</b></li></ol>Atau buka pautan GitHub Pages.</div>' : '<button class="btn btn-y" onclick="location.reload()">Cuba lagi</button>') + '</div>'
});

/* =========================================================
   10. Mula
   ========================================================= */
function sparkles() {
  const box = $('#sparkles'); let h = '';
  for (let i = 0; i < 14; i++) h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;animation-duration:' + (7 + Math.random() * 7).toFixed(1) + 's;animation-delay:' + (Math.random() * 8).toFixed(1) + 's;width:' + (3 + Math.random() * 4).toFixed(1) + 'px;height:' + (3 + Math.random() * 4).toFixed(1) + 'px"></i>';
  box.innerHTML = h;
}
async function boot() {
  applyTheme(); sparkles();
  try { await loadData(); } catch (e) { cur = 'ralat'; go('ralat', { file: e.message }, { noHistory: true }); return; }
  history.replaceState({ s: 'mula' }, '');
  go('splash');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { /* tiada mod luar talian */ });
}
document.addEventListener('visibilitychange', () => { if (!AU.ctx) return; if (document.hidden) AU.ctx.suspend(); else AU.ctx.resume(); });
// untuk ujian sahaja
window.BabaChat = { go, Chat, S, D, scoreAnalysis: () => scoreAnalysis(), setAns: (a) => { ANS = a; } };
boot();
})();
