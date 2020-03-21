const express = require('express');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(3001);
// WARNING: app.listen(80) will NOT work here!
 
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ players: [], read: 0 }).write()

const allCards = [
  {name: 'c1'}, {name: 'c2'}, {name: 'c3'}, {name: 'c4'}, {name: 'c5'}, {name: 'c6'}, {name: 'c7'}, {name: 'c8'}, {name: 'c9'}, {name: 'c10'}, {name: 'cj'}, {name: 'cq'}, {name: 'ck'},
  {name: 'd1'}, {name: 'd2'}, {name: 'd3'}, {name: 'd4'}, {name: 'd5'}, {name: 'd6'}, {name: 'd7'}, {name: 'd8'}, {name: 'd9'}, {name: 'd10'}, {name: 'dj'}, {name: 'dq'}, {name: 'dk'},
  {name: 's1'}, {name: 's2'}, {name: 's3'}, {name: 's4'}, {name: 's5'}, {name: 's6'}, {name: 's7'}, {name: 's8'}, {name: 's9'}, {name: 's10'}, {name: 'sj'}, {name: 'sq'}, {name: 'sk'},
  {name: 'h1'}, {name: 'h2'}, {name: 'h3'}, {name: 'h4'}, {name: 'h5'}, {name: 'h6'}, {name: 'h7'}, {name: 'h8'}, {name: 'h9'}, {name: 'h10'}, {name: 'hj'}, {name: 'hq'}, {name: 'hk'},
  {name: 'jb'}, {name: 'jc'},
]
let thisGameCards = allCards;

const numberOfPlayers = 4;

io.on('connection', async function (socket) {
  socket.on('join', async function(data) {
    try{

      if(db.get('players').size().value() >= numberOfPlayers) return socket.emit('roomFull');

      const name = data.myName;

      const otherPlayers = db.get('players').map(player => {return {name: player.name}}).value()
      
      let playerCards = [];
      for(let i=0; i<12; i++) {
        let rand = Math.floor(Math.random() * thisGameCards.length);
        playerCards.push(thisGameCards[rand]);
        thisGameCards.splice(rand, 1);
      } 
      let newPlayer = {
        name,
        socketID: socket.id,
        ip: '',
        cards: playerCards,
        read: 0,
      }
      db.get('players').push(newPlayer).write()

      io.to('room1').emit('newPlayerJoined', {player: {name}});
      socket.emit('youJoined', {name: newPlayer.name, cards: newPlayer.cards, otherPlayers});
      socket.join('room1');

      await checkAndStart();
    } catch (err) {
      console.log(err)
    }
  })
});

async function checkAndStart() {
  if(db.get('players').size().value() == numberOfPlayers) {
    io.to('room1').emit('startGame', {});
    await reading(0, function(err, lastReadPlayer){
      const {name, read: lastRead} = lastReadPlayer;
      db.set('read', lastRead).write();
      console.log(db.get('read').value());
      await commanding(name, function(err, command) {
        console.log(command)
      })
    });
  }
}
async function reading(playerIndex, cb) {
  if(db.get('players').filter({read: -1}).size().value() == (numberOfPlayers-1)) {
    return cb(null, db.get('players').find(player => player.read != -1).cloneDeep().value());
  } else if(db.get('players').nth(playerIndex).value().read == -1) {
    await reading((playerIndex+1)%numberOfPlayers, cb)
  } else {
    const player = db.get('players').nth(playerIndex).value();
    let {name, read, socketID} = player;
    let socket = io.sockets.sockets[socketID]
    socket.removeAllListeners('Iread');
    socket.emit('read', {highestRead: await getHighestRead()});
    socket.on('Iread', async function(data) {
      db.get('players').nth(playerIndex).assign({ read: parseInt(data.read) }).write();
      io.to('room1').emit('otherPlayerRead', {name, read});
      await reading((playerIndex+1)%numberOfPlayers, cb)
    })
  }
}
async function commanding(playerName, cb) {
  try{
    const player = db.get('players').find({name: playerName}).value();
    let {name, socketID} = player;
    let socket = io.sockets.sockets[socketID]
    socket.removeAllListeners('command');
    socket.emit('command');
    socket.on('Icommand', async function(data) {
      //db.get('players').nth(playerIndex).assign({ read: parseInt(data.read) }).write();
      io.to('room1').emit('otherPlayerCommand', {name, command: data.command});
      //await reading((playerIndex+1)%numberOfPlayers, cb)
      cb(null, data.command);
    })
  } catch (err) {
    throw err;
  }
}
async function getHighestRead() {
  try{
    let reads = db.get('players').map('read');
    let highestRead = 0;
    for(let read of reads) {
      if(read > highestRead) highestRead = read;
    }
    return highestRead;
  } catch (err) {
    throw err;
  }
}