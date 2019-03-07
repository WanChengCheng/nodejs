/*
 * File: mongoose.js
 * File Created: Thursday, 7th March 2019 4:58:30 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
export function virtualId() {
  return this._id.toHexString();
}

export function removeDangleId(_, ret) {
  delete ret._id;
  return ret;
}
