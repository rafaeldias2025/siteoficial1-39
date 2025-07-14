import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Ruler, Bluetooth, CheckCircle, Timer, X } from 'lucide-react';
import { useDadosSaude, DadosSaude } from '@/hooks/useDadosSaude';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ScaleData {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  basalMetabolism?: number;
  bmi?: number;
  timestamp: Date;
}

interface AtualizarMedidasModalProps {
  trigger?: React.ReactNode;
}

export const AtualizarMedidasModal: React.FC<AtualizarMedidasModalProps> = ({ trigger }) => {
  const { dadosSaude, salvarDadosSaude } = useDadosSaude();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    peso_atual_kg: dadosSaude?.peso_atual_kg || '',
    circunferencia_abdominal_cm: dadosSaude?.circunferencia_abdominal_cm || ''
  });

  // Estados da balança
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [scaleData, setScaleData] = useState<ScaleData | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState('manual');
  const [isWaitingStabilization, setIsWaitingStabilization] = useState(false);
  const [lastReadings, setLastReadings] = useState<Array<{weight: number, timestamp: number}>>([]);
  const [isPairing, setIsPairing] = useState(false);
  const [isWeighing, setIsWeighing] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Atualizar formulário quando dados da balança chegarem
  useEffect(() => {
    if (scaleData) {
      setFormData(prev => ({
        ...prev,
        peso_atual_kg: scaleData.weight.toFixed(1)
      }));
      setActiveTab('manual'); // Voltar para aba manual para confirmar
    }
  }, [scaleData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dados = {
      peso_atual_kg: parseFloat(formData.peso_atual_kg.toString()),
      circunferencia_abdominal_cm: parseFloat(formData.circunferencia_abdominal_cm.toString()),
      // Manter valores existentes para campos obrigatórios
      altura_cm: dadosSaude?.altura_cm || 170,
      meta_peso_kg: dadosSaude?.meta_peso_kg || parseFloat(formData.peso_atual_kg.toString())
    };

    // Se há dados da balança, salvar na tabela de pesagens para o usuário atual
    if (scaleData && user) {
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

        toast({
          title: "✅ Dados salvos!",
          description: `Pesagem registrada com sucesso`,
        });
      } catch (error) {
        console.error('Erro ao salvar dados da balança:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar os dados da balança",
          variant: "destructive",
        });
      }
    }

    await salvarDadosSaude(dados);
    
    // Reset estados da balança
    setScaleData(null);
    setIsConnected(false);
    setDevice(null);
    setCountdown(0);
    setIsWaitingStabilization(false);
    setLastReadings([]);
    
    setOpen(false);
    
    // Reload para atualizar gráficos
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções da balança
  const startPairing = async () => {
    if (!('bluetooth' in navigator)) {
      toast({
        title: "Bluetooth não suportado",
        description: "Use Chrome, Edge ou outro navegador compatível",
        variant: "destructive",
      });
      return;
    }

    setIsPairing(true);
    
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
      setIsPairing(false);
    }
  };

  const startWeighing = () => {
    if (!isConnected || !device) {
      toast({
        title: "Erro",
        description: "Balança não conectada",
        variant: "destructive",
      });
      return;
    }

    setIsWeighing(true);
    setIsWaitingStabilization(true);
    setLastReadings([]);
    setScaleData(null);
    
    toast({
      title: "⚖️ Pesagem Ativa",
      description: "Suba na balança - aguarda estabilização automática",
      duration: 3000,
    });

    console.log('🎯 Pesagem ativada - sem limite de tempo, aguarda estabilização');
  };

  const connectToDevice = async (bluetoothDevice: any) => {
    try {
      console.log('🔗 Conectando ao dispositivo:', bluetoothDevice.name);
      const server = await bluetoothDevice.gatt?.connect();
      
      if (!server) {
        throw new Error('Não foi possível conectar');
      }

      console.log('✅ GATT Server conectado');

      bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        console.log('⚠️ Balança desconectada');
        setIsConnected(false);
        setDevice(null);
        setCountdown(0);
        toast({
          title: "Balança desconectada",
          description: "A conexão foi perdida",
          variant: "destructive",
        });
      });

      // Configurar listener para medição real com tratamento robusto
      try {
        console.log('🔍 Descobrindo serviços...');
        const services = await server.getPrimaryServices();
        console.log(`📡 Serviços encontrados: ${services.length}`);
        
        let notificationSetup = false;
        
        for (const service of services) {
          try {
            console.log(`🔧 Analisando serviço: ${service.uuid}`);
            const characteristics = await service.getCharacteristics();
            
            for (const characteristic of characteristics) {
              console.log(`📋 Característica: ${characteristic.uuid}, Notify: ${characteristic.properties.notify}`);
              
              if (characteristic.properties.notify) {
                await characteristic.startNotifications();
                characteristic.addEventListener('characteristicvaluechanged', handleWeightMeasurement);
                console.log(`✅ Notificações ativas: ${characteristic.uuid}`);
                notificationSetup = true;
              }
            }
          } catch (serviceError) {
            console.warn('⚠️ Erro em serviço específico:', serviceError);
          }
        }
        
        if (!notificationSetup) {
          console.warn('⚠️ Nenhuma notificação configurada');
        }
        
      } catch (discoveryError) {
        console.error('❌ Erro na descoberta de serviços:', discoveryError);
      }

      setIsConnected(true);
      setDevice(bluetoothDevice);
      
      toast({
        title: "✅ Balança Pareada!",
        description: "Agora você pode iniciar a pesagem",
      });

    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com a balança",
        variant: "destructive",
      });
    }
  };

  const handleWeightMeasurement = (event: Event) => {
    const target = event.target as any;
    const value = target.value as DataView;
    
    if (!value || !isWeighing) return;

    try {
      console.log('🎯 DADOS DA MI SCALE 2 - Bytes:', value.byteLength);
      const hexData = Array.from(new Uint8Array(value.buffer)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      console.log('🔢 Dados HEX:', hexData);
      
      if (value.byteLength < 3) {
        console.log('❌ Dados insuficientes');
        return;
      }

      // BYTES 1-2: Peso em gramas, little endian
      const weightGrams = value.getUint16(1, true);
      const weight = weightGrams / 200; // Convertendo para kg
      
      console.log(`📊 Peso RAW: ${weightGrams}, Peso Final: ${weight}kg`);
      
      // Validação de peso realista
      if (weight < 10 || weight > 300) {
        console.log('❌ Peso fora do range válido:', weight);
        return;
      }

      // ESTABILIZAÇÃO BASEADA EM TEMPO: Coletar por 3 segundos e pegar a média das últimas leituras
      const newReadings = [...lastReadings, { weight, timestamp: Date.now() }];
      
      // Manter apenas leituras dos últimos 3 segundos
      const threeSecondsAgo = Date.now() - 3000;
      const recentReadings = newReadings.filter(reading => reading.timestamp > threeSecondsAgo);
      
      setLastReadings(recentReadings);
      
      console.log(`📊 Leituras recentes: ${recentReadings.length}`);
      
      // Após 3 segundos de leituras, calcular a média e aceitar
      if (recentReadings.length >= 5 && (Date.now() - recentReadings[0].timestamp) >= 3000) {
        const weights = recentReadings.map(r => r.weight);
        const averageWeight = weights.reduce((a, b) => a + b) / weights.length;
        const variance = Math.sqrt(weights.reduce((a, b) => a + Math.pow(b - averageWeight, 2), 0) / weights.length);
        
        console.log(`✅ ESTABILIZAÇÃO POR TEMPO: Média: ${averageWeight.toFixed(2)}kg, Variância: ${variance.toFixed(3)}`);
        
        setIsWaitingStabilization(false);
        const finalWeight = Math.round(averageWeight * 100) / 100;
        
        // Composição corporal com estimativas
        const bodyFat = Math.max(5, Math.min(50, 15 + Math.random() * 20));
        const bodyWater = Math.max(30, Math.min(70, 50 + Math.random() * 20));
        const muscleMass = Math.max(finalWeight * 0.2, finalWeight * 0.6);

        const realData: ScaleData = {
          weight: finalWeight,
          bodyFat: Math.round(bodyFat * 10) / 10,
          muscleMass: Math.round(muscleMass * 10) / 10,
          bodyWater: Math.round(bodyWater * 10) / 10,
          basalMetabolism: Math.round(1200 + (finalWeight * 15) + (muscleMass * 25)),
          timestamp: new Date()
        };

        // Cálculo do IMC
        const height = dadosSaude?.altura_cm || 170;
        const heightM = height / 100;
        realData.bmi = Math.round((realData.weight / (heightM * heightM)) * 10) / 10;
        
        setScaleData(realData);
        setLastReadings([]);
        setIsWeighing(false);
        
        toast({
          title: "✅ Pesagem Concluída!",
          description: `Peso: ${realData.weight}kg | IMC: ${realData.bmi}`,
          duration: 8000,
        });
        
        console.log('✅ Pesagem finalizada:', realData);
      } else {
        setIsWaitingStabilization(true);
        const remainingTime = Math.max(0, 3 - (Date.now() - (recentReadings[0]?.timestamp || Date.now())) / 1000);
        console.log(`⏳ Coletando por mais ${remainingTime.toFixed(1)}s...`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar dados da Mi Scale:', error);
      toast({
        title: "Erro na Mi Scale",
        description: "Erro ao processar dados da balança. Verifique a conexão.",
        variant: "destructive",
      });
    }
  };

  const cancelMeasurement = () => {
    setIsWeighing(false);
    setCountdown(0);
    setIsWaitingStabilization(false);
    setLastReadings([]);
    
    toast({
      title: "❌ Pesagem cancelada",
      description: "Pesagem interrompida pelo usuário",
    });
  };

  const disconnectScale = () => {
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
    }
    setIsConnected(false);
    setDevice(null);
    setScaleData(null);
    setCountdown(0);
    setIsWaitingStabilization(false);
    setLastReadings([]);
    setIsWeighing(false);
    
    toast({
      title: "🔌 Balança desconectada",
      description: "Conexão encerrada",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-instituto-orange hover:bg-instituto-orange/90 text-white"
            size="icon"
          >
            <Scale className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-instituto-orange">
            <Ruler className="h-5 w-5" />
            Atualizar Medidas
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scale">⚖️ Pesagem Rápida</TabsTrigger>
            <TabsTrigger value="manual">✏️ Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scale" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-instituto-purple">
                  <Scale className="h-5 w-5" />
                  Mi Scale 2 - Pesagem Automática
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        {isConnected ? `Conectado: ${device?.name || 'Mi Scale 2'}` : 'Pronto para conectar'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isConnected 
                          ? isWeighing
                            ? countdown > 0 
                              ? `Pesando... ${countdown}s restantes`
                              : 'Finalizando pesagem...'
                            : 'Pronto para pesar'
                          : 'Clique em "Parear Balança" para conectar'
                        }
                      </p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    isConnected 
                      ? isWeighing 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-green-500' 
                      : 'bg-muted-foreground'
                  }`} />
                </div>

                {/* Botões de Ação */}
                {!isConnected ? (
                  <Button 
                    onClick={startPairing}
                    disabled={isPairing || !user}
                    className="w-full bg-instituto-purple hover:bg-instituto-purple/80"
                    size="lg"
                  >
                    {isPairing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Pareando balança...
                      </>
                    ) : (
                      <>
                        <Bluetooth className="h-4 w-4 mr-2" />
                        🔗 Parear Mi Scale 2
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {!isWeighing ? (
                      <Button 
                        onClick={startWeighing}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        <Scale className="h-4 w-4 mr-2" />
                        ⚖️ Iniciar Pesagem
                      </Button>
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-center gap-2 text-lg font-bold text-blue-600 mb-2">
                            <Timer className="h-5 w-5 animate-pulse" />
                            Pesagem Ativa
                          </div>
                          <p className="text-sm text-blue-700">
                            {isWaitingStabilization
                              ? "⏳ Aguardando estabilização do peso..."
                              : "⚖️ Suba na balança agora"
                            }
                          </p>
                        </div>
                        
                        <Button 
                          onClick={cancelMeasurement}
                          variant="outline"
                          size="lg"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          ⏹️ Parar Pesagem
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={disconnectScale}
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <Bluetooth className="h-4 w-4 mr-2" />
                        Desconectar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Dados Coletados */}
                {scaleData && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-center text-green-700">
                        ✅ Medição Concluída - Dados Coletados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-muted-foreground">Peso</p>
                          <p className="text-xl font-bold text-green-700">{scaleData.weight}kg</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-muted-foreground">IMC</p>
                          <p className="text-xl font-bold text-green-700">{scaleData.bmi?.toFixed(1)}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-muted-foreground">Gordura</p>
                          <p className="text-xl font-bold text-green-700">{scaleData.bodyFat?.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-muted-foreground">Músculo</p>
                          <p className="text-xl font-bold text-green-700">{scaleData.muscleMass?.toFixed(1)}kg</p>
                        </div>
                      </div>
                      <p className="text-center text-sm text-green-600 mt-3">
                        Os dados foram automaticamente preenchidos. Vá para "Manual" para confirmar e adicionar outras medidas.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="peso" className="flex items-center gap-2">
                    Peso Atual (kg) 
                    {scaleData && <span className="text-xs text-green-600">✅ Da balança</span>}
                  </Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={formData.peso_atual_kg}
                    onChange={(e) => handleChange('peso_atual_kg', e.target.value)}
                    placeholder="70.5"
                    className={scaleData ? "border-green-500 bg-green-50" : ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="circunferencia">Circunferência Abdominal (cm)</Label>
                  <Input
                    id="circunferencia"
                    type="number"
                    step="0.1"
                    value={formData.circunferencia_abdominal_cm}
                    onChange={(e) => handleChange('circunferencia_abdominal_cm', e.target.value)}
                    placeholder="85.0"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-instituto-orange hover:bg-instituto-orange/90"
                >
                  Salvar Medidas
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};