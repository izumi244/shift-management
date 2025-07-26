import { useState } from 'react'

// 型定義
export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'aiGeneration' | 'shiftDisplay'

// コンポーネントのインポート
import ProgressBar from './components/ProgressBar'
import DataInputPage from './components/DataInputPage'
import EmployeeManagement from './components/EmployeeManagement'
import LeaveManagement from './components/LeaveManagement'
import RulesSettings from './components/RulesSettings'
import ShiftCalendar from './components/ShiftCalendar'

// データ収集関数
const collectDataForAI = (
  employees: any[],
  leaveRequests: any[],
  rulesData: any,
  targetMonth: string,
  specialRequests: string
) => {
  return {
    targetMonth,
    specialRequests,
    employees: employees || [],
    leaveRequests: leaveRequests || [],
    rules: rulesData || {
      clinicStartTime: "08:30",
      clinicEndTime: "18:30",
      clinicDays: ["月", "火", "水", "木", "金", "土"],
      weekdayStaffing: 4,
      wednesdayStaffing: 3,
      saturdayIdealStaffing: 4,
      maxConsecutiveDays: 5,
      fairRotation: true
    }
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dataInput')
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // 各種データの状態管理
  const [employees, setEmployees] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [rulesData, setRulesData] = useState({})
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)

  // PDF用のモックデータ
  const currentMonth = '2025-08'
  
  interface MockShiftData {
    date: string
    staffName: string
    shiftType: string
    startTime: string
    endTime: string
  }
  
  const mockShiftData: MockShiftData[] = [
    { date: '2025-08-01', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
    { date: '2025-08-01', staffName: '看護師B', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
    { date: '2025-08-01', staffName: 'パートA', shiftType: 'パート①', startTime: '08:30', endTime: '13:00' },
    { date: '2025-08-02', staffName: '看護師C', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
    { date: '2025-08-02', staffName: 'パートB', shiftType: 'パート②', startTime: '13:00', endTime: '18:30' },
    // 3日：ShiftCalendarと同じ4人のデータ
    { date: '2025-08-03', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
    { date: '2025-08-03', staffName: '看護師B', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
    { date: '2025-08-03', staffName: 'パートC', shiftType: 'パート①', startTime: '09:30', endTime: '14:00' },
    { date: '2025-08-03', staffName: 'パートB', shiftType: 'パート②', startTime: '13:00', endTime: '18:30' },
    { date: '2025-08-05', staffName: '看護師B', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
    { date: '2025-08-05', staffName: '看護師C', shiftType: 'パート②', startTime: '13:00', endTime: '18:30' },
    { date: '2025-08-06', staffName: 'パートA', shiftType: '遅番', startTime: '09:30', endTime: '18:30' },
    { date: '2025-08-06', staffName: 'パートB', shiftType: 'パート①', startTime: '08:30', endTime: '13:00' },
    { date: '2025-08-07', staffName: '看護師A', shiftType: '早番', startTime: '08:30', endTime: '17:30' },
    { date: '2025-08-07', staffName: 'パートC', shiftType: '遅番', startTime: '09:30', endTime: '18:30' }
  ]

  // ユーティリティ関数
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

  // PDF用30分グリッドシステム
  const timeToGridIndexPDF = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const baseHour = 8
    const baseMinute = 30
    
    const totalMinutes = (hours * 60 + minutes) - (baseHour * 60 + baseMinute)
    return Math.max(0, totalMinutes / 30)
  }

  const calculateGridPositionPDF = (startTime: string, endTime: string) => {
    const startIndex = timeToGridIndexPDF(startTime)
    const endIndex = timeToGridIndexPDF(endTime)
    const duration = endIndex - startIndex
    
    const cellHeight = 170 // PDF用シフト表示エリア170px（ShiftCalendarと同じ）
    const totalGrids = 20  // 8:30-18:30 = 10時間 = 20区切り
    const gridHeight = cellHeight / totalGrids // 1区切り = 8.5px
    
    return {
      top: Math.min(startIndex * gridHeight, cellHeight - 40), // 安全な上限（ShiftCalendarと同じ）
      height: Math.min(Math.max(duration * gridHeight, 25), cellHeight - (startIndex * gridHeight) - 15) // セル内確実収納
    }
  }

  const sortShiftsByTimePDF = (shifts: MockShiftData[]): MockShiftData[] => {
    return shifts.sort((a, b) => {
      const timeA = parseFloat(a.startTime.replace(':', '.').replace('30', '5'))
      const timeB = parseFloat(b.startTime.replace(':', '.').replace('30', '5'))
      return timeA - timeB
    })
  }

  // 統計データ
  const shiftCounts: Record<string, number> = {
    '早番': mockShiftData.filter((a: MockShiftData) => a.shiftType === '早番').length,
    '遅番': mockShiftData.filter((a: MockShiftData) => a.shiftType === '遅番').length,
    'パート①': mockShiftData.filter((a: MockShiftData) => a.shiftType === 'パート①').length,
    'パート②': mockShiftData.filter((a: MockShiftData) => a.shiftType === 'パート②').length,
  }

  // PDF用の週別カレンダー生成
  const generatePDFWeeks = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDayOfWeek = getFirstDayOfWeek(currentMonth)
    const weeks = []
    let currentDate = 1
    
    const firstWeek = []
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
      const week = []
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

  // ナビゲーション関数
  const navigateToPage = (page: Page) => {
    setCurrentPage(page)
    if (page === 'dataInput') setCurrentStep(1)
    else if (page === 'aiGeneration') setCurrentStep(2)
    else if (page === 'shiftDisplay') setCurrentStep(5)
  }

  const updateProgress = (step: number) => {
    setCurrentStep(step)
  }

  const handleAIGeneration = async (targetMonth: string, specialRequests: string) => {
    try {
      setIsLoading(true)
      updateProgress(2)
      setCurrentPage('aiGeneration')
      
      const data = collectDataForAI(employees, leaveRequests, rulesData, targetMonth, specialRequests)
      console.log('📊 収集したデータ:', data)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updateProgress(5)
      setCurrentPage('shiftDisplay')
    } catch (error) {
      console.error('❌ AI生成エラー:', error)
      alert('シフト生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // メニューアイテム
  const menuItems = [
    {
      id: 'dataInput' as Page,
      label: 'ダッシュボード',
      icon: '🏠',
      description: 'メインページ'
    },
    {
      id: 'employee' as Page,
      label: '従業員管理',
      icon: '👥',
      description: 'スタッフ情報管理'
    },
    {
      id: 'leave' as Page,
      label: '希望休管理',
      icon: '📅',
      description: '休暇申請管理'
    },
    {
      id: 'rules' as Page,
      label: '制約設定',
      icon: '⚙️',
      description: 'ルール・制約条件'
    },
    {
      id: 'shiftDisplay' as Page,
      label: 'シフト表',
      icon: '📋',
      description: '生成されたシフト'
    }
  ]

  const systemItems = [
    {
      label: '操作マニュアル',
      icon: '📖',
      action: () => window.open('https://docs.example.com', '_blank')
    },
    {
      label: 'ヘルプ・サポート',
      icon: '❓',
      action: () => alert('サポートページを開きます')
    },
    {
      label: 'お知らせ',
      icon: '🔔',
      action: () => alert('新しいお知らせはありません')
    },
    {
      label: 'データエクスポート',
      icon: '📤',
      action: () => alert('データエクスポート機能（準備中）')
    },
    {
      label: 'システム設定',
      icon: '🔧',
      action: () => alert('システム設定画面（準備中）')
    },
    {
      label: 'ログアウト',
      icon: '🚪',
      action: () => {
        if (confirm('ログアウトしますか？')) {
          alert('ログアウトしました')
        }
      }
    }
  ]

  const pdfWeeks = generatePDFWeeks()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 flex">
      {/* サイドバー */}
      <div className={`bg-white shadow-xl transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      } flex flex-col min-h-screen rounded-r-3xl`}>
        
        <div className="p-4 flex justify-end">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-lg"
            title={isSidebarCollapsed ? '展開' : '折りたたみ'}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pt-2">
            {!isSidebarCollapsed && (
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                メイン機能
              </h3>
            )}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateToPage(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600 hover:scale-105'
                  }`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <span className="text-xl mr-4">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-base">{item.label}</div>
                      <div className="text-sm opacity-75">{item.description}</div>
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 mt-6">
            {!isSidebarCollapsed && (
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                システム
              </h3>
            )}
            <nav className="space-y-2">
              {systemItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-100 hover:text-blue-600 transition-all duration-200 hover:scale-105"
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <span className="text-xl mr-4">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="flex-1 text-left text-base">{item.label}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-br-3xl">
          {!isSidebarCollapsed ? (
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Version 1.0.0</div>
              <div className="text-xs text-gray-400">© 2025 Shift System</div>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-xs text-gray-400">v1.0</span>
            </div>
          )}
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* ヘッダー */}
        <div className="w-full bg-white rounded-3xl shadow-lg p-6 mx-6 mt-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏥 シフト作成ツール
            </h1>
            <p className="text-gray-600">
              AI を活用した看護師シフト自動生成システム
            </p>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="w-full bg-white rounded-3xl shadow-lg p-4 mx-6 mt-4">
          <div className="w-full mx-auto">
            <ProgressBar currentStep={currentStep} />
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 p-6">
          <div className={currentPage === 'shiftDisplay' ? 'w-full mx-auto' : 'max-w-4xl mx-auto'}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[600px]">
              <div className="animate-fade-in">
                {currentPage === 'dataInput' && (
                  <DataInputPage 
                    onNavigate={navigateToPage}
                    onStartGeneration={handleAIGeneration}
                  />
                )}

                {currentPage === 'employee' && (
                  <EmployeeManagement 
                    onNavigate={navigateToPage}
                  />
                )}

                {currentPage === 'leave' && (
                  <LeaveManagement 
                    onNavigate={navigateToPage}
                  />
                )}

                {currentPage === 'rules' && (
                  <RulesSettings 
                    onNavigate={navigateToPage}
                  />
                )}

                {currentPage === 'aiGeneration' && (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6 animate-bounce">🤖</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      AIがシフトを生成中...
                    </h2>
                    <p className="text-gray-600 mb-8">
                      制約条件を考慮して最適なシフトを作成しています
                    </p>
                    <div className="w-full max-w-md mx-auto">
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full animate-pulse transition-all duration-1000"
                          style={{ width: '75%' }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      処理中... お待ちください
                    </div>
                  </div>
                )}

                {currentPage === 'shiftDisplay' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          🎉 シフト生成完了！
                        </h2>
                        <p className="text-gray-600">
                          AIが最適なシフトを作成しました
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button 
                          className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          onClick={() => setPdfPreviewOpen(true)}
                        >
                          📄 PDF出力
                        </button>
                        <button 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          onClick={() => navigateToPage('dataInput')}
                        >
                          🔄 新しいシフトを作成
                        </button>
                      </div>
                    </div>
                    <ShiftCalendar />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer className="w-full bg-white rounded-3xl shadow-lg p-4 mx-6 mb-6">
          <div className="w-full mx-auto text-center text-sm text-gray-500">
            <p>© 2025 AI Shift Management System - 看護師シフト自動生成システム</p>
          </div>
        </footer>
      </div>

      {/* PDFプレビューモーダル */}
      {pdfPreviewOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
            {/* PDFヘッダー */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">📄 PDF出力プレビュー</h3>
                <p className="text-sm opacity-90">印刷用シフトカレンダー</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
                >
                  🖨️ 印刷
                </button>
                <button
                  onClick={() => setPdfPreviewOpen(false)}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
                >
                  ✕ 閉じる
                </button>
              </div>
            </div>
            
            {/* PDFコンテンツ */}
            <div className="p-6 overflow-auto h-full bg-gray-50">
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🏥 シフトカレンダー
                  </h1>
                  <h2 className="text-2xl font-semibold text-purple-600 mb-2">
                    {currentMonth.replace('-', '年')}月
                  </h2>
                  <p className="text-gray-600">看護師シフト管理システム</p>
                  <p className="text-sm text-gray-500 mt-2">
                    出力日時: {new Date().toLocaleString('ja-JP')}
                  </p>
                </div>

                {/* 週別カレンダー */}
                <div className="mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* 曜日ヘッダー */}
                    <div className="grid grid-cols-6 bg-gray-100 border-b-2 border-gray-300">
                      {['月', '火', '水', '木', '金', '土'].map((day, index) => (
                        <div key={day} className={`p-3 text-center font-bold text-lg ${
                          index === 5 ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* 週別データ */}
                    <div>
                      {pdfWeeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-6 border-b border-gray-200 last:border-b-0">
                          {week.map((day, dayIndex) => {
                            if (day === null) {
                              return (
                                <div 
                                  key={dayIndex} 
                                  className="bg-gray-100 border-r border-gray-200 last:border-r-0"
                                  style={{ height: '220px' }}
                                />
                              )
                            }

                            const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
                            const dayShifts = mockShiftData.filter((shift: MockShiftData) => shift.date === dateStr)
                            const isToday = dateStr === today

                            return (
                              <div 
                                key={dayIndex}
                                className={`border-r border-gray-200 last:border-r-0 p-2 ${
                                  isToday ? 'bg-yellow-100' : 'bg-white'
                                }`}
                                style={{ height: '220px' }}
                              >
                                <div className="text-sm font-bold mb-1 text-gray-700">
                                  {day}
                                </div>
                                
                                {/* 30分グリッドシステムでシフト表示（ShiftCalendarと完全統一） */}
                                <div 
                                  className="relative w-full overflow-hidden"
                                  style={{ height: '170px' }}
                                >
                                  {sortShiftsByTimePDF(dayShifts).map((shift: MockShiftData, index: number) => {
                                    const { top, height } = calculateGridPositionPDF(shift.startTime, shift.endTime)
                                    const leftPosition = index * 45 // 45px間隔（ShiftCalendarと同じ）
                                    
                                    return (
                                      <div
                                        key={index}
                                        className={`absolute text-xs p-1 rounded border cursor-pointer transition-all duration-200 ${getShiftColor(shift.shiftType)} flex flex-col justify-center items-center`}
                                        style={{ 
                                          top: `${top}px`,
                                          left: `${leftPosition}px`,
                                          height: `${Math.max(height, 25)}px`, 
                                          width: '42px' // ShiftCalendarと同じ幅
                                        }}
                                        title={`${shift.startTime}～${shift.endTime} ${shift.staffName}`}
                                      >
                                        <div className="text-center text-xs font-medium leading-tight">
                                          {shift.startTime}～{shift.endTime}
                                        </div>
                                        <div className="text-center font-bold leading-tight mt-1 truncate text-xs">
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

                {/* 統計・凡例 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 シフト統計</h3>
                    <div className="space-y-3">
                      {Object.entries(shiftCounts).map(([shiftType, count]: [string, number]) => (
                        <div key={shiftType} className="flex justify-between items-center">
                          <span className={`px-3 py-1 rounded text-sm font-medium ${getShiftColor(shiftType)}`}>
                            {shiftType}
                          </span>
                          <span className="font-bold text-gray-700">{count}回</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">🏷️ シフト凡例</h3>
                    <div className="space-y-2">
                      <div className={`p-2 rounded border text-sm font-medium ${getShiftColor('早番')}`}>
                        早番 (08:30-17:30)
                      </div>
                      <div className={`p-2 rounded border text-sm font-medium ${getShiftColor('遅番')}`}>
                        遅番 (09:30-18:30)
                      </div>
                      <div className={`p-2 rounded border text-sm font-medium ${getShiftColor('パート①')}`}>
                        パート① (08:30-13:00/14:00)
                      </div>
                      <div className={`p-2 rounded border text-sm font-medium ${getShiftColor('パート②')}`}>
                        パート② (13:00-18:30)
                      </div>
                    </div>
                  </div>
                </div>

                {/* フッター */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-500">
                  <p>© 2025 AI Shift Management System - 看護師シフト自動生成システム</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App