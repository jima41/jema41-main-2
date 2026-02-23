import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Stage = 'banner' | 'spray' | 'quiz' | 'filling' | 'result';

const QUESTIONS = [
  { id: '1', q: 'Dans quelle situation ?', opts: ['Rendez-vous', 'Soirée', 'Travail', 'Détente'] },
  { id: '2', q: 'Quelle ouverture préférez-vous ?', opts: ['Agrumes', 'Marin', 'Épicé', 'Fruité'] },
  { id: '3', q: 'Quelle profondeur vous attire ?', opts: ['Boisé', 'Ambre', 'Cuir', 'Musqué'] },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function LuxuryDiagnostic(): JSX.Element {
  const [stage, setStage] = useState<Stage>('banner');
  const [particles, setParticles] = useState<Array<any>>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isFilling, setIsFilling] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const startSpray = useCallback(() => {
    // generate tasteful particles (gold + soft white mist)
    const count = 26;
    const burst = Array.from({ length: count }).map(() => ({
      id: Math.random().toString(36).slice(2),
      size: rand(4, 12),
      color: Math.random() > 0.72 ? '#ffffff' : '#D4AF37',
      angle: rand(-110, -70),
      distance: rand(60, 220),
      blur: rand(2, 10),
      ttl: 520,
    }));

    setParticles(burst);
    setStage('spray');

    // short spray then reveal quiz
    setTimeout(() => {
      setParticles([]);
      setStage('quiz');
    }, 520);
  }, []);

  const handleStart = useCallback(() => {
    if (stage !== 'banner') return;
    startSpray();
  }, [stage, startSpray]);

  const choose = (opt: string) => {
    setAnswers((a) => [...a, opt]);
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setStage('filling');
      // small delay then start fill animation
      setTimeout(() => setIsFilling(true), 120);
    }
  };

  useEffect(() => {
    if (!isFilling) return;
    const dur = 1100;
    setTimeout(() => setStage('result'), dur + 300);
  }, [isFilling]);

  const recommended = useMemo(() => {
    if (!answers.length) return [] as string[];
    return [
      `${answers[0]} — Élégance`,
      `${answers[1]} — Tête`,
      `${answers[2] || 'Boisé'} — Fond`,
    ];
  }, [answers]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl px-4">
        <AnimatePresence mode="wait">
          {stage === 'banner' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="mx-auto rounded-lg border border-neutral-800 bg-[#0A0A0A] px-5 py-3 sm:py-4 shadow-sm"
              style={{ height: '84px', display: 'flex', alignItems: 'center' }}
            >
              <div className="flex-1 text-center">
                <div className="text-[10px] uppercase tracking-widest text-amber-200/70">Diagnostic Olfactif</div>
                <div className="font-serif text-base text-amber-50/95 mt-1">Une expérience discrète</div>
                <div className="text-xs text-neutral-400 mt-1">Rituel condensé • 3 questions</div>
              </div>

              <div className="ml-4">
                <button
                  ref={btnRef}
                  onClick={handleStart}
                  className="relative inline-flex items-center justify-center rounded-md border border-amber-200/40 bg-transparent px-4 py-2 text-sm text-amber-200/95 hover:bg-amber-200/6 transition-colors"
                >
                  Lancer
                </button>
              </div>

              {/* particles anchored to center-right near button */}
              <div className="pointer-events-none absolute inset-0">
                {particles.map((p) => (
                  <motion.span
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                      right: 44,
                      top: '50%',
                      width: p.size,
                      height: p.size,
                      background: p.color,
                      filter: `blur(${p.blur}px)`,
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                      y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                      scale: [0, 1.05, 0.9],
                      opacity: [1, 0.9, 0],
                    }}
                    transition={{ duration: p.ttl / 1000, ease: 'easeOut' }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'quiz' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full flex justify-center px-4 md:px-0 my-12 animate-fade-up"
            >
              <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-sm overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 ease-[0.22, 1, 0.36, 1] min-h-[380px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 bg-[#0a0a0a]" style={{ opacity: 1 }}>
                  <div className="w-full max-w-2xl">
                    <div className="flex justify-center mb-8">
                      <span className="text-[10px] text-neutral-600 tracking-[0.2em] uppercase font-light">Question {qIndex + 1} <span className="text-neutral-800 mx-2">/</span> {QUESTIONS.length}</span>
                    </div>

                    <h3 className="font-serif text-xl md:text-2xl text-[#F5F5F0] mb-10 text-center font-light">{QUESTIONS[qIndex].q}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {QUESTIONS[qIndex].opts.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => choose(opt)}
                          className="p-5 rounded-sm border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-900/30 text-left transition-all duration-300 group active:scale-[0.99]"
                        >
                          <span className="flex justify-between items-center w-full">
                            <span className="block text-xs md:text-sm text-neutral-400 group-hover:text-amber-100/90 font-light tracking-wide transition-colors">{opt}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#D4AF37] transition-colors duration-500" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'filling' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto rounded-lg border border-neutral-800 bg-[#0A0A0A] px-6 py-6 shadow-sm flex justify-center"
            >
              <div className="w-full max-w-xs text-center">
                {/* Bottle SVG */}
                <svg viewBox="0 0 100 140" width="120" height="168" className="mx-auto">
                  <defs>
                    <clipPath id="ldBottle">
                      <path d="M30 18 h40 v10 c0 5 -5 9 -11 9 h-18 c-6 0 -11 -4 -11 -9 v-10 z M30 28 v70 c0 5 5 11 11 11 h18 c6 0 11 -6 11 -11 V28" />
                    </clipPath>
                  </defs>

                  <path
                    d="M30 18 h40 v10 c0 5 -5 9 -11 9 h-18 c-6 0 -11 -4 -11 -9 v-10 z M30 28 v70 c0 5 5 11 11 11 h18 c6 0 11 -6 11 -11 V28"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <motion.rect
                    x={32}
                    width={36}
                    rx={6}
                    fill="#D4AF37"
                    clipPath="url(#ldBottle)"
                    initial={{ y: 120, height: 0 }}
                    animate={isFilling ? { y: 46, height: 72 } : { y: 120, height: 0 }}
                    transition={{ duration: 1.05, ease: 'easeInOut' }}
                  />

                  <motion.line
                    x1={28}
                    x2={72}
                    y1={36}
                    y2={36}
                    stroke="#fff"
                    strokeWidth={0.5}
                    opacity={0}
                    animate={isFilling ? { opacity: [0, 0.85, 0], strokeDashoffset: [12, 0] } : { opacity: 0 }}
                    transition={{ delay: 1.05, duration: 0.45 }}
                  />
                </svg>

                <div className="mt-4 font-serif text-base text-amber-50/95">Analyse en cours</div>
                <div className="text-xs text-neutral-400 mt-1">Préparation de vos recommandations</div>
              </div>
            </motion.div>
          )}

          {stage === 'result' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto rounded-lg border border-neutral-800 bg-[#0A0A0A] px-6 py-6 shadow-sm"
            >
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-amber-200/70">Signature</div>
                <h4 className="font-serif text-lg text-amber-50/95 mt-1">Vos recommandations</h4>
                <p className="text-xs text-neutral-400 mt-1">Basées sur votre rituel</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                {recommended.map((r, i) => (
                  <div key={i} className="rounded-md border border-neutral-800 px-4 py-3 text-sm text-amber-200/95">{r}</div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setStage('banner'); setQIndex(0); setAnswers([]); setIsFilling(false); }}
                  className="inline-flex items-center gap-2 rounded-md border border-amber-200/40 bg-transparent px-4 py-2 text-sm text-amber-200/95 hover:bg-amber-200/6 transition-colors"
                >
                  Recommencer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
