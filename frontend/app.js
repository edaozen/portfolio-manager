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
  localStorage.removeItem('currentPage');
  window.location.href = '/login';
}

const TYPE_COLORS = {
  ALTIN: '#fbbf24',
  DOVIZ: '#4ade80',
  KRIPTO: '#a78bfa',
  HISSE: '#38bdf8',
  FON: '#e879f9'
};

const TYPE_LABELS = {
  ALTIN: '🥇 Altın',
  DOVIZ: '💵 Döviz',
  KRIPTO: '🪙 Kripto',
  HISSE: '📈 Hisse',
  FON: '🏦 Fon'
};

let currentPage = localStorage.getItem('currentPage') || 'summary';

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  event.target.classList.add('active');
  currentPage = name;
  localStorage.setItem('currentPage', name);
  if (name === 'summary') loadSummary();
  if (name === 'assets') loadAssets();
  if (name === 'transactions') loadTransactions();
}

function refreshCurrentPage() {
  if (currentPage === 'summary') loadSummary();
  if (currentPage === 'assets') loadAssets();
  if (currentPage === 'transactions') loadTransactions();
  updateBadges();
}

function initPage() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + currentPage).classList.add('active');
  const navButtons = document.querySelectorAll('nav button');
  navButtons.forEach(b => {
    if (currentPage === 'summary' && b.textContent.includes('Özet')) b.classList.add('active');
    if (currentPage === 'assets' && b.textContent.includes('Varlık')) b.classList.add('active');
    if (currentPage === 'transactions' && b.textContent.includes('İşlem')) b.classList.add('active');
  });
  if (currentPage === 'summary') loadSummary();
  if (currentPage === 'assets') loadAssets();
  if (currentPage === 'transactions') loadTransactions();
  updateBadges();
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

