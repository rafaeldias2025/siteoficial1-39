import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DadosFisicos {
  id?: string;
  user_id: string;
  nome_completo: string;
  data_nascimento: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  peso_atual_kg: number;
  altura_cm: number;
  circunferencia_abdominal_cm: number;
  imc?: number;
  categoria_imc?: string;
  risco_cardiometabolico?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilComportamental {
  id?: string;
  user_id: string;
  tentativa_emagrecimento?: string;
  tentativa_emagrecimento_outro?: string;
  motivo_desistencia?: string;
  motivo_desistencia_outro?: string;
  apoio_familiar?: 'Sim' | 'Não' | 'Às vezes';
  nivel_autocuidado?: number;
  nivel_estresse?: number;
  sentimento_hoje?: string;
  motivacao_principal?: string;
  gratidao_hoje?: string;
}

export interface HistoricoMedida {
  id: string;
  user_id: string;
  peso_kg: number;
  circunferencia_abdominal_cm: number;
  altura_cm: number;
  imc: number;
  data_medicao: string;
  created_at: string;
}

export const useDadosFisicos = () => {
  const [dadosFisicos, setDadosFisicos] = useState<DadosFisicos | null>(null);
  const [perfilComportamental, setPerfilComportamental] = useState<PerfilComportamental | null>(null);
  const [historicoMedidas, setHistoricoMedidas] = useState<HistoricoMedida[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDadosFisicos = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }

      const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profile.error) throw profile.error;

      // Buscar dados físicos
      const { data: fisicos, error: fisicosError } = await supabase
        .from('dados_fisicos_usuario')
        .select('*')
        .eq('user_id', profile.data.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fisicosError && fisicosError.code !== 'PGRST116') {
        throw fisicosError;
      }

      setDadosFisicos(fisicos as DadosFisicos || null);

      // Buscar perfil comportamental
      const { data: comportamental, error: comportamentalError } = await supabase
        .from('perfil_comportamental')
        .select('*')
        .eq('user_id', profile.data.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (comportamentalError && comportamentalError.code !== 'PGRST116') {
        throw comportamentalError;
      }

      setPerfilComportamental(comportamental as PerfilComportamental || null);

      // Buscar histórico de medidas
      const { data: historico, error: historicoError } = await supabase
        .from('historico_medidas')
        .select('*')
        .eq('user_id', profile.data.id)
        .order('data_medicao', { ascending: true });

      if (historicoError) throw historicoError;

      setHistoricoMedidas(historico || []);

    } catch (error) {
      console.error('Erro ao buscar dados físicos:', error);
      toast.error('Erro ao carregar dados físicos');
    } finally {
      setLoading(false);
    }
  };

  const salvarDadosFisicos = async (dados: Omit<DadosFisicos, 'id' | 'user_id' | 'imc' | 'categoria_imc' | 'risco_cardiometabolico' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profile.error) throw profile.error;

      const { error } = await supabase
        .from('dados_fisicos_usuario')
        .upsert([{
          user_id: profile.data.id,
          ...dados
        }]);

      if (error) throw error;

      await fetchDadosFisicos();
      toast.success('Dados físicos salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados físicos:', error);
      toast.error('Erro ao salvar dados físicos');
    }
  };

  const salvarPerfilComportamental = async (dados: Omit<PerfilComportamental, 'id' | 'user_id'>) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profile.error) throw profile.error;

      const { error } = await supabase
        .from('perfil_comportamental')
        .upsert([{
          user_id: profile.data.id,
          ...dados
        }]);

      if (error) throw error;

      await fetchDadosFisicos();
      toast.success('Perfil comportamental salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil comportamental:', error);
      toast.error('Erro ao salvar perfil comportamental');
    }
  };

  const calcularIMC = (peso: number, altura: number) => {
    const alturaMetros = altura / 100;
    return peso / (alturaMetros * alturaMetros);
  };

  const obterCategoriaIMC = (imc: number) => {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade grau I';
    if (imc < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  };

  const obterRiscoCardiometabolico = (sexo: string, circunferencia: number) => {
    if (sexo === 'Masculino') {
      if (circunferencia >= 102) return 'Alto';
      if (circunferencia >= 94) return 'Moderado';
      return 'Baixo';
    } else if (sexo === 'Feminino') {
      if (circunferencia >= 88) return 'Alto';
      if (circunferencia >= 80) return 'Moderado';
      return 'Baixo';
    }
    return 'Baixo';
  };

  useEffect(() => {
    if (user?.id) {
      fetchDadosFisicos();
    } else {
      setDadosFisicos(null);
      setPerfilComportamental(null);
      setHistoricoMedidas([]);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    dadosFisicos,
    perfilComportamental,
    historicoMedidas,
    loading,
    salvarDadosFisicos,
    salvarPerfilComportamental,
    calcularIMC,
    obterCategoriaIMC,
    obterRiscoCardiometabolico,
    refetch: fetchDadosFisicos
  };
};