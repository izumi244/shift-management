import { FC, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// 型定義を直接ここに定義（App.tsx と同じ）
export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'aiGeneration' | 'shiftDisplay'

interface DataInputPageProps {
  onNavigate: (page: Page) => void
  onStartGeneration: (month: string, specialRequests: string) => void
}

const DataInputPage: FC<DataInputPageProps> = ({ onNavigate, onStartGeneration }) => {
  const [targetMonth, setTargetMonth] = useState<string>('')
  const [specialRequests, setSpecialRequests] = useState<string>('')
  
  // 権限情報を取得
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('edit')

  const managementCards = [
    {
      id: 'employee' as Page,
      icon: '👥',
      title: '従業員管理',
      description: '従業員情報の確認・編集',
      gradientFrom: 'from-blue-400',
      gradientTo: 'to-blue-600',
      hoverFrom: 'hover:from-blue-500',
      hoverTo: 'hover:to-blue-700',
    },
    {
      id: 'leave' as Page,
      icon: '📅',
      title: '希望休管理',
      description: '希望休・有休の申請・確認',
      gradientFrom: 'from-green-400',
      gradientTo: 'to-green-600',
      hoverFrom: 'hover:from-green-500',
      hoverTo: 'hover:to-green-700',
    },
    {
      id: 'rules' as Page,
      icon: '⚙️',
      title: '制約条件・ルール設定',
      description: 'シフト作成のルールと制約条件を設定',
      gradientFrom: 'from-purple-400',
      gradientTo: 'to-purple-600',
      hoverFrom: 'hover:from-purple-500',
      hoverTo: 'hover:to-purple-700',
    },
  ]

  const handleCardClick = (cardId: Page) => {
    onNavigate(cardId)
  }

  const handleAIGeneration = () => {
    // 権限チェック
    if (!canEdit) {
      alert('シフト生成の権限がありません（管理者のみ実行可能）')
      return
    }

    if (!targetMonth) {
      alert('対象月を選択してください')
      return
    }
    onStartGeneration(targetMonth, specialRequests)
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        📋 シフト生成設定
      </h2>
      
      {/* 権限不足時の警告 */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <span className="font-medium">
              スタッフ権限のため、一部機能が制限されています。シフト生成は管理者のみ実行可能です。
            </span>
          </div>
        </div>
      )}
      
      {/* 管理カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {managementCards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className={`
              relative overflow-hidden rounded-2xl p-8 h-48
              bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo}
              ${card.hoverFrom} ${card.hoverTo}
              shadow-lg hover:shadow-2xl
              transition-all duration-300
            `}>
              {/* グラデーションオーバーレイ */}
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
              
              <div className="relative z-10 flex flex-col items-center text-center text-white h-full">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {card.title}
                </h3>
                <p className="text-white/90 text-sm mb-6 flex-grow">
                  {card.description}
                </p>
                <button className="
                  bg-white/20 hover:bg-white/30 
                  px-5 py-2 rounded-lg text-sm font-medium
                  backdrop-blur-sm border border-white/30
                  transition-all duration-300
                  group-hover:bg-white/30 group-hover:scale-105
                ">
                  管理画面へ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* シフト生成設定 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-dashed border-indigo-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          🚀 シフト生成設定
        </h3>
        
        <div className="space-y-6">
          {/* 対象月選択 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              対象月 *
            </label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              disabled={!canEdit}
              className={`
                w-full px-4 py-3 rounded-xl border-2 
                transition-all duration-300 text-gray-700
                bg-white shadow-sm
                ${canEdit 
                  ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                  : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <option value="">選択してください</option>
              <option value="2025-07">2025年7月</option>
              <option value="2025-08">2025年8月</option>
              <option value="2025-09">2025年9月</option>
              <option value="2025-10">2025年10月</option>
              <option value="2025-11">2025年11月</option>
              <option value="2025-12">2025年12月</option>
            </select>
          </div>

          {/* 特別な要望 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              特別な要望（任意）
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              disabled={!canEdit}
              placeholder={canEdit ? "特別な配慮が必要な事項があれば入力してください（例：新人の研修、ベテランの指導など）" : "閲覧のみの権限です"}
              rows={4}
              className={`
                w-full px-4 py-3 rounded-xl border-2 
                transition-all duration-300 text-gray-700
                shadow-sm resize-none
                ${canEdit 
                  ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white' 
                  : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                }
              `}
            />
          </div>

          {/* AIシフト生成ボタン */}
          <div className="text-center pt-4">
            <button
              onClick={handleAIGeneration}
              disabled={!canEdit}
              className={`
                inline-flex items-center px-8 py-4 text-lg font-bold
                rounded-xl shadow-lg 
                transform transition-all duration-300
                focus:ring-4 focus:ring-indigo-200
                ${canEdit 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:shadow-xl hover:scale-105 cursor-pointer'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                }
              `}
            >
              <span className="mr-2">{canEdit ? '🚀' : '🔒'}</span>
              {canEdit ? 'AIシフト生成開始' : 'シフト生成（権限不足）'}
            </button>
            
            {!canEdit && (
              <p className="text-sm text-gray-500 mt-2">
                ※ 管理者権限が必要です
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataInputPage