import { FC, useState } from 'react'

// 型定義を直接ここに定義
export type Page = 'dataInput' | 'employee' | 'leave' | 'rules' | 'aiGeneration' | 'shiftDisplay'

interface Employee {
  id: string
  name: string
  type: '常勤' | 'パート'
  hours: number
  shifts: string[]
  availableDays: string[]
  contact: string
  maxConsecutive: number
  part1EndTime?: '13:00' | '14:00'
}

interface EmployeeManagementProps {
  onNavigate: (page: Page) => void
}

const EmployeeManagement: FC<EmployeeManagementProps> = ({ onNavigate }) => {
  // 6人体制の初期データ
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'N001',
      name: '看護師A',
      type: '常勤',
      hours: 40,
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      contact: '090-1234-5678\nnurse-a@clinic.com',
      maxConsecutive: 5
    },
    {
      id: 'N002',
      name: '看護師B',
      type: '常勤',
      hours: 40,
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      contact: '090-2345-6789\nnurse-b@clinic.com',
      maxConsecutive: 5
    },
    {
      id: 'N003',
      name: '看護師C',
      type: '常勤',
      hours: 40,
      shifts: ['早番', '遅番'],
      availableDays: ['月', '火', '水', '木', '金', '土'],
      contact: '090-3456-7890\nnurse-c@clinic.com',
      maxConsecutive: 5
    },
    {
      id: 'P001',
      name: 'パートA',
      type: 'パート',
      hours: 25,
      shifts: ['パート①', 'パート②'],
      availableDays: ['月', '火', '水', '木', '金'],
      contact: '090-4567-8901\npart-a@clinic.com',
      maxConsecutive: 3,
      part1EndTime: '13:00'
    },
    {
      id: 'P002',
      name: 'パートB',
      type: 'パート',
      hours: 25,
      shifts: ['パート①', 'パート②'],
      availableDays: ['月', '火', '水', '木', '金'],
      contact: '090-5678-9012\npart-b@clinic.com',
      maxConsecutive: 3,
      part1EndTime: '14:00'
    },
    {
      id: 'P003',
      name: 'パートC',
      type: 'パート',
      hours: 20,
      shifts: ['パート①'],
      availableDays: ['月', '水', '金', '土'],
      contact: '090-6789-0123\npart-c@clinic.com',
      maxConsecutive: 2,
      part1EndTime: '13:00'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<Partial<Employee>>({
    type: '常勤',
    hours: 40,
    shifts: [],
    availableDays: [],
    maxConsecutive: 5
  })

  const resetForm = () => {
    setFormData({
      type: '常勤',
      hours: 40,
      shifts: [],
      availableDays: [],
      maxConsecutive: 5
    })
    setEditingEmployee(null)
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.id || !formData.name) {
      alert('従業員IDと氏名は必須です')
      return
    }

    if (employees.find(emp => emp.id === formData.id && emp.id !== editingEmployee?.id)) {
      alert('この従業員IDは既に使用されています')
      return
    }

    const newEmployee: Employee = {
      id: formData.id!,
      name: formData.name!,
      type: formData.type!,
      hours: formData.hours!,
      shifts: formData.shifts!,
      availableDays: formData.availableDays!,
      contact: formData.contact || '',
      maxConsecutive: formData.maxConsecutive!,
      part1EndTime: formData.part1EndTime
    }

    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? newEmployee : emp
      ))
    } else {
      setEmployees([...employees, newEmployee])
    }

    resetForm()
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData(employee)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('この従業員を削除しますか？')) {
      setEmployees(employees.filter(emp => emp.id !== id))
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

      {/* 新規追加ボタン */}
      <div className="flex justify-start">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          ➕ 新規従業員追加
        </button>
      </div>

      {/* 従業員フォーム */}
      {showForm && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border-2 border-dashed border-blue-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {editingEmployee ? '従業員情報編集' : '新規従業員追加'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  従業員ID *
                </label>
                <input
                  type="text"
                  value={formData.id || ''}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: N004, P004"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: 看護師D"
                  required
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  契約時間数（週）
                </label>
                <input
                  type="number"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大連続勤務日数
                </label>
                <input
                  type="number"
                  value={formData.maxConsecutive}
                  onChange={(e) => setFormData({ ...formData, maxConsecutive: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  連絡先
                </label>
                <textarea
                  value={formData.contact || ''}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="電話番号とメールアドレス"
                  rows={2}
                />
              </div>
            </div>

            {/* シフト選択 */}
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
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{shift}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 勤務可能曜日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                勤務可能曜日 *
              </label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {['月', '火', '水', '木', '金', '土', '日'].map(day => (
                  <label key={day} className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.availableDays?.includes(day) || false}
                      onChange={() => handleCheckboxChange('availableDays', day)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* パート①終了時間選択 */}
            {formData.type === 'パート' && formData.shifts?.includes('パート①') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パート①終了時間
                </label>
                <select
                  value={formData.part1EndTime || '13:00'}
                  onChange={(e) => setFormData({ ...formData, part1EndTime: e.target.value as '13:00' | '14:00' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                </select>
              </div>
            )}

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

      {/* 従業員一覧 */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">従業員一覧</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">氏名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">勤務形態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">契約時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">連絡先</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">対応シフト</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">勤務曜日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee, index) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.type === '常勤' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {employee.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    週{employee.hours}時間
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="whitespace-pre-line">{employee.contact}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {employee.shifts.map(shift => (
                        <span key={shift} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {shift}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {employee.availableDays.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900 hover:underline"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EmployeeManagement