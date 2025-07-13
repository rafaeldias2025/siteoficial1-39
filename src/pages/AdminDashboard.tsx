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
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="bg-netflix-card border border-netflix-border">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-instituto-orange data-[state=active]:text-white text-netflix-text"
            >
              <Shield className="h-4 w-4 mr-2" />
              Gerenciar Usuários
            </TabsTrigger>
            <TabsTrigger 
              value="data" 
              className="data-[state=active]:bg-instituto-orange data-[state=active]:text-white text-netflix-text"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar Dados
            </TabsTrigger>
            <TabsTrigger 
              value="sessions" 
              className="data-[state=active]:bg-instituto-orange data-[state=active]:text-white text-netflix-text"
            >
              <Video className="h-4 w-4 mr-2" />
              Sessões
            </TabsTrigger>
            <TabsTrigger 
              value="weighing" 
              className="data-[state=active]:bg-instituto-orange data-[state=active]:text-white text-netflix-text"
            >
              <Scale className="h-4 w-4 mr-2" />
              Pesagens
            </TabsTrigger>
            <TabsTrigger 
              value="bluetooth" 
              className="data-[state=active]:bg-instituto-orange data-[state=active]:text-white text-netflix-text"
            >
              <Activity className="h-4 w-4 mr-2" />
              Bluetooth
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-instituto-orange data-[state=active]:text-white text-netflix-text"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataVisualization />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* BLOCO 1: Cadastro e Visualização do Cliente */}
              <Card className="bg-netflix-card border-netflix-border">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Users className="h-5 w-5 text-instituto-orange" />
                    Cadastro de Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClientRegistrationForm />
                </CardContent>
              </Card>

              {/* BLOCO 2: Gestão de Sessões */}
              <Card className="bg-netflix-card border-netflix-border">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Video className="h-5 w-5 text-instituto-purple" />
                    Gestão de Sessões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SessionManagement />
                </CardContent>
              </Card>
            </div>

            {/* BLOCO 3: Histórico de Sessões */}
            <Card className="bg-netflix-card border-netflix-border">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-instituto-green" />
                  Histórico de Sessões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SessionHistory />
              </CardContent>
            </Card>

            {/* BLOCO 4: Relatórios e Gráficos */}
            <Card className="bg-netflix-card border-netflix-border">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-instituto-lilac" />
                  Relatórios e Gráficos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientReports />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weighing" className="space-y-6">
            <CompleteTrendTrackWeightSystem />
          </TabsContent>

          <TabsContent value="bluetooth" className="space-y-6">
            {/* Botão de Destaque para Parear Balança */}
            <Card className="bg-gradient-to-r from-instituto-orange/10 to-instituto-purple/10 border-instituto-orange/50">
              <CardHeader>
                <CardTitle className="text-netflix-text flex items-center gap-2">
                  <Scale className="h-6 w-6 text-instituto-orange" />
                  Pareamento da Mi Body Composition Scale 2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-netflix-text mb-2">
                      Conectar Balança Inteligente
                    </h3>
                    <p className="text-netflix-text-muted">
                      Use o protocolo Web Bluetooth para conectar diretamente com sua balança Xiaomi Mi e capturar dados em tempo real.
                    </p>
                  </div>
                  <MiScalePairingButton 
                    onDeviceFound={(device) => {
                      console.log('Dispositivo encontrado:', device);
                    }}
                    onConnected={(device) => {
                      console.log('Dispositivo conectado:', device);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* BLOCO 1: Integração Bluetooth */}
              <div className="space-y-6">
                <BluetoothScaleIntegration />
              </div>

              {/* BLOCO 2: Gerenciamento de Usuários */}
              <div className="space-y-6">
                <BluetoothUserManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-netflix-card border-netflix-border">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 p-3 bg-netflix-hover rounded-lg animate-slide-in-left"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="p-2 bg-instituto-orange/10 rounded-lg">
                        <activity.icon className="h-4 w-4 text-instituto-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-netflix-text">
                          {activity.client}
                        </p>
                        <p className="text-xs text-netflix-text-muted">
                          {activity.session}
                        </p>
                      </div>
                      <span className="text-xs text-netflix-text-muted">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Analytics Preview */}
              <Card className="bg-netflix-card border-netflix-border">
                <CardHeader>
                  <CardTitle className="text-netflix-text flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Relatórios Detalhados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-netflix-text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-netflix-text mb-2">
                      Analytics Avançados
                    </h3>
                    <p className="text-netflix-text-muted mb-6">
                      Em breve: gráficos detalhados, métricas de engajamento e relatórios personalizados
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminProtectedRoute>
  );
};
