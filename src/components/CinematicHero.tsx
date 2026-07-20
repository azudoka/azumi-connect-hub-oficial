import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }
  .film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>');
  }
  .ch-grid {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, rgba(127,168,232,0.08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(127,168,232,0.08) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }
  .ch-card {
    background: linear-gradient(145deg, #264478 0%, #14233F 100%);
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.9),
      0 20px 40px -20px rgba(0,0,0,0.8),
      inset 0 1px 2px rgba(255,255,255,0.15),
      inset 0 -2px 4px rgba(0,0,0,0.8);
    border: 1px solid rgba(255,255,255,0.06);
    position: relative;
  }
  .ch-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(127,168,232,0.08) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }
  .ch-text-silver {
    background: linear-gradient(180deg, #FFFFFF 0%, #8BA8D4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter: drop-shadow(0px 8px 20px rgba(0,0,0,0.7)) drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
  }
  .ch-text-outer {
    color: #ffffff;
    text-shadow: 0 10px 30px rgba(61,99,184,0.4), 0 2px 4px rgba(0,0,0,0.3);
  }
  .ch-badge {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.2);
  }
  .ch-btn-primary {
    background: linear-gradient(180deg, #4A7BD4 0%, #3D63B8 100%);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 4px 12px rgba(61,99,184,0.4), 0 12px 24px -4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2);
    transition: all 0.3s cubic-bezier(0.25,1,0.5,1);
    color: white; font-weight: 600; border-radius: 12px;
  }
  .ch-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 8px 20px rgba(61,99,184,0.5), 0 20px 32px -6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25); }
  .ch-btn-secondary {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.18);
    backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
    transition: all 0.3s cubic-bezier(0.25,1,0.5,1);
    color: rgba(255,255,255,0.85); font-weight: 500; border-radius: 12px;
  }
  .ch-btn-secondary:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }
  /* Browser mockup */
  .ch-browser {
    background: #0a1628;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .ch-browser-bar {
    background: #1a2d4a;
    height: 34px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 6px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .ch-dot { width: 10px; height: 10px; border-radius: 50%; }
`;

export interface CinematicHeroProps {
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  ctaHeading?: string;
  ctaDescription?: string;
  screenshotSrc?: string;
  onCTAPrimary?: () => void;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  className?: string;
}

export function CinematicHero({
  tagline1 = "O legado dos seus clientes",
  tagline2 = "na palma de suas mãos",
  cardHeading = "Accountability, redefined.",
  cardDescription,
  ctaHeading = "Quer que a Azumi cuide do seu RH?",
  ctaDescription = "Fale direto com a equipe — sem fila, sem SDR.",
  screenshotSrc = "/screenshots/tela-01.png",
  ctaPrimaryLabel = "Falar com a equipe",
  ctaPrimaryHref = "#",
  ctaSecondaryLabel = "Conhecer a Azumi RH",
  ctaSecondaryHref = "https://azumirh.com.br",
  onCTAPrimary,
  className,
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Mouse parallax on card
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to(mockupRef.current, { rotationY: xVal * 8, rotationX: -yVal * 8, ease: "power3.out", duration: 1.2 });
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => { window.removeEventListener("mousemove", handleMouseMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  // Cinematic scroll timeline
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(".ch-tag1", { autoAlpha: 0, x: 80, filter: "blur(12px)" });
      gsap.set(".ch-tag2", { autoAlpha: 0, x: -80, filter: "blur(12px)" });
      gsap.set(".ch-main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".ch-card-left", ".ch-card-right", ".ch-mockup", ".ch-badge"], { autoAlpha: 0 });
      gsap.set(".ch-cta-wrapper", { autoAlpha: 0, scale: 0.85, filter: "blur(20px)" });

      // Intro animation
      const introTl = gsap.timeline({ delay: 0.4 });
      introTl
        .to(".ch-tag1", { duration: 1.4, autoAlpha: 1, x: 0, filter: "blur(0px)", ease: "expo.out" })
        .to(".ch-tag2", { duration: 1.4, autoAlpha: 1, x: 0, filter: "blur(0px)", ease: "expo.out" }, "-=1.0");

      // Scroll timeline
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=6000",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to([".ch-hero-text", ".ch-grid"], { scale: 1.1, filter: "blur(16px)", opacity: 0.15, ease: "power2.inOut", duration: 2 }, 0)
        .to(".ch-main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".ch-main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".ch-mockup",
          { y: 200, z: -400, rotationX: 30, autoAlpha: 0, scale: 0.75 },
          { y: 0, z: 0, rotationX: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
        )
        .fromTo(".ch-badge", { y: 60, autoAlpha: 0, scale: 0.8 }, { y: 0, autoAlpha: 1, scale: 1, ease: "back.out(1.4)", duration: 1.2, stagger: 0.18 }, "-=1.8")
        .fromTo(".ch-card-left", { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.2")
        .fromTo(".ch-card-right", { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".ch-hero-text", { autoAlpha: 0 })
        .set(".ch-cta-wrapper", { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to([".ch-mockup", ".ch-badge", ".ch-card-left", ".ch-card-right"], {
          scale: 0.92, y: -30, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.04,
        })
        .to(".ch-main-card", {
          width: isMobile ? "92vw" : "82vw",
          height: isMobile ? "90vh" : "80vh",
          borderRadius: isMobile ? "28px" : "36px",
          ease: "expo.inOut", duration: 1.8,
        }, "pullback")
        .to(".ch-cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".ch-main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-screen h-screen overflow-hidden flex items-center justify-center", className)}
      style={{ background: "linear-gradient(135deg, #08111e 0%, #0d1a2d 60%, #14233F 100%)", perspective: "1500px" }}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden />
      <div className="ch-grid absolute inset-0 z-0 pointer-events-none" aria-hidden />

      {/* Background: hero taglines */}
      <div className="ch-hero-text absolute z-10 flex flex-col items-center justify-center text-center w-screen px-6 pointer-events-none">
        <h1 className="ch-tag1 gsap-reveal ch-text-outer text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-2 leading-tight">
          {tagline1}
        </h1>
        <h1 className="ch-tag2 gsap-reveal ch-text-silver text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight">
          {tagline2}
        </h1>
      </div>

      {/* CTA layer (appears after card shrinks back) */}
      <div className="ch-cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-6 pointer-events-auto">
        <h2 className="ch-text-silver text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight">
          {ctaHeading}
        </h2>
        <p className="text-white/55 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed">
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={ctaPrimaryHref}
            onClick={onCTAPrimary}
            className="ch-btn-primary inline-flex items-center justify-center gap-2 h-12 px-8 text-sm"
          >
            {ctaPrimaryLabel}
          </a>
          <a
            href={ctaSecondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="ch-btn-secondary inline-flex items-center justify-center h-12 px-8 text-sm"
          >
            {ctaSecondaryLabel}
          </a>
        </div>
      </div>

      {/* Foreground: the cinematic card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="ch-main-card ch-card gsap-reveal relative overflow-hidden flex items-center justify-center pointer-events-auto w-[92vw] md:w-[82vw] h-[88vh] md:h-[80vh] rounded-[28px] md:rounded-[36px]"
        >
          <div className="ch-sheen" aria-hidden />

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-14 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* Right col (mobile top): brand */}
            <div className="ch-card-right gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter ch-text-silver">
                CONNECT
              </h2>
            </div>

            {/* Center col: browser mockup with screenshot */}
            <div className="ch-mockup order-2 lg:order-2 relative w-full h-[320px] lg:h-[520px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
              <div ref={mockupRef} className="w-full max-w-md will-change-transform">
                <div className="ch-browser">
                  <div className="ch-browser-bar">
                    <div className="ch-dot bg-[#FF5F57]" />
                    <div className="ch-dot bg-[#FFBD2E]" />
                    <div className="ch-dot bg-[#28C840]" />
                    <div className="flex-1 mx-4">
                      <div className="bg-[#0d1a2d]/60 rounded-md h-5 flex items-center px-3 gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#7FA8E8]/40 shrink-0" />
                        <div className="h-1.5 w-32 bg-[#7FA8E8]/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="relative bg-[#080f1a] overflow-hidden" style={{ aspectRatio: "16/10" }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#264478]/30 to-[#3D63B8]/10" />
                    <img
                      src={screenshotSrc}
                      alt="Azumi Connect"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                </div>

                {/* Floating badges */}
                <div className="ch-badge gsap-reveal absolute top-4 -left-4 lg:-left-16 ch-badge rounded-2xl p-3.5 flex items-center gap-3 z-30" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px -10px rgba(0,0,0,0.7)" }}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3D63B8]/30 to-[#264478]/10 flex items-center justify-center border border-[#7FA8E8]/20">
                    <svg className="w-4 h-4 text-[#7FA8E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold leading-tight">Vaga preenchida</p>
                    <p className="text-[#7FA8E8]/60 text-[10px] font-medium">Candidato aprovado · agora</p>
                  </div>
                </div>

                <div className="ch-badge gsap-reveal absolute bottom-8 -right-4 lg:-right-16 ch-badge rounded-2xl p-3.5 flex items-center gap-3 z-30" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px -10px rgba(0,0,0,0.7)" }}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 flex items-center justify-center border border-emerald-400/20">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold leading-tight">Relatório entregue</p>
                    <p className="text-[#7FA8E8]/60 text-[10px] font-medium">Disponível no portal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Left col (mobile bottom): card description */}
            <div className="ch-card-left gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full px-2 lg:px-0">
              <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-3 tracking-tight leading-snug">
                {cardHeading}
              </h3>
              <p className="hidden md:block text-[#7FA8E8]/65 text-sm lg:text-base leading-relaxed max-w-sm">
                {cardDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
