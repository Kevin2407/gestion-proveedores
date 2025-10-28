"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2, Star, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RatingModal from "@/components/ratings/rating-modal"

export default function RatingsSection() {
  const [ratings, setRatings] = useState([])
  const [providers, setProviders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRating, setEditingRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [ratingsResponse, providersResponse] = await Promise.all([
        fetch("/api/ratings"),
        fetch("/api/providers?mode=options"),
      ])

      const ratingsJson = await ratingsResponse.json()
      const providersJson = await providersResponse.json()

      if (!ratingsJson.success) {
        throw new Error(ratingsJson.error || "No se pudieron obtener las calificaciones")
      }

      if (!providersJson.success) {
        throw new Error(providersJson.error || "No se pudieron obtener los proveedores")
      }

      setRatings(ratingsJson.data)
      setProviders(providersJson.data)
    } catch (err) {
      console.error("Error fetching ratings data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredRatings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return ratings

    return ratings.filter((rating) => {
      return (
        rating.proveedor_nombre.toLowerCase().includes(term) ||
        (rating.comentarios || "").toLowerCase().includes(term)
      )
    })
  }, [ratings, searchTerm])

  const handleSaveRating = async (payload) => {
    try {
      const method = editingRating ? "PUT" : "POST"
      const response = await fetch("/api/ratings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo guardar la calificación")
      }

      if (editingRating) {
        setRatings((prev) =>
          prev.map((rating) =>
            rating.id_calificacion === data.data.id_calificacion ? data.data : rating
          )
        )
        setEditingRating(null)
      } else {
        setRatings((prev) => [data.data, ...prev])
      }

      setIsModalOpen(false)
    } catch (err) {
      console.error("Error saving rating:", err)
      alert(err.message)
    }
  }

  const handleEdit = (rating) => {
    setEditingRating(rating)
    setIsModalOpen(true)
  }

  const handleDelete = async (rating) => {
    if (!confirm("¿Eliminar esta calificación definitivamente?")) {
      return
    }

    try {
      const response = await fetch(`/api/ratings?id=${rating.id_calificacion}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo eliminar la calificación")
      }

      setRatings((prev) => prev.filter((item) => item.id_calificacion !== rating.id_calificacion))
    } catch (err) {
      console.error("Error deleting rating:", err)
      alert(err.message)
    }
  }

  const renderStars = (rating) => {
    const score = Number(rating) || 0
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const getScoreColor = (score) => {
    const value = Number(score) || 0
    if (value >= 4) return "text-green-600 font-semibold"
    if (value >= 3) return "text-yellow-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Cargando calificaciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchData}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Calificaciones</h1>
        <Button
          onClick={() => {
            setEditingRating(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva calificación
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por proveedor o comentarios..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Calificación</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Comentarios</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRatings.map((rating) => (
                <tr key={rating.id_calificacion} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{rating.proveedor_nombre}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {rating.fecha_evaluacion ? new Date(rating.fecha_evaluacion).toLocaleDateString("es-AR") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {renderStars(rating.puntaje)}
                      <span className={`text-xs ${getScoreColor(rating.puntaje)}`}>
                        {rating.puntaje}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{rating.comentarios || "Sin comentarios"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`Proveedor: ${rating.proveedor_nombre}\nPuntaje: ${rating.puntaje}/5\nComentarios: ${rating.comentarios || "Sin comentarios"}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(rating)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rating)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRatings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron calificaciones</p>
          </div>
        )}
      </div>

      <RatingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingRating(null)
        }}
        onSave={handleSaveRating}
        rating={editingRating}
        providers={providers}
      />
    </div>
  )
}
