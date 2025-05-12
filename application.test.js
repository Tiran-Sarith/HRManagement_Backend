const request = require('supertest');
const app = require('./server'); // adjust path if different

describe('POST /api/auth/login', () => {
  it('should return 200 and a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test5@gmail.com',
        password: '123456'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token'); // assuming your login returns a token
  });

  it('should return 400 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test5@gmail.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(400); // match your backend's behavior
    expect(res.body).toHaveProperty('message'); // match backend's actual response
  });
});
