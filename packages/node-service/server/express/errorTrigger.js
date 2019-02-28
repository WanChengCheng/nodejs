/*
 * File: errorTrigger.js
 * File Created: Friday, 9th November 2018 11:43:23 am
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

// * trigger an defined error
const errorTrigger = (error, details = {}) => {
  const { code, message } = error;
  throw Object.assign(new Error(message), {
    code,
    details,
  });
};

export default errorTrigger;
