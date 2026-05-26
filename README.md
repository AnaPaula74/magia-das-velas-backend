# Magia das Velas – Backend

Este repositório contém o backend da aplicação **Magia das Velas**, desenvolvido em **Node.js**, **Express**, **TypeScript** e **MySQL**. O projeto foi estruturado em camadas para oferecer segurança, organização, escalabilidade e integração com serviços externos como **Mercado Pago**.

---

## Pré-requisitos

- Node.js >= 18.x
- MySQL >= 8.x
- NPM ou Yarn
- Docker e Docker Compose, se desejar rodar o banco em container
- Conta no Mercado Pago
- Token de acesso do Mercado Pago configurado no `.env`
- Secret do webhook do Mercado Pago configurado no `.env`

---

## Tecnologias Utilizadas

- Node.js
- Express
- TypeScript
- MySQL
- JWT
- Argon2
- Bcrypt
- Zod
- Winston
- Swagger
- Jest
- Multer
- Helmet
- CORS
- Express Rate Limit
- Nodemailer
- Mercado Pago SDK

---

## Visão Geral

A API fornece funcionalidades essenciais para um e-commerce moderno:

- Autenticação com JWT
- Registro e login de usuários
- Refresh token
- Recuperação e redefinição de senha
- Gestão de produtos com upload de imagem
- Catálogo de produtos com paginação, busca e ordenação
- Gestão de categorias
- Carrinho de compras
- Checkout com validação de estoque
- Criação de pedidos com transação no banco
- Pagamentos via Mercado Pago usando o total real do pedido
- Pagamento Pix
- Checkout Mercado Pago
- Webhook do Mercado Pago com validação de assinatura
- Dashboard administrativo
- Reviews de produtos
- Wishlist
- Gestão de endereços
- Atualização de perfil do usuário
- Logs centralizados
- Auditoria de ações importantes
- Validação de dados com Zod
- Documentação automática com Swagger
- Testes automatizados com Jest

---

## Estrutura de Pastas

```text
src/
  app.ts
  server.ts

  config/          # Configuração de ambiente, banco e Swagger
  controllers/     # Camada HTTP
  services/        # Regras de negócio
  repositories/    # Acesso ao banco de dados
  middlewares/     # Autenticação, autorização, validação, upload e erros
  routes/          # Definição das rotas
  validators/      # Schemas Zod
  models/          # Interfaces e tipos principais
  errors/          # Erros customizados
  utils/           # Logger, JWT, respostas HTTP, email e webhook
  types/           # Extensões de tipos do Express
  tests/           # Testes automatizados

uploads/           # Imagens enviadas
logs/              # Arquivos de log
```

---

## Setup do Banco

1. Crie o banco de dados:

```sql
CREATE DATABASE magia_das_velas;
```

2. Selecione o banco:

```sql
USE magia_das_velas;
```

3. Configure o arquivo `.env` com suas credenciais.

4. Rode os scripts SQL de criação das tabelas, constraints e índices.

5. Certifique-se de que a tabela `payments` possui vínculo obrigatório com `orders`:

```sql
ALTER TABLE payments
MODIFY COLUMN order_id INT NOT NULL;
```

6. Garanta que a foreign key de pagamentos está configurada:

```sql
ALTER TABLE payments
ADD CONSTRAINT fk_payments_order
FOREIGN KEY (order_id) REFERENCES orders(id);
```

7. Crie o índice para `order_id`, caso ainda não exista:

```sql
CREATE INDEX idx_payments_order_id ON payments(order_id);
```

---

## Banco de Dados

Principais tabelas:

- `users` – cadastro de usuários
- `products` – catálogo de produtos
- `categories` – categorias dos produtos
- `cart_items` – itens do carrinho
- `orders` – pedidos realizados
- `order_items` – itens de cada pedido
- `payments` – registros de pagamentos vinculados a pedidos
- `reviews` – avaliações de produtos
- `wishlist` – favoritos dos usuários
- `addresses` – endereços dos usuários
- `password_resets` – tokens de recuperação de senha
- `audit_logs` – registro de ações críticas
- `stock_movements` – movimentações de estoque, se aplicável

---

## Autenticação

A autenticação utiliza **JWT** com access token e refresh token.

### Fluxo

- Registro: cria usuário com senha criptografada em Argon2
- Login: valida credenciais e retorna tokens
- Refresh: gera novo access token
- Rotas protegidas usam `authMiddleware`
- Rotas administrativas usam `adminMiddleware`

### Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

---

## Produtos

Funcionalidades disponíveis:

- Listar produtos
- Buscar produto por ID
- Criar produto com upload de imagem
- Atualizar produto
- Remover produto

### Endpoints

- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `POST /api/v1/products`
- `PUT /api/v1/products/:id`
- `DELETE /api/v1/products/:id`

### Segurança

- Criar, atualizar e remover produtos exige autenticação
- Apenas usuários com role `admin` podem modificar produtos
- Upload de imagem é processado com Multer
- Validação de produto é feita após o upload, garantindo leitura correta do `multipart/form-data`
- Atualização de produto sem nova imagem mantém a imagem antiga

