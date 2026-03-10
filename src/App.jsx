import { Suspense } from 'react';
import IslandScene from './components/scene/IslandScene.jsx';

export default function App() {
  return (
    <main className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-slate-900 text-white">
      <section className="relative w-full min-w-0 h-screen">
        <Suspense fallback={<div className="p-4 text-white">Loading island...</div>}>
          <IslandScene />
        </Suspense>
      </section>
    </main>
  );
}
