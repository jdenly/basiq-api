const axios = require('axios');
const {getAccessToken, createUser, getUsers, createConnection, getAccounts} = require('../../src/services/basiq.service');

/**
 * Tests the basiq server. Not a local integration test - calls the real test server.
 * Ensure there is a valid API key available as environment variable BASIQ_API_KEY before running these tests.
 * This test will delete test users (test. prefix emails) before running but it will leave data behind in your dev account.
 */
describe('Basiq service', () => {
  const BASIQ_API_KEY = process.env.BASIQ_API_KEY;

  beforeAll(async () => {
    const accessToken = await getAccessToken(BASIQ_API_KEY);
    const users = await getUsers(accessToken.access_token);
    const deletes = [];
    users.data
      .filter(user => user.email.startsWith('test.'))
      .map(user => {
        const config = {
          method: 'delete',
          url: `https://au-api.basiq.io/users/${user.id}`,
          headers: {
            'Authorization': `Bearer ${accessToken.access_token}`
          }
        };
        deletes.push(axios(config));
      });
    await Promise.all(deletes);
  });

  describe('Get access token', () => {
    test('should correctly return an access token when given a valid API key', async () => {
      await expect(getAccessToken(BASIQ_API_KEY)).resolves.toStrictEqual(
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
      const firstName = 'Test';
      const lastName = 'User';
      const accessToken = await getAccessToken(BASIQ_API_KEY);
      await expect(createUser(accessToken.access_token, email, mobile, firstName, lastName)).resolves.toStrictEqual(
        expect.objectContaining({
          type: 'user',
          id: expect.any(String),
          email: email,
          mobile: mobile,
          firstName: firstName,
          lastName: lastName,
        })
      );
    });
  });

  describe('Create connection', () => {
    test('should correctly connect a user to a financial institution', async () => {
      const institutionId = 'AU00000';
      const loginId = 'gavinBelson';
      const password = 'hooli2016';
      const accessToken = await getAccessToken(BASIQ_API_KEY);
      const user = await createUser(accessToken.access_token, 'test.connection@hooli.com', '+614xxxxxxxx');
      await expect(createConnection(accessToken.access_token, user.id, institutionId, loginId, password)).resolves.toStrictEqual(
        expect.objectContaining({
          type: 'job',
          id: expect.any(String),
        })
      );
      // TODO - retrieve job (https://api.basiq.io/reference/retrieve-a-job) and wait until it's successful before checking for connection.
    });
  });

  describe('Get accounts', () => {
    test('should correctly retrieve a list of accounts for a user with accounts', async () => {
      const institutionId = 'AU00000';
      const loginId = 'gavinBelson';
      const password = 'hooli2016';
      const accessToken = await getAccessToken(BASIQ_API_KEY);
      const user = await createUser(accessToken.access_token, 'test.accounts@hooli.com', '+614xxxxxxxx');
      await createConnection(accessToken.access_token, user.id, institutionId, loginId, password);

      // The creation of the accounts appears to be eventually consistent, so this will fail sometimes
      // due to the race condition with the job associated with the account creation.
      // TODO get job and wait for job completion (https://api.basiq.io/reference/retrieve-a-job), use retries/progressive back-off.
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
