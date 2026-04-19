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
        url: process.env.API_BASE_URL || 'http://localhost:5001/api',
        description: 'Development server',
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
  // Scan all module route files and dedicated swagger spec files
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.swagger.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
