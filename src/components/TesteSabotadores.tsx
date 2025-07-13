import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Target, CheckCircle, Lightbulb, BarChart3, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from 'recharts';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const perguntas = [
  "Eu sempre escolho roupas que mais disfarçam meu excesso de peso.",
  "Tenho peças que disfarçam meu corpo, e por isso prefiro até lavar mais vezes essas mesmas peças roupa 'do que' ir às compras e me sentir frustrado(a).",
  "Mesmo quando emagreço, guardo as roupas de quando eu estava acima do peso.",
  "Quando emagreço, tenho medo de desfazer das roupas 'de gordo' e engordar.",
  "Não me desfaço das roupas de gordo mesmo tendo emagrecido, pois tenho apego muito grande às minhas roupas.",
  "Sempre que recebo algum dinheiro, logo penso em comer algo gostoso e caro que não como no dia a dia.",
  "Só de saber que vou ter dinheiro, penso em comemorar comendo algo.",
  "Em época de pagamento, é normal, no meu trabalho, combinarmos uma saída para comer.",
  "Se eu sei que tenho dinheiro, não consigo resistir às tentações, vou lá e compro guloseimas.",
  "Eu realmente acredito que ter dinheiro, me motiva a comer.",
  "Quando eu começo a emagrecer, sempre me deparo com pessoas que dizem: 'Você está ficando feia e com cara de doente'.",
  "Toda vez que eu consigo emagrecer, as pessoas mais próximas que eu amo tanto, dizem que estou magra demais e com cara de doente.",
  "Quando os outros começam a falar que estou ficando magra demais, logo volto a comer novamente, até mesmo sem pensar. Me sinto frustrada com essas críticas.",
  "Meus pais sempre me alertaram para eu não ficar muito magro(a), pois magro(a) demais, tem cara de doente.",
  "Quando consigo emagrecer, tenho sempre dificuldade de reconhecer e aceitar minha nova imagem. Tenho sensação de estranheza no espelho.",
  "Na minha infância, eu era tão magro que os outros sempre me chamavam de feia.",
  "Na minha infância eu tinha muita dificuldade de me olhar no espelho, de tão magra e feia que me sentia.",
  "Sempre que emagreço, lembro, que na minha infância me sentia feia em ser magra.",
  "Na infância, os outros viviam falando que eu era feia de tão magra.",
  "Acho muito feio pessoas muito magras e não consigo me imaginar magro(a), como já fui na infância.",
  "Me sinto tão cobrado(a) pelos meus pais, quanto ao meu peso, que acabo 'descontando' ainda mais na comida.",
  "Sou muito cobrado(a) pelos meus familiares e amigos em relação ao meu peso. Essa pressão, me faz comer mais ainda.",
  "Penso que a maior preocupação dos meus pais em relação a mim, é ligada ao meu sobrepeso.",
  "Sempre acho que estou sendo cobrado(a) por todos para emagrecer, isso faz com que eu queira comer ainda mais.",
  "Quando saio na rua, tenho o sentimento que os outros me olham diferente, isso me faz ter ainda mais vontade de comer.",
  "Sempre que estou feliz, quero comemorar comendo qualquer comida gostosa.",
  "Se acontece algo que me deixa triste, logo penso naquele chocolate ou em comer algo.",
  "Se estou nervoso(a), angustiado(a), logo penso que preciso comer para aliviar meus sentimentos ruins.",
  "Quando estou ansioso(a), nervoso(a), com medo, pensativo(a), só aumenta meu desejo de comer algo delicioso.",
  "Acredito que eu mereço comer doce, quando me sinto sozinho(a).",
  "Já tentei de diversas de todas formas emagrecer e acredito que emagrecer não é para mim.",
  "Eu já nem acredito que eu possa (o) emagrecer.",
  "Quando penso em emagrecer, já penso que tudo vai dar errado.",
  "Não consigo encontrar forças para lutar pelo meu peso/corpo que desejo. Afinal, emagrecer é muito difícil.",
  "Quando penso em emagrecimento, só tenho pensamentos ruins.",
  "Eu acredito que só consigo emagrecer, se fizer atividade física.",
  "Só de pensar que tenho que fazer qualquer atividade física, já desisto de tentar emagrecer.",
  "Eu não gosto de ir para academia, tenho muito vergonha por conta do meu corpo atual.",
  "Até já tentei ir à academia, mas sempre desisto pois fico me comparando e achando que todos estão olhando para o meu corpo.",
  "Eu odeio ir para academia pois acredito que significa 'pagar para sofrer'.",
  "Eu acredito que fazer dieta é viver sob pressão?",
  "Você costuma ficar ansioso(a) durante uma dieta, se perguntando quando irá voltar a comer de forma normal.",
  "Eu já penso em desistir, só de pensar que tenho que ter uma alimentação restrita e saudável.",
  "Realmente sofro, quando penso em alimentação saudável.",
  "Eu não consigo acreditar que comer de forma saudável é bom.",
  "Eu realmente acredito que o maior prazer da vida, é comer.",
  "Eu só me sinto realmente feliz e completa, quando eu estou comendo.",
  "Se for para comer só um pedaço, eu nem começo. Gosto mesmo é de comer até ficar feliz e satisfeita.",
  "Sempre que me perguntam o que eu mais gosto, minha resposta imediata é comer.",
  "Todos os meus programas, envolvem uma comida gostosa. Passeios sem comidas saborosas, não tem graça para mim.",
  "Eu realmente recordo que minha infância foi muito pobre e poucos recursos financeiros e emocionais. Quando pensava em comer, quase sempre tinha apenas coisas básicas.",
  "Na minha infância sempre aprendi que as pessoas mais gordinhas eram ricas e tinham dinheiro.",
  "Lembro que os meus amigos (as) gordinhos tinham mais dinheiro.",
  "Na minha infância, meus pais me diziam: 'Olha você tem que comer muito, para crescer forte, trabalhar bem, ganhar dinheiro e ajudar seus pais'.",
  "Meus pais diziam 'Come para ficar forte!! Quanto mais forte, mais fartura e dinheiro você terá.' (Mensagens da sua infância).",
  "Sempre que vejo uma pessoa magra, penso que ela não tem personalidade ou tende a ser uma pessoa manipulável.",
  "Aprendi que pessoas magras são frágeis e fracas.",
  "Quando fui magra, me sentia uma pessoa fraca, sem energia e sem saúde.",
  "Na minha infância, sempre tive a sensação que as pessoas magras, eram fracas.",
  "Meus pais sempre me diziam que se eu ficasse muito magra, ficaria fraca e doente.",
  "Eu realmente acredito que as pessoas devem me amar do jeito que sou, mesmo estando acima do peso.",
  "Eu não gosto da ideia de ter que emagrecer para conquistar um relacionamento amoroso. Afinal, acredito que as pessoas devem me aceitar como sou.",
  "Já cheguei a emagrecer, quando isso aconteceu não me reconheci magra, então, novamente engordei.",
  "Já acostumei tanto em ficar acima do peso, que não consigo me imaginar de outra forma.",
  "Aprendi que as pessoas precisam me amar assim, mesmo acima do peso.",
  "Sempre que começo a ficar mais bonito(a) e mais magro(a), tenho sérios problemas no meu relacionamento por ciúmes do(a) meu/minha companheiro(a).",
  "Confesso que já cheguei a emagrecer mas em virtude de brigas e ciúmes voltei a engordar, para manter o meu relacionamento.",
  "Não tenho apoio do meu cônjuge para cuidar da minha aparência física. Sinto que isso incomoda meu parceiro(a).",
  "Acredito que com uma aparência melhor eu teria problemas em ser fiel ao meu/minha parceiro(a), por isso prefiro não me cuidar tanto.",
  "Prefiro ficar como estou, do que gerar algum problema para o meu casamento, quando o assunto é meu corpo e minha beleza.",
  "Lembro que na minha infância, eu chamava muita atenção dos outros pela minha beleza.",
  "Tenho um(a) irmão(ã), sempre achei que ele(a) era mais bonito(a) e chamava mais atenção do sexo oposto. Isso realmente me incomodava muito.",
  "Na minha família, sempre falavam que eu era o mais bonito(a), isso realmente me incomodava muito, me sentia até estranho(a).",
  "Sempre me sentia deslocado(a) sendo a pessoa mais magra da família, por isso resolvi engordar para me sentir mais parecido(a) com os familiares.",
  "Lembro que na minha infância e grupo de amigas, eu era sempre muito cobrada e criticada por ser a mais bonita. No fundo isso me incomodava.",
  "Eu realmente acredito que as mulheres/homens muito bonitos, são burros.",
  "Na minha infância e adolescência, eu me sentia constrangido(a) quando percebia que minha beleza chamava atenção.",
  "Na minha infância, não me lembro de receber elogios sobre minha aparência física. Me sentia feio(a) e muito triste.",
  "Sempre tive dificuldade de paquerar, acreditava sempre que eu era muito feio(a).",
  "Nunca gostei de chamar atenção dos outros pela minha aparência física.",
  "Depois do nascimento do meu filho/filha, entendi que preciso viver apenas para meu filho(a).",
  "Aprendi que tenho que ser somente mãe/pai (válido para homens e mulheres) cuidar da casa. Cuidar dos filhos e marido/esposa.",
  "Hoje eu só me sinto realizado (válido para homens e mulheres), fazendo as coisas pelo meu filho(a).",
  "Depois da maternidade/paternidade (válido para homens e mulheres), passei a viver apenas a vida do meu filho(a) e marido/esposa.",
  "Sou o tipo de mãe/pai que realmente gosta de fazer tudo pelo filho(a) e marido/esposa. Esqueço até de mim.",
  "Tenho dificuldades com minha sexualidade, pois prefiro comer um doce a fazer sexo.",
  "Tenho marcas no passado relacionada as minhas questões sexuais, por isso, sem perceber comecei engordar.",
  "Na verdade, eu tenho medo de me relacionar com homens, me incomoda a forma com que me olham, por isso escolhi não ser atraente para eles.",
  "Não me sinto protegido(a) ou realizada(s) nas minhas atividades sexuais.",
  "Tenho dificuldades com orgasmo, não me sinto confortável no momento do sexo.",
  "Participo de um grupo de pessoas, em que a maioria está acima do peso e quando eu começo a emagrecer, me sinto estranho(a) próximo a essas pessoas.",
  "Sou capaz de sair de um grupo de amigos que amo, quando me sinto diferente. Isso realmente me incomoda.",
  "Percebo que, muitas vezes, ajo de forma contrária a minha vontade, para agradar e me sentir acolhido(a) pelo grupo de amigos que participo.",
  "Preciso me sentir amado(a) pelos grupos que pertenço. E não me sinto à vontade, sendo diferente dos outros.",
  "Na minha infância, me sentia diferente do grupo em que eu participava. Por isso, compensava comendo para ficar igual a todas (os) do grupo.",
  "Minhas reuniões familiares são sempre rodeadas à mesa farta de comida.",
  "Na minha infância sempre que eu comia tudo e até repetia, meus pais me elogiavam com muito carinho.",
  "Minhas maiores lembranças de receber amor e carinho da minha família estão sempre atrelados a comida.",
  "Qualquer encontro em família sempre é motivo para comer alguma coisa.",
  "Me lembro que nos momentos das refeições me sentia extremamente amado(a) pelos meus pais e familiares.",
  "Recentemente passei por um término de relacionamento e essa situação tem me deixado extremamente 'para baixo'.",
  "Ainda não me encontrei profissionalmente. Essa falta de realização no trabalho me deixa muito frustrado(a).",
  "Perdi meu trabalho recentemente e essa questão profissional me deixa com autoestima lá embaixo.",
  "Penso que nada dá certo na minha vida e, nesse momento, chego a acreditar que perdi a razão para viver.",
  "Eu já fui mais feliz. Hoje eu ando muito triste e perdi minha autoconfiança.",
  "Na minha infância, perdi uma pessoa querida que eu amava muito e isso me abalou de tal forma, que passei a engordar.",
  "Na minha infância, quando nasceu meu irmão/irmã, eu perdi toda atenção que era só minha.",
  "Na minha infância, eu ficava muito sozinho(a), pois meus pais estavam sempre ausentes. Esse acompanhamento e amor me fez muita falta.",
  "Na minha infância, houve separação dos meus pais e isso teve um grande impacto negativo na minha vida.",
  "Não tive relacionamento com meus pais desde a infância e fui cuidado por outras pessoas e familiares. Isso me fez muita falta.",
  "Aprendi que primeiro preciso agradar e satisfazer os outros, depois penso em mim.",
  "Eu tenho a tendência a pensar nos outros e esquecer de mim e das minhas tarefas.",
  "Sempre acabo fazendo a vontade dos outros, com medo de ser rejeitado(a) ou de pensarem mal de mim.",
  "Tenho dificuldade em dizer 'não' para os outros e isso acaba me frustrando.",
  "Gosto de agradar os outros e acabo ficando em último lugar e por isso, não me agrado."
];

