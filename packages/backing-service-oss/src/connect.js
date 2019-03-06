/*
 * File: connect.js
 * File Created: Wednesday, 6th March 2019 3:23:16 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import streaming from 'aliyun-oss-upload-stream';
import mime from 'mime-types';
import ALY from 'aliyun-sdk';
import moment from 'moment';

const connectOSS = ({ logger = console }) => ({
  bucket,
  accessKeyId,
  secretAccessKey,
  endpoint,
  apiVersion = '2013-10-15',
} = {}) => new Promise((resolve, reject) => {
  if (!bucket || !accessKeyId || !secretAccessKey || !endpoint) {
    reject(Error('Connect oss missing critical arguments'));
  }
  const oss = new ALY.OSS({
    accessKeyId,
    secretAccessKey,
    endpoint,
    apiVersion,
  });
  const streamingOSS = streaming(oss);
  const streamingUpload = ({ key, stream }) => new Promise((suComplete, suFailed) => {
    const uploadStream = streamingOSS.upload({
      Bucket: bucket,
      Key: key,
    });
    uploadStream.on('error', (err) => {
      logger.error(err, `streaming upload ${key} error.`);
      suFailed(err);
    });
    uploadStream.on('uploaded', (details) => {
      logger.info(`streaming upload ${key} complete.`);
      suComplete(details);
    });
    stream.pipe(uploadStream);
  });
  const bundleUpload = ({
    key,
    data,
    contentType,
    cacheControl = 'no-cache',
    contentDisposition = '',
    expires = moment
      .duration({
        years: 1,
      })
      .asMilliseconds(),
  }) => new Promise((buCompoete, buFailed) => {
    oss.putObject(
      {
        Bucket: bucket,
        Key: key,
        Body: data,
        AccessControlAllowOrigin: '',
        ContentType: mime.lookup(contentType) || contentType,
        CacheControl: cacheControl,
        ContentDisposition: contentDisposition,
        ContentEncoding: 'utf-8',
        ServerSideEncryption: 'AES256',
        Expires: expires,
      },
      (err, details) => {
        if (err) {
          logger.error(err, `bundle upload ${key} error.`);
          buFailed(err);
        } else {
          logger.info(`bundle upload ${key} complete.`);
          buCompoete(details);
        }
      },
    );
  });
  resolve({
    bundleUpload,
    streamingUpload,
  });
});

export default connectOSS;
