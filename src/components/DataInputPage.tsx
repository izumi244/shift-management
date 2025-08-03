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
      alert('シフト生成権限がありません（管理者のみ実行可能）')
      return
    }

    if (!targetMonth) {
      alert('対象月を選択してください')
      return
    }

    onStartGeneration(targetMonth, specialRequests)
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🏥 シフト作成ツール
        </h1>
        <p className="text-lg text-gray-600">
          AIを活用して看護師のシフトを効率的に作成
        </p>
      </div>

      {/* 管理機能カード */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📋 管理機能
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {managementCards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                group relative overflow-hidden
                p-8 rounded-2xl
                bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo}
                ${card.hoverFrom} ${card.hoverTo}
                text-white shadow-xl hover:shadow-2xl
                transform hover:scale-105 transition-all duration-300
                hover:rotate-1
              `}
            >
              {/* 背景装飾 */}
              <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-6 group-hover:skew-y-6 transition-transform duration-300"></div>
              
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {card.title}
                </h3>
                <p className="text-sm opacity-90">
                  {card.description}
                </p>
              </div>

              {/* ホバー効果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
            </button>
          ))}
        </div>
      </div>

      {/* シフト生成セクション */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            🤖 AIシフト生成
          </h2>
          <p className="text-lg text-gray-600">
            条件を設定してAIにシフトを生成させましょう
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* 対象月選択 */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              📅 対象月を選択
            </label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="
                w-full px-6 py-4 text-lg
                border-2 border-gray-300 rounded-xl
                focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200
                transition-all duration-300 bg-white
                hover:border-indigo-400
              "
            >
              <option value="">月を選択してください</option>
              <option value="2025-08">2025年8月</option>
              <option value="2025-09">2025年9月</option>
              <option value="2025-10">2025年10月</option>
              <option value="2025-11">2025年11月</option>
              <option value="2025-12">2025年12月</option>
            </select>
          </div>

          {/* 特別なリクエスト */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              💭 特別なリクエスト（任意）
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="例：夏休み期間中は人員を多めに配置してください、お盆期間の配慮が必要です、など"
              rows={4}
              className="
                w-full px-6 py-4 text-lg
                border-2 border-gray-300 rounded-xl
                focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200
                transition-all duration-300 resize-none bg-white
                hover:border-indigo-400
              "
            />
          </div>

          {/* 生成ボタン */}
          <div className="text-center pt-4">
            <button
              onClick={handleAIGeneration}
              disabled={!canEdit || !targetMonth}
              className={`
                px-12 py-4 text-xl font-bold rounded-xl
                transform transition-all duration-300
                ${
                  canEdit && targetMonth
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                }
              `}
            >
              {!canEdit ? '🔒 権限不足' : !targetMonth ? '📅 月を選択してください' : '🚀 シフト生成開始'}
            </button>
          </div>

          {/* 注意事項 */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mt-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3 mt-1">💡</span>
              <div>
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  シフト生成前の確認事項
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 従業員情報が最新であることを確認してください</li>
                  <li>• 希望休の申請が完了していることを確認してください</li>
                  <li>• 制約条件・ルールが適切に設定されていることを確認してください</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近の活動 */}
      <div className="bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📈 最近の活動
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">6</div>
              <div className="text-sm text-gray-600">登録従業員数</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
              <div className="text-sm text-gray-600">今月の希望休申請</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">制約条件達成率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataInputPage