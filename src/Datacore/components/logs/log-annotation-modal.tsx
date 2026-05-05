import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { Ref } from 'preact'
import { Dialog } from '../shared/dialog'
import { LogAnnotationForm } from './log-annotation-form'

interface Props {
  page: MarkdownPage
  dialogRef: Ref<HTMLDialogElement>
  close: () => void
}

export const LogAnnotationModal = ({ page, dialogRef, close }: Props) => {
  return (
    <Dialog dialogRef={dialogRef} hideTrigger>
      <header className="pb-4 text-sm font-bold uppercase text-green-400 tracking-wider">
        {page.$name}
      </header>
      <LogAnnotationForm targetPage={page} onSubmit={close} />
    </Dialog>
  )
}
