const express = require('express');
const morgan = require('morgan');
const Server = require('./server.js');

Server.run(new Server(express, morgan, console), 4001);
