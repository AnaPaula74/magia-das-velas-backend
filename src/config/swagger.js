import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Magia das Velas API",
      version: "1.0.0",
      description: "Documentação da API de e-commerce Magia das Velas",
    },
    servers: [
      { url: "http://localhost:3000" },
    ],
  },
  apis: ["./src/routes/*.ts"], 
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
