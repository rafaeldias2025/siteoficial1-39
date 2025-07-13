import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface MissaoDia {
  id?: string;
  user_id: string;
  data: string;
  inspira?: string;
  humor?: string;
  prioridades?: string[];
  mensagem_dia?: string;
  momento_feliz?: string;
  tarefa_bem_feita?: string;
  habito_saudavel?: string;
  gratidao?: string;
  concluido?: boolean;
  // Novos campos
  liquido_ao_acordar?: string;
  pratica_conexao?: string;
  energia_ao_acordar?: number;
  sono_horas?: number;
  agua_litros?: string;
  atividade_fisica?: boolean;
  estresse_nivel?: number;
  fome_emocional?: boolean;
  pequena_vitoria?: string;
  intencao_para_amanha?: string;
  nota_dia?: number;
}

export const useMissaoDia = (isVisitor = false) => {
  const [missao, setMissao] = useState<MissaoDia | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  // Buscar perfil do usuário
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(data);
    };

    fetchProfile();
  }, [user?.id]);

  const fetchMissaoDodia = async () => {
    // Para visitantes, usar localStorage
    if (isVisitor || !user) {
      try {
        const localMissao = localStorage.getItem(`missao_dia_${today}`);
        if (localMissao) {
          setMissao(JSON.parse(localMissao));
        } else {
          // Criar nova missão local para visitante
          const novaMissao: MissaoDia = {
            user_id: 'visitor',
            data: today,
            prioridades: [],
            concluido: false
          };
          setMissao(novaMissao);
        }
      } catch (error) {
        console.error('Erro ao carregar missão local:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('missao_dia')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('data', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMissao({
          ...data,
          prioridades: Array.isArray(data.prioridades) ? 
            data.prioridades.map(p => String(p)) : []
        });
      } else {
        // Criar nova missão para hoje
        const novaMissao: MissaoDia = {
          user_id: userProfile.id,
          data: today,
          prioridades: [],
          concluido: false
        };
        setMissao(novaMissao);
      }
    } catch (error) {
      console.error('Erro ao buscar missão do dia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar sua missão do dia.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMissao = async (updates: Partial<MissaoDia>) => {
    if (!missao) return;

    const updatedMissao = { ...missao, ...updates };
    setMissao(updatedMissao);

    // Para visitantes, salvar no localStorage
    if (isVisitor || !user) {
      try {
        localStorage.setItem(`missao_dia_${today}`, JSON.stringify(updatedMissao));
      } catch (error) {
        console.error('Erro ao salvar missão local:', error);
      }
      return;
    }

    if (!userProfile?.id) return;

    try {
      if (missao.id) {
        // Atualizar existente
        const { error } = await supabase
          .from('missao_dia')
          .update(updates)
          .eq('id', missao.id);

        if (error) throw error;
      } else {
        // Criar nova
        const { data, error } = await supabase
          .from('missao_dia')
          .insert([{
            user_id: userProfile.id,
            data: today,
            ...updates
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setMissao({
            ...updatedMissao,
            id: data.id
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar missão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas informações.",
        variant: "destructive",
      });
    }
  };

  const concluirMissao = async () => {
    await updateMissao({ concluido: true });
    
    toast({
      title: "🎉 Missão cumprida!",
      description: "Cada passo de autocuidado te aproxima da sua melhor versão. ❤️",
    });
  };

  const getProgresso = () => {
    if (!missao) return 0;
    
    const campos = [
      missao.liquido_ao_acordar,
      missao.pratica_conexao,
      missao.energia_ao_acordar,
      missao.sono_horas,
      missao.agua_litros,
      missao.atividade_fisica,
      missao.estresse_nivel,
      missao.fome_emocional,
      missao.gratidao,
      missao.pequena_vitoria,
      missao.intencao_para_amanha,
      missao.nota_dia
    ];
    
    const preenchidos = campos.filter(campo => 
      campo !== undefined && campo !== null && campo !== ""
    ).length;
    
    return Math.round((preenchidos / campos.length) * 100);
  };

  useEffect(() => {
    if (isVisitor || !user) {
      // Para visitantes, carregar imediatamente
      fetchMissaoDodia();
    } else if (userProfile?.id) {
      fetchMissaoDodia();
    }
  }, [userProfile?.id, isVisitor, user]);

  return {
    missao,
    loading,
    updateMissao,
    concluirMissao,
    progresso: getProgresso(),
    isAfter6PM: new Date().getHours() >= 18
  };
};