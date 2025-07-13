import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingDown, TrendingUp, Activity, Target, Calendar } from 'lucide-react';
import { useDadosFisicos } from '@/hooks/useDadosFisicos';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GraficosProgressoSaude = () => {
  const { dadosFisicos, historicoMedidas, loading, refetch } = useDadosFisicos();

  useEffect(() => {
    // Atualizar dados quando component montar
    refetch();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!dadosFisicos || !historicoMedidas.length) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <Activity className="w-16 h-16 text-instituto-orange/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-instituto-dark mb-2">
            Dados Insuficientes
          </h3>
          <p className="text-instituto-dark/70">
            Complete seu cadastro e atualize suas medidas para ver os gráficos de progresso.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para os gráficos
  const dadosGrafico = historicoMedidas.map((medida) => ({
    data: format(parseISO(medida.data_medicao), 'dd/MM', { locale: ptBR }),
    dataCompleta: format(parseISO(medida.data_medicao), 'dd/MM/yyyy', { locale: ptBR }),
    peso: Number(medida.peso_kg),
    circunferencia: Number(medida.circunferencia_abdominal_cm),
    imc: Number(medida.imc)
  }));

  // Calcular tendências
  const calcularTendencia = (valores: number[]) => {
    if (valores.length < 2) return 0;
    const primeiro = valores[0];
    const ultimo = valores[valores.length - 1];
    return ultimo - primeiro;
  };

  const tendenciaPeso = calcularTendencia(dadosGrafico.map(d => d.peso));
  const tendenciaCircunferencia = calcularTendencia(dadosGrafico.map(d => d.circunferencia));
  const tendenciaIMC = calcularTendencia(dadosGrafico.map(d => d.imc));

  const obterCorTendencia = (tendencia: number) => {
    if (tendencia < 0) return 'text-green-600';
    if (tendencia > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const obterIconeTendencia = (tendencia: number) => {
    if (tendencia < 0) return <TrendingDown className="w-4 h-4 text-green-600" />;
    if (tendencia > 0) return <TrendingUp className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-instituto-orange/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-instituto-dark flex items-center justify-between">
              Peso Atual
              {obterIconeTendencia(tendenciaPeso)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-instituto-orange">
              {dadosFisicos.peso_atual_kg} kg
            </div>
            <div className={`text-sm ${obterCorTendencia(tendenciaPeso)}`}>
              {tendenciaPeso !== 0 && (
                <>
                  {tendenciaPeso > 0 ? '+' : ''}{tendenciaPeso.toFixed(1)} kg
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-instituto-orange/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-instituto-dark flex items-center justify-between">
              Circunferência Abdominal
              {obterIconeTendencia(tendenciaCircunferencia)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-instituto-orange">
              {dadosFisicos.circunferencia_abdominal_cm} cm
            </div>
            <div className={`text-sm ${obterCorTendencia(tendenciaCircunferencia)}`}>
              {tendenciaCircunferencia !== 0 && (
                <>
                  {tendenciaCircunferencia > 0 ? '+' : ''}{tendenciaCircunferencia.toFixed(1)} cm
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-instituto-orange/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-instituto-dark flex items-center justify-between">
              IMC
              {obterIconeTendencia(tendenciaIMC)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-instituto-orange">
              {dadosFisicos.imc?.toFixed(1)}
            </div>
            <Badge variant={dadosFisicos.categoria_imc === 'Peso normal' ? 'default' : 'secondary'} className="text-xs">
              {dadosFisicos.categoria_imc}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Peso */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-instituto-dark flex items-center gap-2">
              <Activity className="w-5 h-5 text-instituto-orange" />
              Evolução do Peso
            </CardTitle>
            <CardDescription>
              Acompanhe suas variações de peso ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="data" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.dataCompleta || label;
                  }}
                  formatter={(value: number) => [`${value} kg`, 'Peso']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke="hsl(var(--instituto-orange))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--instituto-orange))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Circunferência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-instituto-dark flex items-center gap-2">
              <Target className="w-5 h-5 text-instituto-orange" />
              Circunferência Abdominal
            </CardTitle>
            <CardDescription>
              Monitore a redução da circunferência abdominal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="data" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.dataCompleta || label;
                  }}
                  formatter={(value: number) => [`${value} cm`, 'Circunferência']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="circunferencia" 
                  stroke="hsl(var(--instituto-warm))" 
                  fill="hsl(var(--instituto-warm) / 0.2)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Card de Risco Cardiometabólico */}
      <Card className="border-instituto-orange/20 bg-instituto-orange/5">
        <CardHeader>
          <CardTitle className="text-lg text-instituto-dark flex items-center gap-2">
            <Activity className="w-5 h-5 text-instituto-orange" />
            Avaliação de Risco Cardiometabólico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-instituto-dark/70 mb-2">
                Baseado na sua circunferência abdominal atual:
              </p>
              <Badge 
                variant={
                  dadosFisicos.risco_cardiometabolico === 'Baixo' ? 'default' :
                  dadosFisicos.risco_cardiometabolico === 'Moderado' ? 'secondary' : 'destructive'
                }
                className="text-sm px-3 py-1"
              >
                Risco {dadosFisicos.risco_cardiometabolico}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-instituto-dark/70">Circunferência atual</div>
              <div className="text-xl font-bold text-instituto-orange">
                {dadosFisicos.circunferencia_abdominal_cm} cm
              </div>
            </div>
          </div>
          
          {dadosFisicos.risco_cardiometabolico !== 'Baixo' && (
            <div className="mt-4 p-3 bg-instituto-light rounded-lg">
              <p className="text-sm text-instituto-dark">
                💡 <strong>Dica:</strong> {dadosFisicos.sexo === 'Masculino' 
                  ? 'Para homens, uma circunferência abdominal abaixo de 94cm representa menor risco cardiometabólico.'
                  : 'Para mulheres, uma circunferência abdominal abaixo de 80cm representa menor risco cardiometabólico.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GraficosProgressoSaude;