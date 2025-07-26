import { FC, useState } from 'react'

// 型定義を直接ここに定義
export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'aiGeneration' | 'shiftDisplay'

interface RulesSettingsProps {
  onNavigate: (page: Page) => void
}

const RulesSettings: FC<RulesSettingsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('basic')

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
    setBasicRules(prev => ({
      ...prev,
      clinicDays: prev.clinicDays.includes(day)
        ? prev.clinicDays.filter(d => d !== day)
        : [...prev.clinicDays, day]
    }))
  }

  const handleSave = () => {
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

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          💾 設定を保存
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
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                📋 診療時間・営業日設定
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">診療時間</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        診療開始時間
                      </label>
                      <input
                        type="time"
                        value={basicRules.clinicStartTime}
                        onChange={(e) => setBasicRules(prev => ({ ...prev, clinicStartTime: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        診療終了時間
                      </label>
                      <input
                        type="time"
                        value={basicRules.clinicEndTime}
                        onChange={(e) => setBasicRules(prev => ({ ...prev, clinicEndTime: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-4">営業日</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {['月', '火', '水', '木', '金', '土', '日'].map(day => (
                      <label key={day} className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-orange-100">
                        <input
                          type="checkbox"
                          checked={basicRules.clinicDays.includes(day)}
                          onChange={() => handleDayToggle(day)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <span className="text-sm font-medium">{day}曜日</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4">水曜日設定</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      水曜日終了時間
                    </label>
                    <input
                      type="time"
                      value={basicRules.wednesdayEndTime}
                      onChange={(e) => setBasicRules(prev => ({ ...prev, wednesdayEndTime: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4">土曜日設定</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      土曜日終了時間
                    </label>
                    <input
                      type="time"
                      value={basicRules.saturdayEndTime}
                      onChange={(e) => setBasicRules(prev => ({ ...prev, saturdayEndTime: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-4">👩‍⚕️ 常勤スタッフルール</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      週勤務日数（常勤）
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={basicRules.fullTimeMinDays}
                      onChange={(e) => setBasicRules(prev => ({ ...prev, fullTimeMinDays: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大連続勤務日数（常勤）
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={basicRules.fullTimeMaxDays}
                      onChange={(e) => setBasicRules(prev => ({ ...prev, fullTimeMaxDays: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 人員配置 */}
          {activeTab === 'staffing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                👥 曜日別必要人員数
              </h3>

              <div className="space-y-8">
                {/* 平日設定 */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 text-lg">平日設定</h4>
                  <p className="text-sm text-gray-600 mb-4">月・火・木・金曜日</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        早番
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={staffingRules.weekday.morning}
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          weekday: { ...prev.weekday, morning: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold"
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
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          weekday: { ...prev.weekday, evening: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-semibold"
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
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          weekday: { ...prev.weekday, part1: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center font-semibold"
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
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          weekday: { ...prev.weekday, part2: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-semibold"
                      />
                      <p className="text-xs text-gray-500 mt-1">人</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      合計: {staffingRules.weekday.morning + staffingRules.weekday.evening + staffingRules.weekday.part1 + staffingRules.weekday.part2}人
                    </p>
                  </div>
                </div>

                {/* 水曜日設定 */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4 text-lg">水曜日設定</h4>
                  <p className="text-sm text-gray-600 mb-4">水曜日の人員配置</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        早番
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={staffingRules.wednesday.morning}
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          wednesday: { ...prev.wednesday, morning: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold"
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
                        value={staffingRules.wednesday.evening}
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          wednesday: { ...prev.wednesday, evening: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-semibold"
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
                        value={staffingRules.wednesday.part1}
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          wednesday: { ...prev.wednesday, part1: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center font-semibold"
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
                        value={staffingRules.wednesday.part2}
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          wednesday: { ...prev.wednesday, part2: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-semibold"
                      />
                      <p className="text-xs text-gray-500 mt-1">人</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">
                      合計: {staffingRules.wednesday.morning + staffingRules.wednesday.evening + staffingRules.wednesday.part1 + staffingRules.wednesday.part2}人
                    </p>
                  </div>
                </div>

                {/* 土曜日設定 */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 text-lg">土曜日設定</h4>
                  <p className="text-sm text-gray-600 mb-4">週末診療</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        早番
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={staffingRules.saturday.morning}
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          saturday: { ...prev.saturday, morning: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold"
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
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          saturday: { ...prev.saturday, evening: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-semibold"
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
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          saturday: { ...prev.saturday, part1: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center font-semibold"
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
                        onChange={(e) => setStaffingRules(prev => ({
                          ...prev,
                          saturday: { ...prev.saturday, part2: parseInt(e.target.value) }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-semibold"
                      />
                      <p className="text-xs text-gray-500 mt-1">人</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      合計: {staffingRules.saturday.morning + staffingRules.saturday.evening + staffingRules.saturday.part1 + staffingRules.saturday.part2}人
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* シフト設定 */}
          {activeTab === 'shift' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                ⏰ シフトパターン設定
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 早番 */}
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
                        onChange={(e) => setShiftRules(prev => ({ ...prev, morningStart: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終了時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.morningEnd}
                        onChange={(e) => setShiftRules(prev => ({ ...prev, morningEnd: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 遅番 */}
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
                        onChange={(e) => setShiftRules(prev => ({ ...prev, eveningStart: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終了時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.eveningEnd}
                        onChange={(e) => setShiftRules(prev => ({ ...prev, eveningEnd: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* パート① */}
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-4">パート①</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.part1Start}
                        onChange={(e) => setShiftRules(prev => ({ ...prev, part1Start: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終了時間選択肢
                      </label>
                      <div className="space-y-2">
                        {shiftRules.part1EndOptions.map(time => (
                          <label key={time} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="part1End"
                              value={time}
                              checked={shiftRules.part1DefaultEnd === time}
                              onChange={(e) => setShiftRules(prev => ({ ...prev, part1DefaultEnd: e.target.value }))}
                              className="w-4 h-4 text-orange-600"
                            />
                            <span className="text-sm">{time}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* パート② */}
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-4">パート②</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.part2Start}
                        onChange={(e) => setShiftRules(prev => ({ ...prev, part2Start: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終了時間
                      </label>
                      <input
                        type="time"
                        value={shiftRules.part2End}
                        onChange={(e) => setShiftRules(prev => ({ ...prev, part2End: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      onChange={(e) => setConstraintRules(prev => ({ ...prev, maxConsecutiveDays: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                        onChange={(e) => setConstraintRules(prev => ({ ...prev, fairRotation: e.target.checked }))}
                        className="w-5 h-5 text-green-600"
                      />
                      <span className="text-sm font-medium">公平なローテーション</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={constraintRules.considerPreferences}
                        onChange={(e) => setConstraintRules(prev => ({ ...prev, considerPreferences: e.target.checked }))}
                        className="w-5 h-5 text-green-600"
                      />
                      <span className="text-sm font-medium">希望休を考慮</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">優先度設定</h4>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={constraintRules.veteranPriority}
                      onChange={(e) => setConstraintRules(prev => ({ ...prev, veteranPriority: e.target.checked }))}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-sm font-medium">ベテラン優先配置</span>
                  </label>
                </div>

                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-4">安全性ルール</h4>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={constraintRules.avoidSingleStaff}
                      onChange={(e) => setConstraintRules(prev => ({ ...prev, avoidSingleStaff: e.target.checked }))}
                      className="w-5 h-5 text-yellow-600"
                    />
                    <span className="text-sm font-medium">祝日のない週で全常勤スタッフが水曜日または土曜日のどちらかには出勤必須</span>
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