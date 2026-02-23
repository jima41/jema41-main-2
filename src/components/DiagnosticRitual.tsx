import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Stage = 'banner' | 'spray' | 'quiz' | 'loading' | 'result';

const QUESTIONS = [
  {
    id: 'context',
    title: "Dans quelle occasion votre parfum doit-il rayonner ?",
    options: ['Rendez-vous', 'Réunion', 'Escapade', 'Soirée'],
  },
  {
    id: 'opening',
    title: 'Quelle sensation préférez-vous en ouverture ?',
    options: ['Agrumes', 'Marin', 'Fruité', 'Frais'],
  },
  {
    id: 'heart',
    title: 'Quelle matière vous séduit au cœur ?',
    options: ['Fleur blanche', 'Rose', 'Épices', 'Boisé'],
  },
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function DiagnosticRitual() {
  const [stage, setStage] = useState<Stage>('banner');
  const [particles, setParticles] = useState<Array<any>>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isFilling, setIsFilling] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const startSpray = useCallback(() => {
    // create particle burst
    const count = 28;
    const created = Array.from({ length: count }).map(() => {
      const angle = randomBetween(-85, -95) + randomBetween(-40, 40); // degrees
      const distance = randomBetween(60, 220);
      const size = Math.round(randomBetween(4, 12));
      const color = Math.random() > 0.7 ? '#fff' : '#D4AF37';
      return { angle, distance, size, color, id: Math.random().toString(36).slice(2) };
    });

    setParticles(created);
    setStage('spray');

    // after short burst, reveal quiz
    setTimeout(() => {
      setParticles([]);
      setStage('quiz');
    }, 520);
  }, []);

  const handleStart = useCallback(() => {
    if (stage !== 'banner') return;
    startSpray();
  }, [stage, startSpray]);

  const handleOption = (option: string) => {
    setAnswers((a) => [...a, option]);
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      // go to loading ritual
      setStage('loading');
      // small delay to ensure transition
      setTimeout(() => setIsFilling(true), 160);
    }
  };

  // After filling animation ends, show result
  useEffect(() => {
    if (!isFilling) return;
    // We consider the visual "filled" state at 80% of the bottle.
    // Keep the JS timeout in sync with the SVG animation duration below.
    const fillDuration = 1100; // ms (matches motion.rect transition)
    const glintDelay = 220; // extra for subtle glint
    const timeout = setTimeout(() => setStage('result'), fillDuration + glintDelay);
    return () => clearTimeout(timeout);
  }, [isFilling]);

  const recommended = useMemo(() => {
    if (answers.length === 0) return [];
    // naive mock: return three strings combining answers
    return [
      `${answers[0] || 'Élégant'} — Signature`,
      `${answers[1] || 'Lumineux'} — Tête`,
      `${answers[2] || 'Noble'} — Fond`,
    ];
  }, [answers]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {stage === 'banner' && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="mx-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-black px-6 py-3 sm:py-4 shadow-lg"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="text-[10px] uppercase tracking-widest text-amber-200/80">Diagnostic Olfactif</div>
                <h3 className="font-serif text-lg sm:text-xl text-amber-50/95">Une invitation privée</h3>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">Un rituel condensé pour découvrir votre signature olfactive.</p>

                <div className="mt-3 w-full sm:w-auto">
                  <button
                    ref={buttonRef}
                    onClick={handleStart}
                    type="button"
                    className="relative inline-flex items-center justify-center w-full sm:w-auto rounded-md border border-amber-200/40 bg-transparent px-4 py-2 text-sm font-medium text-amber-200/95 hover:bg-amber-200/6 transition-colors"
                  >
                    LANCER LE DIAGNOSTIC
                  </button>
                </div>
              </div>

              {/* Particle burst anchored near button */}
              <div className="pointer-events-none relative mt-0">
                {particles.map((p) => (
                  <motion.span
                    key={p.id}
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                    className="absolute top-1/2 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                      y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                      scale: [0, 1.1, 0.9],
                      opacity: [1, 0.9, 0],
                      filter: ['blur(0px)', 'blur(6px)', 'blur(12px)'],
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ width: p.size, height: p.size, background: p.color }}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {stage === 'spray' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-black px-6 py-3 sm:py-4"
            />
          )}

          {stage === 'quiz' && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="mx-4 rounded-2xl bg-neutral-900 px-4 py-4 sm:py-6 shadow-lg"
              style={{ minHeight: 160 }}
            >
              <div className="max-w-xl mx-auto">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-widest text-amber-200/80">Diagnostic Olfactif</div>
                  <h4 className="font-serif text-lg text-amber-50/95 mt-1">{QUESTIONS[questionIndex].title}</h4>
                  <p className="text-xs text-neutral-400 mt-1">Choisissez une option</p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {QUESTIONS[questionIndex].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleOption(opt)}
                      className="w-full text-left rounded-lg border border-neutral-800 bg-transparent px-4 py-3 text-sm text-amber-200/95 hover:bg-amber-200/6 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex justify-between items-center text-xs text-neutral-400">
                  <div>Étape {questionIndex + 1} / {QUESTIONS.length}</div>
                  <button
                    onClick={() => { setStage('banner'); setQuestionIndex(0); setAnswers([]); }}
                    className="text-amber-200/70 hover:text-amber-200"
                  >Annuler</button>
                </div>
              </div>
            </motion.section>
          )}

          {stage === 'loading' && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-4 rounded-2xl bg-neutral-900 px-4 py-6 sm:py-8 shadow-lg flex justify-center items-center"
            >
              <div className="w-full max-w-xs mx-auto text-center">
                <div className="mx-auto mb-4">
                  {/* Bottle SVG */}
                  <svg viewBox="0 0 100 140" width="140" height="196" className="mx-auto">
                    <defs>
                      <clipPath id="bottleClip">
                        <path d="M30 20 h40 v12 c0 6 -6 10 -12 10 h-16 c-6 0 -12 -4 -12 -10 v-12 z M30 32 v72 c0 6 6 12 12 12 h16 c6 0 12 -6 12 -12 V32" />
                      </clipPath>
                    </defs>

                    {/* Outline */}
                    <path
                      d="M30 20 h40 v12 c0 6 -6 10 -12 10 h-16 c-6 0 -12 -4 -12 -10 v-12 z M30 32 v72 c0 6 6 12 12 12 h16 c6 0 12 -6 12 -12 V32"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-95"
                    />

                    {/* Liquid - animated rect clipped to bottle (fills to 80%) */}
                    {/* Bottle interior span: y 48 -> 120 (height 72). 80% = 57.6 -> height ~58 */}
                    <motion.rect
                      x={32}
                      width={36}
                      rx={6}
                      fill="#D4AF37"
                      clipPath="url(#bottleClip)"
                      initial={{ y: 120, height: 0 }}
                      animate={isFilling ? { y: 62, height: 58 } : { y: 120, height: 0 }}
                      transition={{ duration: 1.1, ease: 'easeInOut' }}
                      onAnimationComplete={() => {
                        /* noop here — useEffect handles stage transition timing to include glint */}
                    />

                    {/* Subtle glint when filled */}
                    <motion.line
                      x1={28}
                      x2={72}
                      y1={36}
                      y2={36}
                      stroke="#fff"
                      strokeWidth={0.6}
                      opacity={0}
                      animate={isFilling ? { opacity: [0, 0.8, 0], strokeDashoffset: [20, 0] } : { opacity: 0 }}
                      transition={{ delay: 1.1, duration: 0.45 }}
                    />
                  </svg>
                </div>

                <div className="text-amber-50/95 font-serif text-lg">Remplissage en cours…</div>
                <div className="text-xs text-neutral-400 mt-2">Nous préparons vos recommandations</div>
              </div>
            </motion.section>
          )}

          {stage === 'result' && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-4 rounded-2xl bg-neutral-900 px-6 py-6 shadow-lg"
            >
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-amber-200/80">Signature</div>
                <h4 className="font-serif text-xl text-amber-50/95 mt-1">Vos recommandations</h4>
                <p className="text-xs text-neutral-400 mt-1">Basées sur votre rituel</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {recommended.map((r, i) => (
                  <div key={i} className="rounded-lg border border-neutral-800 bg-transparent px-4 py-3 text-sm text-amber-200">
                    {r}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setStage('banner'); setQuestionIndex(0); setAnswers([]); setIsFilling(false); }}
                  className="inline-flex items-center gap-2 rounded-md border border-amber-200/40 bg-transparent px-4 py-2 text-sm font-medium text-amber-200/95 hover:bg-amber-200/6 transition-colors"
                >
                  Recommencer
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
