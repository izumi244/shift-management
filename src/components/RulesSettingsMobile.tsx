import { FC, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'shiftDisplay'

interface RulesSettingsMobileProps {
  onNavigate: (page: Page) => void
}

const RulesSettingsMobile: FC<RulesSettingsMobileProps> = ({ onNavigate }) => {
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
    part1EndOptions: ['12:30', '13:00'],
    part1DefaultEnd: '12:30',
    part2Start: '11:00',
    part2End: '14:30'
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
    { id: 'basic', label: '基本', icon: '📋', color: 'blue' },
    { id: 'staffing', label: '人員', icon: '👥', color: 'orange' },
    { id: 'shift', label: 'シフト', icon: '⏰', color: 'purple' },
    { id: 'constraints', label: '制約', icon: '⚠️', color: 'green' }
  ]

  return (
    <div className="space-y-4 pb-24"> {/* 下部タブバー分のmargin */}
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            ⚙️ 制約設定
          </h2>
          <p className="text-gray-600 text-sm">
            ルール・制約条件の設定
          </p>
        </div>
        <button
          onClick={() => onNavigate('dataInput')}
          className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
        >
          ← 戻る
        </button>
      </div>

      {/* 権限不足時の警告 */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
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
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
            canEdit 
              ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          {canEdit ? '💾 設定を保存' : '🔒 保存（権限不足）'}
        </button>
      </div>

      {/* タブナビゲーション（4列グリッド） */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="grid grid-cols-4 gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center px-2 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm mb-1">{tab.icon}</span>
                <span className="text-[10px] leading-tight">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-4">
          {/* 基本ルール - 【常勤制約】セクション削除 */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">📋 基本ルール</h3>

              {/* 診療時間 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">診療時間</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                    <input
                      type="time"
                      value={basicRules.clinicStartTime}
                      onChange={(e) => canEdit && setBasicRules(prev => ({ ...prev, clinicStartTime: e.target.value }))}
                      disabled={!canEdit}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                    <input
                      type="time"
                      value={basicRules.clinicEndTime}
                      onChange={(e) => canEdit && setBasicRules(prev => ({ ...prev, clinicEndTime: e.target.value }))}
                      disabled={!canEdit}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 診療曜日 */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">診療曜日</h4>
                <div className="grid grid-cols-4 gap-2">
                  {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      disabled={!canEdit}
                      className={`p-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        basicRules.clinicDays.includes(day)
                          ? 'bg-green-500 text-white'
                          : canEdit 
                            ? 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 特別時間設定 */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">特別時間設定</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">水曜終了時間</label>
                    <input
                      type="time"
                      value={basicRules.wednesdayEndTime}
                      onChange={(e) => canEdit && setBasicRules(prev => ({ ...prev, wednesdayEndTime: e.target.value }))}
                      disabled={!canEdit}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">土曜終了時間</label>
                    <input
                      type="time"
                      value={basicRules.saturdayEndTime}
                      onChange={(e) => canEdit && setBasicRules(prev => ({ ...prev, saturdayEndTime: e.target.value }))}
                      disabled={!canEdit}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 人員配置 - 色をPC版に合わせて修正（水曜=yellow、土曜=orange） */}
          {activeTab === 'staffing' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">👥 人員配置</h3>

              {/* 平日設定 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">平日（月・火・木・金）</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">早番</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">遅番</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パート①</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パート②</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    合計: {staffingRules.weekday.morning + staffingRules.weekday.evening + staffingRules.weekday.part1 + staffingRules.weekday.part2}人
                  </p>
                </div>
              </div>

              {/* 水曜設定 - yellowに変更 */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">水曜日（午後休診）</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">早番</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パート①</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">
                    合計: {staffingRules.wednesday.morning + staffingRules.wednesday.part1}人
                  </p>
                </div>
              </div>

              {/* 土曜設定 - greenに変更 */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">土曜日</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">早番</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">遅番</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パート①</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パート②</label>
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
                      className={`w-full p-2 border rounded-lg text-center font-semibold text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-3 p-2 bg-green-100 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    合計: {staffingRules.saturday.morning + staffingRules.saturday.evening + staffingRules.saturday.part1 + staffingRules.saturday.part2}人
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* シフト設定 - パート①の「デフォルト終了」→「終了時間」に修正 */}
          {activeTab === 'shift' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">⏰ シフト設定</h3>

              <div className="grid grid-cols-1 gap-4">
                {/* 早番 */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">早番</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                      <input
                        type="time"
                        value={shiftRules.morningStart}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, morningStart: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-2 border rounded-lg text-sm ${
                          canEdit 
                            ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                      <input
                        type="time"
                        value={shiftRules.morningEnd}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, morningEnd: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-2 border rounded-lg text-sm ${
                          canEdit 
                            ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 遅番 */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">遅番</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                      <input
                        type="time"
                        value={shiftRules.eveningStart}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, eveningStart: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-2 border rounded-lg text-sm ${
                          canEdit 
                            ? 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                      <input
                        type="time"
                        value={shiftRules.eveningEnd}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, eveningEnd: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-2 border rounded-lg text-sm ${
                          canEdit 
                            ? 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* パート① - 「デフォルト終了」→「終了時間」に修正 */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-3">パート①</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                      <input
                        type="time"
                        value={shiftRules.part1Start}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, part1Start: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-2 border rounded-lg text-sm ${
                          canEdit 
                            ? 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                      <select
                        value={shiftRules.part1DefaultEnd}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, part1DefaultEnd: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-2 border rounded-lg text-sm ${
                          canEdit 
                            ? 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {shiftRules.part1EndOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* パート② */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-3">パート②</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                      <input
                        type="time"
                        value={shiftRules.part2Start}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, part2Start: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-2 border rounded-lg text-sm ${
                          canEdit 
                            ? 'border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white' 
                            : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                      <input
                        type="time"
                        value={shiftRules.part2End}
                        onChange={(e) => canEdit && setShiftRules(prev => ({ ...prev, part2End: e.target.value }))}
                        disabled={!canEdit}
                        className={`w-full p-2 border rounded-lg text-sm ${
                          canEdit 
                            ? 'border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white' 
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
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">⚠️ 制約条件</h3>

              <div className="space-y-4">
                {/* 連続勤務制限 */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-3">連続勤務制限</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最大連続勤務日数</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={constraintRules.maxConsecutiveDays}
                      onChange={(e) => canEdit && setConstraintRules(prev => ({ ...prev, maxConsecutiveDays: parseInt(e.target.value) }))}
                      disabled={!canEdit}
                      className={`w-full p-2 border rounded-lg text-sm ${
                        canEdit 
                          ? 'border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* 制約オプション */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">制約オプション</h4>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'fairRotation', label: '公平なローテーション', desc: 'シフト回数を均等に配分' },
                      { key: 'veteranPriority', label: 'ベテラン優先', desc: '経験豊富なスタッフを優先配置' },
                      { key: 'avoidSingleStaff', label: '一人勤務回避', desc: '可能な限り複数人での勤務' },
                      { key: 'considerPreferences', label: '希望考慮', desc: '個人の希望を可能な限り反映' }
                    ].map((option) => (
                      <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={constraintRules[option.key as keyof typeof constraintRules] as boolean}
                          onChange={(e) => canEdit && setConstraintRules(prev => ({ 
                            ...prev, 
                            [option.key]: e.target.checked 
                          }))}
                          disabled={!canEdit}
                          className={`mt-1 h-4 w-4 rounded border-gray-300 ${
                            canEdit 
                              ? 'text-green-600 focus:ring-green-500' 
                              : 'cursor-not-allowed opacity-50'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RulesSettingsMobile