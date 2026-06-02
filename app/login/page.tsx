'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'Arial', padding: 20 }}>
      <h1>Installer App Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: 12, marginBottom: 12, fontSize: 16 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: 12, marginBottom: 12, fontSize: 16 }}
      />

      <button onClick={login} disabled={loading} style={{ padding: 12, fontSize: 16 }}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  )
}
