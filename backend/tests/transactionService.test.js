const {
  calculateTotalInvested,
  calculateTotalSold,
  calculateRealizedProfit,
  calculateAverageCost,
  calculateNetQuantity,
  groupByAssetType,
  validateTransaction
} = require('../src/services/transactionService');

describe('calculateTotalInvested', () => {
  test('toplam yatırımı doğru hesaplar', () => {
    const txns = [
      { transaction_type: 'ALIS', quantity: 2, buy_price: 100 },
      { transaction_type: 'ALIS', quantity: 3, buy_price: 200 },
      { transaction_type: 'SATIS', quantity: 1, sell_price: 150 },
    ];
    expect(calculateTotalInvested(txns)).toBe(800);
  });

  test('boş liste için 0 döner', () => {
    expect(calculateTotalInvested([])).toBe(0);
  });
});

describe('calculateTotalSold', () => {
  test('toplam satışı doğru hesaplar', () => {
    const txns = [
      { transaction_type: 'ALIS', quantity: 2, buy_price: 100 },
      { transaction_type: 'SATIS', quantity: 1, sell_price: 150 },
      { transaction_type: 'SATIS', quantity: 2, sell_price: 200 },
    ];
    expect(calculateTotalSold(txns)).toBe(550);
  });

  test('satış yoksa 0 döner', () => {
    const txns = [{ transaction_type: 'ALIS', quantity: 2, buy_price: 100 }];
    expect(calculateTotalSold(txns)).toBe(0);
  });
});

describe('calculateNetQuantity', () => {
  test('net miktarı doğru hesaplar', () => {
    const txns = [
      { transaction_type: 'ALIS', quantity: 10 },
      { transaction_type: 'ALIS', quantity: 5 },
      { transaction_type: 'SATIS', quantity: 3 },
    ];
    expect(calculateNetQuantity(txns)).toBe(12);
  });
});

describe('calculateAverageCost', () => {
  test('ağırlıklı ortalama maliyeti doğru hesaplar', () => {
    const txns = [
      { transaction_type: 'ALIS', quantity: 2, buy_price: 100 },
      { transaction_type: 'ALIS', quantity: 3, buy_price: 200 },
    ];
    expect(calculateAverageCost(txns)).toBe(160);
  });

  test('boş liste için 0 döner', () => {
    expect(calculateAverageCost([])).toBe(0);
  });
});

describe('calculateRealizedProfit', () => {
  test('kar doğru hesaplanmalı', () => {
    const txns = [
      { transaction_type: 'ALIS', quantity: 10, buy_price: 100 },
      { transaction_type: 'SATIS', quantity: 5, sell_price: 150 },
    ];
    const profit = calculateRealizedProfit(txns);
    expect(profit).toBe(250); // (150 - 100) * 5 = 250
  });
});

describe('groupByAssetType', () => {
  test('işlemleri tipe göre gruplar', () => {
    const txns = [
      { asset_type: 'ALTIN', transaction_type: 'ALIS', quantity: 1, buy_price: 100 },
      { asset_type: 'DOVIZ', transaction_type: 'ALIS', quantity: 2, buy_price: 50 },
      { asset_type: 'ALTIN', transaction_type: 'SATIS', quantity: 1, sell_price: 120 },
    ];
    const result = groupByAssetType(txns);
    expect(result['ALTIN'].length).toBe(2);
    expect(result['DOVIZ'].length).toBe(1);
  });
});

describe('validateTransaction', () => {
  test('geçerli alış işlemi kabul edilmeli', () => {
    const data = { asset_id: 1, transaction_type: 'ALIS', quantity: 5, buy_price: 100, date: '2026-05-19' };
    expect(validateTransaction(data)).toBeNull();
  });

  test('geçerli satış işlemi kabul edilmeli', () => {
    const data = { asset_id: 1, transaction_type: 'SATIS', quantity: 5, sell_price: 150, date: '2026-05-19' };
    expect(validateTransaction(data)).toBeNull();
  });

  test('geçersiz işlem tipi reddedilmeli', () => {
    const data = { asset_id: 1, transaction_type: 'GECERSIZ', quantity: 5, buy_price: 100, date: '2026-05-19' };
    expect(validateTransaction(data)).toBeTruthy();
  });

  test('negatif miktar reddedilmeli', () => {
    const data = { asset_id: 1, transaction_type: 'ALIS', quantity: -5, buy_price: 100, date: '2026-05-19' };
    expect(validateTransaction(data)).toBeTruthy();
  });

  test('alışta fiyat olmadan reddedilmeli', () => {
    const data = { asset_id: 1, transaction_type: 'ALIS', quantity: 5, date: '2026-05-19' };
    expect(validateTransaction(data)).toBeTruthy();
  });

  test('satışta fiyat olmadan reddedilmeli', () => {
    const data = { asset_id: 1, transaction_type: 'SATIS', quantity: 5, date: '2026-05-19' };
    expect(validateTransaction(data)).toBeTruthy();
  });

  test('tarih olmadan reddedilmeli', () => {
    const data = { asset_id: 1, transaction_type: 'ALIS', quantity: 5, buy_price: 100 };
    expect(validateTransaction(data)).toBeTruthy();
  });
});