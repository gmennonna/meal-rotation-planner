const ACCENT_CLASS = {
  plan: 'icon-badge-plan',
  free: 'icon-badge-free',
  jolly: 'icon-badge-jolly',
  info: 'icon-badge-info',
}

export function IconBadge({ icon, accent = 'plan', size = 36 }) {
  return (
    <span className={`icon-badge ${ACCENT_CLASS[accent] ?? ACCENT_CLASS.plan}`} style={{ width: size, height: size }}>
      {icon}
    </span>
  )
}
