import { create } from 'zustand'
import { createClient } from './supabase/client'
import { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  display_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  
  setAuth: (user: User | null, profile: Profile | null) => void
  setLoading: (isLoading: boolean) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setAuth: (user, profile) => set({ user, profile, isLoading: false, isInitialized: true }),
  
  setLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    if (get().isInitialized) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      set({ user, profile, isLoading: false, isInitialized: true })
    } else {
      set({ user: null, profile: null, isLoading: false, isInitialized: true })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = session?.user || null
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          set({ user, profile, isLoading: false })
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, isLoading: false })
      }
    })
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  }
}))
