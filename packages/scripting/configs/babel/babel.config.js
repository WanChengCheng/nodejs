/*
 * File: babel.config.js
 * File Created: Wednesday, 30th January 2019 6:50:49 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

const presets = [
  [
    '@babel/env',
    {
      targets: {
        // would be the same as process.versions.node
        node: 'current',
      },
    },
  ],
];

const plugins = ['@babel/plugin-proposal-class-properties'];

module.exports = { presets, plugins };
