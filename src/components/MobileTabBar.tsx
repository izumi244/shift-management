import { FC } from 'react'

export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'shiftDisplay'

interface MobileTabBarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const MobileTabBar: FC<MobileTabBarProps> = ({ currentPage, onNavigate }) => {
  const tabItems = [
    {
      id: 'dataInput' as Page,
      icon: '📊',
      label: 'ホーム',
      description: 'ダッシュボード'
    },
    {
      id: 'employee' as Page,
      icon: '👥',
      label: '従業員',
      description: 'スタッフ管理'
    },
    {
      id: 'leave' as Page,
      icon: '📅',
      label: '希望休',
      description: '休暇申請'
    },
    {
      id: 'rules' as Page,
      icon: '⚙️',
      label: '設定',
      description: '制約設定'
    },
    {
      id: 'shiftDisplay' as Page,
      icon: '📋',
      label: 'シフト',
      description: 'カレンダー'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-20">
      <div className="grid grid-cols-5 h-full">
        {tabItems.map((item) => {
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {/* アイコン */}
              <div className={`text-xl mb-1 transition-transform duration-200 ${
                isActive ? 'scale-110' : 'scale-100'
              }`}>
                {item.icon}
              </div>
              
              {/* ラベル */}
              <div className={`text-xs font-medium ${
                isActive ? 'font-semibold' : 'font-normal'
              }`}>
                {item.label}
              </div>
              
              {/* アクティブインジケーター */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MobileTabBar