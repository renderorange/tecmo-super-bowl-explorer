const request = require("supertest");
const app = require("../../app/app.js");

const createTestClient = () => request(app);

module.exports = { createTestClient };
