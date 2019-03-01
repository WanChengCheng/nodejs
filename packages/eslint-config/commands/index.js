#!/usr/bin/env node
/*
 * File: index.js
 * File Created: Friday, 1st March 2019 2:33:10 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const yargs = require("yargs");
const fs = require("fs-extra");
const path = require("path");

const args = yargs
  .command("init", "init project directoy add configure files", {
    react: {
      alias: "r"
    }
  })
  .help().argv;

const executableDir = p => path.join(__dirname, p);

const [command] = args._;

if (command === "init") {
  if (args.react) {
    fs.copySync(
      executableDir("../configs/.eslintrc.react.js"),
      "./.eslintrc.js"
    );
  } else {
    fs.copySync(executableDir("../configs/.eslintrc.js"), "./.eslintrc.js");
  }

  fs.copySync(executableDir("../configs/.eslintignore"), "./.eslintignore");
}
