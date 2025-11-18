import { Button } from './button'

export const ButtonStories = () => {
  return (
    <>
      <h2>Default:</h2>
      <div className="flex items-center gap-2">
        <Button disabled>Default</Button>
        <Button size="sm">Default</Button>
        <Button>Default</Button>
        <Button size="lg">Default</Button>
      </div>
      <h2>Secondary:</h2>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled>
          Default
        </Button>
        <Button variant="secondary" size="sm">
          Default
        </Button>
        <Button variant="secondary">Default</Button>
        <Button variant="secondary" size="lg">
          Default
        </Button>
      </div>
      <h2>Warning:</h2>
      <div className="flex items-center gap-2">
        <Button variant="warning" disabled>
          Default
        </Button>
        <Button variant="warning" size="sm">
          Default
        </Button>
        <Button variant="warning">Default</Button>
        <Button variant="warning" size="lg">
          Default
        </Button>
      </div>
      <h2>Icons:</h2>
      <div className="flex items-center gap-2">
        <Button variant="default" icon="disc-2">
          Default
        </Button>
        <Button variant="secondary" icon="disc-2">
          Default
        </Button>
        <Button variant="warning" icon="disc-2">
          Default
        </Button>
        <Button icon="pencil" size='icon' tooltip='I have an icon' />
        <Button icon="pencil" size='icon-xs' tooltip='I have an smaller icon' />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button variant="default" iconRight="disc-2" size="sm">
          Default
        </Button>
        <Button variant="secondary" iconRight="disc-2">
          Default
        </Button>
        <Button variant="warning" iconRight="trash" size="lg">
          Default
        </Button>
      </div>
    </>
  )
}
