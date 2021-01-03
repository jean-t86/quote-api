const express = require('express');
const morgan = require('morgan');
const {quotes} = require('./data.js');
const Server = require('./server.js');

Server.run(new Server(express, morgan, console, [...quotes]), 4001);
