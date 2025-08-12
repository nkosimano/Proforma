import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Bot, FileText, Sparkles, Zap } from 'lucide-react';

interface SystemSelectionModalProps {
  isOpen: boolean;
  onSelectQuotePro: () => void;
  onSelectAIAssistant: () => void;
}

export const SystemSelectionModal: React.FC<SystemSelectionModalProps> = ({
  isOpen,
  onSelectQuotePro,
  onSelectAIAssistant,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const quoteProRef = useRef<HTMLDivElement>(null);
  const aiAssistantRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'quotepro' | 'ai-assistant' | null>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Initial setup
      gsap.set([quoteProRef.current, aiAssistantRef.current], {
        scale: 0.8,
        opacity: 0,
        y: 50,
      });
      gsap.set([titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: -30,
      });
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { scale: 0.9, opacity: 0 });

      // Animation timeline
      const tl = gsap.timeline();
      
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(modalRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      }, '-=0.1')
      .to([titleRef.current, subtitleRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.2')
      .to([quoteProRef.current, aiAssistantRef.current], {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'back.out(1.7)',
      }, '-=0.3');

      // Subtle idle animation for cards
      gsap.to([quoteProRef.current, aiAssistantRef.current], {
        scale: 1.02,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        stagger: 0.8,
      });
    }
  }, [isOpen]);

  const handleCardHover = (ref: React.RefObject<HTMLDivElement>, isEntering: boolean) => {
    if (ref.current && !isTransitioning) {
      gsap.to(ref.current, {
        scale: isEntering ? 1.05 : 1,
        rotationY: isEntering ? 5 : 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handlePortalTransition = (mode: 'quotepro' | 'ai-assistant', callback: () => void) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSelectedMode(mode);
    
    const selectedCard = mode === 'quotepro' ? quoteProRef.current : aiAssistantRef.current;
    const otherCard = mode === 'quotepro' ? aiAssistantRef.current : quoteProRef.current;
    
    if (!selectedCard || !portalRef.current) return;
    
    // Create portal effect
    const tl = gsap.timeline({
      onComplete: () => {
        callback();
        setIsTransitioning(false);
      }
    });
    
    // Phase 1: Fade out other elements
    tl.to([titleRef.current, subtitleRef.current, otherCard], {
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: 'power2.in'
    })
    // Phase 2: Selected card grows and transforms into portal
    .to(selectedCard, {
      scale: 3,
      z: 100,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2')
    // Phase 3: Portal expands to full screen
    .to(portalRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    })
    // Phase 4: Portal zoom effect
    .to(portalRef.current, {
      scale: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in'
    })
    // Phase 5: Fade out entire modal
    .to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    }, '-=0.3');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 max-w-4xl w-full shadow-2xl border border-purple-500/20"
      >
        <div className="text-center mb-8">
          <h1
            ref={titleRef}
            className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Choose Your Experience
          </h1>
          <p
            ref={subtitleRef}
            className="text-gray-300 text-lg"
          >
            Select how you'd like to manage your quotes and invoices
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QuotePro Card */}
          <div
            ref={quoteProRef}
            className="relative group cursor-pointer"
            onMouseEnter={() => handleCardHover(quoteProRef, true)}
            onMouseLeave={() => handleCardHover(quoteProRef, false)}
            onClick={() => handlePortalTransition('quotepro', onSelectQuotePro)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-slate-800 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-xl mb-4 mx-auto">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-3">
                QuotePro
              </h3>
              <p className="text-gray-300 text-center mb-6">
                Traditional quote and invoice management with full control over every detail
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Manual quote creation
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Complete customization
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Advanced reporting
                </div>
              </div>
            </div>
          </div>

          {/* AI Q2I Assistant Card */}
          <div
            ref={aiAssistantRef}
            className="relative group cursor-pointer"
            onMouseEnter={() => handleCardHover(aiAssistantRef, true)}
            onMouseLeave={() => handleCardHover(aiAssistantRef, false)}
            onClick={() => handlePortalTransition('ai-assistant', onSelectAIAssistant)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-slate-800 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-xl mb-4 mx-auto relative">
                <Bot className="w-8 h-8 text-purple-400" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-3">
                AI Q2I Assistant
              </h3>
              <p className="text-gray-300 text-center mb-6">
                Intelligent assistant that guides you through quote and invoice creation
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  AI-guided workflow
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Smart price suggestions
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Automated client management
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            You can always switch between modes in your settings
          </p>
        </div>
      </div>
      
      {/* Portal Effect */}
      <div
        ref={portalRef}
        className={`fixed inset-0 pointer-events-none z-[60] flex items-center justify-center ${
          selectedMode === 'quotepro' 
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500'
        }`}
        style={{
          opacity: 0,
          scale: 0,
          borderRadius: '50%',
          transformOrigin: 'center'
        }}
      >
        <div className="text-white text-center">
          {selectedMode === 'quotepro' ? (
            <div>
              <FileText className="w-24 h-24 mx-auto mb-4" />
              <h2 className="text-4xl font-bold">QuotePro</h2>
              <p className="text-xl mt-2">Loading traditional mode...</p>
            </div>
          ) : (
            <div>
              <Bot className="w-24 h-24 mx-auto mb-4" />
              <h2 className="text-4xl font-bold">AI Q2I Assistant</h2>
              <p className="text-xl mt-2">Initializing AI mode...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};