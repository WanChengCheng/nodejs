/*
 * File: responseHandler.js
 * File Created: Wednesday, 13th March 2019 5:38:11 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

export const axiosResponseHandler = ({ data, data: { status, ...rest } } = {}) => {
  if (typeof status !== 'undefined' && status) {
    throw Object.assign(new Error(rest.message), data);
  }
  return data;
};

export default axiosResponseHandler;
