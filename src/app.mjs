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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
