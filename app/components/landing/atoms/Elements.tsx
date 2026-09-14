import Link from 'next/link'
import type { ReactNode } from 'react'

export interface ActionButtonProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'secondary-light'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  ariaLabel?: string
}

export function ActionLink({
  href,
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  ariaLabel,
  onClick,
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'secondary-light'
  disabled?: boolean
  className?: string
  ariaLabel?: string
  onClick?: () => void
}) {
  return (
    <Link
      href={disabled ? '#' : href}
      className={`landing-button ${variant} ${disabled ? 'disabled' : ''} ${className}`.trim()}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      tabIndex={disabled ? -1 : undefined}
    >
      {children}
    </Link>
  )
}

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
  ariaLabel,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`landing-button ${variant} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

export function Brand() {
  return (
    <Link href="/" className="landing-brand" aria-label="Colegio Militar, inicio institucional">
      <div className="landing-brand-crest" aria-hidden="true">
        <span>⚔</span>
      </div>
      <div className="landing-brand-text">
        <span className="landing-brand-title">COLEGIO MILITAR</span>
        <span className="landing-brand-subtitle">Honor · Disciplina · Ciencia</span>
      </div>
    </Link>
  )
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`landing-badge ${className}`.trim()}>{children}</span>
}

export function Placeholder({
  label,
  aspectRatio = '16 / 9',
  icon = '🏛️',
  ratioLabel = '16:9 · Formato Institucional',
}: {
  label: string
  aspectRatio?: string
  icon?: string
  ratioLabel?: string
}) {
  return (
    <div className="landing-placeholder" style={{ aspectRatio }}>
      <div className="landing-placeholder-icon" aria-hidden="true">
        <span>{icon}</span>
      </div>
      <span className="landing-placeholder-label">{label}</span>
      <span className="landing-placeholder-ratio">{ratioLabel}</span>
    </div>
  )
}

export function SectionTitle({
  number,
  title,
  description,
  align = 'left',
}: {
  number?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  return (
    <div className="landing-section-header" style={{ textAlign: align }}>
      {number && <span className="landing-eyebrow">{number}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}

export function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  required = false,
  helperText,
  error,
  value,
  onChange,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  helperText?: string
  error?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}) {
  const hasError = Boolean(error)
  return (
    <div className={`landing-field ${hasError ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="required" title="Campo obligatorio">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          rows={4}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        />
      )}
      {error && (
        <span id={`${id}-error`} className="landing-field-error-msg" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${id}-helper`} className="landing-field-helper">
          {helperText}
        </span>
      )}
    </div>
  )
}
