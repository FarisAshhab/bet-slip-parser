'use client'

import { useEffect, useState } from 'react'
import { extractTextFromImage } from '@/lib/ocr'
import { parseBetSlipText } from '@/lib/parse'
import { ParsedBet } from '@/types/bet'
import BetCard from '@/components/BetCard'

/**
 * Dropzone component handles:
 * - Uploading a bet screenshot
 * - Displaying a preview
 * - Running OCR and parsing logic
 * - Rendering parsed bet details
 */
export default function Dropzone() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [parsedBet, setParsedBet] = useState<ParsedBet | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Triggered when the user selects an image file.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  /**
   * Runs OCR + parsing pipeline for the selected image.
   * Results are stored in `parsedBet` state.
   */
  const handleParse = async () => {
    if (!image) return
    try {
      setIsLoading(true)
      const text = await extractTextFromImage(image)
      console.log('%c🧠 Raw OCR Output:', 'color: #10b981; font-weight: bold;', text)

      const parsed = parseBetSlipText(text)
      console.log('%c📊 Parsed Bet Object:', 'color: #3b82f6; font-weight: bold;', parsed)
      setParsedBet(parsed)
    } catch (error) {
      console.error('OCR failed:', error)
      alert('❌ Failed to parse image.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Generates image preview URL on file selection.
   */
  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image)
      setPreviewUrl(url)
      setImageUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [image])

  /**
   * Resets all state to start over.
   */
  const handleReset = () => {
    setParsedBet(null)
    setImage(null)
    setPreviewUrl(null)
    setImageUrl(null)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-lg flex flex-col items-center text-center mt-16">
        {!image && (
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Upload Bet Screenshot
          </h1>
        )}

        {/* Upload box */}
        {!parsedBet && (
          <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 shadow-sm">
            <label
              htmlFor="upload"
              className="flex flex-col items-center justify-center cursor-pointer transition hover:bg-gray-50"
            >
              <input
                id="upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-gray-600 mb-2">
                {image ? `File: ${image.name}` : 'Click to upload'}
              </p>

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-72 rounded-lg object-contain border mt-4"
                />
              )}
            </label>

            {/* Loading spinner while parsing */}
            {isLoading ? (
              <div className="mt-6 flex items-center justify-center text-sm text-gray-600 gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Parsing screenshot...
              </div>
            ) : (
              image && (
                <button
                  onClick={handleParse}
                  className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Parse Bet
                </button>
              )
            )}
          </div>
        )}

        {/* Show parsed result */}
        {parsedBet && (
          <div className="w-full mt-6">
            <BetCard bet={parsedBet} imageUrl={imageUrl} onReset={handleReset} />
          </div>
        )}
      </div>
    </div>
  )
}
