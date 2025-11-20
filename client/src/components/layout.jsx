export function Layout({ children }) {
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

      {/* Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}
