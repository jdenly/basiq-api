const axios = require('axios');
const qs = require('qs');
const data = qs.stringify({
  'scope': 'SERVER_ACCESS'
})

/**
 * Get basiq access token for making further requests.
 * @param {string} apiKey
 * @returns {string} the access token
 */
const getAccessToken = async (apiKey) => {
  const config = {
    method: 'post',
    url: 'https://au-api.basiq.io/token',
    headers: {
      'Authorization': `Basic ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '2.0'
    },
    data : data
  };

  try {
    let response = await axios(config);
    return response.data;
  } catch (e) {
    console.log(e.response.data);
  }
};

/**
 * Get all users.
 * @param accessToken
 * @returns {Promise<void>}
 */
const getUsers = async (accessToken) => {
  const config = {
    method: 'get',
    url: 'https://au-api.basiq.io/users',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    }
  };

  try {
    let response = await axios(config);
    return response.data;
  } catch (e) {
    console.log(e.response.data);
  }
}

/**
 * Create a new user.
 * @param {string} accessToken
 * @param {string} email
 * @param {string} mobile
 * @param {string} firstName optional first name of the user
 * @param {string} lastName optional last name of the user
 * @returns {Object} user details
 */
const createUser = async (accessToken, email, mobile, firstName, lastName) => {
  const data = JSON.stringify({
    "email": email,
    "mobile": mobile,
    "firstName": firstName,
    "lastName": lastName,
  });

  const config = {
    method: 'post',
    url: 'https://au-api.basiq.io/users',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    let response = await axios(config);
    return response.data;
  } catch (e) {
    console.log(e.response.data);
  }
};

/**
 * Create a new connection between a user and financial institution.
 * @param {string} accessToken
 * @param {string} userId to link
 * @param {string} institutionId to link to
 * @param {string} loginId credentials for the institution
 * @param {string} password credentials for the institution
 * @returns {Object} connection details
 */
const createConnection = async (accessToken, userId, institutionId, loginId, password) => {
  const data = JSON.stringify({
    "loginId": loginId,
    "password": password,
    "institution": {
      "id": institutionId
    }
  });

  const config = {
    method: 'post',
    url: `https://au-api.basiq.io/users/${userId}/connections`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    let response = await axios(config);
    return response.data;
  } catch (e) {
    console.log(e.response.data);
  }
};

/**
 * Retrieve accounts for a given user.
 * @param {string} accessToken
 * @param {string} userId to get the accounts for
 * @returns {Object} list of account details
 */
const getAccounts = async (accessToken, userId) => {
  const config = {
    method: 'get',
    url: `https://au-api.basiq.io/users/${userId}/accounts`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    }
  };

  try {
    let response = await axios(config);
    return response.data;
  } catch (e) {
    console.log(e.response.data);
  }
};

module.exports = {
  getAccessToken,
  getUsers,
  createUser,
  createConnection,
  getAccounts,
};
