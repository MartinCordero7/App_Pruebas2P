import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import jwt from 'jwt-simple';
import app from '../src/server.js';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'your_jwt_secret_key_change_this_in_production';

describe('POST /api/units', () => {

  test('debe responder 400 cuando faltan campos requeridos', async () => {

    const token = jwt.encode(
      {
        id: 'test-user',
        role: 'admin'
      },
      JWT_SECRET
    );

    const response = await request(app)
      .post('/api/units')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: 'Faltan campos requeridos'
    });

  });

});