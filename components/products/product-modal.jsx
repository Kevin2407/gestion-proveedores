"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProductModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    id_producto: null,
    nombre_producto: "",
    descripcion: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        id_producto: product.id_producto,
        nombre_producto: product.nombre_producto || "",
        descripcion: product.descripcion || "",
      })
    } else {
      setFormData({
        id_producto: null,
        nombre_producto: "",
        descripcion: "",
      })
    }
  }, [product, isOpen])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!formData.nombre_producto) {
      alert("El nombre del producto es obligatorio")
      return
    }

    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_producto">Nombre</Label>
            <Input
              id="nombre_producto"
              type="text"
              value={formData.nombre_producto}
              onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })}
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe brevemente el producto"
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