// ─── ÖZET ─────────────────────────────────────────────────
async function loadSummary() {
  document.getElementById('header-username').textContent = `👤 ${username}`;
  const res = await fetch(`${API}/portfolio/summary`, { headers: authHeaders() });
  const data = await res.json();

  document.getElementById('total-amount').textContent = formatMoney(data.totalInvested);
  document.getElementById('total-sold').textContent = formatMoney(data.totalSold);
  const profitEl = document.getElementById('total-profit');
  const isProfit = data.realizedProfit >= 0;
  profitEl.textContent = (isProfit ? '+' : '') + formatMoney(data.realizedProfit);
  profitEl.style.color = isProfit ? '#4ade80' : '#ef4444';

  const grid = document.getElementById('summary-grid');
  grid.innerHTML = '';

  if (Object.keys(data.summary).length === 0) {
    grid.innerHTML = '<div class="empty">Henüz işlem yok. İşlemler sekmesinden ekleyebilirsiniz.</div>';
    document.getElementById('chart-container').style.display = 'none';
    return;
  }

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
      <h3>${TYPE_LABELS[type] || type}</h3>
      <div style="font-size:13px; color:#94a3b8; margin-top:8px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Toplam Yatırım</span>
          <span style="color:#f1f5f9; font-weight:600;">${formatMoney(s.totalInvested)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Toplam Satış</span>
          <span style="color:#f1f5f9; font-weight:600;">${formatMoney(s.totalSold)}</span>
        </div>
        ${s.realizedProfit !== 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Gerçekleşen ${s.realizedProfit > 0 ? 'Kar' : 'Zarar'}</span>
          <span style="color:${s.realizedProfit > 0 ? '#4ade80' : '#ef4444'}; font-weight:600;">
            ${formatMoney(s.realizedProfit)}
          </span>
        </div>` : ''}
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Kalan Miktar</span>
          <span style="color:#f1f5f9;">${s.netQuantity} adet</span>
        </div>
        <div style="color:#475569; font-size:11px; margin-top:4px;">${s.transactionCount} işlem</div>
      </div>
      <div style="margin-top:8px; font-size:11px; color:#475569">👆 İşlemleri görmek için tıkla</div>
    `;
    grid.appendChild(card);
  }

  document.getElementById('chart-container').style.display = 'flex';
  drawPieChart('chart-alis', data.summary, s => s.totalInvested, 'ALIŞ');
  drawPieChart('chart-satis', data.summary, s => s.totalSold, 'SATIŞ');
  drawBarChart('chart-profit', data.summary);
  drawLegend(data.summary);
}

// ─── PASTA GRAFİK ─────────────────────────────────────────
function drawPieChart(canvasId, summary, getValue, title) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 70;
  const innerRadius = 38;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const slices = [];
  let total = 0;

  for (const type in summary) {
    const value = getValue(summary[type]);
    if (value > 0) {
      slices.push({ type, value });
      total += value;
    }
  }

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Veri yok', cx, cy + 4);
    return;
  }

  let startAngle = -Math.PI / 2;
  slices.forEach(s => {
    const slice = (s.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = TYPE_COLORS[s.type] || '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle += slice;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText(title, cx, cy - 4);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 9px Segoe UI';
  ctx.fillText(formatMoney(total).replace(' ₺', '₺'), cx, cy + 10);
}

// ─── BAR CHART ────────────────────────────────────────────
function drawBarChart(canvasId, summary) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const types = Object.keys(summary);
  const profits = types.map(t => summary[t].realizedProfit);

  if (profits.every(p => p === 0)) {
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Kar/Zarar yok', canvas.width / 2, canvas.height / 2);
    return;
  }

  const maxAbs = Math.max(...profits.map(Math.abs), 1);
  const padding = 30;
  const chartHeight = canvas.height - padding * 2;
  const chartWidth = canvas.width - padding * 2;
  const barWidth = Math.min(40, chartWidth / types.length - 10);
  const zeroY = padding + chartHeight / 2;

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, zeroY);
  ctx.lineTo(canvas.width - padding, zeroY);
  ctx.stroke();

  types.forEach((type, i) => {
    const profit = profits[i];
    const barHeight = (Math.abs(profit) / maxAbs) * (chartHeight / 2 - 10);
    const x = padding + (chartWidth / types.length) * i + (chartWidth / types.length - barWidth) / 2;
    const y = profit >= 0 ? zeroY - barHeight : zeroY;
    const color = profit >= 0 ? '#4ade80' : '#ef4444';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight || 2, 4);
    ctx.fill();

    ctx.fillStyle = TYPE_COLORS[type] || '#94a3b8';
    ctx.font = '9px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(type.slice(0, 3), x + barWidth / 2, canvas.height - 8);

    if (profit !== 0) {
      ctx.fillStyle = color;
      ctx.font = 'bold 8px Segoe UI';
      const label = (profit >= 0 ? '+' : '') + Math.round(Math.abs(profit) / 1000) + 'K';
      ctx.fillText(label, x + barWidth / 2, profit >= 0 ? y - 4 : y + barHeight + 10);
    }
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('KAR / ZARAR', canvas.width / 2, 12);
}

function drawLegend(summary) {
  const legend = document.getElementById('chart-legend');
  legend.innerHTML = '';
  for (const type in summary) {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:8px;';
    item.innerHTML = `
      <div style="width:10px;height:10px;border-radius:50%;background:${TYPE_COLORS[type]};flex-shrink:0"></div>
      <span style="font-size:12px;color:#e2e8f0">${TYPE_LABELS[type] || type}</span>
    `;
    legend.appendChild(item);
  }
}

// ─── VARLIKLAR ─────────────────────────────────────────────
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
  refreshCurrentPage();
}

async function deleteAsset(id) {
  if (!confirm('Bu varlığı silmek istediğinize emin misiniz?')) return;
  const res = await fetch(`${API}/assets/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json();
    alert(err.error);
    return;
  }
  refreshCurrentPage();
}

async function deleteAllAssets() {
  if (!confirm('Tüm varlıklar silinecek. Bağlı tüm işlemler de otomatik olarak silinecektir. Emin misiniz?')) return;
  await fetch(`${API}/assets`, { method: 'DELETE', headers: authHeaders() });
  refreshCurrentPage();
}

async function deleteAllTransactions() {
  if (!confirm('Tüm işlemler silinecek. Emin misiniz?')) return;
  await fetch(`${API}/transactions`, { method: 'DELETE', headers: authHeaders() });
  refreshCurrentPage();
}

// ─── İŞLEMLER ─────────────────────────────────────────────
async function loadTransactions() {
  const type = document.getElementById('filter-type')?.value || '';
  const txType = document.getElementById('filter-tx-type')?.value || '';
  let url = `${API}/transactions`;
  const params = [];
  if (type) params.push(`type=${type}`);
  if (txType) params.push(`transaction_type=${txType}`);
  if (params.length) url += '?' + params.join('&');

  const res = await fetch(url, { headers: authHeaders() });
  const txns = await res.json();
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  if (txns.length === 0) {
    list.innerHTML = '<div class="empty">Henüz işlem eklenmedi.</div>';
    return;
  }
  txns.forEach(t => {
    const isAlis = t.transaction_type === 'ALIS';
    const borderColor = isAlis ? TYPE_COLORS[t.asset_type] || '#334155' : '#ef4444';
    const card = document.createElement('div');
    card.className = 'card';
    card.style.borderLeft = `4px solid ${borderColor}`;
    card.innerHTML = `
      <div class="card-info">
        <h3>
          ${t.asset_name}
          <span class="badge badge-${t.asset_type}">${t.asset_type}</span>
          <span style="background:${isAlis ? '#052e16' : '#2d0a0a'}; color:${isAlis ? '#4ade80' : '#ef4444'}; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:700; margin-left:4px;">
            ${isAlis ? '📈 ALIŞ' : '📉 SATIŞ'}
          </span>
        </h3>
        <p>${t.quantity} ${t.unit} · ${formatMoney(isAlis ? t.buy_price : t.sell_price)} / ${t.unit} · Toplam: ${formatMoney(t.quantity * (isAlis ? t.buy_price : t.sell_price))}</p>
        <p style="margin-top:6px; font-size:13px">
          <span style="color:#94a3b8">${formatDate(t.date)}</span>
          ${t.notes ? `<span style="background:#1e3a5f; color:#38bdf8; padding:2px 8px; border-radius:6px; margin-left:8px; font-size:12px">📌 ${t.notes}</span>` : ''}
        </p>
      </div>
      <div class="card-actions">
        <button class="btn btn-secondary" onclick="openTransactionEditModal(${t.id}, ${t.asset_id}, '${t.transaction_type}', ${t.quantity}, ${t.buy_price || 0}, ${t.sell_price || 0}, '${t.date}', '${t.notes || ''}')">Düzenle</button>
        <button class="btn btn-danger" onclick="deleteTransaction(${t.id})">Sil</button>
      </div>
    `;
    list.appendChild(card);
  });
  updateBadges();
}

function toggleTransactionType() {
  const type = document.getElementById('tx-type').value;
  const buyGroup = document.getElementById('buy-price-group');
  const sellGroup = document.getElementById('sell-price-group');
  if (type === 'ALIS') {
    buyGroup.style.display = 'flex';
    sellGroup.style.display = 'none';
  } else {
    buyGroup.style.display = 'none';
    sellGroup.style.display = 'flex';
  }
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
  document.getElementById('tx-type').value = 'ALIS';
  document.getElementById('tx-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('tx-quantity').value = '';
  document.getElementById('tx-buy-price').value = '';
  document.getElementById('tx-sell-price').value = '';
  document.getElementById('tx-notes').value = '';
  document.getElementById('tx-error').textContent = '';
  toggleTransactionType();
  document.getElementById('transaction-modal').classList.add('open');
}

async function openTransactionEditModal(id, assetId, txType, quantity, buyPrice, sellPrice, date, notes) {
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
  document.getElementById('tx-type').value = txType;
  document.getElementById('tx-quantity').value = quantity;
  document.getElementById('tx-buy-price').value = buyPrice || '';
  document.getElementById('tx-sell-price').value = sellPrice || '';
  document.getElementById('tx-date').value = date;
  document.getElementById('tx-notes').value = notes;
  document.getElementById('tx-error').textContent = '';
  toggleTransactionType();
  document.getElementById('transaction-modal').classList.add('open');
}

function closeTransactionModal() {
  document.getElementById('transaction-modal').classList.remove('open');
  editingTransactionId = null;
}

async function saveTransaction() {
  const asset_id = parseInt(document.getElementById('tx-asset').value);
  const transaction_type = document.getElementById('tx-type').value;
  const quantity = parseFloat(document.getElementById('tx-quantity').value);
  const buy_price = parseFloat(document.getElementById('tx-buy-price').value) || null;
  const sell_price = parseFloat(document.getElementById('tx-sell-price').value) || null;
  const date = document.getElementById('tx-date').value;
  const notes = document.getElementById('tx-notes').value.trim();

  if (!quantity || quantity <= 0) { document.getElementById('tx-error').textContent = 'Miktar sıfırdan büyük olmalı.'; return; }
  if (transaction_type === 'ALIS' && (!buy_price || buy_price <= 0)) { document.getElementById('tx-error').textContent = 'Alış fiyatı giriniz.'; return; }
  if (transaction_type === 'SATIS' && (!sell_price || sell_price <= 0)) { document.getElementById('tx-error').textContent = 'Satış fiyatı giriniz.'; return; }
  if (!date) { document.getElementById('tx-error').textContent = 'Tarih seçin.'; return; }

  if (transaction_type === 'SATIS' && editingTransactionId) {
    const assetsRes = await fetch(`${API}/transactions?asset_id=${asset_id}`, { headers: authHeaders() });
    const assetTxns = await assetsRes.json();
    const kalanMiktar = assetTxns
      .filter(t => t.transaction_type === 'ALIS')
      .reduce((sum, t) => sum + t.quantity, 0) -
      assetTxns
      .filter(t => t.transaction_type === 'SATIS' && t.id !== editingTransactionId)
      .reduce((sum, t) => sum + t.quantity, 0);
    if (quantity > kalanMiktar) {
      document.getElementById('tx-error').textContent = `Yetersiz miktar. Elinizdeki: ${kalanMiktar}`;
      return;
    }
  }

  if (transaction_type === 'ALIS' && editingTransactionId) {
    const assetsRes = await fetch(`${API}/transactions?asset_id=${asset_id}`, { headers: authHeaders() });
    const assetTxns = await assetsRes.json();
    const toplamSatis = assetTxns
      .filter(t => t.transaction_type === 'SATIS')
      .reduce((sum, t) => sum + t.quantity, 0);
    const digerAlislar = assetTxns
      .filter(t => t.transaction_type === 'ALIS' && t.id !== editingTransactionId)
      .reduce((sum, t) => sum + t.quantity, 0);
    const yeniToplamAlis = digerAlislar + quantity;
    if (yeniToplamAlis < toplamSatis) {
      document.getElementById('tx-error').textContent = `Bu alış miktarı toplam satıştan az olamaz. Minimum: ${toplamSatis - digerAlislar}`;
      return;
    }
  }

  const method = editingTransactionId ? 'PUT' : 'POST';
  const url = editingTransactionId ? `${API}/transactions/${editingTransactionId}` : `${API}/transactions`;

  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: JSON.stringify({ asset_id, transaction_type, quantity, buy_price, sell_price, date, notes })
  });

  if (!res.ok) {
    const err = await res.json();
    document.getElementById('tx-error').textContent = err.error;
    return;
  }
  closeTransactionModal();
  refreshCurrentPage();
}

async function deleteTransaction(id) {
  if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
  await fetch(`${API}/transactions/${id}`, { method: 'DELETE', headers: authHeaders() });
  refreshCurrentPage();
}

async function showTransactionsByType(type) {
  const res = await fetch(`${API}/transactions?type=${type}`, { headers: authHeaders() });
  const txns = await res.json();
  const color = TYPE_COLORS[type] || '#94a3b8';

  const modal = document.getElementById('detail-modal');
  const title = document.getElementById('detail-modal-title');
  const list = document.getElementById('detail-modal-list');

  title.textContent = `${TYPE_LABELS[type]} İşlemleri`;
  title.style.color = color;
  list.innerHTML = '';

  txns.forEach(t => {
    const isAlis = t.transaction_type === 'ALIS';
    const item = document.createElement('div');
    item.style.cssText = `background:#0f172a; border:1px solid #334155; border-left: 3px solid ${isAlis ? color : '#ef4444'}; border-radius:8px; padding:14px; margin-bottom:10px;`;
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600; color:#f1f5f9">${t.asset_name} <span style="font-size:11px; color:${isAlis ? '#4ade80' : '#ef4444'}">${isAlis ? '📈 ALIŞ' : '📉 SATIŞ'}</span></span>
        <span style="color:${isAlis ? color : '#ef4444'}; font-weight:700">${formatMoney(t.quantity * (isAlis ? t.buy_price : t.sell_price))}</span>
      </div>
      <div style="font-size:12px; color:#64748b; margin-top:6px">
        ${t.quantity} ${t.unit} · ${formatMoney(isAlis ? t.buy_price : t.sell_price)} / ${t.unit}
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

initPage();