const express = require('express');

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { env } = require('process');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
  refetchImage();
  const url = process.env.TODO_BACKEND_URL || 'http://localhost:3001/todos';
  console.log('Fetching todos from:', url);
  const response= await axios.get(url);
  console.log('Response:', response.data);
  const todos = response.data;
  console.log('Todos:', todos);

  res.render('index', { todos });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const outputPath = path.join(__dirname, 'data/image.jpg');

const fetchImage = async () => {
const imageUrl = process.env.IMAGE_API_URL || 'https://picsum.photos/200';

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  const response = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'stream'
  })

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  writer.on('finish', () => {
    console.log('Image downloaded and saved successfully!');
  });

  writer.on('error', err => {
    console.error('Error writing the file:', err);
  });
}

const LIMIT = Number(process.env.IMAGE_REFETCH_INTERVAL) || 5;

const tooOld = () => {
  const stats = fs.statSync(outputPath);
  const someTimeMinutesAgo = new Date(Date.now() - LIMIT * 60 * 1000);

  console.log(`File creation time: ${stats.birthtime}`);
  console.log(`${LIMIT} min ago:          ${someTimeMinutesAgo}`);
  
  return stats.birthtime < someTimeMinutesAgo;
}

const refetchImage = async () => {
  try {
    if (tooOld()) {
      console.log(`The file is older than ${LIMIT} minutes.`);
      fetchImage();
    }

  } catch (err) {
    console.error('Error:', err);
    fetchImage();
  }
}

app.get('/image', (req, res) => {
  const imagePath = path.join(__dirname, 'data/image.jpg');
  res.sendFile(imagePath);
});

app.listen(port, () => {
  refetchImage();
  console.log(`Server is running on port ${port}`);
});