import { MarkdownPage } from "@blacksmithgu/datacore"
import { useState } from "preact/hooks"
import { setPageFrontmatterValue } from "../../utils/markdown"
import { getGameData, type GameInfo } from "../../utils/perplexity"
import { Button } from "../shared/button"
import { Dialog, useDialog } from "../shared/dialog"

export const GetGameDataModal = ({ apiKey, file }: { apiKey: string, file: MarkdownPage }) => {
  const { ref: dialogRef, close } = useDialog()
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const fileName = file.$name

  const [result, setResult] = useState<GameInfo | null>(null)

  const handleOpen = async () => {
    try {
      const result = await getGameData(fileName, apiKey)

      setResult(result)
      setState('success')
    } catch (error) {
      setState('error')
      alert(error instanceof Error ? error.message : error)
    }
  }

  const handleApplyData = async () => {
    if (!result) return

    await setPageFrontmatterValue(file, 'year', result.year)
    await setPageFrontmatterValue(file, 'image', result.image)
    await setPageFrontmatterValue(file, 'price', result.price)
    await setPageFrontmatterValue(file, 'metacritic', result.metacritic)
    await setPageFrontmatterValue(file, 'hltb', result.hltb)

    close()
  }

  const renderContent = () => {
    switch (state) {
      case 'success':
        if (!result) throw new Error('Result is null and state is success')

        return <div className="flex flex-col gap-2">
          <img src={result.image} alt={fileName} className="w-full h-auto" />
          <p>Año: {result.year}</p>
          <p>Precio: {result.price}</p>
          <p>Puntuación: {result.metacritic}</p>
          <p>Duración: {result.hltb}</p>
          <Button onClick={handleApplyData}>Aplicar datos</Button>
          <aside className="h-0.5 bg-primary-500 w-full my-2"></aside>

          {result.metacriticDataUrl && <p className={'text-sm text-primary-500'}><a href={result.metacriticDataUrl}>Metacritic</a></p>}
          {result.hltbDataUrl && <p className={'text-sm text-primary-500'}><a href={result.hltbDataUrl}>HowLongToBeat</a></p>}
          {result.dataUrl && <p className={'text-sm text-primary-500'}><a href={result.dataUrl}>Informacion</a></p>}
        </div>
      case 'loading':
        return <div className="flex flex-col gap-2 justify-center items-center">
          <p>Cargando...</p>
          <dc.Icon icon="loader" className="animate-spin [&>svg]:size-10" />
        </div>
      case 'error':
        return <div className="flex flex-col gap-2">
          <p>Error obteniendo los datos del juego</p>
          <Button onClick={handleOpen} icon="refresh-ccw">Intentar de nuevo</Button>
        </div>
    }
  }

  return (
    <Dialog
      title="Obtener datos del juego"
      dialogRef={dialogRef}
      triggerProps={{
        icon: "wand",
        label: "Obtener datos",
      }}
      onOpen={handleOpen}
    >
      {renderContent()}
    </Dialog>
  )
}