// src/components/crud/core/CrudForm.tsx
import type React from 'react'
import {
  useForm,
  type FieldValues,
  type Path,
  type DefaultValues,
  type SubmitHandler,
  Controller,
  type Resolver
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z, ZodTypeAny } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface FormField<TValues extends FieldValues> {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'file' | 'select' | 'textarea' | 'custom'
  placeholder?: string
  component?: React.ComponentType<any>
  componentProps?: any
  formatter?: (value: any) => string
  parser?: (value: string) => any
  visible?: (values: TValues) => boolean
  disabled?: boolean
  options?: { label: string; value: string }[]
  render?: (args: { value: any; onChange: (v: any) => void; error?: string }) => React.ReactNode
}

type ValuesOf<TSchema extends ZodTypeAny> = z.infer<TSchema> & FieldValues

interface CrudFormProps<TSchema extends ZodTypeAny> {
  schema: TSchema
  onSubmit: (data: ValuesOf<TSchema>) => Promise<void>
  defaultValues?: DefaultValues<ValuesOf<TSchema>>
  fields: FormField<ValuesOf<TSchema>>[]
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
}

export function CrudForm<TSchema extends ZodTypeAny>({
  schema,
  onSubmit,
  defaultValues,
  fields,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  onCancel
}: CrudFormProps<TSchema>) {
  type T = ValuesOf<TSchema>

  const resolver = zodResolver(schema as any) as Resolver<T>

  const form = useForm<T>({
    resolver,
    defaultValues
  })

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset, control } = form
  const watchedValues = watch()

  const handleFormSubmit: SubmitHandler<T> = async (data) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {fields.map((field) => {
        const isVisible = field.visible ? field.visible(watchedValues as T) : true
        if (!isVisible) return null

        const fieldName = field.name as Path<T>
        const fieldError = (errors as any)?.[fieldName]
        const errorMsg: string | undefined = (fieldError?.message as string | undefined) ?? undefined

        if (field.render) {
          const renderFn = field.render
          return (
            <Controller<T>
              key={field.name}
              control={control}
              name={fieldName}
              render={({ field: ctl }) => (
                <div className="space-y-2">
                  {field.label ? <Label htmlFor={field.name}>{field.label}</Label> : null}
                  {renderFn({ value: ctl.value, onChange: ctl.onChange, error: errorMsg })}
                  {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                </div>
              )}
            />
          )
        }

        if (field.type === 'select') {
          return (
            <Controller<T>
              key={field.name}
              control={control}
              name={fieldName}
              render={({ field: ctl }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Select
                    value={(ctl.value ?? '') as string}
                    onValueChange={(v) => ctl.onChange(field.parser ? field.parser(v) : v)}
                    disabled={isSubmitting || field.disabled}
                  >
                    <SelectTrigger id={field.name} className={`w-full ${errorMsg ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                </div>
              )}
            />
          )
        }

        if (field.type === 'textarea') {
          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Textarea
                id={field.name}
                placeholder={field.placeholder}
                disabled={isSubmitting || field.disabled}
                className={errorMsg ? 'border-red-300' : ''}
                {...register(fieldName, { setValueAs: field.parser })}
                {...field.componentProps}
              />
              {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
            </div>
          )
        }

        if (field.type === 'file') {
          return (
            <Controller<T>
              key={field.name}
              control={control}
              name={fieldName}
              render={({ field: ctl }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    type="file"
                    placeholder={field.placeholder}
                    disabled={isSubmitting || field.disabled}
                    className={errorMsg ? 'border-red-300' : ''}
                    onChange={(e) => ctl.onChange((e.target as HTMLInputElement).files?.[0] ?? null)}
                    {...field.componentProps}
                  />
                  {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                </div>
              )}
            />
          )
        }

        const Component = field.component || Input

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Component
              id={field.name}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              disabled={isSubmitting || field.disabled}
              className={errorMsg ? 'border-red-300' : ''}
              {...register(fieldName, { setValueAs: field.parser })}
              {...field.componentProps}
            />
            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
          </div>
        )
      })}

      <DialogFooter>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
