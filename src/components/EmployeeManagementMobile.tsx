import React, { FC, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'shiftDisplay'

interface EmployeeManagementMobileProps {
  onNavigate: (page: Page) => void
}

interface Employee {
  name: string
  type: 'fullTime' | 'partTime'
  hours: number
  phone: string
  email: string
  shifts: string[]
  availableDays: string[]
  notes: string
}

const EmployeeManagementMobile: FC<EmployeeManagementMobileProps> = ({ onNavigate }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  
  // アコーディオンの展開状態管理
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())

  // 権限情報を取得
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('edit')

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    type: 'fullTime',
    hours: 40,
    phone: '',
    email: '',
    shifts: [],
    availableDays: [],
    notes: ''
  })

  // 従業員データ（項目統一版）
  const [employees, setEmployees] = useState<Employee[]>([
    {
      name: '看護師A',
      type: 'fullTime',
      hours: 40,
      phone: '090-1234-5678',
      email: 'nursea@clinic.com',
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      notes: 'リーダー経験豊富'
    },
    {
      name: '看護師B',
      type: 'fullTime',
      hours: 40,
      phone: '090-2345-6789',
      email: 'nurseb@clinic.com',
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      notes: '小児科経験あり'
    },
    {
      name: '看護師C',
      type: 'fullTime',
      hours: 40,
      phone: '090-3456-7890',
      email: 'nursec@clinic.com',
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      notes: '新人、指導必要'
    },
    {
      name: 'パートA',
      type: 'partTime',
      hours: 20,
      phone: '090-4567-8901',
      email: 'parta@clinic.com',
      shifts: ['パート①', 'パート②'],
      availableDays: ['月', '火', '水', '木', '金'],
      notes: '午前中希望'
    },
    {
      name: 'パートB',
      type: 'partTime',
      hours: 16,
      phone: '090-5678-9012',
      email: 'partb@clinic.com',
      shifts: ['パート①', 'パート②'],
      availableDays: ['月', '火', '水', '木', '金'],
      notes: '午後メイン'
    },
    {
      name: 'パートC',
      type: 'partTime',
      hours: 24,
      phone: '090-6789-0123',
      email: 'partc@clinic.com',
      shifts: ['パート①', 'パート②'],
      availableDays: ['月', '水', '金', '土'],
      notes: 'フレキシブル対応'
    }
  ])

  // アコーディオンの展開/折りたたみ
  const toggleExpanded = (employeeName: string) => {
    const newExpanded = new Set(expandedEmployees)
    if (newExpanded.has(employeeName)) {
      newExpanded.delete(employeeName)
    } else {
      newExpanded.add(employeeName)
    }
    setExpandedEmployees(newExpanded)
  }

  const openAddModal = () => {
    if (!canEdit) {
      alert('従業員の登録権限がありません（管理者のみ実行可能）')
      return
    }

    setEditingEmployee(null)
    setFormData({
      name: '',
      type: 'fullTime',
      hours: 40,
      phone: '',
      email: '',
      shifts: [],
      availableDays: [],
      notes: ''
    })
    setShowModal(true)
  }

  const openEditModal = (employee: Employee) => {
    if (!canEdit) {
      alert('従業員情報の編集権限がありません（管理者のみ実行可能）')
      return
    }

    setEditingEmployee(employee)
    setFormData(employee)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name) {
      alert('氏名を入力してください')
      return
    }

    if (!canEdit) {
      alert('従業員情報の保存権限がありません')
      return
    }

    // 名前重複チェック（編集時は除く）
    const existingEmployee = employees.find(emp => 
      emp.name === formData.name && emp.name !== editingEmployee?.name
    )
    
    if (existingEmployee) {
      alert('同じ氏名の従業員が既に存在します')
      return
    }

    if (editingEmployee) {
      // 編集
      setEmployees(prev => prev.map(emp => 
        emp.name === editingEmployee.name ? formData as Employee : emp
      ))
    } else {
      // 新規追加
      setEmployees(prev => [...prev, formData as Employee])
    }

    setShowModal(false)
    setEditingEmployee(null)
  }

  const handleDelete = (name: string) => {
    if (!canEdit) {
      alert('従業員の削除権限がありません（管理者のみ実行可能）')
      return
    }

    if (confirm('この従業員を削除しますか？\n※ シフト履歴も削除されます')) {
      setEmployees(prev => prev.filter(emp => emp.name !== name))
    }
  }

  const handleShiftToggle = (shift: string) => {
    const currentShifts = formData.shifts || []
    const newShifts = currentShifts.includes(shift)
      ? currentShifts.filter(s => s !== shift)
      : [...currentShifts, shift]
    
    setFormData(prev => ({ ...prev, shifts: newShifts }))
  }

  const handleDayToggle = (day: string) => {
    const currentDays = formData.availableDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    
    setFormData(prev => ({ ...prev, availableDays: newDays }))
  }

  const getTypeColor = (type: string): string => {
    return type === 'fullTime' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800'
  }

  const getTypeLabel = (type: string): string => {
    return type === 'fullTime' ? '常勤' : 'パート'
  }

  const fullTimeEmployees = employees.filter(emp => emp.type === 'fullTime')
  const partTimeEmployees = employees.filter(emp => emp.type === 'partTime')

  return (
    <div className="space-y-4 pb-24"> {/* 下部タブバー分のmargin */}
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            👥 従業員管理
          </h2>
          <p className="text-gray-600 text-sm">
            スタッフ情報の管理
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
              スタッフ権限のため、従業員情報の変更・削除はできません（閲覧のみ）
            </span>
          </div>
        </div>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{fullTimeEmployees.length}名</div>
            <div className="text-blue-100 text-sm">常勤スタッフ</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{partTimeEmployees.length}名</div>
            <div className="text-purple-100 text-sm">パートスタッフ</div>
          </div>
        </div>
      </div>

      {/* 新規登録ボタン */}
      <button
        onClick={openAddModal}
        disabled={!canEdit}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
          canEdit 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg cursor-pointer' 
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
        }`}
      >
        {canEdit ? '➕ 新しいスタッフを登録' : '🔒 登録権限なし'}
      </button>

      {/* 従業員一覧（アコーディオン方式） */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">従業員一覧</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {employees.map((employee, index) => {
            const isExpanded = expandedEmployees.has(employee.name)
            
            return (
              <div key={employee.name} className="transition-all duration-200">
                {/* メイン行（常に表示） - 修正版 */}
                <div className="px-4 py-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="space-y-2">
                    {/* 上段：氏名と展開ボタン */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {/* 展開/折りたたみボタン（大きく） */}
                        <button
                          onClick={() => toggleExpanded(employee.name)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 -m-2"
                        >
                          <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                        </button>
                        
                        {/* 氏名 */}
                        <div className="font-semibold text-gray-900 text-lg">
                          {employee.name}
                        </div>
                      </div>
                      
                      {/* 操作ボタン */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(employee)}
                          disabled={!canEdit}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            canEdit 
                              ? 'text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600'
                              : 'text-gray-400 border border-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {canEdit ? '編集' : '🔒'}
                        </button>
                        <button
                          onClick={() => handleDelete(employee.name)}
                          disabled={!canEdit}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            canEdit 
                              ? 'text-red-600 hover:text-white hover:bg-red-600 border border-red-600'
                              : 'text-gray-400 border border-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {canEdit ? '削除' : '🔒'}
                        </button>
                      </div>
                    </div>
                    
                    {/* 下段：勤務形態、契約時間、電話番号 */}
                    <div className="text-gray-600 text-sm ml-10">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getTypeColor(employee.type)}`}>
                        {getTypeLabel(employee.type)}
                      </span>
                      <span>週{employee.hours}時間　　📞 {employee.phone}</span>
                    </div>
                  </div>
                </div>
                
                {/* 詳細情報（展開時のみ表示） - 氏名除外版 */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="pt-3 space-y-1 text-sm ml-10">
                      <div>
                        <span className="font-bold text-gray-700">📧 メールアドレス　</span>
                        <span className="text-gray-600">{employee.email || '未設定'}</span>
                      </div>
                      
                      <div>
                        <span className="font-bold text-gray-700">📅 対応シフト　</span>
                        <span className="text-gray-600">{employee.shifts.join(', ')}</span>
                      </div>
                      
                      <div>
                        <span className="font-bold text-gray-700">📅 勤務曜日　</span>
                        <span className="text-gray-600">{employee.availableDays.join(', ')}</span>
                      </div>
                      
                      <div>
                        <span className="font-bold text-gray-700">📝 備考　</span>
                        <span className="text-gray-600">{employee.notes || 'なし'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 従業員登録・編集モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-indigo-600">
                {editingEmployee ? 'スタッフ情報を編集' : '新しいスタッフを登録'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 氏名 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  氏名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="田中 花子"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>

              {/* 勤務形態 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  雇用形態 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'fullTime' | 'partTime',
                    shifts: e.target.value === 'fullTime' ? ['早番', '遅番'] : ['パート①', 'パート②'],
                    hours: e.target.value === 'fullTime' ? 40 : 20
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                >
                  <option value="fullTime">常勤</option>
                  <option value="partTime">パート</option>
                </select>
              </div>

              {/* 契約時間 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  週契約時間
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="090-1234-5678"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@clinic.com"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>

              {/* 対応可能シフト */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  対応可能シフト
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(formData.type === 'fullTime' ? ['早番', '遅番'] : ['パート①', 'パート②']).map((shift) => (
                    <label key={shift} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shifts?.includes(shift)}
                        onChange={() => handleShiftToggle(shift)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{shift}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 勤務曜日 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  勤務可能曜日
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                    <label key={day} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availableDays?.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-xs text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 備考 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="経験、スキル、注意事項など"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm resize-none"
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={!formData.name}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    formData.name
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {editingEmployee ? '更新' : '登録'}
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

export default EmployeeManagementMobile