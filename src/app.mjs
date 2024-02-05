import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Serve the entire 'client' directory, /
app.use('/', express.static(path.join(__dirname, 'client')));

app.use('/game/:room/:playername', express.static(path.join(__dirname, 'client')));

app.get('/game/:room/:playername', (req, res) => {
  console.log(req.params);
  console.log(req.params.room);
  res.sendFile('client/index.html', { root: __dirname });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
