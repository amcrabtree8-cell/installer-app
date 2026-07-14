'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const updatePassword = async () => {
    setMessage('')

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Password updated. You can log in now.')

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }

  return (
    <main
      style={{
        maxWidth: 400,
        margin: '60px auto',
        padding: 20,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>Set New Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 12,
          border: '1px solid #ccc',
          borderRadius: 6,
        }}
      />

      <button
        onClick={updatePassword}
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          border: 'none',
          borderRadius: 6,
          background: '#111',
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>

      {message && (
        <p style={{ marginTop: 12 }}>
          {message}
        </p>
      )}
    </main>
  )
}
