import { PDFDocument } from 'pdf-lib'
import { createError, defineEventHandler, readMultipartFormData, setHeader } from 'h3'

function normalizeOutputName(rawName: string | undefined) {
  const fallback = 'arquivo-mesclado'

  if (!rawName) {
    return `${fallback}.pdf`
  }

  // Keep filename safe for Content-Disposition and most filesystems.
  const cleaned = rawName
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')

  if (!cleaned) {
    return `${fallback}.pdf`
  }

  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo foi enviado.' })
  }

  const rawOutputName = formData.find((part) => part.name === 'outputName')?.data?.toString('utf8')
  const outputName = normalizeOutputName(rawOutputName)

  const fileParts = formData.filter((part) => part.name === 'files' && part.filename && part.data)

  if (fileParts.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Envie pelo menos 2 PDFs para mesclar.'
    })
  }

  const mergedPdf = await PDFDocument.create()

  for (const filePart of fileParts) {
    const sourcePdf = await PDFDocument.load(filePart.data)
    const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())

    for (const page of pages) {
      mergedPdf.addPage(page)
    }
  }

  const mergedBytes = await mergedPdf.save()

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `attachment; filename="${outputName}"`)

  return Buffer.from(mergedBytes)
})
