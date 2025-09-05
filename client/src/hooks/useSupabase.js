import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useSession(){
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(()=>{
    console.log('useSession - Getting initial session...')
    setLoading(true)
    
    supabase.auth.getSession().then(({data})=> {
      console.log('useSession - Initial session:', data.session)
      setSession(data.session)
      setLoading(false)
    })
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      console.log('useSession - Auth state changed:', _event, s)
      setSession(s)
      setLoading(false)
    })
    
    return () => listener.subscription.unsubscribe()
  },[])
  
  console.log('useSession - Current session state:', session, 'Loading:', loading)
  return { session, loading }
}