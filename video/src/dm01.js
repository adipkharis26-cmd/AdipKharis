// Dari 1 mnt dm01 — Indonesia vs Dunia: jam kerja Indonesia vs Jepang & Korea (edit v2 "Pop v2": padat, gerak terus, perbandingan visual)
BADGE = 'INDONESIA vs DUNIA';
window.EXTRA_SFX = [
  { t: 0, type: 'boom', gain: 0.8 },
  { t: pauseBefore('Tapi') - 0.7, type: 'riser', d: 0.8 },
  { t: at('Tapi'), type: 'boom', gain: 0.9 },
  { t: at('tergantung') - 0.5, type: 'riser', d: 0.5 },
];
const SHOTS = [
  // 1 HOOK — jam raksasa meledak + pertanyaan kata per kata (detik 0 sudah penuh)
  shotAt(0, { bg: 'sunburst', c: [C.biru, C.biruTua] }, t => {
    speed(0, 0.8); burst(540, 1080, 0.05, { n: 34 }); punch(0.05, 0.1);
    sticker('jam', 540, 1080, 400, 0.02, { rot: -0.08 });
    kata('SIAPA PALING LAMA KERJA?', 560, 0, { times: [0.05, 1.76, 2.28, 2.51], size: 150, mark: ['LAMA'], hi: ['KERJA?'] });
  }),
  // 2 tiga bendera terbang masuk tepat saat disebut
  shotAt(pauseBefore('Indonesia'), { bg: 'city' }, t => {
    sticker(flag('ID'), 230, 720, 250, at('Indonesia'), { from: 'left', rot: -0.1 });
    sticker(flag('JP'), 540, 560, 250, at('Jepang'), { from: 'top', rot: 0.05 });
    sticker(flag('KR'), 850, 720, 250, at('Korea'), { from: 'right', rot: 0.1 });
    txt('INDONESIA', 230, 920, at('Indonesia') + 0.15, { size: 60 });
    txt('JEPANG', 540, 760, at('Jepang') + 0.15, { size: 60 });
    txt('KOREA', 850, 920, at('Korea') + 0.15, { size: 60 });
    impact('SIAPA JUARANYA?', 1220, at('Selatan') + 0.2, { size: 150 });
  }),
  // 3 tebakan netizen (maskot 1)
  shotAt(pauseBefore('Kebanyakan'), { bg: 'chat' }, t => {
    chat('Pasti Jepang lah!', 420, at('Kebanyakan'), 'L', { size: 66 });
    chat('Jepang kan gila kerja', 580, at('langsung'), 'R', { size: 66 });
    chat('Jepang 100%', 740, at('menebak'), 'L', { size: 66 });
    sticker(flag('JP'), 560, 1060, 300, at('Jepang', 1), { from: 'bottom' }); burst(560, 1060, at('Jepang', 1) + 0.3, { n: 18 });
    mascot(at('Kebanyakan') + 0.2, pauseBefore('Menurut') - 0.05, 'mikir', { side: 'R' });
  }),
  // 4 sumber data
  shotAt(pauseBefore('Menurut'), { bg: 'halftone', c: ['#2A3A8F', C.navy] }, t => {
    pill('MENURUT DATA OECD', 540, 420, at('data'), { size: 60, bg: C.cyan });
    sticker('grafikNaik', 540, 1050, 340, at('OECD'), { from: 'right' });
    kata('JAM KERJA SETAHUN', 700, at('OECD'), { times: [at('OECD') + 0.2, at('OECD') + 0.45, at('OECD') + 0.7], size: 140, mark: ['SETAHUN'] });
  }),
  // 5 KOREA vs JEPANG — split versus, kamera fokus bergantian, mahkota untuk Korea
  shotAt(pauseBefore('pekerja'), { bg: 'radial', c: ['#2A3A8F', C.navy], drift: 0.4 }, t => {
    vs({ flag: 'KR', label: 'KOREA SEL.', valueText: '±1.900 JAM', col: C.pink, tv: at('seribu') },
       { flag: 'JP', label: 'JEPANG', valueText: '±1.600 JAM', col: C.biru, tv: at('seribu', 1) },
       at('pekerja'), { win: 'L', tw: at('jauh') });
    fokus(at('seribu') - 0.1, 300, 900, 1.22, 1.6);
    fokus(at('seribu', 1) - 0.1, 790, 900, 1.22, 1.0);
    pill('PER TAHUN', 540, 1500, at('setahun'), { size: 54 });
  }),
  // 6 twist kecil: Indonesia? (maskot 2)
  shotAt(pauseBefore('Lalu'), { bg: 'warning' }, t => {
    kata('LALU INDONESIA?', 600, at('Lalu'), { size: 160, hi: ['INDONESIA?'] });
    sticker(flag('ID'), 540, 960, 340, at('Indonesia', 1), { from: 'bottom' }); speed(at('Indonesia', 1), at('Indonesia', 1) + 0.7);
    mascot(at('Lalu') + 0.1, pauseBefore('Menurut', 1) - 0.05, 'kaget', { side: 'R' });
  }),
  // 7 sumber kedua
  shotAt(pauseBefore('Menurut', 1), { bg: 'radial', c: [C.cyan, '#0E9F8E'] }, t => {
    pill('GRONINGEN GROWTH & DEVELOPMENT CENTRE', 540, 420, at('Groningen'), { size: 44, bg: C.kuning });
    sticker('buku', 540, 860, 320, at('data', 1), { from: 'left' });
    kata('DATA SEJARAH EKONOMI', 1180, at('Growth'), { times: [at('Growth'), at('and'), at('Development')], size: 110, hi: ['EKONOMI'] });
  }),
  // 8 RACE — tiga negara berpacu, Indonesia dapat mahkota
  shotAt(pauseBefore('angkanya'), { bg: 'stripes', c: ['#2A3A8F', C.navy], drift: 0.5 }, t => {
    kata('JAM KERJA SETAHUN', 400, at('angkanya'), { times: [at('angkanya'), at('angkanya') + 0.2, at('angkanya') + 0.4], size: 100 });
    race([
      { flag: 'JP', label: 'JEPANG', value: 1600, valueText: '±1.600', col: C.biru, t: at('angkanya') + 0.2 },
      { flag: 'KR', label: 'KOREA', value: 1900, valueText: '±1.900', col: C.pink, t: at('angkanya') + 0.5 },
      { flag: 'ID', label: 'INDONESIA', value: 1950, valueText: '±1.950', col: C.kuning, t: at('seribu', 2) },
    ], 0, { crown: true, y: 1380, h: 560 });
    burst(840, 640, at('seribu', 2) + 0.9, { n: 30 });
    pill('OECD · GGDC', 540, 1560, at('setahun', 1), { size: 40, bg: 'rgba(255,255,255,.92)' });
  }),
  // 9 selisih 9 minggu
  shotAt(pauseBefore('Itu'), { bg: 'sunburst', c: [C.oranye, '#C2410C'] }, t => {
    counter(0, 9, 540, 640, at('sembilan', 2), 0.6, { suffix: ' MINGGU', size: 230 }); burst(540, 640, at('sembilan', 2) + 0.6);
    kata('LEBIH PANJANG DARIPADA JEPANG', 1000, at('lebih'), { size: 115, mark: ['PANJANG'] });
    sticker('kalender', 220, 1330, 200, at('minggu'), { from: 'left' });
    sticker(flag('JP'), 860, 1330, 200, at('Jepang', 3), { from: 'right' });
  }),
  // 10 TWIST — glitch + "TAPI TUNGGU" (maskot 3)
  shotAt(pauseBefore('Tapi'), { bg: 'warning', drift: 1.6 }, t => {
    glitchAt(at('Tapi'), 0.5); speed(at('Tapi'), at('Tapi') + 0.8, { col: C.kuning, a: 0.35 });
    impact('TAPI TUNGGU!', 540, at('Tapi'), { size: 200 }); shake(at('Tapi'), 22, 0.4);
    kata('ANGKA INI RATA-RATA SEMUA PEKERJA', 960, at('Angka'), { size: 110, hi: ['SEMUA'] });
    mascot(at('Tapi') + 0.15, pauseBefore('termasuk') - 0.05, 'kaget', { side: 'L' });
  }),
  // 11 paruh waktu ikut dihitung
  shotAt(pauseBefore('termasuk'), { bg: 'split' }, t => {
    kata('TERMASUK PARUH WAKTU', 480, at('termasuk'), { size: 130, mark: ['PARUH', 'WAKTU'] });
    iconGrid('orang', 10, 6, 540, 980, 5, 185, at('termasuk') + 0.2, { stagger: 0.05 });
    panah(900, 1380, 860, 1130, at('paruh') + 0.2, { col: C.pink });
    pill('PARUH WAKTU', 760, 1460, at('waktu') + 0.1, { size: 48, bg: C.pink, fg: C.putih });
  }),
  // 12 terlihat lebih ringan — timbangan
  shotAt(pauseBefore('Negara', 1), { bg: 'confetti', c: [C.ungu, '#5B21B6'] }, t => {
    kata('BANYAK PARUH WAKTU', 450, at('banyak'), { times: [at('banyak'), at('paruh', 1), at('waktu', 1)], size: 120 });
    timbangan(540, 840, 0.9, at('akan'), 'kantor', 'kopi');
    impact('TERLIHAT RINGAN', 1380, at('ringan'), { size: 150 });
  }),
  // 13 padahal...
  shotAt(pauseBefore('padahal'), { bg: 'sunset' }, t => {
    kata('PADAHAL PEKERJA PENUH WAKTUNYA', 560, at('padahal'), { size: 115, hi: ['PENUH'] });
    stamp('BELUM TENTU', 540, 980, at('belum'), { col: C.merah, size: 130 });
    sticker('mikir', 820, 1330, 230, at('tentu'), { from: 'bottom' });
  }),
  // 14 sumber beda-beda
  shotAt(pauseBefore('Sumber'), { bg: 'halftone', c: ['#0E8F6A', '#064E3B'] }, t => {
    kata('SUMBER LAIN ANGKANYA BEDA-BEDA', 520, at('Sumber'), { size: 120, mark: ['BEDA-BEDA'] });
    sticker('buku', 260, 1080, 230, at('pun'), { from: 'left' });
    sticker('grafikNaik', 540, 1140, 230, at('angkanya', 1), { from: 'bottom' });
    sticker('grafikTurun', 820, 1080, 230, at('beda-beda'), { from: 'right' });
  }),
  // 15 data resmi Korea
  shotAt(pauseBefore('Data', 2), { bg: 'city' }, t => {
    pill('DATA RESMI KOREA', 540, 420, at('resmi'), { size: 60, bg: C.pink, fg: C.putih });
    sticker(flag('KR'), 540, 720, 320, at('Korea', 2), { from: 'top' });
    counter(1500, 1870, 540, 1080, at('seribu', 3), 1.6, { prefix: '±', suffix: ' JAM', size: 190 });
    pill('PER TAHUN', 540, 1290, at('jam', 3), { size: 50 });
  }),
  // 16 BPS
  shotAt(pauseBefore('dan'), { bg: 'sunburst', c: [C.hijau, '#0F7A55'] }, t => {
    pill('BPS', 540, 420, at('BPS'), { size: 80, bg: C.cyan });
    sticker(flag('ID'), 540, 720, 300, at('pekerja', 4), { from: 'left' });
    counter(0, 41, 540, 1070, at('empat'), 0.9, { prefix: '±', suffix: ' JAM', size: 240 }); burst(540, 1070, at('empat') + 0.9);
    kata('SEMINGGU', 1300, at('seminggu'), { size: 130, hi: ['SEMINGGU'] });
  }),
  // 17 jadi siapa?
  shotAt(pauseBefore('Jadi'), { bg: 'stripes', c: [C.pink, '#B4123F'] }, t => {
    kata('JADI SIAPA PALING LAMA?', 560, at('Jadi'), { size: 140, mark: ['LAMA?'], markCol: C.biru });
    sticker(flag('ID'), 250, 1050, 230, at('paling', 1), { from: 'bottom', rot: -0.12 });
    sticker(flag('JP'), 540, 1100, 230, at('lama', 1), { from: 'bottom' });
    sticker(flag('KR'), 830, 1050, 230, at('bekerja', 2), { from: 'bottom', rot: 0.12 });
  }),
  // 18 tergantung
  shotAt(pauseBefore('tergantung'), { bg: 'radial', c: [C.ungu, '#3B0764'] }, t => {
    hujan('tanya', at('tergantung'), at('dihitung') + 0.4, { n: 14, alpha: 0.75 });
    impact('TERGANTUNG', 640, at('tergantung'), { size: 210 }); speed(at('tergantung'), at('tergantung') + 0.6);
    kata('SIAPA YANG DIHITUNG', 960, at('siapa', 1), { size: 120, hi: ['DIHITUNG'] });
  }),
  // 19 penutup: pertanyaan untuk penonton (maskot 4)
  shotAt(pauseBefore('Kalau'), { bg: 'sunburst', c: [C.pink, '#B4123F'] }, t => {
    kata('SEMINGGU INI KAMU KERJA BERAPA JAM?', 620, at('seminggu', 1), { size: 140, hi: ['BERAPA', 'JAM?'], mark: ['KAMU'], markCol: C.biru });
    sticker('jam', 540, 1120, 280, at('jam', 5), { from: 'bottom' }); burst(540, 1120, at('jam', 5) + 0.2);
    mascot(at('Kalau') + 0.1, DURATION, 'senang', { side: 'L' });
  }),
];
