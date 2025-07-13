import { useState } from "react";
import { useMissaoDia } from "@/hooks/useMissaoDia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, 
  Droplet, 
  Heart, 
  Moon, 
  Activity,
  Brain,
  Star,
  TrendingUp,
  CheckCircle2
} from "lucide-react";

const MissaoDia = ({ isVisitor = false }: { isVisitor?: boolean }) => {
  const { missao, loading, updateMissao, concluirMissao, progresso } = useMissaoDia(isVisitor);
  const [showGraph, setShowGraph] = useState(false);

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-background via-muted/30 to-background shadow-xl">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const frases = [
    "Seu corpo te ouviu hoje. Seu espírito também. Continue.",
    "Beber água morna é um abraço no seu fígado. Você merece leveza.",
    "Cuidar da mente e agradecer, mesmo nos dias difíceis, é um ato de coragem.",
    "Cada pequena vitória é um passo em direção à sua melhor versão.",
    "O autocuidado é um ato de amor próprio. Você está no caminho certo."
  ];

  const getFraseInspiradora = () => {
    if (!missao) return frases[0];
    
    if (missao.liquido_ao_acordar === "Água morna com limão") return frases[1];
    if (missao.gratidao) return frases[2];
    if (missao.pequena_vitoria) return frases[3];
    
    return frases[Math.floor(Math.random() * frases.length)];
  };

  const liquidoOptions = [
    "Água morna com limão",
    "Chá natural", 
    "Café puro",
    "Água gelada",
    "Outro"
  ];

  const conexaoOptions = [
    "Oração",
    "Meditação", 
    "Respiração consciente",
    "Não fiz hoje"
  ];

  const sonoOptions = [
    { value: 4, label: "4h ou menos" },
    { value: 6, label: "6h" },
    { value: 8, label: "8h" },
    { value: 9, label: "9h+" }
  ];

  const aguaOptions = [
    "Menos de 500ml",
    "1L",
    "2L", 
    "3L ou mais"
  ];

  const gratidaoOptions = [
    "Minha saúde",
    "Minha família",
    "Meu trabalho",
    "Meu corpo",
    "Outro"
  ];

  const intencaoOptions = [
    "Cuidar de mim",
    "Estar presente",
    "Fazer melhor",
    "Outro"
  ];

  const renderStars = (current: number | undefined, onChange: (value: number) => void) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Button
          key={star}
          variant="ghost"
          size="sm"
          onClick={() => onChange(star)}
          className={`p-1 ${current === star ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
        >
          <Star className={`h-6 w-6 ${current === star ? 'fill-current' : ''}`} />
        </Button>
      ))}
    </div>
  );

  const renderEmojiScale = (current: number | undefined, onChange: (value: number) => void) => (
    <div className="flex gap-2 justify-center">
      {[
        { emoji: "😴", value: 1 },
        { emoji: "😐", value: 2 },
        { emoji: "🙂", value: 3 },
        { emoji: "😊", value: 4 },
        { emoji: "💥", value: 5 }
      ].map(({ emoji, value }) => (
        <Button
          key={value}
          variant={current === value ? "default" : "outline"}
          size="lg"
          onClick={() => onChange(value)}
          className="text-2xl h-14 w-14"
        >
          {emoji}
        </Button>
      ))}
    </div>
  );

  const renderOptions = (options: string[], current: string | undefined, onChange: (value: string) => void) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {options.map((option) => (
        <Button
          key={option}
          variant={current === option ? "default" : "outline"}
          onClick={() => onChange(option)}
          className="justify-start h-auto p-3 text-left"
        >
          {option}
        </Button>
      ))}
    </div>
  );

  const renderNumberScale = (current: number | undefined, onChange: (value: number) => void, max: number = 5) => (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: max }, (_, i) => i + 1).map((num) => (
        <Button
          key={num}
          variant={current === num ? "default" : "outline"}
          size="lg"
          onClick={() => onChange(num)}
          className="h-12 w-12 text-lg font-bold"
        >
          {num}
        </Button>
      ))}
    </div>
  );

  if (showGraph) {
    return (
      <Card className="border-0 bg-gradient-to-br from-background via-muted/30 to-background shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sua Evolução da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-primary/10 rounded-lg">
            <p className="text-lg italic text-foreground/80 mb-4">
              "{getFraseInspiradora()}"
            </p>
            <Badge variant="secondary" className="text-sm">
              💫 Frase inspiradora do dia
            </Badge>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowGraph(false)}
              variant="outline"
              className="flex-1"
            >
              Voltar à Missão
            </Button>
            <Button 
              onClick={concluirMissao}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Concluir Missão
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-background via-muted/30 to-background shadow-xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Missão do Dia
        </CardTitle>
        <p className="text-sm text-muted-foreground italic">
          "Mais que uma rotina, um reencontro com sua melhor versão."
        </p>
        <div className="mt-4">
          <Progress value={progresso} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(progresso)}% concluído ({Math.round(progresso * 12 / 100)} de 12 respostas)
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* BLOCO 1 - RITUAL DA MANHÃ */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">Ritual da Manhã</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            "Como você iniciou o seu dia hoje?"
          </p>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                🫖 Qual foi o primeiro líquido que consumiu?
              </Label>
              {renderOptions(liquidoOptions, missao?.liquido_ao_acordar, (value) => 
                updateMissao({ liquido_ao_acordar: value })
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                🧘‍♀️ Praticou algum momento de conexão interna?
              </Label>
              {renderOptions(conexaoOptions, missao?.pratica_conexao, (value) => 
                updateMissao({ pratica_conexao: value })
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                📿 Como você classificaria sua energia ao acordar?
              </Label>
              {renderEmojiScale(missao?.energia_ao_acordar, (value) => 
                updateMissao({ energia_ao_acordar: value })
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* BLOCO 2 - HÁBITOS DO DIA */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">Hábitos do Dia</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            "Agora me conte como foi seu autocuidado ao longo do dia."
          </p>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                💤 Quantas horas você dormiu?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {sonoOptions.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={missao?.sono_horas === value ? "default" : "outline"}
                    onClick={() => updateMissao({ sono_horas: value })}
                    className="h-auto p-3"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                💧 Quanto de água você bebeu hoje?
              </Label>
              {renderOptions(aguaOptions, missao?.agua_litros, (value) => 
                updateMissao({ agua_litros: value })
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                🏃‍♂️ Praticou atividade física?
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={missao?.atividade_fisica === true ? "default" : "outline"}
                  onClick={() => updateMissao({ atividade_fisica: true })}
                  className="flex-1"
                >
                  Sim
                </Button>
                <Button
                  variant={missao?.atividade_fisica === false ? "default" : "outline"}
                  onClick={() => updateMissao({ atividade_fisica: false })}
                  className="flex-1"
                >
                  Ainda não
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                🌡 Como está seu nível de estresse? (1 = calmo, 5 = muito estressado)
              </Label>
              {renderNumberScale(missao?.estresse_nivel, (value) => 
                updateMissao({ estresse_nivel: value })
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                🍬 Sentiu fome emocional hoje?
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={missao?.fome_emocional === true ? "default" : "outline"}
                  onClick={() => updateMissao({ fome_emocional: true })}
                  className="flex-1"
                >
                  Sim
                </Button>
                <Button
                  variant={missao?.fome_emocional === false ? "default" : "outline"}
                  onClick={() => updateMissao({ fome_emocional: false })}
                  className="flex-1"
                >
                  Não
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* BLOCO 3 - MENTE & EMOÇÕES */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">Mente & Emoções</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            "Agora, vamos cuidar da mente e das emoções."
          </p>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                💖 Hoje você foi grato por...
              </Label>
              {renderOptions(gratidaoOptions, missao?.gratidao, (value) => 
                updateMissao({ gratidao: value })
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                🏆 Qual foi sua pequena vitória de hoje?
              </Label>
              <Input
                placeholder="Ex: Comi bem, Saí para caminhar..."
                value={missao?.pequena_vitoria || ""}
                onChange={(e) => updateMissao({ pequena_vitoria: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                ✨ Qual sua intenção para amanhã?
              </Label>
              {renderOptions(intencaoOptions, missao?.intencao_para_amanha, (value) => 
                updateMissao({ intencao_para_amanha: value })
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                ⭐ Como você avalia seu dia? (1 a 5 estrelas)
              </Label>
              {renderStars(missao?.nota_dia, (value) => 
                updateMissao({ nota_dia: value })
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* BOTÕES FINAIS */}
        <div className="flex gap-4">
          <Button 
            onClick={() => setShowGraph(true)}
            variant="outline"
            className="flex-1"
            disabled={progresso < 80}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Ver minha evolução
          </Button>
          <Button 
            onClick={concluirMissao}
            className="flex-1 bg-gradient-to-r from-primary to-accent"
            disabled={progresso < 100}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Concluir Missão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissaoDia;