'use client'

import Dropzone from '@/components/Dropzone'

export default function UploadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <Dropzone />
    </main>
  )
}

