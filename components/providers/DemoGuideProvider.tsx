"use client";

import { useState, useCallback, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DemoGuideContext, GUIDE_STEPS } from "@/store/demoGuideStore";

const GUIDE_KEY = "medibook_guide_dismissed";

export function DemoGuideProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Auto-open on the login page if tour hasn't been dismissed yet
  useEffect(() => {
    const dismissed = localStorage.getItem(GUIDE_KEY);
    if (!dismissed && pathname === "/login") {
      const t = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  const navigateToStep = useCallback(
    (step: number) => {
      const s = GUIDE_STEPS.find((g) => g.id === step);
      if (s) router.push(s.path);
    },
    [router]
  );

  // "Take a tour" from topbar — always restarts from step 1 (login)
  const startGuide = useCallback(() => {
    localStorage.removeItem(GUIDE_KEY);
    setCurrentStep(1);
    setCompletedSteps([]);
    setIsOpen(true);
    router.push("/login");
  }, [router]);

  const dismissGuide = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(GUIDE_KEY, "true");
  }, []);

  const nextStep = useCallback(() => {
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep]
    );
    if (currentStep < GUIDE_STEPS.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      navigateToStep(next);
    } else {
      dismissGuide();
    }
  }, [currentStep, navigateToStep, dismissGuide]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      navigateToStep(prev);
    }
  }, [currentStep, navigateToStep]);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      navigateToStep(step);
    },
    [navigateToStep]
  );

  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step]
    );
  }, []);

  return (
    <DemoGuideContext.Provider
      value={{
        isOpen,
        currentStep,
        completedSteps,
        startGuide,
        dismissGuide,
        nextStep,
        prevStep,
        goToStep,
        markStepComplete,
      }}
    >
      {children}
    </DemoGuideContext.Provider>
  );
}
