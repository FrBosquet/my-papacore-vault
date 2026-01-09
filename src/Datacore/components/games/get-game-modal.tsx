import { MarkdownPage } from "@blacksmithgu/datacore"
import { useState } from "preact/hooks"
import { setPageFrontmatterValue } from "../../utils/markdown"
import { getGameData, type GameInfo } from "../../utils/perplexity"
import { Button } from "../shared/button"
import { Dialog, useDialog } from "../shared/dialog"

export const GetGameDataModal = ({ apiKey, file }: { apiKey: string, file: MarkdownPage }) => {
  const { ref: dialogRef, close } = useDialog()
  const fileName = file.$name

  const [result, setResult] = useState<GameInfo | null>(null)

  const handleOpen = async () => {
    const result = await getGameData(fileName, apiKey)

    setResult(result)
  }

  const handleApplyData = async () => {
    if(!result) return

    await setPageFrontmatterValue(file, 'year', result.year)
    await setPageFrontmatterValue(file, 'image', result.image)
    await setPageFrontmatterValue(file, 'price', result.price)
    await setPageFrontmatterValue(file, 'metacritic', result.metacritic)
    await setPageFrontmatterValue(file, 'hltb', result.hltb)

    close()
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
      {result ? <div className="flex flex-col gap-2">
        <img src={result.image} alt={fileName} className="w-full h-auto" />
        <p>Año: {result.year}</p>
        <p>Precio: {result.price}</p>
        <p>Puntuación: {result.metacritic}</p>
        <p>Duración: {result.hltb}</p>
        <Button onClick={handleApplyData}>Aplicar datos</Button>
      </div> : <div>Loading...</div>}
    </Dialog>
  )
}