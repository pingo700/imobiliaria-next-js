'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState
} from '@tanstack/react-table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, RefreshCw, Plus, ArrowUpDown, Edit, Trash2, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import type { CrudAction, BaseEntity } from '../types'

export function CrudHeader({
  title,
  subtitle,
  actions
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

interface CrudTableProps<TData extends BaseEntity> {
  data: TData[]
  columns: ColumnDef<TData>[]
  loading?: boolean
  onRefresh?: () => void
  onCreate?: () => void
  onEdit?: (item: TData) => void
  onDelete?: (id: number) => void
  searchKeys?: (keyof TData)[]
  formatters?: Record<string, (value: any) => string>
  labels?: { singular?: string; plural?: string; create?: string }
  hiddenColumns?: (keyof TData | string)[]
  className?: string
  leftExtras?: React.ReactNode
  customActions?: CrudAction<TData>[]
  createHref?: string
  createButton?: React.ReactNode
}

export function CrudTable<TData extends BaseEntity>({
  data,
  columns: baseColumns,
  loading = false,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  searchKeys = [],
  formatters = {},
  labels = {},
  hiddenColumns = [],
  className,
  leftExtras,
  customActions = [],
  createHref,
  createButton,
}: CrudTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const hiddenSet = useMemo(() => new Set(hiddenColumns.map(String)), [hiddenColumns])
  const visibleBaseColumns = useMemo<ColumnDef<TData>[]>(() => {
    return baseColumns.filter(col => {
      const key =
        ('accessorKey' in col && col.accessorKey ? String(col.accessorKey) : (col.id ? String(col.id) : undefined))
      return key ? !hiddenSet.has(key) : true
    })
  }, [baseColumns, hiddenSet])

  const columns = useMemo<ColumnDef<TData>[]>(() => {
    const actionColumn: ColumnDef<TData> = {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const item = row.original as TData & BaseEntity

        const visibleActions = customActions.filter(action =>
          action.visible ? action.visible(item) : true
        )
        const hasDefaultActions = Boolean(onEdit || onDelete)
        const hasCustomActions = visibleActions.length > 0

        if (!hasDefaultActions && !hasCustomActions) {
          return null
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {visibleActions.map((action) => {
                if (action.render) {
                  return (
                    <div key={action.id}>
                      {action.render(item)}
                    </div>
                  )
                }

                if (action.href) {
                  const href = action.href(item)
                  return (
                    <DropdownMenuItem key={action.id} asChild>
                      <Link
                        href={href}
                        className={cn(
                          action.type === 'destructive' && 'text-destructive focus:text-destructive'
                        )}
                      >
                        {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                        {action.label}
                      </Link>
                    </DropdownMenuItem>
                  )
                }

                return (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => action.onClick?.(item)}
                    disabled={action.disabled ? action.disabled(item) : false}
                    className={cn(
                      action.type === 'destructive' && 'text-destructive focus:text-destructive'
                    )}
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                )
              })}

              {hasCustomActions && hasDefaultActions && <DropdownMenuSeparator />}

              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && item.id && (
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }

    const formattedColumns = visibleBaseColumns.map(col => {
      if ('accessorKey' in col && col.accessorKey && formatters[col.accessorKey as string]) {
        return {
          ...col,
          cell: ({ getValue }: any) => formatters[col.accessorKey as string](getValue())
        }
      }
      return col
    })

    return [...formattedColumns, actionColumn]
  }, [visibleBaseColumns, formatters, onEdit, onDelete, customActions])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      const search = filterValue.toLowerCase()
      if (Array.isArray((searchKeys as any)) && searchKeys.length > 0) {
        return searchKeys.some((key: any) => {
          const value = row.getValue(key as string)
          return value?.toString().toLowerCase().includes(search)
        })
      }
      return Object.values(row.original).some(value =>
        value?.toString().toLowerCase().includes(search)
      )
    }
  })
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()
  const canPrev = table.getCanPreviousPage()
  const canNext = table.getCanNextPage()

  const pages = useMemo<(number | 'ellipsis')[]>(() => {
    const total = pageCount
    const current = pageIndex + 1
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const result: (number | 'ellipsis')[] = [1]
    if (current > 3) result.push('ellipsis')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) result.push(i)

    if (current < total - 2) result.push('ellipsis')
    result.push(total)
    return result
  }, [pageCount, pageIndex])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="relative flex gap-2 items-center">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Buscar ${labels.plural || 'itens'}...`}
            className="pl-8 max-w-sm"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          {leftExtras}
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {labels.create || `Adicionar ${labels.singular || 'item'}`}
            </Button>
          )}
          {(
            createButton ??
            (createHref ? (
              <Button asChild>
                <Link href={createHref}>
                  <Plus className="mr-2 h-4 w-4" />
                  {labels.create || `Adicionar ${labels.singular || 'item'}`}
                </Link>
              </Button>
            ) : onCreate ? (
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {labels.create || `Adicionar ${labels.singular || 'item'}`}
              </Button>
            ) : null)
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isActions = header.column.id === 'actions'
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(isActions && 'w-[120px] text-right')}
                    >
                      {header.isPlaceholder ? null : (
                        <div className={cn('flex items-center', isActions && 'justify-end')}>
                          {header.column.getCanSort() ? (
                            <Button
                              variant="ghost"
                              onClick={() => header.column.toggleSorting()}
                              className="hover:bg-transparent p-0"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {!isActions && <ArrowUpDown className="ml-2 h-4 w-4" />}
                            </Button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Carregando {labels.plural || 'dados'}...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const isActions = cell.column.id === 'actions'
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(isActions && 'w-[120px] text-right')}
                      >
                        <div className={cn(isActions && 'flex justify-end')}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum {labels.singular || 'item'} encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={!canPrev}
              className={!canPrev ? "pointer-events-none opacity-50" : ""}
              onClick={(e) => {
                e.preventDefault()
                if (canPrev) table.previousPage()
              }}
            />
          </PaginationItem>

          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`el-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === pageIndex + 1}
                  onClick={(e) => {
                    e.preventDefault()
                    if (p !== pageIndex + 1) table.setPageIndex(p - 1)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={!canNext}
              className={!canNext ? "pointer-events-none opacity-50" : ""}
              onClick={(e) => {
                e.preventDefault()
                if (canNext) table.nextPage()
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
