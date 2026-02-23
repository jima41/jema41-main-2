import React from 'react';
import type { OlfactoryFamily } from '@/lib/olfactory';

interface SimpleOlfactoryDisplayProps {
  notes_tete?: string[];
  notes_coeur?: string[];
  notes_fond?: string[];
  families?: OlfactoryFamily[];
}

const getNoteLabel = (note: string): string =>
  note.includes('_')
    ? note.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : note;

// Centre foncé → bords transparents (fond de page visible = fondu naturel)
const STEPS = [
  {
    key: 'tete' as const,
    label: 'TÊTE',
    duration: 'Volatilité: 15–30 MIN',
    accent: '#D4AF37',
    bg: 'radial-gradient(ellipse at center, rgba(210, 165, 90, 0.07) 20%, transparent 72%)',
  },
  {
    key: 'coeur' as const,
    label: 'CŒUR',
    duration: 'Signature: 1H – 4H',
    accent: '#C9971C',
    bg: 'radial-gradient(ellipse at center, rgba(160, 100, 50, 0.065) 20%, transparent 72%)',
  },
  {
    key: 'fond' as const,
    label: 'FOND',
    duration: 'Sillage: 4H+',
    accent: '#8B7355',
    bg: 'radial-gradient(ellipse at center, rgba(110, 80, 45, 0.065) 20%, transparent 72%)',
  },
];

export const SimpleOlfactoryDisplay: React.FC<SimpleOlfactoryDisplayProps> = ({
  notes_tete = [],
  notes_coeur = [],
  notes_fond = [],
}) => {
  if (notes_tete.length === 0 && notes_coeur.length === 0 && notes_fond.length === 0) {
    return null;
  }

  const notesMap = { tete: notes_tete, coeur: notes_coeur, fond: notes_fond };
  const activeSteps = STEPS.filter((s) => notesMap[s.key].length > 0);

  return (
    <>
      {/* ── MOBILE : Timeline verticale ─────────────────────────── */}
      <div className="sm:hidden">
        {activeSteps.map((step, i) => {
          const notes = notesMap[step.key];
          const isLast = i === activeSteps.length - 1;
          return (
            <div key={step.key} className="flex gap-3">

              {/* Rail : point + ligne de connexion */}
              <div className="flex flex-col items-center shrink-0 w-4">
                <div
                  className="w-[9px] h-[9px] rounded-full mt-[13px] shrink-0"
                  style={{ border: `1.5px solid ${step.accent}` }}
                />
                {!isLast && (
                  <div
                    className="w-[1px] flex-1 mt-[3px]"
                    style={{
                      background: `linear-gradient(to bottom, ${step.accent}70, ${STEPS[i + 1]?.accent ?? step.accent}20)`,
                    }}
                  />
                )}
              </div>

              {/* Contenu */}
              <div
                className="flex-1 rounded-lg px-3 py-2.5 mb-3"
                style={{ background: step.bg }}
              >
                {/* Titre + durée sur une seule ligne */}
                <div className="flex items-baseline gap-2 mb-1.5">
                  <p
                    className="font-serif text-[10px] uppercase tracking-[0.22em] leading-none"
                    style={{ color: step.accent }}
                  >
                    Notes de {step.label}
                  </p>
                  <span className="text-[9px] font-light tracking-[0.1em] text-foreground/50">
                    · {step.duration}
                  </span>
                </div>

                {/* Notes inline séparées par des points médians */}
                <p className="text-[11px] text-foreground/70 font-light leading-relaxed">
                  {notes.map(getNoteLabel).join(' · ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP : Colonnes épurées ───────────────────────────── */}
      <div className="hidden sm:grid grid-cols-3 gap-4 lg:gap-5">
        {activeSteps.map((step) => {
          const notes = notesMap[step.key];
          return (
            <div
              key={step.key}
              className="rounded-lg px-4 py-3.5"
              style={{ background: step.bg }}
            >
              <p
                className="font-serif text-[10px] uppercase tracking-[0.22em] leading-none mb-1"
                style={{ color: step.accent }}
              >
                Notes de {step.label}
              </p>
              <p className="text-[9px] font-light text-foreground/35 tracking-[0.1em] mb-2.5">
                {step.duration}
              </p>
              <p className="text-xs text-foreground/60 font-light leading-relaxed">
                {notes.map(getNoteLabel).join(' · ')}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SimpleOlfactoryDisplay;
