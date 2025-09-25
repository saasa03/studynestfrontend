import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit,
  Target,
  Clock,
  Palette
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    target_hours_per_week: 3
  });

  const subjectColors = [
    { name: 'Blu', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Rosso', value: '#EF4444' },
    { name: 'Giallo', value: '#F59E0B' },
    { name: 'Viola', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Indaco', value: '#6366F1' },
    { name: 'Arancione', value: '#F97316' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Lime', value: '#84CC16' },
    { name: 'Ciano', value: '#06B6D4' },
    { name: 'Ambra', value: '#D97706' }
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le materie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome richiesto",
        description: "Inserisci il nome della materia",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingSubject) {
        // Update logic would go here (not implemented in backend yet)
        toast({
          title: "Funzione in sviluppo",
          description: "La modifica delle materie sarà disponibile presto",
          variant: "destructive",
        });
      } else {
        await axios.post(`${API}/subjects`, formData);
        toast({
          title: "Materia creata! 📚",
          description: `${formData.name} è stata aggiunta alle tue materie`,
        });
      }
      
      fetchSubjects();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving subject:', error);
      toast({
        title: "Errore",
        description: error.response?.data?.detail || "Errore nel salvare la materia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId, subjectName) => {
    if (!window.confirm(`Sei sicuro di voler eliminare la materia "${subjectName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API}/subjects/${subjectId}`);
      toast({
        title: "Materia eliminata",
        description: `${subjectName} è stata rimossa`,
      });
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la materia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
      target_hours_per_week: 3
    });
    setEditingSubject(null);
  };

  const openEditDialog = (subject) => {
    setFormData({
      name: subject.name,
      color: subject.color,
      target_hours_per_week: subject.target_hours_per_week
    });
    setEditingSubject(subject);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4 pt-20" data-testid="subjects-page">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 font-space-grotesk">
            Le Tue Materie 📚
          </h1>
          <p className="text-xl text-gray-600">
            Organizza e gestisci tutte le materie del tuo percorso di studio
          </p>
        </div>

        {/* Add Subject Button */}
        <div className="text-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openCreateDialog}
                className="btn-primary px-8 py-3"
                data-testid="add-subject-btn"
              >
                <Plus className="w-5 h-5 mr-2" />
                Aggiungi Nuova Materia
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md" data-testid="subject-dialog">
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? 'Modifica Materia' : 'Nuova Materia'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Materia *</Label>
                  <Input
                    id="name"
                    placeholder="es. Matematica, Storia, Inglese..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    data-testid="subject-name-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Colore</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {subjectColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({...formData, color: color.value})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color.value 
                            ? 'border-gray-400 ring-2 ring-blue-300' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        data-testid={`color-${color.value}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-hours">Ore target a settimana</Label>
                  <Input
                    id="target-hours"
                    type="number"
                    min="1"
                    max="40"
                    value={formData.target_hours_per_week}
                    onChange={(e) => setFormData({...formData, target_hours_per_week: parseInt(e.target.value)})}
                    data-testid="target-hours-input"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                    data-testid="cancel-subject-btn"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={loading}
                    data-testid="save-subject-btn"
                  >
                    {loading ? "Salvando..." : editingSubject ? "Aggiorna" : "Crea Materia"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        {loading && subjects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="subjects-grid">
            {subjects.map((subject, index) => (
              <Card 
                key={subject.id} 
                className="card hover:scale-105 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <h3 className="font-semibold text-lg truncate" title={subject.name}>
                        {subject.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(subject)}
                        className="p-1 h-8 w-8"
                        data-testid={`edit-subject-${subject.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(subject.id, subject.name)}
                        className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                        data-testid={`delete-subject-${subject.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Target Hours */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>Obiettivo: {subject.target_hours_per_week}h/settimana</span>
                    </div>
                    
                    {/* Created Date */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        Creata il {new Date(subject.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>

                    {/* Progress Bar Placeholder */}
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Progresso settimanale</span>
                        <span className="text-xs font-medium text-gray-700">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            backgroundColor: subject.color,
                            width: '0%' 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        0h / {subject.target_hours_per_week}h questa settimana
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-testid="no-subjects-message">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nessuna materia ancora
            </h3>
            <p className="text-gray-500 mb-6">
              Inizia creando la tua prima materia di studio
            </p>
            <Button 
              onClick={openCreateDialog}
              className="btn-primary"
              data-testid="create-first-subject-btn"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crea la Prima Materia
            </Button>
          </div>
        )}

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Palette className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  💡 Suggerimenti per organizzare le materie
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Usa colori diversi per distinguere facilmente le materie</li>
                  <li>• Imposta obiettivi realistici di ore settimanali</li>
                  <li>• Organizza le materie per priorità o difficoltà</li>
                  <li>• Rivedi regolarmente i tuoi progressi</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}