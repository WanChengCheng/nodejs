/*
 * File: NamespaceRegistry.js
 * File Created: Sunday, 10th March 2019 8:47:37 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

// namespace for roles are ignored, only concern permission ns.
export default class NamespaceRegistry {
  nstable = {};

  clear = () => {
    this.nstable = {};
    return this;
  };

  register = (naming, ns) => {
    this.nstable[naming] = ns;
    return this;
  };

  lookup = naming => this.nstable[naming];
}
