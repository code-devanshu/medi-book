"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Circle,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useDemoGuide } from "@/store/demoGuideStore";
import { GUIDE_STEPS } from "@/store/demoGuideStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

export function DemoGuide() {
  const {
    isOpen,
    currentStep,
    completedSteps,
    dismissGuide,
    nextStep,
    prevStep,
    goToStep,
  } = useDemoGuide();

  const pathname = usePathname();
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [visible, setVisible] = useState(false);

  const step = GUIDE_STEPS.find((s) => s.id === currentStep)!;
  const isOnCorrectPage = step && pathname.startsWith(step.path);
  const isLast = currentStep === GUIDE_STEPS.length;

  // Find and highlight the target element
  const updateSpotlight = useCallback(() => {
    if (!step || !isOnCorrectPage) {
      setSpotlight(null);
      return;
    }
    const el = document.querySelector(`[data-guide="${step.target}"]`);
    if (!el) {
      setSpotlight(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setSpotlight({
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    });
    // Scroll the element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [step, isOnCorrectPage]);

  // Re-run spotlight after page navigation settles
  useEffect(() => {
    if (!isOpen) return;

    const t1 = setTimeout(() => {
      updateSpotlight();
      setVisible(true);
    }, 350);

    return () => {
      clearTimeout(t1);
      setSpotlight(null);
      setVisible(false);
    };
  }, [currentStep, pathname, isOpen, updateSpotlight]);

  // Update on resize / scroll
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updateSpotlight();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isOpen, updateSpotlight]);

  if (!isOpen) return null;

  return (
    <>
      {/* Spotlight overlay */}
      {spotlight && isOnCorrectPage && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* Dark backdrop with cutout using SVG clipPath */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={spotlight.left}
                  y={spotlight.top}
                  width={spotlight.width}
                  height={spotlight.height}
                  rx="10"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.45)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Animated ring around target */}
          <div
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
            }}
          >
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-xl border-2 border-indigo-400 animate-pulse" />
            <div className="absolute -inset-1 rounded-xl border border-indigo-300/50" />
          </div>
        </div>
      )}

      {/* Floating guide card */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-300",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Demo Guide
            </span>
          </div>
          <button
            onClick={dismissGuide}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 px-4 pt-3">
          {GUIDE_STEPS.map((s) => {
            const done = completedSteps.includes(s.id);
            const active = s.id === currentStep;
            return (
              <button
                key={s.id}
                onClick={() => goToStep(s.id)}
                title={s.title}
                className={cn(
                  "transition-all duration-200 rounded-full",
                  active
                    ? "w-6 h-2 bg-indigo-600"
                    : done
                    ? "w-2 h-2 bg-indigo-300"
                    : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
                )}
              />
            );
          })}
          <span className="ml-auto text-xs text-gray-400 font-medium whitespace-nowrap">
            {currentStep} / {GUIDE_STEPS.length}
          </span>
        </div>

        {/* Step content */}
        <div className="px-4 pt-3 pb-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">
              {step.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Action hint */}
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium",
              isOnCorrectPage
                ? "bg-indigo-50 text-indigo-700"
                : "bg-amber-50 text-amber-700"
            )}
          >
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span>
              {isOnCorrectPage
                ? step.actionLabel
                : `Navigate to: ${step.path}`}
            </span>
          </div>

          {/* Full step checklist */}
          <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
            {GUIDE_STEPS.map((s) => {
              const done = completedSteps.includes(s.id);
              const active = s.id === currentStep;
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs text-left transition-colors",
                    active
                      ? "bg-indigo-50 text-indigo-800 font-medium"
                      : done
                      ? "text-gray-400 hover:bg-gray-50"
                      : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  {done ? (
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  ) : active ? (
                    <div className="w-3 h-3 rounded-full border-2 border-indigo-500 shrink-0" />
                  ) : (
                    <Circle size={13} className="text-gray-300 shrink-0" />
                  )}
                  <span className="truncate">{s.title.replace(" 👋", "")}</span>
                  {active && (
                    <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full shrink-0">
                      Now
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="h-8 px-3 text-xs gap-1 text-gray-500"
          >
            <ChevronLeft size={13} /> Prev
          </Button>

          <button
            onClick={dismissGuide}
            className="text-xs text-gray-400 hover:text-gray-600 underline-offset-2 hover:underline transition-colors"
          >
            Skip tour
          </button>

          <Button
            size="sm"
            onClick={nextStep}
            className="h-8 px-3 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLast ? "Finish" : "Next"}
            {!isLast && <ChevronRight size={13} />}
          </Button>
        </div>
      </div>
    </>
  );
}
