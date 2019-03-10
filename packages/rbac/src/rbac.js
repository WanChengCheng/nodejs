/*
 * File: rbac.js
 * File Created: Saturday, 26th October 1985 4:15:00 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */
import { RBAC } from 'rbac';
import Namespace from './namespace';

// shared instance,
let hRBAC = null;

const serial = funcs => funcs.reduce(
  (promise, func) => promise.then(result => func().then(Array.prototype.concat.bind(result))),
  Promise.resolve([]),
);

// const canAny = (roleName, permissions) => new Promise((resolve) => {
//   hRBAC.canAny(roleName, permissions, (err, yes) => {
//     if (err) {
//       resolve(false);
//     } else {
//       resolve(yes);
//     }
//   });
// });

const udpateRBACModel = model => new Promise((resolve, reject) => {
  hRBAC = new RBAC(model);
  hRBAC
    .init()
    .then(() => resolve(hRBAC))
    .catch(reject);
});

/**
 * condition
 * @param {Array} clauses
 * @param {String} mode
 * @returns {Object} condition object { judge: {} }
 */
const condition = (clauses, mode = 'any') => {
  if (clauses.judge) {
    return clauses;
  }
  if (Array.isArray(clauses) && mode === 'any') {
    return {
      judge: async (req) => {
        const results = await serial(
          clauses.map(clause => async () => {
            const res = await clause.judge(req);
            return res;
          }),
        );
        return results.reduce((r, v) => r || v, false);
      },
    };
  }
  throw Error(`Unrecognized clauses, mode:${mode}`);
};

const permissionclause = ({
  name, ns, check, select,
}) => ({
  judge: async (req) => {
    const {
      user: {
        roles: rolestr, uid, un, oid = '',
      },
    } = req;
    const roles = rolestr.split(',').map(item => item.trim());
    const can = await serial(roles.map(r => () => hRBAC.canAny(r, [name.split('_')])));
    if (can.reduce((res, val) => res || val, false)) {
      if (check) {
        return check(req);
      }
      const grantscope = Namespace.lookup(name);
      if (grantscope === 'global') {
        return true;
      }
      if (ns === 'global') {
        return grantscope === ns;
      }
      return [String(uid), un, String(oid)].includes(String(select ? select(req) : ns));
    }
    return false;
  },
});
//
const roleclause = ({
  name, ns, select, check,
}) => ({
  judge: (req) => {
    const {
      user: {
        roles: rolestr, uid, un, oid,
      },
    } = req;
    const roles = rolestr.split(',').map(item => item.trim());
    if (roles.some(item => item === name)) {
      if (check) {
        return check(req);
      }
      if (ns === '*') {
        return true;
      }
      const namespace = select ? select(req) : ns;
      return [String(uid), un, String(oid)].includes(String(namespace));
    }
    return false;
  },
});

export const initialize = ({ roles = [], permissions = [] }) => {
  // expected role schema: { name: String , permissions: [permission,], inherit: { name: String }}
  //    inherit is optional, exist if role hierachically textends another role
  // expected permission schema: { name: String, namespace: String }
  //    name `${action}_${resource}`
  // need to build & synchronize model to rbac instace before usage
  const roleModel = roles.map(item => item.name).filter(item => Boolean(item));
  const permissionModel = permissions
    .map(item => item.name)
    .filter(item => Boolean(item))
    .reduce((res, val) => {
      const [action, resource] = val.split('_');
      if (!action || !resource) {
        return res;
      }
      if (res[resource]) {
        res[resource].push(action);
      } else {
        res[resource] = [action];
      }
      return res;
    }, {});
  Namespace.clear();
  const paModel = roles.reduce((res, val) => {
    const { name, permissions: rolePermissions, inherit } = val;
    if (!res[name]) {
      res[name] = [];
    }
    rolePermissions.forEach(({ name: permissionName, namespace }) => {
      Namespace.register(permissionName, namespace);
      res[name].push(permissionName);
    });
    if (inherit && inherit.name) {
      res[name] = [inherit.name, ...res[name]];
    }
    return res;
  }, {});
  const model = {
    roles: roleModel,
    permissions: permissionModel,
    grants: paModel,
  };
  return {
    ...model,
    synchronize: () => udpateRBACModel(model),
  };
};

/**
 * permissionTo
 * @param {String} action
 * @param {String} resource
 * @returns {{globally: (function(): {judge}), check: (function(*=): {judge}), under: under}}
 */
export const permissionTo = (action, resource) => {
  // claim permission:
  //    permissionTo('create', 'publication').globally();
  // scoped to current identified individual, recognized with: uid, username(un), oid
  //    permissionTo('suspend', 'publication').under('johnnyr');
  //    permissionTo('grant', 'user').under((req) => {req.params.uid});
  // customized check
  //    permissionTo('grant', 'user').check((req) => { return Promise.resolve(true); });
  if (!action || !resource) {
    throw Error('params is null');
  }
  const hrbacName = `${action}_${resource}`;
  return {
    globally: () => condition(
      permissionclause({
        name: hrbacName,
        action,
        resource,
        ns: 'global',
      }),
    ),
    check: fn => condition(
      permissionclause({
        name: hrbacName,
        action,
        resource,
        check: fn,
      }),
    ),
    under: (fn) => {
      if (typeof fn === 'function') {
        return condition(
          permissionclause({
            name: hrbacName,
            action,
            resource,
            select: fn,
          }),
        );
      }
      if (typeof fn === 'string') {
        return condition(
          permissionclause({
            name: hrbacName,
            action,
            resource,
            ns: fn,
          }),
        );
      }
      throw Error(`Unknown namespace, ${fn}`);
    },
  };
};

export const role = (rolename) => {
  // claim role:
  //    role('user').ignoreScope();
  //    role('author').under('heaton');
  //    role('author').under((req) => {  return req.params.uid });
  //    role('author').check((req) => { return Promise.resolve(true); });
  // 「roles are defined globally, but granted locally」
  const hrbacName = rolename;
  return {
    under: fn => condition(
      roleclause({
        name: hrbacName,
        ...(typeof fn === 'function'
          ? {
            select: fn,
          }
          : {
            ns: fn,
          }),
      }),
    ),
    ignoreScope: () => condition(
      roleclause({
        name: hrbacName,
        ns: '*',
      }),
    ),
    check: fn => condition(
      roleclause({
        name: hrbacName,
        check: fn,
      }),
    ),
  };
};

/**
 * anyOf
 * @param {Array} clauses
 * @returns {Object} condition object { judge: {} }
 */
export const anyOf = clauses => condition(clauses);

export const anyRoleOf = anyOf;

export const anyPermissionOf = anyOf;

// Express Middleware
// need(role('').ignoreScope());
// need(
//  anyRoleOf([role('admin').ignoreScope(), role('distributor').under(r => r.params.uid)])
// );
// need(permissionTo('create', 'publication').globally());
// need(
//  anyPermissionOf([permissionTo('create', 'publication').locally(),
//    permissionTo('create', 'section').globally()])
// )
// need(allPermissionsOf([...])), TODO
// need(allRolesOf([...])), TODO
export const need = cond => async (req, res, next) => {
  const authorized = await cond.judge(req);
  if (authorized) {
    return next();
  }
  return res.status(401).send('unauthorized');
};

export const hRBACInstance = () => hRBAC;

export default initialize;
