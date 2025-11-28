import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

let token;
let challengeId;

describe('Challenge Endpoints', () => {
    beforeAll(async () => {
        // Login as business user to get token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@sportradar.com',
                password: 'Admin123'
            });
        token = res.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should create a new challenge', async () => {
        const res = await request(app)
            .post('/api/challenges')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Test Challenge',
                description: 'Test description',
                goal: 100,
                unit: 'km',
                sportType: 'running',
                startDate: '2024-01-01',
                endDate: '2024-01-31',
                rewards: 'Test reward'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        challengeId = res.body._id;
    });

    it('should get list of challenges', async () => {
        const res = await request(app)
            .get('/api/challenges')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should update a challenge', async () => {
        const res = await request(app)
            .put(`/api/challenges/${challengeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Challenge Name',
                goal: 150
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Updated Challenge Name');
    });

    it('should delete a challenge', async () => {
        const res = await request(app)
            .delete(`/api/challenges/${challengeId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Challenge supprimé');
    });
});
