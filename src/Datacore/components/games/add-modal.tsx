import { getFile, getLeaf } from '../../utils/files'
import { createNewGame } from '../../utils/templater'
import { Button } from '../shared/button'
import { Dialog, useDialog } from '../shared/dialog'

export const AddGameModal = () => {
  const { ref: dialogRef, close } = useDialog()

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string

    await createNewGame(title)

    const file = getFile(`Gaming/Games/${title}.md`)
    if (file) {
      getLeaf(true).openFile(file)
    }

    close()
  }

  return (
    <Dialog
      dialogRef={dialogRef}
      title="Add game"
      triggerProps={{
        icon: 'plus',
        size: 'icon-xs',
      }}
    >
      <form className="flex flex-col gap-6 items-end" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full"
        />
        <Button type="submit" icon="plus" className="w-auto">
          Create
        </Button>
      </form>
    </Dialog>
  )
}
