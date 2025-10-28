"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TechnicianModal({ isOpen, onClose, onSave, technician, specialties = [] }) {
  const [formData, setFormData] = useState({
    id_tecnico: null,
    id_persona: null,
    nombre: "",
    documento: "",
    correo: "",
    telefono: "",
    especialidades: [],
  })

  useEffect(() => {
    if (technician) {
      setFormData({
        id_tecnico: technician.id_tecnico,
        id_persona: technician.id_persona,
        nombre: technician.nombre || "",
        documento: technician.documento || "",
        correo: technician.correo || "",
        telefono: technician.telefono || "",
        especialidades: (technician.especialidades || []).map((esp) => esp.id_especialidad.toString()),
      })
    } else {
      setFormData({
        id_tecnico: null,
        id_persona: null,
        nombre: "",
        documento: "",
        correo: "",
        telefono: "",
        especialidades: [],
      })
    }
  }, [technician, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nombre || !formData.documento) {
      alert("Nombre y documento son obligatorios")
      return
    }

    onSave({
      ...formData,
      especialidades: formData.especialidades.map((id) => Number(id)),
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-semibold text-foreground">
            {technician ? "Editar Técnico" : "Nuevo Técnico"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Carlos Rodríguez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento">Documento</Label>
            <Input
              id="documento"
              type="text"
              value={formData.documento}
              onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
              placeholder="12345678"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="tecnico@empresa.com.ar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="11-4567-8901"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Especialidades</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto rounded-md border border-border p-3">
              {specialties.length === 0 && (
                <span className="text-xs text-muted-foreground">No hay especialidades registradas</span>
              )}
              {specialties.map((specialty) => {
                const isSelected = formData.especialidades.includes(specialty.id_especialidad.toString())
                return (
                  <label key={specialty.id_especialidad} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        setFormData((prev) => {
                          if (isChecked) {
                            return {
                              ...prev,
                              especialidades: [...prev.especialidades, specialty.id_especialidad.toString()],
                            }
                          }
                          return {
                            ...prev,
                            especialidades: prev.especialidades.filter((id) => id !== specialty.id_especialidad.toString()),
                          }
                        })
                      }}
                    />
                    <span>{specialty.especialidad}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Las especialidades seleccionadas se asociarán al técnico en la tabla Tecnico_Especialidad.
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
