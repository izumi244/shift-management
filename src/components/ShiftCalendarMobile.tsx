import { FC, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// 型定義
interface ShiftAssignment {
  date: string
  staffId: string
  staffName: string
  shiftType: string
  startTime: string
  endTime: string
}

interface GeneratedShift {
  month: string
  assignments: ShiftAssignment[]
  statistics?: {
    totalHours: Record<string, number>
    violations: string[]
  }
}

const ShiftCalendarMobile: FC = () => {
  const [currentMonth, setCurrentMonth] = useState('2025-08')
  const [isEditing, setIsEditing] = useState(false)
  const [staffModalOpen, setStaffModalOpen] = useState(false)
  const [shiftTypeModalOpen, setShiftTypeModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStaffName, setSelectedStaffName] = useState('')
  const [statsCollapsed, setStatsCollapsed] = useState(true) // スマホ版では初期状態で閉じている
  
  // 権限情報を取得
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('edit')
  
  // 6人体制のスタッフリスト
  const staffList = [
    { id: 'N001', name: '看護師A', type: '常勤', shifts: ['早番', '遅番'] },
    { id: 'N002', name: '看護師B', type: '常勤', shifts: ['早番', '遅番'] },
    { id: 'N003', name: '看護師C', type: '常勤', shifts: ['早番', '遅番'] },
    { id: 'P001', name: 'パートA', type: 'パート', shifts: ['パート①', 'パート②'] },
    { id: 'P002', name: 'パートB', type: 'パート', shifts: ['パート①', 'パート②'] },
    { id: 'P003', name: 'パートC', type: 'パート', shifts: ['パート①', 'パート②'] }
  ]

  // モックデータ
  const [mockShift, setMockShift] = useState<GeneratedShift>({
    month: currentMonth,
    assignments: [
      { date: '2025-08-01', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-01', staffId: 'N002', staffName: '看護師B', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-01', staffId: 'P001', staffName: 'パートA', shiftType: 'パート①', startTime: '08:30', endTime: '12:30' },
      { date: '2025-08-02', staffId: 'N003', staffName: '看護師C', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-02', staffId: 'P002', staffName: 'パートB', shiftType: 'パート②', startTime: '11:00', endTime: '14:30' },
      { date: '2025-08-03', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-03', staffId: 'N002', staffName: '看護師B', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-03', staffId: 'P003', staffName: 'パートC', shiftType: 'パート①', startTime: '08:30', endTime: '12:30' },
      { date: '2025-08-03', staffId: 'P002', staffName: 'パートB', shiftType: 'パート②', startTime: '11:00', endTime: '14:30' },
      { date: '2025-08-05', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-05', staffId: 'N003', staffName: '看護師C', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-05', staffId: 'P001', staffName: 'パートA', shiftType: 'パート①', startTime: '08:30', endTime: '12:30' },
      { date: '2025-08-05', staffId: 'P002', staffName: 'パートB', shiftType: 'パート②', startTime: '11:00', endTime: '14:30' },
      { date: '2025-08-06', staffId: 'N002', staffName: '看護師B', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-06', staffId: 'N003', staffName: '看護師C', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-06', staffId: 'P003', staffName: 'パートC', shiftType: 'パート①', startTime: '08:30', endTime: '12:30' },
      { date: '2025-08-06', staffId: 'P001', staffName: 'パートA', shiftType: 'パート②', startTime: '11:00', endTime: '14:30' },
      { date: '2025-08-07', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-07', staffId: 'P003', staffName: 'パートC', shiftType: '遅番', startTime: '09:30', endTime: '18:30' }
    ],
    statistics: {
      totalHours: {
        'N001': 27,
        'N002': 27,
        'N003': 22.5,
        'P001': 18.5,
        'P002': 14,
        'P003': 16
      },
      violations: []
    }
  })

  // ユーティリティ関数（PC版と同じ30分グリッドシステム）
  const sortShiftsByTime = (shifts: ShiftAssignment[]): ShiftAssignment[] => {
    return shifts.sort((a, b) => {
      const timeA = parseFloat(a.startTime.replace(':', '.').replace('30', '5'))
      const timeB = parseFloat(b.startTime.replace(':', '.').replace('30', '5'))
      return timeA - timeB
    })
  }

  // 30分区切りグリッドシステム（PC版と同じ）
  const timeToGridIndex = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    // 8:30を0とする基準で計算
    const baseHour = 8
    const baseMinute = 30
    
    const totalMinutes = (hours * 60 + minutes) - (baseHour * 60 + baseMinute)
    return Math.max(0, totalMinutes / 30) // 30分毎の区切り
  }

  // グリッド位置計算（モバイル版用にサイズ調整）
  const calculateGridPosition = (startTime: string, endTime: string) => {
    const startIndex = timeToGridIndex(startTime)
    const endIndex = timeToGridIndex(endTime)
    const duration = endIndex - startIndex
    
    const cellHeight = 120 // モバイル版シフト表示エリア120px
    const totalGrids = 20  // 8:30-18:30 = 10時間 = 20区切り
    const gridHeight = cellHeight / totalGrids // 1区切り = 6px
    
    return {
      top: Math.min(startIndex * gridHeight, cellHeight - 30), // 上限調整
      height: Math.min(Math.max(duration * gridHeight, 25), cellHeight - (startIndex * gridHeight) - 3) // 最小高さ25px、下余白3px
    }
  }

  const getShiftColor = (shiftType: string): string => {
    switch (shiftType) {
      case '早番': return 'bg-blue-100 text-blue-800 border-blue-200'
      case '遅番': return 'bg-green-100 text-green-800 border-green-200'
      case 'パート①': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'パート②': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDaysInMonth = (month: string): number => {
    const [year, monthNum] = month.split('-').map(Number)
    return new Date(year, monthNum, 0).getDate()
  }

  const getFirstDayOfWeek = (month: string): number => {
    const [year, monthNum] = month.split('-').map(Number)
    return new Date(year, monthNum - 1, 1).getDay()
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number)
    let newYear = year
    let newMonth = month
    
    if (direction === 'prev') {
      newMonth -= 1
      if (newMonth < 1) {
        newMonth = 12
        newYear -= 1
      }
    } else {
      newMonth += 1
      if (newMonth > 12) {
        newMonth = 1
        newYear += 1
      }
    }
    
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`)
  }

  // セルタップ処理（スマホ版）
  const handleCellClick = (dateStr: string) => {
    if (isEditing) {
      setSelectedDate(dateStr)
      setStaffModalOpen(true)
    }
  }

  // スタッフ選択処理
  const handleStaffSelect = (staffName: string) => {
    setSelectedStaffName(staffName)
    setStaffModalOpen(false)
    setShiftTypeModalOpen(true)
  }

  // シフトタイプ選択処理
  const handleShiftTypeSelect = (shiftType: string) => {
    if (!selectedDate || !selectedStaffName) return

    const staff = staffList.find(s => s.name === selectedStaffName)
    if (!staff) return

    const newAssignment: ShiftAssignment = {
      date: selectedDate,
      staffId: staff.id,
      staffName: selectedStaffName,
      shiftType,
      startTime: shiftType === '早番' ? '08:30' : shiftType === '遅番' ? '09:30' : shiftType === 'パート①' ? '08:30' : '11:00',
      endTime: shiftType === '早番' ? '17:30' : shiftType === '遅番' ? '18:30' : shiftType === 'パート①' ? '12:30' : '14:30'
    }
    
    setMockShift(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment]
    }))

    setShiftTypeModalOpen(false)
    setSelectedDate('')
    setSelectedStaffName('')
  }

  // シフト削除処理
  const handleRemoveShift = (shift: ShiftAssignment) => {
    if (isEditing) {
      setMockShift(prev => ({
        ...prev,
        assignments: prev.assignments.filter(a => 
          !(a.date === shift.date && a.staffId === shift.staffId && a.shiftType === shift.shiftType && a.startTime === shift.startTime)
        )
      }))
    }
  }

  // 週ごとのカレンダーデータを生成（6列版）
  const generateWeeklyCalendar = (): (number | null)[][] => {
    const weeks: (number | null)[][] = []
    let currentDate = 1
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDayOfWeek = getFirstDayOfWeek(currentMonth)
    
    const firstWeek: (number | null)[] = []
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // 0(日)→6, 1(月)→0
    
    // 前月の日付で埋める
    for (let i = 0; i < adjustedFirstDay; i++) {
      firstWeek.push(null)
    }
    
    // 第1週を6日分まで追加
    while (firstWeek.length < 6 && currentDate <= daysInMonth) {
      firstWeek.push(currentDate)
      currentDate++
    }
    weeks.push(firstWeek)
    
    // 残りの週を追加
    while (currentDate <= daysInMonth) {
      const week: (number | null)[] = []
      for (let i = 0; i < 6 && currentDate <= daysInMonth; i++) {
        week.push(currentDate)
        currentDate++
      }
      while (week.length < 6) {
        week.push(null)
      }
      weeks.push(week)
    }
    
    return weeks
  }

  const weeks = generateWeeklyCalendar()
  const today = new Date().toISOString().split('T')[0]

  const shiftCounts: Record<string, number> = {
    '早番': mockShift.assignments.filter((a: ShiftAssignment) => a.shiftType === '早番').length,
    '遅番': mockShift.assignments.filter((a: ShiftAssignment) => a.shiftType === '遅番').length,
    'パート①': mockShift.assignments.filter((a: ShiftAssignment) => a.shiftType === 'パート①').length,
    'パート②': mockShift.assignments.filter((a: ShiftAssignment) => a.shiftType === 'パート②').length,
  }

  return (
    <div className="space-y-4 pb-24"> {/* 下部タブバー分のmargin */}
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeMonth('prev')}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            ←
          </button>
          <h2 className="text-lg font-bold">
            {currentMonth.replace('-', '年')}月
          </h2>
          <button
            onClick={() => changeMonth('next')}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            →
          </button>
        </div>
        
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => canEdit ? setIsEditing(!isEditing) : alert('シフト編集の権限がありません（管理者のみ実行可能）')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isEditing 
                ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isEditing ? '📝 編集中' : '📝 編集'}
          </button>
        </div>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 曜日ヘッダー（6列） */}
        <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-300">
          {['月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={day} className={`p-2 text-center font-bold text-sm border-r border-gray-300 ${
              index === 5 ? 'text-blue-600 border-r-0' : 'text-gray-700'
            }`}>
              {day}
            </div>
          ))}
        </div>

        {/* 週別シフト表 */}
        <div>
          {weeks.map((week: (number | null)[], weekIndex: number) => (
            <div key={weekIndex} className="grid grid-cols-6 border-b border-gray-200 last:border-b-0">
              {week.map((day: number | null, dayIndex: number) => {
                if (day === null) {
                  return (
                    <div
                      key={dayIndex} 
                      className="bg-gray-100 border-r border-gray-200 last:border-r-0 w-full h-40"
                    />
                  )
                }

                const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
                const dayShifts = mockShift.assignments.filter((a: ShiftAssignment) => a.date === dateStr)
                const isToday = dateStr === today

                return (
                  <div
                    key={dayIndex}
                    className={`border-r border-gray-200 last:border-r-0 p-1 transition-all duration-200 overflow-hidden w-full h-40 ${
                      isToday ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'hover:bg-gray-50'
                    } ${isEditing ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                    onClick={() => handleCellClick(dateStr)}
                  >
                    {/* 日付表示 */}
                    <div className={`text-xs font-bold mb-1 ${
                      isToday ? 'text-yellow-800' : 'text-gray-700'
                    }`}>
                      {day}
                      {isEditing && (
                        <span className="ml-1 text-xs text-blue-600">✏️</span>
                      )}
                    </div>
                    
                    {/* シフト表示（PC版と同じ30分グリッドシステム） */}
                    <div 
                      className="relative w-full overflow-hidden"
                      style={{ height: '120px' }}
                    >
                      {sortShiftsByTime(dayShifts).map((shift: ShiftAssignment, index: number) => {
                        // 30分グリッドシステムで正確な位置計算
                        const { top, height } = calculateGridPosition(shift.startTime, shift.endTime)
                        
                        // 横位置計算（4人対応、モバイル用に調整）
                        const leftPosition = index * 22 // 22px間隔（4人対応）
                        
                        return (
                          <div
                            key={index}
                            className={`absolute text-xs p-1 rounded border cursor-pointer transition-all duration-200 ${getShiftColor(shift.shiftType)} ${
                              isEditing ? 'hover:opacity-75' : ''
                            } flex flex-col justify-center items-center`}
                            style={{ 
                              top: `${top}px`,
                              left: `${leftPosition}px`,
                              height: `${Math.max(height, 20)}px`, // 最小20px保証
                              width: '20px' // 幅を20pxに調整（4人表示用）
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isEditing) {
                                handleRemoveShift(shift)
                              }
                            }}
                            title={`${shift.startTime}～${shift.endTime} ${shift.staffName} ${isEditing ? '(タップで削除)' : ''}`}
                          >
                            <div className="text-center text-[8px] font-medium leading-tight">
                              {shift.startTime.split(':')[0]}:{shift.startTime.split(':')[1]}
                            </div>
                            <div className="text-center text-[8px] font-medium leading-tight">
                              ～
                            </div>
                            <div className="text-center text-[8px] font-medium leading-tight">
                              {shift.endTime.split(':')[0]}:{shift.endTime.split(':')[1]}
                            </div>
                            <div 
                              className="text-center font-bold leading-tight text-[7px] truncate mt-1"
                            >
                              {shift.staffName.length > 3 ? shift.staffName.substring(0, 3) : shift.staffName}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 統計情報（折りたたみ式） */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <button
          onClick={() => setStatsCollapsed(!statsCollapsed)}
          className="w-full flex items-center justify-between text-lg font-bold text-gray-800"
        >
          📊 統計・凡例
          <span className="text-xl">{statsCollapsed ? '▼' : '▲'}</span>
        </button>
        
        {!statsCollapsed && (
          <div className="mt-4 space-y-4">
            {/* シフト統計 */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">シフト統計</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(shiftCounts).map(([shiftType, count]: [string, number]) => (
                  <div key={shiftType} className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${getShiftColor(shiftType)}`}>
                      {shiftType}
                    </span>
                    <span className="font-semibold text-gray-700">{count}回</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 総労働時間 */}
            {mockShift.statistics && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">総労働時間</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(mockShift.statistics.totalHours).map(([staffId, hours]: [string, number]) => {
                    const staffName = staffList.find(s => s.id === staffId)?.name || staffId
                    return (
                      <div key={staffId} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{staffName}</span>
                        <span className="font-semibold text-gray-800">{hours}h</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* スタッフ選択モーダル */}
      {staffModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              スタッフを選択
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedDate}に配置するスタッフ
            </p>
            
            <div className="space-y-2">
              {staffList.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => handleStaffSelect(staff.name)}
                  className="w-full p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="font-semibold">{staff.name}</div>
                  <div className="text-xs text-gray-500">{staff.type}</div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setStaffModalOpen(false)}
              className="w-full mt-4 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* シフトタイプ選択モーダル */}
      {shiftTypeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              シフトタイプを選択
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedStaffName}を{selectedDate}に配置
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {['早番', '遅番', 'パート①', 'パート②'].map(shiftType => (
                <button
                  key={shiftType}
                  onClick={() => handleShiftTypeSelect(shiftType)}
                  className={`p-3 rounded-lg border hover:shadow-md transition-all duration-200 ${getShiftColor(shiftType)}`}
                >
                  <div className="font-semibold text-sm">{shiftType}</div>
                  <div className="text-xs mt-1">
                    {shiftType === '早番' ? '08:30-17:30' :
                     shiftType === '遅番' ? '09:30-18:30' :
                     shiftType === 'パート①' ? '08:30-12:30' : '11:00-14:30'}
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShiftTypeModalOpen(false)}
              className="w-full mt-4 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShiftCalendarMobile