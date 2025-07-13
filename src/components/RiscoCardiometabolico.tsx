import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Heart, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { useDadosFisicos } from '@/hooks/useDadosFisicos';

interface RiscoData {
  nivel: 'baixo' | 'moderado' | 'alto';
  cor: string;
  valor: number;
  limite: { min: number; max: number };
}

const obterRiscoCardiometabolico = (sexo: string, circunferencia: number): RiscoData => {
  if (sexo === 'Masculino') {
    if (circunferencia < 94) {
      return {
        nivel: 'baixo',
        cor: '#10b981', // verde
        valor: (circunferencia / 94) * 33.33,
        limite: { min: 0, max: 94 }
      };
    } else if (circunferencia <= 102) {
      return {
        nivel: 'moderado',
        cor: '#f59e0b', // amarelo
        valor: 33.33 + ((circunferencia - 94) / 8) * 33.33,
        limite: { min: 94, max: 102 }
      };
    } else {
      return {
        nivel: 'alto',
        cor: '#ef4444', // vermelho
        valor: 66.66 + Math.min(((circunferencia - 102) / 20) * 33.34, 33.34),
        limite: { min: 102, max: 130 }
      };
    }
  } else {
    // Feminino
    if (circunferencia < 80) {
      return {
        nivel: 'baixo',
        cor: '#10b981',
        valor: (circunferencia / 80) * 33.33,
        limite: { min: 0, max: 80 }
      };
    } else if (circunferencia <= 88) {
      return {
        nivel: 'moderado',
        cor: '#f59e0b',
        valor: 33.33 + ((circunferencia - 80) / 8) * 33.33,
        limite: { min: 80, max: 88 }
      };
    } else {
      return {
        nivel: 'alto',
        cor: '#ef4444',
        valor: 66.66 + Math.min(((circunferencia - 88) / 20) * 33.34, 33.34),
        limite: { min: 88, max: 120 }
      };
    }
  }
};

const obterTextoRisco = (nivel: string) => {
  switch (nivel) {
    case 'baixo':
      return 'Baixo Risco';
    case 'moderado':
      return 'Risco Moderado';
    case 'alto':
      return 'Alto Risco';
    default:
      return 'Não avaliado';
  }
};

