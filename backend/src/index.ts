import express from 'express';
import Stripe from 'stripe';
import { API_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from './constants';

let app = express();
let stripe = new Stripe(STRIPE_SECRET_KEY);

app.get('/products', async (_req, res) => {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    let productsData = products.data.map((product) => {
      let defaultPrice = product.default_price as Stripe.Price;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: (defaultPrice?.unit_amount || 0) / 100,
        currency: defaultPrice?.currency,
      };
    });

    res.json({
      products: productsData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.post('/create-checkout-session', async (_req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1PHiMXGmlXG2ESEP0MiA5QuX',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${API_URL}?success=true`,
    cancel_url: `${API_URL}?canceled=true`,
  });

  res.json({
    session,
  });
});

app.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'] || '';

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSessionCompleted = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed

        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  },
);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
