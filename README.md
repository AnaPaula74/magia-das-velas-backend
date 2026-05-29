# README.md

# Magia das Velas API

API REST completa para um e-commerce de velas artesanais, produtos espirituais, kits ritualísticos e artigos religiosos.

O projeto foi desenvolvido utilizando arquitetura em camadas, autenticação JWT, validação robusta com Zod, integração com Mercado Pago, upload de arquivos, auditoria de ações, documentação Swagger e testes automatizados.

---

# Tecnologias

- Node.js
- Express
- TypeScript
- MySQL
- JWT
- Argon2
- Zod
- Multer
- Mercado Pago SDK
- Nodemailer
- Winston
- Swagger
- Jest

---

# Arquitetura

O projeto segue uma organização em camadas:

```txt
src/
├── config/
├── controllers/
├── database/
├── dtos/
├── enums/
├── errors/
├── middlewares/
├── repositories/
├── routes/
├── services/
├── tests/
├── types/
├── utils/
├── validators/
├── app.ts
└── server.ts
```

---

# Funcionalidades

## Autenticação

- Cadastro de usuário
- Login JWT
- Refresh token com rotação
- Logout
- Recuperação de senha
- Reset de senha
- Hash seguro com Argon2

## Produtos

- CRUD completo de produtos
- Paginação
- Busca
- Ordenação
- Upload de imagens
- Controle de estoque

## Categorias

- CRUD completo
- Proteção admin

## Carrinho

- Adicionar item
- Atualizar quantidade
- Remover item
- Limpar carrinho

## Pedidos

- Checkout transacional
- Controle de estoque
- Histórico de pedidos
- Atualização de status

## Pagamentos

- Pix Mercado Pago
- Checkout Mercado Pago
- Webhook seguro
- Cancelamento local
- Consulta de status

## Reviews

- Avaliação de produtos
- Média de avaliações
- Controle de review duplicada

## Wishlist

- Adicionar/remover favoritos
- Verificação de existência

## Usuário

- Perfil
- Atualização de perfil

## Dashboard Admin

- Estatísticas gerais
- Produtos mais vendidos
- Relatório de vendas
- Métricas de usuários

## Segurança

- JWT Access Token
- JWT Refresh Token
- Hash de refresh token
- Helmet
- CORS
- Rate Limit
- Middleware admin
- Middleware auth
- Webhook validation

## Observabilidade

- Logs com Winston
- Auditoria de ações
- Tratamento centralizado de erros

---

# Banco de Dados

Principais tabelas:

- users
- products
- categories
- cart_items
- orders
- order_items
- payments
- reviews
- wishlist
- addresses
- refresh_tokens
- password_resets
- audit_logs

---

# Instalação

## Clonar repositório

```bash
git clone https://github.com/AnaPaula74/magia-das-velas-backend.git
```

## Entrar no projeto

```bash
cd magia-das-velas-backend
```

## Instalar dependências

```bash
npm install
```

---

# Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`.

## Exemplo

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=change_me
DB_NAME=magia_das_velas

SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=

JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me

MERCADO_PAGO_ACCESS_TOKEN=change_me
MERCADO_PAGO_WEBHOOK_SECRET=change_me

FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5173
```

---

# Scripts

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Produção

```bash
npm start
```

## Testes

```bash
npm test
```

## Migrations

```bash
npm run db:migrate
```

---

# Swagger

Após iniciar o servidor:

```txt
http://localhost:3000/api-docs
```

---

# Rotas Principais

## Auth

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

## Products

```txt
GET /api/v1/products
GET /api/v1/products/:id
POST /api/v1/products
PUT /api/v1/products/:id
DELETE /api/v1/products/:id
```

## Categories

```txt
GET /api/v1/categories
GET /api/v1/categories/:id
POST /api/v1/categories
PUT /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

## Cart

```txt
GET /api/v1/cart
POST /api/v1/cart
PUT /api/v1/cart/:id
DELETE /api/v1/cart/:id
DELETE /api/v1/cart/clear
```

## Orders

```txt
POST /api/v1/orders/checkout
GET /api/v1/orders
GET /api/v1/orders/:id
PATCH /api/v1/orders/:id/status
```

## Payments

```txt
POST /api/v1/payments/pix
POST /api/v1/payments/checkout
POST /api/v1/payments/webhook
GET /api/v1/payments/:id/status
PATCH /api/v1/payments/:id/cancel
```

## Reviews

```txt
POST /api/v1/reviews
GET /api/v1/reviews/:productId
PUT /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
```

## Wishlist

```txt
GET /api/v1/wishlist
POST /api/v1/wishlist
GET /api/v1/wishlist/:productId/exists
DELETE /api/v1/wishlist/:productId
```

## Addresses

```txt
GET /api/v1/addresses
POST /api/v1/addresses
PUT /api/v1/addresses/:id
DELETE /api/v1/addresses/:id
```

## Users

```txt
GET /api/v1/users/profile
PUT /api/v1/users/profile
```

## Dashboard

```txt
GET /api/v1/dashboard/stats
GET /api/v1/dashboard/top-products
GET /api/v1/dashboard/sales-report
GET /api/v1/dashboard/user-metrics
```

---

# Uploads

Os uploads são armazenados em:

```txt
/uploads
```

Formatos permitidos:

- JPG
- JPEG
- PNG
- WEBP

Limite:

```txt
2MB
```

---

# Segurança

O projeto implementa:

- Access Token JWT
- Refresh Token JWT
- Rotação de refresh token
- Hash SHA256 de tokens
- Argon2
- Middleware admin
- Middleware auth
- Rate limiting
- Helmet
- CORS configurado
- Validação Zod
- Sanitização
- Webhook validation Mercado Pago

---

# Logs

Logs gerados com Winston:

```txt
logs/error.log
logs/combined.log
```

---

# Testes

O projeto possui testes automatizados para:

- Controllers
- Services
- Middlewares
- Auth
- Cart
- Wishlist
- Reviews
- Dashboard
- Orders

Executar:

```bash
npm test
```

---

# Health Check

```txt
GET /health
```

Resposta:

```json
{
  "success": true,
  "status": "ok",
  "service": "magia-das-velas-api"
}
```

---

# Destaques Técnicos

- Arquitetura em camadas com controllers, services, repositories, DTOs e validators
- TypeScript em modo strict
- Validação centralizada com Zod para body, params e query
- Tratamento centralizado de erros e respostas padronizadas
- Autenticação JWT com access token, refresh token, rotação e logout
- Controle de acesso por middleware admin
- Auditoria de ações relevantes
- Checkout transacional com controle de estoque
- Integração com Mercado Pago para Pix, checkout e webhook assinado
- Upload de imagens com validação de tipo e limite de tamanho
- Logs estruturados com Winston
- Documentação Swagger organizada por domínio
- Testes automatizados de controllers, services, middlewares, validators e rotas

---


# Autor

Ana Paula Mendonça Lima

GitHub:
https://github.com/AnaPaula74

LinkedIn:
https://www.linkedin.com/in/ana-paula-mendonca-lima



---

## Licença

Este projeto foi desenvolvido exclusivamente para a loja **Magia das Velas**.

Todos os direitos reservados.

Não é permitido copiar, modificar, distribuir ou utilizar este código sem autorização expressa da autora.
