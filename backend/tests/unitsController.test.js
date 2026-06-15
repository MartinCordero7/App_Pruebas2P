import { jest } from '@jest/globals';
import { createUnit } from '../src/controllers/unitsController.js';

describe('createUnit', () => {
  test('debe devolver 400 cuando faltan campos requeridos', async () => {
    const req = {
      body: {}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await createUnit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Faltan campos requeridos'
    });
  });
});