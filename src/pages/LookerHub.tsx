import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Activity, Users } from "lucide-react";
import LookerProfileTab from "@/components/looker/LookerProfileTab";
import LookerActivityTab from "@/components/looker/LookerActivityTab";
import LookerNetworkTab from "@/components/looker/LookerNetworkTab";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "activity", label: "Referral Activity", icon: Activity },
  { id: "network", label: "Network", icon: Users },
] as const;

type TabId = (typeof TABS)[number]["id"];

const LookerHub = () => {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex h-12 items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-foreground">Refr</span>
          <div className="flex items-center gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="looker-tab-bg"
                      className="absolute inset-0 bg-muted rounded-full -z-10"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => logout().then(() => navigate("/login"))}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="pt-20 pb-16 container max-w-3xl">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "profile" && <LookerProfileTab />}
          {activeTab === "activity" && <LookerActivityTab onGoToNetwork={() => setActiveTab("network")} />}
          {activeTab === "network" && <LookerNetworkTab />}
        </motion.div>
      </main>
    </div>
  );
};

export default LookerHub;