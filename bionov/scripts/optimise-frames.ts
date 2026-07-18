/**
 * Produce tablet/mobile variants of a desktop frame sequence.
 *
 *   npx tsx scripts/optimise-frames.ts <desktopDir> <tabletDir> <mobileDir>
 *
 * Requires ffmpeg (used as the resizer to avoid extra deps).
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [, , desktopDir, tabletDir, mobileDir] = process.argv
if (!desktopDir || !tabletDir || !mobileDir) {
  console.log('usage: tsx scripts/optimise-frames.ts <desktopDir> <tabletDir> <mobileDir>')
  process.exit(1)
}

const frames = fs.readdirSync(desktopDir).filter((f) => f.endsWith('.webp'))
fs.mkdirSync(tabletDir, { recursive: true })
fs.mkdirSync(mobileDir, { recursive: true })

for (const f of frames) {
  const src = path.join(desktopDir, f)
  execSync(
    `ffmpeg -y -i "${src}" -vf scale=1280:-1 -quality 78 "${path.join(tabletDir, f)}"`,
    { stdio: 'ignore' },
  )
  execSync(
    `ffmpeg -y -i "${src}" -vf scale=720:-1 -quality 74 "${path.join(mobileDir, f)}"`,
    { stdio: 'ignore' },
  )
}
console.log(`optimised ${frames.length} frames → tablet + mobile`)
