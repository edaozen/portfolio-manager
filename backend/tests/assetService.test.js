const { validateAsset } = require('../src/services/assetService');

describe('validateAsset', () => {
  test('geçerli varlık kabul edilmeli', () => {
    const data = { name: 'Gram Altın', type: 'ALTIN', unit: 'gram' };
    expect(validateAsset(data)).toBeNull();
  });

  test('boş isim reddedilmeli', () => {
    const data = { name: '', type: 'ALTIN', unit: 'gram' };
    expect(validateAsset(data)).toBeTruthy();
  });

  test('geçersiz tip reddedilmeli', () => {
    const data = { name: 'Test', type: 'GECERSIZ', unit: 'adet' };
    expect(validateAsset(data)).toBeTruthy();
  });

  test('boş birim reddedilmeli', () => {
    const data = { name: 'Test', type: 'DOVIZ', unit: '' };
    expect(validateAsset(data)).toBeTruthy();
  });

  test('tüm tipler geçerli olmalı', () => {
    const tipler = ['ALTIN', 'DOVIZ', 'KRIPTO', 'HISSE', 'FON'];
    tipler.forEach(tip => {
      const data = { name: 'Test', type: tip, unit: 'adet' };
      expect(validateAsset(data)).toBeNull();
    });
  });
});