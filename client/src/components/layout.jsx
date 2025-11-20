import { BackgroundParticles } from "@/components/background-particles";

export function Layout({ children }) {
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

      {/* Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}

// Placeholder for the separate file import if not using the index export
import Particles from "./background-particles"; 
// Overwrite the export to use the local component if the import fails in the same file context (mockup mode quirk)
const BackgroundParticlesComponent = Particles;

export { BackgroundParticlesComponent as BackgroundParticles };