---

## Categorias

Funcionalidades disponíveis:

- Listar categorias
- Buscar categoria por ID
- Criar categoria
- Atualizar categoria
- Remover categoria

### Endpoints

- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `POST /api/v1/categories`
- `PUT /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`

### Segurança

- Criação, atualização e remoção exigem autenticação de administrador

---

## Carrinho

Funcionalidades disponíveis:

- Adicionar produto ao carrinho
- Listar carrinho do usuário autenticado
- Atualizar quantidade de item
- Remover item do carrinho

### Endpoints

- `GET /api/v1/cart`
- `POST /api/v1/cart`
- `PUT /api/v1/cart/:id`
- `DELETE /api/v1/cart/:id`

### Segurança

- Todas as rotas exigem autenticação
- O usuário só pode alterar ou remover itens do próprio carrinho
- As queries de update e delete utilizam `id` e `user_id`

---

## Pedidos

Funcionalidades disponíveis:

- Criar pedido a partir do carrinho
- Validar estoque antes de finalizar compra
- Criar itens do pedido
- Reduzir estoque
- Limpar carrinho após checkout
- Listar pedidos do usuário
- Atualizar status de pedido

### Endpoints

- `POST /api/v1/orders/checkout`
- `GET /api/v1/orders`
- `PATCH /api/v1/orders/:id/status`

### Segurança

- Checkout exige autenticação
- Atualização de status exige usuário administrador
- O checkout usa transação no banco com `beginTransaction`, `commit`, `rollback` e `FOR UPDATE`

---

## Pagamentos

A integração com **Mercado Pago** foi implementada de forma segura para não confiar em valores enviados pelo frontend.

### Fluxo seguro

1. O usuário finaliza o carrinho
2. O backend cria um pedido com o total real
3. O frontend recebe o `orderId`
4. O frontend solicita pagamento enviando apenas o `orderId`
5. O backend busca o pedido no banco
6. O backend valida se o pedido pertence ao usuário autenticado
7. O backend usa o `total` real salvo no pedido
8. O pagamento é criado no Mercado Pago
9. O pagamento é salvo vinculado ao pedido em `payments.order_id`

### Endpoints

- `POST /api/v1/payments/pix`
- `POST /api/v1/payments/checkout`
- `POST /api/v1/payments/webhook`

### Criar pagamento Pix

```http
POST /api/v1/payments/pix
Authorization: Bearer TOKEN
Content-Type: application/json
```

```json
{
  "orderId": 1
}
```

### Criar checkout Mercado Pago

```http
POST /api/v1/payments/checkout
Authorization: Bearer TOKEN
Content-Type: application/json
```

```json
{
  "orderId": 1
}
```

### Segurança dos pagamentos

- Rotas de Pix e Checkout exigem autenticação
- Rotas de Pix e Checkout usam validação com Zod
- O frontend não envia mais `amount`
- O backend calcula o valor pelo `order.total`
- Pagamento só pode ser criado para pedido do próprio usuário
- Pagamento só pode ser criado para pedido com status `pending`
- Cada pagamento é vinculado a um pedido por `order_id`

---

## Webhook Mercado Pago

O webhook recebe notificações do Mercado Pago e atualiza o status do pagamento.

### Endpoint

```http
POST /api/v1/payments/webhook
```

### Segurança

O webhook valida:

- Header `x-signature`
- Header `x-request-id`
- Query `data.id`
- Secret configurado em `MERCADO_PAGO_WEBHOOK_SECRET`
- Assinatura HMAC SHA256

Se a assinatura for inválida, o webhook retorna erro e não processa o pagamento.

---

## Reviews

Funcionalidades disponíveis:

- Criar avaliação de produto
- Listar avaliações de um produto
- Calcular média das avaliações

### Endpoints

- `POST /api/v1/reviews`
- `GET /api/v1/reviews/:productId`

### Segurança

- Criar review exige autenticação
- Cada usuário só pode avaliar o mesmo produto uma vez
- A nota deve estar entre 1 e 5

---

## Wishlist

Funcionalidades disponíveis:

- Adicionar produto aos favoritos
- Listar favoritos
- Remover produto dos favoritos

### Endpoints

- `GET /api/v1/wishlist`
- `POST /api/v1/wishlist`
- `DELETE /api/v1/wishlist/:productId`

### Segurança

- Todas as rotas exigem autenticação
- A wishlist é sempre vinculada ao usuário autenticado
- Produto duplicado na wishlist retorna conflito

---

## Endereços

Funcionalidades disponíveis:

- Listar endereços do usuário
- Criar endereço
- Atualizar endereço
- Remover endereço

### Endpoints

- `GET /api/v1/addresses`
- `POST /api/v1/addresses`
- `PUT /api/v1/addresses/:id`
- `DELETE /api/v1/addresses/:id`

### Segurança

- Todas as rotas exigem autenticação
- O usuário só pode atualizar ou remover os próprios endereços
- As queries de update e delete utilizam `id` e `user_id`

---

## Usuários

