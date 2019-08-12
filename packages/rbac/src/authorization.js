/*
 * File: authorization.js
 * File Created: Tuesday, 16th April 2019 7:15:34 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import { serial } from "@chengchengw/lang";
import { RBAC } from "rbac";
import NamespaceRegistry from "./NamespaceRegistry";

const containsAnyTruthyValue = (final, val) => final || val;

// const rbac = new RBAC({
//   roles: ['superadmin', 'admin', 'user', 'guest'],
//   permissions: {
//     user: ['create', 'delete'],
//     password: ['change', 'forgot'],
//     article: ['create'],
//     rbac: ['update'],
//   },
//   grants: {
//     guest: ['create_user', 'forgot_password'],
//     user: ['change_password'],
//     admin: ['user', 'delete_user', 'update_rbac'],
//     superadmin: ['admin'],
//   },
// });
export const generateRBACModel = async ({
  roles = [],
  permissions = [],
  registry
}) => {
  // expected role schema: { name: String , permissions: [permission,], inherit: { name: String }}
  //    inherit is optional, exist if role hierachically textends another role
  // expected permission schema: { name: String, namespace: String }
  //    name `${action}_${resource}`
  // need to build & synchronize model to rbac instace before usage
  const roleModel = roles.map(item => item.name).filter(item => Boolean(item));
  const permissionModel = permissions
    .map(item => item.name)
    .filter(Boolean)
    .reduce((res, val) => {
      const [action, resource] = val.split("_");
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
  const namespaces = registry || new NamespaceRegistry();
  namespaces.clear();
  const grants = roles.reduce((res, val) => {
    const { name, permissions: rolePermissions, inherit } = val;
    if (!res[name]) {
      res[name] = [];
    }
    rolePermissions.forEach(({ name: permissionName, namespace }) => {
      namespaces.register(permissionName, namespace);
      res[name].push(permissionName);
    });
    if (inherit && inherit.name) {
      res[name] = [inherit.name, ...res[name]];
    }
    return res;
  }, {});
  const rbac = await new RBAC({
    roles: roleModel,
    permissions: permissionModel,
    grants
  });
  await rbac.init();
  return {
    rbac,
    registry: namespaces
  };
};

/**
 * condition
 * @param {Array} clauses
 * @param {String} mode
 * @returns {Object} condition object { judge: {} }
 */
export const condition = (clauses, mode = "any") => {
  if (clauses.judge) {
    return clauses;
  }
  // any one fo the clause truthy => true
  if (Array.isArray(clauses) && mode === "any") {
    return {
      // eslint-disable-next-line max-len
      judge: context =>
        Promise.all(clauses.map(clause => clause.judge(context))).then(
          results => results.reduce(containsAnyTruthyValue, false)
        )
    };
  }
  throw Error(`Unrecognized clauses, mode:${mode}`);
};

//
export const roleClause = ({ name, ns, namespaceSelector, check }) => ({
  judge: async context => {
    const {
      user: { roles: rolestr },
      namespace
    } = context;
    const roles = rolestr.split(",").map(item => item.trim());
    if (roles.some(item => item === name)) {
      if (check) {
        return check(context);
      }
      if (ns === "*") {
        return true;
      }
      const rolens = namespaceSelector ? namespaceSelector(context) : ns;
      return rolens === namespace;
    }
    return false;
  }
});

export const permissionClause = ({ name, ns, check, namespaceSelector }) => ({
  judge: async context => {
    const {
      user: { roles: rolestr },
      namespace,
      rbac,
      registry
    } = context;
    const roles = rolestr.split(",").map(item => item.trim());
    const can = await serial(
      roles.map(r => () => rbac.canAny(r, [name.split("_")]))
    );
    if (can.reduce(containsAnyTruthyValue, false)) {
      if (check) {
        return check(context);
      }
      const grantscope = registry.lookup(name);
      if (grantscope === "global") {
        return true;
      }
      return (
        namespace ===
        String(namespaceSelector ? namespaceSelector(context) : ns)
      );
    }
    return false;
  }
});

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
    throw Error("params is null");
  }
  const hrbacName = `${action}_${resource}`;
  return {
    globally: () =>
      condition(
        permissionClause({
          name: hrbacName,
          action,
          resource,
          ns: "global"
        })
      ),
    check: fn =>
      condition(
        permissionClause({
          name: hrbacName,
          action,
          resource,
          check: fn
        })
      ),
    under: fn => {
      if (typeof fn === "function") {
        return condition(
          permissionClause({
            name: hrbacName,
            action,
            resource,
            namespaceSelector: fn
          })
        );
      }
      if (typeof fn === "string") {
        return condition(
          permissionClause({
            name: hrbacName,
            action,
            resource,
            ns: fn
          })
        );
      }
      throw Error(`Unknown namespace, ${fn}`);
    }
  };
};

export const role = rolename => {
  // claim role:
  //    role('user').ignoreScope();
  //    role('author').under('heaton');
  //    role('author').under((req) => { return req.params.uid });
  //    role('author').check((req) => { return Promise.resolve(true); });
  // 「roles are defined globally, but granted locally」
  const hrbacName = rolename;
  return {
    under: fn =>
      condition(
        roleClause({
          name: hrbacName,
          ...(typeof fn === "function"
            ? {
                namespaceSelector: fn
              }
            : {
                ns: fn
              })
        })
      ),
    ignoreScope: () =>
      condition(
        roleClause({
          name: hrbacName,
          ns: "*"
        })
      ),
    check: fn =>
      condition(
        roleClause({
          name: hrbacName,
          check: fn
        })
      )
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
  return res.status(401).send("unauthorized");
};