const opcoes = [
  { value: 5, label: "Concordo Fortemente" },
  { value: 4, label: "Concordo" },
  { value: 3, label: "Às Vezes" },
  { value: 2, label: "Discordo" },
  { value: 1, label: "Discordo Fortemente" }
];

const calcularSabotadores = (respostas: (number | null)[]) => {
  const sabotadores = {
    roupas: [0, 1, 2, 3, 4],
    dinheiro: [5, 6, 7, 8, 9],
    estranheza_mudanca: [10, 11, 12, 13, 14],
    magreza_infancia: [15, 16, 17, 18, 19],
    rivalidade: [20, 21, 22, 23, 24],
    valvula_escape: [25, 26, 27, 28, 29],
    falta_crencas: [30, 31, 32, 33, 34],
    atividade_fisica: [35, 36, 37, 38, 39],
    crenca_contraria: [40, 41, 42, 43, 44],
    prazer_comida: [45, 46, 47, 48, 49],
    obesidade_riqueza: [50, 51, 52, 53, 54],
    tamanho_fortaleza: [55, 56, 57, 58, 59],
    apego_autoimagem: [60, 61, 62, 63, 64],
    problemas_conjuge: [65, 66, 67, 68, 69],
    fuga_beleza: [70, 71, 72, 73, 74],
    protecao_filhos: [75, 76, 77, 78, 79],
    fuga_afetiva: [80, 81, 82, 83, 84],
    biotipo_identidade: [85, 86, 87, 88, 89],
    comida_afeto: [90, 91, 92, 93, 94],
    perdas_presente: [95, 96, 97, 98, 99],
    perdas_infancia: [100, 101, 102, 103, 104],
    critico: [105, 106, 107, 108, 109],
    boazinha: [110, 111, 112, 113, 114]
  };

  const scores: Record<string, number> = {};
  
  Object.keys(sabotadores).forEach(sabotador => {
    const indices = sabotadores[sabotador as keyof typeof sabotadores];
    const soma = indices.reduce((acc, index) => {
      const resposta = respostas[index];
      return acc + (typeof resposta === 'number' ? resposta : 0);
    }, 0);
    scores[sabotador] = Math.round((soma / indices.length) * 20);
  });

  return scores;
};

