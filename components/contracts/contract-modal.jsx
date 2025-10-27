"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ContractModal({ isOpen, onClose, onSave, contract }) {
  const [formData, setFormData] = useState({
    numero: "",
    proveedor: "",
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: "",
    monto: "",
    estado: "Activo",
  })

  useEffect(() => {
    if (contract) {
      setFormData(contract)
    } else {
      setFormData({
        numero: "",
        proveedor: "",
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaFin: "",
        monto: "",
        estado: "Activo",
      })
    }
  }, [contract, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      monto: parseFloat(formData.monto),
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {contract ? "Editar Contrato" : "Nuevo Contrato"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número de Contrato</Label>
            <Input
              id="numero"
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              placeholder="CONT-2024-001"
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
            <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha de Fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={formData.fechaFin}
              onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto (ARS)</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              placeholder="500000"
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
              <option value="Activo">Activo</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Pendiente">Pendiente</option>
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
