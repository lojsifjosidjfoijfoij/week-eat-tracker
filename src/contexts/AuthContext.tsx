import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Parses a deep-link URL from Supabase email confirmation and establishes
// the session. Handles both the hash-fragment (implicit) and query-param
// (PKCE) token formats that Supabase may use.
async function handleDeepLinkUrl(url: string) {
  if (!url.includes('login-callback')) return

  // Hash fragment: dinrr://login-callback#access_token=...&refresh_token=...
  const hashIdx = url.indexOf('#')
  if (hashIdx !== -1) {
    const params = new URLSearchParams(url.slice(hashIdx + 1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      if (error) console.error('Deep link setSession error:', error)
      return
    }
  }

  // Query params: dinrr://login-callback?code=... (PKCE exchange)
  const queryIdx = url.indexOf('?')
  if (queryIdx !== -1) {
    const params = new URLSearchParams(url.slice(queryIdx + 1))
    const code = params.get('code')
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) console.error('Deep link exchangeCodeForSession error:', error)
    }
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Deep-link handler for email confirmation on native (iOS)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    // Cold start: app launched directly from the confirmation link
    App.getLaunchUrl().then((result) => {
      if (result?.url) handleDeepLinkUrl(result.url)
    })

    // Warm start: app was in the background and resumed via the link
    let removeListener: (() => void) | undefined
    App.addListener('appUrlOpen', (event) => {
      handleDeepLinkUrl(event.url)
    }).then((handle) => {
      removeListener = () => handle.remove()
    })

    return () => { removeListener?.() }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: 'dinrr://login-callback' },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Deletes the authenticated user's account via a Supabase Edge Function.
  // Deploy: supabase/functions/delete-account/index.ts using supabase.auth.admin.deleteUser()
  const deleteAccount = async () => {
    const { error } = await supabase.functions.invoke('delete-account')
    if (!error) await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
