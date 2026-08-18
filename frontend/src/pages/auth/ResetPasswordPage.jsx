import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/auth.api.js';
import { resetPasswordSchema } from '../../schemas/auth.schema.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (values) => {
      return await authApi.resetPassword(token, {
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
    },
    onSuccess: () => {
      showToast.success('Password successfully reset!');
      setIsSuccess(true);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);

      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          if (field === 'newPassword') {
            setError('newPassword', { type: 'server', message: msg });
          } else if (field === 'confirmNewPassword') {
            setError('confirmNewPassword', { type: 'server', message: msg });
          }
        });
      }
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    resetMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Password Reset Complete</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <Link to={ROUTES.LOGIN}>
            <Button className="w-full">
              Sign In to Your Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Set New Password</h2>
        <p className="text-xs text-muted-foreground">
          Enter your new password below to update your security credentials
        </p>
      </div>

      {apiError && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">{apiError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('newPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="at least 8 characters"
              className="pl-9 pr-10 text-xs"
              error={errors.newPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('confirmNewPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="re-enter new password"
              className="pl-9 text-xs"
              error={errors.confirmNewPassword?.message}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={resetMutation.isPending}
        >
          Reset Password
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
