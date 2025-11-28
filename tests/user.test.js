import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

let token;

describe('User Endpoints', () => {
    beforeAll(async () => {
        // Login to get token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'Test1234'
            });
        token = res.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should get user profile', async () => {
        const res = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
    });

    it('should update user profile', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'UpdatedName',
                lastName: 'UpdatedLastName',
                email: 'updatedemail@example.com'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('firstName', 'UpdatedName');
    });

    it('should get user stats', async () => {
        const res = await request(app)
            .get('/api/users/stats')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('completedActivities');
    });
});
