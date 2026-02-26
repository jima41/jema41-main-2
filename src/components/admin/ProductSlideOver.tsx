import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, ChevronDown, Search, Loader2, Upload, Camera, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useAdminStore, Product, classifyPerfume } from '@/store/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import useSupabaseErrorHandler from '@/hooks/use-supabase-error';
import { useOlfactoryNotesStore } from '@/store/useOlfactoryNotesStore';
import { uploadProductImage, deleteProductImage, isSupabaseStorageUrl } from '@/integrations/supabase/supabase';
import type { OlfactoryFamily } from '@/lib/olfactory';

interface ProductSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  product?: Product | null;
}

const generateId = (): string => {
  return `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const ProductSlideOver: React.FC<ProductSlideOverProps> = ({
  isOpen,
  onClose,
  mode,
  product,
}) => {
  const { addProduct, updateProduct } = useAdminStore();
  const { toast } = useToast();
  const { handleError, handleSuccess } = useSupabaseErrorHandler();
  const { notes: allOlfactoryNotes, getNotesByPyramid, addNote: addOlfactoryNote } = useOlfactoryNotesStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null);
  const [isInputsReady, setIsInputsReady] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Helpers to avoid polluting production console
  const devLog = (...args: any[]) => { if (process.env.NODE_ENV === 'development') console.debug(...args); };
  const devWarn = (...args: any[]) => { if (process.env.NODE_ENV === 'development') console.warn(...args); };
  const devError = (...args: any[]) => { if (process.env.NODE_ENV === 'development') console.error(...args); };

  // Marquer les inputs comme prêts après le montage
  useEffect(() => {
    setIsInputsReady(true);
  }, []);


  // Gestionnaire d'upload de fichier vers Supabase Storage
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    devLog('🔍 handleFileUpload appelé avec event:', event);
    devLog('🔍 event.target:', event.target);
    devLog('🔍 event.target.files:', event.target.files);

    const file = event.target.files?.[0];
    if (file) {
    devLog('Fichier reçu (dev)');
    devLog('📁 Fichier détecté:', file);
    devLog('📁 Fichier sélectionné:', {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
      });
      
      // Vérifier les variables d'environnement
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      devLog('🔧 Variables Supabase:', {
        url: supabaseUrl ? '✅ Présente' : '❌ MANQUANTE',
        key: supabaseKey ? '✅ Présente' : '❌ MANQUANTE'
      });
      
      try {
        setIsUploadingImage(true);
        setImageUploadStatus('uploading');
        
        // Afficher l'aperçu immédiat
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          console.warn('⚠️ Type de fichier invalide:', file.type);
          toast.error('Veuillez sélectionner un fichier image valide');
          URL.revokeObjectURL(previewUrl); // Nettoyer l'URL temporaire
          setImageUploadStatus('error');
          return;
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn('⚠️ Fichier trop volumineux:', file.size);
          toast.error('L\'image ne doit pas dépasser 5MB');
          URL.revokeObjectURL(previewUrl); // Nettoyer l'URL temporaire
          setImageUploadStatus('error');
          return;
        }

        devLog('📤 Démarrage de l\'upload vers Supabase Storage...');
        
        // Upload vers Supabase Storage
        const imageUrl = await uploadProductImage(file, 'product-images', 'products');
        devLog('✅ URL reçue de Supabase:', imageUrl);
        
        // Nettoyer l'URL temporaire et mettre à jour avec l'URL finale
        URL.revokeObjectURL(previewUrl);
        
        // Mettre à jour le formulaire avec la nouvelle URL (équivalent de setValue avec shouldValidate)
        devLog('📝 Injection de l\'URL dans le formulaire:', imageUrl);
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setImagePreview(imageUrl);
        setImageUploadStatus('success');
        
        // Effacer l'erreur de validation pour ce champ (équivalent de shouldValidate: true)
        setErrors(prev => ({ ...prev, image: undefined }));
        
        devLog('🎉 Upload terminé avec succès');
        toast.success('Image uploadée avec succès !');
        
      } catch (error: any) {
        devError('❌ Erreur complète lors de l\'upload:', error);
        devError('❌ Message d\'erreur:', error?.message);
        devError('❌ Stack trace:', error?.stack);
        toast.error(error.message || 'Erreur lors du chargement de l\'image');
        setImageUploadStatus('error');
      } finally {
        setIsUploadingImage(false);
        // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
          if (fileInputRef.current) {
          fileInputRef.current.value = '';
          devLog('🔄 Input file réinitialisé');
        }
      }
    } else {
      devWarn('⚠️ Aucun fichier sélectionné dans event.target.files');
    }
  };

  // Gestionnaire de capture caméra vers Supabase Storage
  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploadingImage(true);
        setImageUploadStatus('uploading');
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          toast.error('Veuillez capturer une image valide');
          setImageUploadStatus('error');
          return;
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('L\'image ne doit pas dépasser 5MB');
          setImageUploadStatus('error');
          return;
        }

        console.log('📷 Upload de la capture vers Supabase Storage...');
        
        // Upload vers Supabase Storage
        const imageUrl = await uploadProductImage(file, 'product-images', 'products');
        
        // Mettre à jour le formulaire avec la nouvelle URL (équivalent de setValue avec shouldValidate)
        console.log('📝 Injection de l\'URL dans le formulaire:', imageUrl);
        setFormData({ ...formData, image: imageUrl });
        setImagePreview(imageUrl);
        setImageUploadStatus('success');
        
        // Effacer l'erreur de validation pour ce champ (équivalent de shouldValidate: true)
        setErrors(prev => ({ ...prev, image: undefined }));
        
        toast.success('Image capturée et uploadée avec succès !');
        
      } catch (error) {
        console.error('Erreur lors de la capture:', error);
        toast.error('Erreur lors de la capture de l\'image');
        setImageUploadStatus('error');
      } finally {
        setIsUploadingImage(false);
        // Réinitialiser l'input pour permettre de capturer à nouveau
        if (cameraInputRef.current) {
          cameraInputRef.current.value = '';
        }
      }
    }
  };

  // Gestionnaire pour déclencher l'upload de fichier
  const triggerFileUpload = () => {
    console.log('🎯 triggerFileUpload appelé');
    console.log('📋 État des inputs:', {
      isInputsReady,
      fileInputRef: !!fileInputRef.current,
      fileInputElement: fileInputRef.current
    });

    if (!isInputsReady) {
      console.warn('⚠️ Inputs pas encore prêts');
      toast.error('Interface en cours de chargement, veuillez réessayer');
      return;
    }

    if (!fileInputRef.current) {
      console.error('❌ Référence fileInputRef non disponible');
      toast.error('Erreur technique: input fichier non disponible');
      return;
    }

    try {
      console.log('📂 Déclenchement du click sur fileInput');
      fileInputRef.current.click();
      console.log('✅ Click déclenché sur fileInput');
    } catch (error) {
      console.error('❌ Erreur lors du déclenchement du fileInput:', error);
      toast.error('Erreur lors de l\'ouverture du sélecteur de fichiers');
    }
  };

  // Gestionnaire pour déclencher la capture caméra
  const triggerCameraCapture = () => {
    console.log('📷 triggerCameraCapture appelé');
    console.log('📋 État des inputs:', {
      isInputsReady,
      cameraInputRef: !!cameraInputRef.current,
      cameraInputElement: cameraInputRef.current
    });

    if (!isInputsReady) {
      console.warn('⚠️ Inputs pas encore prêts');
      toast.error('Interface en cours de chargement, veuillez réessayer');
      return;
    }

    if (!cameraInputRef.current) {
      console.error('❌ Référence cameraInputRef non disponible');
      toast.error('Erreur technique: input caméra non disponible');
      return;
    }

    try {
      console.log('📷 Déclenchement du click sur cameraInput');
      cameraInputRef.current.click();
      console.log('✅ Click déclenché sur cameraInput');
    } catch (error) {
      console.error('❌ Erreur lors du déclenchement du cameraInput:', error);
      toast.error('Erreur lors de l\'ouverture de la caméra');
    }
  };
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: 0,
    image: '',
    stock: 50,
    monthlySales: 50,
    description: '',
    volume: '50ml',
    concentration: 'EDP',
    gender: 'mixte' as 'homme' | 'femme' | 'mixte',
    notes_tete: [] as string[],
    notes_coeur: [] as string[],
    notes_fond: [] as string[],
  });
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const [calculatedFamilies, setCalculatedFamilies] = useState<OlfactoryFamily[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQueries, setSearchQueries] = useState({
    tete: '',
    coeur: '',
    fond: '',
  });
  const [openDropdowns, setOpenDropdowns] = useState({
    tete: false,
    coeur: false,
    fond: false,
  });
  const [addingNote, setAddingNote] = useState({
    tete: false,
    coeur: false,
    fond: false,
  });


  // Get available notes from the dynamic store, filtered by search
  const filteredTeteNotes = useMemo(
    () => getNotesByPyramid('tete').filter(note =>
      note.label.toLowerCase().includes(searchQueries.tete.toLowerCase())
    ),
    [searchQueries.tete, allOlfactoryNotes]
  );

  const filteredCoeurNotes = useMemo(
    () => getNotesByPyramid('coeur').filter(note =>
      note.label.toLowerCase().includes(searchQueries.coeur.toLowerCase())
    ),
    [searchQueries.coeur, allOlfactoryNotes]
  );

  const filteredFondNotes = useMemo(
    () => getNotesByPyramid('fond').filter(note =>
      note.label.toLowerCase().includes(searchQueries.fond.toLowerCase())
    ),
    [searchQueries.fond, allOlfactoryNotes]
  );

  // Calculate families in real-time
  useEffect(() => {
    const families = classifyPerfume(formData.notes_tete, formData.notes_coeur, formData.notes_fond);
    setCalculatedFamilies(Array.from(families));
  }, [formData.notes_tete, formData.notes_coeur, formData.notes_fond]);

  // Effacer l'erreur d'image quand une URL est présente
  useEffect(() => {
    if (formData.image && formData.image.trim()) {
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  }, [formData.image]);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        stock: product.stock,
        monthlySales: product.monthlySales,
        description: product.description || '',
        volume: product.volume || '50ml',
        concentration: (product as any).concentration || 'EDP',
        gender: product.gender || 'mixte',
        notes_tete: product.notes_tete || [],
        notes_coeur: product.notes_coeur || [],
        notes_fond: product.notes_fond || [],
      });
      // Set image preview and store old image URL for potential cleanup
      setImagePreview(product.image);
      setOldImageUrl(product.image);
    } else {
      setFormData({
        name: '',
        brand: '',
        price: 0,
        image: '',
        stock: 50,
        monthlySales: 50,
        description: '',
        volume: '50ml',
        gender: 'mixte',
        notes_tete: [],
        notes_coeur: [],
        notes_fond: [],
      });
      setImagePreview(null);
      setOldImageUrl(null);
    }
    setSearchQueries({ tete: '', coeur: '', fond: '' });
    setOpenDropdowns({ tete: false, coeur: false, fond: false });
    setErrors({});
  }, [mode, product, isOpen]);

  const validateForm = (): boolean => {
    console.log('🔍 Validation du formulaire - formData.image:', formData.image);
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.brand.trim()) newErrors.brand = 'La marque est requise';
    if (formData.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0';
    if (formData.notes_tete.length === 0 && formData.notes_coeur.length === 0 && formData.notes_fond.length === 0) {
      newErrors.notes = 'Sélectionnez au moins une note olfactive';
    }
    if (calculatedFamilies.length === 0) {
      newErrors.families = 'Impossible de classifier le parfum - sélectionnez d\'autres notes';
    }
    if (!formData.image.trim()) newErrors.image = "L'URL de l'image, une image uploadée ou une URL Supabase Storage est requise";
    if (formData.stock < 0) newErrors.stock = 'Le stock ne peut pas être négatif';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        families: calculatedFamilies,
        scent: [...formData.notes_tete, ...formData.notes_coeur, ...formData.notes_fond].join(', '),
        // concentration is stored in the category DB column (families[] holds olfactory families)
        category: formData.concentration || 'EDP',
        notes: [...formData.notes_tete, ...formData.notes_coeur, ...formData.notes_fond],
      };

      // Gérer la suppression de l'ancienne image si elle a été remplacée
      if (mode === 'edit' && oldImageUrl && oldImageUrl !== formData.image) {
        // Vérifier si l'ancienne image était stockée sur Supabase Storage
        if (isSupabaseStorageUrl(oldImageUrl)) {
          try {
            console.log('🗑️ Suppression de l\'ancienne image...');
            await deleteProductImage(oldImageUrl);
          } catch (deleteError) {
            console.warn('⚠️ Impossible de supprimer l\'ancienne image:', deleteError);
            // Ne pas échouer la sauvegarde pour autant
          }
        }
      }

      if (mode === 'add') {
        const newProduct: Product = {
          id: generateId(),
          ...productData,
        };
        await addProduct(newProduct);
        handleSuccess('Produit ajouté avec succès ✨', 'Succès');
      } else if (product) {
        await updateProduct(product.id, productData);
        handleSuccess('Produit modifié avec succès ✨', 'Succès');
      }

      onClose();
    } catch (error) {
      handleError(error, 'Une erreur est survenue lors de la sauvegarde du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xl z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-2xl bg-[#1A1D23] border-l border-admin-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border">
          <h2 className="text-2xl font-bold text-admin-text-primary font-montserrat">
            {mode === 'add' ? 'Ajouter un Parfum' : 'Modifier le Parfum'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-admin-card rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-admin-text-secondary" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nom */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Nom du Parfum *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Rose Éternelle"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Marque */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Marque *
            </Label>
            <Input
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ex: Luxe Fragrances"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.brand ? 'border-red-500' : ''
              }`}
            />
            {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand}</p>}
          </div>

          {/* Prix */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Prix (€) *
            </Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="99.99"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.price ? 'border-red-500' : ''
              }`}
              step="0.01"
              min="0"
            />
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
          </div>

        {/* Notes de Tête */}
        <div>
          <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
            Sélectionner Notes de Tête *
          </Label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdowns({ ...openDropdowns, tete: !openDropdowns.tete })}
              className="w-full flex items-center justify-between px-3 py-2 bg-admin-card border border-admin-border rounded-md text-admin-text-primary hover:border-amber-500/50 transition-colors"
            >
              <span className="text-sm">
                {formData.notes_tete.length > 0
                  ? `${formData.notes_tete.length} note${formData.notes_tete.length > 1 ? 's' : ''} sélectionnée${formData.notes_tete.length > 1 ? 's' : ''}`
                  : 'Sélectionner...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdowns.tete ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdowns.tete && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-admin-card border border-admin-border rounded-md shadow-lg z-50 max-h-64 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-admin-border sticky top-0 bg-admin-card">
                  <div className="flex items-center gap-2 bg-admin-border/30 px-2 py-1 rounded">
                    <Search className="w-4 h-4 text-admin-text-secondary" />
                    <input
                      type="text"
                      placeholder="Rechercher ou créer..."
                      value={searchQueries.tete}
                      onChange={(e) => setSearchQueries({ ...searchQueries, tete: e.target.value })}
                      className="bg-transparent text-admin-text-primary text-xs outline-none flex-1"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto">
                  {filteredTeteNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          notes_tete: formData.notes_tete.includes(note.label)
                            ? formData.notes_tete.filter(n => n !== note.label)
                            : [...formData.notes_tete, note.label],
                        });
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        formData.notes_tete.includes(note.label)
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-admin-text-secondary hover:bg-admin-border/30'
                      }`}
                    >
                      {formData.notes_tete.includes(note.label) ? '✓ ' : '  '}{note.label}
                    </button>
                  ))}
                  {searchQueries.tete.trim() && !getNotesByPyramid('tete').some(n => n.label.toLowerCase() === searchQueries.tete.trim().toLowerCase()) && (
                    <button
                      disabled={addingNote.tete}
                      onClick={async () => {
                        const label = searchQueries.tete.trim();
                        setAddingNote(s => ({ ...s, tete: true }));
                        await addOlfactoryNote(label, 'tete', 'Floral');
                        setFormData(prev => ({ ...prev, notes_tete: prev.notes_tete.includes(label) ? prev.notes_tete : [...prev.notes_tete, label] }));
                        setSearchQueries(prev => ({ ...prev, tete: '' }));
                        setAddingNote(s => ({ ...s, tete: false }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 border-t border-admin-border flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                      Créer «{searchQueries.tete.trim()}» en Note de Tête
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {formData.notes_tete.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.notes_tete.map((label) => (
                <Badge key={label} variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Notes de Cœur */}
        <div>
          <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
            Sélectionner Notes de Cœur *
          </Label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdowns({ ...openDropdowns, coeur: !openDropdowns.coeur })}
              className="w-full flex items-center justify-between px-3 py-2 bg-admin-card border border-admin-border rounded-md text-admin-text-primary hover:border-amber-500/50 transition-colors"
            >
              <span className="text-sm">
                {formData.notes_coeur.length > 0
                  ? `${formData.notes_coeur.length} note${formData.notes_coeur.length > 1 ? 's' : ''} sélectionnée${formData.notes_coeur.length > 1 ? 's' : ''}`
                  : 'Sélectionner...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdowns.coeur ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdowns.coeur && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-admin-card border border-admin-border rounded-md shadow-lg z-50 max-h-64 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-admin-border sticky top-0 bg-admin-card">
                  <div className="flex items-center gap-2 bg-admin-border/30 px-2 py-1 rounded">
                    <Search className="w-4 h-4 text-admin-text-secondary" />
                    <input
                      type="text"
                      placeholder="Rechercher ou créer..."
                      value={searchQueries.coeur}
                      onChange={(e) => setSearchQueries({ ...searchQueries, coeur: e.target.value })}
                      className="bg-transparent text-admin-text-primary text-xs outline-none flex-1"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto">
                  {filteredCoeurNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          notes_coeur: formData.notes_coeur.includes(note.label)
                            ? formData.notes_coeur.filter(n => n !== note.label)
                            : [...formData.notes_coeur, note.label],
                        });
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        formData.notes_coeur.includes(note.label)
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-admin-text-secondary hover:bg-admin-border/30'
                      }`}
                    >
                      {formData.notes_coeur.includes(note.label) ? '✓ ' : '  '}{note.label}
                    </button>
                  ))}
                  {searchQueries.coeur.trim() && !getNotesByPyramid('coeur').some(n => n.label.toLowerCase() === searchQueries.coeur.trim().toLowerCase()) && (
                    <button
                      disabled={addingNote.coeur}
                      onClick={async () => {
                        const label = searchQueries.coeur.trim();
                        setAddingNote(s => ({ ...s, coeur: true }));
                        await addOlfactoryNote(label, 'coeur', 'Floral');
                        setFormData(prev => ({ ...prev, notes_coeur: prev.notes_coeur.includes(label) ? prev.notes_coeur : [...prev.notes_coeur, label] }));
                        setSearchQueries(prev => ({ ...prev, coeur: '' }));
                        setAddingNote(s => ({ ...s, coeur: false }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 border-t border-admin-border flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                      Créer «{searchQueries.coeur.trim()}» en Note de Cœur
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {formData.notes_coeur.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.notes_coeur.map((label) => (
                <Badge key={label} variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Notes de Fond */}
        <div>
          <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
            Sélectionner Notes de Fond *
          </Label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdowns({ ...openDropdowns, fond: !openDropdowns.fond })}
              className="w-full flex items-center justify-between px-3 py-2 bg-admin-card border border-admin-border rounded-md text-admin-text-primary hover:border-amber-500/50 transition-colors"
            >
              <span className="text-sm">
                {formData.notes_fond.length > 0
                  ? `${formData.notes_fond.length} note${formData.notes_fond.length > 1 ? 's' : ''} sélectionnée${formData.notes_fond.length > 1 ? 's' : ''}`
                  : 'Sélectionner...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdowns.fond ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdowns.fond && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-admin-card border border-admin-border rounded-md shadow-lg z-50 max-h-64 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-admin-border sticky top-0 bg-admin-card">
                  <div className="flex items-center gap-2 bg-admin-border/30 px-2 py-1 rounded">
                    <Search className="w-4 h-4 text-admin-text-secondary" />
                    <input
                      type="text"
                      placeholder="Rechercher ou créer..."
                      value={searchQueries.fond}
                      onChange={(e) => setSearchQueries({ ...searchQueries, fond: e.target.value })}
                      className="bg-transparent text-admin-text-primary text-xs outline-none flex-1"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto">
                  {filteredFondNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          notes_fond: formData.notes_fond.includes(note.label)
                            ? formData.notes_fond.filter(n => n !== note.label)
                            : [...formData.notes_fond, note.label],
                        });
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        formData.notes_fond.includes(note.label)
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-admin-text-secondary hover:bg-admin-border/30'
                      }`}
                    >
                      {formData.notes_fond.includes(note.label) ? '✓ ' : '  '}{note.label}
                    </button>
                  ))}
                  {searchQueries.fond.trim() && !getNotesByPyramid('fond').some(n => n.label.toLowerCase() === searchQueries.fond.trim().toLowerCase()) && (
                    <button
                      disabled={addingNote.fond}
                      onClick={async () => {
                        const label = searchQueries.fond.trim();
                        setAddingNote(s => ({ ...s, fond: true }));
                        await addOlfactoryNote(label, 'fond', 'Boisé');
                        setFormData(prev => ({ ...prev, notes_fond: prev.notes_fond.includes(label) ? prev.notes_fond : [...prev.notes_fond, label] }));
                        setSearchQueries(prev => ({ ...prev, fond: '' }));
                        setAddingNote(s => ({ ...s, fond: false }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 border-t border-admin-border flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                      Créer «{searchQueries.fond.trim()}» en Note de Fond
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {formData.notes_fond.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.notes_fond.map((label) => (
                <Badge key={label} variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
          {errors.notes && <p className="text-red-400 text-xs mt-1">{errors.notes}</p>}
        </div>

        {/* Familles Olfactives (Calculated) */}
        <div>
          <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
            Familles Détectées ✨
          </Label>
          <div className="flex flex-wrap gap-2">
            {calculatedFamilies.length > 0 ? (
              calculatedFamilies.map((family) => (
                <Badge 
                  key={family} 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs"
                >
                  {family}
                </Badge>
              ))
            ) : (
              <p className="text-admin-text-secondary text-xs">Sélectionnez des notes pour détecter automatiquement les familles</p>
            )}
          </div>
          {errors.families && <p className="text-red-400 text-xs mt-1">{errors.families}</p>}
        </div>

          {/* Stock Initial */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Stock Initial *
            </Label>
            <Input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              placeholder="50"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.stock ? 'border-red-500' : ''
              }`}
              min="0"
            />
            {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
          </div>

          {/* Vélocité (Slider) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat">
                Vélocité (Ventes/mois)
              </Label>
              <span className="text-admin-gold font-semibold">{formData.monthlySales}</span>
            </div>
            <Slider
              value={[formData.monthlySales]}
              onValueChange={(value) => setFormData({ ...formData, monthlySales: value[0] })}
              min={0}
              max={200}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-admin-text-secondary mt-2">
              Ajustez pour tester les prédictions de rupture de stock
            </p>
          </div>

          {/* URL Image */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Image du Produit *
            </Label>
            
            {/* Aperçu de l'image */}
            {imagePreview && (
              <div className="mb-3">
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  loading="lazy"
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg border border-admin-border"
                />
                {/* Feedback visuel du statut d'upload */}
                {imageUploadStatus === 'success' && (
                  <div className="flex items-center mt-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Image uploadée avec succès
                  </div>
                )}
                {imageUploadStatus === 'error' && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Erreur lors de l'upload
                  </div>
                )}
              </div>
            )}

            {/* Boutons d'upload */}
            <div className="flex gap-2 mb-3">
                <Button
                type="button"
                onClick={() => {
                  if (process.env.NODE_ENV === 'development') console.debug('🖱️ Bouton Fichiers cliqué');
                  triggerFileUpload();
                }}
                variant="outline"
                size="sm"
                className="flex-1 border-admin-border text-admin-text-secondary hover:text-admin-gold hover:border-admin-gold"
                disabled={!isInputsReady || isUploadingImage}
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploadingImage ? 'Upload...' : 'Fichiers'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (process.env.NODE_ENV === 'development') console.debug('📷 Bouton Caméra cliqué');
                  triggerCameraCapture();
                }}
                variant="outline"
                size="sm"
                className="flex-1 border-admin-border text-admin-text-secondary hover:text-admin-gold hover:border-admin-gold"
                disabled={!isInputsReady || isUploadingImage}
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                {isUploadingImage ? 'Capture...' : 'Caméra'}
              </Button>
            </div>

            {/* Champ URL de l'image */}
            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://... ou upload via les boutons ci-dessus"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.image ? 'border-red-500' : ''
              }`}
            />
            {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
            <p className="text-xs text-admin-text-secondary mt-1">
              Upload une image ou colle une URL externe
            </p>

            {/* Input caché pour les fichiers */}
            <input
              ref={(el) => {
                console.log('📋 File input ref assigné:', el);
                fileInputRef.current = el;
              }}
              type="file"
              accept="image/*"
              onChange={(e) => {
                console.log('📁 File input onChange déclenché');
                handleFileUpload(e);
              }}
              className="hidden"
            />

            {/* Input caché pour la caméra */}
            <input
              ref={(el) => {
                console.log('📷 Camera input ref assigné:', el);
                cameraInputRef.current = el;
              }}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                console.log('📷 Camera input onChange déclenché');
                handleCameraCapture(e);
              }}
              className="hidden"
            />

            {/* Champ URL (optionnel si image uploadée) */}
            <Input
              value={formData.image}
              onChange={(e) => {
                setFormData({ ...formData, image: e.target.value });
                setImagePreview(e.target.value || null);
              }}
              placeholder="https://... ou URL générée automatiquement"
              className={`bg-admin-card border-admin-border text-admin-text-primary ${
                errors.image ? 'border-red-500' : ''
              }`}
            />
            {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
            <p className="text-xs text-admin-text-secondary mt-1">
              Utilisez les boutons ci-dessus pour uploader ou collez une URL externe
            </p>
          </div>

          {/* Description */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Description
            </Label>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <button
                  type="button"
                  aria-label="Mettre en gras"
                  title="Mettre en gras (entoure la sélection avec ** )"
                  onClick={() => {
                    const el = descriptionRef.current;
                    if (!el) return;
                    const start = el.selectionStart ?? 0;
                    const end = el.selectionEnd ?? 0;
                    const val = formData.description || '';
                    const selected = val.slice(start, end);

                    // If selection already wrapped with **...**, remove wrapping
                    if (selected.startsWith('**') && selected.endsWith('**')) {
                      const inner = selected.slice(2, selected.length - 2);
                      const newVal = val.slice(0, start) + inner + val.slice(end);
                      setFormData({ ...formData, description: newVal });
                      requestAnimationFrame(() => {
                        el.focus();
                        el.selectionStart = start;
                        el.selectionEnd = start + inner.length;
                      });
                      return;
                    }

                    if (start === end) {
                      // Insert placeholder **bold** and select 'bold'
                      const insert = '**bold**';
                      const newVal = val.slice(0, start) + insert + val.slice(end);
                      setFormData({ ...formData, description: newVal });
                      requestAnimationFrame(() => {
                        el.focus();
                        const pos = start + 2;
                        el.selectionStart = pos;
                        el.selectionEnd = pos + 4;
                      });
                      return;
                    }

                    // Wrap selection with ** **
                    const wrapped = '**' + selected + '**';
                    const newVal = val.slice(0, start) + wrapped + val.slice(end);
                    setFormData({ ...formData, description: newVal });
                    requestAnimationFrame(() => {
                      el.focus();
                      el.selectionStart = start;
                      el.selectionEnd = end + 4; // added two ** on each side
                    });
                  }}
                  className="w-8 h-8 rounded-md border border-admin-border bg-admin-card text-admin-text-primary flex items-center justify-center font-semibold hover:bg-admin-border/30"
                >
                  B
                </button>
              </div>
              <textarea
                ref={descriptionRef}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez ce parfum... Vous pouvez utiliser **gras** et sauter des lignes."
                className="w-full px-3 py-2 bg-admin-card border border-admin-border rounded-md text-admin-text-primary text-sm resize-none"
                rows={4}
              />
            </div>
            <p className="text-xs text-admin-text-secondary mt-2">Astuce: utilisez <strong>**texte en gras**</strong> et laissez une ligne vide pour créer un nouveau paragraphe.</p>
          </div>

          {/* Volume */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Volume
            </Label>
            <Input
              value={formData.volume}
              onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              placeholder="50ml"
              className="bg-admin-card border-admin-border text-admin-text-primary"
            />
          </div>

          {/* Concentration / Type de parfum */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Type / Concentration
            </Label>
            <div className="flex gap-2">
              {([
                { value: 'EX', label: 'Extrait de Parfum' },
                { value: 'EDP', label: 'Eau de Parfum' },
                { value: 'EDT', label: 'Eau de Toilette' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, concentration: opt.value })}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold tracking-wide transition-all duration-200 ${
                    formData.concentration === opt.value
                      ? 'bg-amber-500/20 text-amber-400 border-amber-400'
                      : 'bg-admin-card border-admin-border text-admin-text-secondary hover:border-admin-border/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pour (Gender) */}
          <div>
            <Label className="text-admin-text-secondary uppercase text-xs tracking-wide font-montserrat mb-2 block">
              Pour
            </Label>
            <div className="flex gap-2">
              {([
                { value: 'homme' as const, label: 'Lui', activeClass: 'bg-[#0A1128]/30 text-[#7B8FAF] border-[#0A1128]/60' },
                { value: 'femme' as const, label: 'Elle', activeClass: 'bg-[#D4AF37]/30 text-[#D4AF37] border-[#D4AF37]/60' },
                { value: 'mixte' as const, label: 'Lui & Elle', activeClass: 'bg-gradient-to-r from-[#0A1128]/20 to-[#D4AF37]/20 text-admin-text-primary border-admin-border' },
              ]).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: option.value })}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-semibold tracking-wide transition-all duration-200 ${
                    formData.gender === option.value
                      ? option.activeClass
                      : 'bg-admin-card border-admin-border text-admin-text-secondary hover:border-admin-border/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex gap-3 p-6 border-t border-admin-border">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-admin-border text-admin-text-secondary hover:bg-admin-card"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || isUploadingImage}
            className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {'Sauvegarde...'}
              </>
            ) : isUploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {'Upload en cours...'}
              </>
            ) : (
              mode === 'add' ? 'Créer' : 'Modifier'
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductSlideOver;
