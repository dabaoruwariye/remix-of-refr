import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const userType = await login(email, password);
      navigate(userType === "referrer" ? "/dashboard" : "/looker-dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex h-12 items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
            Refr
          </Link>
          <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Create account
          </Link>
        </div>
      </header>

      <main className="pt-12 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Log in to your Refr account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 bg-card border-border/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 bg-card border-border/60"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end text-xs">
              <button type="button" className="text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/" className="text-foreground hover:underline">
              Get started
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
