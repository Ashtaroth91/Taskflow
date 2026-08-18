import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/auth.api.js';
import { registerSchema } from '../../schemas/auth.schema.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values) => {
      return await authApi.register({
        username: values.username.trim().toLowerCase(),
        email: values.email.trim(),
        password: values.password,
      });
    },
    onSuccess: (_, variables) => {
      showToast.success('Account created successfully!');
      setRegisteredEmail(variables.email);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);

      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          if (['username', 'email', 'password'].includes(field)) {
            setError(field, { type: 'server', message: msg });
          }
        });
      }
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    registerMutation.mutate(data);
  };

  // Render registration success state
  if (registeredEmail) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Account Created!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your account <span className="font-semibold text-foreground">{registeredEmail}</span> has been created successfully. You can now sign in immediately.
          </p>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <Link to={ROUTES.LOGIN}>
            <Button className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Create Account</h2>
        <p className="text-xs text-muted-foreground">
          Join TaskFlow to start collaborating on projects
        </p>
      </div>

      {apiError && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">{apiError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Username */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('username')}
              placeholder="at least 5 characters"
              className="pl-9 text-xs"
              error={errors.username?.message}
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="at least 8 characters"
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

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="re-enter password"
              className="pl-9 text-xs"
              error={errors.confirmPassword?.message}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={registerMutation.isPending}
        >
          Create Account
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
