import React, { useState } from 'react';
import type { OlfactoryFamily } from '@/lib/olfactory';

interface OlfactoryPyramidProps {
  notes_tete?: string[];
  notes_coeur?: string[];
  notes_fond?: string[];
  families?: OlfactoryFamily[];
  compact?: boolean;
}

// Helper: notes are now stored as labels, so just return as-is
const getNoteLabel = (note: string): string => {
  // If it's an old-style snake_case key, convert; otherwise return as-is
  if (note.includes('_')) {
    return note.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  return note;
};

export const OlfactoryPyramid: React.FC<OlfactoryPyramidProps> = ({
  notes_tete = [],
  notes_coeur = [],
  notes_fond = [],
  families = [],
  compact = false,
}) => {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  if (notes_tete.length === 0 && notes_coeur.length === 0 && notes_fond.length === 0) {
    return null;
  }

  const levels = [
    { name: 'Tête', notes: notes_tete, y: 0, color: 'from-[#D4AF37] to-[#C5A028]', dotColor: '#D4AF37', textColor: 'text-[#D4AF37]', borderColor: 'border-[#D4AF37]', bgFrom: 'from-[#D4AF37]', labelColor: 'text-[#B8960F]' },
    { name: 'Cœur', notes: notes_coeur, y: 1, color: 'from-[#9B2D5B] to-[#7B2450]', dotColor: '#9B2D5B', textColor: 'text-[#9B2D5B]', borderColor: 'border-[#9B2D5B]', bgFrom: 'from-[#9B2D5B]', labelColor: 'text-[#9B2D5B]' },
    { name: 'Fond', notes: notes_fond, y: 2, color: 'from-[#0A1128] to-[#1B2845]', dotColor: '#0A1128', textColor: 'text-[#0A1128]', borderColor: 'border-[#0A1128]', bgFrom: 'from-[#0A1128]', labelColor: 'text-[#0A1128]' },
  ];

  return (
    <div className={`w-full ${compact ? 'py-2' : 'py-8'}`}>
      {/* Titre & Familles */}
      {!compact && (
        <div className="mb-6">
          <h3 className="text-xl font-montserrat font-light tracking-wide text-amber-500 mb-3 flex items-center gap-2">
            🌸 Pyramide Olfactive
          </h3>
          {families.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {families.map((family) => (
                <div
                  key={family}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-sm"
                >
                  {family}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compact Mode - Family badges at top */}
      {compact && families.length > 0 && (
        <div className="mb-2 pb-2 border-b border-amber-500/10">
          <div className="flex flex-wrap gap-1">
            {families.map((family) => (
              <div
                key={family}
                className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-600"
              >
                {family}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pyramide SVG & Contenu */}
      <div className={`relative ${compact ? 'space-y-1' : 'space-y-4'}`}>
        {levels.map((level, index) => (
          <div key={level.name} className="relative">
            {/* Ligne séparatrice fine */}
            {index > 0 && (
              <div className="absolute -top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            )}

            {/* Header du niveau */}
            <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-3'}`}>
              <div className={`h-1 ${compact ? 'w-4' : 'w-12'} bg-gradient-to-r ${level.color} rounded-full`} />
              <span className={`font-montserrat font-light tracking-widest uppercase ${compact ? 'text-xs' : 'text-xs'} ${level.labelColor}/70`}>
                {level.name}
              </span>
              {!compact && (
                <span className={`text-xs font-montserrat ${level.textColor} opacity-50`}>
                  ({level.notes.length})
                </span>
              )}
            </div>

            {/* Grille des notes */}
            <div className={`grid ${compact ? 'grid-cols-3 gap-1' : 'grid-cols-3 lg:grid-cols-4 gap-3'}`}>
              {level.notes.length > 0 ? (
                level.notes.map((note) => (
                  <div
                    key={note}
                    onMouseEnter={() => !compact && setHoveredNote(note)}
                    onMouseLeave={() => setHoveredNote(null)}
                    className={`
                      relative p-1 rounded text-center
                      transition-all duration-300 cursor-pointer
                      group
                      ${compact ? 'min-h-fit' : 'p-2 rounded-lg min-h-12'}
                      ${
                        hoveredNote === note
                          ? `bg-gradient-to-br ${level.bgFrom}/30 to-transparent border ${level.borderColor}/50 shadow-lg scale-105`
                          : `bg-gradient-to-br ${level.bgFrom}/5 to-transparent border ${level.borderColor}/20 hover:${level.borderColor}/40`
                      }
                    `}
                    style={{
                      borderColor: hoveredNote === note
                        ? `${level.dotColor}80`
                        : `${level.dotColor}33`,
                    }}
                  >
                    {/* Glow effect on hover */}
                    {hoveredNote === note && !compact && (
                      <div className="absolute inset-0 rounded-lg blur-md -z-0 animate-pulse" style={{ backgroundColor: `${level.dotColor}20` }} />
                    )}

                    {/* Note text */}
                    <span
                      className={`
                        font-montserrat font-light tracking-wide leading-tight
                        transition-all duration-300 block relative z-10
                        ${compact ? 'text-xs' : 'text-xs'}
                        ${
                          hoveredNote === note
                            ? `${level.textColor} font-semibold`
                            : 'text-foreground/70'
                        }
                      `}
                    >
                      {getNoteLabel(note)}
                    </span>

                    {/* Hover indicator */}
                    {hoveredNote === note && !compact && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: level.dotColor }} />
                    )}
                  </div>
                ))
              ) : (
                <div className={`${compact ? 'col-span-3' : 'col-span-3 lg:col-span-4'} text-center py-1`}>
                  <span className={`text-muted-foreground/40 font-montserrat font-light italic ${compact ? 'text-xs' : 'text-xs'}`}>
                    Aucune
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Durée de vie */}
      {!compact && (
        <div className="mt-6 pt-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground font-montserrat font-light tracking-wide">
            💫 Diffusion : Tête (0-15 min) → Cœur (15 min - 4h) → Fond (4h+)
          </p>
        </div>
      )}
    </div>
  );
};

export default OlfactoryPyramid;
