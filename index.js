const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const cors = require('cors');
const helmet = require('helmet');
const port = process.env.PORT || 4000;

// const actionsRouter = require('./actions/router');
// const projectsRouter = require('./projects/router');
// server.use('/api/projects', projectsRouter);
// server.use('/api/actions', actionsRouter);

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/build')));
io.on('connection', socket => {
  console.log('new socketio connection');
  socket.on('disconnect', () => console.log('client disconnected'));
  // socket.on('drawing', data => {});
  socket.on('draw-line', data => {
    socket.broadcast.emit('draw-line', data);
  });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
});

server.listen(port, () => {
  console.log(`\n*** API running on  port ${port} ***\n`);
  // setInterval(() => {
  //   io.sockets.emit('test', 'test');
  // }, 1000);
});
