const AWS = require('aws-sdk')
const uuidv1 = require('uuid/v1')
const Jimp = require('jimp')
const https = require('https')
const http = require('http')
const HTTP_PROVIDER = process.env.NODE_ENV = 'development' ? http : https
const Bucket = process.env.AWS_S3_BUCKET
const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY
const endpoint = new AWS.Endpoint(process.env.AWS_S3_ENDPOINT)
const partSize = 20 * 1024 * 1024
const queueSize = 10

process.on('message', async ({ uri, mime, channelId, messageId, attachmentId }) => {
  try {
    const image = await Jimp.read(uri)
    const buffer = await image.resize(256, 256).quality(60).getBufferAsync(image.getMIME())
    const name = uri.split('/')[uri.split('/').length - 1]
    const Key = channelId + '/preview/' + uuidv1() + '-preview.' + name
    const Body = buffer

    // Authenticate with S3
    const s3 = new AWS.S3({
      s3BucketEndpoint: true,
      endpoint,
      accessKeyId,
      secretAccessKey,
    })

    // Create the S3 config values (10 MB)
    const options = {
      partSize,
      queueSize,
      ContentType: mime,
      ACL: 'public-read',
    }

    // Set up our S3 params object to use in our request
    const params= {
      Bucket,
      Key,
      Body,
      ACL: 'public-read',
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }

    // Do the actual upload
    const s3data = await new Promise((resolve, reject) => {
      s3.upload(params, options, (err, data) => {
        if (err) reject(err);
        if (!data.Location) reject('No location data');

        resolve(data);
      })
    })

    const postdata = JSON.stringify({
      channelId,
      messageId,
      attachmentId,
      preview: s3data.Location
    })

    const postoptions = {
      hostname: process.env.HOST,
      port: process.env.PORT,
      path: '/v1/upload/message_attachment_preview',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postdata.length
      }
    }

    await new Promise((resolve, reject) => {
      var request = HTTP_PROVIDER.request(postoptions, (res) => {
          const body = [];

          res.setEncoding('utf8');
          res.on('data', (chunk) => body.push(chunk));
          res.on('end', () => resolve(body.join('')));
      });

      request.on('error', (err) => reject(err))
      request.write(postdata);
      request.end();
    })

    process.exit()
  } catch (e) {
    console.log(e)
    process.exit()
  }
});


