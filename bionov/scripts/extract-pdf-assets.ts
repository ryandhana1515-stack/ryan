/**
 * Extract page renders + embedded images from the BIO N:OV source PDF.
 *
 *   npx tsx scripts/extract-pdf-assets.ts <path-to-pdf> [outDir]
 *
 * Requires python3 with pymupdf (`pip install pymupdf`) — the most
 * reliable extractor for embedded product photography. Outputs:
 *   <outDir>/pages/pNN.png        page renders (150 dpi)
 *   <outDir>/images/pNN_xREF.png  embedded images >=200px, deduped
 *
 * Curated copies for the site live in public/assets/ (see README
 * "Asset provenance"); re-run this only when the source PDF changes.
 */
import { execSync } from 'node:child_process'

const [, , pdf, outDir = 'pdf-extract'] = process.argv
if (!pdf) {
  console.log('usage: tsx scripts/extract-pdf-assets.ts <pdf> [outDir]')
  process.exit(1)
}

const py = `
import fitz, os, sys
pdf, out = sys.argv[1], sys.argv[2]
os.makedirs(f"{out}/pages", exist_ok=True)
os.makedirs(f"{out}/images", exist_ok=True)
doc = fitz.open(pdf)
seen = set()
count = 0
for i, page in enumerate(doc):
    page.get_pixmap(dpi=150).save(f"{out}/pages/p{i+1:02d}.png")
    for img in page.get_images(full=True):
        xref = img[0]
        if xref in seen: continue
        seen.add(xref)
        try:
            pix = fitz.Pixmap(doc, xref)
            if pix.w < 200 or pix.h < 200: continue
            if pix.n - pix.alpha > 3: pix = fitz.Pixmap(fitz.csRGB, pix)
            pix.save(f"{out}/images/p{i+1:02d}_x{xref}.png")
            count += 1
        except Exception:
            pass
print(f"{len(doc)} pages rendered, {count} images extracted -> {out}")
`

try {
  execSync(`python3 -c '${py.replace(/'/g, "'\\''")}' "${pdf}" "${outDir}"`, {
    stdio: 'inherit',
  })
} catch {
  console.error('Extraction failed. Ensure python3 + pymupdf are installed: pip install pymupdf')
  process.exit(1)
}
