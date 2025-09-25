import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp,
  Target,
  Calendar,
  Award,
  Timer,
  Zap,
  BarChart3
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    refreshProfile();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati della dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getWeeklyProgress = () => {
    if (!dashboardData) return 0;
    const targetWeeklyMinutes = 1260; // 3h per day * 7 days = 21h = 1260 minutes
    return Math.min((dashboardData.weekly_minutes / targetWeeklyMinutes) * 100, 100);
  };

  const getGradeColor = (grade) => {
    if (grade >= 27) return 'text-green-600 bg-green-100';
    if (grade >= 24) return 'text-blue-600 bg-blue-100';
    if (grade >= 21) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4 pt-20" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 font-space-grotesk">
            Benvenuto, {user?.full_name || user?.username}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ecco il riepilogo dei tuoi progressi di oggi
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Today's Sessions */}
          <Card className="card hover:scale-105 transition-transform animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessioni Oggi</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="today-sessions">
                    {dashboardData?.today_sessions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Timer className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Study Time */}
          <Card className="card hover:scale-105 transition-transform animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Studio Oggi</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="today-minutes">
                    {formatMinutesToHours(dashboardData?.today_minutes || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Credits */}
          <Card className="card hover:scale-105 transition-transform animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Crediti Oggi</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="today-credits">
                    {dashboardData?.today_credits || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Grade */}
          <Card className="card hover:scale-105 transition-transform animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Media Voti</p>
                  <p className={`text-3xl font-bold ${dashboardData?.average_grade ? getGradeColor(dashboardData.average_grade).split(' ')[0] : 'text-gray-400'}`} data-testid="average-grade">
                    {dashboardData?.average_grade ? dashboardData.average_grade.toFixed(1) : '--'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Weekly Progress */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Weekly Study Progress */}
            <Card className="card animate-slide-up">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Progresso Settimanale</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Studio questa settimana: {formatMinutesToHours(dashboardData?.weekly_minutes || 0)}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {getWeeklyProgress().toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={getWeeklyProgress()} className="h-3" />
                  <p className="text-xs text-gray-500">
                    Obiettivo: 21 ore a settimana (3 ore al giorno)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="card animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Sessioni Recenti</h3>
                  </div>
                  <Link to="/focus">
                    <Button size="sm" className="btn-primary">
                      <Zap className="w-4 h-4 mr-2" />
                      Inizia Studio
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {dashboardData?.recent_sessions?.length > 0 ? (
                  <div className="space-y-3" data-testid="recent-sessions">
                    {dashboardData.recent_sessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{session.subject_name}</p>
                            <p className="text-sm text-gray-500">{session.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatMinutesToHours(session.duration_minutes)}</p>
                          <p className="text-xs text-yellow-600">+{session.credits_earned} crediti</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nessuna sessione di studio ancora</p>
                    <Link to="/focus">
                      <Button className="btn-primary">
                        Inizia la prima sessione
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Summary */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="card animate-slide-up">
              <CardHeader>
                <h3 className="text-lg font-semibold">Azioni Rapide</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/focus" className="block">
                  <Button className="w-full btn-primary" data-testid="start-focus-btn">
                    <Target className="w-4 h-4 mr-2" />
                    Modalità Focus
                  </Button>
                </Link>
                
                <Link to="/subjects" className="block">
                  <Button variant="outline" className="w-full" data-testid="manage-subjects-btn">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Gestisci Materie
                  </Button>
                </Link>
                
                <Link to="/grades" className="block">
                  <Button variant="outline" className="w-full" data-testid="add-grade-btn">
                    <Award className="w-4 h-4 mr-2" />
                    Aggiungi Voto
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Study Summary */}
            <Card className="card animate-slide-up">
              <CardHeader>
                <h3 className="text-lg font-semibold">Riepilogo Studio</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Materie Attive</span>
                  <span className="font-semibold" data-testid="total-subjects">
                    {dashboardData?.total_subjects || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Studio Totale</span>
                  <span className="font-semibold">
                    {formatMinutesToHours(user?.total_study_minutes || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Crediti Totali</span>
                  <span className="font-semibold text-yellow-600">
                    {user?.credits || 0}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.floor((user?.total_study_minutes || 0) / 60)}h
                    </p>
                    <p className="text-xs text-gray-500">ore totali di studio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Quote */}
            <Card className="card bg-gradient-to-br from-blue-500 to-purple-600 text-white animate-slide-up">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">💪 Motivazione del giorno</h3>
                <p className="text-sm italic">
                  "Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno."
                </p>
                <p className="text-xs mt-2 opacity-80">- Robert Collier</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}