/* Formulir langkah demi langkah untuk Catatan Tani (tanpa pustaka luar).
   Tanpa JavaScript, semua langkah tetap tampil berurutan sehingga formulir masih bisa dipakai. */
(function () {
  document.documentElement.classList.add('js');

  var SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  function terbilang(n) {
    n = Math.floor(n);
    if (n < 12) return SATUAN[n];
    if (n < 20) return terbilang(n - 10) + ' belas';
    if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '');
    if (n < 200) return 'seratus' + (n - 100 ? ' ' + terbilang(n - 100) : '');
    if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '');
    if (n < 2000) return 'seribu' + (n - 1000 ? ' ' + terbilang(n - 1000) : '');
    if (n < 1e6) return terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '');
    if (n < 1e9) return terbilang(Math.floor(n / 1e6)) + ' juta' + (n % 1e6 ? ' ' + terbilang(n % 1e6) : '');
    return terbilang(Math.floor(n / 1e9)) + ' miliar' + (n % 1e9 ? ' ' + terbilang(n % 1e9) : '');
  }
  function tanggalLokal(d) { // bukan toISOString(): itu UTC, di WIB sebelum jam 07.00 akan jadi tanggal kemarin
    var p = function (x) { return (x < 10 ? '0' : '') + x; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function angka(el) { return Number((el.value || '').replace(/\D/g, '')) || 0; }
  function rupiah(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  window.TaniUtil = { terbilang: terbilang, rupiah: rupiah, angka: angka };

  // format angka + teks terbilang
  document.querySelectorAll('[data-angka]').forEach(function (el) {
    var out = el.dataset.terbilang ? document.querySelector(el.dataset.terbilang) : null;
    var satuan = el.dataset.satuan || 'rupiah';
    function segarkan() {
      var n = angka(el);
      el.value = n ? n.toLocaleString('id-ID') : '';
      if (out) out.textContent = n ? (terbilang(n) + ' ' + satuan) : '';
      el.dispatchEvent(new Event('angka-berubah', { bubbles: true }));
    }
    el.addEventListener('input', segarkan);
    segarkan();
  });
  // tombol tambah cepat (+10rb, dst.)
  document.querySelectorAll('[data-tambah]').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.querySelector(b.dataset.target);
      var n = b.dataset.tambah === '0' ? 0 : angka(el) + Number(b.dataset.tambah);
      el.value = n ? String(n) : '';
      el.dispatchEvent(new Event('input'));
      el.focus();
    });
  });

  // pilihan tanggal: Hari ini / Kemarin / Tanggal lain
  document.querySelectorAll('[data-pilih-tanggal]').forEach(function (box) {
    var input = box.querySelector('input[type=date]');
    var lain = box.querySelector('[data-tanggal-lain]');
    box.querySelectorAll('input[name=pilih_tgl]').forEach(function (r) {
      r.addEventListener('change', function () {
        var d = new Date();
        if (r.value === 'kemarin') d.setDate(d.getDate() - 1);
        if (r.value !== 'lain') input.value = tanggalLokal(d);
        if (lain) lain.hidden = r.value !== 'lain';
      });
    });
    if (lain) lain.hidden = true;
  });

  // formulir langkah
  document.querySelectorAll('form[data-langkah]').forEach(function (form) {
    var langkah = Array.prototype.slice.call(form.querySelectorAll('.langkah'));
    var titik = form.querySelector('.titik-langkah');
    var kembali = form.querySelector('[data-kembali]');
    var i = Number(form.dataset.mulai || 0);
    if (titik) titik.innerHTML = langkah.map(function () { return '<i></i>'; }).join('');

    function tampil(k) {
      i = Math.max(0, Math.min(k, langkah.length - 1));
      langkah.forEach(function (s, j) { s.classList.toggle('aktif', j === i); });
      if (titik) Array.prototype.forEach.call(titik.children, function (t, j) { t.classList.toggle('sudah', j <= i); });
      if (kembali) kembali.textContent = i === 0 ? '‹ Batal' : '‹ Kembali';
      perbaruiRingkasan();
      var fokus = langkah[i].querySelector('[data-fokus]');
      if (fokus) setTimeout(function () { fokus.focus(); }, 50);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function cekLangkah() {
      var s = langkah[i], pesan = s.querySelector('.peringatan');
      var wajib = s.querySelectorAll('[data-wajib]');
      for (var k = 0; k < wajib.length; k++) {
        var el = wajib[k];
        var kosong = el.type === 'radio' ? !form.querySelector('input[name="' + el.name + '"]:checked') : !angka(el);
        if (kosong) { if (pesan) pesan.textContent = el.dataset.wajib; return false; }
      }
      if (pesan) pesan.textContent = '';
      return true;
    }
    function teksPilihan(nama) {
      var r = form.querySelector('input[name="' + nama + '"]:checked');
      return r ? (r.dataset.teks || r.value) : '';
    }
    function perbaruiRingkasan() {
      form.querySelectorAll('[data-isi]').forEach(function (el) {
        var nama = el.dataset.isi, src = form.querySelector('[name="' + nama + '"]');
        if (!src) return;
        if (src.type === 'radio') el.textContent = teksPilihan(nama);
        else if (src.hasAttribute('data-angka')) el.textContent = src.dataset.satuan === 'kilogram' ? (angka(src).toLocaleString('id-ID') + ' kg') : rupiah(angka(src));
        else el.textContent = src.value;
      });
      var total = form.querySelector('[data-total]');
      if (total) {
        var kg = form.querySelector('[name=kg]'), hg = form.querySelector('[name=harga]');
        total.textContent = rupiah(angka(kg) * angka(hg));
      }
    }
    form.addEventListener('angka-berubah', perbaruiRingkasan);

    // pilih ubin = otomatis lanjut
    form.querySelectorAll('.ubin input[type=radio]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (r.dataset.atur) { // mis. Pajak lahan -> otomatis "Semua lahan"
          r.dataset.atur.split(';').forEach(function (pasangan) {
            var p = pasangan.split('='); var t = form.querySelector('input[name="' + p[0] + '"][value="' + p[1] + '"]');
            if (t) t.checked = true;
          });
        }
        if (r.closest('.langkah') === langkah[i] && i < langkah.length - 1) setTimeout(function () { tampil(i + 1); }, 180);
      });
    });
    form.querySelectorAll('[data-lanjut]').forEach(function (b) {
      b.addEventListener('click', function () { if (cekLangkah()) tampil(i + 1); });
    });
    form.querySelectorAll('[data-ubah]').forEach(function (b) {
      b.addEventListener('click', function () { tampil(Number(b.dataset.ubah)); });
    });
    if (kembali) kembali.addEventListener('click', function () {
      if (i === 0) { window.location.href = kembali.dataset.batal; } else { tampil(i - 1); }
    });
    // Enter di kolom angka = Lanjut
    form.querySelectorAll('[data-angka]').forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); var b = el.closest('.langkah').querySelector('[data-lanjut]'); if (b) b.click(); }
      });
    });
    form.addEventListener('submit', function (e) {
      for (var k = 0; k < langkah.length; k++) { i = k; if (!cekLangkah()) { e.preventDefault(); tampil(k); cekLangkah(); return; } }
    });
    tampil(i);
  });

  // status harga langsung saat mengetik (halaman Harga Hari Ini)
  document.querySelectorAll('[data-hpp]').forEach(function (el) {
    var out = document.querySelector(el.dataset.status), hpp = Number(el.dataset.hpp);
    function segarkan() {
      var n = angka(el) || Number(el.dataset.sekarang || 0);
      if (!out) return;
      if (!hpp || !n) { out.className = 'status-harga kosong'; out.textContent = 'Modal belum bisa dihitung'; return; }
      var s = n - hpp;
      out.className = 'status-harga ' + (s >= 0 ? 'naik' : 'turun');
      out.textContent = (s >= 0 ? 'Untung ' : 'Rugi ') + rupiah(Math.abs(s)) + ' setiap kg';
    }
    el.addEventListener('angka-berubah', segarkan); el.addEventListener('input', segarkan); segarkan();
  });
})();
