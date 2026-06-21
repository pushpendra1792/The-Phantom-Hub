export default function Badge({ children, variant = 'purple' }) {
  return (
    <span className={`badge-${variant}`}>
      {children}
    </span>
  )
}
