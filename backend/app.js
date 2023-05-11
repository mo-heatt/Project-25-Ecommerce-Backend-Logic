const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookieParser');
const fileUploaad = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');

const app = express();

