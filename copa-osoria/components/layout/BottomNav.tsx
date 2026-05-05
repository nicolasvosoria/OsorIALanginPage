import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, BarChart3, CalendarDays, User, Users } from "lucide-react";

const navItems = [
  { path: "/predicciones", label: "Predicciones", icon: CalendarDays },
  { path: "/resumen", label: "Resumen", icon: BarChart3 },
  { path: "/ranking", label: "Ranking", icon: Trophy },
  { path: "/grupos", label: "Grupos", icon: Users },
  { path: "/perfil", label: "Perfil", icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl gradient-primary opacity-10 transition-opacity duration-200"
                  aria-hidden
                />
              )}
              <Icon
                size={22}
                className={`relative z-10 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
