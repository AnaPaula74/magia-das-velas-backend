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
      { name: "Products", description: "Catálogo e gerenciamento de produtos" },
      { name: "Categories", description: "Categorias de produtos" },
      { name: "Cart", description: "Carrinho de compras" },
      { name: "Orders", description: "Pedidos e checkout" },
      { name: "Payments", description: "Pagamentos e webhooks" },
      { name: "Reviews", description: "Avaliações de produtos" },
      { name: "Wishlist", description: "Lista de favoritos" },
      { name: "Addresses", description: "Endereços do usuário" },
      { name: "Users", description: "Perfil do usuário" },
      { name: "Dashboard", description: "Estatísticas administrativas" },
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
            message: { type: "string", example: "Operação realizada com sucesso" },
            data: { type: "object" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Ana Paula" },
            email: { type: "string", example: "ana@email.com" },
            role: { type: "string", example: "user" },
            phone: { type: "string", example: "+5522999999999" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Vela de Limpeza Espiritual" },
            description: { type: "string", example: "Vela artesanal para limpeza energética." },
            price: { type: "number", example: 29.9 },
            image_url: { type: "string", example: "/uploads/vela.webp" },
            stock: { type: "integer", example: 20 },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Velas" },
            description: { type: "string", example: "Velas ritualísticas e aromáticas" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            product_id: { type: "integer", example: 2 },
            quantity: { type: "integer", example: 3 },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            total: { type: "number", example: 89.7 },
            status: { type: "string", example: "pending" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            product_id: { type: "integer", example: 2 },
            rating: { type: "integer", example: 5 },
            comment: { type: "string", example: "Produto excelente!" },
          },
        },
        Address: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            street: { type: "string", example: "Rua das Flores, 123" },
            city: { type: "string", example: "Araruama" },
            state: { type: "string", example: "RJ" },
            zip: { type: "string", example: "28970-000" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            payment_id: { type: "string", example: "123456789" },
            method: { type: "string", example: "pix" },
            amount: { type: "number", example: 59.9 },
            status: { type: "string", example: "pending" },
            description: { type: "string", example: "Compra de velas" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };