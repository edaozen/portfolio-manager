const API = 'http://localhost:3000/api';
let editingAssetId = null;

// ─── SAYFA YÖNETİMİ ───────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  event.target.classList.add('active');
  if (name === 'summary') loadSummary();
  if (name === 'assets') loadAssets();
  if (name === 'transactions') loadTransactions();
}

// ─── ÖZET ─────────────────────────────────────────────────
async function loadSummary() {
  const res = await fetch(`${API}/portfolio/summary`);
  const data = await res.json();
  document.getElementById('total-amount').textContent =
    formatMoney(data.totalInvested);
  const grid = document.getElementById('summary-grid');
  grid.innerHTML = '';
  const typeLabels = { ALTIN: '🥇 Altın', DOVIZ: '💵 Döviz', KRIPTO: '🪙 Kripto', HISSE: '📈 Hisse', FON: '🏦 Fon' };
  for (const type in data.summary) {
    const s = data.summary[type];
    const card = document.createElement('div');
    card.className = 'summary-card';
    card.innerHTML = `
      <h3>${typeLabels[type] || type}</h3>
      <div class="amount">${formatMoney(s.totalInvested)}</div>
      <div class="sub">${s.transactionCount} işlem · Ort. maliyet: ${formatMoney(s.averageCost)}</div>
    `;
    grid.appendChild(card);
  }
  if (Object.keys(data.summary).length === 0) {
    grid.innerHTML = '<div class="empty">Henüz işlem yok. İşlemler sekmesinden ekleyebilirsiniz.</div>';
  }
}

// ─── VARLIKLAR ─────────────────────────────────────────────
async function loadAssets() {
  const res = await fetch(`${API}/assets`);
  const assets = await res.json();
  const list = document.getElementById('assets-list');
  list.innerHTML = '';
  if (assets.length === 0) {
    list.innerHTML = '<div class="empty">Henüz varlık eklenmedi.</div>';
    return;
  }
  assets.forEach(a => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-info">
        <h3>${a.name} <span class="badge badge-${a.type}">${a.type}</span></h3>
        <p>Birim: ${a.unit} · Eklenme: ${a.created_at?.slice(0,10) || '-'}</p>
      </div>
      <div class="card-actions">
        <button class="btn btn-secondary" onclick="openAssetModal(${a.id}, '${a.name}', '${a.type}', '${a.unit}')">Düzenle</button>
        <button class="btn btn-danger" onclick="deleteAsset(${a.id})">Sil</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function openAssetModal(id = null, name = '', type = 'ALTIN', unit = '') {
  editingAssetId = id;
  document.getElementById('asset-modal-title').textContent = id ? 'Varlık Düzenle' : 'Yeni Varlık Ekle';
  document.getElementById('asset-name').value = name;
  document.getElementById('asset-type').value = type;
  document.getElementById('asset-unit').value = unit;
  document.getElementById('asset-error').textContent = '';
  document.getElementById('asset-modal').classList.add('open');
}

function closeAssetModal() {
  document.getElementById('asset-modal').classList.remove('open');
  editingAssetId = null;
}

async function saveAsset() {
  const name = document.getElementById('asset-name').value.trim();
  const type = document.getElementById('asset-type').value;
  const unit = document.getElementById('asset-unit').value.trim();

  if (!name || !unit) {
    document.getElementById('asset-error').textContent = 'Tüm alanları doldurun.';
    return;
  }

  const method = editingAssetId ? 'PUT' : 'POST';
  const url = editingAssetId ? `${API}/assets/${editingAssetId}` : `${API}/assets`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, unit })
  });

  if (!res.ok) {
    const err = await res.json();
    document.getElementById('asset-error').textContent = err.error;
    return;
  }

  closeAssetModal();
  loadAssets();
}

async function deleteAsset(id) {
  if (!confirm('Bu varlığı silmek istediğinize emin misiniz?')) return;
  const res = await fetch(`${API}/assets/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    alert(err.error);
    return;
  }
  loadAssets();
}

// ─── İŞLEMLER ─────────────────────────────────────────────
async function loadTransactions() {
  const type = document.getElementById('filter-type')?.value || '';
  const url = type ? `${API}/transactions?type=${type}` : `${API}/transactions`;
  const res = await fetch(url);
  const txns = await res.json();
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  if (txns.length === 0) {
    list.innerHTML = '<div class="empty">Henüz işlem eklenmedi.</div>';
    return;
  }
  txns.forEach(t => {
    const total = (t.quantity * t.buy_price).toLocaleString('tr-TR');
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-info">
        <h3>${t.asset_name} <span class="badge badge-${t.asset_type}">${t.asset_type}</span></h3>
        <p>${t.quantity} ${t.unit} · ${formatMoney(t.buy_price)} / ${t.unit} · Toplam: ${formatMoney(t.quantity * t.buy_price)}</p>
        <p style="margin-top:4px; color:#475569">${t.date}${t.notes ? ' · ' + t.notes : ''}</p>
      </div>
      <div class="card-actions">
        <button class="btn btn-danger" onclick="deleteTransaction(${t.id})">Sil</button>
      </div>
    `;
    list.appendChild(card);
  });
}

async function openTransactionModal() {
  const res = await fetch(`${API}/assets`);
  const assets = await res.json();
  const select = document.getElementById('tx-asset');
  select.innerHTML = '';
  if (assets.length === 0) {
    alert('Önce bir varlık eklemelisiniz!');
    return;
  }
  assets.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.name} (${a.type})`;
    select.appendChild(opt);
  });
  document.getElementById('tx-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('tx-quantity').value = '';
  document.getElementById('tx-price').value = '';
  document.getElementById('tx-notes').value = '';
  document.getElementById('tx-error').textContent = '';
  document.getElementById('transaction-modal').classList.add('open');
}

function closeTransactionModal() {
  document.getElementById('transaction-modal').classList.remove('open');
}

async function saveTransaction() {
  const asset_id = parseInt(document.getElementById('tx-asset').value);
  const quantity = parseFloat(document.getElementById('tx-quantity').value);
  const buy_price = parseFloat(document.getElementById('tx-price').value);
  const date = document.getElementById('tx-date').value;
  const notes = document.getElementById('tx-notes').value.trim();

  if (!quantity || quantity <= 0) { document.getElementById('tx-error').textContent = 'Miktar sıfırdan büyük olmalı.'; return; }
  if (!buy_price || buy_price <= 0) { document.getElementById('tx-error').textContent = 'Fiyat sıfırdan büyük olmalı.'; return; }
  if (!date) { document.getElementById('tx-error').textContent = 'Tarih seçin.'; return; }

  const res = await fetch(`${API}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_id, quantity, buy_price, date, notes })
  });

  if (!res.ok) {
    const err = await res.json();
    document.getElementById('tx-error').textContent = err.error;
    return;
  }

  closeTransactionModal();
  loadTransactions();
}

async function deleteTransaction(id) {
  if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
  await fetch(`${API}/transactions/${id}`, { method: 'DELETE' });
  loadTransactions();
}

// ─── YARDIMCI ─────────────────────────────────────────────
function formatMoney(amount) {
  return Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

// ─── BAŞLANGIÇ ────────────────────────────────────────────
loadSummary();