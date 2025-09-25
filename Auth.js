import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from '../hooks/use-toast';
import { Eye, EyeOff, Mail, User, Lock, GraduationCap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Auth() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        username: formData.username,
        password: formData.password
      });

      const { access_token, user } = response.data;
      login(user, access_token);

      toast({
        title: "Benvenuto!",
        description: `Ciao ${user.full_name || user.username}! 🎓`,
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Errore di accesso",
        description: error.response?.data?.detail || "Credenziali non valide",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "Campi mancanti",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password troppo corta",
        description: "La password deve essere di almeno 6 caratteri",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || null
      });

      const { access_token, user } = response.data;
      login(user, access_token);

      toast({
        title: "Registrazione completata!",
        description: `Benvenuto in Academia Studenti, ${user.full_name || user.username}! 🎉`,
      });

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Errore di registrazione",
        description: error.response?.data?.detail || "Errore durante la registrazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full glass border-white/20 shadow-2xl" data-testid="auth-card">
      <CardHeader className="text-center space-y-4">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white font-space-grotesk">
            Inizia il tuo percorso
          </h2>
          <p className="text-blue-100 mt-2">
            Organizza i tuoi studi e raggiungi i tuoi obiettivi accademici
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10">
            <TabsTrigger 
              value="login" 
              className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600"
              data-testid="login-tab"
            >
              Accedi
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600"
              data-testid="register-tab"
            >
              Registrati
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" data-testid="login-form">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Il tuo username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                    data-testid="login-username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="La tua password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                    data-testid="login-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? "Accedendo..." : "Accedi"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" data-testid="register-form">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username" className="text-white">
                  Username *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="reg-username"
                    name="username"
                    type="text"
                    placeholder="Scegli un username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                    data-testid="register-username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-white">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="La tua email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                    data-testid="register-email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-full-name" className="text-white">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="reg-full-name"
                    name="full_name"
                    type="text"
                    placeholder="Il tuo nome e cognome"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                    data-testid="register-full-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-white">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="reg-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una password sicura"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-white/90 border-white/20 text-gray-900 placeholder-gray-500"
                    data-testid="register-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-blue-100">
                  Minimo 6 caratteri
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? "Registrandoti..." : "Crea Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Features Preview */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-center text-blue-100 text-sm mb-4">
            Cosa puoi fare con Academia Studenti:
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs text-blue-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Timer Focus Mode</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Sistema Crediti</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Gestione Voti</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span>Frasi Motivazionali IA</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}