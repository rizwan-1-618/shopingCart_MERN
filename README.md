# ShopKart

Full-stack shop from the Lab 2029 problem statements: customer auth, catalogue, wishlist, cart, and Razorpay test checkout.

## Run

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run seed
npm run dev
```

Open http://localhost:5173

Put Razorpay **test** keys in `backend/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. The secret stays on the server. `ADMIN_API_KEY` unlocks `PATCH /orders/:id/status` for paid-order progression.
