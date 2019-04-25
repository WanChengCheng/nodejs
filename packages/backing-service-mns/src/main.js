/*
 * File: main.js
 * File Created: Monday, 4th March 2019 8:37:01 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import connectMNS from './connect';

export const ResourceKey = 'resource/mns/rest-instance';

export const DefaultMeta = {};

export const DefaultConfig = {
  accessKeyId: process.env.SERVICE_MNS_ACCESS_KEY_ID,
  accessKeySecret: process.env.SERVICE_MNS_ACCESS_KEY_SECRET,
  endpoint: process.env.SERVICE_MNS_ENDPOINT,
};

const connector = (meta = DefaultMeta) => (...config) => ({
  key: meta.key || ResourceKey,
  connect: () => connectMNS(meta)(...config),
});

export default connector;
