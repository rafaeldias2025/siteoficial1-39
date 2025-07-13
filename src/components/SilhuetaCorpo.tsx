import React from 'react';
import { useDadosFisicos } from '@/hooks/useDadosFisicos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SilhuetaCorpoProps {}

const SilhuetaMasculina: React.FC<{ altura: number; peso: number; circunferencia: number; imc: number; risco: string }> = ({ 
  altura, peso, circunferencia, imc, risco 
}) => {
  const corCircunferencia = risco === 'Alto' ? '#ef4444' : risco === 'Moderado' ? '#f97316' : '#22c55e';
  
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <svg viewBox="0 0 200 400" className="w-full h-auto">
        {/* Silhueta masculina */}
        <path
          d="M100 40 C85 40 75 50 75 65 C75 75 80 85 90 90 L90 120 C85 125 80 130 75 140 L75 180 C75 190 80 200 90 200 L90 280 C90 290 85 300 80 310 L80 380 C80 390 85 395 95 395 L105 395 C115 395 120 390 120 380 L120 310 C115 300 110 290 110 280 L110 200 C120 200 125 190 125 180 L125 140 C120 130 115 125 110 120 L110 90 C120 85 125 75 125 65 C125 50 115 40 100 40 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          className="transition-colors duration-300"
        />
        
        {/* Marcador de altura */}
        <g className="animate-pulse">
          <line x1="30" y1="40" x2="30" y2="395" stroke="#3b82f6" strokeWidth="3" />
          <circle cx="30" cy="40" r="4" fill="#3b82f6" />
          <circle cx="30" cy="395" r="4" fill="#3b82f6" />
          <text x="15" y="220" fontSize="12" fill="#3b82f6" transform="rotate(-90 15 220)">
            📏 {altura}cm
          </text>
        </g>

        {/* Marcador de peso */}
        <g className="animate-bounce">
          <circle cx="170" cy="120" r="20" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2" />
          <text x="170" y="125" fontSize="10" textAnchor="middle" fill="#10b981">
            ⚖️ {peso}kg
          </text>
        </g>

        {/* Marcador de circunferência abdominal */}
        <g className="animate-pulse">
          <ellipse cx="100" cy="160" rx="35" ry="15" fill="none" stroke={corCircunferencia} strokeWidth="3" strokeDasharray="5,5" />
          <circle cx="140" cy="160" r="3" fill={corCircunferencia} />
          <text x="145" y="165" fontSize="10" fill={corCircunferencia}>
            🔴 {circunferencia}cm
          </text>
        </g>
      </svg>
    </div>
  );
};

const SilhuetaFeminina: React.FC<{ altura: number; peso: number; circunferencia: number; imc: number; risco: string }> = ({ 
  altura, peso, circunferencia, imc, risco 
}) => {
  const corCircunferencia = risco === 'Alto' ? '#ef4444' : risco === 'Moderado' ? '#f97316' : '#22c55e';
  
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <svg viewBox="0 0 200 400" className="w-full h-auto">
        {/* Silhueta feminina */}
        <path
          d="M100 40 C85 40 75 50 75 65 C75 75 80 85 85 90 L80 120 C75 125 70 130 65 140 L65 180 C65 190 70 200 80 200 L80 280 C80 290 75 300 70 310 L70 380 C70 390 75 395 85 395 L95 395 C105 395 110 390 110 380 L110 310 C105 300 100 290 100 280 L100 200 C110 200 115 190 115 180 L115 140 C110 130 105 125 100 120 L105 90 C110 85 115 75 115 65 C115 50 105 40 100 40 Z M95 200 C125 200 135 190 135 180 L135 140 C130 130 125 125 120 120 L115 90"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          className="transition-colors duration-300"
        />
        
        {/* Marcador de altura */}
        <g className="animate-pulse">
          <line x1="30" y1="40" x2="30" y2="395" stroke="#3b82f6" strokeWidth="3" />
          <circle cx="30" cy="40" r="4" fill="#3b82f6" />
          <circle cx="30" cy="395" r="4" fill="#3b82f6" />
          <text x="15" y="220" fontSize="12" fill="#3b82f6" transform="rotate(-90 15 220)">
            📏 {altura}cm
          </text>
        </g>

        {/* Marcador de peso */}
        <g className="animate-bounce">
          <circle cx="170" cy="120" r="20" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2" />
          <text x="170" y="125" fontSize="10" textAnchor="middle" fill="#10b981">
            ⚖️ {peso}kg
          </text>
        </g>

        {/* Marcador de circunferência abdominal */}
        <g className="animate-pulse">
          <ellipse cx="100" cy="150" rx="30" ry="12" fill="none" stroke={corCircunferencia} strokeWidth="3" strokeDasharray="5,5" />
          <circle cx="135" cy="150" r="3" fill={corCircunferencia} />
          <text x="140" y="155" fontSize="10" fill={corCircunferencia}>
            🔴 {circunferencia}cm
          </text>
        </g>
      </svg>
    </div>
  );
};

