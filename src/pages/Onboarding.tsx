import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Coins, 
  Target, 
  Settings,
  Sparkles
} from 'lucide-react'

// Stores
import { useUserStore } from '@/stores/userStore'
import { useFinanceStore } from '@/stores/financeStore'
import { useSavingsStore } from '@/stores/savingsStore'

// Components
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface OnboardingStepProps {
  title: string
  description: string
  children: React.ReactNode
  onNext: () => void
  onSkip?: () => void
  canSkip?: boolean
  isLast?: boolean
  loading?: boolean
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  description,
  children,
  onNext,
  onSkip,
  canSkip = false,
  isLast = false,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="mb-8">
          {children}
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={onNext}
            loading={loading}
            fullWidth
            size="lg"
            icon={isLast ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            {isLast ? 'Commencer' : 'Continuer'}
          </Button>

          {canSkip && onSkip && (
            <Button
              onClick={onSkip}
              variant="ghost"
              fullWidth
            >
              Passer cette étape
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <OnboardingStep
      title="Bienvenue dans SamaDepense !"
      description="Votre assistant personnel pour une gestion financière intelligente"
      onNext={onNext}
    >
      <div className="text-center space-y-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-success-500 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <Wallet className="w-10 h-10 text-white" />
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-slate-700 dark:text-slate-300">
              Suivez vos dépenses en temps réel
            </span>
          </div>

          <div className="flex items-center space-x-3 text-left">
            <div className="w-8 h-8 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-success-600 dark:text-success-400" />
            </div>
            <span className="text-slate-700 dark:text-slate-300">
              Créez des objectifs d'épargne
            </span>
          </div>

          <div className="flex items-center space-x-3 text-left">
            <div className="w-8 h-8 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-warning-600 dark:text-warning-400" />
            </div>
            <span className="text-slate-700 dark:text-slate-300">
              Obtenez des conseils personnalisés
            </span>
          </div>
        </div>
      </div>
    </OnboardingStep>
  )
}

const InitialBalanceStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [balance, setBalance] = useState('')
  const [currency] = useState('XOF')
  const { createUser } = useUserStore()
  const { setInitialBalance } = useFinanceStore()
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    const balanceAmount = parseFloat(balance) || 0
    if (balanceAmount < 0) return

    setLoading(true)
    try {
      // Créer l'utilisateur
      await createUser({
        name: 'Utilisateur',
        currency: {
          code: currency,
          symbol: 'CFA',
          name: 'Franc CFA',
          decimals: 0,
          position: 'after'
        },
        language: 'fr',
        timezone: 'Africa/Dakar',
        initialBalance: balanceAmount,
        currentBalance: balanceAmount,
        preferences: {
          theme: 'system',
          notifications: {
            enabled: true,
            budgetAlerts: true,
            goalMilestones: true,
            recurringPayments: true,
            savingsOpportunities: true,
            weeklyReports: false,
            monthlyReports: true,
            pushNotifications: true,
            emailNotifications: false,
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '08:00'
            }
          },
          privacy: {
            shareAnalytics: false,
            shareUsageData: false,
            biometricAuth: false,
            autoLock: false,
            autoLockDelay: 5,
            hideAmounts: false
          },
          display: {
            compactMode: false,
            showDecimals: true,
            dateFormat: 'DD/MM/YYYY',
            firstDayOfWeek: 'monday',
            chartAnimations: true,
            reducedMotion: false
          },
          backup: {
            autoBackup: true,
            backupFrequency: 'weekly',
            includeAttachments: false,
            cloudSync: false
          },
          gamification: {
            enabled: true,
            showBadges: true,
            showLevel: true,
            showProgress: true,
            celebrateAchievements: true,
            competitiveMode: false
          }
        }
      })

      // Définir le solde initial
      setInitialBalance(balanceAmount)
      
      onNext()
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingStep
      title="Solde initial"
      description="Quel est votre solde actuel ? Cela nous aidera à suivre vos finances."
      onNext={handleNext}
      loading={loading}
    >
      <div className="space-y-4">
        <div className="relative">
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0"
            className="input text-center text-2xl font-bold py-4"
            min="0"
            step="1000"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">
            CFA
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Vous pourrez modifier ce montant à tout moment dans les paramètres
        </p>
      </div>
    </OnboardingStep>
  )
}

const SavingsBoxesStep: React.FC<{ onNext: () => void; onSkip: () => void }> = ({ onNext, onSkip }) => {
  const [boxName, setBoxName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [selectedIcon, setSelectedIcon] = useState('piggy-bank')
  const { createSavingsBox } = useSavingsStore()
  const [loading, setLoading] = useState(false)

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ]

  const icons = [
    'piggy-bank', 'home', 'car', 'plane', 
    'graduation-cap', 'heart', 'gift', 'star'
  ]

  const handleNext = async () => {
    if (!boxName || !targetAmount) return

    setLoading(true)
    try {
      await createSavingsBox({
        name: boxName,
        description: `Objectif d'épargne pour ${boxName}`,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        color: selectedColor,
        icon: selectedIcon,
        priority: 'medium',
        isActive: true,
        milestones: []
      })
      
      onNext()
    } catch (error) {
      console.error('Erreur lors de la création de la box:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingStep
      title="Première épargne"
      description="Créez votre première box d'épargne pour commencer à économiser"
      onNext={handleNext}
      onSkip={onSkip}
      canSkip
      loading={loading}
    >
      <div className="space-y-4">
        <div>
          <label className="form-label">Nom de l'objectif</label>
          <input
            type="text"
            value={boxName}
            onChange={(e) => setBoxName(e.target.value)}
            placeholder="Ex: Vacances, Voiture, Urgence..."
            className="input"
          />
        </div>

        <div>
          <label className="form-label">Montant cible</label>
          <div className="relative">
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="100000"
              className="input pr-12"
              min="1000"
              step="1000"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              CFA
            </div>
          </div>
        </div>

        <div>
          <label className="form-label">Couleur</label>
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? 'border-slate-400' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </OnboardingStep>
  )
}

const CompletionStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { completeOnboarding } = useUserStore()
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      completeOnboarding()
      onNext()
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingStep
      title="Tout est prêt !"
      description="Félicitations ! Vous êtes maintenant prêt à gérer vos finances avec SamaDepense."
      onNext={handleComplete}
      isLast
      loading={loading}
    >
      <div className="text-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-success-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>

        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Prochaines étapes :
          </h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li>• Ajoutez vos premières transactions</li>
            <li>• Explorez le tableau de bord</li>
            <li>• Configurez vos préférences</li>
          </ul>
        </div>
      </div>
    </OnboardingStep>
  )
}

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { component: WelcomeStep, id: 'welcome' },
    { component: InitialBalanceStep, id: 'initial-balance' },
    { component: SavingsBoxesStep, id: 'savings-boxes' },
    { component: CompletionStep, id: 'completion' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Étape {currentStep + 1} sur {steps.length}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="progress-fill bg-primary-500"
            />
          </div>
        </div>

        {/* Étape actuelle */}
        <AnimatePresence mode="wait">
          <CurrentStepComponent
            key={currentStep}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Onboarding
