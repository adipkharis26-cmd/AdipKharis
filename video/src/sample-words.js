// Free 10s consistency sample (no recorded VO): caption timings written by hand.
const VO = (() => {
  const LINES = [
    ['Tanggal dua puluh lima.', 0.25, 1.55, 0],
    ['Gaji Mas Kharis akhirnya masuk!', 1.75, 3.6, 0],
    ['Tiga hari kemudian…', 4.1, 5.2, 1],
    ['saldonya tinggal dua belas ribu.', 5.4, 7.1, 1],
    ['Kamu juga gini?', 7.6, 8.4, 2],
    ['Komen SAMA di bawah!', 8.55, 9.6, 2],
  ];
  const words = [];
  LINES.forEach(([txt, a, b, sec]) => timeWords(txt, a, b).forEach(([w, s, e]) => words.push({ w, s, e, sec })));
  return { duration: 9.6, words };
})();
