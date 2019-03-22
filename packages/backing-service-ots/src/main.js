/*
 * File: main.js
 * File Created: Monday, 4th March 2019 8:37:31 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import connectOTS from './connect';

export const ResourceKey = 'resource/ots/client';

export const DefaultMeta = {};

export const DefaultConfig = {
  accessKeyId: process.env.SERVICE_OTS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SERVICE_OTS_ACCESS_KEY_SECRET,
  stsToken: process.env.SERVICE_OTS_STS_TOKEN,
  endpoint: process.env.SERVICE_OTS_ENDPOINT,
  instance: process.env.SERVICE_OTS_INSTANCE,
};

const connector = (meta = DefaultMeta) => (...config) => ({
  key: meta.key || ResourceKey,
  connect: () => connectOTS(meta)(...config),
});

export default connector;
