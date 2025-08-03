import React, { FC, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// 型定義を直接ここに定義（元のまま）
export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'aiGeneration' | 'shiftDisplay'

interface Employee {
  name: string
  type: '常勤' | 'パート'
  hours: number
  phone: string
  email: string
  shifts: string[]
  availableDays: string[]
  notes: string
}

interface EmployeeManagementProps {
  onNavigate: (page: Page) => void
}

const EmployeeManagement: FC<EmployeeManagementProps> = ({ onNavigate }) => {
  // 権限情報を取得（追加）
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('edit')

  // アコーディオンの展開状態管理
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())

  // 6人体制の初期データ（項目統一版）
  const [employees, setEmployees] = useState<Employee[]>([
    {
      name: '看護師A',
      type: '常勤',
      hours: 40,
      phone: '090-1234-5678',
      email: 'nurse-a@clinic.com',
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      notes: 'リーダー経験豊富'
    },
    {
      name: '看護師B',
      type: '常勤',
      hours: 40,
      phone: '090-2345-6789',
      email: 'nurse-b@clinic.com',
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      notes: '小児科経験あり'
    },
    {
      name: '看護師C',
      type: '常勤',
      hours: 40,
      phone: '090-3456-7890',
      email: 'nurse-c@clinic.com',
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      notes: '新人、指導必要'
    },
    {
      name: 'パートA',
      type: 'パート',
      hours: 25,
      phone: '090-4567-8901',
      email: 'part-a@clinic.com',
      shifts: ['パート①', 'パート②'],
      availableDays: ['月', '火', '水', '木', '金'],
      notes: '午前中希望'
    },
    {
      name: 'パートB',
      type: 'パート',
      hours: 25,
      phone: '090-5678-9012',
      email: 'part-b@clinic.com',
      shifts: ['パート①', 'パート②'],
      availableDays: ['月', '火', '水', '木', '金'],
      notes: '午後メイン'
    },
    {
      name: 'パートC',
      type: 'パート',
      hours: 20,
      phone: '090-6789-0123',
      email: 'part-c@clinic.com',
      shifts: ['パート①'],
      availableDays: ['月', '水', '金', '土'],
      notes: 'フレキシブル対応'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<Partial<Employee>>({
    type: '常勤',
    hours: 40,
    shifts: [],
    availableDays: [],
    phone: '',
    email: '',
    notes: ''
  })

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

  const resetForm = () => {
    setFormData({
      type: '常勤',
      hours: 40,
      shifts: [],
      availableDays: [],
      phone: '',
      email: '',
      notes: ''
    })
    setEditingEmployee(null)
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 権限チェック（追加）
    if (!canEdit) {
      alert('従業員情報の変更権限がありません（管理者のみ実行可能）')
      return
    }
    
    if (!formData.name) {
      alert('氏名は必須です')
      return
    }

    if (employees.find(emp => emp.name === formData.name && emp.name !== editingEmployee?.name)) {
      alert('この氏名は既に使用されています')
      return
    }

    const newEmployee: Employee = {
      name: formData.name!,
      type: formData.type!,
      hours: formData.hours!,
      phone: formData.phone!,
      email: formData.email!,
      shifts: formData.shifts!,
      availableDays: formData.availableDays!,
      notes: formData.notes || ''
    }

    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.name === editingEmployee.name ? newEmployee : emp
      ))
    } else {
      setEmployees([...employees, newEmployee])
    }

    resetForm()
  }

  const handleEdit = (employee: Employee) => {
    // 権限チェック（追加）
    if (!canEdit) {
      alert('従業員情報の編集権限がありません（管理者のみ実行可能）')
      return
    }

    setEditingEmployee(employee)
    setFormData(employee)
    setShowForm(true)
  }

  const handleDelete = (name: string) => {
    // 権限チェック（追加）
    if (!canEdit) {
      alert('従業員情報の削除権限がありません（管理者のみ実行可能）')
      return
    }

    if (confirm('この従業員を削除しますか？')) {
      setEmployees(employees.filter(emp => emp.name !== name))
    }
  }

  const handleCheckboxChange = (field: 'shifts' | 'availableDays', value: string) => {
    const currentValues = formData[field] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    setFormData({ ...formData, [field]: newValues })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            👥 従業員管理
          </h2>
          <p className="text-gray-600 mt-1">
            スタッフ情報管理 - 現在{employees.length}名登録済み
          </p>
        </div>
        <button
          onClick={() => onNavigate('dataInput')}
          className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors duration-200"
        >
          ← 戻る
        </button>
      </div>

      {/* 権限不足時の警告（追加） */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <span className="font-medium">
              スタッフ権限のため、従業員情報の追加・編集・削除はできません（閲覧のみ）
            </span>
          </div>
        </div>
      )}

      {/* 新規追加ボタン */}
      <div className="flex justify-start">
        <button
          onClick={() => canEdit ? setShowForm(true) : alert('従業員追加の権限がありません')}
          disabled={!canEdit}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform ${
            canEdit 
              ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          {canEdit ? '➕ 新規従業員追加' : '🔒 新規従業員追加（権限不足）'}
        </button>
      </div>

      {/* 従業員フォーム（元のレイアウト） */}
      {showForm && canEdit && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border-2 border-dashed border-blue-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {editingEmployee ? '従業員情報を編集' : '新しい従業員を追加'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 氏名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="田中 花子"
                  required
                />
              </div>

              {/* 勤務形態 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  勤務形態 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as '常勤' | 'パート' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="常勤">常勤</option>
                  <option value="パート">パート</option>
                </select>
              </div>

              {/* 契約時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  週契約時間 *
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.hours || 40}
                  onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="090-1234-5678"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@clinic.com"
                />
              </div>
            </div>

            {/* 対応可能シフト */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対応可能シフト *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['早番', '遅番', 'パート①', 'パート②'].map(shift => (
                  <label key={shift} className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.shifts?.includes(shift) || false}
                      onChange={() => handleCheckboxChange('shifts', shift)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{shift}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 勤務曜日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                勤務可能曜日 *
              </label>
              <div className="grid grid-cols-7 gap-2">
                {['月', '火', '水', '木', '金', '土', '日'].map(day => (
                  <label key={day} className="flex items-center justify-center space-x-1 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.availableDays?.includes(day) || false}
                      onChange={() => handleCheckboxChange('availableDays', day)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 備考 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="特記事項、経験、スキルなど"
                rows={3}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200"
              >
                {editingEmployee ? '更新' : '追加'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 従業員一覧（アコーディオン方式） */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">従業員一覧</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {employees.map((employee, index) => {
            const isExpanded = expandedEmployees.has(employee.name)
            
            return (
              <div key={employee.name} className="transition-all duration-200">
                {/* メイン行（常に表示） */}
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* 展開/折りたたみボタン */}
                      <button
                        onClick={() => toggleExpanded(employee.name)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                      
                      {/* 基本情報 */}
                      <div className="flex items-center space-x-6 flex-1">
                        <div className="font-semibold text-gray-900">
                          {employee.name}
                        </div>
                        
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          employee.type === '常勤' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {employee.type}
                        </span>
                        
                        <div className="text-gray-600">
                          週{employee.hours}時間
                        </div>
                        
                        <div className="text-gray-600">
                          {employee.phone}
                        </div>
                      </div>
                    </div>
                    
                    {/* 操作ボタン */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(employee)}
                        disabled={!canEdit}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          canEdit 
                            ? 'text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600'
                            : 'text-gray-400 border border-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {canEdit ? '編集' : '🔒編集'}
                      </button>
                      <button
                        onClick={() => handleDelete(employee.name)}
                        disabled={!canEdit}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          canEdit 
                            ? 'text-red-600 hover:text-white hover:bg-red-600 border border-red-600'
                            : 'text-gray-400 border border-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {canEdit ? '削除' : '🔒削除'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 詳細情報（展開時のみ表示） */}
                {isExpanded && (
                  <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                      {/* メールアドレス */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">📧 メールアドレス</div>
                        <div className="text-sm text-gray-600">{employee.email || '未設定'}</div>
                      </div>
                      
                      {/* 対応シフト */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">📅 対応シフト</div>
                        <div className="flex flex-wrap gap-1">
                          {employee.shifts.map(shift => (
                            <span key={shift} className="px-2 py-1 bg-white text-gray-700 text-xs rounded border">
                              {shift}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* 勤務曜日 */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">📅 勤務曜日</div>
                        <div className="text-sm text-gray-600">{employee.availableDays.join(', ')}</div>
                      </div>
                      
                      {/* 備考 */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">📝 備考</div>
                        <div className="text-sm text-gray-600">{employee.notes || 'なし'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default EmployeeManagement