'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthPanel({ onClose }: { onClose: () => void }) {
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else onClose()
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else if (data.user) {
        await supabase.from('profiles').upsert({ user_id: data.user.id, display_name: name || email.split('@')[0] })
        setMessage(data.session ? 'Account created — you are signed in.' : 'Account created. Check your email if confirmation is enabled.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="authOverlay" onMouseDown={onClose}>
      <div className="authCard" onMouseDown={e => e.stopPropagation()}>
        <button className="authClose" onClick={onClose}>×</button>
        <div className="pill">FLOWKEYS ACCOUNT</div>
        <h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2>
        <p className="authSub">Save your typing, maths and physics progress across devices.</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ characters)" minLength={6} required />
          <button className="primary wide" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
        {message && <p className="authMessage">{message}</p>}
        <button className="authSwitch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }}>
          {mode === 'login' ? 'New to FlowKeys? Create an account' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  )
}
