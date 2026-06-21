const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
}

export default function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} border-phantom-purple border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-phantom-gray">{text}</p>
      )}
    </div>
  )
}
