"use client"

import { useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import IncidentModal from "@/components/incidents/incident-modal"

const initialIncidents = [
  {
    id: 1,
    numero: "INC-2024-001",
    equipo: "Notebook HP EliteBook 840",
    proveedor: "TechSupply Argentina",
    tecnico: "Carlos Rodríguez",
    fechaReporte: "2024-10-20",
    fechaResolucion: "2024-10-22",
    descripcion: "Falla en el disco duro, se reemplazó bajo garantía",
    estado: "Resuelto",
    prioridad: "Alta",
  },
  {
    id: 2,
    numero: "INC-2024-002",
    equipo: "Monitor Dell UltraSharp 27",
    proveedor: "Computación Global",
    tecnico: "María González",
    fechaReporte: "2024-10-25",
    fechaResolucion: "",
    descripcion: "Píxeles muertos en la pantalla, pendiente de revisión",
    estado: "En proceso",
    prioridad: "Media",
  },
  {
    id: 3,
    numero: "INC-2024-003",
    equipo: "Impresora HP LaserJet Pro",
    proveedor: "IT Solutions SRL",
    tecnico: "Juan Pérez",
    fechaReporte: "2024-10-15",
    fechaResolucion: "",
    descripcion: "Atasco de papel recurrente",
    estado: "Pendiente",
    prioridad: "Baja",
  },
]

export default function IncidentsSection() {
  const [incidents, setIncidents] = useState(initialIncidents)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIncident, setEditingIncident] = useState(null)

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddIncident = (newIncident) => {
    if (editingIncident) {
      setIncidents(incidents.map((i) => (i.id === editingIncident.id ? { ...newIncident, id: i.id } : i)))
      setEditingIncident(null)
    } else {
      setIncidents([...incidents, { ...newIncident, id: Date.now() }])
    }
    setIsModalOpen(false)
  }

  const handleEdit = (incident) => {
    setEditingIncident(incident)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("¿Está seguro de eliminar esta incidencia?")) {
      setIncidents(incidents.filter((i) => i.id !== id))
    }
  }

  const getEstadoBadge = (estado) => {
    const colors = {
      Resuelto: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "En proceso": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Cancelado: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[estado] || colors.Pendiente}`}>
        {estado}
      </span>
    )
  }

  const getPrioridadBadge = (prioridad) => {
    const colors = {
      Alta: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Media: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Baja: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${colors[prioridad]}`}>
        {prioridad === "Alta" && <AlertTriangle className="w-3 h-3" />}
        {prioridad}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Incidencias</h1>
        <Button
          onClick={() => {
            setEditingIncident(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva incidencia
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar incidencia..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Número</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Equipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Técnico</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha Reporte</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Prioridad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{incident.numero}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{incident.equipo}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{incident.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{incident.tecnico}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(incident.fechaReporte).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4">{getPrioridadBadge(incident.prioridad)}</td>
                  <td className="px-6 py-4">{getEstadoBadge(incident.estado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`Descripción: ${incident.descripcion}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(incident)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(incident.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredIncidents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron incidencias</p>
          </div>
        )}
      </div>

      <IncidentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingIncident(null)
        }}
        onSave={handleAddIncident}
        incident={editingIncident}
      />
    </div>
  )
}
