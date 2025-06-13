const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Bank API',
      version: '1.0.0',
      description: 'API documentation for the My Bank application, covering customer onboarding, accounts, and transactions.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server (V1)',
      },
      {
        url: 'http://localhost:5000/api/v2',
        description: 'Development server (V2)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.js', './src/routes/v2/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
