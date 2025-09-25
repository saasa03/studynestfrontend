import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Trophy,
  Clock,
  Target,
  Zap,
  BookOpen,
  Heart,
  Sparkles
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FocusMode() {
  const { user, refreshProfile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [motivationalPhrase, setMotivationalPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const presetTimes = [
    { label: '15 minuti', value: 15 },
    { label: '25 minuti (Pomodoro)', value: 25 },
    { label: '30 minuti', value: 30 },
    { label: '45 minuti', value: 45 },
    { label: '60 minuti', value: 60 },
    { label: '90 minuti', value: 90 }
  ];

  useEffect(() => {
    fetchSubjects();
    generateMotivationalPhrase();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API}/subjects`);
      setSubjects(response.data);
      if (response.data.length > 0 && !selectedSubject) {
        setSelectedSubject(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le materie",
        variant: "destructive",
      });
    }
  };

  const generateMotivationalPhrase = async () => {
    try {
      const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
      const context = selectedSubjectData ? selectedSubjectData.name : "general study";
      
      const response = await axios.post(`${API}/motivational-phrase`, {
        context: context
      });
      setMotivationalPhrase(response.data.phrase);
    } catch (error) {
      console.error('Error generating motivational phrase:', error);
      const defaultPhrases = [
        "Ogni minuto di studio è un passo verso il successo!",
        "La disciplina è il ponte tra obiettivi e risultati.",
        "Stai investendo nel tuo futuro, continua così!",
        "Il sapere è l'unica ricchezza che nessuno può rubarti.",
        "Oggi sei più vicino di ieri ai tuoi obiettivi!"
      ];
      setMotivationalPhrase(defaultPhrases[Math.floor(Math.random() * defaultPhrases.length)]);
    }
  };

  const handleStart = () => {
    if (!selectedSubject) {
      toast({
        title: "Seleziona una materia",
        description: "Scegli la materia che vuoi studiare",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    generateMotivationalPhrase();
    
    toast({
      title: "Sessione iniziata! 🎯",
      description: "Concentrati e dai il massimo!",
    });
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    
    toast({
      title: isPaused ? "Sessione ripresa" : "Sessione in pausa",
      description: isPaused ? "Torna a concentrarti!" : "Prenditi una pausa se necessario",
    });
  };

  const handleStop = async () => {
    if (isRunning) {
      const studiedMinutes = Math.floor((totalTime - timeLeft) / 60);
      if (studiedMinutes > 0) {
        await saveSession(studiedMinutes);
      }
    }

    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(totalTime);
    
    toast({
      title: "Sessione terminata",
      description: "Ottimo lavoro! 💪",
    });
  };

  const handleSessionComplete = async () => {
    const studiedMinutes = Math.floor(totalTime / 60);
    await saveSession(studiedMinutes);
    
    setIsRunning(false);
    setIsPaused(false);
    
    // Generate success phrase
    const successPhrases = [
      "Fantastico! Hai completato la sessione! 🎉",
      "Eccellente! Un'altra sessione nel tuo percorso di successo! ⭐",
      "Bravissimo! Stai costruendo ottime abitudini di studio! 🚀",
      "Completato! Ogni sessione ti avvicina ai tuoi obiettivi! 🎯"
    ];
    
    toast({
      title: "Sessione Completata! 🎊",
      description: successPhrases[Math.floor(Math.random() * successPhrases.length)],
    });

    // Auto-reset for next session
    setTimeout(() => {
      setTimeLeft(totalTime);
    }, 2000);
  };

  const saveSession = async (minutes) => {
    if (!selectedSubject || minutes < 1) return;

    setLoading(true);
    try {
      await axios.post(`${API}/study-sessions`, {
        subject_id: selectedSubject,
        duration_minutes: minutes
      });

      // Calculate credits earned
      const creditsEarned = Math.floor(minutes / 30) * 5;
      
      toast({
        title: "Sessione salvata! 💾",
        description: `${minutes} minuti di studio registrati. Hai guadagnato ${creditsEarned} crediti!`,
      });

      refreshProfile();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Errore nel salvataggio",
        description: "Sessione completata ma non salvata",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(totalTime);
    
    toast({
      title: "Timer resettato",
      description: "Pronto per una nuova sessione",
    });
  };

  const setPresetTime = (minutes) => {
    if (!isRunning) {
      const seconds = minutes * 60;
      setTimeLeft(seconds);
      setTotalTime(seconds);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getCircumference = () => {
    const radius = 140; // SVG circle radius
    return 2 * Math.PI * radius;
  };

  const getStrokeDashoffset = () => {
    const circumference = getCircumference();
    return circumference - (getProgress() / 100) * circumference;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 pt-20" data-testid="focus-mode-page">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2 font-space-grotesk">
            Modalità Focus 🎯
          </h1>
          <p className="text-xl text-blue-200">
            Concentrati, studia e raggiungi i tuoi obiettivi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <Card className="glass-dark text-white border-white/20 shadow-2xl animate-bounce-in">
              <CardContent className="p-8 text-center">
                
                {/* Timer Circle */}
                <div className="relative mx-auto mb-8" style={{ width: 300, height: 300 }}>
                  <svg className="absolute inset-0 transform -rotate-90" width="300" height="300">
                    <circle
                      cx="150"
                      cy="150"
                      r="140"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="150"
                      cy="150"
                      r="140"
                      stroke={isRunning ? "#10b981" : "#3b82f6"}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={getCircumference()}
                      strokeDashoffset={getStrokeDashoffset()}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2 font-space-grotesk" data-testid="timer-display">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-lg text-blue-200">
                        {isRunning ? (isPaused ? 'In Pausa' : 'In Corso') : 'Pronto'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  {!isRunning ? (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full"
                      data-testid="start-timer-btn"
                      disabled={loading}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Inizia
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handlePause}
                        size="lg"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-full"
                        data-testid="pause-timer-btn"
                      >
                        {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                        {isPaused ? 'Riprendi' : 'Pausa'}
                      </Button>
                      
                      <Button
                        onClick={handleStop}
                        size="lg"
                        variant="outline"
                        className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white px-6 py-3 rounded-full"
                        data-testid="stop-timer-btn"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={handleReset}
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/10 px-6 py-3 rounded-full"
                    data-testid="reset-timer-btn"
                    disabled={isRunning && !isPaused}
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>

                {/* Session Info */}
                {selectedSubject && (
                  <div className="text-center">
                    <p className="text-blue-200 mb-2">Studiando:</p>
                    <p className="text-xl font-semibold">
                      {subjects.find(s => s.id === selectedSubject)?.name || 'Materia'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls & Settings */}
          <div className="space-y-6">
            
            {/* Subject Selection */}
            <Card className="glass-dark text-white border-white/20 animate-slide-up">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">Materia</h3>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={isRunning}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="subject-select">
                    <SelectValue placeholder="Seleziona materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: subject.color }}
                          />
                          <span>{subject.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {subjects.length === 0 && (
                  <p className="text-sm text-blue-200 mt-2">
                    Nessuna materia trovata. Creane una nella sezione Materie.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Time Presets */}
            <Card className="glass-dark text-white border-white/20 animate-slide-up">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold">Durata</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {presetTimes.map((preset) => (
                    <Button
                      key={preset.value}
                      onClick={() => setPresetTime(preset.value)}
                      variant={totalTime === preset.value * 60 ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${
                        totalTime === preset.value * 60 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                      disabled={isRunning}
                      data-testid={`preset-${preset.value}m`}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="glass-dark text-white border-white/20 animate-slide-up">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold">I tuoi crediti</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2" data-testid="user-credits">
                    {user?.credits || 0}
                  </div>
                  <p className="text-sm text-blue-200 mb-4">crediti totali</p>
                  
                  <div className="text-xs text-blue-200 bg-white/10 rounded-lg p-3">
                    <p className="mb-1">💡 Guadagni 5 crediti ogni 30 minuti di studio</p>
                    <p>🎯 Usa i crediti per personalizzare il tuo profilo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Phrase */}
            <Card className="glass-dark text-white border-white/20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-slide-up">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <h3 className="text-lg font-semibold">Motivazione IA</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm italic text-pink-100 mb-3" data-testid="motivational-phrase">
                    "{motivationalPhrase}"
                  </p>
                  <Button
                    onClick={generateMotivationalPhrase}
                    size="sm"
                    variant="outline"
                    className="border-pink-400/50 text-pink-300 hover:bg-pink-400/20"
                    data-testid="new-phrase-btn"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Nuova frase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}