import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/auth.api.js';
import { forgotPasswordSchema } from '../../schemas/auth.schema.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const forgotMutation = useMutation({
    mutationFn: async (values) => {
      return await authApi.forgotPassword({ email: values.email.trim() });
    },
    onSuccess: (_, variables) => {
      showToast.success('Password reset instructions sent!');
      setSubmittedEmail(variables.email);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    forgotMutation.mutate(data);
  };

  if (submittedEmail) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Check Your Inbox</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If an account exists for <span className="font-semibold text-foreground">{submittedEmail}</span>, you will receive an email with instructions to reset your password.
          </p>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Forgot Password</h2>
        <p className="text-xs text-muted-foreground">
          Enter your email address and we'll send you a password reset link
        </p>
      </div>

      {apiError && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">{apiError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('email')}
              type="email"
              placeholder="name@company.com"
              className="pl-9 text-xs"
              error={errors.email?.message}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={forgotMutation.isPending}
        >
          Send Reset Instructions
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline inline-flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
