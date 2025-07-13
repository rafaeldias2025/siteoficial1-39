
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star,
  Search,
  Filter,
  CheckCircle,
  PlayCircle,
  Download,
  Heart,
  Share
} from "lucide-react";

const cursos = [
  {
    id: 1,
    titulo: "Reeducação Alimentar Definitiva",
    instrutor: "Dr. Ana Silva",
    categoria: "Nutrição",
    duracao: "4h 30min",
    aulas: 12,
    nivel: "iniciante",
    rating: 4.8,
    estudantes: 1240,
    progresso: 65,
    thumbnail: "🥗",
    descricao: "Aprenda os fundamentos de uma alimentação saudável e sustentável para toda a vida.",
    status: "em_progresso"
  },
  {
    id: 2,
    titulo: "Mindfulness para Emagrecimento",
    instrutor: "Dra. Maria Santos",
    categoria: "Psicologia",
    duracao: "3h 15min",
    aulas: 8,
    nivel: "intermediario",
    rating: 4.9,
    estudantes: 856,
    progresso: 0,
    thumbnail: "🧘",
    descricao: "Técnicas de atenção plena aplicadas ao processo de emagrecimento consciente.",
    status: "nao_iniciado"
  },
  {
    id: 3,
    titulo: "Exercícios em Casa: Do Básico ao Avançado",
    instrutor: "Prof. João Costa",
    categoria: "Atividade Física",
    duracao: "6h 45min",
    aulas: 20,
    nivel: "todos",
    rating: 4.7,
    estudantes: 2150,
    progresso: 100,
    thumbnail: "💪",
    descricao: "Programa completo de exercícios para fazer em casa, sem equipamentos.",
    status: "concluido"
  },
  {
    id: 4,
    titulo: "Gerenciamento de Estresse e Ansiedade",
    instrutor: "Dra. Clara Oliveira",
    categoria: "Bem-estar",
    duracao: "2h 50min",
    aulas: 6,
    nivel: "iniciante",
    rating: 4.6,
    estudantes: 674,
    progresso: 25,
    thumbnail: "🌸",
    descricao: "Estratégias práticas para lidar com o estresse e ansiedade no dia a dia.",
    status: "em_progresso"
  },
  {
    id: 5,
    titulo: "Planejamento de Refeições Saudáveis",
    instrutor: "Chef Marina Lima",
    categoria: "Culinária",
    duracao: "5h 20min",
    aulas: 15,
    nivel: "intermediario",
    rating: 4.8,
    estudantes: 920,
    progresso: 0,
    thumbnail: "👨‍🍳",
    descricao: "Aprenda a planejar e preparar refeições nutritivas e saborosas.",
    status: "nao_iniciado"
  },
  {
    id: 6,
    titulo: "Sono Reparador e Qualidade de Vida",
    instrutor: "Dr. Pedro Rocha",
    categoria: "Saúde",
    duracao: "3h 40min",
    aulas: 10,
    nivel: "todos",
    rating: 4.7,
    estudantes: 1580,
    progresso: 40,
    thumbnail: "😴",
    descricao: "Técnicas e hábitos para melhorar a qualidade do sono e descanso.",
    status: "em_progresso"
  }
];

const categorias = ["Todos", "Nutrição", "Psicologia", "Atividade Física", "Bem-estar", "Culinária", "Saúde"];

export default function BibliotecaCursos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedTab, setSelectedTab] = useState("todos");

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.instrutor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || curso.categoria === selectedCategory;
    const matchesTab = selectedTab === "todos" || 
                      (selectedTab === "em_progresso" && curso.status === "em_progresso") ||
                      (selectedTab === "concluidos" && curso.status === "concluido") ||
                      (selectedTab === "nao_iniciados" && curso.status === "nao_iniciado");
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "Nutrição": return "bg-green-100 text-green-800";
      case "Psicologia": return "bg-purple-100 text-purple-800";
      case "Atividade Física": return "bg-blue-100 text-blue-800";
      case "Bem-estar": return "bg-pink-100 text-pink-800";
      case "Culinária": return "bg-orange-100 text-orange-800";
      case "Saúde": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "iniciante": return "bg-green-100 text-green-800";
      case "intermediario": return "bg-yellow-100 text-yellow-800";
      case "avancado": return "bg-red-100 text-red-800";
      case "todos": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "em_progresso": return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case "concluido": return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Play className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Biblioteca de Cursos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acesse conteúdos exclusivos para sua jornada de transformação
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Cursos</p>
                  <p className="text-2xl font-bold">{cursos.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Concluídos</p>
                  <p className="text-2xl font-bold">{cursos.filter(c => c.status === "concluido").length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Em Progresso</p>
                  <p className="text-2xl font-bold">{cursos.filter(c => c.status === "em_progresso").length}</p>
                </div>
                <PlayCircle className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Horas Estudadas</p>
                  <p className="text-2xl font-bold">24h</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Pesquisar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categorias.map((categoria) => (
                  <Button
                    key={categoria}
                    variant={selectedCategory === categoria ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(categoria)}
                  >
                    {categoria}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={selectedTab === "todos" ? "default" : "ghost"}
            onClick={() => setSelectedTab("todos")}
            className="flex-1"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Todos os Cursos
          </Button>
          <Button
            variant={selectedTab === "em_progresso" ? "default" : "ghost"}
            onClick={() => setSelectedTab("em_progresso")}
            className="flex-1"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Em Progresso
          </Button>
          <Button
            variant={selectedTab === "concluidos" ? "default" : "ghost"}
            onClick={() => setSelectedTab("concluidos")}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Concluídos
          </Button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCursos.map((curso) => (
            <Card key={curso.id} className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-4xl">{curso.thumbnail}</div>
                  <div className="flex gap-2">
                    {getStatusIcon(curso.status)}
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{curso.titulo}</CardTitle>
                <p className="text-sm text-gray-600">por {curso.instrutor}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 line-clamp-2">{curso.descricao}</p>
                  
                  {curso.progresso > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{curso.progresso}%</span>
                      </div>
                      <Progress value={curso.progresso} className="h-2" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(curso.categoria)}>
                      {curso.categoria}
                    </Badge>
                    <Badge className={getNivelColor(curso.nivel)}>
                      {curso.nivel}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{curso.duracao}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{curso.aulas} aulas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{curso.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{curso.estudantes}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    {curso.status === "concluido" ? "Revisar Curso" : 
                     curso.status === "em_progresso" ? "Continuar" : "Iniciar Curso"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCursos.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-500">Tente ajustar seus filtros de pesquisa</p>
          </div>
        )}
      </div>
    </div>
  );
}
