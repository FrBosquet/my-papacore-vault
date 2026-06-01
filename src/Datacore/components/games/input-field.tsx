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
  /** For type="number". Defaults to "any" so decimals pass native validation. */
  step?: string
  placeholder?: string
  helpText?: string
  pattern?: string
  onChange?: InputOnChange
  disabled?: boolean
  defaultValue?: string
  error?: string
}

export const InputField = ({
  label,
  value,
  onFocus,
  id,
  type = 'text',
  step,
  placeholder,
  helpText,
  pattern,
  onChange,
  disabled,
  defaultValue,
  error,
}: Props) => {
  return (
    <label
      htmlFor={id}
      className={classMerge(
        'w-full flex flex-col gap-1',
        disabled && 'opacity-50'
      )}
    >
      <h3 className="uppercase font-semibold text-xs text-green-400 m-0">
        {label}
      </h3>
      {helpText && <p className="text-primary-500 text-xs">{helpText}</p>}
      {error && (
        <div className="text-red-700 bg-red-300 p-1 rounded-md text-xs flex items-center gap-2 my-1">
          <dc.Icon icon="alert-circle" />
          <p>{error}</p>
        </div>
      )}
      <input
        disabled={disabled}
        onFocus={onFocus}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        pattern={pattern}
        type={type}
        step={type === 'number' ? (step ?? 'any') : step}
        id={id}
        name={id}
        placeholder={placeholder}
        className="w-full"
      />
    </label>
  )
}
