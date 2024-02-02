import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Serve the entire 'static_tetris' directory
app.use('/test', express.static(path.join(__dirname, 'static_tetris')));

app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});

app.get('/test', function (req, res) {
  res.sendFile('static_tetris/index.html', { root: __dirname });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
