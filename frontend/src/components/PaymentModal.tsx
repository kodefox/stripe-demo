import { useEffect, useState } from "react";
import {
  Box,
  Button,
  HStack,
  List,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { API_URL } from "../constants";
import { Product } from "../pages/ProductsPage";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function PaymentModal({
  isOpen,
  products,
  onClose,
}: {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
}) {
  const [paymentIntentSecret, setPaymentIntentSecret] = useState(null);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
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
    if (isOpen) {
      fetchPaymentIntent();
    }
  }, [products, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
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
          <PaymentModalContent
            products={products.filter((product) => product.qty > 0)}
          />
        </Elements>
      ) : (
        <ModalContent>
          <Spinner />
        </ModalContent>
      )}
    </Modal>
  );
}

function PaymentModalContent({ products }: { products: Product[] }) {
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
        return_url: "http://localhost:5173/success",
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    setIsLoading.off();
    if (error.type === "card_error" || error.type === "validation_error") {
      // Can show toast of card decline or payment specific error
      window.location.replace("/failed");
    } else {
      // Put a generic error message in here
      window.location.replace("/failed");
    }
  };
  const totalAmount = products.reduce(
    (acc, curr) => acc + curr.price * curr.qty,
    0,
  );
  return (
    <ModalContent padding={4}>
      <ModalHeader>Complete Payment</ModalHeader>
      <ModalBody>
        <List spacing={3}>
          {products.map((product) => (
            <Box>
              <Text as="b">{product.name}</Text>
              <Text fontSize="sm" color="GrayText">
                {product.description}
              </Text>
              <HStack>
                <Text fontSize="sm" as="b" color="dodgerblue">
                  Price: {product.price.toLocaleString()}{" "}
                  {product.currency.toUpperCase()}
                </Text>
                <Text fontSize="sm" as="b" color="dodgerblue">
                  Amount: {product.qty}
                </Text>
              </HStack>
            </Box>
          ))}
        </List>
        <Text as="b">
          Total Amount: {totalAmount} {products[0].currency.toUpperCase()}
        </Text>

        <PaymentElement id="payment-element" />
        <Button
          colorScheme="blue"
          width="100%"
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={handleSubmit}
          mt={10}
        >
          Pay Now
        </Button>
      </ModalBody>
    </ModalContent>
  );
}
