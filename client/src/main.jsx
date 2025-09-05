import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

const theme = extendTheme({
  fonts: { 
    heading: 'Montserrat, sans-serif', 
    body: 'Montserrat, sans-serif' 
  },
  colors: { 
    brand: { 
      500: '#00B4D8', // Azul claro/turquesa principal
      400: '#90E0EF', // Azul claro secundario
      300: '#CAF0F8', // Azul muy claro
      200: '#7DC4A5', // Verde menta
      100: '#A8E6CF'  // Verde menta claro
    },
    primary: {
      500: '#00B4D8', // Azul turquesa principal
      400: '#90E0EF', // Azul claro
      300: '#CAF0F8', // Azul muy claro
    },
    mint: {
      500: '#7DC4A5', // Verde menta principal
      400: '#A8E6CF', // Verde menta claro
      300: '#C8F4DE', // Verde menta muy claro
    }
  },
  components: { 
    Button: { 
      baseStyle: { 
        rounded: 'xl',
        fontWeight: '600'
      } 
    } 
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter><App/></BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
)