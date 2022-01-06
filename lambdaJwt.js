const {promisify} = require('util');
const Axios = require('axios');
const jsonwebtoken = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');


const cognitoPoolId = process.env.COGNITO_POOL_ID || 'us-east-2:484d6381-c482-41fc-a16c-ba04dc5e369d';
if (!cognitoPoolId) {
  throw new Error('env var required for cognito pool');
}
const cognitoIssuer = `https://cognito-idp.us-east-2.amazonaws.com/${cognitoPoolId}`;

let cacheKeys;
const getPublicKeys = async () => {
  if (!cacheKeys) {
    const url = `${cognitoIssuer}/.well-known/jwks.json`;
    const publicKeys = await Axios.default.get(url);
    console.log('publicKeys', publicKeys)
    cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = {instance: current, pem};
      return agg;
    }, {});

    console.log('publicKeys', cacheKeys)

    return cacheKeys;
  } else {

    console.log('publicKeys', cacheKeys)

    return cacheKeys;
  }
};

const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

const handler = async (token) => {
  let result;
  try {
    //console.log(`user claim verify invoked for ${token}`);
    const tokenSections = (token || '').split('.');
    console.log(tokenSections)
    if (tokenSections.length < 2) {
      throw new Error('requested token is invalid');
    }
    const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJSON);
    let key;
    getPublicKeys().then( keys => {
        console.log('Keys: ', keys)
        key = keys[header.kid];
    });

    if (key === undefined) {
      throw new Error('claim made for unknown kid');
    }
    const claim = await verifyPromised(token, key.pem);
    const currentSeconds = Math.floor( (new Date()).valueOf() / 1000);
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      throw new Error('claim is expired or invalid');
    }
    if (claim.iss !== cognitoIssuer) {
      throw new Error('claim issuer is invalid');
    }
    if (claim.token_use !== 'access') {
      throw new Error('claim use is not access');
    }
    console.log(`claim confirmed for ${claim.username}`);
    result = {userName: claim.username, clientId: claim.client_id, isValid: true};
  } catch (error) {
    console.log(`Last Error ===> ${error}`);
    result = {userName: '', clientId: '', error, isValid: false};
  }
  return result;
};

module.exports = { handler }