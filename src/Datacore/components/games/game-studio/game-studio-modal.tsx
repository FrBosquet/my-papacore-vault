import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { ComponentChildren } from 'preact'
import { classMerge } from '../../../utils/classMerge'
import { getFile, getLeaf, sanitizeFilename } from '../../../utils/files'
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
import { SteamGridTab, type SteamSuggestions } from './steam-grid-tab'

const tabs = ['steam-grid', 'hltb', 'metacritic', 'instant-gaming'] as const

type SuggestionField =
  | 'name'
  | 'year'
  | 'image'
  | 'hltb'
  | 'metacritic'
  | 'price'

type Props = {
  file?: MarkdownPage
  triggerProps?: DialogProps['triggerProps']
}

const SuggestionButton = ({
  value,
  current,
  label,
  className,
  onApply,
}: {
  value?: string
  current: string
  label: ComponentChildren
  className?: string
  onApply: () => void
}) => {
  if (!value || current === value) return null

  return (
    <Button
      size="sm"
      variant="secondary"
      className={classMerge('shrink-0', className)}
      tooltip="Copy to form"
      onClick={onApply}
    >
      {label}
    </Button>
  )
}

export const GameStudioModal = ({ file, triggerProps }: Props) => {
  const { ref: dialogRef, close } = useDialog()
  const [activeTab, setActiveTab] = dc.useState<(typeof tabs)[number]>(tabs[0])
  const [mobileHelpersMode, setMobileHelpersMode] = dc.useState<boolean>(false)
  const [formState, setFormState] = dc.useState({
    name: file?.$name ?? '',
    year: (file?.value('year') ?? '') as string,
    image: (file?.value('image') ?? '') as string,
    hltb: (file?.value('hltb') ?? '') as string,
    metacritic: (file?.value('metacritic') ?? '') as string,
    price: (file?.value('price') ?? '') as string,
  })
  const [errors, setErrors] = dc.useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = dc.useState<
    Partial<Record<SuggestionField, string>>
  >({})
  const suggestionsRef = dc.useRef(suggestions)
  suggestionsRef.current = suggestions

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    const isNewGame = !file

    const formData = new FormData(e.target as HTMLFormElement)

    // If its a new game, use the file name, otherwise use the form data
    const rawName = isNewGame ? String(formData.get('name') ?? '') : file.$name
    const name = isNewGame ? sanitizeFilename(rawName) : rawName
    const year = formData.get('year') as string
    const image = formData.get('image') as string
    const hltb = formData.get('hltb') as string
    const metacritic = formData.get('metacritic') as string
    const price = formData.get('price') as string

    if (isNewGame && !name) {
      setErrors((prev) => ({
        ...prev,
        name: 'This title has no characters that can be used in a file name.',
      }))
      return
    }

    // If its a new game, create the file
    const createdFile = !file ? await createNewGame(name) : undefined

    // Edit frontmatter of the file
    const targetFile = createdFile ?? getFile(`Gaming/Games/${name}.md`)
    if (targetFile) {
      await dc.app.fileManager.processFrontMatter(targetFile, (frontmatter) => {
        frontmatter.year = year
        frontmatter.image = image
        frontmatter.hltb = +hltb
        frontmatter.metacritic = +metacritic
        frontmatter.price = +price
      })

      if (isNewGame) {
        getLeaf(true).openFile(targetFile)
      }
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
      const filename = sanitizeFilename(value)

      setErrors((prev) => ({
        ...prev,
        name:
          isEmpty || filename
            ? ''
            : 'This title has no characters that can be used in a file name.',
      }))
    }
  }

  const injectValue = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const setSuggestion = (field: SuggestionField, value?: string) => {
    if (suggestionsRef.current[field] === value) return
    const next = { ...suggestionsRef.current, [field]: value }
    suggestionsRef.current = next
    setSuggestions(next)
  }

  const setSteamSuggestions = (update: SteamSuggestions) => {
    const prev = suggestionsRef.current
    const next = {
      ...prev,
      ...(update.clear
        ? { name: undefined, year: undefined, image: undefined }
        : {
            ...(update.name !== undefined
              ? { name: update.name || undefined }
              : {}),
            ...(update.year !== undefined
              ? { year: update.year || undefined }
              : {}),
            ...(update.image !== undefined
              ? { image: update.image || undefined }
              : {}),
          }),
    }

    if (
      next.name === prev.name &&
      next.year === prev.year &&
      next.image === prev.image
    ) {
      return
    }

    suggestionsRef.current = next
    setSuggestions(next)
  }

  const suggestionFields: SuggestionField[] = [
    'name',
    'year',
    'image',
    'hltb',
    'metacritic',
    'price',
  ]
  const hasPendingSuggestions = suggestionFields.some(
    (field) =>
      suggestions[field] &&
      String(formState[field] ?? '') !== suggestions[field]
  )

  const applyAllSuggestions = () => {
    setFormState((prev) => ({
      ...prev,
      ...(suggestions.name && !file ? { name: suggestions.name } : {}),
      ...(suggestions.year ? { year: suggestions.year } : {}),
      ...(suggestions.image ? { image: suggestions.image } : {}),
      ...(suggestions.hltb ? { hltb: suggestions.hltb } : {}),
      ...(suggestions.metacritic ? { metacritic: suggestions.metacritic } : {}),
      ...(suggestions.price ? { price: suggestions.price } : {}),
    }))
  }

  const hasErrors = Object.values(errors).some(Boolean)
  const isMobile = dc.app.isMobile

  return (
    <Dialog
      dialogRef={dialogRef}
      className="h-full w-screen sm:max-w-[calc(100vw-10rem)] max-md:h-[calc(100vh-10rem)]"
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
          className={classMerge(
            'flex-1 overflow-hidden flex flex-col gap-4',
            isMobile && 'w-full',
            isMobile && mobileHelpersMode && 'hidden'
          )}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-6 flex-1 overflow-y-scroll">
            {formState.image && (
              <img
                src={formState.image}
                alt="Game hero"
                className="max-h-[200px] max-w-full object-contain"
              />
            )}
            <InputField
              error={errors.name}
              value={formState.name}
              onChange={handleChange}
              label="Game name"
              id="name"
              placeholder="Game name"
              helpText="Also used as the note file name. Colons and other symbols that cannot go in a file name are removed. Apostrophes and spaces are kept."
              disabled={!!file}
              defaultValue={formState?.name}
              action={
                <SuggestionButton
                  value={suggestions.name}
                  current={String(formState.name ?? '')}
                  label={suggestions.name ?? ''}
                  className="max-w-40 truncate"
                  onApply={() => injectValue('name', suggestions.name ?? '')}
                />
              }
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
              action={
                <SuggestionButton
                  value={suggestions.image}
                  current={String(formState.image ?? '')}
                  label={
                    <img
                      src={suggestions.image}
                      alt=""
                      className="h-5 w-8 object-cover"
                    />
                  }
                  onApply={() => injectValue('image', suggestions.image ?? '')}
                />
              }
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
              action={
                <SuggestionButton
                  value={suggestions.year}
                  current={String(formState.year ?? '')}
                  label={suggestions.year ?? ''}
                  onApply={() => injectValue('year', suggestions.year ?? '')}
                />
              }
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
              action={
                <SuggestionButton
                  value={suggestions.hltb}
                  current={String(formState.hltb ?? '')}
                  label={`${suggestions.hltb} h`}
                  onApply={() => injectValue('hltb', suggestions.hltb ?? '')}
                />
              }
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
              action={
                <SuggestionButton
                  value={suggestions.metacritic}
                  current={String(formState.metacritic ?? '')}
                  label={suggestions.metacritic ?? ''}
                  onApply={() =>
                    injectValue('metacritic', suggestions.metacritic ?? '')
                  }
                />
              }
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
              action={
                <SuggestionButton
                  value={suggestions.price}
                  current={String(formState.price ?? '')}
                  label={`${suggestions.price} €`}
                  onApply={() => injectValue('price', suggestions.price ?? '')}
                />
              }
            />
          </div>
          <footer className="flex justify-end gap-2">
            {hasPendingSuggestions && (
              <Button
                variant="secondary"
                className="mr-auto"
                onClick={applyAllSuggestions}
              >
                Copy all suggestions
              </Button>
            )}
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
              hltb: (
                <HLTBTab
                  name={formState.name}
                  onValue={(hours) => setSuggestion('hltb', hours)}
                />
              ),
              metacritic: (
                <MetacriticTab
                  name={formState.name}
                  onValue={(score) => setSuggestion('metacritic', score)}
                />
              ),
              'instant-gaming': (
                <InstantGamingTab
                  name={formState.name}
                  onValue={(price) => setSuggestion('price', price)}
                />
              ),
              'steam-grid': (
                <SteamGridTab
                  isEditing={!!file}
                  name={formState.name}
                  injectValue={injectValue}
                  onSuggest={setSteamSuggestions}
                />
              ),
            }}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        className={isMobile ? '' : 'hidden'}
        onClick={() => {
          setMobileHelpersMode(!mobileHelpersMode)
        }}
      >
        {mobileHelpersMode ? 'Form' : 'Helpers'}
      </Button>
    </Dialog>
  )
}
