"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProviderModal({ isOpen, onClose, onSave, provider }) {
  const [formData, setFormData] = useState({
    id_proveedor: null,
    id_persona: null,
    id_direccion: null,
    nombre: "",
    documento: "",
    correo: "",
    telefono: "",
    fecha_alta: new Date().toISOString().split("T")[0],
    calle: "",
    numero: "",
    departamento: "",
    codigo_postal: "",
  })

  useEffect(() => {
    if (provider) {
      setFormData({
        id_proveedor: provider.id_proveedor,
        id_persona: provider.id_persona,
        id_direccion: provider.id_direccion,
        nombre: provider.nombre || "",
        documento: provider.documento || "",
        correo: provider.correo || "",
        telefono: provider.telefono || "",
        fecha_alta: provider.fecha_alta ? provider.fecha_alta.slice(0, 10) : new Date().toISOString().split("T")[0],
        calle: provider.calle || "",
        numero: provider.numero ? String(provider.numero) : "",
        departamento: provider.departamento || "",
        codigo_postal: provider.codigo_postal || "",
      })
    } else {
      setFormData({
        id_proveedor: null,
        id_persona: null,
        id_direccion: null,
        nombre: "",
        documento: "",
        correo: "",
        telefono: "",
        fecha_alta: new Date().toISOString().split("T")[0],
        calle: "",
        numero: "",
        departamento: "",
        codigo_postal: "",
      })
    }
  }, [provider, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      numero: formData.numero === "" ? null : Number(formData.numero),
      telefono: formData.telefono.trim() || null,
      correo: formData.correo.trim() || null,
      departamento: formData.departamento.trim() || null,
      codigo_postal: formData.codigo_postal.trim() || null,
    }

    onSave(payload)
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

          <div className="space-y-2">
            <Label htmlFor="fecha_alta">Fecha de Alta</Label>
            <Input
              id="fecha_alta"
              type="date"
              value={formData.fecha_alta}
              onChange={(e) => setFormData({ ...formData, fecha_alta: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo electrónico</Label>
            <Input
              id="correo"
              type="text"
              value={formData.correo || ""}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              placeholder="correo@proveedor.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="text"
              value={formData.telefono || ""}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="11-1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calle">Calle</Label>
            <Input
              id="calle"
              type="text"
              value={formData.calle}
              onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                type="number"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                type="text"
                value={formData.departamento || ""}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_postal">Código Postal</Label>
              <Input
                id="codigo_postal"
                type="text"
                value={formData.codigo_postal || ""}
                onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
              />
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
