
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/netflix/ThemeToggle";
import { MinhaJornada } from "@/components/MinhaJornada";

import { useAuth } from "@/hooks/useAuth";
import { useDadosFisicos } from "@/hooks/useDadosFisicos";
import { supabase } from "@/integrations/supabase/client";
import CadastroCompletoForm from "@/components/CadastroCompletoForm";

const Dashboard = () => {
  const { user } = useAuth();
  const { dadosFisicos, loading } = useDadosFisicos();
  const [showCadastroCompleto, setShowCadastroCompleto] = useState(false);
  const [hasCheckedCadastro, setHasCheckedCadastro] = useState(false);

  useEffect(() => {
    // Só verificar uma vez se precisa do cadastro completo
    if (user && !loading && !hasCheckedCadastro) {
      setHasCheckedCadastro(true);
      
      // Verificar se é admin primeiro - admins não precisam de cadastro completo
      const checkIfAdmin = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          // Se for admin, não mostrar cadastro completo
          if (profile?.role === 'admin') {
            return;
          }
          
          // Verificar se veio da página de auth e não tem dados físicos
          const fromAuth = sessionStorage.getItem('from_auth');
          if (fromAuth && !dadosFisicos) {
            sessionStorage.removeItem('from_auth');
            setShowCadastroCompleto(true);
          }
        } catch (error) {
          console.error('Erro ao verificar se é admin:', error);
        }
      };
      
      checkIfAdmin();
    }
  }, [user, dadosFisicos, loading, hasCheckedCadastro]);

  const handleCadastroCompletoFinish = () => {
    setShowCadastroCompleto(false);
  };

  // Se deve mostrar o formulário de cadastro completo
  if (showCadastroCompleto && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-instituto-light via-white to-instituto-cream">
        <CadastroCompletoForm onComplete={handleCadastroCompletoFinish} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-dark">
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-instituto-orange hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao início
          </Link>
          <ThemeToggle />
        </div>
        <MinhaJornada />
      </div>
    </div>
  );
};

export default Dashboard;
