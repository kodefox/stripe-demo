import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type Props = {
  clientSecret: string;
  onClose: () => void;
};

export default function EmbeddedFormModal(props: Props) {
  return (
    <Modal isOpen onClose={props.onClose}>
      <ModalOverlay />

      <ModalContent pb={4}>
        <ModalHeader>Complete Payment</ModalHeader>
        <ModalCloseButton />
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            clientSecret: props.clientSecret,
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </ModalContent>
    </Modal>
  );
}