Funcionalidades disponíveis:

- Atualizar perfil do usuário autenticado

### Endpoint

- `PUT /api/v1/users/profile`

### Segurança

- Exige autenticação
- Dados são validados com Zod

---

## Dashboard

Funcionalidades disponíveis:

- Estatísticas gerais
- Produtos mais vendidos

### Endpoints

- `GET /api/v1/dashboard/stats`
- `GET /api/v1/dashboard/top-products`

### Segurança

- Exige autenticação
- Exige usuário administrador

---

## Segurança

O backend implementa as seguintes medidas:

- Helmet configurado
- CORS com origens permitidas
- Rate limit global
- Rate limit específico para login
- JWT com issuer e audience
- Senhas criptografadas com Argon2
- Compatibilidade de login com hashes antigos em Bcrypt
- Validação de dados com Zod
- Queries parametrizadas no MySQL
- Upload com validação de extensão e MIME type
- Limite de tamanho de upload
- Middleware global de erro
- Logs estruturados com Winston
- Auditoria de ações importantes
- Proteção de rotas administrativas
- Proteção de ownership em carrinho e endereços
- Pagamento vinculado ao pedido
- Webhook Mercado Pago com validação de assinatura

---

## Documentação

A documentação Swagger fica disponível em:

```text
http://localhost:3000/api-docs
```

As rotas estão documentadas com:

- Descrição
- Parâmetros
- Body esperado
- Respostas
- Segurança Bearer Token
- Exemplos de uso

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend com base no `.env.example`.

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

Nunca suba o `.env` real para o GitHub.

---

## Arquivo `.env.example`

Crie o arquivo:

```text
.env.example
```

Com o conteúdo:

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

## `.gitignore`

O projeto deve ignorar arquivos sensíveis e gerados automaticamente:

```gitignore
node_modules/
dist/
coverage/

logs/
*.log

.env

.DS_Store
```

---

## Docker

Caso deseje rodar o MySQL com Docker, utilize um `docker-compose.yml` semelhante a este:

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8
    container_name: magia-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: magia_das_velas
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Subir o banco:

```bash
docker compose up -d
```

Parar o banco:

```bash
docker compose down
```

---

## Inicialização

Instalar dependências:

```bash
npm install
```

Rodar servidor em desenvolvimento:

```bash
npm run dev
```

Gerar build de produção:

```bash
npm run build
```

Rodar build:

```bash
npm start
```

A API estará disponível em:

```text
http://localhost:3000
```

---

## Scripts Disponíveis

```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/src/server.js",
  "test": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --detectOpenHandles",
  "test:coverage": "NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --coverage"
}
```

---

## Testes

O projeto utiliza **Jest** com suporte a TypeScript e ES Modules.

- Configuração em `jest.config.js`
- Resolver customizado em `jest.resolver.cjs`
- Setup global em `jest.setup.ts`
- Setup dos testes em `src/tests/setup.ts`
- Mocks auxiliares em `src/tests/helpers`

Rodar todos os testes:

```bash
npm test
```

Rodar testes com cobertura:

```bash
npm run test:coverage
```

Rodar um arquivo específico:

```bash
npx jest src/tests/controllersTest/paymentController.test.ts
```

Status atual esperado:

```text
Test Suites: 21 passed, 21 total
Tests: 76 passed, 76 total
Snapshots: 0 total
```

---

## Fluxo Principal da Aplicação

1. Usuário se registra
2. Usuário faz login
3. Usuário lista produtos
4. Usuário adiciona produtos ao carrinho
5. Usuário realiza checkout
6. Backend cria pedido com total real
7. Usuário solicita pagamento usando `orderId`
8. Backend cria pagamento com Mercado Pago
9. Mercado Pago envia webhook
10. Backend valida assinatura e atualiza status do pagamento

---

## Status do Projeto

- Estrutura principal implementada
- Autenticação implementada
- Produtos implementados
- Categorias implementadas
- Carrinho implementado
- Pedidos implementados
- Pagamentos implementados com fluxo seguro por `orderId`
- Webhook Mercado Pago com validação de assinatura
- Reviews implementadas
- Wishlist implementada
- Endereços implementados com proteção por usuário
- Dashboard administrativo implementado
- Swagger implementado
- Testes automatizados passando
- Projeto pronto para evolução do frontend

---

## Melhorias Futuras

- Persistir refresh tokens no banco
- Criar logout com revogação de refresh token
- Permitir review apenas para produtos comprados
- Criar migrations formais
- Criar seeds iniciais
- Criar painel administrativo completo
- Melhorar dashboard financeiro
- Adicionar status de pagamento ao pedido automaticamente
- Adicionar integração real de email em produção
- Adicionar testes de integração com Supertest
- Adicionar CI/CD com GitHub Actions
- Containerizar o backend
- Criar deploy em ambiente de produção

---

## Licença

Este projeto foi desenvolvido exclusivamente para a loja **Magia das Velas**.

Todos os direitos reservados.

Não é permitido copiar, modificar, distribuir ou utilizar este código sem autorização expressa da autora.