/*
 * File: main.js
 * File Created: Monday, 4th March 2019 8:37:01 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import connectOSS from './connect';

export const ResourceKey = 'resource/oss/default';

export const DefaultMeta = {};

export const DefaultConfig = {
  bucket: process.env.SERVICE_OSS_BUCKET,
  accessKeyId: process.env.SERVICE_OSS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SERVICE_OSS_ACCESS_KEY_SECRET,
  endpoint: process.env.SERVICE_OSS_ENDPOINT,
};

const connector = (meta = DefaultMeta) => (...config) => ({
  key: meta.key || ResourceKey,
  connect: () => connectOSS(meta)(...config),
});

export default connector;
