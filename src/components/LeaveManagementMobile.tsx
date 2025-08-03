import { FC, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'shiftDisplay'
export type LeaveType = '希望休' | '有休' | '忌引' | '病欠' | 'その他'

interface LeaveManagementMobileProps {
  onNavigate: (page: Page) => void
}

interface Employee {
  id: string
  name: string
}

interface LeaveRequest {
  id: number
  staffId: string
  staffName: string
  date: string
  type: LeaveType
  reason: string
  appliedDate: string
}

interface CalendarDay {
  day: number
  date: string
  isCurrentMonth: boolean
}

const LeaveManagementMobile: FC<LeaveManagementMobileProps> = ({ onNavigate }) => {
  const [currentMonth, setCurrentMonth] = useState(8)
  const [currentYear, setCurrentYear] = useState(2025)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null)
  const [showLeavesList, setShowLeavesList] = useState(false)

  // 権限情報を取得
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('edit')

  const [formData, setFormData] = useState({
    staffId: '',
    type: '' as LeaveType | '',
    date: '',
    reason: ''
  })

  // 従業員データ
  const employees: Employee[] = [
    { id: 'N001', name: '看護師A' },
    { id: 'N002', name: '看護師B' },
    { id: 'N003', name: '看護師C' },
    { id: 'P001', name: 'パートA' },
    { id: 'P002', name: 'パートB' },
    { id: 'P003', name: 'パートC' }
  ]

  // 希望休申請データ（PC版と統一、承認・保留削除）
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 1,
      staffId: 'N001',
      staffName: '看護師A',
      type: '有休',
      date: '2025-08-15',
      reason: '家族旅行',
      appliedDate: '2025-07-15'
    },
    {
      id: 2,
      staffId: 'P001',
      staffName: 'パートA',
      type: '希望休',
      date: '2025-08-22',
      reason: '子供の行事',
      appliedDate: '2025-07-20'
    },
    {
      id: 3,
      staffId: 'N002',
      staffName: '看護師B',
      type: '有休',
      date: '2025-08-28',
      reason: '私用',
      appliedDate: '2025-08-01'
    }
  ])

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfWeek = (year: number, month: number): number => {
    return new Date(year, month - 1, 1).getDay()
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = []
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const startDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth)
    
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

    if (!canEdit) {
      alert('希望休の申請・編集権限がありません')
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
    } else {
      // 新規追加
      const newId = Math.max(...leaveRequests.map(lr => lr.id), 0) + 1
      const newLeave: LeaveRequest = {
        id: newId,
        staffId: formData.staffId,
        staffName: staff.name,
        type: formData.type as LeaveType,
        date: formData.date,
        reason: formData.reason,
        appliedDate: new Date().toISOString().split('T')[0]
      }
      setLeaveRequests(prev => [...prev, newLeave])
    }

    setShowModal(false)
    setFormData({ staffId: '', type: '', date: '', reason: '' })
    setEditingLeave(null)
  }

  const handleDeleteLeave = (id: number) => {
    if (!canEdit) {
      alert('希望休の削除権限がありません')
      return
    }

    if (confirm('この申請を削除しますか？')) {
      setLeaveRequests(prev => prev.filter(leave => leave.id !== id))
    }
  }

  const getLeaveTypeColor = (type: string): string => {
    switch (type) {
      case '希望休': return 'bg-blue-500 text-white'
      case '有休': return 'bg-green-500 text-white'
      case '忌引': return 'bg-orange-500 text-white'
      case '病欠': return 'bg-red-500 text-white'
      case 'その他': return 'bg-purple-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const calendarDays = generateCalendarDays()
  const currentMonthLeaves = leaveRequests.filter(leave => {
    const leaveDate = new Date(leave.date)
    return leaveDate.getFullYear() === currentYear && leaveDate.getMonth() === currentMonth - 1
  })

  return (
    <div className="space-y-4 pb-24"> {/* 下部タブバー分のmargin */}
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            📅 希望休管理
          </h2>
          <p className="text-gray-600 text-sm">
            希望休・有休の申請・確認
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
              スタッフ権限のため、申請の変更・削除はできません（閲覧のみ）
            </span>
          </div>
        </div>
      )}

      {/* 表示切り替えボタン */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowLeavesList(false)}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${
            !showLeavesList 
              ? 'bg-indigo-500 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          📅 カレンダー
        </button>
        <button
          onClick={() => setShowLeavesList(true)}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${
            showLeavesList 
              ? 'bg-indigo-500 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          📝 申請一覧
        </button>
      </div>

      {!showLeavesList ? (
        // カレンダー表示
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 月切り替え */}
          <div className="bg-indigo-500 text-white p-4 flex items-center justify-between">
            <button
              onClick={() => changeMonth('prev')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              ←
            </button>
            <h3 className="font-bold text-lg">
              {currentYear}年{currentMonth}月
            </h3>
            <button
              onClick={() => changeMonth('next')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              →
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 bg-gray-50">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-bold text-gray-600 border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const leaves = leaveRequests.filter(leave => leave.date === day.date)
              const hasLeave = leaves.length > 0
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                  className={`
                    h-16 p-1 border-r border-b border-gray-200 cursor-pointer transition-colors duration-200
                    ${day.isCurrentMonth 
                      ? hasLeave 
                        ? 'bg-blue-100 hover:bg-blue-200' 
                        : 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-100 text-gray-400'
                    }
                    ${day.date === selectedDate ? 'ring-2 ring-indigo-500' : ''}
                  `}
                >
                  <div className={`text-xs font-semibold ${
                    day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {day.day}
                  </div>
                  
                  {hasLeave && (
                    <div className="mt-1">
                      {leaves.slice(0, 1).map((leave, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate ${getLeaveTypeColor(leave.type)}`}
                        >
                          {leave.staffName}
                        </div>
                      ))}
                      {leaves.length > 1 && (
                        <div className="text-xs text-gray-500">
                          +{leaves.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // 申請一覧表示
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="font-bold text-gray-800 mb-4">
            {currentYear}年{currentMonth}月の申請一覧
          </h3>
          
          <div className="space-y-3">
            {currentMonthLeaves.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                この月の希望休申請はありません
              </div>
            ) : (
              currentMonthLeaves.map((leave) => (
                <div key={leave.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">{leave.staffName}</div>
                      <div className="text-sm text-gray-600">{leave.date}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLeaveTypeColor(leave.type)}`}>
                      {leave.type}
                    </span>
                  </div>
                  
                  {leave.reason && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">理由:</span> {leave.reason}
                    </div>
                  )}
                  
                  {canEdit && (
                    <div className="flex gap-2">
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
                        className="bg-indigo-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-indigo-600 transition-colors"
                      >
                        編集
                      </button>
                      <button 
                        onClick={() => handleDeleteLeave(leave.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 希望休申請モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-indigo-600">
                {editingLeave ? '希望休を編集' : '希望休を申請'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  従業員 *
                </label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    canEdit 
                      ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                      : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <option value="">選択してください</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  種類 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as LeaveType }))}
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    canEdit 
                      ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                      : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
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
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    canEdit 
                      ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                      : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  理由（任意）
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  disabled={!canEdit}
                  placeholder={canEdit ? "休暇の理由を入力してください" : "編集権限がありません"}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${
                    canEdit 
                      ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                      : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleSaveLeave}
                  disabled={!canEdit || !formData.staffId || !formData.type || !formData.date}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    (canEdit && formData.staffId && formData.type && formData.date)
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {editingLeave ? '更新' : '申請'}
                </button>
                <button
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold text-sm"
                  onClick={() => setShowModal(false)}
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

export default LeaveManagementMobile