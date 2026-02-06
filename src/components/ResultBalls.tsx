interface Props {
  numbers: number[]
  extras?: number[]
  extraColor?: 'red' | 'gold' | 'green' | 'blue' | 'purple'
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-[30px] h-[30px] text-[11px]',
  md: 'w-[36px] h-[36px] text-[13px]',
  lg: 'w-[42px] h-[42px] text-[15px]',
}

const extraStyles: Record<string, string> = {
  red: 'bg-red-100 text-red-800 border-2 border-red-300',
  gold: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300',
  green: 'bg-green-100 text-green-800 border-2 border-green-300',
  blue: 'bg-blue-100 text-blue-800 border-2 border-blue-300',
  purple: 'bg-purple-100 text-purple-800 border-2 border-purple-300',
}

export default function ResultBalls({ numbers, extras = [], extraColor = 'green', size = 'md' }: Props) {
  const s = sizeMap[size]

  return (
    <div className="flex items-center gap-[5px] flex-wrap">
      {numbers.map((n, i) => (
        <span key={i}
          className={`${s} rounded-full inline-flex items-center justify-center font-bold bg-[#edf2fc] text-[#1a3a5c] border-[1.5px] border-[#c0d4ea] shrink-0 hover:scale-110 transition-transform`}>
          {n}
        </span>
      ))}
      {extras.length > 0 && <span className="w-1.5" />}
      {extras.map((n, i) => (
        <span key={`x-${i}`}
          className={`${s} rounded-full inline-flex items-center justify-center font-bold shrink-0 hover:scale-110 transition-transform ${extraStyles[extraColor]}`}>
          {n}
        </span>
      ))}
    </div>
  )
}
