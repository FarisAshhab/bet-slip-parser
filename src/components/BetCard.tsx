'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { ParsedBet } from '@/types/bet'

type BetCardProps = {
  bet: ParsedBet
  imageUrl: string | null
  onReset: () => void
}

export default function BetCard({ bet, imageUrl, onReset }: BetCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customStakeInput, setCustomStakeInput] = useState<string>('')
  const [calculatedPayout, setCalculatedPayout] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Extract numeric values from original stake/payout strings (e.g., "$10.00" -> 10)
  const originalStake = parseFloat(bet.stake.replace(/[^\d.]/g, ''))
  const originalPayout = parseFloat(bet.payout.replace(/[^\d.]/g, ''))

  /**
   * Recalculates payout based on a user-entered custom stake.
   */
  const handleCalculate = () => {
    const numericStake = parseFloat(customStakeInput)
    if (!isNaN(numericStake) && !isNaN(originalStake) && originalStake > 0) {
      const multiplier = numericStake / originalStake
      const newPayout = multiplier * originalPayout
      setCalculatedPayout(newPayout)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border text-center">
      
      {/* Header Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {bet.type}
          <span className="text-green-600 ml-2">{bet.odds}</span>
        </h2>
        <p className="text-lg font-medium mt-1">{bet.game}</p>
        <p className="text-sm text-gray-500">{bet.startTime}</p>
      </div>

      {/* Bet Legs */}
      <ul className="text-left space-y-2 mb-4">
        {bet.legs.map((leg, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-blue-600 font-medium">{leg.player}</span>
            <span className="text-sm text-gray-800">{leg.action}</span>
          </li>
        ))}
      </ul>

      {/* Stake and Payout */}
      <div className="flex justify-around text-base font-semibold text-gray-800 mb-4">
        <div>
          <p className="text-sm text-gray-500">Stake</p>
          <p className="text-lg text-black">{bet.stake}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Payout</p>
          <p className="text-lg text-black">{bet.payout}</p>
        </div>
      </div>

      {/* Metadata */}
      {(bet.betId !== 'N/A' || bet.placedAt !== 'N/A') && (
        <div className="text-sm text-gray-600 mb-4">
          {bet.betId !== 'N/A' && <p><span className="font-medium text-gray-700">Bet ID:</span> {bet.betId}</p>}
          {bet.placedAt !== 'N/A' && <p><span className="font-medium text-gray-700">Placed:</span> {bet.placedAt}</p>}
        </div>
      )}

      {/* Custom Stake Calculator */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Try a different stake:</p>
        <div className="flex justify-center gap-2">
          <input
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            placeholder="Enter stake"
            className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
            value={customStakeInput}
            onChange={(e) => {
              const value = e.target.value.replace(/^0+/, '')
              if (/^\d*$/.test(value)) {
                setCustomStakeInput(value)
              }
            }}
          />
          <button
            onClick={handleCalculate}
            className="px-4 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            Calculate Payout
          </button>
        </div>
        {calculatedPayout !== null && (
          <p className="mt-2 text-sm text-gray-700">
            Payout: <span className="font-semibold">${calculatedPayout.toFixed(2)}</span>
          </p>
        )}
      </div>

      {/* Screenshot Thumbnail + Modal */}
      {imageUrl && (
        <div className="text-center mb-6">
          <p className="font-medium mb-2">Original Screenshot:</p>
          <img
            src={imageUrl}
            alt="Screenshot thumbnail"
            className="w-32 h-auto mx-auto rounded cursor-pointer hover:opacity-80"
            onClick={() => setIsOpen(true)}
          />

          <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
              <Dialog.Panel className="relative max-w-full max-h-full">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-2 right-2 bg-white text-black rounded-full px-2 py-1 text-sm hover:bg-gray-200 z-50"
                >
                  ✕
                </button>
                <img
                  src={imageUrl!}
                  alt="Screenshot full"
                  className="max-w-full max-h-screen object-contain rounded shadow-xl"
                />
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>
      )}

      {/* JSON Export Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(bet, null, 2))
            setShowToast(true)
            setTimeout(() => setShowToast(false), 1250)
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Copy JSON
        </button>

        {/* Copy Success Toast */}
        {showToast && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50">
            Copied to clipboard!
          </div>
        )}

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(bet, null, 2)], {
              type: 'application/json',
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'bet.json'
            a.click()
          }}
          className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm"
        >
          Download JSON
        </button>
      </div>

      {/* Reset/Upload Again */}
      <button
        onClick={onReset}
        className="w-full text-sm py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Upload Another
      </button>
    </div>
  )
}
