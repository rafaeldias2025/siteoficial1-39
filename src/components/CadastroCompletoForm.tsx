import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Calendar, User, Scale, Ruler, Target } from 'lucide-react';
import { useDadosFisicos } from '@/hooks/useDadosFisicos';

const dadosFisicosSchema = z.object({
  nome_completo: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.enum(['Masculino', 'Feminino', 'Outro'], {
    required_error: 'Selecione o sexo'
  }),
  peso_atual_kg: z.number().min(20, 'Peso deve ser maior que 20kg').max(300, 'Peso deve ser menor que 300kg'),
  altura_cm: z.number().min(100, 'Altura deve ser maior que 100cm').max(250, 'Altura deve ser menor que 250cm'),
  circunferencia_abdominal_cm: z.number().min(40, 'Circunferência deve ser maior que 40cm').max(200, 'Circunferência deve ser menor que 200cm')
});

const perfilComportamentalSchema = z.object({
  tentativa_emagrecimento: z.string().optional(),
  tentativa_emagrecimento_outro: z.string().optional(),
  motivo_desistencia: z.string().optional(),
  motivo_desistencia_outro: z.string().optional(),
  apoio_familiar: z.enum(['Sim', 'Não', 'Às vezes']).optional(),
  nivel_autocuidado: z.number().min(0).max(5).optional(),
  nivel_estresse: z.number().min(1).max(5).optional(),
  sentimento_hoje: z.string().optional(),
  motivacao_principal: z.string().optional(),
  gratidao_hoje: z.string().optional()
});

type DadosFisicosForm = z.infer<typeof dadosFisicosSchema>;
type PerfilComportamentalForm = z.infer<typeof perfilComportamentalSchema>;

interface CadastroCompletoFormProps {
  onComplete?: () => void;
}

