import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Immediate Safety Timeout
    // This GUARANTEES the loading screen disappears after 2 seconds
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2000);

    async function getInitialAuth() {
      try {
        // Get session without waiting for internal locks
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);

          // Fetch role but don't 'await' it if it's slow
          supabase
            .from('profiles')
            .select('role')
            .eq('id', initialSession.user.id)
            .single()
            .then(({ data }) => {
              if (mounted) setRole(data?.role || 'client');
            });
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    }

    getInitialAuth();

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (!currentSession) {
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, role, loading }}>
      {/* If it's still loading after 2 seconds, the timer above will flip this */}
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-4"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);