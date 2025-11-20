import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'

export default function RequireAuth({ children }) {
  const [ready, setReady] = useState(false)
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setLogged(!!data?.session)
      setReady(true)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLogged(!!session)
    })
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  if (!ready) return null // o un spinner
  if (!logged) return <Navigate to="/login" replace />
  return children
}
