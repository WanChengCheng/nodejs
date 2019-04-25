/*
 * File: auth.test.js
 * File Created: Tuesday, 16th April 2019 7:28:28 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import test from 'ava';
import {
  condition,
  roleClause,
  permissionClause,
  generateRBACModel,
  permissionTo,
  role,
  anyOf,
} from './authorization';

const roles = [
  {
    name: 'reviewer',
    description: 'reviewer, 文章评审员，对申请发表的文章进行评审',
    permissions: [
      {
        name: 'audit_draft',
        namespace: 'global',
        description: '审核平台上待发布的文章',
        reference: { $oid: '6578bad363022195c55a87dd' },
      },
    ],
  },
  {
    name: 'navigator',
    description: 'navigator, 净化网络环境，从我做起',
    permissions: [
      {
        name: 'delete_article',
        namespace: 'global',
        description: '可以删除已经发布过的文章',
        reference: { $oid: '3020085814cda46ae3d6000f' },
      },
    ],
  },
  {
    name: 'staff',
    description: '平台的工作人员，作为所有内部员工的角色基类存在，有共通的权限\b可以加在这下面',
    permissions: [],
  },
  {
    name: 'accountadmin',
    description: '平台工作人员，账号管理员，对平台账号进行管理，另外负责对账号进行授权',
    inherit: {
      name: 'staff',
      reference: { $oid: '407b46bd4b27b5eb482568b3' },
    },
    permissions: [
      {
        name: 'grant_user',
        namespace: 'global',
        description: '可以对用户进行授权',
        reference: { $oid: '15ba4879b1cc44ab6f9adb1e' },
      },
    ],
  },
];
const permissions = [
  {
    _id: { $oid: '6578bad363022195c55a87dd' },
    name: 'audit_draft',
    namespace: 'global',
    operation: {
      name: 'audit',
      reference: { $oid: 'f9c46c6aee056b3a5e559fc2' },
    },
    resource: {
      name: 'draft',
      reference: { $oid: 'b46e8d7bfd65eace4c08922c' },
    },
    description: '审核平台上待发布的文章',
  },
  {
    _id: { $oid: '3020085814cda46ae3d6000f' },
    name: 'delete_article',
    namespace: 'global',
    operation: {
      name: 'delete',
      reference: { $oid: '0b19728c3b2460d3fd774281' },
    },
    resource: {
      name: 'article',
      reference: { $oid: '2a6ee7d717c32d706b718425' },
    },
    description: '可以删除已经发布过的文章',
  },
  {
    _id: { $oid: 'c193a8fff8674a499f66a643' },
    name: 'create_section',
    namespace: 'global',
    operation: {
      name: 'create',
      reference: { $oid: 'd376acf57dfceef811928c3b' },
    },
    resource: {
      name: 'section',
      reference: { $oid: '8b91e4ff065693136b84e8f8' },
    },
    description: '可以创建杂志',
  },
  {
    _id: { $oid: '755027e1fdc15485c2143cf9' },
    name: 'read_section',
    namespace: 'user',
    operation: {
      name: 'read',
      reference: { $oid: '016e23a4aad5b69c90fc0017' },
    },
    resource: {
      name: 'section',
      reference: { $oid: '8b91e4ff065693136b84e8f8' },
    },
    description: '可以获取自己创建杂志的相关信息',
  },
  {
    _id: { $oid: '15ba4879b1cc44ab6f9adb1e' },
    name: 'grant_user',
    namespace: 'global',
    operation: {
      name: 'grant',
      reference: { $oid: 'b8e22ecd3db57cb0e50c5825' },
    },
    resource: { name: 'user', reference: { $oid: 'b84ae78819358ff65b3146e7' } },
    description: '可以对用户进行授权',
  },
];

test('rbac model usage', async (t) => {
  const { rbac } = await generateRBACModel({
    roles,
    permissions,
  });
  t.is(await rbac.canAny('reviewer', [['audit', 'draft']]), true);
});

test('test condition, single, multiple, true/false', async (t) => {
  const first = await condition({
    judge: () => Promise.resolve(true),
  }).judge();
  t.is(first, true);

  const second = await condition([
    {
      judge: () => Promise.resolve(false),
    },
    {
      judge: () => Promise.resolve(true),
    },
  ]).judge();
  t.is(second, true);

  const third = await condition([
    {
      judge: () => Promise.resolve(false),
    },
    {
      judge: () => Promise.resolve(false),
    },
  ]).judge();
  t.is(third, false);
});

test('role clause cases', async (t) => {
  const clause = roleClause({
    name: 'test-role',
    ns: '*',
  });

  t.is(await clause.judge({ user: { roles: 'test-role, admin' } }), true);

  const clause2 = roleClause({
    name: 'test-role',
    namespaceSelector: () => 'xx',
  });
  t.is(await clause2.judge({ user: { roles: 'test-role, admin' }, namespace: 'xx' }), true);

  t.is(await clause2.judge({ user: { roles: 'admin' } }), false);
});

test('permission clause', async (t) => {
  const pc1 = permissionClause({
    name: 'delete_article',
    ns: 'global',
  });
  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions,
  });
  t.is(await pc1.judge({ user: { roles: 'navigator, staff' }, rbac, registry }), true);
});

test('role condition builder', async (t) => {
  const a = permissionTo('delete', 'article').globally();

  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions,
  });
  t.is(await a.judge({ user: { roles: 'navigator, staff' }, rbac, registry }), true);
});

test('permission condition builder', async (t) => {
  const a = role('staff').ignoreScope();

  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions,
  });
  t.is(
    await a.judge({
      user: {
        roles: 'staff, admin',
      },
      rbac,
      registry,
    }),
    true,
  );
});

test('composed condition test', async (t) => {
  const c = anyOf([permissionTo('delete', 'article').globally(), role('staff').ignoreScope()]);
  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions,
  });
  t.is(
    await c.judge({
      user: {
        roles: 'staff',
      },
      rbac,
      registry,
    }),
    true,
  );
});
