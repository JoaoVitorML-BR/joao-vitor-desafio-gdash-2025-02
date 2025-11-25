import { Toaster } from 'sonner'
import LoginPage from './features/auth/pages/LoginPage'

function App() {
  return (
    <>
      <LoginPage />
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App
