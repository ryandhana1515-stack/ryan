/**
 * Convert an approved video clip into a numbered WebP frame sequence.
 *
 *   npx tsx scripts/convert-video-to-frames.ts <video.mp4> <outputDir> [fps]
 *
 * Requires ffmpeg on PATH. Frames are written as frame_0001.webp …
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [, , video, outDir, fpsArg] = process.argv
if (!video || !outDir) {
  console.log('usage: tsx scripts/convert-video-to-frames.ts <video.mp4> <outputDir> [fps]')
  process.exit(1)
}
const fps = Number(fpsArg ?? '24')

try {
  execSync('ffmpeg -version', { stdio: 'ignore' })
} catch {
  console.error('ffmpeg not found on PATH. Install ffmpeg first.')
  process.exit(1)
}

fs.mkdirSync(outDir, { recursive: true })
execSync(
  `ffmpeg -y -i "${video}" -vf fps=${fps} -c:v libwebp -quality 82 "${path.join(outDir, 'frame_%04d.webp')}"`,
  { stdio: 'inherit' },
)
const frames = fs.readdirSync(outDir).filter((f) => f.endsWith('.webp'))
console.log(`wrote ${frames.length} frames to ${outDir}`)
