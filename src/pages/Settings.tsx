import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Upload,
  Trash2,
  HelpCircle
} from 'lucide-react'

// Components
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Paramètres
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Personnalisez votre expérience SamaDepense
        </p>
      </motion.div>

      {/* Profil */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <User className="w-6 h-6 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Profil
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Nom</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Utilisateur</p>
            </div>
            <Button variant="ghost" size="sm">Modifier</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Devise</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Franc CFA (XOF)</p>
            </div>
            <Button variant="ghost" size="sm">Modifier</Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Bell className="w-6 h-6 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Notifications
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Alertes de budget</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Recevoir des alertes quand vous dépassez votre budget</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Objectifs atteints</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Célébrer quand vous atteignez vos objectifs d'épargne</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Apparence */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Palette className="w-6 h-6 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Apparence
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Thème</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choisissez votre thème préféré</p>
            </div>
            <select className="input w-32">
              <option value="system">Système</option>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Mode compact</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Affichage plus dense pour plus d'informations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Sécurité et confidentialité */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Shield className="w-6 h-6 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Sécurité et confidentialité
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Masquer les montants</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Masquer les montants dans l'aperçu de l'application</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Verrouillage automatique</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Verrouiller l'app après une période d'inactivité</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Données */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <Download className="w-6 h-6 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Données
          </h3>
        </div>
        
        <div className="space-y-3">
          <Button
            variant="ghost"
            fullWidth
            className="justify-start"
            icon={<Download className="w-4 h-4" />}
          >
            Exporter mes données
          </Button>
          
          <Button
            variant="ghost"
            fullWidth
            className="justify-start"
            icon={<Upload className="w-4 h-4" />}
          >
            Importer des données
          </Button>
          
          <Button
            variant="ghost"
            fullWidth
            className="justify-start text-danger-600 dark:text-danger-400"
            icon={<Trash2 className="w-4 h-4" />}
          >
            Supprimer toutes les données
          </Button>
        </div>
      </Card>

      {/* Aide */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <HelpCircle className="w-6 h-6 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Aide et support
          </h3>
        </div>
        
        <div className="space-y-3">
          <Button
            variant="ghost"
            fullWidth
            className="justify-start"
          >
            Guide d'utilisation
          </Button>
          
          <Button
            variant="ghost"
            fullWidth
            className="justify-start"
          >
            Nous contacter
          </Button>
          
          <Button
            variant="ghost"
            fullWidth
            className="justify-start"
          >
            À propos de SamaDepense
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Settings

