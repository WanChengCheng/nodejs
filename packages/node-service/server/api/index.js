/*
 * File: index.js
 * File Created: Tuesday, 6th November 2018 8:56:59 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */
import { Router } from 'express';
import status from './status';

const api = Router();

api.get('/status', (_, res) => {
  res.json(status());
});

export default api;
