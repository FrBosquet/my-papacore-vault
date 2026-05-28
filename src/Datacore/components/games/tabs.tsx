import { Button } from "../shared/button"
import type { JSX } from "preact"

type Props<T extends readonly string[]> = {
  tabs: T
  activeTab: T[number]
  setActiveTab: (tab: T[number]) => void
  tabContent: Record<T[number], JSX.Element>
}

export const Tabs = <T extends readonly string[]>({
  tabs,
  activeTab,
  setActiveTab,
  tabContent,
}: Props<T>) => {
  return (
    <section className="h-full flex flex-col overflow-hidden">
      <header className="flex">
        {tabs.map((tab) => (
          <Button variant={activeTab === tab ? 'default' : 'ghost'} key={tab} onClick={() => setActiveTab(tab)}>{tab}</Button>
        ))}
      </header>
      <main className="flex-1 py-2 overflow-hidden">
        {Object.entries(tabContent).map(([tab, content]) => (
          <div key={tab} className={activeTab === tab ? 'contents' : 'hidden'}>{content as JSX.Element}</div>
        ))}
      </main>
    </section>
  )
}
