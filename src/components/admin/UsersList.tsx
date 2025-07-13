import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Mail, Calendar, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  nome_completo_dados: string | null;
}

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.nome_completo_dados && user.nome_completo_dados.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar dados físicos para cada perfil
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          const { data: dadosFisicos } = await supabase
            .from('dados_fisicos_usuario')
            .select('nome_completo')
            .eq('user_id', profile.id)
            .maybeSingle();

          return {
            ...profile,
            nome_completo_dados: dadosFisicos?.nome_completo || null
          };
        })
      );

      setUsers(usersWithData);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'client':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'client':
        return 'Cliente';
      default:
        return 'Usuário';
    }
  };

  if (loading) {
    return (
      <Card className="bg-netflix-card border-netflix-border">
        <CardHeader>
          <CardTitle className="text-netflix-text flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instituto-orange mx-auto mb-4"></div>
            <p className="text-netflix-text-muted">Carregando usuários...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-netflix-card border-netflix-border">
      <CardHeader>
        <CardTitle className="text-netflix-text flex items-center gap-2">
          <Users className="h-5 w-5" />
          Lista de Usuários ({users.length})
        </CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-netflix-text-muted" />
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-netflix-hover border-netflix-border text-netflix-text"
            />
          </div>
          <Button onClick={fetchUsers} variant="outline" className="border-netflix-border text-netflix-text hover:bg-netflix-hover">
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-netflix-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-netflix-text mb-2">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </h3>
            <p className="text-netflix-text-muted">
              {searchTerm ? 'Tente uma busca diferente' : 'Os usuários aparecerão aqui quando se cadastrarem'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-4 bg-netflix-hover rounded-lg border border-netflix-border hover:border-instituto-orange/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-instituto-orange/20 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-instituto-orange" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-netflix-text">
                        {user.nome_completo_dados || user.full_name || 'Nome não informado'}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={getRoleBadgeColor(user.role)}
                      >
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-netflix-text-muted">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.nome_completo_dados ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Dados Completos
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      Cadastro Incompleto
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};