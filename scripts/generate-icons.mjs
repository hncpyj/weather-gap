import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const require = createRequire(import.meta.url)
const { Jimp } = require('jimp')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '../public')

// Colors (RGBA hex)
const BG     = 0x0f172aff  // slate-900
const YELLOW = 0xfbbf24ff  // amber-400

function drawIcon(size) {
  const img = new Jimp({ width: size, height: size, color: BG })

  const cx = size / 2
  const cy = size / 2
  const sunR  = size * 0.18
  const rayDist = size * 0.30
  const strokeW = Math.max(2, Math.round(size * 0.035))

  // Filled circle (sun body)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy
      if (Math.sqrt(dx * dx + dy * dy) <= sunR) {
        img.setPixelColor(YELLOW, x, y)
      }
    }
  }

  // 8 rays
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4
    const x1 = cx + Math.cos(angle) * (sunR + size * 0.05)
    const y1 = cy + Math.sin(angle) * (sunR + size * 0.05)
    const x2 = cx + Math.cos(angle) * rayDist
    const y2 = cy + Math.sin(angle) * rayDist

    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1))
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const px = x1 + (x2 - x1) * t
      const py = y1 + (y2 - y1) * t
      for (let w = -strokeW; w <= strokeW; w++) {
        const nx = Math.round(px + Math.cos(angle + Math.PI / 2) * w)
        const ny = Math.round(py + Math.sin(angle + Math.PI / 2) * w)
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          img.setPixelColor(YELLOW, nx, ny)
        }
      }
    }
  }

  return img
}

async function main() {
  fs.mkdirSync(publicDir, { recursive: true })

  const sizes = [
    { size: 192,  name: 'pwa-192x192.png' },
    { size: 512,  name: 'pwa-512x512.png' },
    { size: 1024, name: 'icon-1024.png' },
    { size: 180,  name: 'apple-touch-icon.png' },
  ]

  for (const { size, name } of sizes) {
    console.log(`Generating ${size}x${size} → ${name}`)
    const img = drawIcon(size)
    await img.write(path.join(publicDir, name))
    console.log(`  ✓`)
  }

  console.log('\nAll icons generated!')
}

main().catch(console.error)
