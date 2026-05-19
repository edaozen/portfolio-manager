const API = 'http://localhost:3000/api';
let editingAssetId = null;
let editingTransactionId = null;

const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
if (!token) window.location.href = '/login';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = '/login';
}

const TYPE_COLORS = {
  ALTIN: '#fbbf24',
  DOVIZ: '#4ade80',
  KRIPTO: '#a78bfa',
  HISSE: '#38bdf8',
  FON: '#e879f9'
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  event.target.classList.add('active');
  if (name === 'summary') loadSummary();
  if (name === 'assets') loadAssets();
  if (name === 'transactions') loadTransactions();
}

async function updateBadges() {
  const res = await fetch(`${API}/transactions`, { headers: authHeaders() });
  const txns = await res.json();
  const badge = document.getElementById('tx-badge');
  if (txns.length > 0) {
    badge.textContent = txns.length;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

async function loadSummary() {
  document.getElementById('header-username').textContent = `👤 ${username}`;
  const res = await fetch(`${API}/portfolio/summary`, { headers: authHeaders() });
  const data = await res.json();
  document.getElementById('total-amount').textContent = formatMoney(data.totalInvested);
  const grid = document.getElementById('summary-grid');
  grid.innerHTML = '';
  const typeLabels = { ALTIN: '🥇 Altın', DOVIZ: '💵 Döviz', KRIPTO: '🪙 Kripto', HISSE: '📈 Hisse', FON: '🏦 Fon' };

  for (const type in data.summary) {
    const s = data.summary[type];
    const color = TYPE_COLORS[type] || '#94a3b8';
    const card = document.createElement('div');
    card.className = 'summary-card';
    card.style.borderLeft = `4px solid ${color}`;
    card.style.cursor = 'pointer';
    card.style.transition = 'transform 0.15s, box-shadow 0.15s';
    card.onmouseenter = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = `0 4px 20px ${color}33`; };
    card.onmouseleave = () => { card.style.transform = ''; card.style.boxShadow = ''; };
    card.onclick = () => showTransactionsByType(type);
    card.innerHTML = `
      <h3>${typeLabels[type] || type}</h3>
      <div class="amount">${formatMoney(s.totalInvested)}</div>
      <div class="sub">${s.transactionCount} işlem · Ort. maliyet: ${formatMoney(s.averageCost)}</div>
      <div style="margin-top:8px; font-size:11px; color:#475569">👆 İşlemleri görmek için tıkla</div>
    `;
    grid.appendChild(card);
  }

  if (Object.keys(data.summary).length === 0) {
    grid.innerHTML = '<div class="empty">Henüz işlem yok. İşlemler sekmesinden ekleyebilirsiniz.</div>';
    document.getElementById('chart-container').style.display = 'none';
    return;
  }

  drawChart(data.summary, data.totalInvested);
}

function drawChart(summary, total) {
  const container = document.getElementById('chart-container');
  container.style.display = 'flex';
  const canvas = document.getElementById('portfolio-chart');
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 80;
  const innerRadius = 45;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let startAngle = -Math.PI / 2;
  const slices = [];

  for (const type in summary) {
    const value = summary[type].totalInvested;
    const slice = (value / total) * 2 * Math.PI;
    slices.push({ type, value, slice, startAngle });
    startAngle += slice;
  }

  slices.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, s.startAngle, s.startAngle + s.slice);
    ctx.closePath();
    ctx.fillStyle = TYPE_COLORS[s.type] || '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('TOPLAM', cx, cy - 6);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 12px Segoe UI';
  ctx.fillText(formatMoney(total).replace(' ₺', '₺'), cx, cy + 10);

  const legend = document.getElementById('chart-legend');
  legend.innerHTML = '';
  const typeLabels = { ALTIN: 'Altın', DOVIZ: 'Döviz', KRIPTO: 'Kripto', HISSE: 'Hisse', FON: 'Fon' };
  slices.forEach(s => {
    const pct = ((s.value / total) * 100).toFixed(1);
    const item = document.createElement('div');
    item.style.cssText = 'display:flex; align-items:center; gap:10px; margin-bottom:10px;';
    item.innerHTML = `
      <div style="width:10px;height:10px;border-radius:50%;background:${TYPE_COLORS[s.type]};flex-shrink:0"></div>
      <span style="font-size:13px;color:#e2e8f0">${typeLabels[s.type] || s.type}</span>
      <span style="font-size:12px;color:#64748b;margin-left:auto;padding-left:16px">${pct}%</span>
    `;
    legend.appendChild(item);
  });
}

