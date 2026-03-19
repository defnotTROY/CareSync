import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    const fetchSessionAndRole = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(session);
          setUser(session?.user || null);

          if (session?.user) {
            await fetchRole(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error in initial session fetch:", error);
        if (mounted) setLoading(false);
      }
    };

    fetchSessionAndRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Only fetch role if we don't have it or if it's a sign-in event
        // This avoids redundant calls if fetchSessionAndRole already did it
        await fetchRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const fetchRole = async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user role:", error);
      } else if (data) {
        setRole(data.role);
      }
    } catch (error) {
      console.error("fetchRole exception", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading }}>
        {loading ? (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        ) : (
            children
        )}
    </AuthContext.Provider>
  );
};
