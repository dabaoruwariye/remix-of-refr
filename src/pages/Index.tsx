import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import RoleSelection from "@/components/RoleSelection";
import LookerProfileForm from "@/components/LookerProfileForm";
import ReferrerDashboard from "@/components/ReferrerDashboard";

type View = "select" | "looker" | "referrer";

const Index = () => {
  const [view, setView] = useState<View>("select");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex h-12 items-center justify-between">
          <button
            onClick={() => setView("select")}
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Refr
          </button>
          <div className="flex items-center gap-6">
            {view !== "select" && (
              <button
                onClick={() => setView("select")}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            )}
            <Link
              to="/login"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-12">
        <AnimatePresence mode="wait">
          {view === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <RoleSelection onSelect={setView} />
            </motion.div>
          )}
          {view === "looker" && (
            <motion.div
              key="looker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LookerProfileForm />
            </motion.div>
          )}
          {view === "referrer" && (
            <motion.div
              key="referrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ReferrerDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
