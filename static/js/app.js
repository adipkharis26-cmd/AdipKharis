// BGRis Media - Application Logic (Bootstrap 5 Edition)

let currentStock = [];
let activeChannelGlobalId = '';
let bootstrapEditModal = null;
let bootstrapGuideModal = null;
let bootstrapChannelModal = null;
let bootstrapBulkEditModal = null;
let bootstrapBulkDeleteModal = null;
let bootstrapMobileModal = null;
let liveToastInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initBootstrapComponents();
  initTabs();
  initEventListeners();
  initStockFilters();
  fetchInitialData();
  
  // Polling data dinamis setiap 4 detik (dioptimalkan agar hemat CPU & RAM)
  setInterval(refreshDynamicData, 4000);
});

/* -------------------------------------------------------------------------- */
/* Bootstrap Components & Toast Notification Helper                           */
/* -------------------------------------------------------------------------- */
function initBootstrapComponents() {
  const editModalEl = document.getElementById('editModal');
  if (editModalEl && window.bootstrap) {
    bootstrapEditModal = bootstrap.Modal.getOrCreateInstance(editModalEl);
  }

  const guideModalEl = document.getElementById('guideModal');
  if (guideModalEl && window.bootstrap) {
    bootstrapGuideModal = bootstrap.Modal.getOrCreateInstance(guideModalEl);
  }

  const channelModalEl = document.getElementById('channelExtractorModal');
  if (channelModalEl && window.bootstrap) {
    bootstrapChannelModal = bootstrap.Modal.getOrCreateInstance(channelModalEl);
  }

  const bulkEditEl = document.getElementById('bulkEditModal');
  if (bulkEditEl && window.bootstrap) {
    bootstrapBulkEditModal = bootstrap.Modal.getOrCreateInstance(bulkEditEl);
  }

  const bulkDeleteEl = document.getElementById('bulkDeleteModal');
  if (bulkDeleteEl && window.bootstrap) {
    bootstrapBulkDeleteModal = bootstrap.Modal.getOrCreateInstance(bulkDeleteEl);
  }

  const mobileModalEl = document.getElementById('mobileGuideModal');
  if (mobileModalEl && window.bootstrap) {
    bootstrapMobileModal = bootstrap.Modal.getOrCreateInstance(mobileModalEl);
  }

  const toastEl = document.getElementById('liveToast');
  if (toastEl && window.bootstrap) {
    liveToastInstance = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 });
  }
}


function showToast(message, type = 'info') {
  const toastEl = document.getElementById('liveToast');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toastEl || !toastMsg) {
    alert(message);
    return;
  }

  toastMsg.innerText = message;
  toastEl.classList.remove('toast-success', 'toast-error', 'toast-info');

  if (type === 'success') {
    toastEl.classList.add('toast-success');
    if (toastIcon) toastIcon.className = 'bi bi-check-circle-fill text-success fs-5';
  } else if (type === 'error') {
    toastEl.classList.add('toast-error');
    if (toastIcon) toastIcon.className = 'bi bi-exclamation-triangle-fill text-danger fs-5';
  } else {
    toastEl.classList.add('toast-info');
    if (toastIcon) toastIcon.className = 'bi bi-info-circle-fill text-info fs-5';
  }

  if (liveToastInstance) {
    liveToastInstance.show();
  } else if (window.bootstrap) {
    const t = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 });
    t.show();
  } else {
    alert(message);
  }
}

