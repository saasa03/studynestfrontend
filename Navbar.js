import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  User, 
  LogOut, 
  Menu,
  X,
  GraduationCap 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: GraduationCap,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Focus Mode',
      href: '/focus',
      icon: Target,
      current: location.pathname === '/focus'
    },
    {
      name: 'Materie',
      href: '/subjects',
      icon: BookOpen,
      current: location.pathname === '/subjects'
    },
    {
      name: 'Voti',
      href: '/grades',
      icon: Trophy,
      current: location.pathname === '/grades'
    },
    {
      name: 'Profilo',
      href: '/profile',
      icon: User,
      current: location.pathname === '/profile'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-space-grotesk font-bold text-xl text-gray-900 hidden sm:block">
                Academia Studenti
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${item.current
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <div className="hidden sm:flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4" />
              <span className="font-semibold">{user?.credits || 0}</span>
              <span className="text-xs">crediti</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-500">Studente</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              data-testid="logout-btn"
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Esci</span>
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                variant="ghost"
                size="sm"
                data-testid="mobile-menu-btn"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden" data-testid="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg mt-2 shadow-lg border border-gray-200">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all
                      ${item.current
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Credits */}
              <div className="flex items-center justify-between px-3 py-2 mt-4 bg-yellow-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Crediti</span>
                </div>
                <span className="font-bold text-yellow-800">{user?.credits || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}