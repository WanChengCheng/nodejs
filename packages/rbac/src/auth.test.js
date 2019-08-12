/*
 * File: auth.test.js
 * File Created: Tuesday, 16th April 2019 7:28:28 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import {
  condition,
  roleClause,
  permissionClause,
  generateRBACModel,
  permissionTo,
  role,
  anyOf
} from "./authorization";

const roles = [
  {
    name: "reviewer",
    description: "reviewer, 文章评审员，对申请发表的文章进行评审",
    permissions: [
      {
        name: "audit_draft",
        namespace: "global",
        description: "审核平台上待发布的文章",
        reference: { $oid: "6578bad363022195c55a87dd" }
      }
    ]
  },
  {
    name: "navigator",
    description: "navigator, 净化网络环境，从我做起",
    permissions: [
      {
        name: "delete_article",
        namespace: "global",
        description: "可以删除已经发布过的文章",
        reference: { $oid: "3020085814cda46ae3d6000f" }
      }
    ]
  },
  {
    name: "staff",
    description:
      "平台的工作人员，作为所有内部员工的角色基类存在，有共通的权限\b可以加在这下面",
    permissions: []
  },
  {
    name: "accountadmin",
    description:
      "平台工作人员，账号管理员，对平台账号进行管理，另外负责对账号进行授权",
    inherit: {
      name: "staff",
      reference: { $oid: "407b46bd4b27b5eb482568b3" }
    },
    permissions: [
      {
        name: "grant_user",
        namespace: "global",
        description: "可以对用户进行授权",
        reference: { $oid: "15ba4879b1cc44ab6f9adb1e" }
      }
    ]
  }
];
const permissions = [
  {
    _id: { $oid: "6578bad363022195c55a87dd" },
    name: "audit_draft",
    namespace: "global",
    operation: {
      name: "audit",
      reference: { $oid: "f9c46c6aee056b3a5e559fc2" }
    },
    resource: {
      name: "draft",
      reference: { $oid: "b46e8d7bfd65eace4c08922c" }
    },
    description: "审核平台上待发布的文章"
  },
  {
    _id: { $oid: "3020085814cda46ae3d6000f" },
    name: "delete_article",
    namespace: "global",
    operation: {
      name: "delete",
      reference: { $oid: "0b19728c3b2460d3fd774281" }
    },
    resource: {
      name: "article",
      reference: { $oid: "2a6ee7d717c32d706b718425" }
    },
    description: "可以删除已经发布过的文章"
  },
  {
    _id: { $oid: "c193a8fff8674a499f66a643" },
    name: "create_section",
    namespace: "global",
    operation: {
      name: "create",
      reference: { $oid: "d376acf57dfceef811928c3b" }
    },
    resource: {
      name: "section",
      reference: { $oid: "8b91e4ff065693136b84e8f8" }
    },
    description: "可以创建杂志"
  },
  {
    _id: { $oid: "755027e1fdc15485c2143cf9" },
    name: "read_section",
    namespace: "user",
    operation: {
      name: "read",
      reference: { $oid: "016e23a4aad5b69c90fc0017" }
    },
    resource: {
      name: "section",
      reference: { $oid: "8b91e4ff065693136b84e8f8" }
    },
    description: "可以获取自己创建杂志的相关信息"
  },
  {
    _id: { $oid: "15ba4879b1cc44ab6f9adb1e" },
    name: "grant_user",
    namespace: "global",
    operation: {
      name: "grant",
      reference: { $oid: "b8e22ecd3db57cb0e50c5825" }
    },
    resource: { name: "user", reference: { $oid: "b84ae78819358ff65b3146e7" } },
    description: "可以对用户进行授权"
  }
];

it("rbac model usage", async () => {
  const { rbac } = await generateRBACModel({
    roles,
    permissions
  });
  const result = await rbac.canAny("reviewer", [["audit", "draft"]]);
  expect(result).toBe(true);
});

it("test condition, single, multiple, true/false", async () => {
  const first = await condition({
    judge: () => Promise.resolve(true)
  }).judge();
  expect(first === true).toBeTruthy();

  const second = await condition([
    {
      judge: () => Promise.resolve(false)
    },
    {
      judge: () => Promise.resolve(true)
    }
  ]).judge();
  expect(second).toBe(true);

  const third = await condition([
    {
      judge: () => Promise.resolve(false)
    },
    {
      judge: () => Promise.resolve(false)
    }
  ]).judge();
  expect(third).toBe(false);
});

it("role clause cases", async () => {
  const clause = roleClause({
    name: "test-role",
    ns: "*"
  });

  const r1 = await clause.judge({ user: { roles: "test-role" } });
  expect(r1).toBe(true);

  const clause2 = roleClause({
    name: "test-role",
    namespaceSelector: () => "xx"
  });
  const r2 = await clause2.judge({
    user: { roles: "test-role, admin" },
    namespace: "xx"
  });
  expect(r2).toBe(true);

  const r3 = await clause2.judge({ user: { roles: "admin" } });
  expect(r3).toBe(false);
});

it("permission clause", async () => {
  const pc1 = permissionClause({
    name: "delete_article",
    ns: "global"
  });
  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions
  });
  const r1 = await pc1.judge({
    user: { roles: "navigator, staff" },
    rbac,
    registry
  });
  expect(r1).toBe(true);
});

it("role condition builder", async () => {
  const a = permissionTo("delete", "article").globally();

  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions
  });
  const r1 = await a.judge({
    user: { roles: "navigator, staff" },
    rbac,
    registry
  });
  expect(r1).toBe(true);
});

it("permission condition builder", async () => {
  const a = role("staff").ignoreScope();

  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions
  });
  const r1 = await a.judge({
    user: {
      roles: "staff, admin"
    },
    rbac,
    registry
  });
  expect(r1).toBe(true);
});

it("composed condition test", async () => {
  const c = anyOf([
    permissionTo("delete", "article").globally(),
    role("staff").ignoreScope()
  ]);
  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions
  });
  const r1 = await c.judge({
    user: {
      roles: "staff"
    },
    rbac,
    registry
  });
  expect(r1).toBe(true);
});

it("should be able to check dynamically", async () => {
  const c = permissionTo("delete", "article").check(() =>
    Promise.resolve(false)
  );
  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions
  });
  const r1 = await c.judge({
    user: {
      roles: "navigator"
    },
    rbac,
    registry
  });
  expect(r1).toBe(false);
});

it("should be able to select ns dynamically", async () => {
  const c = permissionTo("delete", "article").under(context => context.testns);
  const { rbac, registry } = await generateRBACModel({
    roles,
    permissions
  });
  const r1 = await c.judge({
    user: {
      roles: "navigator"
    },
    testns: "test",
    namespace: "test",
    rbac,
    registry
  });
  expect(r1).toBe(true);
});
