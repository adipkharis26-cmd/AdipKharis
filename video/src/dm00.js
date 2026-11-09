// Dari 1 mnt — contoh pola (Indonesia vs Dunia, dipersingkat). BUKAN episode: episode wajib 60–90 detik.
BADGE = 'INDONESIA vs DUNIA';
window.EXTRA_SFX = [{ t: pauseBefore('Tapi') - 0.6, type: 'riser', d: 0.7 }];
const SHOTS = [
  // hook: angka besar + bendera
  shotAt(0, { bg: 'sunburst', c: [C.biru, C.biruTua] }, t => {
    sticker(flag('CH'), 300, 520, 230, at('Swiss'));
    txt('SEPORSI DI SWISS', 540, 800, 0.05, { size: 104 });
    counter(0, 500, 540, 1010, at('lima'), 1.0, { prefix: 'Rp', suffix: ' RIBU+', size: 170 });
    sticker('mangkuk', 800, 520, 200, at('makan'));
  }),
  shotAt(pauseBefore('Di', 1), { bg: 'confetti', c: [C.mint, '#0E8F6A'] }, t => {
    sticker(flag('ID'), 540, 560, 280, at('Indonesia'));
    txt('INDONESIA?', 540, 860, at('Indonesia'), { size: 130 });
    counter(0, 30, 540, 1070, at('tiga'), 0.7, { prefix: 'Rp', suffix: ' RIBU', size: 190, col: C.putih });
    mascot(at('tiga'), at('ribu', 1) + 1.4, 'kaget');
  }),
  // data + sumber
  shotAt(pauseBefore('Ini'), { bg: 'halftone', c: ['#2A3A8F', C.navy] }, t => {
    pill('MENURUT DATA NUMBEO', 540, 420, at('data'), { size: 54, bg: C.cyan });
    txt('98 NEGARA', 540, 640, at('sembilan'), { size: 150, hi: ['98'] });
    bars([
      { label: 'Swiss', value: 31, valueText: '$31', flag: 'CH', col: C.pink },
      { label: 'Norwegia', value: 25, valueText: '$25', flag: 'NO', col: C.oranye },
      { label: 'Denmark', value: 24, valueText: '$24', flag: 'DK', col: C.kuning },
      { label: 'Indonesia', value: 1.7, valueText: '$1,7', flag: 'ID', col: C.putih },
    ], 90, 900, 900, at('Swiss', 1), { stagger: 0.35 });
  }),
  // twist
  shotAt(pauseBefore('Tapi'), { bg: 'warning' }, t => {
    impact('TAPI TUNGGU', 760, at('Tapi'), { size: 190 });
    stamp('DOLAR ≠ GAJI', 540, 1120, at('gaji'), { col: C.merah, size: 110 });
  }),
  shotAt(pauseBefore('Murah', 1), { bg: 'split' }, t => {
    timbangan(540, 760, -0.8, at('Murah', 1), 'duit', 'kartu');
    txt('MURAH ≠ RINGAN', 540, 1300, at('ringan'), { size: 110, col: C.kuning });
    ilustrasi(at('Murah', 1));
  }),
  // penutup: pertanyaan natural
  shotAt(pauseBefore('Jadi'), { bg: 'stripes', c: [C.ungu, '#5B21B6'] }, t => {
    txt('TERGANTUNG DOMPET', 540, 560, at('tergantung'), { size: 112 });
    sticker('uang', 540, 860, 260, at('dompet', 1));
  }),
  shotAt(pauseBefore('Kalau'), { bg: 'radial', c: [C.pink, '#B4123F'] }, t => {
    txt('MAKAN SIANGMU', 540, 600, at('makan', 2), { size: 120 });
    txt('HARGANYA BERAPA?', 540, 760, at('harganya'), { size: 120, col: C.kuning });
    sticker('nasi', 540, 1050, 240, at('siangmu'));
    mascot(at('harganya') - 0.3, DURATION, 'mikir', { side: 'L' });
  }),
];
