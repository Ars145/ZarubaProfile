import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Menu, X, Gamepad2, Users, Shield, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import logo from "@assets/zaruba_logo_1763633752495.png";

export function Layout({ children }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Главная", href: "/" },
    { label: "Профиль", href: "/profile" },
    { label: "Кланы", href: "/clans" },
    { label: "Правила", href: "/rules" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ 
             backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} 
      />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-background via-transparent to-background" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-3 group cursor-pointer">
              <img src={logo} alt="Zaruba Logo" className="h-12 w-auto transition-transform group-hover:scale-105" />
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold leading-none tracking-tighter text-primary">ZARUBA</h1>
                <p className="text-xs text-muted-foreground tracking-[0.2em] font-bold">SERVER</p>
              </div>
            </a>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={`text-sm font-medium tracking-wider transition-colors hover:text-primary relative py-2
                  ${location === item.href ? "text-primary" : "text-muted-foreground"}
                `}>
                  {item.label}
                  {location === item.href && (
                    <motion.div 
                      layoutId="nav-underline" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary box-shadow-[0_0_10px_rgba(255,102,0,0.5)]"
                    />
                  )}
                </a>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
             <Dialog>
               <DialogTrigger asChild>
                 <Button variant="outline" className="border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50 text-muted-foreground font-display tracking-wide">
                    <LogIn className="w-4 h-4 mr-2" />
                    Войти
                 </Button>
               </DialogTrigger>
               <DialogContent className="bg-zinc-950 border-white/10">
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-display text-center">АВТОРИЗАЦИЯ</DialogTitle>
                   <DialogDescription className="text-center">
                     Войдите через Steam чтобы получить доступ к профилю и статистике.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="flex flex-col gap-4 py-6">
                   <Button className="w-full h-12 bg-[#171a21] hover:bg-[#2a303d] text-white font-bold flex items-center justify-center gap-3 border border-white/10">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" className="w-6 h-6" />
                     Войти через STEAM
                   </Button>
                   <p className="text-xs text-center text-muted-foreground">
                     Мы не получаем доступ к вашему паролю. <br/>Только публичная информация профиля.
                   </p>
                 </div>
               </DialogContent>
             </Dialog>
             
             <Button className="bg-primary text-black font-bold hover:bg-primary/90 font-display tracking-wide shadow-[0_0_15px_rgba(255,102,0,0.3)]">
                ИГРАТЬ
             </Button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden fixed inset-0 top-20 z-40 bg-background border-t border-white/5 p-4 flex flex-col gap-4"
        >
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a 
                className={`text-lg font-medium p-4 border border-white/5 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all
                  ${location === item.href ? "border-primary/50 text-primary bg-primary/5" : "text-muted-foreground"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            </Link>
          ))}
          <Button className="w-full bg-primary text-black font-bold mt-4 font-display">ИГРАТЬ</Button>
        </motion.div>
      )}

      {/* Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
             <img src={logo} alt="Zaruba Logo" className="h-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-500" />
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 ZARUBA SERVER. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
