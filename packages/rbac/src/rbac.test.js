/*
 * File: main.test.js
 * File Created: Monday, 4th March 2019 8:35:34 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import test from 'ava';
import authorization, {
  hRBACInstance,
  need,
  role,
  anyOf,
  anyRoleOf,
  permissionTo,
  anyPermissionOf,
} from './rbac';

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

test.before('', async (t) => {
  const rbac = await authorization({
    roles,
    permissions,
  }).synchronize();

  rbac.getRole('reviewer', (err) => {
    if (!err) {
      t.pass();
    } else {
      t.fail(err);
    }
  });
});

test('rbac instance should work as expected', (t) => {
  t.truthy(hRBACInstance());
  hRBACInstance().can('accountadmin', 'grant', 'user', (err) => {
    if (!err) {
      t.pass();
    } else {
      t.fail(err);
    }
  });
});

test.cb('generate role auth', (t) => {
  const fun = need(role('navigator').ignoreScope());
  t.plan(1);
  fun(
    {
      user: {
        uid: 123,
        roles: ',navigator,staff',
      },
    },
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('role auth with scope', (t) => {
  need(role('staff').under('123'))(
    {
      user: {
        roles: 'navigator, staff',
        uid: 123,
      },
    },
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('role with specified scope', (t) => {
  const req = {
    user: {
      roles: 'navigator, staff',
      uid: 123,
    },
    params: { uid: 123 },
  };
  need(role('staff').under(r => r.params.uid))(
    req,
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('role with custmized scope', (t) => {
  const req = {
    user: {
      roles: 'navigator, staff',
      uid: 123,
    },
    params: { uid: 123 },
  };
  need(role('staff').check(r => r.params.uid > 100))(
    req,
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('role with combination check', (t) => {
  const req = {
    user: {
      roles: 'navigator, staff',
      uid: 123,
    },
    params: { uid: 123 },
  };
  need(anyRoleOf([role('admin').ignoreScope(), role('staff').check(r => r.params.uid > 100)]))(
    req,
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('permission check', (t) => {
  const req = {
    user: {
      roles: 'navigator, staff, accountadmin',
      uid: 123,
    },
    params: { uid: 123 },
  };
  need(permissionTo('grant', 'user').globally())(
    req,
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('permission with scope ', (t) => {
  const req = {
    user: {
      roles: 'navigator, staff, accountadmin',
      uid: 123,
    },
    params: { uid: 123 },
  };
  need(permissionTo('grant', 'user').under('123'))(
    req,
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('permission with scope combined', (t) => {
  const req = {
    user: {
      roles: 'navigator, staff, accountadmin',
      uid: 123,
    },
    params: { uid: 123 },
  };
  need(
    anyPermissionOf([
      permissionTo('delete', 'article').globally(),
      permissionTo('audit', 'draft').globally(),
    ]),
  )(
    req,
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('combine role with permission', (t) => {
  const req = {
    user: {
      roles: 'navigator, staff, accountadmin',
      uid: 123,
    },
    params: { uid: 123 },
  };
  need(anyOf([permissionTo('audit', 'draft').globally(), role('staff').ignoreScope()]))(
    req,
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});

test.cb('combine role with permission 2', (t) => {
  const req = {
    user: {
      roles: 'user, staff',
      uid: 123,
    },
    params: { uid: 123 },
  };
  need(
    anyOf([
      permissionTo('create', 'publication').globally(),
      role('staff').ignoreScope(),
      role('curator').ignoreScope(),
      role('distributor').ignoreScope(),
    ]),
  )(
    req,
    {
      status: () => {
        t.fail();
      },
    },
    () => {
      t.pass();
      t.end();
    },
  );
});
