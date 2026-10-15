# ShopKart

ShopKart is a full-stack store. A customer can register, sign in, browse products, save a wishlist, keep a cart, pay with Razorpay in test mode, and read their order history.

The API is Express and MongoDB. The site is React. Login uses a JWT stored in an HttpOnly cookie. Product prices and stock live in MongoDB. Wishlist and cart store product ids. An order stores a snapshot of the name and price at the time of payment.

## Features

- Register, log in, view profile, log out, and change password
- Product list, search, category filter, price sort, and product details
- Wishlist add, toggle, remove, and a navbar count from the API
- Cart add, quantity update, remove, stock checks, and a shared cart count
- Checkout with shipping validation, server-side totals, and Razorpay test checkout
- Payment signature verification, stock decrease, and cart clear only after a verified payment
- Order confirmation and order history

## Stack

| Part | Used |
| --- | --- |
| API | Node.js, Express, MongoDB, Mongoose |
| Auth | bcrypt, jsonwebtoken, cookie-parser |
| Payments | Razorpay test mode |
| Client | React, React Router, Axios, Tailwind CSS |

Authentication is implemented in the API. Passport, Clerk, Firebase, and Auth0 are not used.

## Prerequisites

- Node.js 20 or newer
- MongoDB running locally

On macOS with Homebrew:

```bash
brew services start mongodb-community
```

The API expects MongoDB at `mongodb://127.0.0.1:27017/shopkart`.

## Setup

From the project root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set `JWT_SECRET` in `backend/.env` to a long random string. The API exits on startup if `JWT_SECRET`, `MONGODB_URI`, `CLIENT_URL`, or `CURRENCY` is empty.

For checkout, create Razorpay **test** keys and put them in `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

`RAZORPAY_KEY_SECRET` stays on the server. It is not sent to React and it must not be committed. Leave both values empty if you only need auth, catalogue, wishlist, and cart. Place Order will then respond that Razorpay is not configured, and the cart will stay as it is.

`ADMIN_API_KEY` is optional. When it is set, `PATCH /orders/:id/status` accepts that value in the `x-admin-key` header and moves a paid order one step forward: PLACED, CONFIRMED, SHIPPED, DELIVERED.

Load the starter catalogue once:

```bash
npm run seed
```

The seed inserts products only when the collection is empty.

## Run

```bash
npm run dev
```

| App | URL |
| --- | --- |
| Site | http://localhost:5173 |
| API | http://localhost:8080 |

The site calls `/api/...`. Vite forwards that to `http://localhost:8080` and removes the `/api` prefix. Postman should call port 8080 directly, for example `POST http://localhost:8080/customers/login`.

Stop the dev processes with Ctrl+C. Stop MongoDB with:

```bash
brew services stop mongodb-community
```

## Customer flow

1. Open `/register` and create an account.
2. Sign in at `/login`. The API sets an HttpOnly cookie named `token`.
3. `/home` shows the profile from `GET /customers/me`.
4. `/products` loads the catalogue. Search, category, and sort are query parameters on `GET /products`.
5. Save a product to the wishlist, or add it to the cart. Adding the same product again increases its quantity.
6. Open `/cart`, change quantity, then continue to `/checkout`.
7. Submit a shipping address. Phone must be 10 digits. Pincode must be 6 digits.
8. Pay in the Razorpay test window. A successful test payment is verified on the server, stock is reduced, the cart is cleared, and the browser opens the order confirmation.
9. Past orders are on `/orders`.

Razorpay test card: `4111 1111 1111 1111`, any future expiry, any CVV. No real charge is made.

## API

JSON keys are camelCase. `"Email"` is not `"email"`.

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/customers/register` | No | `fullName`, `email`, `password`, `phone` |
| POST | `/customers/login` | No | `email`, `password` |
| GET | `/customers/me` | Cookie | none |
| POST | `/customers/logout` | Cookie | none |
| PATCH | `/customers/change-password` | Cookie | `oldPassword`, `newPassword` |
| POST | `/products` | No | `name`, `description`, `price`, `category`, `image`, `stock` |
| GET | `/products` | No | query: `search`, `category`, `sort` |
| GET | `/products/categories` | No | none |
| GET | `/products/:id` | No | none |
| POST | `/wishlist/:productId` | Cookie | none |
| PATCH | `/wishlist/:productId/toggle` | Cookie | none |
| GET | `/wishlist` | Cookie | none |
| DELETE | `/wishlist/:productId` | Cookie | none |
| POST | `/cart/:productId` | Cookie | none |
| GET | `/cart` | Cookie | none |
| PATCH | `/cart/:productId` | Cookie | `quantity` |
| DELETE | `/cart/:productId` | Cookie | none |
| POST | `/orders/create-payment-order` | Cookie | `shippingAddress` only |
| POST | `/orders/verify-payment` | Cookie | ShopKart order id and the three Razorpay fields |
| POST | `/orders/:id/payment-failed` | Cookie | none |
| GET | `/orders` | Cookie | none |
| GET | `/orders/:id` | Cookie | none |
| PATCH | `/orders/:id/status` | `x-admin-key` | `status` |

Register example:

```json
{
  "fullName": "Rizz",
  "email": "rizz@gmail.com",
  "password": "123456789",
  "phone": "1234567890"
}
```

After login, protected requests must send the `token` cookie. The customer id is taken from that cookie. Do not send `userId` in the body.

`POST /orders/create-payment-order` ignores a `totalAmount` sent by the client. The server multiplies the current product price by quantity, checks stock again, and creates the Razorpay order in paise.

## Project layout

```text
backend/
  index.js                 API entry
  seed.js                  starter products
  config/                  env and Razorpay client
  models/                  Customer, Product, Order
  controllers/             request handling
  routes/                  URL map
  middlewares/             cookie auth and errors
  utils/                   token cookie and validation
frontend/
  src/pages/               screens
  src/components/          shared UI
  src/context/             auth and cart state
  src/services/            Axios client and Razorpay script
  src/utils/               money, dates, stock, form checks
```

Wishlist data is loaded from `GET /wishlist` on the pages that need it. Cart data lives in one React context so the navbar count, product cards, cart page, and checkout summary stay on the same list.

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | API and site together |
| `npm run seed` | Insert starter products if none exist |
| `npm start` | API only, without the file watcher |
| `npm run dev --prefix backend` | API only |
| `npm run dev --prefix frontend` | site only |
| `npm run build --prefix frontend` | production build of the site |