const getNomeSabotador = (key) => {
  const nomes = {
    roupas: "Sabotador das Roupas",
    dinheiro: "Sabotador do Dinheiro",
    estranheza_mudanca: "Estranheza da Mudança",
    magreza_infancia: "Magreza da Infância",
    rivalidade: "Rivalidade",
    valvula_escape: "Válvula de Escape",
    falta_crencas: "Falta de Crenças",
    atividade_fisica: "Atividade Física",
    crenca_contraria: "Crença Contrária",
    prazer_comida: "Prazer da Comida",
    obesidade_riqueza: "Obesidade como Riqueza",
    tamanho_fortaleza: "Tamanho como Fortaleza",
    apego_autoimagem: "Apego à Autoimagem",
    problemas_conjuge: "Problemas com Cônjuge",
    fuga_beleza: "Fuga da Beleza",
    protecao_filhos: "Proteção dos Filhos",
    fuga_afetiva: "Fuga Afetiva",
    biotipo_identidade: "Biotipo e Identidade",
    comida_afeto: "Comida como Afeto",
    perdas_presente: "Perdas no Presente",
    perdas_infancia: "Perdas na Infância",
    critico: "Crítico Interno",
    boazinha: "Boazinha Demais"
  };
  return nomes[key] || key;
};

const getDicaSabotador = (key) => {
  const dicas = {
    roupas: {
        resumo: "O sabotador das roupas te faz esconder seu corpo e evitar a realidade do espelho. Você se apega a peças antigas como uma forma de segurança, temendo o fracasso e a frustração de não encontrar roupas que sirvam.",
        comoSuperar: "Comece a renovar seu guarda-roupa gradualmente. Doe peças que não servem mais e que trazem memórias ruins. Experimente comprar uma peça nova que te valorize, mesmo que seja um acessório. Encare o espelho como um aliado, não um inimigo, e celebre cada pequena mudança que notar em seu corpo."
    },
    dinheiro: {
        resumo: "Este sabotador associa recompensa e celebração diretamente com comida. O dinheiro na mão se torna um gatilho para gastar com guloseimas e refeições especiais, transformando a alimentação em uma comemoração constante, o que dificulta o controle.",
        comoSuperar: "Crie novas formas de se recompensar que não envolvam comida. Use o dinheiro para investir em um hobby, um passeio, um livro ou roupas novas. Planeje suas finanças para que a comida não seja a principal válvula de escape para suas emoções ou a única forma de celebrar."
    },
    valvula_escape: {
        resumo: "Você usa a comida como uma muleta emocional para lidar com estresse, tristeza, ansiedade e até felicidade. Qualquer emoção intensa se torna um pretexto para comer, criando um ciclo vicioso de comer para aliviar sentimentos, o que gera culpa e mais sentimentos negativos.",
        comoSuperar: "Identifique os gatilhos emocionais. Antes de comer, pergunte-se: 'Estou com fome ou estou sentindo algo?'. Crie uma 'caixa de primeiros socorros emocionais' com alternativas: ligar para um amigo, ouvir música, fazer uma caminhada, escrever em um diário ou praticar respiração profunda."
    },
    prazer_comida: {
        resumo: "Para você, o maior (ou único) prazer da vida é comer. Nenhum outro programa parece tão atraente quanto uma boa refeição. Essa crença te impede de encontrar satisfação em outras áreas da vida, tornando a comida o centro de tudo.",
        comoSuperar: "Expanda seu leque de prazeres. Faça uma lista de 20 coisas que você gosta de fazer e que não envolvam comida (ex: dançar, ler, aprender algo novo, cuidar de plantas). Pratique o 'comer consciente' (mindful eating), saboreando cada pedaço lentamente para aumentar a satisfação com porções menores."
    },
    critico: {
        resumo: "Uma voz interna te julga constantemente, minando sua autoconfiança e fazendo você acreditar que não é capaz de emagrecer. Esse crítico interno te pune por cada deslize, gerando um ciclo de autossabotagem e desistência.",
        comoSuperar: "Dê um nome a essa voz crítica e diga 'Pare!' quando ela aparecer. Pratique a autocompaixão: trate-se com a mesma gentileza que trataria um amigo querido. Anote suas qualidades e pequenas vitórias diárias para fortalecer sua autoimagem positiva."
    },
    boazinha: {
        resumo: "Você tem uma enorme dificuldade em dizer 'não'. Sua necessidade de agradar os outros faz com que você coloque as necessidades deles sempre à frente das suas, inclusive as relacionadas à sua saúde e emagrecimento. Você come para não fazer desfeita e negligencia seus próprios planos.",
        comoSuperar: "Comece a praticar dizer 'não' em situações de baixo risco. Use frases como 'Obrigada, mas vou passar desta vez' ou 'Agradeço o convite, mas tenho outro compromisso (comigo mesma!)'. Lembre-se que cuidar de você não é egoísmo, é uma necessidade."
    },
    estranheza_mudanca: {
        resumo: "Quando você emagrece, se sente desconfortável com sua nova imagem e com os comentários alheios, especialmente os que dizem que você parece 'doente'. Isso gera uma crise de identidade que te leva a voltar aos velhos hábitos para se sentir 'normal' de novo.",
        comoSuperar: "Prepare-se mentalmente para a mudança. Faça afirmações positivas diárias em frente ao espelho, como 'Eu aceito e amo meu novo corpo'. Tenha respostas prontas para comentários negativos, como 'Estou mais saudável do que nunca, obrigada pela preocupação'. Cerque-se de pessoas que apoiam sua transformação."
    },
    magreza_infancia: {
        resumo: "Você associa a magreza a sentimentos negativos da sua infância, como se sentir feia ou fraca. Inconscientemente, você mantém o sobrepeso para se proteger dessas memórias dolorosas e evitar reviver essas emoções.",
        comoSuperar: "Ressignifique suas memórias. Escreva uma carta para a sua 'criança interior', explicando que hoje você é uma adulta forte e que ser magra significa saúde e vitalidade, não fraqueza. A terapia pode ser muito útil para processar essas memórias."
    },
    falta_crencas: {
        resumo: "Após tantas tentativas frustradas, você simplesmente não acredita mais que é capaz de emagrecer. Essa falta de fé se torna uma profecia autorrealizável, onde qualquer obstáculo é visto como a confirmação de que 'não adianta tentar'.",
        comoSuperar: "Quebre o objetivo grande em metas minúsculas e alcançáveis (ex: beber 1 copo de água a mais por dia). Comemore cada micro-vitória para construir um histórico de sucesso. Acompanhe seu progresso em fotos e medidas, não apenas na balança, para ver as mudanças acontecendo."
    },
    atividade_fisica: {
        resumo: "Você odeia a ideia de exercício físico, associando-o a sofrimento, vergonha e comparação. A academia é um ambiente hostil para você, o que te faz desistir do emagrecimento por acreditar que um não existe sem o outro.",
        comoSuperar: "Encontre uma forma de movimento que você goste. Pode ser dançar na sala, caminhar no parque ouvindo música, natação, ioga online. Desvincule 'movimento' de 'academia'. O objetivo é celebrar o que seu corpo pode fazer, não puni-lo."
    },
    crenca_contraria: {
        resumo: "Você acredita que fazer dieta é viver sob pressão e que a alimentação saudável é uma tortura. Essa crença te impede de ver o lado positivo de uma reeducação alimentar, transformando qualquer tentativa em um sofrimento.",
        comoSuperar: "Mude sua perspectiva sobre a alimentação saudável. Explore novas receitas, descubra alimentos saborosos e nutritivos. Foque nos benefícios para sua saúde e bem-estar, não apenas na restrição. Veja a alimentação como autocuidado e prazer."
    },
    obesidade_riqueza: {
        resumo: "Você associa o sobrepeso a riqueza e fartura, e a magreza à pobreza ou doença. Essas crenças, muitas vezes enraizadas na infância, fazem com que você, inconscientemente, resista a emagrecer para não 'perder' essa simbologia de prosperidade.",
        comoSuperar: "Desconstrua essa associação. Entenda que a verdadeira riqueza está na saúde e na qualidade de vida. Busque exemplos de pessoas saudáveis e bem-sucedidas. Relembre que o valor de uma pessoa não está ligado ao seu peso."
    },
    tamanho_fortaleza: {
        resumo: "Você pode ter a crença de que ser grande ou ter um corpo maior te confere força, proteção ou respeito. A ideia de emagrecer pode gerar a sensação de perda de poder ou fragilidade, levando à autossabotagem para manter essa 'fortaleza'.",
        comoSuperar: "Reconheça sua força interior e suas qualidades que independem do seu tamanho físico. Entenda que a saúde e a vitalidade são as verdadeiras fortalezas. Construa uma autoimagem baseada em seus valores e capacidades, não apenas no corpo."
    },
    apego_autoimagem: {
        resumo: "Você se acostumou tanto com sua imagem atual que tem dificuldade em se ver de outra forma. Há um medo inconsciente de não se reconhecer ou de perder a 'identidade' que construiu com seu corpo atual, mesmo que não seja saudável.",
        comoSuperar: "Permita-se a redescoberta. Encare o emagrecimento como uma oportunidade de se reconectar com uma versão mais saudável e feliz de si. Peça para amigos e familiares próximos reforçarem sua nova imagem de forma positiva. Abrace o processo de autotransformação."
    },
    problemas_conjuge: {
        resumo: "Você pode estar sabotando seu emagrecimento devido a medos relacionados ao seu relacionamento. Ciúmes do parceiro, medo de atrair outros ou de mudanças na dinâmica da relação podem fazer com que você, inconscientemente, prefira manter o peso.",
        comoSuperar: "Abra o diálogo com seu cônjuge sobre seus objetivos e medos. O apoio e a compreensão mútua são essenciais. Se o ciúme é um problema, trabalhem juntos na confiança e na segurança da relação. Lembre-se que cuidar de si fortalece a parceria."
    },
    fuga_beleza: {
        resumo: "Em algum momento da vida, a sua beleza pode ter gerado desconforto, inveja ou problemas. Isso pode ter levado à crença de que é 'perigoso' ser bonito(a), e você inconscientemente se sabota para evitar a atenção ou as consequências da sua própria beleza.",
        comoSuperar: "Reconheça e aceite sua beleza como parte de quem você é. Desconstrua a ideia de que ser bonito(a) é um fardo. Entenda que o valor de uma pessoa vai além da aparência física. O foco deve ser na saúde e bem-estar, não na busca por uma 'aparência perigosa'."
    },
    protecao_filhos: {
        resumo: "Você se sente na obrigação de viver apenas para seus filhos e família, negligenciando suas próprias necessidades e bem-estar. A maternidade/paternidade se torna uma 'desculpa' para não cuidar de si, acreditando que é um ato de abnegação.",
        comoSuperar: "Entenda que cuidar de si é fundamental para cuidar bem dos outros. Ser um exemplo de saúde e autocuidado para seus filhos é um dos maiores presentes que você pode dar a eles. Reserve um tempo diário para você, sem culpa, seja para exercício, leitura ou relaxamento."
    },
    fuga_afetiva: {
        resumo: "Você pode estar usando o excesso de peso como uma barreira para a intimidade ou para evitar situações de vulnerabilidade emocional e sexual. A comida se torna um refúgio para não lidar com questões de afeto ou sexualidade.",
        comoSuperar: "Busque apoio profissional para trabalhar questões de intimidade e sexualidade. Explore outras formas de prazer e conexão emocional. Entenda que a comida é alimento, não um substituto para o afeto ou para a expressão da sua sexualidade."
    },
    biotipo_identidade: {
        resumo: "Você pode ter a crença de que seu biotipo ou sua identidade está ligada ao seu peso atual. Experiências passadas, como ser muito magro(a) na infância e se sentir fraco(a), podem fazer com que você, inconscientemente, evite retornar àquele estado, mesmo que não seja saudável.",
        comoSuperar: "Aceite seu biotipo, mas busque sua melhor versão saudável dentro dele. Foque na saúde e no bem-estar, não em atingir um peso que o fez mal no passado. O importante é o equilíbrio e a sensação de vitalidade no presente."
    },
    comida_afeto: {
        resumo: "Em sua família, o amor e o afeto sempre foram muito associados à comida. Reuniões fartas, elogios ao comer muito, e a comida como conforto em momentos difíceis, fizeram com que você associasse o ato de comer a ser amado(a) e aceito(a).",
        comoSuperar: "Encontre novas formas de dar e receber afeto que não envolvam comida. Cultive conversas significativas, abraços, tempo de qualidade e palavras de afirmação. Redefina a forma como você celebra e expressa amor na família, inserindo atividades não-alimentares."
    },
    perdas_presente: {
        resumo: "Você está lidando com perdas significativas no presente (término de relacionamento, perda de emprego, desilusões). A comida se torna uma forma de lidar com a tristeza, frustração e falta de propósito, preenchendo um vazio emocional.",
        comoSuperar: "Procure ajuda profissional (terapia) para processar suas perdas. Desenvolva mecanismos de enfrentamento saudáveis, como exercícios, hobbies, meditação, ou buscar apoio em grupos de suporte. Permita-se sentir as emoções sem recorrer à comida como escape."
    },
    perdas_infancia: {
        resumo: "Traumas ou perdas na infância (separação dos pais, ausência, falta de atenção) podem ter levado você a usar a comida como conforto ou preenchimento de um vazio emocional. Essa programação inconsciente persiste na vida adulta, dificultando o emagrecimento.",
        comoSuperar: "Reconheça e valide a dor da sua criança interior. Busque apoio terapêutico para trabalhar esses traumas e ressignificar essas experiências. A comida não pode curar feridas emocionais. Entenda que você merece amor e atenção agora, e que pode se dar isso a si mesmo de formas saudáveis."
    },
  };
  return dicas[key] || { resumo: "Seu padrão de comportamento interfere nos seus objetivos.", comoSuperar: "Identificar a raiz desse comportamento é o primeiro passo. Busque entender o que te leva a agir dessa forma e procure ajuda profissional para desenvolver novas estratégias e fortalecer sua jornada de emagrecimento." };
};

