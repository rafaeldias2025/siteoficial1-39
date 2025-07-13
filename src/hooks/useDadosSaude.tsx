import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DadosSaude {
  id?: string;
  user_id: string;
  peso_atual_kg: number;
  altura_cm: number;
  circunferencia_abdominal_cm: number;
  imc?: number;
  meta_peso_kg: number;
  progresso_percentual?: number;
  data_atualizacao?: string;
}

export interface MissaoUsuario {
  id: string;
  user_id: string;
  data: string;
  bebeu_agua: boolean;
  dormiu_bem: boolean;
  autocuidado: boolean;
  humor: string;
}

export const useDadosSaude = () => {
  const [dadosSaude, setDadosSaude] = useState<DadosSaude | null>(null);
  const [missoesDaSemana, setMissoesDaSemana] = useState<MissaoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDadosSaude = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        // Para visitantes, tentar carregar do localStorage
        const dadosLocalStorage = localStorage.getItem('dados_saude_temp');
        if (dadosLocalStorage) {
          setDadosSaude(JSON.parse(dadosLocalStorage));
        }
        return;
      }

      const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profile.error) throw profile.error;

      // Buscar dados de saúde mais recentes
      const { data: saude, error: saudeError } = await supabase
        .from('dados_saude_usuario')
        .select('*')
        .eq('user_id', profile.data.id)
        .order('data_atualizacao', { ascending: false })
        .limit(1)
        .single();

      if (saudeError && saudeError.code !== 'PGRST116') {
        throw saudeError;
      }

      setDadosSaude(saude || null);

      // Buscar missões dos últimos 7 dias
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      
      const { data: missoes, error: missoesError } = await supabase
        .from('missoes_usuario')
        .select('*')
        .eq('user_id', profile.data.id)
        .gte('data', seteDiasAtras.toISOString().split('T')[0])
        .order('data', { ascending: true });

      if (missoesError) throw missoesError;

      setMissoesDaSemana(missoes || []);
    } catch (error) {
      console.error('Erro ao buscar dados de saúde:', error);
      toast.error('Erro ao carregar dados de saúde');
    } finally {
      setLoading(false);
    }
  };

  const salvarDadosSaude = async (novos_dados: Omit<DadosSaude, 'id' | 'user_id' | 'imc' | 'progresso_percentual' | 'data_atualizacao'>) => {
    try {
      if (!user) {
        // Para visitantes, salvar no localStorage
        const dadosTemp = {
          ...novos_dados,
          user_id: 'temp',
          imc: novos_dados.peso_atual_kg / Math.pow(novos_dados.altura_cm / 100, 2),
          progresso_percentual: Math.max(0, (1 - (novos_dados.peso_atual_kg - novos_dados.meta_peso_kg) / (novos_dados.peso_atual_kg - novos_dados.meta_peso_kg)) * 100),
          data_atualizacao: new Date().toISOString()
        };
        localStorage.setItem('dados_saude_temp', JSON.stringify(dadosTemp));
        setDadosSaude(dadosTemp);
        toast.success('Dados salvos temporariamente. Faça login para sincronizar!');
        return;
      }

      const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profile.error) throw profile.error;

      const { error } = await supabase
        .from('dados_saude_usuario')
        .upsert([{
          user_id: profile.data.id,
          ...novos_dados
        }]);

      if (error) throw error;

      await fetchDadosSaude();
      toast.success('Dados de saúde atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados de saúde:', error);
      toast.error('Erro ao salvar dados de saúde');
    }
  };

  const migrarDadosTemporarios = async () => {
    if (!user) return;

    const dadosTemp = localStorage.getItem('dados_saude_temp');
    if (dadosTemp) {
      try {
        const dados = JSON.parse(dadosTemp);
        await salvarDadosSaude({
          peso_atual_kg: dados.peso_atual_kg,
          altura_cm: dados.altura_cm,
          circunferencia_abdominal_cm: dados.circunferencia_abdominal_cm,
          meta_peso_kg: dados.meta_peso_kg
        });
        localStorage.removeItem('dados_saude_temp');
        toast.success('Dados temporários migrados com sucesso!');
      } catch (error) {
        console.error('Erro ao migrar dados temporários:', error);
      }
    }
  };

  const calcularDiferencaCircunferencia = () => {
    if (!dadosSaude) return null;
    
    // Aqui você pode implementar lógica para comparar com medições anteriores
    // Por enquanto, retorna um valor de exemplo baseado no tempo
    const diasDesdeInicio = 15; // Isso deve vir do banco
    const reducao = 3.4; // Isso deve ser calculado com base em medições anteriores
    
    return { reducao, dias: diasDesdeInicio };
  };

  useEffect(() => {
    fetchDadosSaude();
  }, [user]);

  useEffect(() => {
    if (user) {
      migrarDadosTemporarios();
    }
  }, [user]);

  return {
    dadosSaude,
    missoesDaSemana,
    loading,
    salvarDadosSaude,
    calcularDiferencaCircunferencia,
    refetch: fetchDadosSaude
  };
};