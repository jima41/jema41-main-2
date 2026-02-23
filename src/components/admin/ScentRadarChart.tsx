import React, { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

export interface ScentProfileData {
  category: string;
  clientPreference: number; // 0-100
  salesVolume: number; // 0-100 (normalized)
  seasonalDemand: number; // 0-100
  marginPotential: number; // 0-100
}

interface ScentRadarChartProps {
  data?: ScentProfileData[];
  height?: number;
  title?: string;
}

const DEFAULT_SCENT_DATA: ScentProfileData[] = [
  {
    category: 'Gourmand',
    clientPreference: 85,
    salesVolume: 82,
    seasonalDemand: 78,
    marginPotential: 88,
  },
  {
    category: 'Floral',
    clientPreference: 92,
    salesVolume: 75,
    seasonalDemand: 88,
    marginPotential: 85,
  },
  {
    category: 'Boisé',
    clientPreference: 76,
    salesVolume: 68,
    seasonalDemand: 72,
    marginPotential: 82,
  },
  {
    category: 'Oriental',
    clientPreference: 88,
    salesVolume: 79,
    seasonalDemand: 82,
    marginPotential: 90,
  },
  {
    category: 'Frais/Agrume',
    clientPreference: 72,
    salesVolume: 65,
    seasonalDemand: 92,
    marginPotential: 78,
  },
  {
    category: 'Musqué',
    clientPreference: 68,
    salesVolume: 58,
    seasonalDemand: 62,
    marginPotential: 80,
  },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel border border-admin-border rounded-lg p-3 backdrop-blur-md">
        <p className="text-sm font-medium text-admin-text-primary">{data.category}</p>
        <div className="space-y-1 mt-2 text-xs">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              <span className="text-admin-text-secondary">{entry.name}:</span>{' '}
              <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ScentRadarChart: React.FC<ScentRadarChartProps> = ({
  data = DEFAULT_SCENT_DATA,
  height = 400,
  title = 'Profil Olfactif',
}) => {
  const chartData = useMemo(() => data, [data]);

  return (
    <div className="w-full space-y-4">
      {title && (
        <div>
          <h3 className="text-xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
            {title}
          </h3>
          <p className="text-sm text-admin-text-secondary mt-1">
            Analyse comparative des familles olfactives
          </p>
        </div>
      )}

      <div className="glass-panel border border-admin-border rounded-lg p-6">
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
          >
            {/* Grille polaire avec couleur dorée */}
            <PolarGrid
              stroke="rgba(212, 175, 55, 0.1)"
              fill="rgba(15, 17, 21, 0.2)"
            />

            {/* Angles : catégories olfactives */}
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: 'rgba(212, 175, 55, 0.7)', fontSize: 12 }}
            />

            {/* Rayon radial */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'rgba(179, 181, 192, 0.5)', fontSize: 11 }}
              stroke="rgba(212, 175, 55, 0.15)"
            />

            {/* Données : Classification client */}
            <Radar
              name="Préférence Client"
              dataKey="clientPreference"
              stroke="rgba(212, 175, 55, 0.8)"
              fill="rgba(212, 175, 55, 0.2)"
              fillOpacity={0.5}
              isAnimationActive={true}
            />

            {/* Données : Volume de ventes */}
            <Radar
              name="Volume de Ventes"
              dataKey="salesVolume"
              stroke="rgba(34, 197, 94, 0.8)"
              fill="rgba(34, 197, 94, 0.15)"
              fillOpacity={0.4}
              isAnimationActive={true}
            />

            {/* Données : Demande saisonnière */}
            <Radar
              name="Demande Saisonnière"
              dataKey="seasonalDemand"
              stroke="rgba(59, 130, 246, 0.8)"
              fill="rgba(59, 130, 246, 0.15)"
              fillOpacity={0.4}
              isAnimationActive={true}
            />

            {/* Données : Potentiel de marge */}
            <Radar
              name="Potentiel Marge"
              dataKey="marginPotential"
              stroke="rgba(168, 85, 247, 0.8)"
              fill="rgba(168, 85, 247, 0.15)"
              fillOpacity={0.4}
              isAnimationActive={true}
            />

            {/* Tooltip personnalisée */}
            <Tooltip content={<CustomTooltip />} />

            {/* Légende */}
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="line"
              formatter={(value) => (
                <span style={{ color: 'rgba(212, 175, 55, 0.9)', fontSize: '12px' }}>
                  {value}
                </span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Info Box */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-admin-border">
          <div className="space-y-1">
            <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
              Priorité Haute
            </p>
            <p className="text-sm font-medium text-admin-gold">
              Floral, Oriental
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
              Potentiel
            </p>
            <p className="text-sm font-medium text-emerald-400">
              Saisonnier: Frais
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
              Margin Max
            </p>
            <p className="text-sm font-medium text-blue-400">
              Oriental (+90)
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
              À Développer
            </p>
            <p className="text-sm font-medium text-amber-400">
              Musqué, Boisé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
