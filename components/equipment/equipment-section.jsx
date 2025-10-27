"use client"

import { useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EquipmentModal from "@/components/equipment/equipment-modal"

const initialEquipment = [
  {
    id: 1,
    nombre: "Notebook HP EliteBook 840",
    serie: "5CD12345AB",
    proveedor: "TechSupply Argentina",
    fechaAdquisicion: "2024-01-15",
    garantiaHasta: "2027-01-15",
    estado: "En uso",
    ubicacion: "Oficina Central",
  },
  {
    id: 2,
    nombre: "Monitor Dell UltraSharp 27",
    serie: "CN-0P2418-74180",
    proveedor: "Computación Global",
    fechaAdquisicion: "2024-02-20",
    garantiaHasta: "2027-02-20",
    estado: "En uso",
    ubicacion: "Sala de Reuniones",
  },
  {
    id: 3,
    nombre: "Impresora HP LaserJet Pro",
    serie: "VNC3K12345",
    proveedor: "IT Solutions SRL",
    fechaAdquisicion: "2023-03-10",
    garantiaHasta: "2024-03-10",
    estado: "Vencida",
    ubicacion: "Administración",
  },
]

export default function EquipmentSection() {
  const [equipment, setEquipment] = useState(initialEquipment)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)

  const filteredEquipment = equipment.filter(
    (item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.proveedor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddEquipment = (newEquipment) => {
    if (editingEquipment) {
      setEquipment(equipment.map((e) => (e.id === editingEquipment.id ? { ...newEquipment, id: e.id } : e)))
      setEditingEquipment(null)
    } else {
      setEquipment([...equipment, { ...newEquipment, id: Date.now() }])
    }
    setIsModalOpen(false)
  }

  const handleEdit = (item) => {
    setEditingEquipment(item)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("¿Está seguro de eliminar este equipo?")) {
      setEquipment(equipment.filter((e) => e.id !== id))
    }
  }

  const getEstadoBadge = (estado) => {
    const colors = {
      "En uso": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "En reparación": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Almacenado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Vencida: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Fuera de servicio": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[estado] || colors.Almacenado}`}>
        {estado}
      </span>
    )
  }

  const checkWarranty = (date) => {
    const warrantyDate = new Date(date)
    const today = new Date()
    const diffTime = warrantyDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <span className="text-red-600 font-semibold">Vencida</span>
    } else if (diffDays <= 30) {
      return <span className="text-yellow-600 font-semibold">Por vencer</span>
    }
    return <span className="text-green-600">{warrantyDate.toLocaleDateString("es-AR")}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Equipos Adquiridos</h1>
        <Button
          onClick={() => {
            setEditingEquipment(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo equipo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar equipo..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Equipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">N° Serie</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha Adquisición</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Garantía</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEquipment.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{item.nombre}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.serie}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(item.fechaAdquisicion).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4 text-sm">{checkWarranty(item.garantiaHasta)}</td>
                  <td className="px-6 py-4">{getEstadoBadge(item.estado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Ver detalles de ${item.nombre}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron equipos</p>
          </div>
        )}
      </div>

      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEquipment(null)
        }}
        onSave={handleAddEquipment}
        equipment={editingEquipment}
      />
    </div>
  )
}
