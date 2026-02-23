import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { getAllScentProfiles } from '@/integrations/supabase/supabase';
import { ScentProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserScentProfile extends ScentProfile {
  user_id: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

const AdminScentID = () => {
  const navigate = useNavigate();
  const [scentProfiles, setScentProfiles] = useState<UserScentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<UserScentProfile | null>(null);

  useEffect(() => {
    loadScentProfiles();
  }, []);

  const loadScentProfiles = async () => {
    try {
      const profiles = await getAllScentProfiles();
      setScentProfiles(profiles);
    } catch (error) {
      console.error('Erreur lors du chargement des profils olfactifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScentScoreData = (profile: UserScentProfile) => {
    const families = ['gourmand', 'frais', 'épicé', 'boisé', 'floral', 'oriental', 'cuiré'];
    return families.map(family => ({
      category: family.charAt(0).toUpperCase() + family.slice(1),
      score: profile.scent_score?.[family as keyof typeof profile.scent_score] || 0,
      isPrimary: profile.primary_family === family,
      isSecondary: profile.secondary_family === family
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel border border-admin-border rounded-lg p-3 backdrop-blur-md">
          <p className="text-sm font-medium text-admin-text-primary">{data.category}</p>
          <p className="text-xs text-admin-text-secondary">
            Score: <span className="font-medium text-admin-gold">{data.score}/100</span>
          </p>
          {data.isPrimary && (
            <Badge variant="secondary" className="text-xs mt-1">Famille Primaire</Badge>
          )}
          {data.isSecondary && (
            <Badge variant="outline" className="text-xs mt-1">Famille Secondaire</Badge>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/clients')}>
            Voir les comptes clients
          </Button>
        </div>
        <Card className="glass-panel border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-admin-gold" />
              <div>
                <p className="text-sm text-admin-text-secondary">Profils Actifs</p>
                <p className="text-2xl font-bold text-admin-text-primary">{scentProfiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-admin-text-secondary">Famille Préférée</p>
                <p className="text-lg font-bold text-admin-text-primary">
                  {scentProfiles.length > 0 ? (
                    Object.entries(
                      scentProfiles.reduce((acc, profile) => {
                        acc[profile.primary_family] = (acc[profile.primary_family] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                  ) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-admin-text-secondary">Dernière Analyse</p>
                <p className="text-sm font-bold text-admin-text-primary">
                  {scentProfiles.length > 0 ? (
                    format(new Date(Math.max(...scentProfiles.map(p => new Date(p.updated_at).getTime()))), 'dd/MM', { locale: fr })
                  ) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-admin-text-secondary">Sessions Quiz</p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {scentProfiles.reduce((acc, profile) => acc + (profile.quiz_history?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles List */}
      <Card className="glass-panel border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-text-primary font-montserrat">Profils Olfactifs Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scentProfiles.map((profile) => (
              <div
                key={profile.user_id}
                className="flex items-center justify-between p-4 border border-admin-border rounded-lg hover:bg-admin-surface/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-admin-text-primary">
                        Utilisateur {profile.user_id.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-admin-text-secondary">
                        Famille: {profile.primary_family}
                        {profile.secondary_family && ` → ${profile.secondary_family}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-admin-text-secondary">
                    <span>Créé: {format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: fr })}</span>
                    <span>Dernière MAJ: {format(new Date(profile.updated_at), 'dd/MM/yyyy', { locale: fr })}</span>
                    <span>{profile.quiz_history?.length || 0} sessions</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProfile(profile)}
                  className="border-admin-border text-admin-text-primary hover:bg-admin-surface"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Analyser
                </Button>
              </div>
            ))}

            {scentProfiles.length === 0 && (
              <div className="text-center py-8 text-admin-text-secondary">
                Aucun profil olfactif trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel border-admin-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-admin-text-primary font-montserrat">
                Profil Olfactif - Utilisateur {selectedProfile.user_id.slice(0, 8)}...
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProfile(null)}
                className="text-admin-text-secondary hover:text-admin-text-primary"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Radar Chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getScentScoreData(selectedProfile)}>
                    <PolarGrid stroke="rgba(212, 175, 55, 0.1)" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: 'rgba(212, 175, 55, 0.7)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: 'rgba(179, 181, 192, 0.5)', fontSize: 11 }}
                    />
                    <Radar
                      name="Score Olfactif"
                      dataKey="score"
                      stroke="rgba(212, 175, 55, 0.8)"
                      fill="rgba(212, 175, 55, 0.2)"
                      fillOpacity={0.5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-admin-text-primary">Informations Générales</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-admin-text-secondary">Famille Primaire:</span>
                      <Badge variant="default">{selectedProfile.primary_family}</Badge>
                    </div>
                    {selectedProfile.secondary_family && (
                      <div className="flex justify-between">
                        <span className="text-admin-text-secondary">Famille Secondaire:</span>
                        <Badge variant="outline">{selectedProfile.secondary_family}</Badge>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-admin-text-secondary">Créé le:</span>
                      <span className="text-admin-text-primary">
                        {format(new Date(selectedProfile.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-admin-text-secondary">Dernière MAJ:</span>
                      <span className="text-admin-text-primary">
                        {format(new Date(selectedProfile.updated_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-admin-text-primary">Historique des Quiz</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedProfile.quiz_history?.map((quiz, index) => (
                      <div key={index} className="text-xs p-2 bg-admin-surface rounded border">
                        <div className="flex justify-between">
                          <span className="text-admin-text-secondary">
                            {format(new Date(quiz.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {quiz.selected_family}
                          </Badge>
                        </div>
                        <p className="text-admin-text-primary mt-1">{quiz.quiz_type}</p>
                      </div>
                    )) || (
                      <p className="text-admin-text-secondary text-sm">Aucun historique</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Préférées */}
              {selectedProfile.notes_preferred && selectedProfile.notes_preferred.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-admin-text-primary">Notes Préférées</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.notes_preferred.map((note, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminScentID;