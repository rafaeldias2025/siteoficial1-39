import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { UsersList } from '@/components/admin/UsersList';
import { CompleteTrendTrackWeightSystem } from '@/components/admin/CompleteTrendTrackWeightSystem';
import { ClientRegistrationForm } from '@/components/admin/ClientRegistrationForm';
import { SessionManagement } from '@/components/admin/SessionManagement';
import { SessionHistory } from '@/components/admin/SessionHistory';
import { ClientReports } from '@/components/admin/ClientReports';
import { UserManagement } from '@/components/admin/UserManagement';
import { DataVisualization } from '@/components/admin/DataVisualization';
import { BluetoothScaleIntegration } from '@/components/admin/BluetoothScaleIntegration';
import { BluetoothUserManagement } from '@/components/admin/BluetoothUserManagement';
import { MiScalePairingButton } from '@/components/admin/MiScalePairingButton';
import { 
  Users, 
  Video, 
  BarChart3, 
  Settings, 
  Bell,
  Crown,
  UserPlus,
  Calendar,
  MessageSquare,
  Target,
  TrendingUp,
  Scale,
  Shield,
  Eye,
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  console.log('AdminDashboard component rendering');
  
  const [notifications, setNotifications] = useState(3);

  const stats = [
    {
      title: "Clientes Ativos",
      value: "47",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "instituto-orange"
    },
    {
      title: "Sessões Enviadas",
      value: "124",
      change: "+8%",
      trend: "up",
      icon: Video,
      color: "instituto-purple"
    },
    {
      title: "Taxa de Conclusão",
      value: "89%",
      change: "+5%",
      trend: "up",
      icon: Target,
      color: "instituto-green"
    },
    {
      title: "Engajamento Semanal",
      value: "94%",
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
      color: "instituto-lilac"
    }
  ];

  const recentActivity = [
    {
      type: "session_completed",
      client: "Ana Silva",
      session: "Reflexão sobre Objetivos",
      time: "2 horas atrás",
      icon: Video
    },
    {
      type: "new_registration",
      client: "Carlos Santos",
      session: "Novo cliente registrado",
      time: "4 horas atrás",
      icon: UserPlus
    },
    {
      type: "session_response",
      client: "Maria Costa",
      session: "Autoconhecimento Profundo",
      time: "6 horas atrás",
      icon: MessageSquare
    }
  ];

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-netflix-dark p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-netflix-text flex items-center gap-3">
                <Crown className="h-8 w-8 text-instituto-gold animate-glow" />
                Painel Administrativo
              </h1>
              <p className="text-netflix-text-muted text-lg">
                Gerencie suas sessões e acompanhe o progresso dos seus clientes
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" className="relative border-netflix-border text-netflix-text hover:bg-netflix-hover">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-instituto-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-in">
                    {notifications}
                  </span>
                )}
              </Button>
              <Button variant="outline" className="border-netflix-border text-netflix-text hover:bg-netflix-hover">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card 
                key={stat.title} 
                className="bg-netflix-card border-netflix-border hover:border-instituto-orange/50 transition-all duration-300 floating-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-netflix-text-muted text-sm font-medium">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-netflix-text">
                        {stat.value}
                      </p>
                      <p className={`text-sm font-medium flex items-center gap-1 mt-1 text-instituto-green`}>
                        <TrendingUp className="h-3 w-3" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}/10 pulse-glow`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="bg-netflix-card border border-netflix-border grid grid-cols-2 lg:grid-cols-4 gap-1">
            {/* 👥 Gestão de Usuários */}
            <TabsTrigger 
              value="usuarios" 
              className="data-[state=active]:bg-instituto-orange data-[state=active]:text-white text-netflix-text transition-all duration-200 hover:bg-instituto-orange/20"
            >
              <Users className="h-4 w-4 mr-2" />
              👥 Usuários
            </TabsTrigger>
            
            {/* 📊 Relatórios e Dados */}
            <TabsTrigger 
              value="relatorios" 
              className="data-[state=active]:bg-instituto-purple data-[state=active]:text-white text-netflix-text transition-all duration-200 hover:bg-instituto-purple/20"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              📊 Relatórios
            </TabsTrigger>
            
            {/* ⚙️ Configurações */}
            <TabsTrigger 
              value="configuracoes" 
              className="data-[state=active]:bg-instituto-green data-[state=active]:text-white text-netflix-text transition-all duration-200 hover:bg-instituto-green/20"
            >
              <Settings className="h-4 w-4 mr-2" />
              ⚙️ Config
            </TabsTrigger>
            
            {/* 📲 Bluetooth */}
            <TabsTrigger 
              value="bluetooth" 
              className="data-[state=active]:bg-instituto-lilac data-[state=active]:text-white text-netflix-text transition-all duration-200 hover:bg-instituto-lilac/20"
            >
              <Scale className="h-4 w-4 mr-2" />
              📲 Balança
            </TabsTrigger>
          </TabsList>

          {/* 👥 GESTÃO DE USUÁRIOS */}
          <TabsContent value="usuarios" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Cadastro de Cliente */}
              <Card className="bg-netflix-card border-netflix-border hover:border-instituto-orange/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-instituto-orange" />
                    👤 Cadastrar Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClientRegistrationForm />
                </CardContent>
              </Card>

              {/* Lista de Usuários */}
              <Card className="bg-netflix-card border-netflix-border hover:border-instituto-orange/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Users className="h-5 w-5 text-instituto-orange" />
                    👥 Lista de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UsersList />
                </CardContent>
              </Card>
            </div>

            {/* Gerenciamento Completo */}
            <Card className="bg-netflix-card border-netflix-border hover:border-instituto-orange/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center gap-2">
                  <Shield className="h-5 w-5 text-instituto-orange" />
                  🔧 Gerenciamento Avançado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 📊 RELATÓRIOS E DADOS */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Visualização de Dados */}
              <Card className="bg-netflix-card border-netflix-border hover:border-instituto-purple/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Eye className="h-5 w-5 text-instituto-purple" />
                    📈 Visualizar Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataVisualization />
                </CardContent>
              </Card>

              {/* Relatórios de Clientes */}
              <Card className="bg-netflix-card border-netflix-border hover:border-instituto-purple/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-instituto-purple" />
                    📊 Relatórios de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClientReports />
                </CardContent>
              </Card>
            </div>

            {/* Sistema de Peso Completo */}
            <Card className="bg-netflix-card border-netflix-border hover:border-instituto-purple/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-instituto-purple" />
                  📈 Sistema de Controle de Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CompleteTrendTrackWeightSystem />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ⚙️ CONFIGURAÇÕES E INTEGRAÇÕES */}
          <TabsContent value="configuracoes" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Gestão de Sessões */}
              <Card className="bg-netflix-card border-netflix-border hover:border-instituto-green/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Video className="h-5 w-5 text-instituto-green" />
                    🎥 Gestão de Sessões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SessionManagement />
                </CardContent>
              </Card>

              {/* Histórico de Sessões */}
              <Card className="bg-netflix-card border-netflix-border hover:border-instituto-green/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-instituto-green" />
                    📅 Histórico de Sessões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SessionHistory />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 📲 PAREAMENTO COM BALANÇA BLUETOOTH */}
          <TabsContent value="bluetooth" className="space-y-6">
            {/* Botão Principal de Pareamento */}
            <Card className="bg-gradient-to-r from-instituto-lilac/10 to-instituto-orange/10 border-instituto-lilac/50 hover:border-instituto-lilac transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center gap-2">
                  <Scale className="h-6 w-6 text-instituto-lilac animate-pulse" />
                  📲 Pareamento da Mi Body Composition Scale 2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-netflix-text mb-2">
                      🔗 Conectar Balança Inteligente
                    </h3>
                    <p className="text-netflix-text-muted mb-4">
                      Use o protocolo Web Bluetooth para conectar diretamente com sua balança Xiaomi Mi e capturar dados em tempo real.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-instituto-lilac">
                      <div className="w-2 h-2 bg-instituto-lilac rounded-full animate-ping"></div>
                      <span>Pronto para pareamento</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <MiScalePairingButton 
                      onDeviceFound={(device) => {
                        console.log('Dispositivo encontrado:', device);
                      }}
                      onConnected={(device) => {
                        console.log('Dispositivo conectado:', device);
                      }}
                    />
                    <span className="text-xs text-netflix-text-muted">Clique para iniciar</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Integração Bluetooth */}
              <Card className="bg-netflix-card border-netflix-border hover:border-instituto-lilac/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Activity className="h-5 w-5 text-instituto-lilac" />
                    📥 Importar Dados da Balança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BluetoothScaleIntegration />
                </CardContent>
              </Card>

              {/* Gerenciamento de Usuários Bluetooth */}
              <Card className="bg-netflix-card border-netflix-border hover:border-instituto-lilac/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Users className="h-5 w-5 text-instituto-lilac" />
                    👤 Selecionar Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BluetoothUserManagement />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </AdminProtectedRoute>
  );
};
