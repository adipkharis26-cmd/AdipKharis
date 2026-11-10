// Dari 1 mnt dm01 — Indonesia vs Dunia: jam kerja Indonesia vs Jepang & Korea
BADGE = 'INDONESIA vs DUNIA';
window.EXTRA_SFX = [{ t: pauseBefore('Tapi') - 0.6, type: 'riser', d: 0.7 }];
const SHOTS = [
  shotAt(0, { bg: 'sunburst', c: [C.biru, C.biruTua] }, t => {
    txt('SIAPA PALING', 540, 480, at('Negara'), { size: 120 });
    impact('LEMBUR?', 700, at('paling'), { size: 210 });
    sticker('jam', 540, 1050, 300, at('lama'));
    mascot(at('Negara') + 0.3, at('Negara') + 3.2, 'mikir', { side: 'L' });
  }),
  shotAt(pauseBefore('Indonesia'), { bg: 'confetti', c: [C.mint, '#0E8F6A'] }, t => {
    sticker(flag('ID'), 300, 600, 240, at('Indonesia'));
    sticker(flag('JP'), 780, 600, 240, at('Jepang'));
    sticker(flag('KR'), 540, 950, 240, at('Korea'));
    txt('SIAPA?', 540, 1280, at('Selatan'), { size: 170, col: C.kuning });
  }),
  shotAt(pauseBefore('Kebanyakan'), { bg: 'stripes', c: [C.ungu, '#5B21B6'] }, t => {
    txt('KEBANYAKAN', 540, 520, at('Kebanyakan'), { size: 120 });
    txt('MENEBAK', 540, 690, at('menebak'), { size: 120 });
    sticker(flag('JP'), 540, 1010, 320, at('Jepang', 1));
  }),
  shotAt(pauseBefore('Menurut'), { bg: 'halftone', c: ['#2A3A8F', C.navy] }, t => {
    pill('MENURUT DATA OECD', 540, 430, at('data'), { size: 56, bg: C.cyan });
    sticker(flag('KR'), 540, 760, 260, at('Korea', 1));
    txt('KOREA SELATAN', 540, 1020, at('Selatan', 1), { size: 120 });
  }),
  shotAt(pauseBefore('rata-rata'), { bg: 'radial', c: [C.pink, '#B4123F'] }, t => {
    counter(0, 1900, 540, 650, at('seribu'), 1.2, { suffix: ' JAM', size: 200 });
    txt('PER TAHUN', 540, 880, at('setahun'), { size: 110 });
    sticker('kalender', 540, 1150, 240, at('setahun'));
  }),
  shotAt(pauseBefore('Jepang', 2), { bg: 'solid', c: [C.biru] }, t => {
    sticker(flag('JP'), 540, 560, 260, at('Jepang', 2));
    txt('JEPANG DI BAWAHNYA', 540, 840, at('jauh'), { size: 105 });
    counter(0, 1600, 540, 1100, at('seribu', 1), 1.0, { suffix: ' JAM', size: 190, col: C.putih });
  }),
  shotAt(pauseBefore('Lalu'), { bg: 'sunset' }, t => {
    sticker(flag('ID'), 540, 560, 300, at('Indonesia', 1));
    txt('LALU INDONESIA?', 540, 880, at('Lalu'), { size: 120 });
    sticker('tanya', 540, 1160, 240, at('Indonesia', 1) + 0.2);
    mascot(at('Lalu'), at('Lalu') + 2.8, 'kaget', { side: 'R' });
  }),
  shotAt(pauseBefore('Menurut', 1), { bg: 'city' }, t => {
    pill('GRONINGEN GROWTH & DEV. CENTRE', 540, 430, at('Groningen'), { size: 46, bg: C.kuning });
    sticker('buku', 540, 760, 250, at('Growth'));
    txt('SUMBER DATA', 540, 1040, at('Development'), { size: 120 });
  }),
  shotAt(pauseBefore('angkanya'), { bg: 'sunburst', c: [C.oranye, '#C2410C'] }, t => {
    counter(0, 1950, 540, 650, at('seribu', 2), 1.4, { suffix: ' JAM', size: 200 });
    txt('SETAHUN DI INDONESIA', 540, 900, at('setahun', 1), { size: 100 });
    sticker(flag('ID'), 540, 1150, 240, at('lima'));
  }),
  shotAt(pauseBefore('Itu'), { bg: 'warning' }, t => {
    txt('LEBIH PANJANG', 540, 480, at('lebih'), { size: 120 });
    counter(0, 9, 540, 780, at('sembilan', 1), 0.8, { suffix: ' MINGGU', size: 230 });
    txt('DARIPADA JEPANG', 540, 1050, at('daripada'), { size: 110, col: C.kuning });
  }),
  shotAt(pauseBefore('Tapi'), { bg: 'chat' , c: [C.navy]}, t => {
    impact('TAPI TUNGGU', 760, at('Tapi'), { size: 190 });
    sticker('mata', 540, 1100, 260, at('tunggu'));
    mascot(at('Tapi') + 0.2, at('Tapi') + 3, 'kaget', { side: 'L' });
  }),
  shotAt(pauseBefore('Angka'), { bg: 'split' }, t => {
    txt('RATA-RATA', 540, 480, at('rata-rata', 1), { size: 130 });
    txt('SEMUA PEKERJA', 540, 660, at('semua'), { size: 120, col: C.kuning });
    iconGrid('orang', 10, 6, 540, 980, 5, 130, at('pekerja'));
  }),
  shotAt(pauseBefore('termasuk'), { bg: 'radial', c: [C.cyan, '#0E9F8E'] }, t => {
    txt('TERMASUK', 540, 560, at('termasuk'), { size: 120, col: C.navy, ol: C.putih });
    stamp('PARUH WAKTU', 540, 880, at('paruh'), { col: C.merah, size: 120 });
    sticker('jam', 540, 1200, 240, at('waktu'));
  }),
  shotAt(pauseBefore('Negara', 1), { bg: 'stripes', c: [C.pink, '#B4123F'] }, t => {
    txt('BANYAK PARUH WAKTU', 540, 520, at('banyak'), { size: 100 });
    txt('TERLIHAT LEBIH', 540, 720, at('terlihat'), { size: 120 });
    impact('RINGAN', 930, at('ringan'), { size: 210 });
  }),
  shotAt(pauseBefore('padahal'), { bg: 'halftone', c: ['#4C1D95', C.navy] }, t => {
    txt('PADAHAL', 540, 560, at('padahal'), { size: 120 });
    txt('PENUH WAKTU?', 540, 760, at('penuh'), { size: 140, col: C.kuning });
    sticker('tanya', 540, 1100, 280, at('belum'));
    mascot(at('belum'), at('belum') + 2.6, 'mikir', { side: 'R' });
  }),
  shotAt(pauseBefore('Sumber'), { bg: 'confetti', c: [C.biru, C.biruTua] }, t => {
    txt('SUMBER LAIN', 540, 560, at('Sumber'), { size: 130 });
    txt('ANGKANYA BEDA', 540, 760, at('angkanya', 1), { size: 130, col: C.kuning });
    sticker('timbangan', 540, 1100, 280, at('beda-beda'));
  }),
  shotAt(pauseBefore('Data'), { bg: 'sunburst', c: [C.hijau, '#0F7A55'] }, t => {
    pill('DATA RESMI KOREA', 540, 430, at('resmi'), { size: 56 });
    sticker(flag('KR'), 540, 760, 240, at('Korea', 2));
    counter(0, 1870, 540, 1060, at('seribu', 3), 1.2, { suffix: ' JAM', size: 190, col: C.putih });
  }),
  shotAt(pauseBefore('dan'), { bg: 'warning' }, t => {
    pill('BPS', 540, 430, at('BPS'), { size: 70, bg: C.cyan });
    sticker(flag('ID'), 540, 740, 240, at('BPS'));
    counter(0, 41, 540, 1040, at('empat'), 0.8, { suffix: ' JAM', size: 220 });
    txt('SEMINGGU', 540, 1260, at('seminggu'), { size: 130, col: C.kuning });
  }),
  shotAt(pauseBefore('Jadi'), { bg: 'solid', c: [C.ungu] }, t => {
    txt('SIAPA PALING LAMA?', 540, 560, at('siapa'), { size: 110 });
    txt('TERGANTUNG', 540, 780, at('tergantung'), { size: 150, col: C.kuning });
    txt('YANG DIHITUNG', 540, 960, at('dihitung'), { size: 120 });
    sticker('timbangan', 540, 1250, 240, at('dihitung'));
  }),
  shotAt(pauseBefore('Kalau'), { bg: 'radial', c: [C.pink, '#B4123F'] }, t => {
    txt('SEMINGGU INI', 540, 560, at('seminggu', 1), { size: 130 });
    txt('KAMU KERJA', 540, 740, at('kamu'), { size: 130 });
    txt('BERAPA JAM?', 540, 920, at('berapa'), { size: 150, col: C.kuning });
    sticker('jam', 540, 1250, 280, at('jam', 5));
    mascot(at('berapa') - 0.3, DURATION, 'senang', { side: 'L' });
  }),
];
