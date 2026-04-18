#!/usr/bin/env node
/**
 * One-shot icon + OG preview generator.
 *
 * Source SVGs live in `public/icons/*.svg`; this script rasterises them via
 * `sharp` into the PNG / ICO variants that favicons, PWA manifests, and
 * Open Graph scrapers expect. Outputs are written to `public/` and
 * committed — regenerate whenever the source SVGs change.
 *
 *   npm run icons
 *
 * Using `sharp` (devDep) — the generated assets are static and checked into
 * git, so the runtime has no image-processing dependency.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC_DIR = resolve(ROOT, 'public')
const ICONS_SRC = resolve(PUBLIC_DIR, 'icons')

async function ensureDir(path) {
  await mkdir(path, { recursive: true })
}

async function renderPng(svgPath, size, outPath) {
  const svg = await readFile(svgPath)
  await sharp(svg, { density: Math.max(96, size * 2) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath)
  console.log(`  ✓ ${outPath.replace(ROOT + '/', '')} (${size}×${size})`)
}

async function renderOg(svgPath, outPath) {
  const svg = await readFile(svgPath)
  await sharp(svg, { density: 150 })
    .resize(1200, 630, { fit: 'contain', background: '#1A1D20' })
    .png({ compressionLevel: 9 })
    .toFile(outPath)
  console.log(`  ✓ ${outPath.replace(ROOT + '/', '')} (1200×630)`)
}

/**
 * Tiny ICO encoder — packs a single 32×32 PNG into the `.ico` container.
 * Avoids pulling a second dep (`png-to-ico`) for what is one header + one
 * directory entry. Browsers happily accept single-image ICOs.
 */
async function renderIco(svgPath, outPath) {
  const svg = await readFile(svgPath)
  const png = await sharp(svg, { density: 192 })
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type = ICO
  header.writeUInt16LE(1, 4) // image count

  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0) // width (0 = 256)
  entry.writeUInt8(32, 1) // height
  entry.writeUInt8(0, 2) // palette
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // color planes
  entry.writeUInt16LE(32, 6) // bpp
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(6 + 16, 12) // offset to PNG data

  await writeFile(outPath, Buffer.concat([header, entry, png]))
  console.log(`  ✓ ${outPath.replace(ROOT + '/', '')} (32×32 ICO)`)
}

async function main() {
  await ensureDir(PUBLIC_DIR)

  const icon = resolve(ICONS_SRC, 'icon.svg')
  const iconMaskable = resolve(ICONS_SRC, 'icon-maskable.svg')
  const og = resolve(ICONS_SRC, 'og.svg')

  console.log('Generating favicons + PWA icons...')
  await renderPng(icon, 16, resolve(PUBLIC_DIR, 'icon-16.png'))
  await renderPng(icon, 32, resolve(PUBLIC_DIR, 'icon-32.png'))
  await renderPng(icon, 180, resolve(PUBLIC_DIR, 'apple-touch-icon.png'))
  await renderPng(icon, 192, resolve(PUBLIC_DIR, 'icon-192.png'))
  await renderPng(icon, 512, resolve(PUBLIC_DIR, 'icon-512.png'))
  await renderPng(iconMaskable, 512, resolve(PUBLIC_DIR, 'icon-512-maskable.png'))
  await renderIco(icon, resolve(PUBLIC_DIR, 'favicon.ico'))

  console.log('Generating OG preview...')
  await renderOg(og, resolve(PUBLIC_DIR, 'og-image.png'))

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
