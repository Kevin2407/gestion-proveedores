"use client"

import { useState, useEffect } from "react"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RatingModal({ isOpen, onClose, onSave, rating }) {
  const [formData, setFormData] = useState({
    proveedor: "",
    fecha: new Date().toISOString().split("T")[0],
    calificacion: 5,
    aspecto: "",
    evaluador: "",
    comentarios: "",
  })

  useEffect(() => {
    if (rating) {
      setFormData(rating)
    } else {
      setFormData({
        proveedor: "",
        fecha: new Date().toISOString().split("T")[0],
        calificacion: 5,
        aspecto: "",
        evaluador: "",
        comentarios: "",
      })
    }
  }, [rating, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
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
            <Label htmlFor="fecha">Fecha de Evaluación</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aspecto">Aspecto Evaluado</Label>
            <select
              id="aspecto"
              value={formData.aspecto}
              onChange={(e) => setFormData({ ...formData, aspecto: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Seleccionar aspecto</option>
              <option value="Calidad de productos">Calidad de productos</option>
              <option value="Tiempo de entrega">Tiempo de entrega</option>
              <option value="Servicio postventa">Servicio postventa</option>
              <option value="Atención al cliente">Atención al cliente</option>
              <option value="Precios">Precios</option>
              <option value="Soporte técnico">Soporte técnico</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Calificación (1 a 5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFormData({ ...formData, calificacion: score })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      score <= formData.calificacion
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Puntuación: {formData.calificacion}/5</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluador">Evaluador</Label>
            <Input
              id="evaluador"
              type="text"
              value={formData.evaluador}
              onChange={(e) => setFormData({ ...formData, evaluador: e.target.value })}
              placeholder="Nombre del evaluador"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentarios">Comentarios</Label>
            <textarea
              id="comentarios"
              value={formData.comentarios}
              onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Escriba sus comentarios sobre la evaluación..."
              required
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
