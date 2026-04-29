import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"looker" | "referrer">("looker");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(role === "looker" ? "/looker-dashboard" : "/dashboard");
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

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                {(["looker", "referrer"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-3 py-1 rounded-full capitalize transition-colors ${
                      role === r ? "bg-background text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button type="button" className="text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Log in
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
