const { register, login } = require('../src/services/authService');

describe('register', () => {
  test('boş kullanıcı adı reddedilmeli', () => {
    const result = register('', '1234');
    expect(result.error).toBeTruthy();
  });

  test('kısa şifre reddedilmeli', () => {
    const result = register('testuser', '123');
    expect(result.error).toBeTruthy();
  });
});

describe('login', () => {
  test('boş kullanıcı adı reddedilmeli', () => {
    const result = login('', '1234');
    expect(result.error).toBeTruthy();
  });

  test('boş şifre reddedilmeli', () => {
    const result = login('testuser', '');
    expect(result.error).toBeTruthy();
  });

  test('olmayan kullanıcı reddedilmeli', () => {
    const result = login('olmayankisi99', '1234');
    expect(result.error).toBeTruthy();
  });
});