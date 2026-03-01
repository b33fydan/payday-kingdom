import { Suspense, useEffect, useRef, useState } from 'react';
import IslandScene from './components/scene/IslandScene.jsx';
import OnboardingFlow from './components/onboarding/OnboardingFlow.jsx';
import BudgetPanel from './components/ui/BudgetPanel.jsx';
import HUD from './components/ui/HUD.jsx';
import KingdomSetup from './components/ui/KingdomSetup.jsx';

const MOBILE_SHEET_MIN = 30;
const MOBILE_SHEET_DEFAULT = 40;
const MOBILE_SHEET_MAX = 55;
const ONBOARDING_STORAGE_KEY = 'payday-kingdom-onboarding-complete';
const KINGDOM_STORAGE_KEY = 'payday-kingdom-kingdom';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function App() {
  const [mobileSheetVh, setMobileSheetVh] = useState(MOBILE_SHEET_DEFAULT);
  const [captureContext, setCaptureContext] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isInitialKingdomSetupOpen, setIsInitialKingdomSetupOpen] = useState(false);
  const dragRef = useRef(null);
  const sheetHeightRef = useRef(MOBILE_SHEET_DEFAULT);

  useEffect(() => {
    try {
      const onboardingComplete = window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
      if (!onboardingComplete) {
        setIsOnboardingOpen(true);
        setIsInitialKingdomSetupOpen(false);
        return;
      }

      const hasKingdomMetadata = Boolean(window.localStorage.getItem(KINGDOM_STORAGE_KEY));
      if (!hasKingdomMetadata) {
        setIsInitialKingdomSetupOpen(true);
      }
    } catch {
      // Ignore localStorage availability issues.
    }
  }, []);

  useEffect(() => {
    const onPointerMove = (event) => {
      if (!dragRef.current || !window.innerHeight) {
        return;
      }

      const deltaY = dragRef.current.startY - event.clientY;
      const deltaVh = (deltaY / window.innerHeight) * 100;
      const next = clamp(dragRef.current.startHeight + deltaVh, MOBILE_SHEET_MIN, MOBILE_SHEET_MAX);
      sheetHeightRef.current = next;
      setMobileSheetVh(next);
    };

    const onPointerUp = () => {
      if (!dragRef.current) {
        return;
      }

      const current = sheetHeightRef.current;
      const midpoint = (MOBILE_SHEET_MIN + MOBILE_SHEET_MAX) / 2;
      const snapped = current >= midpoint ? MOBILE_SHEET_MAX : MOBILE_SHEET_DEFAULT;
      sheetHeightRef.current = snapped;
      setMobileSheetVh(snapped);
      dragRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  const startSheetDrag = (clientY) => {
    dragRef.current = {
      startY: clientY,
      startHeight: sheetHeightRef.current
    };
  };

  const mobileSceneHeight = `${100 - mobileSheetVh}svh`;
  const completeOnboarding = () => {
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {
      // Ignore localStorage availability issues.
    }

    setIsOnboardingOpen(false);
    setIsInitialKingdomSetupOpen(false);
  };

  const replayOnboarding = () => {
    try {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      // Ignore localStorage availability issues.
    }

    setIsOnboardingOpen(true);
  };

  return (
    <main className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-kingdom-dark text-white md:flex-row">
      <section className="relative w-full min-w-0 md:order-2 md:!h-screen md:w-[60vw]" style={{ height: mobileSceneHeight }}>
        <Suspense fallback={<div className="p-4 text-white">Loading scene...</div>}>
          <IslandScene onSceneReady={setCaptureContext} />
        </Suspense>
        <HUD captureContext={captureContext} onReplayOnboarding={replayOnboarding} />
      </section>

      <section className="hidden min-w-0 md:order-1 md:block md:h-screen md:w-[40vw] md:min-w-[340px]">
        <BudgetPanel className="h-full w-full" />
      </section>

      <section className="w-full md:hidden" style={{ height: `${mobileSheetVh}svh` }}>
        <div className="flex h-full flex-col rounded-t-2xl border-t border-white/15 bg-slate-900/95 shadow-[0_-16px_35px_rgba(0,0,0,0.45)]">
          <button
            type="button"
            aria-label="Drag budget sheet"
            onPointerDown={(event) => {
              event.preventDefault();
              startSheetDrag(event.clientY);
            }}
            className="flex min-h-11 w-full items-center justify-center touch-none border-b border-white/10 px-4"
          >
            <span className="h-1.5 w-14 rounded-full bg-slate-500" />
          </button>
          <div className="min-h-0 flex-1">
            <BudgetPanel mobile className="h-full w-full" />
          </div>
        </div>
      </section>

      <KingdomSetup
        isOpen={isInitialKingdomSetupOpen && !isOnboardingOpen}
        mode="create"
        allowClose={false}
        onClose={() => setIsInitialKingdomSetupOpen(false)}
        onSaved={() => setIsInitialKingdomSetupOpen(false)}
      />

      <OnboardingFlow isOpen={isOnboardingOpen} captureContext={captureContext} onComplete={completeOnboarding} />
    </main>
  );
}
