"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Plus, Pencil, Trash2, Star, MapPin, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProviderModal from "@/components/providers/provider-modal"

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("es-AR")
}

const formatAddress = (provider) => {
  if (!provider.calle) return "Sin dirección registrada"
  const parts = [provider.calle]
  if (provider.numero) parts.push(`#${provider.numero}`)
  if (provider.departamento) parts.push(`Depto. ${provider.departamento}`)
  if (provider.codigo_postal) parts.push(`CP ${provider.codigo_postal}`)
  return parts.join(" ")
}

const renderAverage = (value) => {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">Sin datos</span>
  }

  const numeric = Number(value)
  if (Number.isNaN(numeric)) {
    return <span className="text-xs text-muted-foreground">Sin datos</span>
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(numeric) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{numeric.toFixed(1)}/5</span>
    </div>
  )
}

export default function ProvidersSection() {
  const [providers, setProviders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/providers")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo obtener la lista de proveedores")
      }

      setProviders(data.data)
    } catch (err) {
      console.error("Error fetching providers:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProviders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return providers

    return providers.filter((provider) => {
      return (
        provider.nombre.toLowerCase().includes(term) ||
        (provider.documento || "").toLowerCase().includes(term) ||
        (provider.correo || "").toLowerCase().includes(term)
      )
    })
  }, [providers, searchTerm])

  const handleSaveProvider = async (payload) => {
    try {
      const method = editingProvider ? "PUT" : "POST"
      const response = await fetch("/api/providers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo guardar el proveedor")
      }

      if (editingProvider) {
        setProviders((prev) =>
          prev.map((provider) => (provider.id_proveedor === data.data.id_proveedor ? data.data : provider))
        )
      } else {
        setProviders((prev) => [...prev, data.data])
      }

      setIsModalOpen(false)
      setEditingProvider(null)
    } catch (err) {
      console.error("Error saving provider:", err)
      alert(err.message)
    }
  }

  const handleDelete = async (provider) => {
    if (!confirm(`¿Eliminar definitivamente a ${provider.nombre}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/providers?id=${provider.id_proveedor}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo eliminar el proveedor")
      }

      setProviders((prev) => prev.filter((item) => item.id_proveedor !== provider.id_proveedor))
    } catch (err) {
      console.error("Error deleting provider:", err)
      alert(err.message)
    }
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
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchProviders}>Reintentar</Button>
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
          placeholder="Buscar por nombre, documento o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Documento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Dirección</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha alta</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Promedio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Última calificación</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProviders.map((provider) => (
                <tr key={provider.id_proveedor} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{provider.nombre}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{provider.documento || "-"}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      {provider.correo && (
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3" />
                          <span>{provider.correo}</span>
                        </div>
                      )}
                      {provider.telefono && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="w-3 h-3" />
                          <span>{provider.telefono}</span>
                        </div>
                      )}
                      {!provider.correo && !provider.telefono && (
                        <span className="text-xs text-muted-foreground">Sin contacto</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2 text-xs">
                      <MapPin className="w-3 h-3 mt-0.5" />
                      <span>{formatAddress(provider)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(provider.fecha_alta)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{renderAverage(provider.promedio_puntaje)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {provider.ultima_puntaje !== null && provider.ultima_puntaje !== undefined ? (
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-foreground">{Number(provider.ultima_puntaje).toFixed(1)}/5</span>
                        <span>{formatDate(provider.ultima_fecha)}</span>
                        {provider.ultima_comentario && (
                          <span className="text-muted-foreground line-clamp-2">{provider.ultima_comentario}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin registros</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(provider)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProvider(provider)
                          setIsModalOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
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
        onSave={handleSaveProvider}
        provider={editingProvider}
      />
    </div>
  )
}
