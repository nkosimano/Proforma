import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Bot, FileText, RotateCcw, Zap } from 'lucide-react';

interface ModeToggleProps {
  currentMode: 'quotepro' | 'ai-assistant';
  onToggle: (newMode: 'quotepro' | 'ai-assistant') => void;
  isVisible: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ currentMode, onToggle, isVisible }) => {
  const toggleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (toggleRef.current && isVisible) {
      // Initial entrance animation
      gsap.fromTo(toggleRef.current, 
        { 
          scale: 0,
          rotation: -180,
          opacity: 0,
          y: 100
        },
        { 
          scale: 1,
          rotation: 0,
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: 0.5
        }
      );

      // Subtle hover-ready state (no continuous animation)
      gsap.set(toggleRef.current, {
        y: 0
      });
    }
  }, [isVisible]);

  const handleToggle = async () => {
    if (isTransitioning || !containerRef.current || !backgroundRef.current || !toggleRef.current) return;
    
    setIsTransitioning(true);
    const newMode = currentMode === 'quotepro' ? 'ai-assistant' : 'quotepro';
    
    // Create multiple warp rings for hyperlapse effect
    const warpRings: HTMLDivElement[] = [];
    for (let i = 0; i < 8; i++) {
      const ring = document.createElement('div');
      ring.className = `absolute inset-0 rounded-full border-2 ${
        currentMode === 'ai-assistant' 
          ? 'border-purple-400' 
          : 'border-blue-400'
      }`;
      ring.style.opacity = '0';
      toggleRef.current.appendChild(ring);
      warpRings.push(ring);
    }
    
    // Create particle trails
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = `absolute w-1 h-1 rounded-full ${
        currentMode === 'ai-assistant' 
          ? 'bg-purple-300' 
          : 'bg-blue-300'
      }`;
      particle.style.opacity = '0';
      particle.style.left = '50%';
      particle.style.top = '50%';
      toggleRef.current.appendChild(particle);
      particles.push(particle);
    }
    
    // Create screen flash effect
    const screenFlash = document.createElement('div');
    screenFlash.className = 'fixed inset-0 pointer-events-none z-[9999]';
    screenFlash.style.background = currentMode === 'ai-assistant' 
      ? 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(236,72,153,0.2) 50%, transparent 100%)'
      : 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(6,182,212,0.2) 50%, transparent 100%)';
    screenFlash.style.opacity = '0';
    document.body.appendChild(screenFlash);
    
    // Create hyperlapse + zoom effect
    const tl = gsap.timeline({
      onComplete: () => {
        // Clean up all effects
        warpRings.forEach(ring => ring.remove());
        particles.forEach(particle => particle.remove());
        screenFlash.remove();
        onToggle(newMode);
        setIsTransitioning(false);
      }
    });

    // Phase 1: Particle explosion and warp rings
    tl.to(particles, {
      x: (i) => Math.cos(i * 30 * Math.PI / 180) * 200,
      y: (i) => Math.sin(i * 30 * Math.PI / 180) * 200,
      opacity: 1,
      scale: (i) => 1 + i * 0.2,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.02
    })
    .to(warpRings, {
      scale: (i) => 3 + i * 2,
      opacity: (i) => 0.8 - i * 0.1,
      rotation: (i) => 360 + i * 180,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.05
    }, '-=0.4')
    // Phase 2: Screen flash and background hyperlapse explosion
    .to(screenFlash, {
      opacity: 1,
      duration: 0.1,
      ease: 'power2.out'
    }, '-=0.5')
    .to(screenFlash, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    })
    .to(backgroundRef.current, {
      scale: 25,
      rotation: 1080,
      opacity: 0.9,
      duration: 0.5,
      ease: 'power3.in'
    }, '-=0.6')
    // Phase 3: Container zoom out with time distortion
    .to(containerRef.current, {
      scale: 0.05,
      rotation: 720,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in'
    }, '-=0.3')
    // Phase 4: Warp rings and particles collapse
    .to(particles, {
      x: 0,
      y: 0,
      opacity: 0,
      scale: 0,
      duration: 0.3,
      ease: 'power2.in'
    }, '-=0.2')
    .to(warpRings, {
      scale: 0,
      opacity: 0,
      rotation: (i) => -360 - i * 90,
      duration: 0.3,
      ease: 'power2.in'
    }, '-=0.3')
    // Phase 5: Reset positions for zoom back in
    .set(backgroundRef.current, {
      scale: 0.05,
      rotation: 0,
      opacity: 1
    })
    .set(containerRef.current, {
      scale: 0.05,
      rotation: -720,
      opacity: 1
    })
    // Phase 6: Dramatic zoom back in with elastic bounce
    .to(backgroundRef.current, {
      scale: 1,
      rotation: 0,
      opacity: 0.6,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)'
    })
    .to(containerRef.current, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'back.out(2)',
    }, '-=0.4')
    // Phase 7: Final stabilization with smooth settle
     .to([backgroundRef.current, containerRef.current], {
       scale: 1,
       duration: 0.4,
       ease: 'power2.out'
     })
     // Phase 8: Gentle pulse to indicate completion
     .to(containerRef.current, {
       scale: 1.1,
       duration: 0.2,
       ease: 'power2.out'
     })
     .to(containerRef.current, {
       scale: 1,
       duration: 0.3,
       ease: 'power2.out'
     });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div ref={toggleRef} className="relative">
        {/* Background glow effect */}
        <div 
          ref={backgroundRef}
          className={`absolute inset-0 rounded-full blur-xl opacity-60 ${
            currentMode === 'ai-assistant' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}
        />
        
        {/* Main toggle button */}
        <div 
          ref={containerRef}
          onClick={handleToggle}
          className={`relative cursor-pointer w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isTransitioning ? 'pointer-events-none' : ''
          } ${
            currentMode === 'ai-assistant'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/50'
          }`}
        >
          {/* Icon with rotation animation */}
          <div className="relative">
            {currentMode === 'ai-assistant' ? (
              <div className="flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
                <Zap className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
            ) : (
              <FileText className="w-6 h-6 text-white" />
            )}
          </div>
          
          {/* Transition indicator */}
          {isTransitioning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
        </div>
        
        {/* Mode label */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm ${
            currentMode === 'ai-assistant'
              ? 'bg-purple-500/80'
              : 'bg-blue-500/80'
          }`}>
            {currentMode === 'ai-assistant' ? 'AI Q2I' : 'QuotePro'}
          </div>
        </div>
        
        {/* Hover tooltip */}
        <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
            Switch to {currentMode === 'ai-assistant' ? 'QuotePro' : 'AI Assistant'}
          </div>
        </div>
        
        {/* Pulse rings */}
        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
          currentMode === 'ai-assistant'
            ? 'bg-purple-500'
            : 'bg-blue-500'
        }`} style={{ animationDuration: '3s' }} />
        <div className={`absolute inset-2 rounded-full animate-ping opacity-30 ${
          currentMode === 'ai-assistant'
            ? 'bg-purple-400'
            : 'bg-blue-400'
        }`} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
      </div>
    </div>
  );
};