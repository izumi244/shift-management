import { FC } from 'react'

interface ProgressBarProps {
  currentStep: number
}

const steps = [
  { id: 1, icon: '📋', label: 'データ入力' },
  { id: 2, icon: '🤖', label: 'AI生成' },
  { id: 3, icon: '✅', label: '制約チェック' },
  { id: 4, icon: '⚖️', label: '労働時間計算' },
  { id: 5, icon: '📅', label: 'シフト表示' },
]

const ProgressBar: FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="bg-white rounded-full p-6 shadow-xl">
      {/* プログレスライン */}
      <div className="relative flex justify-between items-center">
        <div className="absolute top-6 left-16 right-16 h-1 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>
        
        {/* ステップアイコン */}
        {steps.map((step) => {
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep
          const isPending = step.id > currentStep
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div 
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                  transition-all duration-300 transform
                  ${isActive ? 'bg-primary-500 text-white scale-110 shadow-lg' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isPending ? 'bg-gray-200 text-gray-500' : ''}
                `}
              >
                {step.icon}
              </div>
              <span 
                className={`
                  text-xs font-medium mt-2 text-center
                  ${isActive ? 'text-primary-600' : ''}
                  ${isCompleted ? 'text-green-600' : ''}
                  ${isPending ? 'text-gray-500' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressBar