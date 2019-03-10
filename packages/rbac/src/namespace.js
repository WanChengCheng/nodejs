/*
 * File: namespace.js
 * File Created: Sunday, 10th March 2019 8:47:37 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

// namespace for roles are ignored, only concern permission ns.
const NSRegistry = (() => {
  const closure = {
    nstable: {},
    clear: () => {
      closure.nstable = {};
      return closure;
    },
    register: (naming, ns) => {
      closure.nstable[naming] = ns;
      return closure;
    },
    lookup: naming => closure.nstable[naming],
  };
  return closure;
})();

export default NSRegistry;
