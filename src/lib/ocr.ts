import Tesseract from 'tesseract.js'

/**
 * Uses Tesseract.js to extract raw text from an uploaded image (PNG or JPG).
 * 
 * This function is asynchronous and returns the recognized OCR text.
 * 
 * @param image - Image file uploaded by the user
 * @returns Recognized text as a string
 */
export async function extractTextFromImage(image: File): Promise<string> {
  const { data } = await Tesseract.recognize(image, 'eng', {
    logger: m => console.log(m), // Optional: log progress events to console
  })

  return data.text
}
