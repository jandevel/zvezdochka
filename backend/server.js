const http = require('http');
const fs = require('fs');

const express = require('express');

const app = express();

app.use('/add-file', (req, res, next) => {

});

app.use('/', (req, res, next) => {
})

app.listen(3000);