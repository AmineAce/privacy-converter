import JSZip from 'jszip'
import type { ImageJob } from '@/core/types/core'

export async function downloadAllAsZip(jobs: ImageJob[]): Promise<void> {
  const zip = new JSZip()

  const validJobs = jobs.filter((job) => job.status === 'completed' && job.result)

  validJobs.forEach((job) => {
    zip.file(job.result!.name, job.result!.blob)
  })

  const content = await zip.generateAsync({ type: 'blob' })

  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted_images.zip'
  a.click()
  URL.revokeObjectURL(url)
}
