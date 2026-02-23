import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Droplets, Heart, Anchor, Pencil, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useOlfactoryNotesStore,
  OLFACTORY_FAMILIES,
  PYRAMID_LABELS,
  PYRAMID_DESCRIPTIONS,
  type OlfactoryFamilyType,
} from '@/store/useOlfactoryNotesStore';

const PYRAMID_KEYS = ['tete', 'coeur', 'fond'] as const;
type PyramidKey = typeof PYRAMID_KEYS[number];

const PYRAMID_ICONS = {
  tete: Droplets,
  coeur: Heart,
  fond: Anchor,
};

const PYRAMID_COLORS = {
  tete: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300' },
  coeur: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
  fond: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
};

const FAMILY_COLORS: Record<string, string> = {
  'Floral': 'bg-pink-500/20 text-pink-300',
  'Boisé': 'bg-emerald-500/20 text-emerald-300',
  'Gourmand': 'bg-orange-500/20 text-orange-300',
  'Oriental': 'bg-purple-500/20 text-purple-300',
  'Épicé': 'bg-red-500/20 text-red-300',
  'Cuiré': 'bg-yellow-700/20 text-yellow-400',
  'Frais/Aquatique': 'bg-cyan-500/20 text-cyan-300',
};

interface EditState {
  label: string;
  family: OlfactoryFamilyType;
  pyramid: PyramidKey;
}

