'use client'

import { useState, useEffect } from 'react'

const MOCK_USERS = [
  { id: '1', name: '张三', tier: 'Max', color: 'text-yellow-600 bg-yellow-50', capy: '🦫 小懒' },
  { id: '2', name: '李四', tier: 'Max', color: 'text-yellow-600 bg-yellow-50', capy: '🦫 小勤' },
  { id: '3', name: '王五', tier: 'Pro', color: 'text-green-600 bg-green-50', capy: '无' },
  { id: '4', name: '赵六', tier: 'Free', color: 'text-blue-600 bg-blue-50', capy: '无' },
]

export default function UserSwitcher() {
  const [currentUserId, setCurrentUserId] = useState<string>('1')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // 从localStorage读取当前用户
    const stored = localStorage.getItem('current_user_id')
    if (stored) {
      setCurrentUserId(stored)
    } else {
      // 默认设置为张三
      localStorage.setItem('current_user_id', '1')
    }
  }, [])

  const handleUserSwitch = (userId: string) => {
    setCurrentUserId(userId)
    localStorage.setItem('current_user_id', userId)
    setIsOpen(false)
    // 刷新页面以应用新用户
    window.location.reload()
  }

  const currentUser = MOCK_USERS.find(u => u.id === currentUserId) || MOCK_USERS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg font-medium ${currentUser.color} hover:opacity-80 transition-opacity flex items-center gap-2`}
      >
        <span>{currentUser.name}</span>
        <span className="text-xs opacity-75">({currentUser.tier})</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs text-gray-600 font-medium">切换测试用户</p>
            </div>
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSwitch(user.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  user.id === currentUserId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      等级: {user.tier} | 卡皮: {user.capy}
                    </div>
                  </div>
                  {user.id === currentUserId && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </button>
            ))}
            <div className="p-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 切换用户后会自动刷新页面
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
