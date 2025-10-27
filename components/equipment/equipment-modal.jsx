"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EquipmentModal({ isOpen, onClose, onSave, equipment }) {
  const [formData, setFormData] = useState({
    nombre: "",
    serie: "",
    proveedor: "",
    fechaAdquisicion: new Date().toISOString().split("T")[0],
    garantiaHasta: "",
    estado: "En uso",
    ubicacion: "",
  })

  useEffect(() => {
    if (equipment) {
      setFormData(equipment)
    } else {
      setFormData({
        nombre: "",
        serie: "",
        proveedor: "",
        fechaAdquisicion: new Date().toISOString().split("T")[0],
        garantiaHasta: "",
        estado: "En uso",
        ubicacion: "",
      })
    }
  }, [equipment, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-semibold text-foreground">{equipment ? "Editar Equipo" : "Nuevo Equipo"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Equipo</Label>
            <Input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Notebook HP EliteBook 840"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serie">Número de Serie</Label>
            <Input
              id="serie"
              type="text"
              value={formData.serie}
              onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
              placeholder="5CD12345AB"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor</Label>
            <Input
              id="proveedor"
              type="text"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaAdquisicion">Fecha de Adquisición</Label>
            <Input
              id="fechaAdquisicion"
              type="date"
              value={formData.fechaAdquisicion}
              onChange={(e) => setFormData({ ...formData, fechaAdquisicion: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="garantiaHasta">Garantía Hasta</Label>
            <Input
              id="garantiaHasta"
              type="date"
              value={formData.garantiaHasta}
              onChange={(e) => setFormData({ ...formData, garantiaHasta: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Oficina Central"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="En uso">En uso</option>
              <option value="En reparación">En reparación</option>
              <option value="Almacenado">Almacenado</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>
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
