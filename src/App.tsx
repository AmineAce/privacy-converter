import { DropZone } from '@/components/features/DropZone'
import { FileList } from '@/components/features/FileList'

function App() {
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <h1>Privacy Image Converter</h1>
      <DropZone />
      <FileList />
    </main>
  )
}

export default App