const CadastroCompletoForm = ({ onComplete }: CadastroCompletoFormProps) => {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [mostrarPerfilComportamental, setMostrarPerfilComportamental] = useState(false);
  const [dadosCalculados, setDadosCalculados] = useState<{
    imc?: number;
    categoriaIMC?: string;
    riscoCardiometabolico?: string;
  }>({});

  const { 
    salvarDadosFisicos, 
    salvarPerfilComportamental, 
    calcularIMC, 
    obterCategoriaIMC, 
    obterRiscoCardiometabolico 
  } = useDadosFisicos();

  const formDadosFisicos = useForm<DadosFisicosForm>({
    resolver: zodResolver(dadosFisicosSchema),
    mode: 'onChange'
  });

  const formPerfilComportamental = useForm<PerfilComportamentalForm>({
    resolver: zodResolver(perfilComportamentalSchema)
  });

  const watchedValues = formDadosFisicos.watch(['peso_atual_kg', 'altura_cm', 'circunferencia_abdominal_cm', 'sexo']);

  useEffect(() => {
    const [peso, altura, circunferencia, sexo] = watchedValues;
    
    if (peso && altura && circunferencia && sexo) {
      const imc = calcularIMC(peso, altura);
      const categoriaIMC = obterCategoriaIMC(imc);
      const riscoCardiometabolico = obterRiscoCardiometabolico(sexo, circunferencia);
      
      setDadosCalculados({
        imc: Math.round(imc * 100) / 100,
        categoriaIMC,
        riscoCardiometabolico
      });
    }
  }, watchedValues);

  const onSubmitDadosFisicos = async (data: DadosFisicosForm) => {
    await salvarDadosFisicos(data as any);
    setEtapaAtual(2);
  };

  const onSubmitPerfilComportamental = async (data: PerfilComportamentalForm) => {
    await salvarPerfilComportamental(data);
    onComplete?.();
  };

  const pularPerfilComportamental = () => {
    onComplete?.();
  };

  const renderCalculosInstantaneos = () => {
    if (!dadosCalculados.imc) return null;

    return (
      <Card className="mt-6 border-instituto-orange/20 bg-instituto-orange/5">
        <CardHeader>
          <CardTitle className="text-lg text-instituto-dark flex items-center gap-2">
            <Target className="w-5 h-5 text-instituto-orange" />
            Seus Resultados Instantâneos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-instituto-orange mb-1">
              {dadosCalculados.imc}
            </div>
            <div className="text-sm text-instituto-dark/70 mb-2">IMC</div>
            <Badge variant={dadosCalculados.categoriaIMC === 'Peso normal' ? 'default' : 'secondary'}>
              {dadosCalculados.categoriaIMC}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-instituto-dark mb-2">
              Risco Cardiometabólico
            </div>
            <Badge 
              variant={
                dadosCalculados.riscoCardiometabolico === 'Baixo' ? 'default' :
                dadosCalculados.riscoCardiometabolico === 'Moderado' ? 'secondary' : 'destructive'
              }
            >
              {dadosCalculados.riscoCardiometabolico}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (etapaAtual === 1) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-instituto-dark flex items-center gap-2">
              <User className="w-6 h-6 text-instituto-orange" />
              Dados Físicos
            </CardTitle>
            <CardDescription>
              Vamos começar com suas informações básicas para personalizar sua jornada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formDadosFisicos.handleSubmit(onSubmitDadosFisicos)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input
                    id="nome_completo"
                    placeholder="Seu nome completo"
                    {...formDadosFisicos.register('nome_completo')}
                  />
                  {formDadosFisicos.formState.errors.nome_completo && (
                    <p className="text-red-500 text-sm mt-1">
                      {formDadosFisicos.formState.errors.nome_completo.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    {...formDadosFisicos.register('data_nascimento')}
                  />
                  {formDadosFisicos.formState.errors.data_nascimento && (
                    <p className="text-red-500 text-sm mt-1">
                      {formDadosFisicos.formState.errors.data_nascimento.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Sexo *</Label>
                  <RadioGroup 
                    value={formDadosFisicos.watch('sexo')}
                    onValueChange={(value) => formDadosFisicos.setValue('sexo', value as any)}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Masculino" id="masculino" />
                      <Label htmlFor="masculino">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Feminino" id="feminino" />
                      <Label htmlFor="feminino">Feminino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Outro" id="outro" />
                      <Label htmlFor="outro">Outro</Label>
                    </div>
                  </RadioGroup>
                  {formDadosFisicos.formState.errors.sexo && (
                    <p className="text-red-500 text-sm mt-1">
                      {formDadosFisicos.formState.errors.sexo.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="peso_atual_kg">Peso Atual (kg) *</Label>
                  <Input
                    id="peso_atual_kg"
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    {...formDadosFisicos.register('peso_atual_kg', { valueAsNumber: true })}
                  />
                  {formDadosFisicos.formState.errors.peso_atual_kg && (
                    <p className="text-red-500 text-sm mt-1">
                      {formDadosFisicos.formState.errors.peso_atual_kg.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="altura_cm">Altura (cm) *</Label>
                  <Input
                    id="altura_cm"
                    type="number"
                    placeholder="170"
                    {...formDadosFisicos.register('altura_cm', { valueAsNumber: true })}
                  />
                  {formDadosFisicos.formState.errors.altura_cm && (
                    <p className="text-red-500 text-sm mt-1">
                      {formDadosFisicos.formState.errors.altura_cm.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="circunferencia_abdominal_cm">Circunferência Abdominal (cm) *</Label>
                  <Input
                    id="circunferencia_abdominal_cm"
                    type="number"
                    step="0.1"
                    placeholder="85.5"
                    {...formDadosFisicos.register('circunferencia_abdominal_cm', { valueAsNumber: true })}
                  />
                  {formDadosFisicos.formState.errors.circunferencia_abdominal_cm && (
                    <p className="text-red-500 text-sm mt-1">
                      {formDadosFisicos.formState.errors.circunferencia_abdominal_cm.message}
                    </p>
                  )}
                </div>
              </div>

              {renderCalculosInstantaneos()}

              <Button 
                type="submit" 
                className="w-full bg-instituto-orange hover:bg-instituto-orange-hover text-white"
                disabled={!formDadosFisicos.formState.isValid}
              >
                Continuar para Perfil Comportamental
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-instituto-dark flex items-center gap-2">
            <Heart className="w-6 h-6 text-instituto-orange" />
            Perfil Comportamental
          </CardTitle>
          <CardDescription>
            Estas informações nos ajudam a personalizar sua jornada (opcional, mas recomendado)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formPerfilComportamental.handleSubmit(onSubmitPerfilComportamental)} className="space-y-6">
            {/* Pergunta 1 */}
            <div>
              <Label className="text-base font-medium">1. Você já tentou emagrecer antes?</Label>
              <RadioGroup 
                value={formPerfilComportamental.watch('tentativa_emagrecimento') || ''}
                onValueChange={(value) => formPerfilComportamental.setValue('tentativa_emagrecimento', value)}
                className="mt-3 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="consegui_mas_voltei" id="consegui_mas_voltei" />
                  <Label htmlFor="consegui_mas_voltei">Já consegui, mas voltei a engordar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nunca_consegui" id="nunca_consegui" />
                  <Label htmlFor="nunca_consegui">Nunca consegui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comecando_agora" id="comecando_agora" />
                  <Label htmlFor="comecando_agora">Estou começando agora</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outro" id="tentativa_outro" />
                  <Label htmlFor="tentativa_outro">Outro</Label>
                </div>
              </RadioGroup>
              {formPerfilComportamental.watch('tentativa_emagrecimento') === 'outro' && (
                <Textarea
                  placeholder="Descreva sua experiência..."
                  className="mt-2"
                  {...formPerfilComportamental.register('tentativa_emagrecimento_outro')}
                />
              )}
            </div>

            {/* Pergunta 2 */}
            <div>
              <Label className="text-base font-medium">2. O que mais te faz desistir quando tenta cuidar da saúde?</Label>
              <RadioGroup 
                value={formPerfilComportamental.watch('motivo_desistencia') || ''}
                onValueChange={(value) => formPerfilComportamental.setValue('motivo_desistencia', value)}
                className="mt-3 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ansiedade" id="ansiedade" />
                  <Label htmlFor="ansiedade">Ansiedade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="falta_motivacao" id="falta_motivacao" />
                  <Label htmlFor="falta_motivacao">Falta de motivação</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="falta_apoio" id="falta_apoio" />
                  <Label htmlFor="falta_apoio">Falta de apoio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_sei" id="nao_sei" />
                  <Label htmlFor="nao_sei">Não sei</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outro_motivo" id="outro_motivo" />
                  <Label htmlFor="outro_motivo">Outro</Label>
                </div>
              </RadioGroup>
              {formPerfilComportamental.watch('motivo_desistencia') === 'outro_motivo' && (
                <Textarea
                  placeholder="Descreva o motivo..."
                  className="mt-2"
                  {...formPerfilComportamental.register('motivo_desistencia_outro')}
                />
              )}
            </div>

            {/* Pergunta 3 */}
            <div>
              <Label className="text-base font-medium">3. Você se sente apoiado pela família?</Label>
              <RadioGroup 
                value={formPerfilComportamental.watch('apoio_familiar') || ''}
                onValueChange={(value) => formPerfilComportamental.setValue('apoio_familiar', value as any)}
                className="mt-3 flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="apoio_sim" />
                  <Label htmlFor="apoio_sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="apoio_nao" />
                  <Label htmlFor="apoio_nao">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Às vezes" id="apoio_as_vezes" />
                  <Label htmlFor="apoio_as_vezes">Às vezes</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Pergunta 4 */}
            <div>
              <Label className="text-base font-medium">4. Como você avaliaria seu nível de autocuidado?</Label>
              <div className="mt-3 flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((nivel) => (
                  <Button
                    key={nivel}
                    type="button"
                    variant={formPerfilComportamental.watch('nivel_autocuidado') === nivel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => formPerfilComportamental.setValue('nivel_autocuidado', nivel)}
                    className="w-12 h-12 rounded-full"
                  >
                    <Heart className={`w-4 h-4 ${formPerfilComportamental.watch('nivel_autocuidado') === nivel ? 'fill-current' : ''}`} />
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-instituto-dark/60 mt-1">
                <span>Muito baixo</span>
                <span>Muito alto</span>
              </div>
            </div>

            {/* Pergunta 5 */}
            <div>
              <Label className="text-base font-medium">5. Como está seu nível de estresse hoje?</Label>
              <div className="mt-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((nivel) => (
                  <Button
                    key={nivel}
                    type="button"
                    variant={formPerfilComportamental.watch('nivel_estresse') === nivel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => formPerfilComportamental.setValue('nivel_estresse', nivel)}
                    className="w-12 h-12 rounded-full text-lg"
                  >
                    {nivel === 1 ? '😌' : nivel === 2 ? '🙂' : nivel === 3 ? '😐' : nivel === 4 ? '😰' : '😫'}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-instituto-dark/60 mt-1">
                <span>Muito calmo</span>
                <span>Muito estressado</span>
              </div>
            </div>

            {/* Pergunta 6 */}
            <div>
              <Label htmlFor="sentimento_hoje" className="text-base font-medium">6. Em uma palavra, como você se sente hoje?</Label>
              <Input
                id="sentimento_hoje"
                placeholder="Ex: motivado, ansioso, esperançoso..."
                className="mt-2"
                {...formPerfilComportamental.register('sentimento_hoje')}
              />
            </div>

            {/* Pergunta 7 */}
            <div>
              <Label htmlFor="motivacao_principal" className="text-base font-medium">7. Qual sua motivação principal para mudar?</Label>
              <Textarea
                id="motivacao_principal"
                placeholder="Descreva o que te motiva a buscar uma vida mais saudável..."
                className="mt-2"
                {...formPerfilComportamental.register('motivacao_principal')}
              />
            </div>

            {/* Pergunta 8 */}
            <div>
              <Label htmlFor="gratidao_hoje" className="text-base font-medium">8. Pelo que você é grato hoje?</Label>
              <Textarea
                id="gratidao_hoje"
                placeholder="Compartilhe algo pelo qual você se sente grato hoje..."
                className="mt-2"
                {...formPerfilComportamental.register('gratidao_hoje')}
              />
            </div>
            
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={pularPerfilComportamental}
                className="flex-1"
              >
                Pular por Agora
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-instituto-orange hover:bg-instituto-orange-hover text-white"
              >
                Finalizar Cadastro
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastroCompletoForm;