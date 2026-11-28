import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CustomSelectProps {
  list: { value: string; name: string }[]
  value: string
  setValue: (value: string) => void
}

export const CustomSelect = (props: CustomSelectProps) => {
  const { list, value, setValue } = props
  return (
    <Select value={value} onValueChange={(value) => setValue(value)}>
      <SelectTrigger className="w-48 bg-white">
        <SelectValue placeholder="筛选文档" />
      </SelectTrigger>
      <SelectContent>
        {list.map((doc) => (
          <SelectItem key={doc.value} value={doc.value}>
            {doc.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
