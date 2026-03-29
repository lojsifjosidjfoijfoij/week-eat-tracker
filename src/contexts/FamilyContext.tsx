import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface FamilyContextType {
  familyId: string | null
  familyCode: string | null
  familyName: string | null
  joinFamily: (code: string) => Promise<boolean>
  createFamily: (name: string) => Promise<string>
  leaveFamily: () => void
}

const FamilyContext = createContext<FamilyContextType | null>(null)

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const [familyId, setFamilyId] = useState<string | null>(
    localStorage.getItem('familyId')
  )
  const [familyCode, setFamilyCode] = useState<string | null>(
    localStorage.getItem('familyCode')
  )
  const [familyName, setFamilyName] = useState<string | null>(
    localStorage.getItem('familyName')
  )

  const createFamily = async (name: string): Promise<string> => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data, error } = await supabase
      .from('families')
      .insert({ name, code })
      .select()
      .single()
    if (error) throw error
    setFamilyId(data.id)
    setFamilyCode(data.code)
    setFamilyName(data.name)
    localStorage.setItem('familyId', data.id)
    localStorage.setItem('familyCode', data.code)
    localStorage.setItem('familyName', data.name)
    return data.code
  }

  const joinFamily = async (code: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('families')
      .select()
      .eq('code', code.toUpperCase())
      .single()
    if (error || !data) return false
    setFamilyId(data.id)
    setFamilyCode(data.code)
    setFamilyName(data.name)
    localStorage.setItem('familyId', data.id)
    localStorage.setItem('familyCode', data.code)
    localStorage.setItem('familyName', data.name)
    return true
  }

  const leaveFamily = () => {
    setFamilyId(null)
    setFamilyCode(null)
    setFamilyName(null)
    localStorage.removeItem('familyId')
    localStorage.removeItem('familyCode')
    localStorage.removeItem('familyName')
  }

  return (
    <FamilyContext.Provider value={{ familyId, familyCode, familyName, joinFamily, createFamily, leaveFamily }}>
      {children}
    </FamilyContext.Provider>
  )
}

export const useFamily = () => {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider')
  return ctx
}