"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, BookOpen } from "lucide-react";
import { useScrollAnimation } from "./hooks";
import { DomainShowcase } from "./domain-showcase";
import { DemoModal } from "./demo-modal";

export const HeroSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [demoModal, setDemoModal] = React.useState<{
    open: boolean;
    type: "admin" | "wallet";
  }>({ open: false, type: "admin" });

  return (
    <section className='relative pt-16 pb-8 sm:pt-28 sm:pb-16 overflow-hidden'>
      <div
        ref={ref}
        className='max-w-5xl mx-auto px-4 text-center relative z-10'
      >
        {/* Open-source badge */}
        <div
          className={`flex justify-center mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <a
            href='https://github.com/lawalletio/lawallet-nwc'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-lw-gold/20 text-lw-gold/70 bg-lw-gold/5 hover:bg-lw-gold/10 hover:text-lw-gold transition-colors'
          >
            <Github className='h-3 w-3' />
            Open source
          </a>
        </div>

        {/* Main headline */}
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.9] transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <span className='block pb-3 sm:pb-4 bg-gradient-to-r from-[#0EA5E9] via-[#00a085] to-[#00836d] bg-clip-text text-transparent'>
            Lightning addresses
          </span>
          <span className='block text-white'>for everyone.</span>
        </h1>

        {/* Subheadline */}
        <p
          className={`mt-8 max-w-2xl mx-auto text-lg sm:text-xl text-white/50 leading-relaxed font-light transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className='font-medium bg-gradient-to-r from-lightning_blue to-[#7dd3fc] bg-clip-text text-transparent'>
            Lightning
          </span>{" "}
          +{" "}
          <span className='font-medium bg-gradient-to-r from-nwc-purple to-violet-400 bg-clip-text text-transparent'>
            NOSTR
          </span>{" "}
          CRM for brands
        </p>

        {/* Animated domain example */}
        <DomainShowcase isVisible={isVisible} />

        {/* CTA Buttons */}
        <div
          className={`mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Button
            size='lg'
            className='group px-8 py-5 rounded-full bg-lw-gold hover:bg-lw-gold/90 text-black font-semibold transition-all duration-300 shadow-lg shadow-lw-gold/20 hover:shadow-lw-gold/30 hover:scale-105'
            onClick={() =>
              setDemoModal({ open: true, type: "admin" })
            }
          >
            Connect your domain
            <ArrowRight className='ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
          </Button>
          <Button
            asChild
            variant='outline'
            size='lg'
            className='px-8 py-5 rounded-full bg-transparent border-white/[0.12] text-white hover:bg-white/[0.05] hover:text-lw-gold hover:border-lw-gold/30 font-semibold transition-all duration-300'
          >
            <a href='#deploy'>
              <BookOpen className='mr-2 h-4 w-4' />
              Deploy
            </a>
          </Button>
        </div>

        <DemoModal
          open={demoModal.open}
          onOpenChange={(open) => setDemoModal((prev) => ({ ...prev, open }))}
          demoType={demoModal.type}
        />
      </div>
    </section>
  );
};
