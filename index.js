
const express = require('express');
const { createServer } = require('http')
const { WebSocketServer } = require('ws')
const bodyParser = require('body-parser');
const cors = require('cors')
const logo = require('./userconfig.js')
const app = express()
require('dotenv/config');


const port = process.env.PORT || 8082;

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const access_token = '';

const userConfig = {
  appName: process.env.APP_NAME,
  clientLogoBase64: logo,
  ssoClientId: process.env.SS0_CLIENT_ID,
  secretID: process.env.SSO_SECRET_ID,
  ssoDomainCognito: process.env.SSO_COGNITO_DOMAIN,
  ssoRedirectURL : process.env.SSO_REDIRECT_URL,
  authInvolvesDomain: process.env.INVOLVES_AUTH_DOMAIN
}

console.log(userConfig)

const endpoint = `minha-rota-do-backend/${access_token}`;

app.post(endpoint, (req, res) =>{
  res.send('Olá mundo')
});

app.post('/v1/api/token', (req, res) =>{
  const tokens = {
    accessToken: "561rcodao1pv4iaqeqd9sj85t1.561rcodao1pv4iaqeqd9sj85t1.561rcodao1pv4iaqeqd9sj85t1",
    refreshToken: "1gfnffbfm7ofimn7p5abtjte75k3cg0929q19r49qfbnf39scm52.1gfnffbfm7ofimn7p5abtjte75k3cg0929q19r49qfbnf39scm52",
  }
  res.json(tokens)
});

app.get('/v1/api/info/customer', (req, res) =>{
  console.log('Chegou Chamada do servidor Aqui.. 1.')
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
  