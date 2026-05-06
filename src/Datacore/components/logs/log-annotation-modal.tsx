import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { Ref } from 'preact'
import { Dialog } from '../shared/dialog'
import { ModalHeader } from '../shared/typography'
import { LogAnnotationForm } from './log-annotation-form'

interface Props {
  page: MarkdownPage
  dialogRef: Ref<HTMLDialogElement>
  close: () => void
}

export const LogAnnotationModal = ({ page, dialogRef, close }: Props) => {
  return (
    <Dialog dialogRef={dialogRef} hideTrigger>
      <ModalHeader>{page.$name}</ModalHeader>
      <LogAnnotationForm targetPage={page} onSubmit={close} />
    </Dialog>
  )
}
