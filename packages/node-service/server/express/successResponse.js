/*
 * File: successResponse.js
 * File Created: Friday, 9th November 2018 3:18:49 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

const successResponse = (res, details = {}) => {
  res.json({
    status: 0,
    ...details,
  });
};

export default successResponse;
