const path = require('path');
const { Storage } = require('@google-cloud/storage');

async function upload(file) {
    const filePath = path.join(__dirname, file)
    const serviceKey = path.join(__dirname, './config/private-key.json')
    const bucketName = process.env.BUCKET_NAME
    const storageConf = { keyFilename: serviceKey }
    const storage = new Storage(storageConf)

    const options = {
      destination: file,
    }

    try {
      await storage.bucket(bucketName).upload(filePath, options);
      console.log(`${file} uploaded to ${bucketName}`);

    } catch(err){
      console.log(err)
    }

}

const fileName = process.argv[2];
if (!fileName) {
  console.error('Please provide a file name as a command-line argument.');
  process.exit(1);
}

upload(fileName);
