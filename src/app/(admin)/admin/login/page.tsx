'use client';

import { useState} from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useApi';
import { Eye, EyeOff, Mail, Phone } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      // console.log('Login result:', result);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      }
      // Do NOT redirect here; let the useEffect handle it
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError((error as Error).message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card p-10 rounded-2xl shadow-lg w-full max-w-md border border-border">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center p-2">
            <Image
              src="/images/ES logo (1).svg"
              alt="ES Rent Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <h1 className="text-2xl font-medium mb-8 text-center text-card-foreground">Admin Login</h1>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-destructive/20">
            <span className="text-destructive">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              required
              disabled={loading}
              className="rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 font-medium transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </Button>
        </form>

        {/* Contact Administrator Section */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-sm text-center text-muted-foreground mb-4">
            Can&apos;t log in? Contact the company administrator
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="mailto:info@esrent.com"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>info@esrent.com</span>
            </a>
            <a
              href="tel:+971553553626"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>+971 55 355 3626</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
