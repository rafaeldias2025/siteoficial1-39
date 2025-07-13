import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Activity, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Heart, 
  Info,
  Target,
  Clock,
  Scale,
  Ruler,
  Droplets,
  Zap,
  Users,
  Calendar,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useDadosFisicos } from '@/hooks/useDadosFisicos';
import { format, subWeeks, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RiskLevel {
  level: 'baixo' | 'moderado' | 'alto';
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}

const getRiskLevel = (sexo: string, circunferencia: number): RiskLevel => {
  if (sexo === 'Masculino') {
    if (circunferencia >= 102) return {
      level: 'alto',
      color: '#ef4444',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600',
      description: 'Alto Risco'
    };
    if (circunferencia >= 94) return {
      level: 'moderado',
      color: '#f59e0b',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600',
      description: 'Risco Moderado'
    };
    return {
      level: 'baixo',
      color: '#10b981',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600',
      description: 'Baixo Risco'
    };
  } else {
    if (circunferencia >= 88) return {
      level: 'alto',
      color: '#ef4444',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600',
      description: 'Alto Risco'
    };
    if (circunferencia >= 80) return {
      level: 'moderado',
      color: '#f59e0b',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600',
      description: 'Risco Moderado'
    };
    return {
      level: 'baixo',
      color: '#10b981',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600',
      description: 'Baixo Risco'
    };
  }
};

const calculateWaistToHeightRatio = (waist: number, height: number) => {
  return waist / height;
};

const mockBioimpedanceData = {
  bodyFatPercentage: 18.5,
  leanMass: 65.2,
  muscleMass: 48.7,
  hydration: 62.3,
  intracellularWater: 24.8,
  extracellularWater: 14.2,
  basalMetabolicRate: 1750,
  cellularAge: 28,
  phaseAngle: 6.2,
  muscleToFatRatio: 2.63
};

export const AvaliacaoRiscoCardiometabolico: React.FC = () => {
  const { dadosFisicos, historicoMedidas, loading } = useDadosFisicos();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const currentRisk = useMemo(() => {
    if (!dadosFisicos) return null;
    return getRiskLevel(dadosFisicos.sexo, dadosFisicos.circunferencia_abdominal_cm);
  }, [dadosFisicos]);

  const previousWeekData = useMemo(() => {
    if (!historicoMedidas.length) return null;
    
    const oneWeekAgo = subWeeks(new Date(), 1);
    const previousData = historicoMedidas
      .filter(medida => isAfter(new Date(medida.data_medicao), oneWeekAgo))
      .sort((a, b) => new Date(b.data_medicao).getTime() - new Date(a.data_medicao).getTime())[1];
    
    return previousData;
  }, [historicoMedidas]);

  const waistEvolutionData = useMemo(() => {
    return historicoMedidas.slice(-8).map((medida, index) => ({
      data: format(new Date(medida.data_medicao), 'dd/MM', { locale: ptBR }),
      circunferencia: medida.circunferencia_abdominal_cm,
      rcest: calculateWaistToHeightRatio(medida.circunferencia_abdominal_cm, medida.altura_cm),
      risco: dadosFisicos ? getRiskLevel(dadosFisicos.sexo, medida.circunferencia_abdominal_cm).level : 'baixo'
    }));
  }, [historicoMedidas, dadosFisicos]);

  const weeklyChange = useMemo(() => {
    if (!dadosFisicos || !previousWeekData) return null;
    
    const change = previousWeekData.circunferencia_abdominal_cm - dadosFisicos.circunferencia_abdominal_cm;
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      previousValue: previousWeekData.circunferencia_abdominal_cm
    };
  }, [dadosFisicos, previousWeekData]);

  const getProgressBarValue = (sexo: string, circunferencia: number) => {
    const maxValue = sexo === 'Masculino' ? 120 : 100;
    return (circunferencia / maxValue) * 100;
  };

  const getMeta = (sexo: string) => {
    return sexo === 'Masculino' ? 94 : 80;
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dadosFisicos) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5" />
            Seu Risco Cardiometabólico Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Registre seus dados físicos para avaliar seu risco cardiometabólico
          </p>
          <Button variant="outline">
            Adicionar Dados Físicos
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl text-primary">
              <Heart className="h-6 w-6" />
              Seu Risco Cardiometabólico Hoje
            </CardTitle>
            <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Info className="h-4 w-4" />
                  Entenda seu Risco
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Heart className="h-5 w-5 text-red-500" />
                    O que é risco cardiometabólico?
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      O risco cardiometabólico é uma medida que avalia a probabilidade de desenvolver doenças cardiovasculares e metabólicas, como diabetes tipo 2, síndrome metabólica, infarto e AVC. A circunferência abdominal é um dos indicadores mais precisos deste risco.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-primary">Faixas de Risco - Homens</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Baixo: &lt; 94cm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span>Moderado: 94-102cm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>Alto: &gt; 102cm</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-primary">Faixas de Risco - Mulheres</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Baixo: &lt; 80cm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span>Moderado: 80-88cm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>Alto: &gt; 88cm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-primary">Possíveis Consequências por Nível de Risco</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-green-200 bg-green-50/50">
                        <CardContent className="p-4">
                          <h5 className="font-medium text-green-700 mb-2">Baixo Risco</h5>
                          <ul className="text-sm text-green-600 space-y-1">
                            <li>• Metabolismo saudável</li>
                            <li>• Baixo risco cardiovascular</li>
                            <li>• Energia estável</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-yellow-200 bg-yellow-50/50">
                        <CardContent className="p-4">
                          <h5 className="font-medium text-yellow-700 mb-2">Risco Moderado</h5>
                          <ul className="text-sm text-yellow-600 space-y-1">
                            <li>• Pré-diabetes</li>
                            <li>• Pressão elevada</li>
                            <li>• Fadiga frequente</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-red-200 bg-red-50/50">
                        <CardContent className="p-4">
                          <h5 className="font-medium text-red-700 mb-2">Alto Risco</h5>
                          <ul className="text-sm text-red-600 space-y-1">
                            <li>• Diabetes tipo 2</li>
                            <li>• Infarto e AVC</li>
                            <li>• Apneia do sono</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {dadosFisicos && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-primary">Seu Caso Específico</h4>
                      <p className="text-sm text-muted-foreground">
                        Com sua medida atual de <strong>{dadosFisicos.circunferencia_abdominal_cm}cm</strong> de circunferência abdominal, 
                        seu risco é classificado como <strong className={currentRisk?.textColor}>{currentRisk?.description}</strong>.
                        {currentRisk?.level !== 'baixo' && (
                          <span>
                            {' '}Reduzindo para {getMeta(dadosFisicos.sexo)}cm, você estará na zona de baixo risco.
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-3 text-primary">Recomendações Básicas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium">🥗 Alimentação</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Reduza açúcares</li>
                          <li>• Aumente fibras</li>
                          <li>• Controle porções</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">🏃‍♂️ Exercício</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 150min/semana</li>
                          <li>• Inclua musculação</li>
                          <li>• Caminhadas diárias</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">🧘‍♀️ Bem-estar</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Medite 10min/dia</li>
                          <li>• Durma 7-9 horas</li>
                          <li>• Gerencie estresse</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <p className="text-center font-medium text-primary italic">
                      "Cada centímetro a menos é um passo a mais para longe da UTI — e mais perto de uma vida com liberdade e saúde plena."
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gráfico de Risco Principal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Classificação de Risco por Circunferência Abdominal</h3>
                <p className="text-sm text-muted-foreground">
                  Baseado em critérios da Organização Mundial da Saúde
                </p>
              </div>
              <Badge className={`${currentRisk?.bgColor} ${currentRisk?.textColor} border-0`}>
                {currentRisk?.description}
              </Badge>
            </div>

            {/* Barra de Risco Visual */}
            <div className="relative h-16 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-green-500/80 flex items-center justify-center text-white text-sm font-medium">
                  Baixo
                </div>
                <div className="flex-1 bg-yellow-500/80 flex items-center justify-center text-white text-sm font-medium">
                  Moderado
                </div>
                <div className="flex-1 bg-red-500/80 flex items-center justify-center text-white text-sm font-medium">
                  Alto
                </div>
              </div>
              
              {/* Marcador da posição atual */}
              <div 
                className="absolute top-0 h-full w-1 bg-black transform -translate-x-0.5"
                style={{
                  left: `${getProgressBarValue(dadosFisicos.sexo, dadosFisicos.circunferencia_abdominal_cm)}%`
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {dadosFisicos.circunferencia_abdominal_cm}cm
                </div>
              </div>
            </div>

            {/* Dados atuais e comparação */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <Scale className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{dadosFisicos.peso_atual_kg}kg</div>
                <div className="text-xs text-muted-foreground">Peso Atual</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <Ruler className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{dadosFisicos.altura_cm}cm</div>
                <div className="text-xs text-muted-foreground">Altura</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{dadosFisicos.circunferencia_abdominal_cm}cm</div>
                <div className="text-xs text-muted-foreground">Cintura</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <Activity className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{dadosFisicos.imc?.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">IMC</div>
              </div>
            </div>

            {/* Comparação semanal */}
            {weeklyChange && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Semana passada:</span>
                        <span className="font-medium">{weeklyChange.previousValue}cm</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {weeklyChange.isPositive ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${weeklyChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {weeklyChange.isPositive ? '-' : '+'}{weeklyChange.value.toFixed(1)}cm em 7 dias
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dados Bioimpedância */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5" />
            Análise Corporal Completa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">{mockBioimpedanceData.bodyFatPercentage}%</div>
              <div className="text-xs text-muted-foreground">% Gordura</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{mockBioimpedanceData.leanMass}kg</div>
              <div className="text-xs text-muted-foreground">Massa Magra</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-green-600">{mockBioimpedanceData.muscleMass}kg</div>
              <div className="text-xs text-muted-foreground">Massa Muscular</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-cyan-600">{mockBioimpedanceData.hydration}%</div>
              <div className="text-xs text-muted-foreground">Hidratação</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{mockBioimpedanceData.basalMetabolicRate}</div>
              <div className="text-xs text-muted-foreground">TMB (kcal)</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{mockBioimpedanceData.cellularAge}</div>
              <div className="text-xs text-muted-foreground">Idade Celular</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução */}
      {waistEvolutionData.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingDown className="h-5 w-5" />
              Evolução da Razão Cintura/Estatura (RCEst)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waistEvolutionData}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="33%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="66%" stopColor="#ef4444" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="data" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'circunferencia' ? `${value}cm` : value?.toFixed(3),
                      name === 'circunferencia' ? 'Circunferência' : 'RCEst'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rcest" 
                    stroke="#8884d8" 
                    fill="url(#riskGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="circunferencia" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Meta */}
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Meta: {getMeta(dadosFisicos.sexo)}cm</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Em 2 meses
                </div>
              </div>
              <Progress 
                value={Math.max(0, ((dadosFisicos.circunferencia_abdominal_cm - getMeta(dadosFisicos.sexo)) / dadosFisicos.circunferencia_abdominal_cm) * 100)} 
                className="mt-2 h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Alto Risco */}
      {currentRisk?.level === 'alto' && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-2">Atenção: Alto Risco Cardiometabólico</h4>
                <p className="text-sm text-red-700 mb-3">
                  Sua circunferência abdominal está na zona de alto risco. É importante buscar orientação profissional.
                </p>
                <Button size="sm" variant="destructive">
                  Ver Recomendações Personalizadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Agendar Reavaliação
        </Button>
      </div>
    </div>
  );
};