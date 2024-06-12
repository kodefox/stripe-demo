import { Button, Flex, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { API_URL } from '../constants';

export default function ReturnPage() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get('session_id');

    fetch(`${API_URL}/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
      });
  }, []);

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      direction="column"
      gap={4}
    >
      {status === 'complete' && <CheckIcon boxSize={12} color="green" />}
      <Text fontSize="2xl" as="b">
        {status === 'complete' ? 'Payment Success!' : 'Payment Failed!'}
      </Text>
      <Button colorScheme="blue" onClick={() => window.location.replace('/')}>
        Back to Products
      </Button>
    </Flex>
  );
}
