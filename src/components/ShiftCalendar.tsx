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

interface ShiftCalendarProps {
  isMobile: boolean
}

const ShiftCalendar: FC<ShiftCalendarProps> = ({ isMobile }) => {
  const [currentMonth, setCurrentMonth] = useState('2025-08')
  const [isEditing, setIsEditing] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [draggedStaff, setDraggedStaff] = useState<string | null>(null)
  const [dragOverCell, setDragOverCell] = useState<string | null>(null)
  const [shiftTypeModalOpen, setShiftTypeModalOpen] = useState(false)
  const [pendingDrop, setPendingDrop] = useState<{ date: string, staffName: string } | null>(null)
  const [statsCollapsed, setStatsCollapsed] = useState(isMobile) // スマホでは初期状態で折りたたみ
  
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
      // 3日
      { date: '2025-08-03', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-03', staffId: 'N002', staffName: '看護師B', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-03', staffId: 'P003', staffName: 'パートC', shiftType: 'パート①', startTime: '08:30', endTime: '12:30' },
      { date: '2025-08-03', staffId: 'P002', staffName: 'パートB', shiftType: 'パート②', startTime: '11:00', endTime: '14:30' },
      // 5日
      { date: '2025-08-05', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-05', staffId: 'N003', staffName: '看護師C', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-05', staffId: 'P001', staffName: 'パートA', shiftType: 'パート①', startTime: '08:30', endTime: '12:30' },
      { date: '2025-08-05', staffId: 'P002', staffName: 'パートB', shiftType: 'パート②', startTime: '11:00', endTime: '14:30' },
      // 6日
      { date: '2025-08-06', staffId: 'N002', staffName: '看護師B', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-06', staffId: 'N003', staffName: '看護師C', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-06', staffId: 'P003', staffName: 'パートC', shiftType: 'パート①', startTime: '08:30', endTime: '12:30' },
      { date: '2025-08-06', staffId: 'P001', staffName: 'パートA', shiftType: 'パート②', startTime: '11:00', endTime: '14:30' },
      // 7日
      { date: '2025-08-07', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-07', staffId: 'P003', staffName: 'パートC', shiftType: '遅番', startTime: '09:30', endTime: '18:30' }
    ],
    statistics: {
      totalHours: {
        'N001': 27,
        'N002': 27,
        'N003': 22.5,
        'P001': 11.5,
        'P002': 10.5,
        'P003': 16
      },
      violations: []
    }
  })

  // 制約設定のシフトルール（制約設定との連携は後回しタスク）
  const [shiftRules, setShiftRules] = useState({
    part1DefaultEnd: '12:30',
    part1EndOptions: ['12:30', '13:00'],
    part2Start: '11:00',
    part2End: '14:30'
  })

  // ユーティリティ関数
  const sortShiftsByTime = (shifts: ShiftAssignment[]): ShiftAssignment[] => {
    return shifts.sort((a, b) => {
      const timeA = parseFloat(a.startTime.replace(':', '.').replace('30', '5'))
      const timeB = parseFloat(b.startTime.replace(':', '.').replace('30', '5'))
      return timeA - timeB
    })
  }

  const getDaysInMonth = (monthStr: string): number => {
    const [year, month] = monthStr.split('-').map(Number)
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfWeek = (monthStr: string): number => {
    const [year, month] = monthStr.split('-').map(Number)
    return new Date(year, month - 1, 1).getDay()
  }

  const formatDateForDisplay = (monthStr: string): string => {
    const [year, month] = monthStr.split('-').map(Number)
    return `${year}年${month.toString().padStart(2, '0')}月`
  }

  const getAssignmentsForDate = (date: string): ShiftAssignment[] => {
    return sortShiftsByTime(mockShift.assignments.filter(a => a.date === date))
  }

  // 月の変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number)
    if (direction === 'prev') {
      if (month === 1) {
        setCurrentMonth(`${year - 1}-12`)
      } else {
        setCurrentMonth(`${year}-${(month - 1).toString().padStart(2, '0')}`)
      }
    } else {
      if (month === 12) {
        setCurrentMonth(`${year + 1}-01`)
      } else {
        setCurrentMonth(`${year}-${(month + 1).toString().padStart(2, '0')}`)
      }
    }
  }

  // 編集機能
  const handleEditToggle = () => {
    if (!canEdit) {
      alert('シフト編集権限がありません（管理者のみ実行可能）')
      return
    }
    setIsEditing(!isEditing)
  }

  const handleDragStart = (staffName: string) => {
    if (isEditing) {
      setDraggedStaff(staffName)
    }
  }

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    setDragOverCell(dateStr)
  }

  const handleDragLeave = () => {
    setDragOverCell(null)
  }

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    if (draggedStaff && isEditing) {
      setPendingDrop({ date: dateStr, staffName: draggedStaff })
      setShiftTypeModalOpen(true)
    }
    setDraggedStaff(null)
    setDragOverCell(null)
  }

  const handleShiftTypeSelectWithTime = (shiftType: string, endTime?: string) => {
    if (!pendingDrop) return

    const newAssignment: ShiftAssignment = {
      date: pendingDrop.date,
      staffId: 'NEW',
      staffName: pendingDrop.staffName,
      shiftType: endTime ? `${shiftType} (${endTime}終了)` : shiftType,
      startTime: shiftType === '早番' ? '08:30' : shiftType === '遅番' ? '09:30' : shiftType === 'パート①' ? '08:30' : '11:00',
      endTime: shiftType === '早番' ? '17:30' : shiftType === '遅番' ? '18:30' : shiftType === 'パート①' ? (endTime || shiftRules.part1DefaultEnd) : shiftRules.part2End
    }
    
    setMockShift(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment]
    }))

    setShiftTypeModalOpen(false)
    setPendingDrop(null)
  }

  const handleCellClick = (dateStr: string) => {
    if (isEditing && !draggedStaff && isMobile) {
      setSelectedDate(dateStr)
      setEditModalOpen(true)
    }
  }

  const handleRemoveShift = (dateStr: string, shift: ShiftAssignment) => {
    if (isEditing) {
      setMockShift(prev => ({
        ...prev,
        assignments: prev.assignments.filter(a => 
          !(a.date === shift.date && a.staffId === shift.staffId && a.shiftType === shift.shiftType && a.startTime === shift.startTime)
        )
      }))
    }
  }

  // 週ごとのカレンダーデータを生成
  const generateWeeklyCalendar = (): (number | null)[][] => {
    const weeks: (number | null)[][] = []
    let currentDate = 1
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDayOfWeek = getFirstDayOfWeek(currentMonth)
    
    const firstWeek: (number | null)[] = []
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    for (let i = 0; i < adjustedFirstDay; i++) {
      firstWeek.push(null)
    }

    for (let i = adjustedFirstDay; i < 7; i++) {
      if (currentDate <= daysInMonth) {
        firstWeek.push(currentDate)
        currentDate++
      }
    }
    weeks.push(firstWeek)

    while (currentDate <= daysInMonth) {
      const week: (number | null)[] = []
      for (let i = 0; i < 7; i++) {
        if (currentDate <= daysInMonth) {
          week.push(currentDate)
          currentDate++
        } else {
          week.push(null)
        }
      }
      weeks.push(week)
    }

    return weeks
  }

  const weeks = generateWeeklyCalendar()

  // シフト統計の折りたたみコンポーネント
  const StatsSection = () => (
    <div className={`bg-gray-50 rounded-xl ${isMobile ? 'mt-4' : 'p-6'}`}>
      {/* 折りたたみヘッダー */}
      <div 
        className={`flex justify-between items-center cursor-pointer ${isMobile ? 'p-4' : 'mb-4'}`}
        onClick={() => setStatsCollapsed(!statsCollapsed)}
      >
        <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-lg'}`}>
          📊 シフト統計・総労働時間
        </h3>
        <button className="text-gray-600 hover:text-gray-800">
          {statsCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* 統計コンテンツ */}
      {!statsCollapsed && (
        <div className={`space-y-4 ${isMobile ? 'px-4 pb-4' : ''}`}>
          {/* シフト凡例 */}
          <div>
            <h4 className={`font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>シフト凡例</h4>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2 text-xs' : 'grid-cols-4 text-sm'}`}>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span>早番 (08:30～17:30)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span>遅番 (09:30～18:30)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>パート① (08:30～{shiftRules.part1DefaultEnd})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-400 rounded"></div>
                <span>パート② ({shiftRules.part2Start}～{shiftRules.part2End})</span>
              </div>
            </div>
          </div>

          {/* 総労働時間 */}
          <div>
            <h4 className={`font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>総労働時間（週計）</h4>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2 text-xs' : 'grid-cols-3 text-sm'}`}>
              {Object.entries(mockShift.statistics?.totalHours || {}).map(([staff, hours]) => (
                <div key={staff} className="flex justify-between bg-white p-2 rounded">
                  <span>{staff}</span>
                  <span className="font-medium">{hours}時間</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // スマホ版レイアウト
  if (isMobile) {
    return (
      <div className="w-full">
        {/* スマホ版ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-purple-600">
            {formatDateForDisplay(currentMonth)} シフトカレンダー
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => changeMonth('prev')}
              className="p-2 text-gray-600 hover:text-purple-600"
            >
              ←
            </button>
            <button 
              onClick={() => changeMonth('next')}
              className="p-2 text-gray-600 hover:text-purple-600"
            >
              →
            </button>
            <button
              onClick={handleEditToggle}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {isEditing ? '完了' : '編集'}
            </button>
          </div>
        </div>

        {/* スマホ版カレンダー */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 bg-gray-50">
            {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダー本体 */}
          <div className="grid grid-cols-7">
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const dateStr = day ? `${currentMonth}-${day.toString().padStart(2, '0')}` : ''
                const assignments = day ? getAssignmentsForDate(dateStr) : []
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`border-r border-b border-gray-200 last:border-r-0 min-h-[80px] p-1 ${
                      day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    } ${dragOverCell === dateStr ? 'bg-blue-100' : ''}`}
                    onClick={() => day && handleCellClick(dateStr)}
                    onDragOver={(e) => day && handleDragOver(e, dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => day && handleDrop(e, dateStr)}
                  >
                    {day && (
                      <>
                        <div className="text-xs font-medium text-gray-800 mb-1">{day}</div>
                        <div className="space-y-1">
                          {assignments.map((assignment, idx) => {
                            const gridHeight = 15
                            const startHour = parseFloat(assignment.startTime.replace(':', '.').replace('30', '5'))
                            const endHour = parseFloat(assignment.endTime.replace(':', '.').replace('30', '5'))
                            const duration = endHour - startHour

                            const getShiftColor = (shiftType: string) => {
                              if (shiftType.includes('早番')) return 'bg-blue-400 text-white'
                              if (shiftType.includes('遅番')) return 'bg-green-400 text-white'
                              if (shiftType.includes('パート①')) return 'bg-yellow-400 text-black'
                              if (shiftType.includes('パート②')) return 'bg-purple-400 text-white'
                              return 'bg-gray-400 text-white'
                            }

                            const displayName = assignment.staffName.replace('看護師', '').replace('パート', 'P')

                            return (
                              <div
                                key={idx}
                                className={`rounded text-center cursor-pointer relative group ${getShiftColor(assignment.shiftType)}`}
                                style={{
                                  height: Math.min(Math.max(duration * gridHeight, 25), 40),
                                  marginBottom: 2
                                }}
                                title={`${assignment.startTime}～${assignment.endTime} ${assignment.staffName} (${assignment.shiftType})`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isEditing) handleRemoveShift(dateStr, assignment)
                                }}
                              >
                                <div className="text-[8px] leading-tight pt-0.5">
                                  <div className="font-medium">{displayName}</div>
                                  <div className="text-[7px] opacity-90">
                                    {assignment.startTime.slice(0, 5)}
                                  </div>
                                </div>
                                {isEditing && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    ×
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* スマホ版統計情報 */}
        <StatsSection />

        {/* モーダル類 */}
        {shiftTypeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">シフト選択</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleShiftTypeSelectWithTime('早番')}
                  className="w-full p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
                >
                  早番 (08:30-17:30)
                </button>
                <button
                  onClick={() => handleShiftTypeSelectWithTime('遅番')}
                  className="w-full p-3 bg-green-400 text-white rounded-lg hover:bg-green-500"
                >
                  遅番 (09:30-18:30)
                </button>
                <button
                  onClick={() => handleShiftTypeSelectWithTime('パート①', '12:30')}
                  className="w-full p-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
                >
                  パート① (08:30-12:30)
                </button>
                <button
                  onClick={() => handleShiftTypeSelectWithTime('パート①', '13:00')}
                  className="w-full p-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
                >
                  パート① (08:30-13:00)
                </button>
                <button
                  onClick={() => handleShiftTypeSelectWithTime('パート②')}
                  className="w-full p-3 bg-purple-400 text-white rounded-lg hover:bg-purple-500"
                >
                  パート② (11:00-14:30)
                </button>
                <button
                  onClick={() => setShiftTypeModalOpen(false)}
                  className="w-full p-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // PC版レイアウト（既存のまま）
  return (
    <div className="w-full">
      {/* PC版ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-600">
          {formatDateForDisplay(currentMonth)} シフトカレンダー
        </h2>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => changeMonth('prev')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← 前月
          </button>
          <button 
            onClick={() => changeMonth('next')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            次月 →
          </button>
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isEditing 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isEditing ? '編集完了' : '編集モード'}
          </button>
          <button
            onClick={() => alert('PDF出力機能（準備中）')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            📄 PDF出力
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        {/* PC版メインカレンダー */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50">
              {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                <div key={day} className="p-4 text-center font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  const dateStr = day ? `${currentMonth}-${day.toString().padStart(2, '0')}` : ''
                  const assignments = day ? getAssignmentsForDate(dateStr) : []
                  
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`border-r border-b border-gray-200 last:border-r-0 min-h-[120px] p-2 ${
                        day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                      } ${dragOverCell === dateStr ? 'bg-blue-100' : ''}`}
                      onClick={() => day && handleCellClick(dateStr)}
                      onDragOver={(e) => day && handleDragOver(e, dateStr)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => day && handleDrop(e, dateStr)}
                    >
                      {day && (
                        <>
                          <div className="text-sm font-medium text-gray-800 mb-2">{day}</div>
                          <div className="space-y-1">
                            {assignments.map((assignment, idx) => {
                              const gridHeight = 15
                              const startHour = parseFloat(assignment.startTime.replace(':', '.').replace('30', '5'))
                              const endHour = parseFloat(assignment.endTime.replace(':', '.').replace('30', '5'))
                              const duration = endHour - startHour

                              const getShiftColor = (shiftType: string) => {
                                if (shiftType.includes('早番')) return 'bg-blue-400 text-white'
                                if (shiftType.includes('遅番')) return 'bg-green-400 text-white'
                                if (shiftType.includes('パート①')) return 'bg-yellow-400 text-black'
                                if (shiftType.includes('パート②')) return 'bg-purple-400 text-white'
                                return 'bg-gray-400 text-white'
                              }

                              return (
                                <div
                                  key={idx}
                                  className={`rounded text-center cursor-pointer relative group ${getShiftColor(assignment.shiftType)}`}
                                  style={{
                                    height: Math.min(Math.max(duration * gridHeight, 30), 50),
                                    marginBottom: 5
                                  }}
                                  title={`${assignment.startTime}～${assignment.endTime} ${assignment.staffName} (${assignment.shiftType})`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (isEditing) handleRemoveShift(dateStr, assignment)
                                  }}
                                >
                                  <div className="text-[9px] leading-tight pt-1">
                                    <div className="font-medium">{assignment.startTime}</div>
                                    <div className="font-medium">{assignment.staffName}</div>
                                  </div>
                                  {isEditing && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      ×
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* PC版サイドパネル */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* 従業員リスト */}
          {isEditing && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">👥 スタッフ</h3>
              <div className="space-y-2">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    draggable={isEditing}
                    onDragStart={() => handleDragStart(staff.name)}
                    className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-sm">{staff.name}</div>
                    <div className="text-xs text-gray-600">{staff.type}</div>
                    <div className="text-xs text-blue-600">
                      {staff.shifts.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PC版統計情報 */}
          <StatsSection />
        </div>
      </div>

      {/* PC版モーダル類 */}
      {shiftTypeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">シフトタイプを選択</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleShiftTypeSelectWithTime('早番')}
                className="p-4 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                早番 (08:30-17:30)
              </button>
              <button
                onClick={() => handleShiftTypeSelectWithTime('遅番')}
                className="p-4 bg-green-400 text-white rounded-lg hover:bg-green-500 transition-colors"
              >
                遅番 (09:30-18:30)
              </button>
              <button
                onClick={() => handleShiftTypeSelectWithTime('パート①', '12:30')}
                className="p-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
              >
                パート① (08:30-12:30)
              </button>
              <button
                onClick={() => handleShiftTypeSelectWithTime('パート①', '13:00')}
                className="p-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
              >
                パート① (08:30-13:00)
              </button>
              <button
                onClick={() => handleShiftTypeSelectWithTime('パート②')}
                className="p-4 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors"
              >
                パート② (11:00-14:30)
              </button>
              <button
                onClick={() => setShiftTypeModalOpen(false)}
                className="p-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors mt-2"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShiftCalendar