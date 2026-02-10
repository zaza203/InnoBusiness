import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  return createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'GIA Booking Platform API',
        version: '1.0.0',
        description: 'Fullstack booking API for customers and admins.'
      },
      components: {
        securitySchemes: {
          UserHeader: {
            type: 'apiKey',
            in: 'header',
            name: 'x-user-id'
          }
        }
      },
      security: [{ UserHeader: [] }]
    },
    apiFolder: 'app/api'
  });
};
