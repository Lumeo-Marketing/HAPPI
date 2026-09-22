import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from '@happi/ui/button'

import '@happi/fonts/fonts.css'
import '@happi/ui/styles.css'
import './styles.css'

function App() {
  return (
    <main className="happi-foundation-main">
      <section className="happi-card">
        <p className="happi-eyebrow">HAPPI Operations</p>
        <h1>Admin foundation</h1>
        <p>
          Verification, bookings, payments, payouts, sessions, and safety
          operations will live here.
        </p>
        <Button>Open admin workspace</Button>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
