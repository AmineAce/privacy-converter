export async function convertToPdf(blob: File): Promise<Blob> {
  // Dynamic import of jsPDF for lazy loading
  const { jsPDF } = await import('jspdf')

  // Use createImageBitmap to get natural dimensions
  const bitmap = await createImageBitmap(blob)
  const { width: imgWidth, height: imgHeight } = bitmap

  // Determine orientation based on dimensions
  const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait'

  // Initialize jsPDF with appropriate orientation
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  })

  // A4 dimensions in mm
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Calculate scaling to fit image within A4 while maintaining aspect ratio
  const imgAspectRatio = imgWidth / imgHeight
  const pageAspectRatio = pageWidth / pageHeight

  let scaledWidth: number
  let scaledHeight: number

  if (imgAspectRatio > pageAspectRatio) {
    // Image is wider relative to page - fit to width
    scaledWidth = pageWidth
    scaledHeight = pageWidth / imgAspectRatio
  } else {
    // Image is taller relative to page - fit to height
    scaledHeight = pageHeight
    scaledWidth = pageHeight * imgAspectRatio
  }

  // Center the image on the page
  const xOffset = (pageWidth - scaledWidth) / 2
  const yOffset = (pageHeight - scaledHeight) / 2

  // Convert blob to base64 for jsPDF
  const base64 = await blobToBase64(blob)

  // Add image to PDF
  doc.addImage(base64, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight)

  // Return as Blob
  return doc.output('blob')
}

// Helper function to convert Blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to base64'))
      }
    }
    reader.onerror = () => reject(new Error('File reading error'))
    reader.readAsDataURL(blob)
  })
}
