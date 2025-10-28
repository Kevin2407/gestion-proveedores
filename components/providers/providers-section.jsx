// Ejemplo de cómo modificar providers-section.jsx para usar la API

"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, Pencil, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProviderModal from "@/components/providers/provider-modal"

export default function ProvidersSection() {
  const [providers, setProviders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar proveedores al montar el componente
  useEffect(() => {
    fetchProviders()
  }, [])

  // GET - Obtener todos los proveedores
  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/providers')
      const { success, data } = await response.json()

      if (success) {
        setProviders(data)
      } else {
        setError('Error al cargar proveedores')
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const filteredProviders = providers.filter(
    (provider) =>
      provider.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.cuit.includes(searchTerm),
  )

  // POST o PUT - Crear o actualizar proveedor
  const handleAddProvider = async (newProvider) => {
    try {
      if (editingProvider) {
        // UPDATE
        const response = await fetch('/api/providers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_proveedor: editingProvider.id_proveedor,
            nombre: newProvider.nombre,
            cuit: newProvider.cuit,
            fecha_alta: newProvider.fechaAlta
          })
        })

        const { success, data } = await response.json()

        if (success) {
          setProviders(providers.map((p) =>
            p.id_proveedor === editingProvider.id_proveedor ? data : p
          ))
          setEditingProvider(null)
        }
      } else {
        // CREATE
        const response = await fetch('/api/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: newProvider.nombre,
            cuit: newProvider.cuit,
            fecha_alta: newProvider.fechaAlta
          })
        })

        const { success, data } = await response.json()

        if (success) {
          setProviders([...providers, data])
        }
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving provider:', error)
      alert('Error al guardar el proveedor')
    }
  }

  const handleEdit = (provider) => {
    setEditingProvider(provider)
    setIsModalOpen(true)
  }

  // DELETE - Eliminar proveedor
  const handleDelete = async (id) => {
    if (confirm("¿Está seguro de eliminar este proveedor?")) {
      try {
        const response = await fetch(`/api/providers?id=${id}`, {
          method: 'DELETE'
        })

        const { success } = await response.json()

        if (success) {
          setProviders(providers.filter((p) => p.id_proveedor !== id))
        }
      } catch (error) {
        console.error('Error deleting provider:', error)
        alert('Error al eliminar el proveedor')
      }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Cargando proveedores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchProviders} className="ml-4">Reintentar</Button>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProviders.map((provider) => (
                <tr key={provider.id_proveedor} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{provider.nombre}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{provider.cuit}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(provider.fecha_alta).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Ver detalles de ${provider.nombre}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(provider)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(provider.id_proveedor)}>
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
