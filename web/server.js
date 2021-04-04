const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/web'));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/web'));
});

app.listen(32602)
