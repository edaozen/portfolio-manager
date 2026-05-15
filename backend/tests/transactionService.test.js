const { calculateTotalInvested, calculateAverageCost, groupByAssetType, validateTransaction } = require('../src/services/transactionService');

describe('calculateTotalInvested', () => {
  test('toplam yatırımı doğru hesaplar', () => {
    const txns = [
      { quantity: 2, buy_price: 100 },
      { quantity: 3, buy_price: 200 },
    ];
    expect(calculateTotalInvested(txns)).toBe(800);
  });

  test('boş liste için 0 döner', () => {
    expect(calculateTotalInvested([])).toBe(0);
  });
});

describe('calculateAverageCost', () => {
  test('ağırlıklı ortalama maliyeti doğru hesaplar', () => {
    const txns = [
      { quantity: 2, buy_price: 100 },
      { quantity: 3, buy_price: 200 },
    ];
    expect(calculateAverageCost(txns)).toBe(160);
  });

  test('boş liste için 0 döner', () => {
    expect(calculateAverageCost([])).toBe(0);
  });
});

describe('groupByAssetType', () => {
  test('işlemleri tipe göre gruplar', () => {
    const txns = [
      { asset_type: 'ALTIN', quantity: 1, buy_price: 100 },
      { asset_type: 'DOVIZ', quantity: 2, buy_price: 50 },
      { asset_type: 'ALTIN', quantity: 3, buy_price: 200 },
    ];
    const result = groupByAssetType(txns);
    expect(result['ALTIN'].length).toBe(2);
    expect(result['DOVIZ'].length).toBe(1);
  });
});

describe('validateTransaction', () => {
  test('geçerli işlemi kabul eder', () => {
    const data = { asset_id: 1, quantity: 5, buy_price: 100, date: '2026-05-15' };
    expect(validateTransaction(data)).toBeNull();
  });

  test('negatif miktar reddedilir', () => {
    const data = { asset_id: 1, quantity: -5, buy_price: 100, date: '2026-05-15' };
    expect(validateTransaction(data)).toBeTruthy();
  });

  test('sıfır fiyat reddedilir', () => {
    const data = { asset_id: 1, quantity: 5, buy_price: 0, date: '2026-05-15' };
    expect(validateTransaction(data)).toBeTruthy();
  });

  test('tarih olmadan reddedilir', () => {
    const data = { asset_id: 1, quantity: 5, buy_price: 100 };
    expect(validateTransaction(data)).toBeTruthy();
  });
})