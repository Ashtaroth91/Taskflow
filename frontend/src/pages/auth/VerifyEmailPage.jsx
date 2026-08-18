import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { authApi } from '../../api/auth.api.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/ui/Button.jsx';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function doVerify() {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing from URL.');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        if (isMounted) {
          setStatus('success');
          showToast.success('Email verified successfully!');
        }
      } catch (err) {
        if (isMounted) {
          const parsed = parseApiError(err);
          setStatus('error');
          setErrorMessage(parsed.message || 'Invalid or expired verification token.');
        }
      }
    }

    doVerify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="space-y-6 text-center py-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Verifying Email</h2>
          <p className="text-xs text-muted-foreground">
            Please wait while we confirm your email address...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Verification Failed</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {errorMessage}
          </p>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Email Verified!</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your account is now activated and ready for use.
        </p>
      </div>

      <div className="pt-4 border-t border-border">
        <Link to={ROUTES.LOGIN}>
          <Button className="w-full">
            Sign In Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
