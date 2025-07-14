import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Brain, 
  Droplets, 
  Moon, 
  Activity, 
  Target,
  TrendingUp,
  Scale,
  Ruler
} from "lucide-react";
import { useDadosSaude } from "@/hooks/useDadosSaude";
import { AtualizarMedidasModal } from "./AtualizarMedidasModal";
import GraficosProgressoSaude from "./GraficosProgressoSaude";
import { AvaliacaoRiscoCardiometabolico } from "./AvaliacaoRiscoCardiometabolico";
import { BalancaPareamentoCompacto } from "./BalancaPareamentoCompacto";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const getIMCStatus = (imc: number) => {
  if (imc < 18.5) return { status: "Abaixo do peso", cor: "text-blue-500" };
  if (imc < 25) return { status: "Peso normal", cor: "text-green-500" };
  if (imc < 30) return { status: "Sobrepeso", cor: "text-yellow-500" };
  return { status: "Obesidade", cor: "text-red-500" };
};

const formatarHumor = (humor: string) => {
  const emojis: { [key: string]: string } = {
    '😄': 'Muito Feliz',
    '😐': 'Neutro', 
    '😞': 'Triste'
  };
  return emojis[humor] || humor;
};

export const BeneficiosVisuais: React.FC = () => {
  const { dadosSaude, missoesDaSemana, loading } = useDadosSaude();

  // Calcular estatísticas das missões
  const estatisticasMissoes = React.useMemo(() => {
    if (!missoesDaSemana.length) return [];

    const total = missoesDaSemana.length;
    const agua = missoesDaSemana.filter(m => m.bebeu_agua).length;
    const sono = missoesDaSemana.filter(m => m.dormiu_bem).length;
    const autocuidado = missoesDaSemana.filter(m => m.autocuidado).length;
    
    return [
      { nome: 'Hidratação', valor: Math.round((agua / total) * 100), icon: '💧' },
      { nome: 'Sono', valor: Math.round((sono / total) * 100), icon: '😴' },
      { nome: 'Autocuidado', valor: Math.round((autocuidado / total) * 100), icon: '🧠' },
    ];
  }, [missoesDaSemana]);

  // Dados para o gráfico de humor
  const dadosHumor = React.useMemo(() => {
    return missoesDaSemana.map((missao, index) => ({
      dia: `Dia ${index + 1}`,
      humor: missao.humor === '😄' ? 3 : missao.humor === '😐' ? 2 : 1,
      humorTexto: formatarHumor(missao.humor)
    }));
  }, [missoesDaSemana]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instituto-orange mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando seus dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Sua Evolução em Tempo Real
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Acompanhe seu progresso baseado nos seus dados reais
          </p>
        </div>

        {/* Dados de Saúde */}
        {dadosSaude ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-instituto-orange">
                  <Activity className="h-5 w-5" />
                  IMC Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{dadosSaude.imc?.toFixed(1)}</div>
                <div className={`text-sm ${getIMCStatus(dadosSaude.imc || 0).cor}`}>
                  {getIMCStatus(dadosSaude.imc || 0).status}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-instituto-orange">
                  <Target className="h-5 w-5" />
                  Progresso da Meta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{dadosSaude.progresso_percentual?.toFixed(0)}%</div>
                <Progress value={dadosSaude.progresso_percentual || 0} className="h-2" />
                <div className="text-sm text-muted-foreground mt-2">
                  Meta: {dadosSaude.meta_peso_kg}kg
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-instituto-orange">
                  <Ruler className="h-5 w-5" />
                  Circunferência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{dadosSaude.circunferencia_abdominal_cm}cm</div>
                <div className="text-sm text-green-600">
                  Redução de 3,4 cm em 15 dias
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="text-center p-8">
            <CardContent>
              <Scale className="h-12 w-12 text-instituto-orange mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Adicione suas medidas</h3>
              <p className="text-muted-foreground mb-4">
                Para ver sua evolução personalizada, registre seus dados de saúde
              </p>
              <div className="flex gap-3 justify-center">
                <AtualizarMedidasModal 
                  trigger={
                    <Button className="bg-instituto-orange hover:bg-instituto-orange/90">
                      Registrar Medidas
                    </Button>
                  }
                />
                <BalancaPareamentoCompacto />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avaliação de Risco Cardiometabólico */}
        <AvaliacaoRiscoCardiometabolico />

        {/* Cards complementares */}
        {dadosSaude && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Activity className="h-5 w-5" />
                    Status Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Peso atual:</span>
                      <span className="font-bold">{dadosSaude.peso_atual_kg}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meta:</span>
                      <span className="font-bold text-primary">{dadosSaude.meta_peso_kg}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progresso:</span>
                      <span className="font-bold text-green-600">{dadosSaude.progresso_percentual?.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Target className="h-5 w-5" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>• Continue com sua rotina de exercícios</p>
                    <p>• Mantenha a alimentação balanceada</p>
                    <p>• Monitore suas medidas semanalmente</p>
                    <p>• Celebre cada pequena conquista!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Gráficos de Progresso de Saúde */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-instituto-dark mb-2">
              Evolução dos Seus Dados Físicos
            </h2>
            <p className="text-instituto-dark/70">
              Acompanhe sua transformação em tempo real
            </p>
          </div>
          <GraficosProgressoSaude />
        </div>

        {/* Gráfico de Evolução das Missões */}
        {missoesDaSemana.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-instituto-orange">
                  <TrendingUp className="h-5 w-5" />
                  Sua Evolução Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {estatisticasMissoes.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-2xl font-bold text-instituto-orange">{stat.valor}%</div>
                      <div className="text-sm text-muted-foreground">{stat.nome}</div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={estatisticasMissoes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="valor" fill="hsl(var(--instituto-orange))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-instituto-orange">
                  <Heart className="h-5 w-5" />
                  Evolução do Humor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dadosHumor}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis domain={[1, 3]} tickFormatter={(value) => ['😞', '😐', '😄'][value - 1]} />
                    <Tooltip formatter={(value, name) => [dadosHumor.find(d => d.humor === value)?.humorTexto || '', 'Humor']} />
                    <Line 
                      type="monotone" 
                      dataKey="humor" 
                      stroke="hsl(var(--instituto-orange))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--instituto-orange))', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Indicadores das Missões */}
        {missoesDaSemana.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-instituto-orange">Indicadores da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {missoesDaSemana.filter(m => m.bebeu_agua).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Dias hidratado</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Moon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {missoesDaSemana.filter(m => m.dormiu_bem).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Sono adequado</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Brain className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {missoesDaSemana.filter(m => m.autocuidado).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Autocuidado</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Heart className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(missoesDaSemana.filter(m => m.humor === '😄').length / missoesDaSemana.length * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Dias felizes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">
            Continue Sua Jornada de Transformação
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cada dia é uma nova oportunidade de cuidar melhor de si mesmo
          </p>
        </div>
      </div>

      {/* Opções de Atualização de Medidas */}
      {dadosSaude && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <AtualizarMedidasModal />
          <BalancaPareamentoCompacto />
        </div>
      )}
    </div>
  );
};