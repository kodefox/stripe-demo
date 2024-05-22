import { Button, Flex, Text } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

export default function SuccessPage() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      direction="column"
      gap={4}
    >
      <CheckIcon boxSize={12} color="green" />
      <Text fontSize="2xl" as="b">
        Payment Success!
      </Text>
      <Button colorScheme="blue" onClick={() => window.location.replace("/")}>
        Back to Products
      </Button>
    </Flex>
  );
}