/* -------------------------------------------------------------------------- */
/* Tab Navigation                                                             */
/* -------------------------------------------------------------------------- */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane-saas');

  // Pastikan kondisi awal: hanya tab aktif yang tampil
  panes.forEach(p => {
    if (p.classList.contains('active')) {
      p.style.display = 'block';
    } else {
      p.style.display = 'none';
    }
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
      });
      
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
      }
      
      if (targetId === 'tabLogs') fetchLogs();
      if (targetId === 'tabTimeline') renderTimeline(currentStock);
      if (targetId === 'tabStock') applyStockFilters();
    });
  });

  // Klik status YouTube di header membuka tab Settings
  const ytBadge = document.getElementById('ytStatusBadge');
  if (ytBadge) {
    ytBadge.addEventListener('click', () => {
      const settingsTab = document.querySelector('[data-target="tabSettings"]');
      if (settingsTab) settingsTab.click();
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Event Listeners                                                            */
/* -------------------------------------------------------------------------- */
function initEventListeners() {
  // Tombol Tempel Clipboard
  const btnPaste = document.getElementById('btnPasteClipboard');
  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById('linksInput');
        if (text) {
          input.value = input.value ? input.value + "\n" + text : text;
          showToast("Teks dari clipboard berhasil ditempel!", "info");
        }
      } catch (err) {
        showToast("Tidak dapat membaca clipboard otomatis. Gunakan Ctrl+V.", "error");
      }
    });
  }

  // Tombol Mulai Unduh
  const btnStart = document.getElementById('btnStartDownload');
  if (btnStart) {
    btnStart.addEventListener('click', submitQueue);
  }

  // Tombol Bersihkan Antrean Selesai
  const btnClear = document.getElementById('btnClearCompleted');
  if (btnClear) {
    btnClear.addEventListener('click', async () => {
      await fetch('/api/queue/clear-completed', { method: 'POST' });
      fetchQueue();
      fetchStats();
      showToast("Antrean yang selesai telah dibersihkan.", "info");
    });
  }

  // Tombol Jeda / Lanjutkan Unduh
  const btnTogglePause = document.getElementById('btnTogglePauseQueue');
  if (btnTogglePause) {
    btnTogglePause.addEventListener('click', togglePauseQueue);
  }

  // Tombol Batal Semua Antrean
  const btnCancelAll = document.getElementById('btnCancelAllQueue');
  if (btnCancelAll) {
    btnCancelAll.addEventListener('click', cancelAllQueue);
  }

  // Tombol Coba Lagi yang Gagal
  const btnRetry = document.getElementById('btnRetryFailed');
  if (btnRetry) {
    btnRetry.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/queue/retry-failed', { method: 'POST' });
        const data = await res.json();
        if (data.count > 0) {
          showToast(`${data.count} video gagal berhasil dimasukkan kembali ke antrean!`, 'success');
          fetchQueue();
          fetchStats();
        } else {
          showToast('Tidak ada video gagal yang perlu diulang.', 'info');
        }
      } catch (err) {
        showToast('Gagal memproses ulang antrean.', 'error');
      }
    });
  }

  // Tombol Padatkan Ulang Jadwal (Reschedule All)
  const btnResched = document.getElementById('btnReschedule');
  if (btnResched) {
    btnResched.addEventListener('click', async () => {
      const origHtml = btnResched.innerHTML;
      btnResched.disabled = true;
      btnResched.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Menghitung...';
      try {
        await fetch('/api/reschedule-all', { method: 'POST' });
        await fetchStock();
        showToast("Seluruh jadwal stok video telah dipadatkan ulang!", "success");
      } catch (e) {
        showToast("Gagal memadatkan jadwal.", "error");
      } finally {
        btnResched.disabled = false;
        btnResched.innerHTML = origHtml;
      }
    });
  }

  // Tombol Sinkron View YouTube
  const btnSyncViews = document.getElementById('btnSyncViews');
  if (btnSyncViews) {
    btnSyncViews.addEventListener('click', async () => {
      const origHtml = btnSyncViews.innerHTML;
      btnSyncViews.disabled = true;
      btnSyncViews.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Menyinkronkan...';
      try {
        const targetCh = activeChannelGlobalId || '';
        const url = targetCh ? `/api/stock/sync-views?channel_id=${encodeURIComponent(targetCh)}` : '/api/stock/sync-views';
        const res = await fetch(url, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          if (data.deleted_count > 0) {
            showToast(`Sinkronisasi selesai: ${data.count} views diperbarui, ${data.deleted_count} video terhapus di YouTube telah disinkronkan!`, 'warning');
          } else {
            showToast(`Berhasil menyinkronkan data view untuk ${data.count} video YouTube!`, 'success');
          }
          await fetchStock();
          await fetchStats();
        } else {
          showToast(data.detail || 'Gagal menyinkronkan view dari YouTube.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan jaringan saat sinkronisasi view.', 'error');
      } finally {
        btnSyncViews.disabled = false;
        btnSyncViews.innerHTML = origHtml;
      }
    });
  }

  // Tombol Bersihkan Duplikat Stok
  const btnDedup = document.getElementById('btnDeduplicateStock');
  if (btnDedup) {
    btnDedup.addEventListener('click', async () => {
      const origHtml = btnDedup.innerHTML;
      btnDedup.disabled = true;
      btnDedup.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Memeriksa...';
      try {
        const targetCh = activeChannelGlobalId || '';
        const url = targetCh ? `/api/stock/deduplicate?channel_id=${encodeURIComponent(targetCh)}` : '/api/stock/deduplicate';
        const res = await fetch(url, { method: 'POST' });
        const data = await res.json();
        if (data.removed_count > 0) {
          showToast(`Berhasil membersihkan ${data.removed_count} video duplikat dari stok!`, 'success');
          await fetchStock();
          await fetchStats();
        } else {
          showToast('Stok video sudah bersih, tidak ditemukan video duplikat.', 'info');
        }
      } catch (e) {
        showToast('Gagal membersihkan duplikat stok.', 'error');
      } finally {
        btnDedup.disabled = false;
        btnDedup.innerHTML = origHtml;
      }
    });
  }

  // --- Modal Edit Massal: Logika Toggle Input ---
  const bulkTitleMode = document.getElementById('bulkTitleMode');
  const bulkTitleValWrap = document.getElementById('bulkTitleValWrap');
  const bulkTitleFindWrap = document.getElementById('bulkTitleFindWrap');
  if (bulkTitleMode) {
    bulkTitleMode.addEventListener('change', () => {
      const m = bulkTitleMode.value;
      if (m === 'none') {
        bulkTitleValWrap.style.display = 'none';
        bulkTitleFindWrap.style.display = 'none';
      } else if (m === 'find_replace') {
        bulkTitleFindWrap.style.display = 'block';
        bulkTitleValWrap.style.display = 'block';
        document.getElementById('bulkTitleVal').placeholder = 'Ganti dengan kata ini...';
      } else {
        bulkTitleFindWrap.style.display = 'none';
        bulkTitleValWrap.style.display = 'block';
        document.getElementById('bulkTitleVal').placeholder = m === 'append_suffix' ? 'Contoh: #Shorts #Viral' : (m === 'prepend_prefix' ? 'Contoh: [Seru]' : 'Teks judul baru...');
      }
    });
  }

  const bulkDescMode = document.getElementById('bulkDescMode');
  const bulkDescValWrap = document.getElementById('bulkDescValWrap');
  if (bulkDescMode) {
    bulkDescMode.addEventListener('change', () => {
      bulkDescValWrap.style.display = bulkDescMode.value === 'none' ? 'none' : 'block';
    });
  }

  const bulkTagsMode = document.getElementById('bulkTagsMode');
  const bulkTagsValWrap = document.getElementById('bulkTagsValWrap');
  if (bulkTagsMode) {
    bulkTagsMode.addEventListener('change', () => {
      bulkTagsValWrap.style.display = bulkTagsMode.value === 'none' ? 'none' : 'block';
    });
  }

  // Buka Modal Edit Massal
  const btnOpenBulkEdit = document.getElementById('btnOpenBulkEdit');
  if (btnOpenBulkEdit) {
    btnOpenBulkEdit.addEventListener('click', () => {
      if (bootstrapBulkEditModal) bootstrapBulkEditModal.show();
    });
  }

  // Submit Form Edit Massal
  const bulkEditForm = document.getElementById('bulkEditForm');
  if (bulkEditForm) {
    bulkEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const scope = document.querySelector('input[name="bulkScope"]:checked')?.value || 'unuploaded';
      const titleMode = document.getElementById('bulkTitleMode').value;
      const titleVal = document.getElementById('bulkTitleVal').value;
      const titleFind = document.getElementById('bulkTitleFind').value;
      const descMode = document.getElementById('bulkDescMode').value;
      const descVal = document.getElementById('bulkDescVal').value;
      const tagsMode = document.getElementById('bulkTagsMode').value;
      const tagsVal = document.getElementById('bulkTagsVal').value.split(',').map(t => t.trim()).filter(t => t);

      if (titleMode === 'none' && descMode === 'none' && tagsMode === 'none') {
        showToast('Pilih setidaknya satu bagian (Judul, Deskripsi, atau Tag) untuk diubah.', 'warning');
        return;
      }

      const btnSubmit = document.getElementById('btnSubmitBulkEdit');
      const origHtml = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Menerapkan...';

      try {
        const res = await fetch('/api/stock/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel_id: activeChannelGlobalId || null,
            scope: scope,
            title_mode: titleMode,
            title_val: titleVal,
            title_find: titleFind,
            desc_mode: descMode,
            desc_val: descVal,
            tags_mode: tagsMode,
            tags_val: tagsVal
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Sukses! ${data.count} video stok berhasil diperbarui secara massal.`, 'success');
          if (bootstrapBulkEditModal) bootstrapBulkEditModal.hide();
          await fetchStock();
        } else {
          showToast(data.detail || 'Gagal menerapkan edit massal.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan jaringan.', 'error');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = origHtml;
      }
    });
  }

  // --- Modal Hapus Semua Stok: Proteksi Keamanan Ketik ---
  const btnOpenBulkDelete = document.getElementById('btnOpenBulkDelete');
  const inputBulkDeleteConfirm = document.getElementById('inputBulkDeleteConfirm');
  const btnConfirmBulkDelete = document.getElementById('btnConfirmBulkDelete');

  if (btnOpenBulkDelete) {
    btnOpenBulkDelete.addEventListener('click', () => {
      if (inputBulkDeleteConfirm) inputBulkDeleteConfirm.value = '';
      if (btnConfirmBulkDelete) btnConfirmBulkDelete.disabled = true;
      if (bootstrapBulkDeleteModal) bootstrapBulkDeleteModal.show();
    });
  }

  if (inputBulkDeleteConfirm && btnConfirmBulkDelete) {
    inputBulkDeleteConfirm.addEventListener('input', () => {
      const isExact = inputBulkDeleteConfirm.value.trim() === 'HAPUS SEMUA';
      btnConfirmBulkDelete.disabled = !isExact;
      const hint = document.getElementById('deleteConfirmHint');
      if (hint) {
        hint.innerHTML = isExact 
          ? '<span class="text-success fw-bold"><i class="bi bi-check-circle me-1"></i> Konfirmasi cocok! Tombol hapus kini aktif.</span>'
          : 'Tombol hapus akan aktif setelah Anda mengetik dengan benar.';
      }
    });
  }

  if (btnConfirmBulkDelete) {
    btnConfirmBulkDelete.addEventListener('click', async () => {
      const scope = document.querySelector('input[name="deleteScope"]:checked')?.value || 'unuploaded';
      const deleteFiles = document.getElementById('checkDeleteLocalFiles')?.checked ?? true;
      const confText = inputBulkDeleteConfirm ? inputBulkDeleteConfirm.value.trim() : '';

      const origHtml = btnConfirmBulkDelete.innerHTML;
      btnConfirmBulkDelete.disabled = true;
      btnConfirmBulkDelete.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Menghapus...';

      try {
        const res = await fetch('/api/stock/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel_id: activeChannelGlobalId || null,
            scope: scope,
            delete_local_files: deleteFiles,
            confirmation_text: confText
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Berhasil menghapus ${data.count} video dari stok!`, 'success');
          if (bootstrapBulkDeleteModal) bootstrapBulkDeleteModal.hide();
          await fetchStock();
          await fetchStats();
        } else {
          showToast(data.detail || 'Gagal menghapus stok video.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan jaringan saat menghapus.', 'error');
      } finally {
        btnConfirmBulkDelete.disabled = false;
        btnConfirmBulkDelete.innerHTML = origHtml;
      }
    });
  }


  // Listener Perubahan Target Channel di Form Pengaturan
  const settingChannelSelect = document.getElementById('settingChannelSelect');
  if (settingChannelSelect) {
    settingChannelSelect.addEventListener('change', () => {
      const selectedCh = settingChannelSelect.value;
      if (selectedCh) {
        fetchSettings(selectedCh);
      }
    });
  }

  // Simpan Pengaturan
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const targetChId = String(document.getElementById('settingTargetChannelId')?.value || (settingChannelSelect ? settingChannelSelect.value : '')).trim();
      const globalActive = String(activeChannelGlobalId || '').trim();

      // Larang ubah & simpan jika bukan channel aktif
      const isChannelActive = !targetChId || !globalActive || (targetChId === globalActive);
      if (!isChannelActive) {
        showToast('Dilarang mengubah! Hanya channel target aktif yang dapat diubah dan disimpan.', 'warning');
        return;
      }

      const maxUploads = parseInt(document.getElementById('settingMaxUploads').value) || 3;
      const slots = document.getElementById('settingUploadSlots').value
        .split(',')
        .map(s => s.trim())
        .filter(s => s);
      const titleTemplate = document.getElementById('settingTitleTemplate').value;
      const descTemplate = document.getElementById('settingDescriptionTemplate') ? document.getElementById('settingDescriptionTemplate').value : '';
      const defaultTags = document.getElementById('settingDefaultTags').value
        .split(',')
        .map(s => s.trim())
        .filter(s => s);
      const geminiKey = document.getElementById('settingGeminiKey').value.trim();
      const autoUpload = document.getElementById('settingAutoUpload').checked;

      const payload = {
        channel_id: targetChId || null,
        max_uploads_per_day: maxUploads,
        upload_slots: slots,
        title_template: titleTemplate,
        description_template: descTemplate,
        default_tags: defaultTags,
        gemini_api_key: geminiKey,
        auto_upload_enabled: autoUpload
      };

      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Pengaturan channel berhasil disimpan!', 'success');
          fetchStats();
        } else {
          showToast('Gagal menyimpan pengaturan.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan jaringan.', 'error');
      }
    });
  }

  // Simpan Client ID & Secret Langsung
  const btnSaveCreds = document.getElementById('btnSaveClientCredentials');
  if (btnSaveCreds) {
    btnSaveCreds.addEventListener('click', async () => {
      const clientId = document.getElementById('inputClientId').value.trim();
      const clientSecret = document.getElementById('inputClientSecret').value.trim();
      if (!clientId || !clientSecret) {
        showToast('Harap isi Client ID dan Client Secret terlebih dahulu!', 'error');
        return;
      }
      try {
        const res = await fetch('/api/youtube/save-client-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: clientId, client_secret: clientSecret })
        });
        if (res.ok) {
          showToast('Kredensial berhasil disimpan! Sekarang klik tombol "+ Hubungkan Channel YouTube".', 'success');
          fetchYouTubeStatus();
        } else {
          showToast('Gagal menyimpan kredensial.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan jaringan.', 'error');
      }
    });
  }

  // Unggah file client_secrets.json
  const btnUploadSecrets = document.getElementById('btnUploadSecrets');
  if (btnUploadSecrets) {
    btnUploadSecrets.addEventListener('click', async () => {
      const fileInput = document.getElementById('inputClientSecrets');
      if (!fileInput.files.length) {
        showToast('Pilih file client_secrets.json terlebih dahulu!', 'error');
        return;
      }
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      try {
        const res = await fetch('/api/youtube/upload-client-secrets', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          showToast('File kredensial berhasil disimpan!', 'success');
          fetchYouTubeStatus();
        } else {
          showToast('Gagal mengunggah file kredensial.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan saat mengunggah file.', 'error');
      }
    });
  }

  // Hubungkan Channel YouTube (OAuth Flow)
  const btnConnectYt = document.getElementById('btnConnectYt');
  if (btnConnectYt) {
    btnConnectYt.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/youtube/auth-url');
        const data = await res.json();
        if (data.auth_url) {
          window.location.href = data.auth_url;
        } else {
          showToast('Gagal mendapatkan URL login. Pastikan kredensial sudah disimpan.', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }

  // Modal Panduan Setup YouTube
  const btnOpenGuide = document.getElementById('btnOpenGuide');
  if (btnOpenGuide) {
    btnOpenGuide.addEventListener('click', () => {
      if (bootstrapGuideModal) {
        bootstrapGuideModal.show();
      }
    });
  }

  // Modal Ekstraksi Shorts dari Channel YouTube (Fitur Baru)
  initChannelExtractorListeners();

  // Tombol Salin Redirect URI
  const copyUri = () => {
    navigator.clipboard.writeText('http://localhost:8000/api/youtube/oauth-callback');
    showToast('Redirect URI berhasil disalin ke clipboard!', 'info');
  };
  const btnCopyUri = document.getElementById('btnCopyRedirectUri');
  const btnModalCopyUri = document.getElementById('btnModalCopyUri');
  if (btnCopyUri) btnCopyUri.addEventListener('click', copyUri);
  if (btnModalCopyUri) btnModalCopyUri.addEventListener('click', copyUri);

  // Submit Edit Metadata Video (2-Way Sync)
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const videoId = document.getElementById('editVideoId').value;
      const title = document.getElementById('editTitle').value;
      const tags = document.getElementById('editTags').value.split(',').map(t => t.trim()).filter(t => t);
      const description = document.getElementById('editDescription').value;
      const scheduledTime = document.getElementById('editSchedule').value;

      const submitBtn = editForm.querySelector('button[type="submit"]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Menyimpan & Sinkronisasi...';

      try {
        const res = await fetch(`/api/stock/${videoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title,
            tags: tags,
            description: description,
            scheduled_time: scheduledTime ? scheduledTime : null
          })
        });
        if (res.ok) {
          showToast('Perubahan berhasil disimpan & disinkronkan ke YouTube!', 'success');
          if (bootstrapEditModal) {
            bootstrapEditModal.hide();
          }
          fetchStock();
        } else {
          const errData = await res.json();
          showToast(errData.detail || 'Gagal memperbarui metadata video.', 'error');
        }
      } catch (err) {
        showToast('Gagal memperbarui metadata video.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    });
  }

  // Segarkan Log
  const btnRefreshLogs = document.getElementById('btnRefreshLogs');
  if (btnRefreshLogs) {
    btnRefreshLogs.addEventListener('click', fetchLogs);
  }

  // Tombol Buka Petunjuk Akses HP
  const btnOpenMobile = document.getElementById('btnOpenMobileGuide');
  if (btnOpenMobile) {
    btnOpenMobile.addEventListener('click', () => {
      fetchNetworkInfo();
      if (bootstrapMobileModal) bootstrapMobileModal.show();
    });
  }

  // Tombol Salin Link HP
  const btnCopyMobile = document.getElementById('btnCopyMobileUrl');
  if (btnCopyMobile) {
    btnCopyMobile.addEventListener('click', () => {
      const input = document.getElementById('mobileUrlDisplay');
      if (input && input.value) {
        navigator.clipboard.writeText(input.value);
        showToast("Link akses HP berhasil disalin!", "success");
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Live Search & Filter on Stock Videos                                       */
/* -------------------------------------------------------------------------- */
function initStockFilters() {
  const searchInput = document.getElementById('inputStockSearch');
  const statusFilter = document.getElementById('selectStockStatusFilter');

  if (searchInput) {
    searchInput.addEventListener('input', applyStockFilters);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', applyStockFilters);
  }
}

function applyStockFilters() {
  const searchInput = document.getElementById('inputStockSearch');
  const statusFilter = document.getElementById('selectStockStatusFilter');

  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedStatus = statusFilter ? statusFilter.value : 'all';

  let filtered = currentStock.filter(v => {
    // Filter status
    if (selectedStatus !== 'all') {
      const isPub = v.status === 'public' || (v.status === 'uploaded' && v.scheduled_time && new Date(v.scheduled_time) <= new Date());
      if (selectedStatus === 'public') {
        if (!isPub) return false;
      } else if (selectedStatus === 'uploaded') {
        if (v.status !== 'uploaded' || isPub) return false;
      } else if (v.status !== selectedStatus) {
        return false;
      }
    }
    // Filter keyword
    if (keyword) {
      const matchTitle = (v.title || '').toLowerCase().includes(keyword);
      const matchOriginal = (v.original_title || '').toLowerCase().includes(keyword);
      const matchTag = (v.tags || []).some(t => t.toLowerCase().includes(keyword));
      return matchTitle || matchOriginal || matchTag;
    }
    return true;
  });

  renderStock(filtered);
}

/* -------------------------------------------------------------------------- */
/* Submitting Links to Queue                                                  */
/* -------------------------------------------------------------------------- */
async function submitQueue() {
  const input = document.getElementById('linksInput');
  const text = input.value.trim();
  if (!text) {
    showToast('Masukkan minimal satu tautan YouTube Shorts!', 'error');
    return;
  }

  const btnStart = document.getElementById('btnStartDownload');
  const origHtml = btnStart.innerHTML;
  btnStart.disabled = true;
  btnStart.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Memproses...';

  try {
    const res = await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bulk_text: text })
    });
    const data = await res.json();
    if (res.ok) {
      input.value = '';
      if (data.skipped_count > 0) {
        showToast(`${data.count} link masuk antrean (${data.skipped_count} duplikat otomatis dilewati)!`, 'success');
      } else {
        showToast(`${data.count} link berhasil masuk antrean unduh!`, 'success');
      }
      fetchQueue();
      fetchStats();

      // Alihkan otomatis ke tab antrean
      const queueTab = document.querySelector('[data-target="tabQueue"]');
      if (queueTab) queueTab.click();
    } else {
      showToast(data.detail || 'Gagal menambahkan link ke antrean.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  } finally {
    btnStart.disabled = false;
    btnStart.innerHTML = origHtml;
  }
}

/* -------------------------------------------------------------------------- */
/* Fetch Data                                                                 */
/* -------------------------------------------------------------------------- */
async function fetchInitialData() {
  await fetchYouTubeStatus();
  await Promise.all([
    fetchStats(),
    fetchQueue(),
    fetchStock(),
    fetchSettings(activeChannelGlobalId),
    fetchNetworkInfo()
  ]);
}

async function fetchNetworkInfo() {
  try {
    const res = await fetch('/api/system/network-info');
    if (!res.ok) return;
    const data = await res.json();
    const input = document.getElementById('mobileUrlDisplay');
    if (input && data.mobile_url) {
      input.value = data.mobile_url;
    }
    const badgeText = document.getElementById('mobileBadgeText');
    if (badgeText && data.local_ip && data.local_ip !== '127.0.0.1') {
      badgeText.innerText = `Akses HP (${data.local_ip})`;
    }
  } catch (e) {}
}

async function refreshDynamicData() {
  // Jangan refresh saat tab browser sedang diminimalkan atau tidak aktif
  if (document.hidden) return;

  // Jangan refresh saat modal edit atau konfirmasi sedang terbuka
  const editModalEl = document.getElementById('editModal');
  const bulkEditModalEl = document.getElementById('bulkEditModal');
  const bulkDeleteModalEl = document.getElementById('bulkDeleteModal');
  if ((editModalEl && editModalEl.classList.contains('show')) ||
      (bulkEditModalEl && bulkEditModalEl.classList.contains('show')) ||
      (bulkDeleteModalEl && bulkDeleteModalEl.classList.contains('show'))) {
    return;
  }

  // Selalu perbarui statistik KPI ringkas
  await fetchStats();

  // Hanya perbarui data untuk tab yang sedang aktif agar hemat memori RAM & CPU
  const activeTab = document.querySelector('.saas-tab-item.active')?.getAttribute('data-target');
  if (activeTab === 'tabQueue') {
    await fetchQueue();
  } else if (activeTab === 'tabStock' || activeTab === 'tabTimeline') {
    await fetchStock();
  }
}

async function fetchStats() {
  try {
    const res = await fetch('/api/system/stats');
    if (!res.ok) return;
    const stats = await res.json();

    document.getElementById('statPendingQueue').innerText = stats.pending_queue ?? 0;
    document.getElementById('statInStock').innerText = stats.in_stock_ready ?? 0;
    const maxDay = stats.max_uploads_per_day || 3;
    document.getElementById('statUploadedToday').innerText = `${stats.uploaded_today ?? 0} / ${maxDay}`;
    const statTransferredEl = document.getElementById('statTransferredToday');
    if (statTransferredEl) {
      statTransferredEl.innerText = stats.transferred_today ?? 0;
    }
    document.getElementById('statUploadedTotal').innerText = stats.uploaded_total ?? 0;

    document.getElementById('queueBadge').innerText = stats.pending_queue ?? 0;
    document.getElementById('stockBadge').innerText = stats.in_stock_ready ?? 0;

    // Perbarui status tombol Jeda / Lanjutkan Unduh
    const btnPause = document.getElementById('btnTogglePauseQueue');
    if (btnPause) {
      if (stats.queue_paused) {
        btnPause.className = 'btn btn-warning btn-sm';
        btnPause.innerHTML = '<i class="bi bi-play-circle"></i> Lanjutkan Unduh';
        btnPause.title = 'Antrean sedang dijeda. Klik untuk melanjutkan proses unduh.';
      } else {
        btnPause.className = 'btn btn-outline-info btn-sm';
        btnPause.innerHTML = '<i class="bi bi-pause-circle"></i> Jeda Unduh';
        btnPause.title = 'Klik untuk menjeda proses unduhan antrean.';
      }
    }
  } catch (e) {}
}

async function fetchQueue() {
  try {
    const res = await fetch('/api/queue');
    if (!res.ok) return;
    const data = await res.json();
    renderQueue(data.queue || []);
  } catch (e) {}
}

function renderQueue(items) {
  const container = document.getElementById('queueListContainer');
  const hasFailed = (items || []).some(it => it.status === 'failed');
  const btnRetry = document.getElementById('btnRetryFailed');
  if (btnRetry) {
    btnRetry.style.display = hasFailed ? 'inline-flex' : 'none';
  }

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="saas-card empty-state-saas">
        <i class="bi bi-inbox text-secondary"></i>
        <p class="mb-0">Belum ada antrean unduhan saat ini. Tempel link Shorts di atas untuk memulai!</p>
      </div>`;
    return;
  }

  let html = '';
  items.forEach(item => {
    const percent = Math.min(100, Math.max(0, item.progress || 0));
    
    let statusClass = 'status-in_stock';
    let statusLabel = 'Menunggu';
    if (item.status === 'downloading') { statusClass = 'status-uploading'; statusLabel = 'Mengunduh'; }
    else if (item.status === 'completed') { statusClass = 'status-uploaded'; statusLabel = 'Selesai'; }
    else if (item.status === 'failed') { statusClass = 'status-failed'; statusLabel = 'Gagal'; }
    else if (item.status === 'cancelled') { statusClass = 'status-cancelled'; statusLabel = 'Dibatalkan'; }

    html += `
      <div class="queue-row-card d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3" style="min-width: 260px; flex: 1;">
          <span class="queue-num-badge">#${String(item.queue_number).padStart(4, '0')}</span>
          <div style="min-width: 0;">
            <div class="text-truncate fw-semibold text-light" style="max-width: 480px;" title="${escapeHtml(item.url)}">
              ${escapeHtml(item.url)}
            </div>
            <div class="text-secondary small mt-1 d-flex gap-3">
              <span><i class="bi bi-clock me-1"></i>${formatTime(item.created_at)}</span>
              ${item.error_message ? `<span class="text-danger fw-semibold"><i class="bi bi-exclamation-circle me-1"></i>${escapeHtml(item.error_message)}</span>` : ''}
            </div>
          </div>
        </div>

        <div style="width: 220px;">
          <div class="progress progress-saas mb-1">
            <div class="progress-bar progress-saas-bar" style="width: ${percent}%;"></div>
          </div>
          <div class="d-flex justify-content-between text-secondary" style="font-size: 0.75rem;">
            <span>${percent.toFixed(0)}%</span>
            <span>${escapeHtml(item.speed || '')} ${item.eta ? `(${escapeHtml(item.eta)})` : ''}</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <span class="status-pill ${statusClass}">${statusLabel}</span>
          ${(item.status === 'pending' || item.status === 'downloading') ? `
            <button class="btn btn-outline-danger btn-sm py-1 px-2" style="font-size: 0.76rem;" onclick="cancelQueueItem(${item.id})" title="Batalkan unduhan ini">
              <i class="bi bi-x-circle"></i> Batal
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function fetchStock() {
  try {
    const res = await fetch('/api/stock');
    if (!res.ok) return;
    const data = await res.json();
    currentStock = data.stock || [];
    applyStockFilters();
    
    // Sinkronkan ke tab timeline jika sedang aktif
    const timelineTab = document.getElementById('tabTimeline');
    if (timelineTab && timelineTab.classList.contains('active')) {
      renderTimeline(currentStock);
    }
  } catch (e) {}
}

function renderStock(items) {
  const container = document.getElementById('stockGridContainer');
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="saas-card empty-state-saas">
          <i class="bi bi-folder2-open text-secondary"></i>
          <p class="mb-0">Tidak ada video yang cocok dengan kriteria filter.</p>
        </div>
      </div>`;
    return;
  }

  let html = '';
  items.forEach(video => {
    let statusClass = `status-${video.status}`;
    let statusLabel = video.status.toUpperCase();
    const isPublic = video.status === 'public' || (video.status === 'uploaded' && video.scheduled_time && new Date(video.scheduled_time) <= new Date());

    if (isPublic) {
      statusClass = 'status-public';
      statusLabel = '<i class="bi bi-globe me-1"></i> Publik';
    } else if (video.status === 'in_stock') {
      statusLabel = 'Stok Siap';
    } else if (video.status === 'scheduled') {
      statusLabel = 'Terjadwal';
    } else if (video.status === 'uploading') {
      statusLabel = 'Mengunggah';
    } else if (video.status === 'uploaded') {
      statusClass = 'status-uploaded';
      statusLabel = '<i class="bi bi-cloud-check me-1"></i> Terunggah';
    } else if (video.status === 'deleted_on_youtube') {
      statusClass = 'status-failed';
      statusLabel = '<i class="bi bi-trash3 me-1"></i> Dihapus di YouTube';
    } else if (video.status === 'duplicate') {
      statusClass = 'status-failed';
      statusLabel = '<i class="bi bi-copy me-1"></i> Duplikat';
    }

    const tagsHtml = (video.tags || []).slice(0, 4).map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join(' ');
    const thumbSrc = video.thumbnail_path || 'https://placehold.co/400x225/111827/ffffff?text=YouTube+Shorts';

    html += `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="stock-card-box">
          <div class="stock-thumb-wrap">
            <img src="${thumbSrc}" class="stock-thumb-img" alt="Thumbnail" onerror="this.src='https://placehold.co/400x225/111827/ffffff?text=Shorts'">
            <span class="stock-thumb-badge-q">#${String(video.queue_number).padStart(4, '0')}</span>
            <div class="stock-thumb-badge-s">
              <span class="status-pill ${statusClass}">${statusLabel}</span>
            </div>
          </div>

          <div class="p-3 d-flex flex-column flex-grow-1">
            <h4 class="h6 text-truncate mb-2" title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</h4>
            <div class="mb-3 d-flex flex-wrap gap-1">${tagsHtml}</div>

            <div class="p-2 rounded bg-dark border mb-3 small d-flex justify-content-between align-items-center" style="border-color: rgba(255,255,255,0.06) !important;">
              <span class="text-secondary"><i class="bi bi-calendar3 me-1 text-warning"></i> Jadwal:</span>
              <strong class="text-light">${formatScheduleDate(video.scheduled_time)}</strong>
            </div>

            ${(isPublic || video.status === 'uploaded' || video.youtube_id) ? `
              <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span class="badge bg-dark border text-light py-1 px-2 d-inline-flex align-items-center gap-1" style="border-color: rgba(255,255,255,0.12) !important; font-size: 0.78rem;" title="Jumlah penonton (views) YouTube terkini">
                  <i class="bi bi-eye-fill text-info"></i> <strong>${(video.view_count || 0).toLocaleString('id-ID')}</strong> views
                </span>
                <span class="badge bg-dark border text-secondary py-1 px-2 d-inline-flex align-items-center gap-1" style="border-color: rgba(255,255,255,0.12) !important; font-size: 0.75rem;" title="Waktu terpublikasi">
                  <i class="bi bi-clock-history text-warning"></i> ${formatRelativeTime(video.youtube_published_at || video.uploaded_at || video.scheduled_time)}
                </span>
              </div>
            ` : ''}

            ${video.youtube_url ? `
              <div class="mb-3 small">
                <a href="${video.youtube_url}" target="_blank" class="text-info text-decoration-none d-flex align-items-center gap-1">
                  <i class="bi bi-box-arrow-up-right"></i> Lihat di YouTube Shorts
                </a>
              </div>
            ` : ''}

            <div class="mt-auto pt-2 border-top d-flex gap-2 justify-content-end" style="border-color: rgba(255,255,255,0.06) !important;">
              <button class="btn btn-secondary btn-sm" onclick="openEditModal(${video.id})" title="Edit Metadata & Jadwal">
                <i class="bi bi-pencil-square"></i> Edit
              </button>
              ${(!isPublic && video.status !== 'uploaded') ? `
                <button class="btn btn-primary btn-sm" onclick="uploadNow(${video.id})" title="Upload Sekarang ke YouTube">
                  <i class="bi bi-upload"></i> Upload Now
                </button>
              ` : ''}
              <button class="btn btn-danger-subtle btn-sm" onclick="deleteVideo(${video.id})" title="Hapus Video">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderTimeline(items) {
  const container = document.getElementById('timelineContainer');
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="saas-card empty-state-saas">
        <i class="bi bi-calendar-x text-secondary"></i>
        <p class="mb-0">Belum ada jadwal yang terbentuk. Unduh beberapa Shorts terlebih dahulu!</p>
      </div>`;
    return;
  }

  const grouped = {};
  items.forEach(v => {
    if (v.scheduled_time) {
      const datePart = v.scheduled_time.split('T')[0];
      if (!grouped[datePart]) grouped[datePart] = [];
      grouped[datePart].push(v);
    }
  });

  const sortedDates = Object.keys(grouped).sort();
  if (sortedDates.length === 0) {
    container.innerHTML = `
      <div class="saas-card empty-state-saas">
        <p class="mb-0">Semua video belum memiliki alokasi tanggal jadwal.</p>
      </div>`;
    return;
  }

  let html = '';
  sortedDates.forEach(dateStr => {
    const videosForDay = grouped[dateStr] || [];
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    html += `
      <div class="timeline-day-card">
        <div class="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom" style="border-color: rgba(255,255,255,0.06) !important;">
          <h3 class="h6 mb-0 d-flex align-items-center gap-2">
            <i class="bi bi-calendar-check text-warning"></i> ${dayName}
          </h3>
          <span class="status-pill" style="background: rgba(245, 158, 11, 0.12); color: var(--saas-amber);">
            ${videosForDay.length} / 3 Video
          </span>
        </div>
        <div class="row g-3">
    `;

    videosForDay.forEach(v => {
      const timePart = v.scheduled_time.includes('T') ? v.scheduled_time.split('T')[1].substring(0, 5) : '00:00';
      html += `
        <div class="col-12 col-md-4">
          <div class="slot-box occupied">
            <div class="d-flex align-items-center gap-1 text-warning fw-bold small mb-1">
              <i class="bi bi-clock"></i> Pukul ${timePart} WIB
            </div>
            <div class="fw-semibold text-truncate small text-light mb-1" title="${escapeHtml(v.title)}">
              #${String(v.queue_number).padStart(4, '0')} - ${escapeHtml(v.title)}
            </div>
            <div class="text-secondary" style="font-size: 0.72rem;">${v.status.toUpperCase()}</div>
          </div>
        </div>
      `;
    });

    const emptyCount = Math.max(0, 3 - videosForDay.length);
    for (let i = 0; i < emptyCount; i++) {
      html += `
        <div class="col-12 col-md-4">
          <div class="slot-box d-flex align-items-center justify-content-center text-secondary small">
            <span><i class="bi bi-plus-circle me-1"></i> Slot Kosong (Tersedia)</span>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function fetchSettings(channelId) {
  try {
    const targetChannel = String(channelId || activeChannelGlobalId || '').trim();
    const url = targetChannel ? `/api/settings?channel_id=${encodeURIComponent(targetChannel)}` : '/api/settings';
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const s = data.settings || {};
    const activeChId = String(data.channel_id || targetChannel || '').trim();

    const targetChInput = document.getElementById('settingTargetChannelId');
    if (targetChInput) targetChInput.value = activeChId;

    const chSelect = document.getElementById('settingChannelSelect');
    if (chSelect && activeChId && chSelect.querySelector(`option[value="${activeChId}"]`)) {
      chSelect.value = activeChId;
    }

    if (s.max_uploads_per_day !== undefined) document.getElementById('settingMaxUploads').value = s.max_uploads_per_day;
    if (s.upload_slots) document.getElementById('settingUploadSlots').value = s.upload_slots.join(', ');
    if (s.title_template !== undefined) document.getElementById('settingTitleTemplate').value = s.title_template;
    if (s.default_tags) document.getElementById('settingDefaultTags').value = s.default_tags.join(', ');
    const descEl = document.getElementById('settingDescriptionTemplate');
    if (descEl) descEl.value = s.description_template || '';
    if (s.gemini_api_key !== undefined) document.getElementById('settingGeminiKey').value = s.gemini_api_key || '';
    if (s.auto_upload_enabled !== undefined) document.getElementById('settingAutoUpload').checked = s.auto_upload_enabled;

    // Perbarui mode Terkunci (Hanya Tampilan) atau Aktif (Bisa Diedit)
    updateSettingsLockState(activeChId);
  } catch (e) {}
}

function updateSettingsLockState(selectedChId) {
  const currentVal = String(selectedChId || document.getElementById('settingChannelSelect')?.value || document.getElementById('settingTargetChannelId')?.value || '').trim();
  const globalActive = String(activeChannelGlobalId || '').trim();
  const isChannelActive = !currentVal || !globalActive || (currentVal === globalActive);

  const formInputs = [
    document.getElementById('settingMaxUploads'),
    document.getElementById('settingUploadSlots'),
    document.getElementById('settingTitleTemplate'),
    document.getElementById('settingDefaultTags'),
    document.getElementById('settingDescriptionTemplate'),
    document.getElementById('settingGeminiKey'),
    document.getElementById('settingAutoUpload')
  ];

  formInputs.forEach(input => {
    if (input) input.disabled = !isChannelActive;
  });

  const btnSave = document.getElementById('btnSaveSettings');
  const lockNotice = document.getElementById('settingChannelLockNotice');

  if (isChannelActive) {
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.className = 'btn btn-primary';
      btnSave.innerHTML = '<i class="bi bi-save"></i> Simpan Pengaturan Channel';
      btnSave.title = 'Simpan konfigurasi untuk channel aktif ini';
    }
    if (lockNotice) {
      lockNotice.style.display = 'block';
      lockNotice.innerHTML = `
        <div class="d-flex align-items-center gap-2 p-2 px-3 rounded small" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399;">
          <i class="bi bi-check-circle-fill"></i>
          <span><strong>Target Aktif:</strong> Channel ini sedang aktif. Semua pengaturan otomatisasi di bawah dapat diubah dan disimpan.</span>
        </div>
      `;
    }
  } else {
    if (btnSave) {
      btnSave.disabled = true;
      btnSave.className = 'btn btn-secondary';
      btnSave.innerHTML = '<i class="bi bi-lock-fill"></i> Terkunci (Hanya Tampilan)';
      btnSave.title = 'Channel ini terkunci karena bukan target aktif saat ini';
    }
    if (lockNotice) {
      lockNotice.style.display = 'block';
      lockNotice.innerHTML = `
        <div class="d-flex flex-wrap align-items-center justify-content-between p-2 px-3 rounded small gap-2" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24;">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-lock-fill fs-5 text-warning"></i>
            <div>
              <strong>Mode Hanya Tampilan (Terkunci):</strong> Channel ini bukan target aktif saat ini. Anda hanya dapat melihat pengaturan yang sedang berjalan tanpa bisa mengubah atau menyimpannya.
            </div>
          </div>
          <button type="button" class="btn btn-warning btn-sm py-1 px-3 text-nowrap fw-semibold" onclick="switchChannel('${currentVal}')">
            <i class="bi bi-check2-circle"></i> Jadikan Target Aktif
          </button>
        </div>
      `;
    }
  }
}

async function fetchYouTubeStatus() {
  try {
    const res = await fetch('/api/youtube/status');
    if (!res.ok) return;
    const data = await res.json();

    const ytDot = document.getElementById('ytDot');
    const ytStatusText = document.getElementById('ytStatusText');
    const headerThumb = document.getElementById('headerChannelThumb');
    const secretsStatusBadge = document.getElementById('secretsStatusBadge');
    const channelsContainer = document.getElementById('channelsListContainer');

    // Status Kredensial client_secrets.json
    if (secretsStatusBadge) {
      if (data.configured) {
        secretsStatusBadge.innerHTML = '<span class="status-dot active"></span> Kredensial Terpasang';
        secretsStatusBadge.className = 'status-pill border text-success bg-dark';
      } else {
        secretsStatusBadge.innerHTML = '<span class="status-dot warning"></span> Belum Ada File';
        secretsStatusBadge.className = 'status-pill border text-warning bg-dark';
      }
    }

    // Deteksi ID target channel YouTube aktif
    let detectedActiveId = '';
    if (data.channels && data.channels.length > 0) {
      const activeObj = data.channels.find(c => c.is_active === 1);
      if (activeObj && activeObj.channel_id) {
        detectedActiveId = String(activeObj.channel_id).trim();
      }
    }
    if (!detectedActiveId && data.active_channel_id) {
      detectedActiveId = String(data.active_channel_id).trim();
    }
    if (!detectedActiveId && data.active_channel) {
      detectedActiveId = String(data.active_channel.channel_id || '').trim();
    }
    if (detectedActiveId) {
      activeChannelGlobalId = detectedActiveId;
    }

    // Header Navbar Status
    if (data.active_channel) {
      ytDot.className = 'status-dot active';
      ytStatusText.innerText = `${data.active_channel.title}`;
      if (data.active_channel.thumbnail) {
        headerThumb.src = data.active_channel.thumbnail;
        headerThumb.style.display = 'inline-block';
      } else {
        headerThumb.style.display = 'none';
      }
    } else {
      ytDot.className = 'status-dot warning';
      ytStatusText.innerText = data.configured ? 'Belum Ada Channel (Klik Hubungkan)' : 'YouTube Belum Terhubung';
      headerThumb.style.display = 'none';
    }

    // Render Multi-Channel Cards
    if (channelsContainer) {
      const channels = data.channels || [];
      if (channels.length === 0) {
        channelsContainer.innerHTML = `
          <div class="col-12">
            <div class="p-4 text-center rounded-3" style="border: 2px dashed var(--saas-red); background: rgba(255, 0, 51, 0.04);">
              <i class="bi bi-youtube text-danger display-5 mb-2 d-inline-block"></i>
              <h4 class="h6 fw-bold mb-1">Kredensial Google Berhasil Terpasang!</h4>
              <p class="text-secondary small mb-3">Hubungkan akun YouTube Anda sekarang untuk mengaktifkan fitur otomatisasi unggah.</p>
              <button id="btnConnectYtBig" class="btn btn-primary" type="button">
                <i class="bi bi-box-arrow-up-right"></i> Login & Hubungkan Channel YouTube Sekarang
              </button>
            </div>
          </div>`;

        const btnBig = document.getElementById('btnConnectYtBig');
        if (btnBig) {
          btnBig.addEventListener('click', () => {
            const btnOrig = document.getElementById('btnConnectYt');
            if (btnOrig) btnOrig.click();
          });
        }
      } else {
        let chHtml = '';
        channels.forEach(ch => {
          const isActive = (ch.is_active === 1);
          const thumb = ch.thumbnail || 'https://placehold.co/100x100/1e293b/ffffff?text=YT';
          const customUrl = ch.custom_url ? `@${ch.custom_url.replace('@', '')}` : '';

          chHtml += `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="channel-saas-card ${isActive ? 'active-channel' : ''}">
                <div class="d-flex align-items-center gap-3">
                  <img src="${thumb}" class="channel-saas-avatar" alt="Avatar">
                  <div style="min-width: 0; flex: 1;">
                    <h4 class="h6 text-truncate mb-0 fw-bold" title="${escapeHtml(ch.title)}">${escapeHtml(ch.title)}</h4>
                    <p class="text-secondary small mb-0">${escapeHtml(customUrl)} • ${ch.subscriber_count || 0} Subs</p>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center pt-2 mt-auto border-top" style="border-color: rgba(255,255,255,0.06) !important;">
                  ${isActive ? `
                    <span class="status-pill text-success" style="background: rgba(16, 185, 129, 0.15);">
                      <span class="status-dot active"></span> Target Aktif
                    </span>
                  ` : `
                    <button class="btn btn-secondary btn-sm" onclick="switchChannel('${ch.channel_id}')">
                      <i class="bi bi-check2"></i> Gunakan Channel Ini
                    </button>
                  `}
                  <button class="btn btn-danger-subtle btn-sm" onclick="deleteChannel('${ch.channel_id}', '${escapeHtml(ch.title)}')" title="Hapus channel ini">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        });
        channelsContainer.innerHTML = chHtml;
      }
    }

    // Perbarui dropdown Target Channel di Card Pengaturan Otomatisasi & SEO
    const settingChannelSelect = document.getElementById('settingChannelSelect');
    if (settingChannelSelect) {
      const channels = data.channels || [];
      const currentSelected = settingChannelSelect.value;
      let selectHtml = '';
      if (channels.length === 0) {
        selectHtml = '<option value="">(Belum Ada Channel Terhubung)</option>';
      } else {
        channels.forEach(ch => {
          const isActive = (ch.is_active === 1);
          selectHtml += `<option value="${ch.channel_id}">${escapeHtml(ch.title)} ${isActive ? '⭐ (Aktif)' : ''}</option>`;
        });
      }
      settingChannelSelect.innerHTML = selectHtml;
      const targetToSelect = currentSelected || activeChannelGlobalId || (channels[0] ? channels[0].channel_id : '');
      if (targetToSelect && settingChannelSelect.querySelector(`option[value="${targetToSelect}"]`)) {
        settingChannelSelect.value = targetToSelect;
      }
      updateSettingsLockState(settingChannelSelect.value);
    }
  } catch (e) {}
}

window.switchChannel = async function(channelId) {
  try {
    const res = await fetch(`/api/youtube/switch-channel/${channelId}`, { method: 'POST' });
    if (res.ok) {
      showToast('Target channel YouTube berhasil diubah!', 'success');
      activeChannelGlobalId = String(channelId).trim();
      await fetchYouTubeStatus();
      await Promise.all([
        fetchStats(),
        fetchQueue(),
        fetchStock(),
        fetchSettings(channelId)
      ]);
    } else {
      showToast('Gagal beralih channel.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
};

window.deleteChannel = async function(channelId, title) {
  if (!confirm(`Apakah Anda yakin ingin memutuskan dan menghapus channel '${title}'?`)) return;
  try {
    const res = await fetch(`/api/youtube/channels/${channelId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(`Channel '${title}' berhasil dihapus.`, 'info');
      await fetchYouTubeStatus();
    } else {
      showToast('Gagal menghapus channel.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
};

async function fetchLogs() {
  try {
    const res = await fetch('/api/logs?limit=50');
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById('logsContainer');

    let html = '';
    (data.logs || []).forEach(log => {
      let colorClass = 'text-secondary';
      if (log.level === 'SUCCESS') colorClass = 'text-success';
      else if (log.level === 'ERROR') colorClass = 'text-danger';
      else if (log.level === 'INFO') colorClass = 'text-info';

      html += `<div class="mb-1 pb-1 border-bottom" style="border-color: rgba(255,255,255,0.03) !important;">
        <span class="text-secondary">[${formatTime(log.timestamp)}]</span>
        <strong class="${colorClass}">[${log.level}]</strong> ${escapeHtml(log.message)}
      </div>`;
    });

    container.innerHTML = html || '<p class="text-secondary mb-0">Belum ada log tercatat.</p>';
  } catch (e) {}
}

window.openEditModal = function(id) {
  const video = currentStock.find(v => v.id === id);
  if (!video) return;

  document.getElementById('editVideoId').value = video.id;
  const isUploaded = !!video.youtube_id;
  document.getElementById('editModalTitle').innerHTML = `
    Edit Video #${String(video.queue_number).padStart(4, '0')} 
    ${isUploaded ? '<span class="status-pill text-success ms-2" style="background: rgba(16, 185, 129, 0.15); font-size: 0.72rem;"><i class="bi bi-cloud-check"></i> Sinkron ke YouTube</span>' : ''}
  `;
  document.getElementById('editTitle').value = video.title || '';
  document.getElementById('editTags').value = (video.tags || []).join(', ');
  document.getElementById('editDescription').value = video.description || '';
  document.getElementById('editSchedule').value = video.scheduled_time ? video.scheduled_time.substring(0, 16) : '';

  if (bootstrapEditModal) {
    bootstrapEditModal.show();
  }
};

window.uploadNow = async function(id) {
  if (!confirm('Apakah Anda yakin ingin segera mengunggah video ini ke YouTube sekarang?')) return;
  showToast('Memulai upload ke YouTube...', 'info');
  try {
    const res = await fetch(`/api/stock/${id}/upload-now`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Video berhasil diunggah ke YouTube Shorts!', 'success');
      fetchStock();
      fetchStats();
    } else {
      showToast('Gagal mengunggah: ' + (data.detail || 'Terjadi kesalahan.'), 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
};

window.togglePauseQueue = async function() {
  try {
    const res = await fetch('/api/queue/toggle-pause', { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.status === 'success') {
      const isPaused = data.queue_paused;
      showToast(isPaused ? 'Antrean unduhan dijeda (Paused).' : 'Antrean unduhan dilanjutkan.', isPaused ? 'warning' : 'success');
      fetchStats();
      fetchQueue();
    } else {
      showToast('Gagal mengubah status jeda antrean.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
};

window.cancelQueueItem = async function(queueId) {
  if (!confirm('Apakah Anda yakin ingin membatalkan unduhan item ini?')) return;
  try {
    const res = await fetch(`/api/queue/${queueId}/cancel`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Unduhan berhasil dibatalkan.', 'info');
      fetchQueue();
      fetchStats();
    } else {
      showToast(data.detail || 'Gagal membatalkan unduhan.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan saat membatalkan unduhan.', 'error');
  }
};

window.cancelAllQueue = async function() {
  if (!confirm('Apakah Anda yakin ingin MEMBATALKAN SEMUA antrean unduh yang belum selesai?')) return;
  try {
    const res = await fetch('/api/queue/cancel-all', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast(`${data.count || 0} antrean unduh berhasil dibatalkan!`, 'warning');
      fetchQueue();
      fetchStats();
    } else {
      showToast('Gagal membatalkan seluruh antrean.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
};

window.deleteVideo = async function(id) {
  const video = currentStock.find(v => v.id === id);
  const isUploaded = video && video.youtube_id;
  const msg = isUploaded 
    ? `⚠️ Video ini SUDAH TERUNGGAH di YouTube Shorts.\n\nApakah Anda yakin ingin MENGHAPUS video ini dari channel YouTube Anda dan dari stok lokal?`
    : `Apakah Anda yakin ingin menghapus video ini dari stok dan penyimpanan lokal?`;

  if (!confirm(msg)) return;
  try {
    const res = await fetch(`/api/stock/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(isUploaded ? 'Video berhasil dihapus dari channel YouTube dan lokal!' : 'Video berhasil dihapus dari stok.', 'success');
      fetchStock();
      fetchStats();
    } else {
      showToast('Gagal menghapus video.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
};

function formatTime(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoStr;
  }
}

function formatScheduleDate(isoStr) {
  if (!isoStr) return 'Belum Terjadwal';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    }) + ' WIB';
  } catch (e) {
    return isoStr;
  }
}

function formatRelativeTime(isoStr) {
  if (!isoStr) return 'Belum tayang';
  try {
    const targetDate = new Date(isoStr);
    if (isNaN(targetDate.getTime())) return 'Belum tayang';

    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();

    if (diffMs < 0) {
      const futureMin = Math.floor(Math.abs(diffMs) / (1000 * 60));
      const futureHour = Math.floor(futureMin / 60);
      const futureDay = Math.floor(futureHour / 24);
      if (futureDay > 0) return `Tayang dlm ${futureDay} hari`;
      if (futureHour > 0) return `Tayang dlm ${futureHour} jam`;
      if (futureMin > 0) return `Tayang dlm ${futureMin} mnt`;
      return 'Segera tayang';
    }

    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);
    const month = Math.floor(day / 30);

    if (sec < 60) return 'Baru saja';
    if (min < 60) return `${min} mnt lalu`;
    if (hour < 24) return `${hour} jam lalu`;
    if (day < 30) return `${day} hr lalu`;
    if (month < 12) return `${month} bln lalu`;
    return `${Math.floor(day / 365)} thn lalu`;
  } catch (e) {
    return 'Belum tayang';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* -------------------------------------------------------------------------- */
/* Fitur Baru: Ekstraksi Shorts dari Channel YouTube                          */
/* -------------------------------------------------------------------------- */
function validateChannelInput(raw) {
  const s = (raw || '').trim();
  if (!s) {
    return { valid: false, message: 'Link channel YouTube tidak boleh kosong.' };
  }

  // Handle format langsung @ChannelName
  if (/^@[a-zA-Z0-9_\.\-]+(?:\/)?$/.test(s)) {
    return { valid: true, normalized: s };
  }

  let urlObj;
  try {
    const full = s.startsWith('http://') || s.startsWith('https://') ? s : 'https://' + s;
    urlObj = new URL(full);
  } catch (e) {
    return { valid: false, message: 'Format tautan tidak valid.' };
  }

  const host = urlObj.hostname.toLowerCase();
  if (host !== 'youtube.com' && !host.endsWith('.youtube.com')) {
    return { valid: false, message: 'Bukan link YouTube. Fitur ini khusus untuk link channel YouTube.' };
  }

  const pathname = urlObj.pathname.replace(/\/+$/, '');

  // Tolak jika link video individual
  if (pathname.includes('/watch') || urlObj.searchParams.has('v')) {
    return { valid: false, message: 'Ini adalah link video, bukan link channel YouTube. Harap masukkan link channel.' };
  }

  if (host === 'youtu.be') {
    return { valid: false, message: 'Ini adalah link video, bukan link channel YouTube.' };
  }

  if (/^\/shorts\/[a-zA-Z0-9_\-]+$/.test(pathname)) {
    return { valid: false, message: 'Ini adalah link video Shorts individual, bukan link channel YouTube.' };
  }

  // Format channel yang valid: /@username, /channel/UC..., /c/..., /user/...
  if (/^\/@[a-zA-Z0-9_\.\-]+(?:\/(shorts|videos|featured))?$/.test(pathname)) {
    return { valid: true, normalized: s };
  }
  if (/^\/channel\/UC[a-zA-Z0-9_\-]+(?:\/(shorts|videos|featured))?$/.test(pathname)) {
    return { valid: true, normalized: s };
  }
  if (/^\/(c|user)\/[a-zA-Z0-9_\.\-]+(?:\/(shorts|videos|featured))?$/.test(pathname)) {
    return { valid: true, normalized: s };
  }

  return { valid: false, message: 'Format channel tidak dikenali. Gunakan format seperti: https://www.youtube.com/@NamaChannel atau @NamaChannel' };
}

function initChannelExtractorListeners() {
  const btnOpen = document.getElementById('btnOpenChannelExtractor');
  const urlInput = document.getElementById('channelUrlInput');
  const limitInput = document.getElementById('channelLimitInput');
  const limitBadge = document.getElementById('channelLimitBadge');
  const presetBtns = document.querySelectorAll('.preset-limit-btn');
  const feedbackEl = document.getElementById('channelUrlFeedback');
  const feedbackText = document.getElementById('channelUrlFeedbackText');
  const loadingEl = document.getElementById('channelExtractorLoading');
  const btnSubmit = document.getElementById('btnSubmitChannelExtract');
  const btnCancel = document.getElementById('btnCancelChannelExtract');

  if (!btnOpen) return;

  // Buka Modal & Reset State
  btnOpen.addEventListener('click', () => {
    if (urlInput) {
      urlInput.value = '';
      urlInput.classList.remove('is-invalid', 'is-valid');
      urlInput.disabled = false;
    }
    if (feedbackEl) feedbackEl.classList.add('d-none');
    if (loadingEl) loadingEl.classList.add('d-none');
    if (limitInput) {
      limitInput.value = '5';
      limitInput.disabled = false;
    }
    if (limitBadge) limitBadge.innerText = '5 Video Terbaru';

    presetBtns.forEach(btn => {
      if (btn.getAttribute('data-limit') === '5') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="bi bi-cloud-arrow-down-fill me-1"></i> Ambil & Masukkan Antrean';
    }

    if (bootstrapChannelModal) {
      bootstrapChannelModal.show();
      setTimeout(() => {
        if (urlInput) urlInput.focus();
      }, 400);
    }
  });

  // Tombol Pilihan Preset Cepat
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-limit');
      if (limitInput) limitInput.value = val;
      if (limitBadge) limitBadge.innerText = `${val} Video Terbaru`;

      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Input Limit Bebas Manual
  if (limitInput) {
    limitInput.addEventListener('input', () => {
      const val = parseInt(limitInput.value) || 0;
      if (limitBadge) limitBadge.innerText = `${val} Video Terbaru`;

      // Sinkronkan state tombol preset
      presetBtns.forEach(b => {
        if (b.getAttribute('data-limit') === String(val)) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    });
  }

  // Validasi Real-time Input URL Channel saat mengetik / blur
  const validateUi = () => {
    const val = urlInput ? urlInput.value.trim() : '';
    if (!val) {
      if (feedbackEl) feedbackEl.classList.add('d-none');
      if (urlInput) urlInput.classList.remove('is-invalid', 'is-valid');
      return true;
    }
    const check = validateChannelInput(val);
    if (!check.valid) {
      if (feedbackEl && feedbackText) {
        feedbackText.innerText = check.message;
        feedbackEl.classList.remove('d-none');
      }
      if (urlInput) {
        urlInput.classList.add('is-invalid');
        urlInput.classList.remove('is-valid');
      }
      return false;
    } else {
      if (feedbackEl) feedbackEl.classList.add('d-none');
      if (urlInput) {
        urlInput.classList.remove('is-invalid');
        urlInput.classList.add('is-valid');
      }
      return true;
    }
  };

  if (urlInput) {
    urlInput.addEventListener('input', validateUi);
    urlInput.addEventListener('blur', validateUi);
  }

  // Eksekusi Ekstraksi Channel
  const submitExtract = async () => {
    const rawUrl = urlInput ? urlInput.value.trim() : '';
    const check = validateChannelInput(rawUrl);

    if (!check.valid) {
      if (feedbackEl && feedbackText) {
        feedbackText.innerText = check.message;
        feedbackEl.classList.remove('d-none');
      }
      if (urlInput) {
        urlInput.classList.add('is-invalid');
        urlInput.focus();
      }
      return;
    }

    const limitVal = parseInt(limitInput ? limitInput.value : 5) || 5;
    if (limitVal < 1) {
      showToast('Jumlah video minimal 1.', 'error');
      return;
    }

    // Set UI Loading State
    if (feedbackEl) feedbackEl.classList.add('d-none');
    if (loadingEl) loadingEl.classList.remove('d-none');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Mengambil...';
    }
    if (btnCancel) btnCancel.disabled = true;
    if (urlInput) urlInput.disabled = true;
    if (limitInput) limitInput.disabled = true;

    try {
      const res = await fetch('/api/channel/extract-shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_url: rawUrl,
          limit: limitVal
        })
      });

      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          data = { detail: 'Format respon server tidak valid.' };
        }
      } else {
        const textErr = await res.text().catch(() => '');
        data = { detail: textErr || `Server merespon dengan status ${res.status}` };
      }

      if (res.ok && data.status === 'success') {
        if (bootstrapChannelModal) {
          bootstrapChannelModal.hide();
        }
        let extractMsg = `Berhasil mengambil ${data.count} Shorts terbaru dari "${data.channel_title}"!`;
        if (data.skipped_count > 0) {
          extractMsg += ` (${data.skipped_count} duplikat dilewati)`;
        }
        showToast(extractMsg, 'success');
        fetchQueue();
        fetchStats();
      } else {
        const errMsg = data.detail || 'Gagal mengekstrak video Shorts dari channel.';
        if (feedbackEl && feedbackText) {
          feedbackText.innerText = errMsg;
          feedbackEl.classList.remove('d-none');
        }
        showToast(errMsg, 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      if (loadingEl) loadingEl.classList.add('d-none');
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="bi bi-cloud-arrow-down-fill me-1"></i> Ambil & Masukkan Antrean';
      }
      if (btnCancel) btnCancel.disabled = false;
      if (urlInput) urlInput.disabled = false;
      if (limitInput) limitInput.disabled = false;
    }
  };

  if (btnSubmit) {
    btnSubmit.addEventListener('click', submitExtract);
  }
}

