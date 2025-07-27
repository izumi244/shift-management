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

const ShiftCalendar: FC = () => {
  const [currentMonth, setCurrentMonth] = useState('2025-08')
  const [isEditing, setIsEditing] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [draggedStaff, setDraggedStaff] = useState<string | null>(null)
  const [dragOverCell, setDragOverCell] = useState<string | null>(null)
  const [shiftTypeModalOpen, setShiftTypeModalOpen] = useState(false)
  const [pendingDrop, setPendingDrop] = useState<{ date: string, staffName: string } | null>(null)
  
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

  // モックデータ（計算例通りに修正）
  const [mockShift, setMockShift] = useState<GeneratedShift>({
    month: currentMonth,
    assignments: [
      { date: '2025-08-01', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-01', staffId: 'N002', staffName: '看護師B', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-01', staffId: 'P001', staffName: 'パートA', shiftType: 'パート①', startTime: '08:30', endTime: '13:00' },
      { date: '2025-08-02', staffId: 'N003', staffName: '看護師C', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-02', staffId: 'P002', staffName: 'パートB', shiftType: 'パート②', startTime: '13:00', endTime: '18:30' },
      // 3日：計算例通りのデータ
      { date: '2025-08-03', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-03', staffId: 'N002', staffName: '看護師B', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-03', staffId: 'P003', staffName: 'パートC', shiftType: 'パート①', startTime: '09:30', endTime: '14:00' },
      { date: '2025-08-03', staffId: 'P002', staffName: 'パートB', shiftType: 'パート②', startTime: '14:00', endTime: '18:30' },
      // 5日
      { date: '2025-08-05', staffId: 'N001', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-05', staffId: 'N003', staffName: '看護師C', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-05', staffId: 'P001', staffName: 'パートA', shiftType: 'パート①', startTime: '08:30', endTime: '13:00' },
      { date: '2025-08-05', staffId: 'P002', staffName: 'パートB', shiftType: 'パート②', startTime: '13:00', endTime: '18:30' },
      // 6日
      { date: '2025-08-06', staffId: 'N002', staffName: '看護師B', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
      { date: '2025-08-06', staffId: 'N003', staffName: '看護師C', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
      { date: '2025-08-06', staffId: 'P003', staffName: 'パートC', shiftType: 'パート①', startTime: '09:30', endTime: '14:00' },
      { date: '2025-08-06', staffId: 'P001', staffName: 'パートA', shiftType: 'パート②', startTime: '14:00', endTime: '18:30' },
      // 7日
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

  // ユーティリティ関数
  const sortShiftsByTime = (shifts: ShiftAssignment[]): ShiftAssignment[] => {
    return shifts.sort((a, b) => {
      const timeA = parseFloat(a.startTime.replace(':', '.').replace('30', '5'))
      const timeB = parseFloat(b.startTime.replace(':', '.').replace('30', '5'))
      return timeA - timeB
    })
  }

  // 30分区切りグリッドシステム（完璧版）
  const timeToGridIndex = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    // 8:30を0とする基準で計算
    const baseHour = 8
    const baseMinute = 30
    
    const totalMinutes = (hours * 60 + minutes) - (baseHour * 60 + baseMinute)
    return Math.max(0, totalMinutes / 30) // 30分毎の区切り
  }

  // グリッド位置計算（完璧なセル内収納）
  const calculateGridPosition = (startTime: string, endTime: string) => {
    const startIndex = timeToGridIndex(startTime)
    const endIndex = timeToGridIndex(endTime)
    const duration = endIndex - startIndex
    
    const cellHeight = 170 // シフト表示エリア170px（セル220px - 日付・パディング50px）
    const totalGrids = 20  // 8:30-18:30 = 10時間 = 20区切り
    const gridHeight = cellHeight / totalGrids // 1区切り = 8.5px
    
    return {
      top: Math.min(startIndex * gridHeight, cellHeight - 40), // 安全な上限
      height: Math.min(Math.max(duration * gridHeight, 25), cellHeight - (startIndex * gridHeight) - 15) // セル内確実収納
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

  // 文字数に応じた動的フォントサイズ調整
  const getNameFontSize = (name: string): { className: string, style?: React.CSSProperties } => {
    if (name.length <= 4) {
      return { className: 'text-xs' }
    } else if (name.length <= 6) {
      return { className: 'text-xs', style: { fontSize: '10px' } }
    } else {
      return { className: 'text-xs', style: { fontSize: '9px' } }
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

  // ドラッグ&ドロップ関連の関数
  const handleDragStart = (e: React.DragEvent, staffName: string) => {
    if (!canEdit) {
      e.preventDefault()
      alert('シフト編集の権限がありません（管理者のみ実行可能）')
      return
    }
    setDraggedStaff(staffName)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    setDragOverCell(dateStr)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverCell(null)
  }

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    setDragOverCell(null)
    
    if (draggedStaff) {
      setPendingDrop({ date: dateStr, staffName: draggedStaff })
      setShiftTypeModalOpen(true)
      setDraggedStaff(null)
    }
  }

  const handleShiftTypeSelect = (shiftType: string) => {
    if (!pendingDrop) return

    const newAssignment: ShiftAssignment = {
      date: pendingDrop.date,
      staffId: staffList.find(s => s.name === pendingDrop.staffName)?.id || '',
      staffName: pendingDrop.staffName,
      shiftType,
      startTime: shiftType === '早番' ? '08:30' : shiftType === '遅番' ? '09:30' : shiftType === 'パート①' ? '08:30' : '13:00',
      endTime: shiftType === '早番' ? '17:30' : shiftType === '遅番' ? '18:30' : shiftType === 'パート①' ? '13:00' : '18:30'
    }
    
    setMockShift(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment]
    }))

    setShiftTypeModalOpen(false)
    setPendingDrop(null)
  }

  const handleCellClick = (dateStr: string) => {
    if (isEditing && !draggedStaff) {
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
    
    while (firstWeek.length < 6 && currentDate <= daysInMonth) {
      firstWeek.push(currentDate)
      currentDate++
    }
    weeks.push(firstWeek)
    
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
    <div className="space-y-6">
      {/* カレンダーヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeMonth('prev')}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            ← 前月
          </button>
          <h2 className="text-2xl font-bold">
            {currentMonth.replace('-', '年')}月 シフトカレンダー
          </h2>
          <button
            onClick={() => changeMonth('next')}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            次月 →
          </button>
        </div>
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => canEdit ? setIsEditing(!isEditing) : alert('シフト編集の権限がありません（管理者のみ実行可能）')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isEditing 
                ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isEditing ? '📝 編集モード' : '📝 編集モード'}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        {/* カレンダー部分 */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-6 bg-gray-50 border-b-2 border-gray-300">
              {['月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div key={day} className={`p-4 text-center font-bold text-lg border-r border-gray-300 ${
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
                          className="bg-gray-100 border-r border-gray-200 last:border-r-0 w-full"
                          style={{ height: '220px', minHeight: '220px', maxHeight: '220px' }}
                        />
                      )
                    }

                    const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
                    const dayShifts = mockShift.assignments.filter((a: ShiftAssignment) => a.date === dateStr)
                    const isToday = dateStr === today
                    const isDragOver = dragOverCell === dateStr

                    return (
                      <div
                        key={dayIndex}
                        className={`border-r border-gray-200 last:border-r-0 p-2 transition-all duration-200 overflow-hidden w-full ${
                          isToday ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'hover:bg-gray-50'
                        } ${isEditing ? 'cursor-pointer hover:bg-blue-50' : ''} ${
                          isDragOver ? 'bg-green-100 ring-2 ring-green-400' : ''
                        }`}
                        style={{ height: '220px', minHeight: '220px', maxHeight: '220px' }}
                        onClick={() => handleCellClick(dateStr)}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, dateStr)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, dateStr)}
                      >
                        {/* 日付表示 */}
                        <div className={`text-sm font-bold mb-1 ${
                          isToday ? 'text-yellow-800' : 'text-gray-700'
                        }`}>
                          {day}
                          {isEditing && (
                            <span className="ml-1 text-xs text-blue-600">
                              {isDragOver ? '📍' : '✏️'}
                            </span>
                          )}
                        </div>
                        
                        {/* シフト表示 - 30分グリッドシステム */}
                        <div 
                          className="relative w-full overflow-hidden"
                          style={{ height: '170px' }}
                        >
                          {sortShiftsByTime(dayShifts).map((shift: ShiftAssignment, index: number) => {
                            // 30分グリッドシステムで正確な位置計算
                            const { top, height } = calculateGridPosition(shift.startTime, shift.endTime)
                            
                            // シンプルに配列のindexを使って横位置計算
                            const leftPosition = index * 45 // 45px間隔（4人対応）
                            
                            return (
                              <div
                                key={index}
                                className={`absolute text-xs p-1 rounded border cursor-pointer transition-all duration-200 ${getShiftColor(shift.shiftType)} ${
                                  isEditing ? 'hover:opacity-75 hover:scale-105' : ''
                                } flex flex-col justify-center items-center`}
                                style={{ 
                                  top: `${top}px`,
                                  left: `${leftPosition}px`,
                                  height: `${Math.max(height, 25)}px`, // 最小25px保証
                                  width: '42px' // 幅を42pxに調整（重複回避）
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isEditing) {
                                    handleRemoveShift(dateStr, shift)
                                  }
                                }}
                                title={`${shift.startTime}～${shift.endTime} ${shift.staffName} (${isEditing ? 'クリックで削除' : ''})`}
                              >
                                <div className="text-center text-xs font-medium leading-tight">
                                  {shift.startTime}～{shift.endTime}
                                </div>
                                <div 
                                  className={`text-center font-bold leading-tight mt-1 truncate ${getNameFontSize(shift.staffName).className}`}
                                  style={getNameFontSize(shift.staffName).style}
                                >
                                  {shift.staffName}
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
        </div>

        {/* サイドパネル */}
        <div className="w-64 flex-shrink-0 space-y-6">
          {/* 統計情報 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 シフト統計</h3>
            <div className="space-y-3">
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

          {/* 従業員リスト（編集モード時）または凡例 */}
          {isEditing && canEdit ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">👥 従業員リスト</h3>
              <p className="text-sm text-gray-600 mb-4">ドラッグしてカレンダーにドロップ</p>
              <div className="space-y-2">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, staff.name)}
                    className={`p-3 border-2 border-dashed rounded-xl cursor-move transition-all duration-200 ${
                      draggedStaff === staff.name 
                        ? 'border-blue-500 bg-blue-50 opacity-50 scale-95' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'
                    } ${staff.type === '常勤' ? 'bg-blue-25' : 'bg-purple-25'}`}
                    title="ドラッグしてカレンダーに配置"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{staff.name}</div>
                        <div className="text-xs text-gray-500">{staff.type}</div>
                      </div>
                      <div className="text-2xl">
                        {staff.type === '常勤' ? '👩‍⚕️' : '👩‍💼'}
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {staff.shifts.map((shift: string) => (
                        <span key={shift} className={`px-1 py-0.5 text-xs rounded ${getShiftColor(shift)}`}>
                          {shift}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🏷️ シフト凡例</h3>
              <div className="space-y-2">
                <div className={`p-2 rounded border text-sm ${getShiftColor('早番')}`}>
                  早番 (08:30～17:30)
                </div>
                <div className={`p-2 rounded border text-sm ${getShiftColor('遅番')}`}>
                  遅番 (09:30～18:30)
                </div>
                <div className={`p-2 rounded border text-sm ${getShiftColor('パート①')}`}>
                  パート① (08:30～13:00/14:00)
                </div>
                <div className={`p-2 rounded border text-sm ${getShiftColor('パート②')}`}>
                  パート② (13:00～18:30)
                </div>
              </div>
            </div>
          )}

          {/* 総労働時間 */}
          {!isEditing && mockShift.statistics && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⏰ 総労働時間</h3>
              <div className="space-y-2">
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
      </div>

      {/* シフトタイプ選択モーダル */}
      {shiftTypeModalOpen && pendingDrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              シフトタイプを選択
            </h3>
            <p className="text-gray-600 mb-6">
              {pendingDrop.staffName}を{pendingDrop.date}に配置
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {['早番', '遅番', 'パート①', 'パート②'].map(shiftType => (
                <button
                  key={shiftType}
                  onClick={() => handleShiftTypeSelect(shiftType)}
                  className={`p-4 rounded-xl border-2 hover:shadow-md transition-all duration-200 ${getShiftColor(shiftType)}`}
                >
                  <div className="font-semibold">{shiftType}</div>
                  <div className="text-xs mt-1">
                    {shiftType === '早番' ? '08:30-17:30' :
                     shiftType === '遅番' ? '09:30-18:30' :
                     shiftType === 'パート①' ? '08:30-13:00' : '13:00-18:30'}
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setShiftTypeModalOpen(false)
                setPendingDrop(null)
              }}
              className="w-full mt-4 bg-gray-500 text-white py-2 rounded-xl hover:bg-gray-600 transition-colors duration-200"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              シフト編集
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedDate}のシフト
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockShift.assignments
                .filter(a => a.date === selectedDate)
                .map((shift, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getShiftColor(shift.shiftType)}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{shift.staffName}</div>
                        <div className="text-sm">{shift.shiftType} ({shift.startTime}-{shift.endTime})</div>
                      </div>
                      <button
                        onClick={() => {
                          handleRemoveShift(selectedDate, shift)
                          setEditModalOpen(false)
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">スタッフ選択</label>
                <div className="grid grid-cols-2 gap-2">
                  {staffList.map((staff) => (
                    <button
                      key={staff.id}
                      className="p-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => {
                        setPendingDrop({ date: selectedDate, staffName: staff.name })
                        setEditModalOpen(false)
                        setShiftTypeModalOpen(true)
                      }}
                    >
                      {staff.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => setEditModalOpen(false)}
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

export default ShiftCalendar