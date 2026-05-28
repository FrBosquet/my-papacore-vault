import type { ComponentProps } from 'preact'
import { classMerge } from '../../utils/classMerge'

export type InputProps = ComponentProps<'input'>
export type InputOnChange = InputProps['onChange']

interface Props {
  label?: string
  value?: string
  onFocus?: () => void
  id: string
  type?: string
  placeholder?: string
  helpText?: string
  pattern?: string
  onChange?: InputOnChange
  disabled?: boolean
}

export const InputField = ({
  label,
  value,
  onFocus,
  id,
  type = 'text',
  placeholder,
  helpText,
  pattern,
  onChange,
  disabled,
}: Props) => {
  return (
    <label htmlFor={id} className={classMerge("w-full flex flex-col gap-1", disabled && "opacity-50")}>
      <h3 className="uppercase font-semibold text-xs text-green-400 m-0">
        {label}
      </h3>
      {helpText && <p className="text-primary-500 text-xs">{helpText}</p>}
      <input
        disabled={disabled}
        onFocus={onFocus}
        value={value}
        onChange={onChange}
        pattern={pattern}
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        className="w-full"
      />
    </label>
  )
}