const OlfactoryNotesManager: React.FC = () => {
  const { notes, addNote, removeNote, updateNote } = useOlfactoryNotesStore();

  const [activeTab, setActiveTab] = useState<PyramidKey>('tete');
  const [newNoteLabel, setNewNoteLabel] = useState('');
  const [newNoteFamily, setNewNoteFamily] = useState<OlfactoryFamilyType>('Floral');
  const [newNotePyramid, setNewNotePyramid] = useState<PyramidKey>('tete');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFamily, setFilterFamily] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ label: '', family: 'Floral', pyramid: 'tete' });

  const currentNotes = useMemo(() => {
    return notes
      .filter(n => n.pyramid === activeTab)
      .filter(n => !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(n => !filterFamily || n.family === filterFamily)
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  }, [notes, activeTab, searchQuery, filterFamily]);

  const stats = useMemo(() => ({
    tete: notes.filter(n => n.pyramid === 'tete').length,
    coeur: notes.filter(n => n.pyramid === 'coeur').length,
    fond: notes.filter(n => n.pyramid === 'fond').length,
    total: notes.length,
  }), [notes]);

  const familyStats = useMemo(() => {
    const pyramidNotes = notes.filter(n => n.pyramid === activeTab);
    const counts: Record<string, number> = {};
    pyramidNotes.forEach(n => {
      const f = n.family || 'Non classée';
      counts[f] = (counts[f] || 0) + 1;
    });
    return counts;
  }, [notes, activeTab]);

  const handleAddNote = () => {
    const trimmed = newNoteLabel.trim();
    if (!trimmed) return;

    const exists = notes.some(
      n => n.label.toLowerCase() === trimmed.toLowerCase() && n.pyramid === newNotePyramid
    );
    if (exists) return;

    (async () => {
      await addNote(trimmed, newNotePyramid, newNoteFamily);
      setNewNoteLabel('');
    })();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNote();
    }
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      (async () => { await removeNote(id); })();
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const startEdit = (note: { id: string; label: string; family?: string; pyramid: PyramidKey }) => {
    setEditingId(note.id);
    setEditState({
      label: note.label,
      family: (note.family as OlfactoryFamilyType) || 'Floral',
      pyramid: note.pyramid,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (!editingId || !editState.label.trim()) return;
    (async () => {
      await updateNote(editingId, {
        label: editState.label.trim(),
        family: editState.family,
        pyramid: editState.pyramid,
      });
    })();
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
    if (e.key === 'Escape') { cancelEdit(); }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PYRAMID_KEYS.map((pyramid) => {
          const Icon = PYRAMID_ICONS[pyramid];
          const colors = PYRAMID_COLORS[pyramid];
          return (
            <motion.div
              key={pyramid}
              whileHover={{ scale: 1.02 }}
              className={`glass-panel rounded-xl p-4 cursor-pointer transition-all border ${
                activeTab === pyramid ? `${colors.border} ${colors.bg}` : 'border-admin-border'
              }`}
              onClick={() => setActiveTab(pyramid)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon size={18} className={colors.text} />
                </div>
                <div>
                  <p className="text-sm font-medium text-admin-text-primary">{PYRAMID_LABELS[pyramid]}</p>
                  <p className="text-2xl font-bold text-admin-gold">{stats[pyramid]}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div className="glass-panel rounded-xl p-4 border border-admin-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-admin-gold/10">
              <Droplets size={18} className="text-admin-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-admin-text-primary">Total</p>
              <p className="text-2xl font-bold text-admin-gold">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tab Description */}
      <div className={`rounded-xl p-4 ${PYRAMID_COLORS[activeTab].bg} border ${PYRAMID_COLORS[activeTab].border}`}>
        <h3 className={`text-lg font-semibold ${PYRAMID_COLORS[activeTab].text}`}>
          {PYRAMID_LABELS[activeTab]}
        </h3>
        <p className="text-sm text-admin-text-secondary mt-1">
          {PYRAMID_DESCRIPTIONS[activeTab]}
        </p>
      </div>

      {/* Family Stats */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={`cursor-pointer transition-all ${
            !filterFamily ? 'bg-admin-gold/20 text-admin-gold border-admin-gold/50' : 'text-admin-text-secondary hover:bg-white/5'
          }`}
          onClick={() => setFilterFamily(null)}
        >
          Toutes ({notes.filter(n => n.pyramid === activeTab).length})
        </Badge>
        {Object.entries(familyStats).map(([family, count]) => (
          <Badge
            key={family}
            variant="outline"
            className={`cursor-pointer transition-all ${
              filterFamily === family
                ? (FAMILY_COLORS[family] || 'bg-gray-500/20 text-gray-300') + ' border-transparent'
                : 'text-admin-text-secondary hover:bg-white/5'
            }`}
            onClick={() => setFilterFamily(filterFamily === family ? null : family)}
          >
            {family} ({count})
          </Badge>
        ))}
      </div>

      {/* Add Note Form */}
      <div className="glass-panel rounded-xl p-4 border border-admin-border">
        <h4 className="text-sm font-semibold text-admin-text-primary mb-3">
          Ajouter une nouvelle note
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
          <Input
            value={newNoteLabel}
            onChange={(e) => setNewNoteLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Rose de Damas, Bois de Oud..."
            className="bg-admin-surface-secondary border-admin-border text-admin-text-primary placeholder:text-admin-text-secondary/50"
          />
          <select
            value={newNotePyramid}
            onChange={(e) => setNewNotePyramid(e.target.value as PyramidKey)}
            className="px-3 py-2 rounded-md bg-admin-surface-secondary border border-admin-border text-admin-text-primary text-sm"
          >
            {PYRAMID_KEYS.map(p => (
              <option key={p} value={p}>{PYRAMID_LABELS[p]}</option>
            ))}
          </select>
          <select
            value={newNoteFamily}
            onChange={(e) => setNewNoteFamily(e.target.value as OlfactoryFamilyType)}
            className="px-3 py-2 rounded-md bg-admin-surface-secondary border border-admin-border text-admin-text-primary text-sm"
          >
            {OLFACTORY_FAMILIES.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <Button
            onClick={handleAddNote}
            disabled={!newNoteLabel.trim()}
            className="bg-admin-gold hover:bg-admin-gold-light text-admin-bg font-medium"
          >
            <Plus size={16} className="mr-1" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une note..."
          className="pl-10 bg-admin-surface-secondary border-admin-border text-admin-text-primary placeholder:text-admin-text-secondary/50"
        />
      </div>

      {/* Notes List */}
      <div className="glass-panel rounded-xl overflow-hidden border border-admin-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-surface-secondary border-b border-admin-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">Note</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">Famille</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">Pyramide</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              <AnimatePresence mode="popLayout">
                {currentNotes.map((note) => {
                  const colors = PYRAMID_COLORS[note.pyramid];
                  const isEditing = editingId === note.id;

                  if (isEditing) {
                    return (
                      <motion.tr
                        key={note.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-admin-gold/5"
                      >
                        <td className="px-4 py-2">
                          <input
                            value={editState.label}
                            onChange={(e) => setEditState(s => ({ ...s, label: e.target.value }))}
                            onKeyDown={handleEditKeyDown}
                            autoFocus
                            className="w-full px-2 py-1.5 rounded bg-admin-surface-secondary border border-admin-border text-sm text-admin-text-primary"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={editState.family}
                            onChange={(e) => setEditState(s => ({ ...s, family: e.target.value as OlfactoryFamilyType }))}
                            className="px-2 py-1.5 rounded bg-admin-surface-secondary border border-admin-border text-sm text-admin-text-primary"
                          >
                            {OLFACTORY_FAMILIES.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={editState.pyramid}
                            onChange={(e) => setEditState(s => ({ ...s, pyramid: e.target.value as PyramidKey }))}
                            className="px-2 py-1.5 rounded bg-admin-surface-secondary border border-admin-border text-sm text-admin-text-primary"
                          >
                            {PYRAMID_KEYS.map(p => (
                              <option key={p} value={p}>{PYRAMID_LABELS[p]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                              title="Sauvegarder"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Annuler"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }

                  return (
                    <motion.tr
                      key={note.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-admin-text-primary">{note.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${FAMILY_COLORS[note.family || ''] || 'bg-gray-500/20 text-gray-300'}`}>
                          {note.family || 'Non classée'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${colors.badge}`}>
                          {PYRAMID_LABELS[note.pyramid]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(note)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-admin-gold/10 text-admin-text-secondary hover:text-admin-gold"
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              deleteConfirm === note.id
                                ? 'bg-red-500/20 text-red-400'
                                : 'hover:bg-red-500/10 text-admin-text-secondary hover:text-red-400'
                            }`}
                            title={deleteConfirm === note.id ? 'Cliquer à nouveau pour confirmer' : 'Supprimer'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {currentNotes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-admin-text-secondary">
                    {searchQuery || filterFamily
                      ? 'Aucune note ne correspond aux filtres'
                      : 'Aucune note dans cette catégorie'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OlfactoryNotesManager;
