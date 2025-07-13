import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import butterflyLogo from '@/assets/butterfly-logo.png';
import CadastroCompletoForm from '@/components/CadastroCompletoForm';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCadastroCompleto, setShowCadastroCompleto] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setEmailError('E-mail é obrigatório');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor, digite um e-mail válido (exemplo: nome@email.com)');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (password.length > 50) {
      setPasswordError('A senha deve ter no máximo 50 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Muito fraca', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 50, label: 'Fraca', color: 'bg-orange-500' };
    if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 75, label: 'Boa', color: 'bg-yellow-500' };
    }
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
      return { strength: 100, label: 'Muito forte', color: 'bg-green-500' };
    }
    return { strength: 50, label: 'Razoável', color: 'bg-blue-500' };
  };


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(email) || !validatePassword(password)) {
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "❌ Erro no Login",
        description: error.message === 'Invalid login credentials' 
          ? "E-mail ou senha incorretos. Verifique suas credenciais."
          : "Erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } else {
      // Verificar se é admin antes de redirecionar
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single();
          
          if (profile?.role === 'admin') {
            toast({
              title: "✨ Bem-vindo Administrador!",
              description: "Redirecionando para o painel administrativo...",
            });
            navigate('/admin');
          } else {
            toast({
              title: "✨ Bem-vindo de volta!",
              description: "Login realizado com sucesso. Redirecionando...",
            });
            sessionStorage.setItem('from_auth', 'true');
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar role:', error);
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  const migrateVisitorData = () => {
    // Migrar dados salvos localmente do visitante para o perfil
    const visitorData = localStorage.getItem('visitor_data');
    if (visitorData) {
      try {
        const data = JSON.parse(visitorData);
        // Aqui você pode implementar a lógica para migrar os dados
        // Por exemplo, salvar progresso de sessões, respostas, etc.
        console.log('Dados do visitante migrados:', data);
        localStorage.removeItem('visitor_data');
      } catch (error) {
        console.error('Erro ao migrar dados do visitante:', error);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!fullName.trim()) {
      toast({
        title: "❌ Nome obrigatório",
        description: "Por favor, digite seu nome completo.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!validateEmail(email) || !validatePassword(password)) {
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        errorMessage = "📧 Este e-mail já está cadastrado! Tente fazer login ou use outro e-mail.";
      } else if (error.message.includes('Password should be')) {
        errorMessage = "🔒 A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message.includes('Invalid email')) {
        errorMessage = "📧 E-mail inválido. Verifique se digitou corretamente.";
      } else if (error.message.includes('Signup requires a valid password')) {
        errorMessage = "🔒 Senha inválida. Use pelo menos 6 caracteres.";
      } else if (error.message.includes('Unable to validate email address')) {
        errorMessage = "📧 Não foi possível validar o e-mail. Verifique se está correto.";
      }
      
      toast({
        title: "❌ Erro no Cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      // Migrar dados do visitante se existirem
      migrateVisitorData();
      
      toast({
        title: "🎉 Conta criada com sucesso!",
        description: "Agora vamos completar seu perfil para personalizar sua jornada!",
      });
      
      // Marcar que veio do auth para mostrar cadastro completo
      sessionStorage.setItem('from_auth', 'true');
      
      // Mostrar formulário de cadastro completo
      setShowCadastroCompleto(true);
    }
    setLoading(false);
  };

  const handleCadastroCompletoFinish = () => {
    setShowCadastroCompleto(false);
    navigate('/dashboard');
  };

  // Se deve mostrar o formulário de cadastro completo
  if (showCadastroCompleto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-instituto-light via-white to-instituto-cream">
        <CadastroCompletoForm onComplete={handleCadastroCompletoFinish} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-instituto-light via-white to-instituto-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={butterflyLogo} alt="Instituto dos Sonhos" className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-instituto-dark">Instituto dos Sonhos</h1>
            <p className="text-instituto-dark/70 mt-2">Sua jornada de transformação começa aqui</p>
          </div>
        </div>


        {/* Formulários de Login/Cadastro */}
        <Card className="shadow-warm">
          <CardHeader className="text-center">
            <CardTitle className="text-instituto-dark">Entre em sua conta</CardTitle>
            <CardDescription>
              Ou crie uma conta gratuita para desbloquear todo o conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Seu e-mail"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        className="pl-10"
                        required
                      />
                    </div>
                    {emailError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {emailError}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                        }}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {passwordError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {passwordError}
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-instituto-orange hover:bg-instituto-orange-hover"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Seu melhor e-mail"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        className="pl-10"
                        required
                      />
                    </div>
                    {emailError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {emailError}
                      </div>
                    )}
                    {email && !emailError && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        E-mail válido
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Crie uma senha (mín. 6 caracteres)"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                        }}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {passwordError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {passwordError}
                      </div>
                    )}
                    {password && !passwordError && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Senha válida
                        </div>
                        {/* Indicador de força da senha */}
                        {(() => {
                          const strength = getPasswordStrength(password);
                          return strength.strength > 0 ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-instituto-dark/70">Força da senha:</span>
                                <span className={`font-medium ${
                                  strength.strength >= 75 ? 'text-green-600' : 
                                  strength.strength >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {strength.label}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                                  style={{ width: `${strength.strength}%` }}
                                />
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-instituto-orange hover:bg-instituto-orange-hover"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? "Criando conta..." : "Criar Conta Gratuita"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-instituto-dark/70">
          Ao continuar, você concorda com nossos Termos de Uso
        </div>
      </div>
    </div>
  );
};

export default Auth;