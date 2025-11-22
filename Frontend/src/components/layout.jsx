import BackgroundParticles from "@/components/background-particles";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }) {
  const { user, logout } = useAuth();
  
  const getDiscordAvatarUrl = () => {
    if (!user?.discordId) return null;
    
    const discordId = user.discordId;
    const avatarHash = user.discordAvatar;
    
    if (avatarHash) {
      const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${extension}?size=128`;
    }
    
    const defaultAvatarNum = (parseInt(discordId) >> 22) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNum}.png`;
  };

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      logout();
    }
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

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold font-display text-primary">ZARUBA</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {user?.discordId && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20">
                <Avatar className="w-6 h-6 border border-white/10">
                  <AvatarImage src={getDiscordAvatarUrl()} alt={user.discordUsername} />
                  <AvatarFallback className="bg-[#5865F2] text-white text-xs">
                    {user.discordUsername?.slice(0, 2).toUpperCase() || 'DC'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[#5865F2]">{user.discordUsername}</span>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-settings">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive" data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
