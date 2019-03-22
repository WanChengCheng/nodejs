/*
 * File: connect.js
 * File Created: Friday, 22nd March 2019 3:30:07 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import TableStore from 'tablestore';

const connectOTS = () => ({
  accessKeyId,
  secretAccessKey,
  endpoint,
  instance,
  instancename,
  maxRetries = 20,
  stsToken,
}) => new Promise((resolve, reject) => {
  if (!accessKeyId || !secretAccessKey || !endpoint || (!instance && !instancename)) {
    reject(Error('Missing critical arguments'));
  }
  const client = new TableStore.Client({
    accessKeyId,
    secretAccessKey,
    endpoint,
    instancename: instancename || instance,
    maxRetries,
    stsToken,
  });
  resolve(client);
});

export default connectOTS;
