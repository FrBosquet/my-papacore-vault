import type { MarkdownPage } from '@blacksmithgu/datacore'
import { getFile, getLeaf, isInvalidFilename } from '../../../utils/files'
import { createNewGame } from '../../../utils/templater'
import { Button } from '../../shared/button'
import {
  Dialog,
  type Props as DialogProps,
  useDialog,
} from '../../shared/dialog'
import { InputField, type InputOnChange } from '../input-field'
import { Tabs } from '../tabs'
import { HLTBTab } from './hltb-tab'
import { InstantGamingTab } from './instant-gaming-tab'
import { MetacriticTab } from './metacritic-tab'
import { SteamGridTab } from './steam-grid-tab'

const tabs = ['steam-grid', 'hltb', 'metacritic', 'instant-gaming'] as const

type Props = {
  steamGridApiKey: string
  file?: MarkdownPage
  triggerProps?: DialogProps['triggerProps']
}

export const GameStudioModal = ({
  steamGridApiKey,
  file,
  triggerProps,
}: Props) => {
  const { ref: dialogRef, close } = useDialog()
  const [activeTab, setActiveTab] = dc.useState<(typeof tabs)[number]>(tabs[0])
  const [formState, setFormState] = dc.useState({
    name: file?.$name ?? '',
    year: (file?.value('year') ?? '') as string,
    image: (file?.value('image') ?? '') as string,
    hltb: (file?.value('hltb') ?? '') as string,
    metacritic: (file?.value('metacritic') ?? '') as string,
    price: (file?.value('price') ?? '') as string,
  })
  const [errors, setErrors] = dc.useState<Record<string, string>>({})

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)

    // If its a new game, use the file name, otherwise use the form data
    const name = file ? file.$name : (formData.get('name') as string)
    const year = formData.get('year') as string
    const image = formData.get('image') as string
    const hltb = formData.get('hltb') as string
    const metacritic = formData.get('metacritic') as string
    const price = formData.get('price') as string

    // If its a new game, create the file
    if (!file) {
      await createNewGame(name)
    }

    // Edit frontmatter of the file
    const targetFile = getFile(`Gaming/Games/${name}.md`)
    if (targetFile) {
      await dc.app.fileManager.processFrontMatter(targetFile, (frontmatter) => {
        frontmatter.year = year
        frontmatter.image = image
        frontmatter.hltb = +hltb
        frontmatter.metacritic = +metacritic
        frontmatter.price = +price
      })
      getLeaf(true).openFile(targetFile)
    }

    close()
  }

  const handleChange: InputOnChange = (e) => {
    const fieldName =
      ((e.target as HTMLInputElement)?.name as keyof typeof formState) ?? ''

    const value = (e.target as HTMLInputElement)?.value ?? ''

    setFormState((prev) => ({
      ...prev,
      [fieldName]: value,
    }))

    if (fieldName === 'name') {
      const isEmpty = value.trim() === ''

      if (isEmpty || !isInvalidFilename(value)) {
        setErrors((prev) => ({
          ...prev,
          name: '',
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          name: 'Invalid file name. Avoid slashes, colons, and symbols forbidden on Windows or in wikilinks. Apostrophes and spaces are fine.',
        }))
      }
    }
  }

  const injectValue = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const hasErrors = Object.values(errors).some(Boolean)

  return (
    <Dialog
      dialogRef={dialogRef}
      className="h-full max-w-[calc(100vw-10rem)]"
      title="Game studio"
      triggerProps={{
        icon: 'plus',
        size: 'icon-xs',
        ...(triggerProps ?? {}),
      }}
    >
      <div className="flex h-full gap-4 overflow-hidden">
        {/* form */}
        <form
          className="flex-1 overflow-hidden flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-6 flex-1 overflow-y-scroll">
            {formState.image && <img src={formState.image} alt="Game hero" />}
            <InputField
              error={errors.name}
              value={formState.name}
              onChange={handleChange}
              label="Game name"
              id="name"
              placeholder="Game name"
              helpText="Also used as the note file name. Avoid slashes, colons, and symbols forbidden on Windows or in wikilinks. Apostrophes and spaces are fine."
              disabled={!!file}
              defaultValue={formState?.name}
            />
            <InputField
              disabled={!formState.name}
              value={formState.image}
              onChange={handleChange}
              onFocus={() => {
                setActiveTab('steam-grid')
              }}
              label="Hero"
              id="image"
              placeholder="Url of the hero image"
              helpText="Url of the hero image for the game"
            />
            <InputField
              disabled={!formState.name}
              value={formState.year}
              onChange={handleChange}
              onFocus={() => {
                setActiveTab('steam-grid')
              }}
              label="Year"
              id="year"
              placeholder="Year"
              helpText="When was this game released"
              type="number"
            />
            <InputField
              disabled={!formState.name}
              value={formState.hltb}
              onChange={handleChange}
              onFocus={() => {
                setActiveTab('hltb')
              }}
              label="How long to beat"
              id="hltb"
              placeholder="How long to beat this game on average"
              helpText="Average time to complete this game. It indicates if its worth to commit to it or not."
              type="number"
            />
            <InputField
              disabled={!formState.name}
              value={formState.metacritic}
              onChange={handleChange}
              onFocus={() => {
                setActiveTab('metacritic')
              }}
              label="Score"
              id="metacritic"
              placeholder="Score"
              helpText="Score of the game. It indicates if its worth to commit to it or not. It could be a metacritic score, an steam score, or other source. MEasured from 0 to 100"
              type="number"
            />
            <InputField
              disabled={!formState.name}
              value={formState.price}
              onChange={handleChange}
              onFocus={() => {
                setActiveTab('instant-gaming')
              }}
              step="0.01"
              label="Price"
              id="price"
              placeholder="Price"
              helpText="Price of the game. It indicates if its worth to commit to it or not. It could be a steam price, an instant gaming price, or other source. Measured in euros."
              type="number"
            />
          </div>
          <footer className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                close()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formState.name || hasErrors}>
              Save
            </Button>
          </footer>
        </form>
        {/* helpers */}
        <div className="flex-1 h-full overflow-hidden">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabContent={{
              hltb: <HLTBTab name={formState.name} />,
              metacritic: <MetacriticTab name={formState.name} />,
              'instant-gaming': <InstantGamingTab name={formState.name} />,
              'steam-grid': (
                <SteamGridTab
                  isEditing={!!file}
                  name={formState.name}
                  injectValue={injectValue}
                  formData={formState}
                  apiKey={steamGridApiKey}
                />
              ),
            }}
          />
        </div>
      </div>
    </Dialog>
  )
}
