import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl safe-area-bottom ${isDark ? "border-[#2de2c2]/15 bg-[#07110b]/90 shadow-[0_-18px_45px_rgba(0,0,0,.45)]" : "border-emerald-900/10 bg-white/90 shadow-[0_-18px_35px_rgba(15,23,42,.08)]"}`}>
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
                  className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${isDark ? "bg-[#2de2c2]/15" : "bg-emerald-100"}`}
                  aria-hidden
                />
              )}
              <Icon
                size={22}
                className={`relative z-10 ${isActive ? (isDark ? "text-[#80ffe7]" : "text-emerald-700") : (isDark ? "text-gray-400" : "text-slate-500")}`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium ${
                  isActive ? (isDark ? "text-[#80ffe7]" : "text-emerald-700") : (isDark ? "text-gray-400" : "text-slate-500")
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
