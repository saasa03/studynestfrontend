import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Trophy, 
  Plus, 
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Star,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Grades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: '',
    grade: '',
    max_grade: 30,
    exam_name: '',
    exam_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchGrades();
    fetchSubjects();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/grades`);
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i voti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject_id || !formData.grade || !formData.exam_name) {
      toast({
        title: "Campi mancanti",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.grade) > parseFloat(formData.max_grade)) {
      toast({
        title: "Voto non valido",
        description: "Il voto non può superare il voto massimo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/grades`, {
        ...formData,
        grade: parseFloat(formData.grade),
        max_grade: parseFloat(formData.max_grade),
        exam_date: new Date(formData.exam_date).toISOString()
      });
      
      toast({
        title: "Voto aggiunto! 🎉",
        description: `${formData.exam_name}: ${formData.grade}/${formData.max_grade}`,
      });
      
      fetchGrades();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: "Errore",
        description: error.response?.data?.detail || "Errore nel salvare il voto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject_id: '',
      grade: '',
      max_grade: 30,
      exam_name: '',
      exam_date: new Date().toISOString().split('T')[0]
    });
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + grade.grade, 0);
    return (total / grades.length).toFixed(2);
  };

  const getGradeColor = (grade, maxGrade = 30) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeStatus = (grade, maxGrade = 30) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'Eccellente';
    if (percentage >= 80) return 'Ottimo';
    if (percentage >= 70) return 'Buono';
    return 'Sufficiente';
  };

  const getSubjectStats = () => {
    const subjectMap = new Map();
    
    grades.forEach(grade => {
      const subject = subjects.find(s => s.id === grade.subject_id);
      const subjectName = subject ? subject.name : 'Sconosciuta';
      
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          name: subjectName,
          color: subject?.color || '#6B7280',
          grades: [],
          average: 0
        });
      }
      
      subjectMap.get(subjectName).grades.push(grade.grade);
    });

    // Calculate averages
    subjectMap.forEach((data, subject) => {
      const total = data.grades.reduce((sum, grade) => sum + grade, 0);
      data.average = data.grades.length > 0 ? (total / data.grades.length).toFixed(2) : 0;
    });

    return Array.from(subjectMap.values()).sort((a, b) => b.average - a.average);
  };

  const subjectStats = getSubjectStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4 pt-20" data-testid="grades-page">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 font-space-grotesk">
            I Tuoi Voti 🏆
          </h1>
          <p className="text-xl text-gray-600">
            Tieni traccia dei tuoi progressi accademici
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Overall Average */}
          <Card className="card hover:scale-105 transition-transform animate-slide-up">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Media Generale</p>
              <p className={`text-3xl font-bold ${grades.length > 0 ? getGradeColor(calculateAverage()).split(' ')[0] : 'text-gray-400'}`} data-testid="overall-average">
                {grades.length > 0 ? calculateAverage() : '--'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {grades.length > 0 ? getGradeStatus(calculateAverage()) : 'Nessun voto'}
              </p>
            </CardContent>
          </Card>

          {/* Total Exams */}
          <Card className="card hover:scale-105 transition-transform animate-slide-up">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Esami Sostenuti</p>
              <p className="text-3xl font-bold text-gray-900" data-testid="total-exams">
                {grades.length}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {grades.length === 1 ? 'esame registrato' : 'esami registrati'}
              </p>
            </CardContent>
          </Card>

          {/* Best Grade */}
          <Card className="card hover:scale-105 transition-transform animate-slide-up">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Miglior Voto</p>
              <p className="text-3xl font-bold text-green-600" data-testid="best-grade">
                {grades.length > 0 ? Math.max(...grades.map(g => g.grade)) : '--'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {grades.length > 0 ? 'Complimenti!' : 'Aggiungi un voto'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Grades List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Grade Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Registro Voti</h2>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="btn-primary"
                    data-testid="add-grade-btn"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Voto
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-md" data-testid="grade-dialog">
                  <DialogHeader>
                    <DialogTitle>Nuovo Voto</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Materia *</Label>
                      <Select value={formData.subject_id} onValueChange={(value) => setFormData({...formData, subject_id: value})}>
                        <SelectTrigger data-testid="grade-subject-select">
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exam-name">Nome Esame *</Label>
                      <Input
                        id="exam-name"
                        placeholder="es. Esame Finale, Test di Metà Corso..."
                        value={formData.exam_name}
                        onChange={(e) => setFormData({...formData, exam_name: e.target.value})}
                        data-testid="exam-name-input"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grade">Voto *</Label>
                        <Input
                          id="grade"
                          type="number"
                          step="0.1"
                          min="0"
                          max={formData.max_grade}
                          placeholder="es. 28"
                          value={formData.grade}
                          onChange={(e) => setFormData({...formData, grade: e.target.value})}
                          data-testid="grade-input"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="max-grade">Voto Max</Label>
                        <Input
                          id="max-grade"
                          type="number"
                          min="1"
                          placeholder="30"
                          value={formData.max_grade}
                          onChange={(e) => setFormData({...formData, max_grade: e.target.value})}
                          data-testid="max-grade-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exam-date">Data Esame</Label>
                      <Input
                        id="exam-date"
                        type="date"
                        value={formData.exam_date}
                        onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                        data-testid="exam-date-input"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                        data-testid="cancel-grade-btn"
                      >
                        Annulla
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 btn-primary"
                        disabled={loading}
                        data-testid="save-grade-btn"
                      >
                        {loading ? "Salvando..." : "Salva Voto"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Grades List */}
            {loading && grades.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : grades.length > 0 ? (
              <div className="space-y-4" data-testid="grades-list">
                {grades.sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date)).map((grade, index) => {
                  const subject = subjects.find(s => s.id === grade.subject_id);
                  return (
                    <Card key={grade.id} className="card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div 
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: subject?.color || '#6B7280' }}
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {grade.exam_name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{subject?.name || 'Materia Sconosciuta'}</span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(grade.exam_date).toLocaleDateString('it-IT')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(grade.grade, grade.max_grade)}`}>
                              {grade.grade}/{grade.max_grade}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {getGradeStatus(grade.grade, grade.max_grade)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16" data-testid="no-grades-message">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nessun voto registrato
                </h3>
                <p className="text-gray-500 mb-6">
                  Inizia aggiungendo il tuo primo voto
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="btn-primary"
                  data-testid="add-first-grade-btn"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Aggiungi Primo Voto
                </Button>
              </div>
            )}
          </div>

          {/* Subject Stats */}
          <div className="space-y-6">
            
            {/* Subject Performance */}
            <Card className="card animate-slide-up">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Performance per Materia</h3>
                </div>
              </CardHeader>
              <CardContent>
                {subjectStats.length > 0 ? (
                  <div className="space-y-4" data-testid="subject-stats">
                    {subjectStats.map((stat, index) => (
                      <div key={stat.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: stat.color }}
                            />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {stat.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {stat.average}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              backgroundColor: stat.color,
                              width: `${(stat.average / 30) * 100}%`
                            }}
                          />
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          {stat.grades.length} {stat.grades.length === 1 ? 'voto' : 'voti'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nessuna statistica disponibile</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Tips */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white animate-slide-up">
              <CardContent className="p-6">
                <div className="text-center">
                  <Target className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">💡 Suggerimento</h3>
                  <p className="text-sm opacity-90">
                    {grades.length === 0 
                      ? "Inizia a registrare i tuoi voti per monitorare i progressi!"
                      : grades.length < 5
                      ? "Continua ad aggiungere voti per avere statistiche più accurate"
                      : calculateAverage() >= 27
                      ? "Ottimo lavoro! Mantieni questo livello di eccellenza"
                      : "Ogni voto è un'opportunità per migliorare. Continua così!"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}