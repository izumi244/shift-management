import { FC, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// 型定義を直接ここに定義
export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'aiGeneration' | 'shiftDisplay'

interface RulesSettingsProps {
  onNavigate: (page: Page) => void
}

const RulesSettings: FC<RulesSettingsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('basic')

  // 権限情報を取得
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('edit')

  // 基本ルール設定
  const [basicRules, setBasicRules] = useState({
    clinicStartTime: '08:30',
    clinicEndTime: '18:30',
    clinicDays: ['月', '火', '水', '木', '金', '土'],
    wednesdayEndTime: '12:30',
    saturdayEndTime: '15:30',
    fullTimeMinDays: 4,
    fullTimeMaxDays: 6
  })

  // 人員配置設定
  const [staffingRules, setStaffingRules] = useState({
    weekday: {
      morning: 2,      // 早番
      evening: 1,      // 遅番
      part1: 1,        // パート①
      part2: 1         // パート②
    },
    wednesday: {
      morning: 2,      // 早番
      evening: 0,      // 遅番（水曜午後なし）
      part1: 1,        // パート①
      part2: 0         // パート②（水曜午後なし）
    },
    saturday: {
      morning: 2,      // 早番
      evening: 1,      // 遅番
      part1: 1,        // パート①
      part2: 1         // パート②
    }
  })

  // シフト設定
  const [shiftRules, setShiftRules] = useState({
    morningStart: '08:30',
    morningEnd: '17:30',
    eveningStart: '09:30',
    eveningEnd: '18:30',
    part1Start: '08:30',
    part1EndOptions: ['12:30', '13:00'], // 変更：12:30と13:00
    part1DefaultEnd: '12:30', // 追加：デフォルト終了時間
    part2Start: '11:00',
    part2End: '14:30' // 変更：14:30に
  })

  // 制約条件設定
  const [constraintRules, setConstraintRules] = useState({
    maxConsecutiveDays: 5,
    fairRotation: true,
    veteranPriority: false,
    avoidSingleStaff: true,
    considerPreferences: true
  })

  const handleDayToggle = (day: string) => {
    if (!canEdit) {
      alert('制約設定の変更権限がありません（管理者のみ実行可能）')
      return
    }

    setBasicRules(prev => ({
      ...prev,
      clinicDays: prev.clinicDays.includes(day)
        ? prev.clinicDays.filter(d => d !== day)
        : [...prev.clinicDays, day]
    }))
  }

  const handleSave = () => {
    if (!canEdit) {
      alert('制約設定の保存権限がありません（管理者のみ実行可能）')
      return
    }

    const allRules = {
      basic: basicRules,
      staffing: staffingRules,
      shift: shiftRules,
      constraints: constraintRules
    }
    console.log('💾 保存された設定:', allRules)
    alert('設定を保存しました！')
  }

  const tabs = [
    { id: 'basic', label: '基本ルール', icon: '📋', color: 'blue' },
    { id: 'staffing', label: '人員配置', icon: '👥', color: 'orange' },
    { id: 'shift', label: 'シフト設定', icon: '⏰', color: 'purple' },
    { id: 'constraints', label: '制約条件', icon: '⚠️', color: 'green' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            ⚙️ 制約条件・ルール設定
          </h2>
          <p className="text-gray-600 mt-1">
            シフト作成のルール・制約条件を設定
          </p>
        </div>
        <button
          onClick={() => onNavigate('dataInput')}
          className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors duration-200"
        >
          ← 戻る
        </button>
      </div>

      {/* 権限不足時の警告 */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <span className="font-medium">
              スタッフ権限のため、制約設定の変更・保存はできません（閲覧のみ）
            </span>
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!canEdit}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform ${
            canEdit 
              ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          {canEdit ? '💾 設定を保存' : '🔒 設定を保存（権限不足）'}
        </button>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${
                        tab.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        tab.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        tab.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      } shadow-md`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {/* 基本ルール */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                📋 基本ルール設定
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    診療開始時間
                  </label>
                  <input
                    type="time"
                    value={basicRules.clinicStartTime}
                    onChange={(e) => canEdit && setBasicRules(prev => ({ ...prev, clinicStartTime: e.target.value }))}
                    disabled={!canEdit}
                    className={`w-full p-3 border rounded-lg focus:ring-2 ${
                      canEdit 
                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                        : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    診療終了時間
                  </label>
                  <input
                    type="time"
                    value={basicRules.clinicEndTime}
                    onChange={(e) => canEdit && setBasicRules(prev => ({ ...prev, clinicEndTime: e.target.value }))}
                    disabled={!canEdit}
                    className={`w-full p-3 border rounded-lg focus:ring-2 ${
                      canEdit 
                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                        : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  診療日（複数選択可能）
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      disabled={!canEdit}
                      className={`p-3 rounded-lg font-medium transition-colors ${
                        basicRules.clinicDays.includes(day)
                          ? 'bg-blue-500 text-white'
                          : canEdit 
                            ? 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    水曜日終了時間
                  </label>
                  <input
                    type="time"
                    value={basicRules.wednesdayEndTime}
                    onChange={(e) => canEdit && setBasicRules(prev => ({ ...prev, wednesdayEndTime: e.target.value }))}
                    disabled={!canEdit}
                    className={`w-full p-3 border rounded-lg focus:ring-2 ${
                      canEdit 
                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                        : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    土曜日終了時間
                  </label>
                  <input
                    type="time"
                    value={basicRules.saturdayEndTime}
                    onChange={(e) => canEdit && setBasicRules(prev => ({ ...prev, saturdayEndTime: e.target.value }))}
                    disabled={!canEdit}
                    className={`w-full p-3 border rounded-lg focus:ring-2 ${
                      canEdit 
                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                        : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 人員配置 */}
          {activeTab === 'staffing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                👥 人員配置設定
              </h3>

              {/* 平日 */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-4">平日（月・火・木・金）</h4>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      早番
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.weekday.morning}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        weekday: { ...prev.weekday, morning: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      遅番
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.weekday.evening}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        weekday: { ...prev.weekday, evening: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      パート①
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.weekday.part1}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        weekday: { ...prev.weekday, part1: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      パート②
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.weekday.part2}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        weekday: { ...prev.weekday, part2: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>
                </div>
              </div>

              {/* 水曜日 */}
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-4">水曜日（午後診療なし）</h4>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      早番
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.wednesday.morning}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        wednesday: { ...prev.wednesday, morning: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>

                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      遅番
                    </label>
                    <div className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 text-center font-semibold">
                      なし
                    </div>
                    <p className="text-xs text-gray-400 mt-1">午後診療なし</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      パート①
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.wednesday.part1}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        wednesday: { ...prev.wednesday, part1: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>

                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      パート②
                    </label>
                    <div className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 text-center font-semibold">
                      なし
                    </div>
                    <p className="text-xs text-gray-400 mt-1">午後診療なし</p>
                  </div>
                </div>
              </div>

              {/* 土曜日 */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-4">土曜日</h4>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      早番
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.saturday.morning}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        saturday: { ...prev.saturday, morning: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-green-500 focus:border-green-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      遅番
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.saturday.evening}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        saturday: { ...prev.saturday, evening: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-green-500 focus:border-green-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      パート①
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.saturday.part1}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        saturday: { ...prev.saturday, part1: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-green-500 focus:border-green-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      パート②
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={staffingRules.saturday.part2}
                      onChange={(e) => canEdit && setStaffingRules(prev => ({
                        ...prev,
                        saturday: { ...prev.saturday, part2: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 text-center font-semibold ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-green-500 focus:border-green-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">人</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* シフト設定 */}
          {activeTab === 'shift' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                ⏰ シフト設定
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 早番設定 */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">早番</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.morningStart}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, morningStart: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${
                          canEdit 
                            ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終了時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.morningEnd}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, morningEnd: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${
                          canEdit 
                            ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 遅番設定 */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4">遅番</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.eveningStart}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, eveningStart: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${
                          canEdit 
                            ? 'border-gray-300 focus:ring-green-500 focus:border-green-500 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終了時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.eveningEnd}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, eveningEnd: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${
                          canEdit 
                            ? 'border-gray-300 focus:ring-green-500 focus:border-green-500 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* パート①設定 */}
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-4">パート①</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.part1Start}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, part1Start: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${
                          canEdit 
                            ? 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終了時間オプション
                      </label>
                      <div className="space-y-2">
                        {shiftRules.part1EndOptions.map((time) => (
                          <label key={time} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="part1EndTime"
                              value={time}
                              checked={shiftRules.part1DefaultEnd === time}
                              onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, part1DefaultEnd: e.target.value }))}
                              disabled={!canEdit}
                              className={`w-4 h-4 ${
                                canEdit 
                                  ? 'text-yellow-600 cursor-pointer' 
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                            />
                            <span className={`text-sm font-medium ${canEdit ? 'text-gray-700' : 'text-gray-500'}`}>
                              {time}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* パート②設定 */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4">パート②</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.part2Start}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, part2Start: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${
                          canEdit 
                            ? 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終了時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.part2End}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, part2End: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${
                          canEdit 
                            ? 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 制約条件 */}
          {activeTab === 'constraints' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                ⚠️ 制約条件設定
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-4">連続勤務制限</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大連続勤務日数（常勤）
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={constraintRules.maxConsecutiveDays}
                      onChange={(e) => canEdit && setConstraintRules(prev => ({ ...prev, maxConsecutiveDays: parseInt(e.target.value) }))}
                      disabled={!canEdit}
                      className={`w-full p-3 border rounded-lg focus:ring-2 ${
                        canEdit 
                          ? 'border-gray-300 focus:ring-red-500 focus:border-red-500 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4">公平性ルール</h4>
                  
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={constraintRules.fairRotation}
                        onChange={(e) => canEdit && setConstraintRules(prev => ({ ...prev, fairRotation: e.target.checked }))}
                        disabled={!canEdit}
                        className={`w-5 h-5 rounded focus:ring-green-500 ${
                          canEdit 
                            ? 'text-green-600 cursor-pointer' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      />
                      <span className={`text-sm font-medium ${canEdit ? 'text-gray-700' : 'text-gray-500'}`}>
                        公平なローテーション
                      </span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={constraintRules.considerPreferences}
                        onChange={(e) => canEdit && setConstraintRules(prev => ({ ...prev, considerPreferences: e.target.checked }))}
                        disabled={!canEdit}
                        className={`w-5 h-5 rounded focus:ring-green-500 ${
                          canEdit 
                            ? 'text-green-600 cursor-pointer' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      />
                      <span className={`text-sm font-medium ${canEdit ? 'text-gray-700' : 'text-gray-500'}`}>
                        希望休を考慮
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">優先度設定</h4>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={constraintRules.veteranPriority}
                      onChange={(e) => canEdit && setConstraintRules(prev => ({ ...prev, veteranPriority: e.target.checked }))}
                      disabled={!canEdit}
                      className={`w-5 h-5 rounded focus:ring-blue-500 ${
                        canEdit 
                          ? 'text-blue-600 cursor-pointer' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    />
                    <span className={`text-sm font-medium ${canEdit ? 'text-gray-700' : 'text-gray-500'}`}>
                      ベテラン優先配置
                    </span>
                  </label>
                </div>

                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-4">安全性ルール</h4>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={constraintRules.avoidSingleStaff}
                      onChange={(e) => canEdit && setConstraintRules(prev => ({ ...prev, avoidSingleStaff: e.target.checked }))}
                      disabled={!canEdit}
                      className={`w-5 h-5 rounded focus:ring-yellow-500 ${
                        canEdit 
                          ? 'text-yellow-600 cursor-pointer' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    />
                    <span className={`text-sm font-medium ${canEdit ? 'text-gray-700' : 'text-gray-500'}`}>
                      祝日のない週で全常勤スタッフが水曜日または土曜日のどちらかには出勤必須
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RulesSettings