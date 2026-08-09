// src/lib/imageGen.ts
// Mock image generator: creates a canvas placeholder image with prompt text.
export async function generateMockImage(prompt, width = 1024, height = 576) {
  // Create canvas dynamically
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  // background gradient
  const g = ctx.createLinearGradient(0, 0, width, height)
  g.addColorStop(0, '#3b0764')
  g.addColorStop(1, '#8b5cf6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  // prompt text
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = 'bold 32px sans-serif'
  wrapText(ctx, `Prompt: ${prompt}`, 40, 80, width - 80, 36)

  // footer label
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '14px sans-serif'
  const now = new Date().toLocaleString()
  ctx.fillText(`Mock image — ${now}`, 40, height - 40)

  return canvas.toDataURL('image/png')
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y)
      line = words[n] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
}
