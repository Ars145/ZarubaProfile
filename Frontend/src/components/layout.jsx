import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { User, Users, LogOut, Shield } from "lucide-react";
import BackgroundParticles from "@/components/background-particles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }) {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* Background Grid Effect - Subtle Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]" 
           style={{ 
             backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
             backgroundSize: '60px 60px'
           }} 
      />
      
      {/* Vignette & Gradient Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-radial from-transparent via-background/50 to-background" />
      
      {/* Particle System */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
         <BackgroundParticles />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <span className="text-xl font-bold text-primary hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="link-home">
              ZARUBA
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/profile">
                    <DropdownMenuItem data-testid="menu-profile">
                      <User className="w-4 h-4 mr-2" />
                      Профиль
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/clans">
                    <DropdownMenuItem data-testid="menu-clans">
                      <Users className="w-4 h-4 mr-2" />
                      Кланы
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem data-testid="menu-admin">
                        <Shield className="w-4 h-4 mr-2" />
                        Админ
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}
