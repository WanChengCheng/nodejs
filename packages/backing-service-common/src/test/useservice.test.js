/*
 * File: useservice.test.js
 * File Created: Tuesday, 13th August 2019 2:51:04 pm
 * Author: ChengCheng Wan <chengcheng.st@gmail.com>
 */

import services from "../resourceRegister";
import useService from "../useService";

test("use service test", async () => {
  const connector = {
    key: "test",
    connect: () => Promise.resolve({ mock: true })
  };
  const service = await useService(connector);
  expect(service.mock).toBe(true);
  expect(services.resource("test").mock).toBe(true);
});
