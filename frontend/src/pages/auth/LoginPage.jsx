import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { loginSchema } from '../../schemas/auth.schema.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const isEmail = values.identifier.includes('@');
      const credentials = {
        password: values.password,
        ...(isEmail
          ? { email: values.identifier.trim() }
          : { username: values.identifier.trim().toLowerCase() }),
      };
      return await login(credentials);
    },
    onSuccess: () => {
      showToast.success('Welcome back! Successfully logged in.');
      navigate(ROUTES.APP);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);

      // Map backend field errors to form inputs
      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          if (field === 'email' || field === 'username') {
            setError('identifier', { type: 'server', message: msg });
          } else if (field === 'password') {
            setError('password', { type: 'server', message: msg });
          }
        });
      }
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Sign In</h2>
        <p className="text-xs text-muted-foreground">
          Enter your credentials to access your workspaces
        </p>
      </div>

      {/* Global API Error Alert */}
      {apiError && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">{apiError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email or Username input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Email or Username</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('identifier')}
              placeholder="name@company.com or username"
              className="pl-9 text-xs"
              error={errors.identifier?.message}
            />
          </div>
        </div>

        {/* Password input with toggle */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-9 pr-10 text-xs"
              error={errors.password?.message}
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

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={loginMutation.isPending}
        >
          Sign In
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      {/* Navigation to Register */}
      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
