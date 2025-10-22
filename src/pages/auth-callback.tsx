import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Processing auth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Hash params:', window.location.hash);
        
        // Exchange the code/token from URL for a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          toast({
            title: "Authentication Failed",
            description: error.message || "Failed to complete authentication",
            variant: "destructive",
          });
          setTimeout(() => setLocation('/login'), 2000);
          return;
        }

        if (session) {
          console.log('✅ Session established:', session.user.email);
          toast({
            title: "Welcome! 🎉",
            description: `Successfully signed in as ${session.user.email}`,
          });
          
          // Small delay to ensure state updates
          setTimeout(() => setLocation('/'), 500);
        } else {
          console.log('⚠️ No session found, redirecting to login');
          setTimeout(() => setLocation('/login'), 1000);
        }
      } catch (error: any) {
        console.error('❌ Auth callback exception:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "An error occurred during authentication.",
          variant: "destructive",
        });
        setTimeout(() => setLocation('/login'), 2000);
      }
    };

    handleAuthCallback();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;