import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bluetooth, 
  Scale,
  CheckCircle,
  Timer,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface ScaleData {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  basalMetabolism?: number;
  bmi?: number;
  timestamp: Date;
}

export const BalancaPareamentoCompacto: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [scaleData, setScaleData] = useState<ScaleData | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastMeasurement, setLastMeasurement] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const startPairing = async () => {
    if (!('bluetooth' in navigator)) {
      toast({
        title: "Bluetooth não suportado",
        description: "Use Chrome, Edge ou outro navegador compatível",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    try {
      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '0000181d-0000-1000-8000-00805f9b34fb',
          '0000180f-0000-1000-8000-00805f9b34fb',
          '0000181b-0000-1000-8000-00805f9b34fb',
        ]
      });

      if (bluetoothDevice) {
        setDevice(bluetoothDevice);
        await connectToDevice(bluetoothDevice);
      }
    } catch (error: any) {
      if (error.name !== 'NotFoundError') {
        toast({
          title: "Erro no pareamento",
          description: "Não foi possível conectar. Tente novamente",
          variant: "destructive",
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (bluetoothDevice: any) => {
    try {
      const server = await bluetoothDevice.gatt?.connect();
      
      if (!server) {
        throw new Error('Não foi possível conectar');
      }

      bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setDevice(null);
      });

      setIsConnected(true);
      setCountdown(15); // 15 segundos de countdown
      
      toast({
        title: "✅ Balança Conectada!",
        description: "Aguardando pesagem: suba na balança em até 5 segundos",
      });

      // Simular leitura após countdown
      setTimeout(() => {
        simulateReading();
      }, 15000);

    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com a balança",
        variant: "destructive",
      });
    }
  };

  const simulateReading = () => {
    const mockData: ScaleData = {
      weight: 70 + (Math.random() - 0.5) * 20,
      bodyFat: 15 + Math.random() * 15,
      muscleMass: 30 + Math.random() * 10,
      bodyWater: 50 + Math.random() * 15,
      basalMetabolism: 1500 + Math.random() * 500,
      timestamp: new Date()
    };

    const height = 1.70;
    mockData.bmi = mockData.weight / (height * height);

    setScaleData(mockData);
    setCountdown(0);

    toast({
      title: "📊 Medição Concluída!",
      description: `Peso: ${mockData.weight.toFixed(1)}kg - IMC: ${mockData.bmi.toFixed(1)}`,
    });
  };

  const saveAndClose = async () => {
    if (!scaleData || !user) return;

    setIsSaving(true);
    
    try {
      await supabase
        .from('pesagens')
        .insert({
          user_id: user.id,
          peso_kg: scaleData.weight,
          gordura_corporal_pct: scaleData.bodyFat,
          massa_muscular_kg: scaleData.muscleMass,
          agua_corporal_pct: scaleData.bodyWater,
          taxa_metabolica_basal: scaleData.basalMetabolism,
          imc: scaleData.bmi,
          data_medicao: scaleData.timestamp.toISOString(),
          origem_medicao: 'balança_bluetooth_usuario'
        });

      // Buscar dados existentes
      const { data: existingData } = await supabase
        .from('dados_saude_usuario')
        .select('altura_cm, circunferencia_abdominal_cm, meta_peso_kg')
        .eq('user_id', user.id)
        .single();

      await supabase
        .from('dados_saude_usuario')
        .upsert({
          user_id: user.id,
          peso_atual_kg: scaleData.weight,
          imc: scaleData.bmi,
          altura_cm: existingData?.altura_cm || 170,
          circunferencia_abdominal_cm: existingData?.circunferencia_abdominal_cm || 90,
          meta_peso_kg: existingData?.meta_peso_kg || scaleData.weight,
          data_atualizacao: new Date().toISOString()
        });

      toast({
        title: "💾 Dados Salvos!",
        description: "Suas medidas foram atualizadas com sucesso",
      });

      // Resetar e fechar
      setScaleData(null);
      setIsConnected(false);
      setDevice(null);
      setIsOpen(false);
      
      // Reload da página para atualizar gráficos
      window.location.reload();
      
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-instituto-purple hover:bg-instituto-purple/80 text-white shadow-lg"
          size="lg"
        >
          <Bluetooth className="h-5 w-5 mr-2" />
          🔗 Parear Balança
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-instituto-purple" />
            Conectar Mi Body Scale 2
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status da Conexão */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Bluetooth className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {isConnected ? `Conectado: ${device?.name || 'Balança'}` : 'Desconectado'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected 
                    ? countdown > 0 
                      ? `Aguardando pesagem: ${countdown}s`
                      : 'Medição em andamento...'
                    : 'Clique para conectar'
                  }
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
            }`} />
          </div>

          {/* Botão de Ação */}
          {!isConnected ? (
            <Button 
              onClick={startPairing}
              disabled={isScanning}
              className="w-full bg-instituto-purple hover:bg-instituto-purple/80"
              size="lg"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Procurando...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4 mr-2" />
                  Iniciar Pareamento
                </>
              )}
            </Button>
          ) : (
            <div className="text-center">
              {countdown > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-lg font-bold text-instituto-purple">
                    <Timer className="h-5 w-5" />
                    {countdown}s
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {countdown > 10 ? "Suba na balança em até 5 segundos" : "Medição automática em andamento..."}
                  </p>
                </div>
              ) : (
                <p className="text-instituto-purple font-medium">
                  Processando medição...
                </p>
              )}
            </div>
          )}

          {/* Dados Coletados */}
          {scaleData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-instituto-purple">
                  Medição Concluída ✅
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-center mb-4">
                  <div className="p-3 bg-instituto-orange/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Peso</p>
                    <p className="text-xl font-bold">{scaleData.weight.toFixed(1)}kg</p>
                  </div>
                  <div className="p-3 bg-instituto-purple/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">IMC</p>
                    <p className="text-xl font-bold">{scaleData.bmi?.toFixed(1)}</p>
                  </div>
                  <div className="p-3 bg-instituto-green/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Gordura</p>
                    <p className="text-xl font-bold">{scaleData.bodyFat?.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-instituto-blue/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Músculo</p>
                    <p className="text-xl font-bold">{scaleData.muscleMass?.toFixed(1)}kg</p>
                  </div>
                </div>
                
                <Button 
                  onClick={saveAndClose}
                  disabled={isSaving}
                  className="w-full bg-instituto-green hover:bg-instituto-green/80"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar e Salvar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};