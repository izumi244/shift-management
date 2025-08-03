import { FC, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'shiftDisplay'

interface DataInputPageMobileProps {
  onNavigate: (page: Page) => void
}

const DataInputPageMobile: FC<DataInputPageMobileProps> = ({ onNavigate }) => {
  const [targetMonth, setTargetMonth] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  // 権限情報を取得
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('edit')

  const handleGenerate = () => {
    if (!targetMonth) {
      alert('対象月を選択してください')
      return
    }

    if (!canEdit) {
      alert('シフト生成の権限がありません（管理者のみ実行可能）')
      return
    }

    console.log('シフト生成開始:', {
      targetMonth,
      specialRequests
    })
    
    alert(`${targetMonth}のシフトを生成中...`)
    
    // 実際の生成処理後、結果ページに遷移
    setTimeout(() => {
      onNavigate('shiftDisplay')
    }, 1000)
  }

  const managementCards = [
    {
      id: 'employee',
      title: '従業員管理',
      icon: '👥',
      description: 'スタッフ情報管理',
      gradient: 'from-blue-500 to-indigo-600',
      action: () => onNavigate('employee')
    },
    {
      id: 'leave',
      title: '希望休管理',
      icon: '📅',
      description: '休暇申請管理',
      gradient: 'from-green-500 to-emerald-600',
      action: () => onNavigate('leave')
    },
    {
      id: 'rules',
      title: '制約設定',
      icon: '⚙️',
      description: 'ルール設定',
      gradient: 'from-purple-500 to-violet-600',
      action: () => onNavigate('rules')
    }
  ]

  return (
    <div className="space-y-6 pb-24"> {/* 下部タブバー分のmargin */}
      {/* ヘッダー - 中央揃え */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            🏥 シフト管理システム
          </h1>
          <p className="text-white/90 text-sm">
            看護師シフトの自動生成・管理
          </p>
        </div>
      </div>

      {/* 管理カード（3列横並び） */}
      <div className="grid grid-cols-3 gap-2">
        {managementCards.map((card) => (
          <div
            key={card.id}
            onClick={card.action}
            className={`
              bg-gradient-to-br ${card.gradient} 
              text-white p-4 rounded-xl shadow-lg 
              cursor-pointer transform transition-all duration-300
              hover:scale-105 hover:shadow-xl
              group
            `}
          >
            <div className="text-center">
              <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <h3 className="text-sm font-bold mb-1">
                {card.title}
              </h3>
              <p className="text-white/90 text-xs">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* シフト生成設定 */}
      <div className="bg-white rounded-xl shadow-lg p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
          🚀 シフト生成
        </h3>
        
        <div className="space-y-4">
          {/* 対象月選択 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              対象月 *
            </label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              disabled={!canEdit}
              className={`
                w-full px-3 py-3 rounded-lg border text-gray-700 text-sm
                transition-all duration-300 bg-white shadow-sm
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              特別な要望（任意）
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              disabled={!canEdit}
              placeholder={canEdit ? 
                "例：看護師Aは第1週は早番多め、パートBは平日のみ..." : 
                "制約設定を変更するには管理者権限が必要です"
              }
              rows={3}
              className={`
                w-full px-3 py-3 rounded-lg border text-gray-700 text-sm
                transition-all duration-300 resize-none
                ${canEdit 
                  ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white' 
                  : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                }
              `}
            />
          </div>

          {/* 生成ボタン */}
          <button
            onClick={handleGenerate}
            disabled={!targetMonth || !canEdit}
            className={`
              w-full py-3 rounded-lg font-bold text-sm shadow-lg transform transition-all duration-300
              ${(targetMonth && canEdit)
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 hover:shadow-xl cursor-pointer' 
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            {!canEdit ? '🔒 生成権限なし' : !targetMonth ? '📅 対象月を選択' : '🚀 シフト生成開始'}
          </button>
          
          {!canEdit && (
            <p className="text-xs text-gray-500 text-center mt-2">
              ※ シフト生成は管理者のみ実行可能です
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataInputPageMobile