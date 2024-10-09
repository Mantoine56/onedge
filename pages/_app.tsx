import 'react-datepicker/dist/react-datepicker.css';
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/app/hooks/AuthProvider'
import '@/styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp