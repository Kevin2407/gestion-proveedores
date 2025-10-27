"use client"

import { useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProviderModal from "@/components/provider-modal"

const initialProviders = [
  {
    id: 1,
    nombre: "TechSupply Argentina",
    cuit: "30-71234567-8",
    fechaAlta: "2024-01-15",
    calificacion: 5,
    direccion: "Av. Corrientes 1234, CABA",
  },
  {
    id: 2,
    nombre: "Computación Global",
    cuit: "30-71234568-9",
    fechaAlta: "2024-02-20",
    calificacion: 4,
    direccion: "Av. Santa Fe 5678, CABA",
  },
  {
    id: 3,
    nombre: "IT Solutions SRL",
    cuit: "30-71234569-0",
    fechaAlta: "2024-03-10",
    calificacion: 5,
    direccion: "Av. Rivadavia 9012, CABA",
  },
]

export default function ProvidersSection() {
  const [providers, setProviders] = useState(initialProviders)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)

  const filteredProviders = providers.filter(
    (provider) =>
      provider.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || provider.cuit.includes(searchTerm),
  )

  const handleAddProvider = (newProvider) => {
    if (editingProvider) {
      setProviders(providers.map((p) => (p.id === editingProvider.id ? { ...newProvider, id: p.id } : p)))
      setEditingProvider(null)
    } else {
      setProviders([...providers, { ...newProvider, id: Date.now() }])
    }
    setIsModalOpen(false)
  }

  const handleEdit = (provider) => {
    setEditingProvider(provider)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("¿Está seguro de eliminar este proveedor?")) {
      setProviders(providers.filter((p) => p.id !== id))
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Proveedores</h1>
        <Button
          onClick={() => {
            setEditingProvider(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo proveedor
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CUIT</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha de Alta</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Calificación</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{provider.nombre}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{provider.cuit}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(provider.fechaAlta).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4">{renderStars(provider.calificacion)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Ver detalles de ${provider.nombre}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(provider)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(provider.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron proveedores</p>
          </div>
        )}
      </div>

      <ProviderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProvider(null)
        }}
        onSave={handleAddProvider}
        provider={editingProvider}
      />
    </div>
  )
}
