export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = () => resolve(reader.result)
    // For images and small files, read as data URL
    if (file.type.startsWith('image/')) reader.readAsDataURL(file)
    else reader.readAsDataURL(file)
  })
}

export async function extractFileContent(file, dataUrl) {
  // Try to extract text for known text types. For images, return a brief metadata note.
  const textTypes = ['text/plain','text/markdown','application/json','text/csv','application/xml']
  try {
    if (textTypes.includes(file.type) || file.name.match(/\.txt$|\.md$|\.json$|\.csv$/i)) {
      // read as text
      const txt = await file.text()
      return txt.slice(0, 10000) // limit
    }

    if (file.type === 'application/pdf' || file.name.match(/\.pdf$/i)) {
      return 'PDF file attached — content extraction not available in mock mode.'
    }

    if (file.type.startsWith('image/')) {
      // try to get dimensions
      return await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(`Image: ${file.name}, ${img.width}x${img.height}`)
        img.onerror = () => resolve('Image attached (no further metadata)')
        img.src = dataUrl
      })
    }

    return 'Binary file attached — no text extraction available in mock mode.'
  } catch (err) {
    return 'Error extracting file content.'
  }
}