export const SilhuetaCorpo: React.FC<SilhuetaCorpoProps> = () => {
  const { dadosFisicos, loading, obterCategoriaIMC, obterRiscoCardiometabolico, calcularIMC } = useDadosFisicos();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📍 Meu Corpo Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando seus dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dadosFisicos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📍 Meu Corpo Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cadastre seus dados físicos para ver sua silhueta personalizada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const imc = calcularIMC(dadosFisicos.peso_atual_kg, dadosFisicos.altura_cm);
  const categoriaIMC = obterCategoriaIMC(imc);
  const riscoCardiometabolico = obterRiscoCardiometabolico(dadosFisicos.sexo, dadosFisicos.circunferencia_abdominal_cm);

  const getIMCColor = (categoria: string) => {
    switch (categoria) {
      case 'Abaixo do peso': return 'bg-blue-100 text-blue-800';
      case 'Peso normal': return 'bg-green-100 text-green-800';
      case 'Sobrepeso': return 'bg-yellow-100 text-yellow-800';
      case 'Obesidade grau I':
      case 'Obesidade grau II':
      case 'Obesidade grau III': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'Baixo': return 'bg-green-100 text-green-800';
      case 'Moderado': return 'bg-orange-100 text-orange-800';
      case 'Alto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          📍 Meu Corpo Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Silhueta baseada no sexo */}
        <div className="flex justify-center">
          {dadosFisicos.sexo === 'Masculino' ? (
            <SilhuetaMasculina
              altura={dadosFisicos.altura_cm}
              peso={dadosFisicos.peso_atual_kg}
              circunferencia={dadosFisicos.circunferencia_abdominal_cm}
              imc={imc}
              risco={riscoCardiometabolico}
            />
          ) : (
            <SilhuetaFeminina
              altura={dadosFisicos.altura_cm}
              peso={dadosFisicos.peso_atual_kg}
              circunferencia={dadosFisicos.circunferencia_abdominal_cm}
              imc={imc}
              risco={riscoCardiometabolico}
            />
          )}
        </div>

        {/* Informações do IMC e Risco */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">IMC:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{imc.toFixed(1)}</span>
              <Badge className={getIMCColor(categoriaIMC)}>
                {categoriaIMC}
              </Badge>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Risco Cardiometabólico:</span>
            <Badge className={getRiscoColor(riscoCardiometabolico)}>
              {riscoCardiometabolico}
            </Badge>
          </div>
        </div>

        {/* Legenda dos marcadores */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Marcadores:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📏</span>
              <span>Altura: linha vertical azul</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">⚖️</span>
              <span>Peso: marcador circular verde</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: riscoCardiometabolico === 'Alto' ? '#ef4444' : riscoCardiometabolico === 'Moderado' ? '#f97316' : '#22c55e' }}>🔴</span>
              <span>Circunferência abdominal: anel colorido conforme risco</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};