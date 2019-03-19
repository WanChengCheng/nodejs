/*
 * File: main.js
 * File Created: Monday, 4th March 2019 8:37:01 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import Axios from 'axios';
import qs from 'qs';

const urlencoded = 'application/x-www-form-urlencoded';

// set default header content-type
//  for PUT, POST, PATCH verb requests
Axios.defaults.headers.put['Content-Type'] = urlencoded;
Axios.defaults.headers.post['Content-Type'] = urlencoded;
Axios.defaults.headers.patch['Content-Type'] = urlencoded;

const requestDataSerializer = (data) => {
  if (typeof data === 'object') {
    return qs.stringify(data);
  }
  return data;
};

// handle axios request error and triggered the provided error
export const errorDecorationHandler = errorModel => errorDecorator => ({
  response: { data, status } = {},
  request: { path, _header: header },
  message,
}) => errorDecorator(errorModel, {
  axiosErrorMessage: message,
  responseData: data,
  responseStatus: status,
  requestPath: path,
  requestHeader: header,
});

export const statusWiseHandler = ({ data, data: { status, ...rest } } = {}) => {
  if (typeof status !== 'undefined' && status) {
    throw Object.assign(new Error(rest.message), data);
  }
  return data;
};

// call qs.stringify on object field before sending to server to
//  work with the urlencoded content-type.
export const dataTransformedAxios = Axios.create({
  transformRequest: [requestDataSerializer],
});

export const jwtAuthenticatedAxios = (token) => {
  Axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  const ax = Axios.create({
    transformRequest: [requestDataSerializer],
  });
  return ax;
};

export default dataTransformedAxios;
