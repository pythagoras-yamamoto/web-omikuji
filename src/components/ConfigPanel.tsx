'use client'

import { useState } from 'react'
import { OmikujiConfig, OmikujiItem } from '@/types/omikuji'
import { copyConfigUrl } from '@/utils/urlParams'

interface ConfigPanelProps {
  config: OmikujiConfig
  onConfigUpdate: (config: OmikujiConfig) => void
}

export default function ConfigPanel({ config, onConfigUpdate }: ConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const updateConfig = (updates: Partial<OmikujiConfig>) => {
    onConfigUpdate({ ...config, ...updates })
  }

  const updateItem = (index: number, updates: Partial<OmikujiItem>) => {
    const newItems = [...config.items]
    newItems[index] = { ...newItems[index], ...updates }
    updateConfig({ items: newItems })
  }

  const addItem = () => {
    const newItem: OmikujiItem = {
      id: Date.now().toString(),
      name: '新しい項目',
      description: '説明を入力してください',
      weight: 1,
      color: '#6b7280'
    }
    updateConfig({ items: [...config.items, newItem] })
  }

  const removeItem = (index: number) => {
    if (config.items.length <= 1) return
    const newItems = config.items.filter((_, i) => i !== index)
    updateConfig({ items: newItems })
  }

  const handleCopyUrl = async () => {
    const success = await copyConfigUrl(config)
    setCopyStatus(success ? 'copied' : 'error')
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleCopyUrl}
          className={`px-4 py-2 rounded-lg font-bold transition-colors duration-200 ${
            copyStatus === 'copied' 
              ? 'bg-green-500 text-white' 
              : copyStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {copyStatus === 'copied' ? 'コピー済み!' : copyStatus === 'error' ? 'エラー' : 'URLをコピー'}
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200"
        >
          設定
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">設定</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ボタンテキスト
              </label>
              <input
                type="text"
                value={config.buttonText}
                onChange={(e) => updateConfig({ buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                リセットボタンテキスト
              </label>
              <input
                type="text"
                value={config.resetText}
                onChange={(e) => updateConfig({ resetText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  おみくじ項目
                </label>
                <button
                  onClick={addItem}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                >
                  追加
                </button>
              </div>
              
              <div className="space-y-4">
                {config.items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">項目 {index + 1}</span>
                      </div>
                      {config.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          削除
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">名前</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, { name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">色</label>
                        <input
                          type="color"
                          value={item.color || '#6b7280'}
                          onChange={(e) => updateItem(index, { color: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">説明</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">重み (数字が大きいほど出やすい)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={item.weight}
                        onChange={(e) => updateItem(index, { weight: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleCopyUrl}
              className={`px-4 py-2 rounded-lg font-bold transition-colors duration-200 ${
                copyStatus === 'copied' 
                  ? 'bg-green-500 text-white' 
                  : copyStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {copyStatus === 'copied' ? 'コピー済み!' : copyStatus === 'error' ? 'エラー' : 'URLをコピー'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}