const obterIconeRisco = (nivel: string) => {
  switch (nivel) {
    case 'baixo':
      return <Heart className="h-4 w-4" />;
    case 'moderado':
      return <Info className="h-4 w-4" />;
    case 'alto':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

export const RiscoCardiometabolico: React.FC = () => {
  const { dadosFisicos, loading } = useDadosFisicos();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!dadosFisicos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Avaliação de Risco Cardiometabólico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Cadastre seus dados físicos para ver sua avaliação de risco</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const risco = obterRiscoCardiometabolico(dadosFisicos.sexo, dadosFisicos.circunferencia_abdominal_cm);
  
  // Simular progresso (em uma implementação real, isso viria de dados históricos)
  const progressoUltimasSemanas: number = -2; // exemplo: reduziu 2cm

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Avaliação de Risco Cardiometabólico
          </div>
          <Badge 
            variant="outline" 
            className={`text-white border-0`}
            style={{ backgroundColor: risco.cor }}
          >
            {obterTextoRisco(risco.nivel)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico de Risco Horizontal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Circunferência Abdominal: {dadosFisicos.circunferencia_abdominal_cm}cm</span>
            {progressoUltimasSemanas !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${progressoUltimasSemanas < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {progressoUltimasSemanas < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {Math.abs(progressoUltimasSemanas)}cm nas últimas semanas
              </div>
            )}
          </div>
          
          {/* Barra de Risco */}
          <div className="relative">
            {/* Fundo da barra com 3 seções */}
            <div className="h-8 rounded-lg overflow-hidden flex">
              <div className="w-1/3 bg-green-200"></div>
              <div className="w-1/3 bg-yellow-200"></div>
              <div className="w-1/3 bg-red-200"></div>
            </div>
            
            {/* Indicador de posição */}
            <div 
              className="absolute top-0 h-8 w-1 bg-gray-800 shadow-lg transition-all duration-500"
              style={{ left: `${Math.min(Math.max(risco.valor, 0), 100)}%` }}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              {/* Tooltip */}
              {tooltipVisible && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-10">
                  <div className="text-center">
                    <div className="font-semibold">{obterTextoRisco(risco.nivel)}</div>
                    <div>{dadosFisicos.circunferencia_abdominal_cm}cm de cintura</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Labels das faixas */}
          <div className="flex justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              Baixo
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              Moderado
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              Alto
            </span>
          </div>
        </div>

        {/* Dados do usuário */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Peso</div>
            <div className="font-bold text-lg">{dadosFisicos.peso_atual_kg}kg</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Altura</div>
            <div className="font-bold text-lg">{dadosFisicos.altura_cm}cm</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Cintura</div>
            <div className="font-bold text-lg">{dadosFisicos.circunferencia_abdominal_cm}cm</div>
          </div>
        </div>

        {/* Botão Entenda seu Risco */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              {obterIconeRisco(risco.nivel)}
              Entenda seu Risco
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                O que é risco cardiometabólico?
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Explicação */}
              <div className="space-y-4">
                <p className="text-gray-700">
                  O risco cardiometabólico é uma medida que avalia a probabilidade de desenvolver doenças 
                  cardiovasculares e metabólicas, como diabetes tipo 2, hipertensão e doenças cardíacas. 
                  A circunferência abdominal é um dos principais indicadores.
                </p>
                
                <p className="text-gray-700">
                  O acúmulo de gordura na região abdominal está diretamente relacionado ao aumento da 
                  resistência à insulina e inflamação, fatores que contribuem para o desenvolvimento 
                  de doenças cardiovasculares.
                </p>
              </div>

              {/* Tabela de Classificação */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="font-semibold">Classificação por Circunferência Abdominal</h3>
                </div>
                <div className="divide-y">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div>
                        <div className="font-medium">Baixo Risco</div>
                        <div className="text-sm text-gray-600">
                          {dadosFisicos.sexo === 'Masculino' ? 'Homens: < 94cm' : 'Mulheres: < 80cm'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Risco mínimo</div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <div>
                        <div className="font-medium">Risco Moderado</div>
                        <div className="text-sm text-gray-600">
                          {dadosFisicos.sexo === 'Masculino' ? 'Homens: 94-102cm' : 'Mulheres: 80-88cm'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Atenção necessária</div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <div>
                        <div className="font-medium">Alto Risco</div>
                        <div className="text-sm text-gray-600">
                          {dadosFisicos.sexo === 'Masculino' ? 'Homens: > 102cm' : 'Mulheres: > 88cm'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Intervenção urgente</div>
                  </div>
                </div>
              </div>

              {/* Exemplo Prático */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-900">Sua Situação Atual</h3>
                <p className="text-blue-800">
                  Com sua medida atual de <strong>{dadosFisicos.circunferencia_abdominal_cm}cm</strong> de 
                  circunferência abdominal, seu risco é <strong>{obterTextoRisco(risco.nivel).toLowerCase()}</strong>.
                  {risco.nivel === 'alto' && dadosFisicos.sexo === 'Masculino' && (
                    ` Reduzindo para 102cm, você já estará em zona de risco moderado.`
                  )}
                  {risco.nivel === 'alto' && dadosFisicos.sexo === 'Feminino' && (
                    ` Reduzindo para 88cm, você já estará em zona de risco moderado.`
                  )}
                  {risco.nivel === 'moderado' && dadosFisicos.sexo === 'Masculino' && (
                    ` Reduzindo para menos de 94cm, você estará em zona de baixo risco.`
                  )}
                  {risco.nivel === 'moderado' && dadosFisicos.sexo === 'Feminino' && (
                    ` Reduzindo para menos de 80cm, você estará em zona de baixo risco.`
                  )}
                </p>
              </div>

              {/* Recomendações */}
              <div className="space-y-4">
                <h3 className="font-semibold">Recomendações para Reduzir o Risco</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🥗 Alimentação</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Reduza açúcares e carboidratos refinados</li>
                      <li>• Aumente fibras e proteínas</li>
                      <li>• Prefira gorduras saudáveis</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🏃 Exercícios</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 150min de atividade moderada/semana</li>
                      <li>• Exercícios de força 2x/semana</li>
                      <li>• Atividades aeróbicas regulares</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🧘 Bem-estar</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Controle do estresse</li>
                      <li>• 7-9h de sono por noite</li>
                      <li>• Práticas de relaxamento</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};