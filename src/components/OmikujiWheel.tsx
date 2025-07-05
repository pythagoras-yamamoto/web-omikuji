'use client'

import { useState } from 'react'
import { OmikujiConfig, OmikujiItem } from '@/types/omikuji'
import { drawOmikuji } from '@/utils/omikuji'

interface OmikujiWheelProps {
  config: OmikujiConfig
}

export default function OmikujiWheel({ config }: OmikujiWheelProps) {
  const [result, setResult] = useState<OmikujiItem | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const handleDraw = async () => {
    if (isDrawing) return
    
    setIsDrawing(true)
    setResult(null)
    
    // アニメーション効果のための遅延
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const drawnItem = drawOmikuji(config.items)
    setResult(drawnItem)
    setIsDrawing(false)
  }

  const handleReset = () => {
    setResult(null)
    setIsDrawing(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        {config.title}
      </h1>
      
      <div className="text-center mb-8">
        {!result && !isDrawing && (
          <button
            onClick={handleDraw}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-lg transition-colors duration-200 shadow-lg"
          >
            {config.buttonText}
          </button>
        )}
        
        {isDrawing && (
          <div className="py-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">おみくじを引いています...</p>
          </div>
        )}
        
        {result && (
          <div className="animate-fadeIn">
            <div 
              className="mx-auto w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4"
              style={{ backgroundColor: result.color || '#ef4444' }}
            >
              {result.name}
            </div>
            <p className="text-lg text-gray-700 mb-6">{result.description}</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200"
            >
              {config.resetText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}