import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { 
  User, 
  Trophy, 
  Clock, 
  BookOpen,
  Star,
  Award,
  Edit,
  Save,
  X,
  Target,
  Calendar,
  TrendingUp,
  Zap
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || ''
      });
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleSaveProfile = async () => {
    // Note: Profile update endpoint would need to be implemented in backend
    toast({
      title: "Funzione in sviluppo",
      description: "La modifica del profilo sarà disponibile presto",
    });
    setIsEditing(false);
  };

  const getStudyLevel = (totalMinutes) => {
    const hours = totalMinutes / 60;
    if (hours < 10) return { level: "Principiante", color: "text-gray-600", bg: "bg-gray-100" };
    if (hours < 50) return { level: "Studente", color: "text-blue-600", bg: "bg-blue-100" };
    if (hours < 100) return { level: "Dedicato", color: "text-green-600", bg: "bg-green-100" };
    if (hours < 200) return { level: "Esperto", color: "text-purple-600", bg: "bg-purple-100" };
    return { level: "Maestro", color: "text-yellow-600", bg: "bg-yellow-100" };
  };

  const getNextLevelProgress = (totalMinutes) => {
    const hours = totalMinutes / 60;
    if (hours < 10) return { progress: (hours / 10) * 100, next: "Studente", hoursNeeded: 10 - hours };
    if (hours < 50) return { progress: ((hours - 10) / 40) * 100, next: "Dedicato", hoursNeeded: 50 - hours };
    if (hours < 100) return { progress: ((hours - 50) / 50) * 100, next: "Esperto", hoursNeeded: 100 - hours };
    if (hours < 200) return { progress: ((hours - 100) / 100) * 100, next: "Maestro", hoursNeeded: 200 - hours };
    return { progress: 100, next: "Max Level", hoursNeeded: 0 };
  };

  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const studyLevel = getStudyLevel(user?.total_study_minutes || 0);
  const nextLevel = getNextLevelProgress(user?.total_study_minutes || 0);

  const achievements = [
    {
      id: 1,
      name: "Primo Passo",
      description: "Completa la prima sessione di studio",
      icon: "🎯",
      achieved: (user?.total_study_minutes || 0) > 0,
      requirement: "1 sessione"
    },
    {
      id: 2,
      name: "Studente Costante",
      description: "Accumula 10 ore di studio",
      icon: "📚",
      achieved: (user?.total_study_minutes || 0) >= 600,
      requirement: "10 ore"
    },
    {
      id: 3,
      name: "Ricco di Crediti",
      description: "Guadagna 100 crediti",
      icon: "💰",
      achieved: (user?.credits || 0) >= 100,
      requirement: "100 crediti"
    },
    {
      id: 4,
      name: "Maratona di Studio",
      description: "Studia per 50 ore totali",
      icon: "🏃‍♂️",
      achieved: (user?.total_study_minutes || 0) >= 3000,
      requirement: "50 ore"
    },
    {
      id: 5,
      name: "Maestro del Focus",
      description: "Completa 100 sessioni di studio",
      icon: "🧘‍♂️",
      achieved: false, // This would need session count from backend
      requirement: "100 sessioni"
    },
    {
      id: 6,
      name: "Accademico d'Elite",
      description: "Accumula 100 ore di studio",
      icon: "🎓",
      achieved: (user?.total_study_minutes || 0) >= 6000,
      requirement: "100 ore"
    }
  ];

  const achievedCount = achievements.filter(a => a.achieved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4 pt-20" data-testid="profile-page">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 font-space-grotesk">
            Il Tuo Profilo 👤
          </h1>
          <p className="text-xl text-gray-600">
            Monitora i tuoi progressi e raggiungi nuovi traguardi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Card */}
            <Card className="card animate-slide-up">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">Informazioni Profilo</h2>
                  <Button
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    data-testid="edit-profile-btn"
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salva
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifica
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1 space-y-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="full-name">Nome Completo</Label>
                          <Input
                            id="full-name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            placeholder="Il tuo nome e cognome"
                            data-testid="full-name-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="La tua email"
                            data-testid="email-input"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSaveProfile}
                            size="sm"
                            className="btn-primary"
                            disabled={loading}
                            data-testid="save-profile-btn"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Salva
                          </Button>
                          <Button
                            onClick={() => setIsEditing(false)}
                            size="sm"
                            variant="outline"
                            data-testid="cancel-edit-btn"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Annulla
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Nome</p>
                          <p className="font-semibold text-gray-900" data-testid="display-name">
                            {user?.full_name || 'Non specificato'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="font-semibold text-gray-900" data-testid="display-username">
                            {user?.username}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900" data-testid="display-email">
                            {user?.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Membro dal</p>
                          <p className="font-semibold text-gray-900">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Level & Progress */}
            <Card className="card bg-gradient-to-br from-blue-500 to-purple-600 text-white animate-slide-up">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Livello di Studio</h3>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${studyLevel.bg} ${studyLevel.color} font-semibold`}>
                      <Star className="w-4 h-4 mr-2" />
                      {studyLevel.level}
                    </div>
                  </div>
                  
                  {nextLevel.next !== "Max Level" && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Progresso verso {nextLevel.next}</span>
                        <span>{nextLevel.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={nextLevel.progress} className="h-2 bg-white/20" />
                      <p className="text-sm text-blue-100">
                        Ancora {nextLevel.hoursNeeded.toFixed(1)} ore per il prossimo livello
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div className="text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{Math.floor((user?.total_study_minutes || 0) / 60)}</p>
                      <p className="text-xs text-blue-100">Ore Totali</p>
                    </div>
                    <div className="text-center">
                      <Trophy className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-2xl font-bold" data-testid="profile-credits">{user?.credits || 0}</p>
                      <p className="text-xs text-blue-100">Crediti</p>
                    </div>
                    <div className="text-center">
                      <BookOpen className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{dashboardData?.total_subjects || 0}</p>
                      <p className="text-xs text-blue-100">Materie</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Stats */}
            <Card className="card animate-slide-up">
              <CardHeader>
                <h2 className="text-xl font-semibold">Statistiche Recenti</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600" data-testid="today-sessions">
                      {dashboardData?.today_sessions || 0}
                    </p>
                    <p className="text-xs text-gray-600">Sessioni Oggi</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {Math.floor((dashboardData?.today_minutes || 0) / 60)}h
                    </p>
                    <p className="text-xs text-gray-600">Studio Oggi</p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {dashboardData?.today_credits || 0}
                    </p>
                    <p className="text-xs text-gray-600">Crediti Oggi</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardData?.average_grade ? dashboardData.average_grade.toFixed(1) : '--'}
                    </p>
                    <p className="text-xs text-gray-600">Media Voti</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Sidebar */}
          <div className="space-y-6">
            
            {/* Achievements Overview */}
            <Card className="card animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Obiettivi</h3>
                  <span className="text-sm text-gray-500">
                    {achievedCount}/{achievements.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" data-testid="achievements-list">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        achievement.achieved 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="text-2xl flex-shrink-0">
                        {achievement.achieved ? achievement.icon : '🔒'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-medium text-sm ${
                          achievement.achieved ? 'text-green-900' : 'text-gray-600'
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className={`text-xs ${
                          achievement.achieved ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {achievement.requirement}
                        </p>
                      </div>
                      {achievement.achieved && (
                        <Award className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progresso Obiettivi</span>
                    <span className="text-sm font-medium">
                      {((achievedCount / achievements.length) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={(achievedCount / achievements.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card animate-slide-up">
              <CardHeader>
                <h3 className="text-lg font-semibold">Azioni Rapide</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-primary" data-testid="quick-focus-btn">
                  <Target className="w-4 h-4 mr-2" />
                  Inizia Focus Mode
                </Button>
                
                <Button variant="outline" className="w-full" data-testid="quick-subjects-btn">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Gestisci Materie
                </Button>
                
                <Button variant="outline" className="w-full" data-testid="quick-grades-btn">
                  <Award className="w-4 h-4 mr-2" />
                  Aggiungi Voto
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}