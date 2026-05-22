# Magia das Velas – Backend

Este repositório contém o backend da aplicação **Magia das Velas**, desenvolvido em **Node.js**, **Express** e **MySQL**. O projeto foi estruturado para oferecer segurança, escalabilidade e integração com serviços externos como **Mercado Pago**.

---

## Pré-requisitos

- Node.js >= 18.x
- MySQL >= 8.x
- NPM ou Yarn
- Conta no Mercado Pago e token de acesso configurado no `.env`

---

## Tecnologias Utilizadas

- Node.js / Express
- MySQL
- JWT + Argon2
- Zod (validação)
- Winston (logs)
- Swagger (documentação)
- Jest (testes)
- Mercado Pago SDK

---

## Visão Geral

A API fornece funcionalidades essenciais para um e-commerce moderno:

- Autenticação com JWT (login, registro, refresh token).
- Gestão de produtos (CRUD com upload de imagens).
- Carrinho de compras.
- Pedidos com validação de estoque e checkout.
- Pagamentos via Mercado Pago (Pix, cartão/boleto, webhook).
- Dashboard administrativo com estatísticas e produtos mais vendidos.
- Reviews de produtos com cálculo de média.
- Wishlist (favoritos).
- Documentação automática com Swagger.
- Logs centralizados com Winston.
- Validação de dados com Zod.
- Testes automatizados com Jest.

---

## Estrutura de Pastas

```text
src/
  config/          # Configuração de banco, Swagger
  controllers/     # Lógica das rotas
  services/        # Regras de negócio
  repositories/    # Acesso ao banco
  middlewares/     # Autenticação, validação, upload, erros
  routes/          # Definição das rotas com Swagger
  validators/      # Schemas Zod para validação
  utils/           # Logger, JWT utils
uploads/           # Armazenamento local de imagens
logs/              # Arquivos de log

```
## Setup do Banco

 1. Crie o banco de dados:

 ```bash
CREATE DATABASE magia_mysql;
```

 2. Configure o .env com suas credenciais.

 3. Rode migrations ou scripts SQL iniciais (se aplicável).

 4. Popule dados de exemplo com scripts de seed (opcional).
 
---

## Banco de Dados

Principais tabelas:

- `users` – cadastro de clientes.
- `products` – catálogo de produtos.
- `cart_items` – itens do carrinho.
- `orders` – pedidos realizados.
- `order_items` – itens de cada pedido.
- `payments` – registros de pagamentos.
- `reviews` – avaliações de produtos.
- `wishlist` – favoritos dos usuários.
- `audit_logs` – registro de ações críticas.

---

## Autenticação

- Registro (`POST /auth/register`) – cria usuário com senha criptografada em Argon2.
- Login (`POST /auth/login`) – gera access token (15m) e refresh token (7d).
- Refresh (`POST /auth/refresh`) – atualiza access token.

Tokens são validados por middlewares (`authMiddleware`, `adminMiddleware`).

---

## Produtos

- Listar (`GET /products`)
- Buscar por ID (`GET /products/:id`)
- Criar (`POST /products`) – apenas admin, com upload de imagem
- Atualizar (`PUT /products/:id`) – apenas admin
- Remover (`DELETE /products/:id`) – apenas admin

---

## Carrinho

- Adicionar item (`POST /cart`)
- Listar itens (`GET /cart`)
- Atualizar quantidade (`PUT /cart/:id`)
- Remover item (`DELETE /cart/:id`)

---

## Pedidos

- Checkout (`POST /orders/checkout`) – cria pedido, valida estoque, atualiza produtos e limpa carrinho
- Listar pedidos (`GET /orders`)
- Atualizar status (`PATCH /orders/:id/status`)

---

## Pagamentos

Integração com **Mercado Pago**:

- Pix (`POST /payments/pix`) – gera QR Code Pix
- Checkout (`POST /payments/checkout`) – cria link de pagamento
- Webhook (`POST /payments/webhook`) – atualiza status automaticamente

---

## Dashboard

- Estatísticas gerais (`GET /dashboard/stats`)
- Produtos mais vendidos (`GET /dashboard/top-products`)

---

## Reviews

- Criar review (`POST /reviews`)
- Listar reviews de produto (`GET /reviews/:productId`)

---

## Wishlist

- Adicionar produto (`POST /wishlist`)
- Listar favoritos (`GET /wishlist`)
- Remover produto (`DELETE /wishlist/:productId`)

---

## Segurança

- Helmet configurado com CSP
- Rate limit global e específico para login
- Autenticação JWT
- Middlewares de validação com Zod
- Logs estruturados com Winston

---

## Documentação

Swagger disponível em:

http://localhost:3000/api-docs


Todas as rotas estão documentadas com exemplos de requisição e resposta.

---

## Variáveis de Ambiente

`.env`:

PORT=3000

DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root1235678
DB_NAME=magia-mysql

JWT_SECRET=magia_das_velas_super_secret_12345678
JWT_REFRESH_SECRET=magia_das_velas_refresh_456

MERCADO_PAGO_ACCESS_TOKEN=colocar_token_depois

### Observação: os valores acima são apenas exemplos. 

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
A API estará disponível em http://localhost:3000.
---
## Testes

O projeto utiliza **Jest** com suporte a TypeScript e ES Modules.

- Configuração em `jest.config.js`
- Setup em `jest.setup.ts`
- Secrets de JWT definidos para ambiente de teste

Rodar todos os testes:

```bash
npm test
```
Rodar testes com cobertura:

```bash
npm run test:coverage
```

Rodar apenas um arquivo específico:
```bash
npx jest src/tests/auth.test.ts
```

## Status do Projeto:

Estrutura completa implementada

Integração com Mercado Pago em modo base (aguardando token real)

## Licença

Este projeto foi desenvolvido exclusivamente para a loja **Magia das Velas**.  
Todos os direitos reservados.  

Não é permitido copiar, modificar, distribuir ou utilizar este código sem autorização expressa da autora.


