import { FC, useState } from 'react'

// 型定義を直接ここに定義
export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'aiGeneration' | 'shiftDisplay'
export type LeaveType = '希望休' | '有休' | '忌引' | '病欠' | 'その他'

export interface LeaveRequest {
  id: number
  staffId: string
  staffName: string
  date: string
  type: LeaveType
  reason: string
  appliedDate: string
}

interface LeaveManagementProps {
  onNavigate: (page: Page) => void
}

interface Employee {
  id: string
  name: string
}

const LeaveManagement: FC<LeaveManagementProps> = ({ onNavigate }) => {
  const [currentYear, setCurrentYear] = useState(2025)
  const [currentMonth, setCurrentMonth] = useState(8)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null)

  // 従業員データ（実際はApp.tsxから受け取る）
  const employees: Employee[] = [
    { id: 'N001', name: '看護師A' },
    { id: 'N002', name: '看護師B' },
    { id: 'N003', name: '看護師C' },
    { id: 'P001', name: 'パートA' },
    { id: 'P002', name: 'パートB' },
    { id: 'P003', name: 'パートC' },
  ]

  // 希望休データ
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 1,
      staffId: 'N001',
      staffName: '看護師A',
      date: '2025-08-05',
      type: '希望休',
      reason: '家族旅行',
      appliedDate: '2025-07-15'
    },
    {
      id: 2,
      staffId: 'N002',
      staffName: '看護師B',
      date: '2025-08-12',
      type: '有休',
      reason: '',
      appliedDate: '2025-07-20'
    },
    {
      id: 3,
      staffId: 'P001',
      staffName: 'パートA',
      date: '2025-08-20',
      type: '病欠',
      reason: '通院',
      appliedDate: '2025-08-18'
    }
  ])

  const [formData, setFormData] = useState<{
    staffId: string
    type: LeaveType | ''
    date: string
    reason: string
  }>({
    staffId: '',
    type: '',
    date: '',
    reason: ''
  })

  // カレンダー生成
  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // 前月の日付
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
    const prevMonthLastDay = new Date(prevYear, prevMonth, 0).getDate()
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      days.push({
        day,
        isCurrentMonth: false,
        date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      })
    }
    
    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        day,
        isCurrentMonth: true,
        date
      })
    }
    
    // 来月の日付
    const totalCells = Math.ceil(days.length / 7) * 7
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear
    
    for (let day = 1; days.length < totalCells; day++) {
      const date = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        day,
        isCurrentMonth: false,
        date
      })
    }
    
    return days
  }

  const handleDateClick = (date: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    
    const existingLeaves = leaveRequests.filter(leave => leave.date === date)
    if (existingLeaves.length > 0) {
      // 既存の希望休がある場合は編集
      setEditingLeave(existingLeaves[0])
      setFormData({
        staffId: existingLeaves[0].staffId,
        type: existingLeaves[0].type,
        date: existingLeaves[0].date,
        reason: existingLeaves[0].reason
      })
    } else {
      // 新規申請
      setEditingLeave(null)
      setFormData({
        staffId: '',
        type: '',
        date,
        reason: ''
      })
    }
    
    setSelectedDate(date)
    setShowModal(true)
  }

  const handleSaveLeave = () => {
    if (!formData.staffId || !formData.type || !formData.date) {
      alert('必須項目を入力してください')
      return
    }

    const staff = employees.find(emp => emp.id === formData.staffId)
    if (!staff) {
      alert('従業員が見つかりません')
      return
    }

    // 重複チェック（編集時は除く）
    const existingLeave = leaveRequests.find(leave => 
      leave.staffId === formData.staffId && 
      leave.date === formData.date && 
      leave.id !== editingLeave?.id
    )
    
    if (existingLeave) {
      alert('同じ従業員の同じ日付に既に申請があります')
      return
    }

    if (editingLeave) {
      // 編集
      setLeaveRequests(prev => prev.map(leave => 
        leave.id === editingLeave.id 
          ? {
              ...leave,
              staffId: formData.staffId,
              staffName: staff.name,
              type: formData.type as LeaveType,
              date: formData.date,
              reason: formData.reason
            }
          : leave
      ))
      alert('希望休を更新しました！')
    } else {
      // 新規追加
      const newId = Math.max(...leaveRequests.map(lr => lr.id), 0) + 1
      const newLeave: LeaveRequest = {
        id: newId,
        staffId: formData.staffId,
        staffName: staff.name,
        date: formData.date,
        type: formData.type as LeaveType,
        reason: formData.reason,
        appliedDate: new Date().toISOString().split('T')[0]
      }
      setLeaveRequests(prev => [...prev, newLeave])
      alert('希望休を申請しました！')
    }

    setShowModal(false)
    setEditingLeave(null)
  }

  const handleDeleteLeave = (id: number) => {
    const leave = leaveRequests.find(l => l.id === id)
    if (!leave) return

    if (confirm(`${leave.staffName}の${leave.date}の${leave.type}を削除しますか？`)) {
      setLeaveRequests(prev => prev.filter(leave => leave.id !== id))
      alert('削除しました！')
    }
  }

  const changeMonth = (direction: number) => {
    let newMonth = currentMonth + direction
    let newYear = currentYear
    
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case '希望休': return 'bg-blue-500 text-white'
      case '有休': return 'bg-green-500 text-white'
      case '忌引': return 'bg-orange-500 text-white'
      case '病欠': return 'bg-red-500 text-white'
      case 'その他': return 'bg-purple-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getLeaveTypeBadgeColor = (type: string) => {
    switch (type) {
      case '希望休': return 'bg-blue-100 text-blue-800'
      case '有休': return 'bg-green-100 text-green-800'
      case '忌引': return 'bg-orange-100 text-orange-800'
      case '病欠': return 'bg-red-100 text-red-800'
      case 'その他': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // 当月の希望休を取得
  const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
  const currentMonthLeaves = leaveRequests.filter(leave => leave.date.startsWith(currentMonthStr))

  const calendarDays = generateCalendar()

  return (
    <div className="animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          📅 希望休管理
        </h2>
        <button
          onClick={() => onNavigate('dataInput')}
          className="
            inline-flex items-center px-4 py-2 text-sm font-medium
            bg-gray-100 hover:bg-gray-200 text-gray-700
            rounded-lg transition-colors duration-300
            border border-gray-300
          "
        >
          ← 戻る
        </button>
      </div>

      {/* 機能ボタン */}
      <div className="mb-8">
        <button 
          onClick={() => handleDateClick(new Date().toISOString().split('T')[0], true)}
          className="
            inline-flex items-center px-6 py-3 text-sm font-bold
            bg-gradient-to-r from-blue-500 to-blue-600
            hover:from-blue-600 hover:to-blue-700
            text-white rounded-xl shadow-lg hover:shadow-xl
            transform hover:scale-105 transition-all duration-300
          "
        >
          <span className="mr-2">➕</span>
          希望休を申請
        </button>
      </div>

      {/* 月選択と統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            表示月
          </label>
          <select 
            value={`${currentYear}-${String(currentMonth).padStart(2, '0')}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-').map(Number)
              setCurrentYear(year)
              setCurrentMonth(month)
            }}
            className="
              w-full px-4 py-3 rounded-xl border-2 border-gray-200
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
              transition-all duration-300 text-gray-700 bg-white
            "
          >
            <option value="2025-07">2025年7月</option>
            <option value="2025-08">2025年8月</option>
            <option value="2025-09">2025年9月</option>
            <option value="2025-10">2025年10月</option>
            <option value="2025-11">2025年11月</option>
            <option value="2025-12">2025年12月</option>
          </select>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">今月の申請数</div>
            <div className="text-3xl font-bold text-indigo-600">{currentMonthLeaves.length}</div>
          </div>
        </div>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 text-center">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => changeMonth(-1)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <h3 className="text-xl font-bold">{currentYear}年{currentMonth}月</h3>
            <button 
              onClick={() => changeMonth(1)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              →
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center py-2 font-semibold text-gray-600 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((calDay, index) => {
              const dayLeaves = leaveRequests.filter(leave => leave.date === calDay.date)
              const isWeekend = index % 7 === 0 || index % 7 === 6
              const isToday = calDay.date === new Date().toISOString().split('T')[0] && calDay.isCurrentMonth
              
              return (
                <div
                  key={`${calDay.date}-${index}`}
                  onClick={() => handleDateClick(calDay.date, calDay.isCurrentMonth)}
                  className={`
                    min-h-[80px] p-2 rounded-lg border cursor-pointer
                    transition-all duration-300 hover:bg-gray-50
                    ${!calDay.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                    ${isWeekend && calDay.isCurrentMonth ? 'bg-gray-50' : ''}
                    ${isToday ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-200' : 'border-gray-200'}
                    ${calDay.isCurrentMonth ? 'hover:shadow-md' : 'cursor-not-allowed'}
                  `}
                >
                  <div className="text-sm font-medium">{calDay.day}</div>
                  <div className="mt-1 space-y-1">
                    {dayLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className={`
                          text-xs px-1 rounded text-center
                          ${getLeaveTypeColor(leave.type)}
                        `}
                        title={`${leave.staffName} - ${leave.type}${leave.reason ? ': ' + leave.reason : ''}`}
                      >
                        {leave.staffName.length > 4 ? leave.staffName.substring(0, 3) + '...' : leave.staffName}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {['希望休', '有休', '忌引', '病欠', 'その他'].map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getLeaveTypeColor(type)}`}></div>
            <span className="text-sm text-gray-600">{type}</span>
          </div>
        ))}
      </div>

      {/* 申請済み希望休一覧 */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">申請済み希望休一覧</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">従業員</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">日付</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">曜日</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">種類</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">理由</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">申請日</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentMonthLeaves.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((leave) => {
                const date = new Date(leave.date)
                const dayNames = ['日', '月', '火', '水', '木', '金', '土']
                const dayOfWeek = dayNames[date.getDay()]
                
                return (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{leave.staffName}</div>
                      <div className="text-sm text-gray-500">({leave.staffId})</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{leave.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{dayOfWeek}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeBadgeColor(leave.type)}`}>
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{leave.reason || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{leave.appliedDate}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button 
                        onClick={() => {
                          setEditingLeave(leave)
                          setFormData({
                            staffId: leave.staffId,
                            type: leave.type,
                            date: leave.date,
                            reason: leave.reason
                          })
                          setShowModal(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
                      >
                        編集
                      </button>
                      <button 
                        onClick={() => handleDeleteLeave(leave.id)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {currentMonthLeaves.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              この月の希望休申請はありません
            </div>
          )}
        </div>
      </div>

      {/* 希望休申請モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-indigo-600">
                {editingLeave ? '希望休を編集' : '希望休を申請'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  従業員 *
                </label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                >
                  <option value="">選択してください</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  希望休の種類 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as LeaveType }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                >
                  <option value="">選択してください</option>
                  <option value="希望休">希望休</option>
                  <option value="有休">有休</option>
                  <option value="忌引">忌引</option>
                  <option value="病欠">病欠</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  日付 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  理由（任意）
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  placeholder="理由があれば入力してください"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveLeave}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300"
                >
                  {editingLeave ? '更新' : '申請'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveManagement