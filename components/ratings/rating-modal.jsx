"use client"

import { useState, useEffect } from "react"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RatingModal({ isOpen, onClose, onSave, rating, providers = [] }) {
  const [formData, setFormData] = useState({
    id_calificacion: null,
    id_proveedor: "",
    fecha_evaluacion: new Date().toISOString().split("T")[0],
    puntaje: 5,
    comentarios: "",
  })

  useEffect(() => {
    if (rating) {
        setFormData({
        id_calificacion: rating.id_calificacion,
        id_proveedor: rating.id_proveedor?.toString() || "",
        fecha_evaluacion: rating.fecha_evaluacion ? rating.fecha_evaluacion.slice(0, 10) : new Date().toISOString().split("T")[0],
        puntaje: Number(rating.puntaje) || 5,
        comentarios: rating.comentarios || "",
      })
    } else {
      setFormData({
        id_calificacion: null,
        id_proveedor: "",
        fecha_evaluacion: new Date().toISOString().split("T")[0],
        puntaje: 5,
        comentarios: "",
      })
    }
  }, [rating, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      id_proveedor: formData.id_proveedor ? Number(formData.id_proveedor) : null,
      puntaje: Number(formData.puntaje),
    }

    if (!payload.id_proveedor) {
      alert("Debe seleccionar un proveedor")
      return
    }

    onSave(payload)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-semibold text-foreground">
            {rating ? "Editar Calificación" : "Nueva Calificación"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id_proveedor">Proveedor</Label>
            <select
              id="id_proveedor"
              value={formData.id_proveedor}
              onChange={(e) => setFormData({ ...formData, id_proveedor: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Seleccionar proveedor</option>
              {providers.map((provider) => (
                <option key={provider.id_proveedor} value={provider.id_proveedor}>
                  {provider.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_evaluacion">Fecha de Evaluación</Label>
            <Input
              id="fecha_evaluacion"
              type="date"
              value={formData.fecha_evaluacion}
              onChange={(e) => setFormData({ ...formData, fecha_evaluacion: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Calificación (1 a 5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFormData({ ...formData, puntaje: score })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      score <= formData.puntaje
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Puntuación: {formData.puntaje}/5</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentarios">Comentarios</Label>
            <textarea
              id="comentarios"
              value={formData.comentarios}
              onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Escriba sus comentarios sobre la evaluación..."
            />
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
