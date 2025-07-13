import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  daily_points: number;
  weekly_points: number;
  monthly_points: number;
  current_streak: number;
  best_streak: number;
  completed_challenges: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RankingUser {
  id: string;
  name: string;
  points: number;
  position: number;
  streak: number;
  completedChallenges: number;
  avatar?: string;
}

export const useUserPoints = () => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [currentUserRanking, setCurrentUserRanking] = useState<RankingUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserPoints = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setUserPoints(null);
        return;
      }

      const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profile.error) throw profile.error;

      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', profile.data.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserPoints(data);
      } else {
        // Criar registro inicial se não existir
        const { data: newRecord, error: insertError } = await supabase
          .from('user_points')
          .insert([{
            user_id: profile.data.id,
            total_points: 0,
            daily_points: 0,
            weekly_points: 0,
            monthly_points: 0,
            current_streak: 0,
            best_streak: 0,
            completed_challenges: 0
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        setUserPoints(newRecord);
      }
    } catch (error) {
      console.error('Erro ao buscar pontos do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRanking = async (timeFilter: 'week' | 'month' | 'all' = 'all') => {
    try {
      let pointsField = 'total_points';
      
      switch (timeFilter) {
        case 'week':
          pointsField = 'weekly_points';
          break;
        case 'month':
          pointsField = 'monthly_points';
          break;
      }

      const { data, error } = await supabase
        .from('user_points')
        .select(`
          *,
          profiles!inner(full_name, user_id)
        `)
        .order(pointsField, { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankingData: RankingUser[] = data?.map((item: any, index) => ({
        id: item.profiles.user_id,
        name: item.profiles.full_name || 'Usuário',
        points: item[pointsField] as number,
        position: index + 1,
        streak: item.current_streak,
        completedChallenges: item.completed_challenges,
      })) || [];

      setRanking(rankingData);

      // Encontrar posição do usuário atual
      if (user) {
        const currentUser = rankingData.find(u => u.id === user.id);
        setCurrentUserRanking(currentUser || null);
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    }
  };

  const addPoints = async (points: number, activityType: string = 'general') => {
    try {
      if (!user) return;

      const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (profile.error) throw profile.error;

      await supabase.rpc('update_user_points', {
        p_user_id: profile.data.id,
        p_points: points,
        p_activity_type: activityType
      });

      // Atualizar dados locais
      await fetchUserPoints();
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUserPoints();
    fetchRanking();
  }, [user]);

  return {
    userPoints,
    ranking,
    currentUserRanking,
    loading,
    addPoints,
    fetchRanking,
    refetch: fetchUserPoints
  };
};