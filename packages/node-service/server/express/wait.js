/*
 * File: wait.js
 * File Created: Friday, 9th November 2018 4:09:05 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

/**
 * * wait for service events
 * @param {*} app, express app
 * @param {*} event, server events, EVENT_*
 */
const wait = (app, event) => new Promise((resolve) => {
  app.on(event, resolve);
});

export default wait;
