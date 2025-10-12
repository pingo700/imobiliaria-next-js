"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface SearchOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  content?: React.ReactNode
  keywords?: string[]
}

interface SearchComboBoxProps {
  options: SearchOption[]
  placeholder?: string
  className?: string
  emptyMessage?: string
  defaultIcon?: React.ComponentType<{ className?: string }>
  value?: string
  onValueChange?: (value: string | undefined) => void
  onSelect?: (value: string) => void
  onSearchChange?: (q: string) => void
  loading?: boolean
  shouldFilter?: boolean
}

export function SearchComboBox({
  options,
  placeholder = "Search options...",
  className,
  emptyMessage = "No options found.",
  defaultIcon: DefaultIcon = Search,
  value,
  onValueChange,
  onSelect,
  onSearchChange,
  loading = false,
  shouldFilter = true,
}: SearchComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [internalValue, setInternalValue] = React.useState<string | undefined>(undefined)
  const selected = value ?? internalValue
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const selectedOption = React.useMemo(() => {
    if (!selected) return undefined
    return options.find(o => o.value === selected)
  }, [selected, options])

  const displayLabel = selectedOption?.label

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const digits = (s: string) => s.replace(/\D/g, "")

  const searchString = React.useCallback((o: SearchOption) => {
    const base = [o.label, ...(o.keywords ?? [])].join(" ")
    const extra = [normalize(o.label), digits(o.label), ...(o.keywords ?? []).map(k => normalize(k)).concat((o.keywords ?? []).map(k => digits(k)))].join(" ")
    return `${base} ${extra}`.trim()
  }, [])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) setQuery("")
  }

  const handleSelect = (id: string) => {
    setInternalValue(id)
    onValueChange?.(id)
    onSelect?.(id)
    setOpen(false)
    setQuery("")
  }

  const clearSelection = () => {
    setInternalValue(undefined)
    onValueChange?.(undefined)
    setOpen(false)
    setQuery("")
  }

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-input border-border hover:bg-secondary/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className={cn("truncate text-left", !displayLabel && "text-muted-foreground")}>
                {displayLabel || placeholder}
              </span>
            </div>
            {selected && (
              <div
                role="button"
                tabIndex={0}
                className="h-4 w-4 p-0 hover:bg-accent hover:text-accent-foreground rounded-full flex-shrink-0 transition-colors duration-150 cursor-pointer inline-flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation()
                  clearSelection()
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    clearSelection()
                  }
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 bg-popover border-border shadow-lg rounded-lg"
          align="start"
          style={{ width: triggerRef.current?.offsetWidth }}
        >
          <Command shouldFilter={shouldFilter}>
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={(v) => {
                setQuery(v)
                onSearchChange?.(v)
              }}
              className="border-0 focus:ring-0 bg-transparent"
            />
            <CommandList className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Carregando…</div>
              ) : (
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</CommandEmpty>
              )}
              <CommandGroup>
                {options.map((option) => {
                  const IconComponent = option.icon || DefaultIcon
                  const searchable = searchString(option)
                  return (
                    <CommandItem
                      key={option.value}
                      value={searchable}
                      onSelect={() => handleSelect(option.value)}
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-150 rounded-md mx-1"
                    >
                      <IconComponent className="mr-2 h-4 w-4 opacity-50" />
                      <div className="flex-1">{option.content || <span>{option.label}</span>}</div>
                      {selected === option.value && <div className="ml-2 h-2 w-2 rounded-full bg-primary" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
