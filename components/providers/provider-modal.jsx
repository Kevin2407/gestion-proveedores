"use client"

import { useState, useEffect } from "react"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProviderModal({ isOpen, onClose, onSave, provider }) {
  const [formData, setFormData] = useState({
    nombre: "",
    cuit: "",
    fechaAlta: new Date().toISOString().split("T")[0],
    direccion: "",
    calificacion: 5,
  })

  useEffect(() => {
    if (provider) {
      setFormData(provider)
    } else {
      setFormData({
        nombre: "",
        cuit: "",
        fechaAlta: new Date().toISOString().split("T")[0],
        direccion: "",
        calificacion: 5,
      })
    }
  }, [provider, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{provider ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuit">CUIT</Label>
            <Input
              id="cuit"
              type="text"
              value={formData.cuit}
              onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
              placeholder="30-12345678-9"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaAlta">Fecha de Alta</Label>
            <Input
              id="fechaAlta"
              type="date"
              value={formData.fechaAlta}
              onChange={(e) => setFormData({ ...formData, fechaAlta: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Calificación (1 a 5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, calificacion: rating })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      rating <= formData.calificacion
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
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
