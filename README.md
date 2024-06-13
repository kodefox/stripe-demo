# Getting Started

- [Register](https://dashboard.stripe.com/register) for a Stripe account to obtain API Keys that will be needed to get this app to work
- Add some products on Stripe dashboard

### `.env` variables
 **Backend**
 - `STRIPE_SECRET_KEY` can be obtained from Stripe dashboard (go to `Developers` menu → `API Keys`)
 - `STRIPE_WEBHOOK_SECRET` will be generated when we use Stripe CLI to listen to events locally (the guide can be accessed from Stripe dashboard, go to `Developers` menu → `Webhook` → `Add Local Listener`)

**Frontend**
 - `VITE_STRIPE_PUBLIC_KEY` can be obtained from Stripe dashboard (go to `Developers` menu → `API Keys`)
