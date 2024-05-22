import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  List,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from "@chakra-ui/react";
import { API_URL } from "../constants";

type Product = {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  qty: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const response = await fetch(`${API_URL}/products`);
    const productsResponse = await response.json();

    setProducts(
      productsResponse.products.map((product: Product) => ({
        ...product,
        qty: 0,
      }))
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onChangeQty = (productId: string, qty: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, qty } : product
      )
    );
  };

  const checkoutWithStripeHostedPage = async () => {
    const response = await fetch(`${API_URL}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: products
          .filter((product) => product.qty > 0)
          .map((product) => ({ priceId: product.priceId, qty: product.qty })),
      }),
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <Flex margin={4} justifyContent="center" flexDirection="column" gap={6}>
      <Text fontSize="2xl" as="b">
        Product List
      </Text>

      <List spacing={3}>
        {products.map((product) => (
          <Box
            key={product.id}
            borderWidth="1px"
            borderRadius="lg"
            padding={4}
            display="flex"
            flexDir="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Text as="b">{product.name}</Text>
              <Text fontSize="sm" color="GrayText">
                {product.description}
              </Text>
              <Text fontSize="sm" as="b" color="dodgerblue">
                {product.price.toLocaleString()}{" "}
                {product.currency.toUpperCase()}
              </Text>
            </Box>

            <NumberInput
              defaultValue={product.qty}
              min={0}
              onChange={(_, value) => onChangeQty(product.id, value)}
              h="100%"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        ))}
      </List>

      {/* <Box display="flex" flexDir="row" alignItems="center" gap={4}> */}
      <Button
        bgColor="dodgerblue"
        color="white"
        width="100%"
        onClick={checkoutWithStripeHostedPage}
      >
        Checkout (Stripe Hosted Page)
      </Button>

      <Button bgColor="dodgerblue" color="white" width="100%">
        Checkout (Custom Payment Flow)
      </Button>
      {/* </Box> */}

      {/* <Text>
        Total Price:{" "}
        {products
          .reduce((acc, product) => acc + product.qty * product.price, 0)
          .toFixed(2)}
      </Text> */}
    </Flex>
  );
}
