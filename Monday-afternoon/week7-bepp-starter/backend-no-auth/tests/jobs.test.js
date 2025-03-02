const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Job = require('../models/jobModel');

const jobs = [
  {
    title: 'Web Developer',
    type: 'Full-Time',
    description: 'Build and maintain websites.',
    company: {
      name: 'WebWorks',
      contactEmail: 'hr@webworks.com',
      contactPhone: '111222333'
    }
  },
  {
    title: 'Marketing Specialist',
    type: 'Part-Time',
    description: 'Create marketing strategies and campaigns.',
    company: {
      name: 'AdVision',
      contactEmail: 'jobs@advision.com',
      contactPhone: '444555666'
    }
  }
];

describe('Job Controller', () => {
  beforeEach(async () => {
    await Job.deleteMany({});
    await Job.insertMany(jobs);
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  it('should return all jobs as JSON when GET /api/jobs is called', async () => {
    const response = await api
      .get('/api/jobs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(jobs.length);
    expect(response.body[0].title).toBe(jobs[0].title);
    expect(response.body[0].company.name).toBe(jobs[0].company.name);
  });

  it('should create a new job when POST /api/jobs is called', async () => {
    const newJob = {
      title: 'Product Owner',
      type: 'Full-Time',
      description: 'Oversee product development from start to finish.',
      company: {
        name: 'Tech Innovations',
        contactEmail: 'careers@techinnovations.com',
        contactPhone: '777888999'
      }
    };

    const response = await api
      .post('/api/jobs')
      .send(newJob)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const jobsAfterPost = await Job.find({});
    expect(jobsAfterPost).toHaveLength(jobs.length + 1);
    const jobTitles = jobsAfterPost.map((job) => job.title);
    expect(jobTitles).toContain(newJob.title);

    expect(response.body.title).toBe(newJob.title);
    expect(response.body.description).toBe(newJob.description);
    expect(response.body.company.name).toBe(newJob.company.name);
    expect(response.body.type).toBe(newJob.type);
  });

  it('should return one job by ID when GET /api/jobs/:id is called', async () => {
    const job = await Job.findOne();
    const response = await api
      .get(`/api/jobs/${job._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.title).toBe(job.title);
    expect(response.body.description).toBe(job.description);
    expect(response.body.company.name).toBe(job.company.name);
    expect(response.body.type).toBe(job.type);
  });

  it('should return 404 for a non-existing job ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });

  it('should update one job with partial data when PUT /api/jobs/:id is called', async () => {
    const job = await Job.findOne();
    const updatedJob = {
      description: 'Updated job responsibilities'
    };

    const response = await api
      .put(`/api/jobs/${job._id}`)
      .send(updatedJob)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.description).toBe(updatedJob.description);
    expect(response.body.description).toBe(updatedJob.description);
  });

  it('should return 400 for invalid job ID when PUT /api/jobs/:id', async () => {
    const invalidId = '12345';
    await api.put(`/api/jobs/${invalidId}`).send({}).expect(400);
  });

  it('should delete one job by ID when DELETE /api/jobs/:id is called', async () => {
    const job = await Job.findOne();
    await api.delete(`/api/jobs/${job._id}`).expect(204);

    const deletedJobCheck = await Job.findById(job._id);
    expect(deletedJobCheck).toBeNull();
  });

  it('should return 400 for invalid job ID when DELETE /api/jobs/:id', async () => {
    const invalidId = '12345';
    await api.delete(`/api/jobs/${invalidId}`).expect(400);
  });
});
