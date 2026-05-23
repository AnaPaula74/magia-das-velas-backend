import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Magia das Velas API",
      version: "1.0.0",
      description: "API de e-commerce para artigos religiosos. Inclui autenticação, produtos, pedidos, pagamentos e mais.",
      contact: {
        name: "Equipe Magia das Velas",
        email: "suporte@magia-velas.com",
      },
    },
    servers: [
      { url: "http://localhost:3000/api/v1", description: "Servidor local" },
      { url: "https://api.magia-velas.com/api/v1", description: "Servidor produção" },
    ],
    tags: [
      { name: "Auth", description: "Endpoints de autenticação" },
      { name: "Products", description: "Gerenciamento de produtos" },
      { name: "Categories", description: "Gerenciamento de categorias" },
      { name: "Addresses", description: "Endereços de entrega" },
      { name: "Orders", description: "Pedidos e checkout" },
      { name: "Payments", description: "Pagamentos e webhooks" },
      { name: "Cart", description: "Carrinho de compras" },
      { name: "Reviews", description: "Avaliações de produtos" },
      { name: "Wishlist", description: "Lista de favoritos" },
      { name: "Dashboard", description: "Estatísticas e relatórios" },
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
        ApiResponse: {
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
            name: { type: "string", example: "Ana" },
            email: { type: "string", example: "ana@test.com" },
            role: { type: "string", example: "customer" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 15 },
            name: { type: "string", example: "Vela aromática" },
            description: { type: "string", example: "Vela de lavanda para meditação" },
            price: { type: "number", format: "float", example: 29.90 },
            stock: { type: "integer", example: 100 },
            category_id: { type: "integer", example: 3 },
            image_url: { type: "string", example: "https://cdn.magia-velas.com/produtos/vela.jpg" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 3 },
            name: { type: "string", example: "Velas" },
            description: { type: "string", example: "Velas aromáticas e religiosas" },
            created_at: { type: "string", format: "date-time", example: "2026-05-20T10:00:00Z" },
          },
        },
        Address: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            street: { type: "string", example: "Rua das Flores, 123" },
            city: { type: "string", example: "Rio de Janeiro" },
            state: { type: "string", example: "RJ" },
            zip: { type: "string", example: "22000-000" },
            created_at: { type: "string", format: "date-time", example: "2026-05-21T14:30:00Z" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 101 },
            user_id: { type: "integer", example: 1 },
            status: { type: "string", example: "paid" },
            total: { type: "number", format: "float", example: 89.90 },
            created_at: { type: "string", format: "date-time", example: "2026-05-22T09:15:00Z" },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 5 },
            productId: { type: "integer", example: 15 },
            quantity: { type: "integer", example: 2 },
            userId: { type: "integer", example: 1 },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            productId: { type: "integer", example: 15 },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment: { type: "string", example: "Produto excelente, recomendo!" },
            userId: { type: "integer", example: 2 },
            created_at: { type: "string", format: "date-time", example: "2026-05-23T13:00:00Z" },
          },
        },
        WishlistItem: {
          type: "object",
          properties: {
            productId: { type: "integer", example: 15 },
            name: { type: "string", example: "Vela aromática" },
            price: { type: "number", format: "float", example: 29.90 },
            added_at: { type: "string", format: "date-time", example: "2026-05-23T13:05:00Z" },
          },
        },
        PaymentPix: {
          type: "object",
          properties: {
            id: { type: "integer", example: 2001 },
            amount: { type: "number", format: "float", example: 59.90 },
            description: { type: "string", example: "Compra de velas" },
            email: { type: "string", example: "cliente@email.com" },
            status: { type: "string", example: "pending" },
          },
        },
        PaymentCheckout: {
          type: "object",
          properties: {
            id: { type: "integer", example: 3001 },
            amount: { type: "number", format: "float", example: 89.90 },
            description: { type: "string", example: "Kit espiritual" },
            checkout_url: { type: "string", example: "https://mercadopago.com/checkout/12345" },
            status: { type: "string", example: "created" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Mensagem de erro descritiva" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };
