import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        // Connect to test database or mock
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                firstName: 'Test',
                lastName: 'User',
                email: 'testuser@example.com',
                password: 'Test1234',
                isBusinessUser: false
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
    });

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'Test1234'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
