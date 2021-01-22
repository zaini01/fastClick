const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port =  process.env.port || 3000;

// iniital message
const messages = [{
    name: 'GAME MASTER',
    message: 'WELCOME TO GOTTA FAST : THE ULTIMATE SPEED CLICKER'
}]

// list of players
let players = []
let playerready = 0
// example data object player
// payload = {
//   username: 'nanda',
//   status: 'idle', => idle or ready
//   score: 0
// }

io.on('connection', socket => {
  console.log('Socket.io client connected!');

  // Socket greating message for all players

  socket.emit('init', { messages, players })

  // Socket listen for new player
  socket.on('newPlayers', function(payload){
    // push new player to list of players
    if (players.length < 4) {
      players.push(payload)
      // Socket send data new player to only client seeder for greating
      socket.emit('serverGreeting', payload);

      // Socket send to all player about new  player
      io.emit('updatePlayers', players);
    }else{
      socket.emit('fullRoom', 'Room full!');
    }
  })

  socket.on('getAllPlayers', function() {
    io.emit('updatePlayers', players)
  })

  // Socket for listen updated score
  socket.on('updateScorePlayer', function(payload) {
    // find user updated score
    const findPlayer = players.filter(el => el.username === payload.username);
    
    // update score player
    findPlayer[0].score += payload.score;

    // Socket send updated score
    io.emit('updatePlayers', players)
  })

  // Socket for listen update status
  socket.on('updateStatus', function(payload) {
    // find user updated score
    const findPlayer = players.filter(el => el.username === payload.username);

    // update score player
    findPlayer[0].status = payload.status;

    // Socket send updated score
    io.emit('updatePlayers', players)
  })

  socket.on('updatePlayerReady', function() {
    if (playerready === 4) {
      playerready = 1
    } else {
      playerready++
    }
    
    io.emit('countPlayerReady', playerready)
  })

  // Socket reset player attributes
  socket.on('resetGame', function(payload) {
    // make new array updated data
    const findPlayer = players.filter(el => el.username === payload.username);
    findPlayer[0].status = 'idle';
    findPlayer[0].score = 0;

    // send reset data player
    io.emit('updatePlayers', players);
  })

  socket.on('logout', function(payload) {
    const newPlayers =  players.filter(el => el.username !== payload.username)
    players = newPlayers

    // updated players
    io.emit('updatePlayers', players);
  })
})

server.listen(port,()=>{
    console.log(`listen to http://localhost:${port}`);
});