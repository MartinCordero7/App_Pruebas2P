import request from 'supertest';
import app from '../src/server.js';

describe('GET /api/health', () => {

  test('debe responder estado OK', async () => {

    const response = await request(app)
      .get('/api/health');

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: 'OK',
      message: 'Servidor funcionando correctamente'
    });

  });

});