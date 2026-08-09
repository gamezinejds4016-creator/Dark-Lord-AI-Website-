// src/lib/fileUtils.ts
export async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

export async function extractFileContent(file, dataUrl) {
  // Try to extract text for known text types. For images, attempt OCR if tesseract is available.
  const textTypes = ['text/plain','text/markdown','application/json','text/csv','application/xml']
  try {
    if (textTypes.includes(file.type) || file.name.match(/\.txt$|\.md$|\.json$|\.csv$/i)) {
      const txt = await file.text()
      return txt.slice(0, 20000) // limit
    }

    if (file.name.match(/\.pdf$/i) || file.type === 'application/pdf') {
      // Try to use pdfjs-dist if available (client-side). If not present, return placeholder.
      try {
        // dynamic import to avoid forcing dependency
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf')
        const arrayBuf = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument({ data: arrayBuf }).promise
        let pages = []
        const maxPages = Math.min(5, pdf.numPages)
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i)
          const txtContent = await page.getTextContent()
          const pageText = txtContent.items.map(i => ('str' in i) ? i.str : '').join(' ')
          pages.push(pageText)
        }
        return pages.join('\n\n').slice(0, 20000)
      } catch (err) {
        return 'PDF file attached — content extraction not available in this build.'
      }
    }

    if (file.type.startsWith('image/')) {
      // Try OCR via tesseract.js if available, otherwise return dimensions metadata
      try {
        const Tesseract = (await import('tesseract.js')).default
        const result = await Tesseract.recognize(dataUrl, 'eng')
        const text = (result && result.data && result.data.text) ? result.data.text : ''
        if (text && text.trim().length > 5) return text.slice(0, 20000)
      } catch (err) {
        // ignore OCR errors and fallback
      }
      // fallback: return basic metadata (dimensions)
      return await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(`Image: ${file.name}, ${img.width}x${img.height}`)
        img.onerror = () => resolve('Image attached (no further metadata)')
        img.src = dataUrl
      })
    }

    return 'Binary file attached — no text extraction available in this build.'
  } catch (err) {
    return 'Error extracting file content.'
  }
}
