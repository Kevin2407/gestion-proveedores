"use client"

import { useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2, Star, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RatingModal from "@/components/ratings/rating-modal"

const initialRatings = [
  {
    id: 1,
    proveedor: "TechSupply Argentina",
    fecha: "2024-10-15",
    calificacion: 5,
    aspecto: "Calidad de productos",
    evaluador: "Juan Martínez",
    comentarios: "Excelente calidad en todos los equipos entregados. Muy satisfechos con la compra.",
  },
  {
    id: 2,
    proveedor: "Computación Global",
    fecha: "2024-10-10",
    calificacion: 4,
    aspecto: "Tiempo de entrega",
    evaluador: "María López",
    comentarios: "Buena atención, aunque hubo un pequeño retraso en la entrega.",
  },
  {
    id: 3,
    proveedor: "IT Solutions SRL",
    fecha: "2024-09-28",
    calificacion: 3,
    aspecto: "Servicio postventa",
    evaluador: "Carlos Gómez",
    comentarios: "El servicio técnico tardó más de lo esperado en responder.",
  },
]

export default function RatingsSection() {
  const [ratings, setRatings] = useState(initialRatings)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRating, setEditingRating] = useState(null)

  const filteredRatings = ratings.filter(
    (rating) =>
      rating.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.aspecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.evaluador.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddRating = (newRating) => {
    if (editingRating) {
      setRatings(ratings.map((r) => (r.id === editingRating.id ? { ...newRating, id: r.id } : r)))
      setEditingRating(null)
    } else {
      setRatings([...ratings, { ...newRating, id: Date.now() }])
    }
    setIsModalOpen(false)
  }

  const handleEdit = (rating) => {
    setEditingRating(rating)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("¿Está seguro de eliminar esta calificación?")) {
      setRatings(ratings.filter((r) => r.id !== id))
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

  const getScoreColor = (score) => {
    if (score >= 4) return "text-green-600 font-semibold"
    if (score >= 3) return "text-yellow-600 font-semibold"
    return "text-red-600 font-semibold"
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
          placeholder="Buscar calificación..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Aspecto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Calificación</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Evaluador</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Comentarios</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRatings.map((rating) => (
                <tr key={rating.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{rating.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(rating.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{rating.aspecto}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {renderStars(rating.calificacion)}
                      <span className={`text-xs ${getScoreColor(rating.calificacion)}`}>
                        {rating.calificacion}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{rating.evaluador}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{rating.comentarios}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`Comentario: ${rating.comentarios}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(rating)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rating.id)}>
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
        onSave={handleAddRating}
        rating={editingRating}
      />
    </div>
  )
}
