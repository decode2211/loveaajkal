import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema, LoginInput } from '@us-always/shared';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { User } from '@us-always/shared';

const orbs = [
  { x: '10%', y: '20%', size: 300, delay: 0, color: 'rgba(201,169,110,0.04)' },
  { x: '70%', y: '60%', size: 400, delay: 2, color: 'rgba(196,123,123,0.04)' },
  { x: '40%', y: '80%', size: 250, delay: 4, color: 'rgba(201,169,110,0.03)' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
  try {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', data);
    setUser(res.data.user, res.data.accessToken, res.data.refreshToken);
    toast.success(`Welcome back, ${res.data.user.displayName} 💛`);
    navigate('/', { replace: true });
  } catch (err) {
    const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    toast.error(message || 'Invalid credentials');
  }
};

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center relative overflow-hidden">
      {/* Drifting orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{
            duration: 12,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className="relative z-10 w-full max-w-sm mx-4"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Card */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="flex items-center justify-center mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart size={28} className="text-accent-rose fill-accent-rose" />
            </motion.div>
            <h1 className="font-display text-4xl italic text-text-primary mb-2">
              Us, Always
            </h1>
            <p className="text-text-tertiary text-sm">
              Your private space, together
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs text-text-secondary mb-1.5 font-mono">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register('username')}
                  className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-gold transition-colors"
                  placeholder="your username"
                />
                {errors.username && (
                  <p className="text-accent-rose text-xs mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs text-text-secondary mb-1.5 font-mono">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 pr-11 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-gold transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-accent-rose text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full justify-center mt-2"
                size="lg"
              >
                Enter Our Space
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-tertiary text-xs mt-6">
          Private · Just for us
        </p>
      </motion.div>
    </div>
  );
}
