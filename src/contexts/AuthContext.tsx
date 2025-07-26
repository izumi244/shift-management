import React, { createContext, useContext, useState, ReactNode } from 'react'

// 固定アカウント情報
const ACCOUNTS = {
  admin: { username: 'admin', password: 'admin', role: 'admin' as const },
  staff: { username: 'staff', password: 'staff', role: 'staff' as const }
}

// ユーザー型定義
export interface User {
  username: string
  role: 'admin' | 'staff'
}

// Context型定義
interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  hasPermission: (permission: 'edit' | 'view') => boolean
}

// Context作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider Props型
interface AuthProviderProps {
  children: ReactNode
}

// AuthProvider コンポーネント
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // ログイン関数
  const login = (username: string, password: string): boolean => {
    const account = ACCOUNTS[username as keyof typeof ACCOUNTS]
    
    if (account && account.password === password) {
      const userData: User = {
        username: account.username,
        role: account.role
      }
      setUser(userData)
      setIsLoggedIn(true)
      return true
    }
    
    return false
  }

  // ログアウト関数
  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  // 権限チェック関数
  const hasPermission = (permission: 'edit' | 'view'): boolean => {
    if (!user) return false
    
    if (permission === 'view') {
      return true // ログイン済みなら誰でも閲覧可能
    }
    
    if (permission === 'edit') {
      return user.role === 'admin' // 編集はadminのみ
    }
    
    return false
  }

  const value: AuthContextType = {
    user,
    isLoggedIn,
    login,
    logout,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth カスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}