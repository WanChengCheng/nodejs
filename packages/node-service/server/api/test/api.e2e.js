import test from 'ava';
import request from 'supertest';
import app from '../../../server';

test('/api/status should be ok in all cases', async (t) => {
  const res = await request(app)
    .get('/api/status')
    .expect('Content-Type', /json/)
    .expect(200);
  const { body } = res;
  t.is(body.status, 0);
});
