/*
 * File: oss.js
 * File Created: Tuesday, 6th November 2018 5:15:19 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import streaming from 'aliyun-oss-upload-stream';
import mime from 'mime-types';
import ALY from 'aliyun-sdk';
import moment from 'moment';
import logger from '../utils/logger';

const log = logger.child({ context: '[OSS]' });
const bucket = process.env.SERVICE_OSS_BUCKET;

const oss = new ALY.OSS({
  accessKeyId: process.env.SERVICE_OSS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SERVICE_OSS_ACCESS_KEY_SECRET,
  endpoint: process.env.SERVICE_OSS_ENDPOINT,
  apiVersion: '2013-10-15',
});

const streamingOSS = streaming(oss);

export const streamingUpload = ({ key, stream }) => new Promise((resolve, reject) => {
  const uploadStream = streamingOSS.upload({
    Bucket: bucket,
    Key: key,
  });
  uploadStream.on('error', (err) => {
    log.error(err, `streaming upload ${key} error.`);
    reject(err);
  });
  uploadStream.on('uploaded', (details) => {
    log.info(`streaming upload ${key} complete.`);
    resolve(details);
  });
  stream.pipe(uploadStream);
});

export const bundleUpload = ({
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
}) => new Promise((resolve, reject) => {
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
        log.error(err, `bundle upload ${key} error.`);
        reject(err);
      } else {
        log.info(`bundle upload ${key} complete.`);
        resolve(details);
      }
    },
  );
});

export default bundleUpload;
