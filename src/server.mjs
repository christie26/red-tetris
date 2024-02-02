import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Serve the index.html file, /
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

// // Serve the entire 'static_tetris' directory, /test

app.use('/test', express.static(path.join(__dirname, 'static_tetris')));
app.get('/test', function (req, res) {
  res.sendFile('static_tetris/index.html', { root: __dirname });
});

app.use('/game/:room/:playername', express.static(path.join(__dirname, 'static_tetris')));

app.get('/game/:room/:playername', (req, res) => {
  console.log(req.params);
  console.log(req.params.room);
  res.sendFile('static_tetris/index.html', { root: __dirname });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
