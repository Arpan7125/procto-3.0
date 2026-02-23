import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('OAuth authentication failed. Please try again.');
      setTimeout(() => navigate('/student/login'), 3000);
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Navigate to role-specific dashboard
        const dashboardPath =
          user.role === 'FACULTY' ? '/faculty' :
          user.role === 'ADMIN' ? '/admin' : '/student';

        navigate(dashboardPath, { replace: true });
      } catch {
        setError('Failed to process authentication data.');
        setTimeout(() => navigate('/student/login'), 3000);
      }
    } else {
      setError('No authentication data received.');
      setTimeout(() => navigate('/student/login'), 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 font-semibold">{error}</p>
            <p className="text-slate-500 text-sm mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-semibold">Authenticating...</p>
            <p className="text-slate-600 text-sm mt-2">Please wait while we sign you in</p>
          </>
        )}
      </div>
    </div>
  );
}
