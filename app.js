const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const WEBHOOK_PORT = 3000; // Port for HTTPS


app.use(bodyParser.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));


let server = require("http").Server(app);
server.listen(WEBHOOK_PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${WEBHOOK_PORT}`);
});