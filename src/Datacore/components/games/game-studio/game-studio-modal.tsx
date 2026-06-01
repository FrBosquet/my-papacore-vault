import { Button } from '../../shared/button'
import { Dialog, useDialog } from '../../shared/dialog'
import { InputField, type InputOnChange } from '../input-field'
import { Tabs } from '../tabs'
import { HLTBTab } from './hltb-tab'
import { InstantGamingTab } from './instant-gaming-tab'
import { MetacriticTab } from './metacritic-tab'
import { SteamGridTab } from './steam-grid-tab'

type Props = {
  steamGridApiKey: string
}

const tabs = ['steam-grid', 'hltb', 'metacritic', 'instant-gaming'] as const

export const GameStudioModal = ({ steamGridApiKey }: Props) => {
  const { ref: dialogRef, close } = useDialog()
  const [activeTab, setActiveTab] = dc.useState<(typeof tabs)[number]>(tabs[0])
  const [formData, setFormData] = dc.useState({
    name: '',
    year: '',
    image: '',
    hltb: '',
    metacritic: '',
    price: '',
  })

  // const handleSubmit = async (e: Event) => {
  //   e.preventDefault()
  //   const formData = new FormData(e.target as HTMLFormElement)
  //   const title = formData.get('title') as string

  //   await createNewGame(title)

  //   const file = getFile(`Gaming/Games/${title}.md`)
  //   if (file) {
  //     getLeaf(true).openFile(file)
  //   }

  //   close()
  // }

  const handleChange: InputOnChange = (e) => {
    const fieldName =
      ((e.target as HTMLInputElement)?.name as keyof typeof formData) ?? ''
    setFormData((prev) => ({
      ...prev,
      [fieldName]: (e.target as HTMLInputElement)?.value ?? '',
    }))
  }

  const injectValue = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog
      dialogRef={dialogRef}
      className="h-full max-w-[calc(100vw-10rem)]"
      title="Game studio"
      triggerProps={{
        icon: 'plus',
        size: 'icon-xs',
      }}
    >
      <div className="flex h-full gap-4 overflow-hidden">
        {/* form */}
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <form className="flex flex-col gap-6 flex-1 overflow-y-scroll">
            {formData.image && <img src={formData.image} alt="Game hero" />}
            <InputField
              value={formData.name}
              onChange={handleChange}
              label="Game name"
              id="name"
              placeholder="Game name"
              helpText="The name of the game you are creating. Its also the file name of the note, so you should avoid special characters like : or /."
            />
            <InputField
              disabled={!formData.name}
              value={formData.image}
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
              disabled={!formData.name}
              value={formData.year}
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
              disabled={!formData.name}
              value={formData.hltb}
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
              disabled={!formData.name}
              value={formData.metacritic}
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
              disabled={!formData.name}
              value={formData.price}
              onChange={handleChange}
              onFocus={() => {
                setActiveTab('instant-gaming')
              }}
              label="Price"
              id="price"
              placeholder="Price"
              helpText="Price of the game. It indicates if its worth to commit to it or not. It could be a steam price, an instant gaming price, or other source. Measured in euros."
              type="number"
            />
          </form>
          <footer className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                close()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name}
              form="game-studio-form"
            >
              Save
            </Button>
          </footer>
        </div>
        {/* helpers */}
        <div className="flex-1 h-full overflow-hidden">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabContent={{
              hltb: <HLTBTab name={formData.name} />,
              metacritic: <MetacriticTab name={formData.name} />,
              'instant-gaming': <InstantGamingTab name={formData.name} />,
              'steam-grid': (
                <SteamGridTab
                  name={formData.name}
                  injectValue={injectValue}
                  formData={formData}
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
