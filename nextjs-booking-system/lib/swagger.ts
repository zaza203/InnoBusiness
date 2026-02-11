import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  return createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ReserveHub Booking API',
        version: '2.0.0',
        description: 'Complete booking system for customers and admins.'
      },
      components: {
        securitySchemes: {
          SessionToken: {
            type: 'apiKey',
            in: 'header',
            name: 'x-session-token'
          }
        }
      },
      security: [{ SessionToken: [] }]
    },
    apiFolder: 'app/api'
  });
};
