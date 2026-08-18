import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, ShieldCheck, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/auth.api.js';
import { changePasswordSchema } from '../../schemas/account.schema.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate, getInitials } from '../../utils/formatters.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Breadcrumbs } from '../../components/common/Breadcrumbs.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export default function AccountPage() {
  const { user } = useAuth();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values) => {
      return await authApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
    },
    onSuccess: () => {
      showToast.success('Password changed successfully!');
      reset();
      setApiError(null);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);

      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          if (['oldPassword', 'newPassword'].includes(field)) {
            setError(field, { type: 'server', message: msg });
          }
        });
      }
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <PageHeader
        title="Account & Security"
        description="Manage your profile settings, security credentials, and authentication preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-border/70 shadow-sm h-fit">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-2 border-2 border-primary/20">
              {getInitials(user?.username || user?.email)}
            </div>
            <CardTitle className="text-lg font-bold">{user?.username}</CardTitle>
            <CardDescription className="text-xs font-mono">{user?.email}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Username
              </span>
              <span className="font-semibold text-foreground">{user?.username}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </span>
              <span className="font-semibold text-foreground font-mono text-[11px]">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Account Status
              </span>
              <Badge variant="success" className="text-[10px]">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security & Password Change */}
        <Card className="lg:col-span-2 border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Change Password</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Update your account password to maintain maximum security.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {apiError && (
              <div className="mb-4 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Current Password *</label>
                <div className="relative">
                  <Input
                    {...register('oldPassword')}
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    className="pr-10 text-xs"
                    error={errors.oldPassword?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">New Password *</label>
                <div className="relative">
                  <Input
                    {...register('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    className="pr-10 text-xs"
                    error={errors.newPassword?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Confirm New Password *</label>
                <Input
                  {...register('confirmNewPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className="text-xs"
                  error={errors.confirmNewPassword?.message}
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="mt-2"
                isLoading={changePasswordMutation.isPending}
              >
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
