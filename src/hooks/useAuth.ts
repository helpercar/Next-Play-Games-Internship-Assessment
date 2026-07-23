import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjusted path to step outside hooks folder

export function useAuth() {
  // State to cache the unique UUID of the logged-in user or guest session
  const [userId, setUserId] = useState<string | null>(null);

  // Guard-rail state preventing the main application board layout from loading until authentication resolves
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      // Check if an active, persistent user session already exists in browser local storage
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session is found, set up a new Guest account
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.user) {
          setUserId(data.user.id);
        } else if (error) {
          console.error("Anonymous authentication failed:", error.message);
        }
      } else {
        // Automatically reuse their existing credentials
        setUserId(session.user.id);
      }
      // Authentication complete, open layout gates by disabling loading spinner thresholds
      setLoading(false);
    }
    initAuth();
  }, []);

  return { userId, loading };
}