async function loadAssets(searchTerm = '') {
  const res = await fetch(`${API}/assets`, { headers: authHeaders() });
  let assets = await res.json();
  if (searchTerm) {
    assets = assets.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  const list = document.getElementById('assets-list');
  list.innerHTML = '';
  if (assets.length === 0) {
    list.innerHTML = '<div class="empty">Varlık bulunamadı.</div>';
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
    headers: authHeaders(),
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
  const res = await fetch(`${API}/assets/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json();
    alert(err.error);
    return;
  }
  loadAssets();
}

async function loadTransactions() {
  const type = document.getElementById('filter-type')?.value || '';
  const url = type ? `${API}/transactions?type=${type}` : `${API}/transactions`;
  const res = await fetch(url, { headers: authHeaders() });
  const txns = await res.json();
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  if (txns.length === 0) {
    list.innerHTML = '<div class="empty">Henüz işlem eklenmedi.</div>';
    return;
  }
  txns.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.borderLeft = `4px solid ${TYPE_COLORS[t.asset_type] || '#334155'}`;
    card.innerHTML = `
      <div class="card-info">
        <h3>${t.asset_name} <span class="badge badge-${t.asset_type}">${t.asset_type}</span></h3>
        <p>${t.quantity} ${t.unit} · ${formatMoney(t.buy_price)} / ${t.unit} · Toplam: ${formatMoney(t.quantity * t.buy_price)}</p>
        <p style="margin-top:6px; font-size:13px">
          <span style="color:#94a3b8">${formatDate(t.date)}</span>
          ${t.notes ? `<span style="background:#1e3a5f; color:#38bdf8; padding:2px 8px; border-radius:6px; margin-left:8px; font-size:12px">📌 ${t.notes}</span>` : ''}
        </p>
      </div>
      <div class="card-actions">
        <button class="btn btn-secondary" onclick="openTransactionEditModal(${t.id}, ${t.asset_id}, ${t.quantity}, ${t.buy_price}, '${t.date}', '${t.notes || ''}')">Düzenle</button>
        <button class="btn btn-danger" onclick="deleteTransaction(${t.id})">Sil</button>
      </div>
    `;
    list.appendChild(card);
  });
  updateBadges();
}

async function openTransactionModal() {
  editingTransactionId = null;
  const res = await fetch(`${API}/assets`, { headers: authHeaders() });
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
  document.getElementById('tx-modal-title').textContent = 'Yeni İşlem Ekle';
  document.getElementById('tx-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('tx-quantity').value = '';
  document.getElementById('tx-price').value = '';
  document.getElementById('tx-notes').value = '';
  document.getElementById('tx-error').textContent = '';
  document.getElementById('transaction-modal').classList.add('open');
}

async function openTransactionEditModal(id, assetId, quantity, buyPrice, date, notes) {
  editingTransactionId = id;
  const res = await fetch(`${API}/assets`, { headers: authHeaders() });
  const assets = await res.json();
  const select = document.getElementById('tx-asset');
  select.innerHTML = '';
  assets.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.name} (${a.type})`;
    if (a.id === assetId) opt.selected = true;
    select.appendChild(opt);
  });
  document.getElementById('tx-modal-title').textContent = 'İşlem Düzenle';
  document.getElementById('tx-quantity').value = quantity;
  document.getElementById('tx-price').value = buyPrice;
  document.getElementById('tx-date').value = date;
  document.getElementById('tx-notes').value = notes;
  document.getElementById('tx-error').textContent = '';
  document.getElementById('transaction-modal').classList.add('open');
}

function closeTransactionModal() {
  document.getElementById('transaction-modal').classList.remove('open');
  editingTransactionId = null;
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

  const method = editingTransactionId ? 'PUT' : 'POST';
  const url = editingTransactionId ? `${API}/transactions/${editingTransactionId}` : `${API}/transactions`;

  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: JSON.stringify({ asset_id, quantity, buy_price, date, notes })
  });

  if (!res.ok) {
    const err = await res.json();
    document.getElementById('tx-error').textContent = err.error;
    return;
  }
  closeTransactionModal();
  loadTransactions();
  updateBadges();
}

async function deleteTransaction(id) {
  if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
  await fetch(`${API}/transactions/${id}`, { method: 'DELETE', headers: authHeaders() });
  loadTransactions();
  updateBadges();
}

async function showTransactionsByType(type) {
  const res = await fetch(`${API}/transactions?type=${type}`, { headers: authHeaders() });
  const txns = await res.json();
  const typeLabels = { ALTIN: '🥇 Altın', DOVIZ: '💵 Döviz', KRIPTO: '🪙 Kripto', HISSE: '📈 Hisse', FON: '🏦 Fon' };
  const color = TYPE_COLORS[type] || '#94a3b8';

  const modal = document.getElementById('detail-modal');
  const title = document.getElementById('detail-modal-title');
  const list = document.getElementById('detail-modal-list');

  title.textContent = `${typeLabels[type]} İşlemleri`;
  title.style.color = color;
  list.innerHTML = '';

  txns.forEach(t => {
    const item = document.createElement('div');
    item.style.cssText = `background:#0f172a; border:1px solid #334155; border-left: 3px solid ${color}; border-radius:8px; padding:14px; margin-bottom:10px;`;
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600; color:#f1f5f9">${t.asset_name}</span>
        <span style="color:${color}; font-weight:700">${formatMoney(t.quantity * t.buy_price)}</span>
      </div>
      <div style="font-size:12px; color:#64748b; margin-top:6px">
        ${t.quantity} ${t.unit} · ${formatMoney(t.buy_price)} / ${t.unit}
      </div>
      <div style="font-size:12px; color:#475569; margin-top:4px">
        ${formatDate(t.date)} ${t.notes ? `· <span style="color:#38bdf8">📌 ${t.notes}</span>` : ''}
      </div>
    `;
    list.appendChild(item);
  });

  modal.classList.add('open');
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('open');
}

function formatMoney(amount) {
  return Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

function formatDate(dateStr) {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

loadSummary();
updateBadges();