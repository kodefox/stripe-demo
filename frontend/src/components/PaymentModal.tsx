import { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useBoolean,
} from '@chakra-ui/react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { API_URL } from '../constants';
import { Product } from '../pages/ProductsPage';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function PaymentModal({
  products,
  onClose,
}: {
  products: Product[];
  onClose: () => void;
}) {
  const [paymentIntentSecret, setPaymentIntentSecret] = useState(null);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products
            .filter((product) => product.qty > 0)
            .map((product) => ({
              priceId: product.priceId,
              qty: product.qty,
              price: product.price,
            })),
        }),
      });

      const { clientSecret } = await response.json();
      setPaymentIntentSecret(clientSecret);
    };
    fetchPaymentIntent();
  }, [products]);

  return (
    <Modal
      isOpen
      onClose={() => {
        onClose();
        setPaymentIntentSecret(null);
      }}
    >
      <ModalOverlay />
      {paymentIntentSecret ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: paymentIntentSecret,
          }}
        >
          <PaymentModalContent />
        </Elements>
      ) : (
        <ModalContent>
          <Text>Loading</Text>
        </ModalContent>
      )}
    </Modal>
  );
}

function PaymentModalContent() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useBoolean(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading.on();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:5173/success',
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      // TODO:Show error
    } else {
      // TODO:Show error
    }

    setIsLoading.off();
  };
  return (
    <ModalContent>
      <ModalHeader>Modal Title</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <PaymentElement id="payment-element" />
        <Button
          colorScheme="blue"
          width="100%"
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          Pay Now
        </Button>
      </ModalBody>
    </ModalContent>
  );
}