export const TesteSabotadores: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [respostas, setRespostas] = useState<(number | null)[]>(new Array(115).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const progress = ((currentStep - 1) / 115) * 100;
  const currentQuestion = currentStep;

  const handleAnswer = (value: number) => {
    const newRespostas = [...respostas];
    newRespostas[currentQuestion - 1] = value;
    setRespostas(newRespostas);
  };

  const handleNext = () => {
    if (currentStep < 115) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const scores = calcularSabotadores(respostas);
      
      const topSabotadores = Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([key, score]) => {
            const detalhes = getDicaSabotador(key);
            return {
              nome: getNomeSabotador(key),
              pontuacao: score,
              resumo: detalhes.resumo,
              comoSuperar: detalhes.comoSuperar
            };
        });

      // Para demonstração, salvamos no localStorage
      // Com Supabase integrado, aqui seria salvo no banco de dados
      const resultado = {
        scores,
        topSabotadores,
        data: new Date().toISOString()
      };
      
      localStorage.setItem('testeSabotadores', JSON.stringify(resultado));
      setResultData(resultado);
      setTestCompleted(true);
      
    } catch (error) {
      console.error('Erro ao processar resultado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = () => {
    setCurrentStep(1);
    setRespostas(new Array(115).fill(null));
    setTestCompleted(false);
    setResultData(null);
  };

  if (testCompleted && resultData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-instituto-dark mb-2">
            Teste Concluído!
          </h2>
          <p className="text-muted-foreground">
            Aqui estão seus principais sabotadores e como superá-los
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-instituto-orange" />
                Seus Principais Sabotadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resultData.topSabotadores.map((sabotador, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <h3 className="font-semibold">{sabotador.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Pontuação: {sabotador.pontuacao}%
                      </p>
                    </div>
                    <Badge 
                      variant={sabotador.pontuacao >= 80 ? "destructive" : 
                               sabotador.pontuacao >= 60 ? "default" : "secondary"}
                    >
                      {sabotador.pontuacao >= 80 ? "Alto" : 
                       sabotador.pontuacao >= 60 ? "Médio" : "Baixo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-instituto-orange" />
                Como Superar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {resultData.topSabotadores.map((sabotador, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {sabotador.nome}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">O que é:</h4>
                          <p className="text-sm text-muted-foreground">
                            {sabotador.resumo}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Como superar:</h4>
                          <p className="text-sm text-muted-foreground">
                            {sabotador.comoSuperar}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={resetTest}
            variant="outline"
            className="mr-4"
          >
            Refazer Teste
          </Button>
          <Button 
            className="bg-instituto-orange hover:bg-instituto-orange/90"
          >
            Agendar Consulta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-instituto-orange" />
            Teste dos Sabotadores
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pergunta {currentStep} de 115</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {perguntas[currentQuestion - 1]}
              </h3>
              
              <div className="space-y-3">
                {opcoes.map((opcao) => (
                  <Button
                    key={opcao.value}
                    variant={respostas[currentQuestion - 1] === opcao.value ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto p-4 ${
                      respostas[currentQuestion - 1] === opcao.value 
                        ? "bg-instituto-orange hover:bg-instituto-orange/90" 
                        : ""
                    }`}
                    onClick={() => handleAnswer(opcao.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        respostas[currentQuestion - 1] === opcao.value 
                          ? "bg-white border-white" 
                          : "border-current"
                      }`} />
                      <span>{opcao.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={respostas[currentQuestion - 1] === null || isSubmitting}
                className="flex items-center gap-2 bg-instituto-orange hover:bg-instituto-orange/90"
              >
                {currentStep === 115 
                  ? (isSubmitting ? 'Finalizando...' : 'Finalizar')
                  : 'Próxima'
                }
                {currentStep < 115 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};
