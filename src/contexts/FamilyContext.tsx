import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface FamilyMember {
  user_id: string
  email: string | null
}

interface FamilyContextType {
  familyId: string | null
  familyCode: string | null
  familyName: string | null
  ownerId: string | null
  isOwner: boolean
  members: FamilyMember[]
  joinFamily: (code: string) => Promise<boolean>
  createFamily: (name: string) => Promise<string>
  leaveFamily: () => Promise<void>
  kickMember: (userId: string) => Promise<void>
}

const FamilyContext = createContext<FamilyContextType | null>(null)

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()

  const [familyId, setFamilyId] = useState<string | null>(null)
  const [familyCode, setFamilyCode] = useState<string | null>(null)
  const [familyName, setFamilyName] = useState<string | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])

  // Prevents clearing state on first render while auth is still loading
  const didInit = useRef(false)

  const isOwner = !!(ownerId && user && ownerId === user.id)

  // Reload family from Supabase whenever the authenticated user changes.
  // This prevents one account from inheriting another account's family via localStorage.
  useEffect(() => {
    if (!user) {
      if (didInit.current) clearFamily()
      return
    }
    didInit.current = true
    loadFamilyForUser(user.id)
  }, [user?.id])

  const clearFamily = () => {
    setFamilyId(null)
    setFamilyCode(null)
    setFamilyName(null)
    setOwnerId(null)
    setMembers([])
    localStorage.removeItem('familyId')
    localStorage.removeItem('familyCode')
    localStorage.removeItem('familyName')
  }

  const loadFamilyForUser = async (userId: string) => {
    const { data: memberRow } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!memberRow?.family_id) {
      clearFamily()
      return
    }

    const { data: family } = await supabase
      .from('families')
      .select('id, name, code, owner_id')
      .eq('id', memberRow.family_id)
      .single()

    if (!family) {
      clearFamily()
      return
    }

    setFamilyId(family.id)
    setFamilyCode(family.code)
    setFamilyName(family.name)
    setOwnerId(family.owner_id)
    localStorage.setItem('familyId', family.id)
    localStorage.setItem('familyCode', family.code)
    localStorage.setItem('familyName', family.name)

    if (family.owner_id === userId) {
      loadMembers(family.id)
    }
  }

  const loadMembers = async (fid: string) => {
    // Try selecting email column; gracefully fall back if it doesn't exist yet
    const { data, error } = await supabase
      .from('family_members')
      .select('user_id, email')
      .eq('family_id', fid)

    if (error) {
      const { data: fallback } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('family_id', fid)
      setMembers(fallback?.map(m => ({ user_id: m.user_id, email: null })) ?? [])
    } else {
      setMembers(data?.map(m => ({ user_id: m.user_id, email: m.email ?? null })) ?? [])
    }
  }

  const createFamily = async (name: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')

    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data, error } = await supabase
      .from('families')
      .insert({ name, code, owner_id: session.user.id })
      .select()
      .single()
    if (error) throw error

    // Try with email column; fall back without if the column doesn't exist yet
    const { error: memErr } = await supabase
      .from('family_members')
      .insert({ family_id: data.id, user_id: session.user.id, email: session.user.email })
    if (memErr) {
      const { error: fallbackErr } = await supabase
        .from('family_members')
        .insert({ family_id: data.id, user_id: session.user.id })
      if (fallbackErr) throw fallbackErr
    }

    setFamilyId(data.id)
    setFamilyCode(data.code)
    setFamilyName(data.name)
    setOwnerId(session.user.id)
    localStorage.setItem('familyId', data.id)
    localStorage.setItem('familyCode', data.code)
    localStorage.setItem('familyName', data.name)
    await loadMembers(data.id)
    return data.code
  }

  const joinFamily = async (code: string): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const { data, error } = await supabase
      .from('families')
      .select()
      .eq('code', code.toUpperCase())
      .single()
    if (error || !data) return false

    const { error: memErr } = await supabase
      .from('family_members')
      .insert({ family_id: data.id, user_id: session.user.id, email: session.user.email })
    if (memErr && !memErr.message.includes('duplicate')) {
      const { error: fallbackErr } = await supabase
        .from('family_members')
        .insert({ family_id: data.id, user_id: session.user.id })
      if (fallbackErr && !fallbackErr.message.includes('duplicate')) return false
    }

    setFamilyId(data.id)
    setFamilyCode(data.code)
    setFamilyName(data.name)
    setOwnerId(data.owner_id)
    localStorage.setItem('familyId', data.id)
    localStorage.setItem('familyCode', data.code)
    localStorage.setItem('familyName', data.name)
    return true
  }

  const leaveFamily = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session && familyId) {
      await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', session.user.id)
    }
    clearFamily()
  }

  const kickMember = async (userId: string) => {
    if (!familyId) return
    await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', userId)
    setMembers(prev => prev.filter(m => m.user_id !== userId))
  }

  return (
    <FamilyContext.Provider value={{
      familyId, familyCode, familyName, ownerId, isOwner, members,
      joinFamily, createFamily, leaveFamily, kickMember,
    }}>
      {children}
    </FamilyContext.Provider>
  )
}

export const useFamily = () => {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider')
  return ctx
}
