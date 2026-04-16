import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RoleSelection from "@/components/RoleSelection";
import LookerProfileForm from "@/components/LookerProfileForm";
import ReferrerDashboard from "@/components/ReferrerDashboard";

type View = "select" | "looker" | "referrer";

const Index = () => {
  const [view, setView] = useState<View>("select");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => setView("select")}
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Refr
          </button>
          <div className="flex items-center gap-6">
            {view !== "select" && (
              <button
                onClick={() => setView("select")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            )}
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <RoleSelection onSelect={setView} />
          </motion.div>
        )}
        {view === "looker" && (
          <motion.div
            key="looker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <LookerProfileForm />
          </motion.div>
        )}
        {view === "referrer" && (
          <motion.div
            key="referrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <ReferrerDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
