'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge, FormField, SectionTitle } from '../atoms/Elements'

export default function FormularioContacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    nivel: 'basica',
    mensaje: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del postulante o representante es obligatorio.'
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono de contacto es obligatorio.'
    }
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Ingresa un correo electrónico con formato válido.'
    }
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSubmitted(false)
      return
    }

    setErrors({})
    setLoading(true)

    // Simulación de envío de plantilla
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  return (
    <section id="admisiones" className="landing-section tinted-bg">
      {/* Ancla para enlaces antiguos a #contacto */}
      <div id="contacto" style={{ position: 'absolute', top: 0 }} />

      <div className="landing-container">
        <div className="landing-admissions-grid">
          {/* Columna Izquierda: Información de Admisiones */}
          <div className="landing-admissions-info">
            <Badge>Admisiones 2026 - 2027</Badge>
            <SectionTitle
              title="Admisiones y Proceso de Postulación"
              description="El ingreso al Colegio Militar es un compromiso de honor entre la institución, el cadete y su familia para alcanzar la más alta superación."
            />

            <div className="landing-admissions-checklist" role="list" aria-label="Etapas de admisión">
              <div className="landing-checklist-item" role="listitem">
                <div className="landing-checklist-icon" aria-hidden="true">
                  1
                </div>
                <div>
                  <strong style={{ color: '#111827', display: 'block' }}>Registro de Postulación en Línea</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Envío de la ficha inicial del aspirante y recepción de la carpeta informativa institucional.
                  </p>
                </div>
              </div>

              <div className="landing-checklist-item" role="listitem">
                <div className="landing-checklist-icon" aria-hidden="true">
                  2
                </div>
                <div>
                  <strong style={{ color: '#111827', display: 'block' }}>Evaluación Psicotécnica y Médica</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Revisión de aptitud médica, condición física inicial y evaluación pedagógica diagnóstica.
                  </p>
                </div>
              </div>

              <div className="landing-checklist-item" role="listitem">
                <div className="landing-checklist-icon" aria-hidden="true">
                  3
                </div>
                <div>
                  <strong style={{ color: '#111827', display: 'block' }}>Entrevista Institucional de Familia</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Diálogo con el consejo directivo y orientación sobre el régimen disciplinario y académico.
                  </p>
                </div>
              </div>

              <div className="landing-checklist-item" role="listitem">
                <div className="landing-checklist-icon" aria-hidden="true">
                  4
                </div>
                <div>
                  <strong style={{ color: '#111827', display: 'block' }}>Investidura y Ceremonia de Ingreso</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Entrega de insignias y juramento de lealtad a los principios del Colegio Militar.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#111827' }}>
                ¿Ya eres miembro de la comunidad educativa?
              </p>
              <Link href="/login" className="landing-text-link">
                <span>Acceder a la plataforma escolar EVA</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Formulario Semántico */}
          <form
            className="landing-form-container"
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby="form-admissions-title"
          >
            <div>
              <h3 id="form-admissions-title" style={{ marginBottom: '8px' }}>
                Solicitud de Admisión y Visita Guiada
              </h3>
              <p className="landing-form-note" id="form-help-desc">
                Plantilla oficial de postulaciones. Los campos con <span style={{ color: '#DC2626' }}>*</span> son
                obligatorios.
              </p>
            </div>

            <div className="landing-form-row">
              <FormField
                id="adm-nombre"
                label="Nombre completo del aspirante"
                placeholder="Ej. Cadete Carlos Mendoza"
                autoComplete="name"
                required
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                error={errors.nombre}
                helperText="Nombre y apellidos tal como constan en la cédula"
              />

              <FormField
                id="adm-telefono"
                label="Teléfono del representante"
                type="tel"
                placeholder="Ej. 099 123 4567"
                autoComplete="tel"
                required
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                error={errors.telefono}
                helperText="Número de contacto para coordinar la cita"
              />
            </div>

            <div className="landing-form-row">
              <FormField
                id="adm-correo"
                label="Correo electrónico de contacto"
                type="email"
                placeholder="Ej. representante@ejemplo.com"
                autoComplete="email"
                required
                value={formData.correo}
                onChange={(e) => handleChange('correo', e.target.value)}
                error={errors.correo}
                helperText="Para recibir la guía del postulante y fechas de examen"
              />

              <div className="landing-field">
                <label htmlFor="adm-nivel">
                  Nivel de postulación <span className="required">*</span>
                </label>
                <select
                  id="adm-nivel"
                  name="nivel"
                  value={formData.nivel}
                  onChange={(e) => handleChange('nivel', e.target.value)}
                >
                  <option value="inicial">Educación Inicial y Preparatoria (3 a 5 años)</option>
                  <option value="basica">Educación General Básica - EGB (1° a 10°)</option>
                  <option value="bachillerato">Bachillerato General y Técnico Militar</option>
                </select>
                <span className="landing-field-helper">Selecciona el grado lectivo correspondiente</span>
              </div>
            </div>

            <FormField
              id="adm-mensaje"
              label="Observaciones o consultas específicas"
              type="textarea"
              placeholder="Indícanos si el estudiante procede de otra institución o si requieres información sobre becas al mérito..."
              value={formData.mensaje}
              onChange={(e) => handleChange('mensaje', e.target.value)}
              helperText="Opcional. Máximo 500 caracteres"
            />

            <button
              type="submit"
              disabled={loading}
              className="landing-button primary"
              style={{ width: '100%' }}
              aria-describedby="form-help-desc"
            >
              {loading ? (
                'Procesando postulación...'
              ) : (
                <>
                  <span>Enviar Solicitud</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>

            {submitted && (
              <div
                role="status"
                style={{
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '6px',
                  padding: '16px',
                  color: '#92400E',
                  fontSize: '0.9375rem',
                }}
              >
                <strong>✓ Solicitud de plantilla procesada exitosamente.</strong>
                <p style={{ margin: '6px 0 0', fontSize: '0.875rem' }}>
                  Los datos han sido validados correctamente según los parámetros del sistema de diseño.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
