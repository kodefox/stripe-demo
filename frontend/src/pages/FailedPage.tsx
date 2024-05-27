import { Button, Flex, Text } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

export default function FailedPage() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      direction="column"
      gap={4}
    >
      <CloseIcon boxSize={12} color="red" />
      <Text fontSize="2xl" as="b">
        Payment Failed!
      </Text>
      <Button colorScheme="blue" onClick={() => window.location.replace("/")}>
        Back to Products
      </Button>
    </Flex>
  );
}
