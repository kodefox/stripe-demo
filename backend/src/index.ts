import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { APP_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from './constants';

let app = express();
app.use(cors());
app.use('/stripe-webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '20mb' }));

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
        priceId: defaultPrice?.id,
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

app.post('/create-checkout-session', async (req, res) => {
  try {
    const isEmbedded = req.body.isEmbedded as boolean;
    const products = req.body.products as { priceId: string; qty: number }[];

    const line_items = products.map((product) => ({
      price: product.priceId,
      quantity: product.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      ui_mode: isEmbedded ? 'embedded' : 'hosted',
      line_items,
      mode: 'payment',
      ...(isEmbedded && {
        return_url: `${APP_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ...(!isEmbedded && { cancel_url: `${APP_URL}` }),
      ...(!isEmbedded && { success_url: `${APP_URL}/success` }),
    });

    res.json({
      url: session.url,
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const products = req.body.products as {
      priceId: string;
      price: number;
      qty: number;
    }[];
    const amount = products.reduce(
      (acc, curr) => acc + curr.price * curr.qty,
      0,
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number((amount * 100).toFixed(0)), // Stripe receive amount in cents
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(
    req.query.session_id as string,
  );

  res.send({
    status: session.status,
    customer_email: session.customer_details?.email,
  });
});

app.post('/stripe-webhook', (req, res) => {
  const sig = req.headers['stripe-signature'] || '';

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    console.log(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    // TODO: Set payment intent created/processing/complete/error handler
    case 'payment_intent.created': {
      console.log(
        'catching event of payment intent created ==> We could create a db call here to create our own payment entity',
      );
      break;
    }
    case 'payment_intent.succeeded': {
      console.log(
        'catching event of payment intent succeeded ==> We could create a db call here to update our own payment entity status',
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      console.log(
        'catching event of payment intent failed ==> We could create a db call here to update our own payment entity status',
      );
      break;
    }
    case 'charge.succeeded': {
      console.log('catching event of card successfully charged');
      break;
    }
    case 'charge.failed': {
      console.log('catching event of card failed charged');
      break;
    }
    case 'charge.updated': {
      console.log('catching event of card status update');
      break;
    }
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
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
