import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  CalendarDays,
  Bot,
  Settings,
  MenuIcon,
  XIcon,
  TrendingUpIcon,
  LogOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transações", href: "/transacoes", icon: ArrowLeftRight },
  { name: "Dívidas", href: "/dividas", icon: CreditCard },
  { name: "Calendário", href: "/calendario", icon: CalendarDays },
  { name: "Assistente IA", href: "/assistente", icon: Bot },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
  { name: "Projeção", href: "/projecao", icon: TrendingUpIcon },
];

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobile = () => setIsMobileOpen(false);

  const getUserPhoto = () => {
    if (!user?.photoUrl) return null;
    if (user.photoUrl.startsWith("http")) return user.photoUrl;
    return `http://localhost:3001${user.photoUrl}`;
  };

  const photoUrl = getUserPhoto();

  return (
    <>
      {/* Mobile: botão hamburguer */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-primary p-2 text-primary-foreground shadow-lg md:hidden"
        aria-label="Abrir menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card shadow-xl transition-transform duration-300 md:static md:w-64 md:translate-x-0 md:shadow-none md:border-r",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between gap-2 border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <TrendingUpIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">FinIA</span>
              <p className="text-[10px] text-muted-foreground">Assistente Financeiro</p>
            </div>
          </div>
          <button onClick={closeMobile} className="rounded p-1 hover:bg-muted md:hidden">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={closeMobile}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-150",
                      isActive ? "" : "group-hover:scale-110"
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer com usuário e logout */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold overflow-hidden shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={user?.name || "Usuário"}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOutIcon className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}