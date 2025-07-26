import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'

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

// メインアプリケーションコンポーネント（ログイン後の画面）
const MainApp = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dataInput')
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // 各種データの状態管理
  const [employees, setEmployees] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [rulesData, setRulesData] = useState({})
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)

  // 認証情報を取得
  const { user, logout, hasPermission } = useAuth()
  const canEdit = hasPermission('edit')

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
    { date: '2025-08-01', staffName: '佐藤さん', shiftType: 'ロング', startTime: '08:30', endTime: '18:00' },
    { date: '2025-08-01', staffName: '田中さん', shiftType: 'ショート', startTime: '12:00', endTime: '18:30' },
    { date: '2025-08-02', staffName: '山田さん', shiftType: 'ロング', startTime: '08:30', endTime: '18:00' },
    { date: '2025-08-02', staffName: '佐藤さん', shiftType: 'ショート', startTime: '12:00', endTime: '18:30' },
  ]

  const navigateToPage = (page: Page) => {
    setCurrentPage(page)
    
    const stepMapping: Record<Page, number> = {
      dataInput: 1,
      employee: 2,
      leave: 3,
      rules: 4,
      aiGeneration: 5,
      shiftDisplay: 6
    }
    
    setCurrentStep(stepMapping[page] || 1)
  }

  const handleAIGeneration = async (targetMonth: string, specialRequests: string) => {
    setIsLoading(true)
    navigateToPage('aiGeneration')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsLoading(false)
    navigateToPage('shiftDisplay')
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const generatePDFWeeks = () => {
    const weeks: { label: string; startDate: string; endDate: string }[] = []
    const year = 2025
    const month = 8
    
    for (let week = 1; week <= 4; week++) {
      const startDay = (week - 1) * 7 + 1
      const endDay = Math.min(week * 7, 31)
      weeks.push({
        label: `第${week}週`,
        startDate: `${year}-${month.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`,
        endDate: `${year}-${month.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}`
      })
    }
    
    return weeks
  }

  const menuItems = [
    {
      id: 'dataInput' as Page,
      icon: '📊',
      label: 'ダッシュボード',
      description: 'シフト生成の開始'
    },
    {
      id: 'employee' as Page,
      icon: '👥',
      label: '従業員管理',
      description: 'スタッフ情報の管理'
    },
    {
      id: 'leave' as Page,
      icon: '📅',
      label: '希望休管理',
      description: '休暇申請の管理'
    },
    {
      id: 'rules' as Page,
      icon: '⚙️',
      label: '制約設定',
      description: 'ルールと条件の設定'
    },
    {
      id: 'shiftDisplay' as Page,
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
        
        {/* サイドバー上部 - ユーザー情報 */}
        <div className="p-4 border-b border-gray-200">
          {!isSidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.role === 'admin' ? '👑' : '👤'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  ログイン中: {user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? '管理者' : 'スタッフ'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">
                  {user?.role === 'admin' ? '👑' : '👤'}
                </span>
              </div>
            </div>
          )}
        </div>

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

        {/* サイドバー下部 - ログアウトボタン */}
        <div className="p-4 bg-gray-50 rounded-br-3xl border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm('ログアウトしますか？')) {
                logout()
              }
            }}
            className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 hover:scale-105"
            title={isSidebarCollapsed ? 'ログアウト' : ''}
          >
            <span className="text-xl mr-4">🚪</span>
            {!isSidebarCollapsed && (
              <span className="flex-1 text-left text-base">ログアウト</span>
            )}
          </button>
          
          {!isSidebarCollapsed && (
            <div className="text-center mt-4">
              <div className="text-sm text-gray-500 mb-1">Version 1.0.0</div>
              <div className="text-xs text-gray-400">© 2025 Shift System</div>
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
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full animate-pulse"
                          style={{ width: '70%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 'shiftDisplay' && (
                  <ShiftCalendar />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ログイン状態管理コンポーネント
const AppWithAuth = () => {
  const { isLoggedIn } = useAuth()
  
  return isLoggedIn ? <MainApp /> : <LoginPage />
}

// メインAppコンポーネント
function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  )
}

export default App