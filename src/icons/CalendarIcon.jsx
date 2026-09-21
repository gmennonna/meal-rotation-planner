import { IconBase } from './Icon'

export function CalendarIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v4M16 2.5v4" />
    </IconBase>
  )
}
