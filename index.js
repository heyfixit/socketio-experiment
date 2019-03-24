require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// const actionsRouter = require('./actions/router');
// const projectsRouter = require('./projects/router');

const server = express();
const port = process.env.PORT || 4000;
server.use(cors());
server.use(helmet());
server.use(express.json());

// server.use('/api/projects', projectsRouter);
// server.use('/api/actions', actionsRouter);
server.use('/', (req, res) => {
  res.send(process.env.MOTD || 'API up and running!');
});

server.listen(port, () =>
  console.log(`\n*** API running on  port ${port} ***\n`)
);
