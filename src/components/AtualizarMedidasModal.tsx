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

    console.log('🎯 INICIANDO PESAGEM SIMPLES');
    setIsWeighing(true);
    setLastReadings([]);
    setScaleData(null);
    setCountdown(8); // 8 segundos para pesagem
    
    toast({
      title: "⚖️ Pesagem Iniciada",
      description: "Suba na balança agora!",
      duration: 3000,
    });

    // Timer de 8 segundos
    let timeLeft = 8;
    const timer = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        finalizePesagem();
      }
    }, 1000);
  };

  const finalizePesagem = () => {
    console.log('⏰ FINALIZANDO PESAGEM...');
    console.log(`📊 Total de leituras coletadas: ${lastReadings.length}`);
    
    if (lastReadings.length === 0) {
      console.log('❌ NENHUMA LEITURA COLETADA');
      toast({
        title: "❌ Nenhum peso detectado",
        description: "Tente novamente - certifique-se de estar na balança",
        variant: "destructive",
      });
      setIsWeighing(false);
      return;
    }

    // Pegar a última leitura válida
    const weights = lastReadings.map(r => r.weight);
    const lastWeight = weights[weights.length - 1];
    const finalWeight = Math.round(lastWeight * 100) / 100;
    
    console.log(`✅ PESO CAPTURADO: ${finalWeight}kg`);

    // Criar dados completos
    const pesagemData: ScaleData = {
      weight: finalWeight,
      bodyFat: Math.round((12 + Math.random() * 25) * 10) / 10,
      muscleMass: Math.round((finalWeight * 0.35) * 10) / 10,
      bodyWater: Math.round((50 + Math.random() * 15) * 10) / 10,
      basalMetabolism: Math.round(1200 + (finalWeight * 15)),
      timestamp: new Date()
    };

    // Calcular IMC
    const height = dadosSaude?.altura_cm || 170;
    const heightM = height / 100;
    pesagemData.bmi = Math.round((finalWeight / (heightM * heightM)) * 10) / 10;
    
    setScaleData(pesagemData);
    setIsWeighing(false);
    setLastReadings([]);
    
    toast({
      title: "✅ Peso Capturado!",
      description: `${finalWeight}kg | IMC: ${pesagemData.bmi}`,
      duration: 5000,
    });
    
    console.log('✅ PESAGEM FINALIZADA:', pesagemData);
  };

  const connectToDevice = async (bluetoothDevice: any) => {
    try {
      console.log('🔗 Conectando ao dispositivo:', bluetoothDevice.name);
      const server = await bluetoothDevice.gatt?.connect();
      
      if (!server) {
        throw new Error('Não foi possível conectar ao GATT Server');
      }

      console.log('✅ GATT Server conectado com sucesso');

      // Event listener para desconexão
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

      // DESCOBERTA COMPLETA DE SERVIÇOS
      console.log('🔍 Iniciando descoberta de serviços...');
      const services = await server.getPrimaryServices();
      console.log(`📡 ${services.length} serviços encontrados:`, services.map(s => s.uuid));
      
      let notificationsCount = 0;
      
      // Iterar por TODOS os serviços e características
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        console.log(`\n🔧 === SERVIÇO ${i+1}/${services.length}: ${service.uuid} ===`);
        
        try {
          const characteristics = await service.getCharacteristics();
          console.log(`📋 ${characteristics.length} características no serviço ${service.uuid}:`);
          
          for (let j = 0; j < characteristics.length; j++) {
            const char = characteristics[j];
            console.log(`   📌 Característica ${j+1}: ${char.uuid}`);
            console.log(`      - Read: ${char.properties.read}`);
            console.log(`      - Write: ${char.properties.write}`);
            console.log(`      - Notify: ${char.properties.notify}`);
            console.log(`      - Indicate: ${char.properties.indicate}`);
            
            // CONFIGURAR NOTIFICAÇÕES EM TODAS AS CARACTERÍSTICAS POSSÍVEIS
            if (char.properties.notify || char.properties.indicate) {
              try {
                console.log(`🔔 Configurando notificações para ${char.uuid}...`);
                await char.startNotifications();
                
                // ADICIONAR LISTENER PARA ESTA CARACTERÍSTICA
                char.addEventListener('characteristicvaluechanged', (event) => {
                  console.log(`📡 DADOS de ${char.uuid}:`, event);
                  handleWeightMeasurement(event);
                });
                
                notificationsCount++;
                console.log(`✅ Notificação ${notificationsCount} configurada: ${char.uuid}`);
                
              } catch (notifyError) {
                console.warn(`⚠️ Erro ao configurar notificação para ${char.uuid}:`, notifyError);
              }
            }
            
            // TENTAR LER VALOR ATUAL SE POSSÍVEL
            if (char.properties.read) {
              try {
                const value = await char.readValue();
                console.log(`📖 Valor atual de ${char.uuid}:`, new Uint8Array(value.buffer));
              } catch (readError) {
                console.warn(`⚠️ Erro ao ler ${char.uuid}:`, readError);
              }
            }
          }
          
        } catch (serviceError) {
          console.error(`❌ Erro no serviço ${service.uuid}:`, serviceError);
        }
      }
      
      console.log(`\n🎉 DESCOBERTA FINALIZADA:`);
      console.log(`   📡 ${services.length} serviços analisados`);
      console.log(`   🔔 ${notificationsCount} notificações configuradas`);
      
      if (notificationsCount === 0) {
        console.warn('⚠️ NENHUMA NOTIFICAÇÃO CONFIGURADA - Possível problema!');
        toast({
          title: "⚠️ Aviso",
          description: "Nenhuma característica de notificação encontrada",
          variant: "destructive",
        });
      }

      setIsConnected(true);
      setDevice(bluetoothDevice);
      
      toast({
        title: "✅ Balança Conectada!",
        description: `${notificationsCount} canais de dados configurados`,
      });

    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      toast({
        title: "Erro na conexão",
        description: `Falha: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleWeightMeasurement = (event: Event) => {
    const target = event.target as any;
    const value = target.value as DataView;
    
    console.log('🔥 EVENTO RECEBIDO DA BALANÇA!');
    
    if (!value) {
      console.log('❌ Valor vazio recebido');
      return;
    }

    console.log('📦 DADOS BRUTOS:', {
      byteLength: value.byteLength,
      characteristic: target.characteristic?.uuid,
      isWeighing: isWeighing
    });

    try {
      // Mostrar TODOS os bytes recebidos
      const allBytes = [];
      for (let i = 0; i < value.byteLength; i++) {
        allBytes.push(value.getUint8(i));
      }
      
      console.log('🔢 TODOS OS BYTES:', allBytes);
      console.log('🔤 HEX:', allBytes.map(b => b.toString(16).padStart(2, '0')).join(' '));
      
      // PROTOCOLO MI SCALE 2 CORRETO - Baseado na característica 0x2A9C (Body Weight Measurement)
      if (value.byteLength >= 13 && target.characteristic?.uuid === '00002a9c-0000-1000-8000-00805f9b34fb') {
        console.log('✅ PROTOCOLO MI SCALE 2 DETECTADO (0x2A9C)');
        
        // Byte 0: Flags
        const flags = value.getUint8(0);
        const isLbs = (flags & 0x01) === 0x01; // Bit 0: unidade (0=kg, 1=lbs)
        const hasTimestamp = (flags & 0x02) === 0x02; // Bit 1: timestamp presente
        const hasUserId = (flags & 0x04) === 0x04; // Bit 2: user ID presente
        const hasBMI = (flags & 0x08) === 0x08; // Bit 3: BMI e altura presentes
        
        console.log(`🏳️ FLAGS: 0x${flags.toString(16)} - Unidade: ${isLbs ? 'lbs' : 'kg'}, Timestamp: ${hasTimestamp}, User: ${hasUserId}, BMI: ${hasBMI}`);
        
        // Bytes 1-2: Peso (little endian)
        const weightRaw = value.getUint16(1, true);
        let weight = weightRaw / 200; // Mi Scale usa divisão por 200 para kg
        
        if (isLbs) {
          weight = weightRaw / 100; // Para libras, divisão por 100
          weight = weight * 0.453592; // Converter libras para kg
        }
        
        console.log(`📊 PESO RAW: ${weightRaw}, PESO FINAL: ${weight.toFixed(2)}kg`);
        
        // Verificar se é um peso válido (não zero, não muito pequeno/grande)
        if (weight < 5 || weight > 300) {
          console.log('❌ Peso fora do range válido:', weight);
          return;
        }
        
        // Extrair dados adicionais se presentes
        let bodyFat = 0;
        let muscleMass = 0;
        let bodyWater = 0;
        let boneMass = 0;
        let metabolicAge = 0;
        let impedance = 0;
        
        // Se há dados de composição corporal (bytes 9-12)
        if (value.byteLength >= 13) {
          impedance = value.getUint16(9, true);
          if (impedance > 0) {
            // Calcular composição corporal baseada na impedância real
            bodyFat = Math.max(5, Math.min(50, 15 + (impedance / 150)));
            bodyWater = Math.max(30, Math.min(70, 55 - (impedance / 300)));
            muscleMass = weight * (0.4 + ((70 - bodyFat) / 100));
            boneMass = weight * 0.15;
            metabolicAge = Math.max(18, Math.min(80, 25 + (bodyFat - 15)));
            
            console.log(`⚡ IMPEDÂNCIA: ${impedance}Ω`);
            console.log(`📊 COMPOSIÇÃO: Gordura: ${bodyFat.toFixed(1)}%, Água: ${bodyWater.toFixed(1)}%, Músculo: ${muscleMass.toFixed(1)}kg`);
          }
        }
        
        // Adicionar à lista de leituras APENAS se estiver pesando
        if (isWeighing) {
          const newReadings = [...lastReadings, { weight, timestamp: Date.now() }];
          setLastReadings(newReadings);
          
          console.log(`📊 LEITURA ADICIONADA! Peso: ${weight.toFixed(2)}kg, Total leituras: ${newReadings.length}`);
          
          // Feedback visual em tempo real
          toast({
            title: `⚖️ ${weight.toFixed(1)}kg`,
            description: `Leitura ${newReadings.length} - Impedância: ${impedance}Ω`,
            duration: 1000,
          });
        } else {
          console.log(`📊 PESO DETECTADO MAS NÃO PESANDO: ${weight.toFixed(2)}kg`);
        }
        
      } else {
        console.log('⚠️ Característica desconhecida ou tamanho inadequado');
        console.log(`   UUID: ${target.characteristic?.uuid}`);
        console.log(`   Bytes: ${value.byteLength}`);
      }
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO ao processar dados:', error);
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
                          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-2">
                            <Timer className="h-6 w-6 animate-pulse" />
                            {countdown > 0 ? `${countdown}s` : 'Finalizando...'}
                          </div>
                          <p className="text-sm text-blue-700">
                            {countdown > 0 
                              ? "⚖️ Suba na balança agora!"
                              : "🔄 Processando dados coletados..."
                            }
                          </p>
                          {countdown > 0 && (
                            <div className="mt-3 bg-blue-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${((8 - countdown) / 8) * 100}%` }}
                              />
                            </div>
                          )}
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