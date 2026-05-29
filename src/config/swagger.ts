import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Magia das Velas API",
      version: "1.0.0",
      description:
        "API REST de e-commerce para venda de velas, kits espirituais e artigos religiosos.",
      contact: {
        name: "Ana Paula Mendonça Lima",
        email: "anapaulamendoncalimadeveloper@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Ambiente local",
      },
    ],
    tags: [
      { name: "Auth", description: "Autenticação e recuperação de senha" },
      { name: "Users", description: "Perfil do usuário" },
      { name: "Products", description: "Produtos" },
      { name: "Categories", description: "Categorias" },
      { name: "Cart", description: "Carrinho" },
      { name: "Orders", description: "Pedidos" },
      { name: "Payments", description: "Pagamentos" },
      { name: "Reviews", description: "Avaliações" },
      { name: "Wishlist", description: "Favoritos" },
      { name: "Addresses", description: "Endereços" },
      { name: "Dashboard", description: "Dashboard administrativo" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Mensagem de erro" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Operação realizada com sucesso",
            },
            data: { type: "object" },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Ana Paula" },
            email: { type: "string", example: "ana@email.com" },
            password: { type: "string", example: "Senha@123" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "ana@email.com" },
            password: { type: "string", example: "Senha@123" },
          },
        },
        ProductInput: {
          type: "object",
          required: ["name", "description", "price", "stock"],
          properties: {
            name: { type: "string", example: "Vela de Limpeza Espiritual" },
            description: {
              type: "string",
              example: "Vela artesanal para limpeza energética.",
            },
            price: { type: "number", example: 39.9 },
            stock: { type: "integer", example: 20 },
            categoryId: { type: "integer", example: 1 },
          },
        },
        CategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Velas" },
            description: {
              type: "string",
              example: "Velas ritualísticas e aromáticas",
            },
          },
        },
        AddressInput: {
          type: "object",
          required: ["street", "city", "state", "zip"],
          properties: {
            street: { type: "string", example: "Rua das Flores, 123" },
            city: { type: "string", example: "Araruama" },
            state: { type: "string", example: "RJ" },
            zip: { type: "string", example: "28970-000" },
          },
        },
        CartInput: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2 },
          },
        },
        ReviewInput: {
          type: "object",
          required: ["productId", "rating"],
          properties: {
            productId: { type: "integer", example: 1 },
            rating: { type: "integer", example: 5 },
            comment: { type: "string", example: "Produto excelente!" },
          },
        },
        WishlistInput: {
          type: "object",
          required: ["productId"],
          properties: {
            productId: { type: "integer", example: 1 },
          },
        },
        PaymentInput: {
          type: "object",
          required: ["orderId"],
          properties: {
            orderId: { type: "integer", example: 1 },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };
