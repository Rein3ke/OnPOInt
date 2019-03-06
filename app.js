const express = require('express');
const path = require('path');

const app = express();
const data = require('./router/data');

const PORT = process.env.PORT || 5000;

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/data', data);

// Error handling
app.use((_req, _res) => _res.status(404).send('Not found!').end());

app.listen(PORT, () => console.log(`Server is listening on Port: ${PORT}`));
