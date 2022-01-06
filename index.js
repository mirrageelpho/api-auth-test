
const express = require('express');
const { createServer } = require('http')
const { WebSocketServer } = require('ws')
const bodyParser = require('body-parser');
const cors = require('cors')
const {logo, token} = require('./userconfig.js')
const {handler} = require('./lambdaJwt')
const app = express()
require('dotenv/config');

const axios = require('axios')


const port = process.env.PORT || 8082;

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

 
const access_token = '';

const userConfig = {
  appName: process.env.APP_NAME,
  clientLogoBase64: 'logo',
  ssoClientId: process.env.SSO_CLIENT_ID,
  ssoClientSecret: process.env.SSO_SECRET_ID,
  ssoUserPoolDomain: process.env.SSO_COGNITO_DOMAIN,
  ssoRedirectURL : process.env.SSO_REDIRECT_URL,
  authInvolvesDomain: process.env.INVOLVES_AUTH_DOMAIN,
  ssoUserPoolId: null
}

userConfig.clientLogoBase64 = logo

const endpoint = `minha-rota-do-backend/${access_token}`;
const request = async () => {
  const region = 'us-east-1', userPoolId = '728b6c29-0d2c-4a54-86c6-c533be6b9b11'
  try {
    const {data} = await axios.post(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json
    `);
    return data
  } catch (error) {
    return error.response.data
  }
}

//handler(token).then(res => {
//  console.log(res)
//})
// request()
// .then( data => console.log('request', data))



app.post(endpoint,(req, res) =>{
  res.send('Olá mundo')
});

app.post('/api/login', (req, res) =>{
  console.log('/api/login')
  const tokens = {
    accessToken: token,
    refreshToken: token,
  }
  res.json(tokens)
  
});

app.get('/api/client/login-info', (req, res) =>{
  console.log('/api/client/login-info')
  res.json(userConfig)
});

app.post('/agile-web/sistema/configsistema/crud!getConfigAgilePromoterDTO.action', (req, res) =>{
  console.log('Aqui...')
  res.json(userConfig)
});

const server = createServer(app)

const ws = new WebSocketServer({ server })

let sockets = []

ws.on('connection', socket => {
  console.log('Mobile Connectado')
  sockets.push(socket)
  socket.on('message', msg => {
    console.log('Sending message ', msg)
    sockets.forEach(s => s.send(msg))
  })
  socket.on('close', ()=>{
    console.log('close connection ')
    sockets = sockets.filter(s => s !== socket)
  })
})

server.listen(port, () => {
    console.log(`\n Simulador de chamadas ${port}`);
});

module.exports = server;
  