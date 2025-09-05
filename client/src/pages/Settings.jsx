import { Box, Heading, Text } from '@chakra-ui/react'
export default function Settings(){
  return (
    <Box p={6}>
      <Heading 
        mb={4}
        bg='linear-gradient(135deg, #00B4D8 0%, #7DC4A5 100%)'
        bgClip='text'
        fontWeight='bold'
      >
        Ajustes
      </Heading>
      <Text color='gray.600'>Pendiente de implementar.</Text>
    </Box>
  )
}
