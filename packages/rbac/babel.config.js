/*
 * File: babel.config.js
 * File Created: Thursday, 28th February 2019 6:00:57 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const presets = [
  [
    '@babel/preset-env',
    {
      // https://babeljs.io/docs/en/babel-preset-env
      targets: {
        // would be the same as process.versions.node
        node: 'current',
      },
    },
  ],
];

const plugins = ['@babel/plugin-proposal-class-properties'];

module.exports = { presets, plugins };
