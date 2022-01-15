const {getAccessToken, createUser, createConnection, getAccounts} = require('../../../src/services/basiq.service');

/**
 * Tests the basiq server. Not really a unit test, was just a handy spot to do some initial testing - calls the real test server.
 * Ensure there is a valid access key available as environment variable BASIQ_ACCESS_KEY before running these tests.
 * They will leave data behind in your dev account (not unit test...).
 */
describe('Basiq service', () => {
  const BASIQ_ACCESS_KEY = process.env.BASIQ_ACCESS_KEY;

  describe('Get access token', () => {
    test('should correctly return an access token when given a valid API key', async () => {
      await expect(getAccessToken(BASIQ_ACCESS_KEY)).resolves.toStrictEqual(
        expect.objectContaining({
          access_token: expect.any(String),
          expires_in: expect.any(Number),
          token_type: "Bearer"
        })
      );
    });

    test('should reject when given an invalid API key', async () => {
      await expect(getAccessToken("thisisnotavalidapikey==")).rejects;
    });
  });

  describe('Create user', () => {
    test('should correctly create a user', async () => {
      const email = 'test.user@hooli.com';
      const mobile = '+614xxxxxxxx';
      const accessToken = await getAccessToken(BASIQ_ACCESS_KEY);
      await expect(createUser(accessToken.access_token, email, mobile)).resolves.toStrictEqual(
        expect.objectContaining({
          type: 'user',
          id: expect.any(String),
          email: email,
          mobile: mobile,
        })
      );
    });
  });

  describe('Create connection', () => {
    test('should correctly connect a user to a financial institution', async () => {
      const institutionId = 'AU00000';
      const loginId = 'gavinBelson';
      const password = 'hooli2016';
      const accessToken = await getAccessToken(BASIQ_ACCESS_KEY);
      const user = await createUser(accessToken.access_token, 'test.connection@hooli.com', '+614xxxxxxxx');
      await expect(createConnection(accessToken.access_token, user.id, institutionId, loginId, password)).resolves.toStrictEqual(
        expect.objectContaining({
          type: 'job',
          id: expect.any(String),
        })
      );
    });
  });

  describe('Get accounts', () => {
    test('should correctly retrieve a list of accounts for a user with accounts', async () => {
      const institutionId = 'AU00000';
      const loginId = 'gavinBelson';
      const password = 'hooli2016';
      const accessToken = await getAccessToken(BASIQ_ACCESS_KEY);
      const user = await createUser(accessToken.access_token, 'test.accounts@hooli.com', '+614xxxxxxxx');
      await createConnection(accessToken.access_token, user.id, institutionId, loginId, password);
      await expect(getAccounts(accessToken.access_token, user.id, institutionId, loginId, password)).resolves.toStrictEqual(
        expect.objectContaining({
          type: 'list',
          data: expect.arrayContaining([
            expect.objectContaining({"accountNo": "000-001 00002"}),
            expect.objectContaining({"accountNo": "000-001 02935"}),
            expect.objectContaining({"accountNo": "000-001 02955"}),
            expect.objectContaining({"accountNo": "000-001 04381"}),
            expect.objectContaining({"accountNo": "14317265"}),
          ]),
        })
      );
    });
  });
});
