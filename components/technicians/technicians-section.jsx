"use client"

import { useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TechnicianModal from "@/components/technicians/technician-modal"

const initialTechnicians = [
  {
    id: 1,
    nombre: "Carlos Rodríguez",
    especialidad: "Reparación de notebooks",
    proveedor: "TechSupply Argentina",
    telefono: "+54 11 4567-8901",
    email: "carlos.rodriguez@techsupply.com.ar",
    certificaciones: "HP Certified, Dell Authorized",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "María González",
    especialidad: "Redes y servidores",
    proveedor: "Computación Global",
    telefono: "+54 11 4567-8902",
    email: "maria.gonzalez@compglobal.com.ar",
    certificaciones: "Cisco CCNA, Microsoft MCSA",
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Juan Pérez",
    especialidad: "Impresoras y periféricos",
    proveedor: "IT Solutions SRL",
    telefono: "+54 11 4567-8903",
    email: "juan.perez@itsolutions.com.ar",
    certificaciones: "HP Printer Specialist",
    estado: "Inactivo",
  },
]

export default function TechniciansSection() {
  const [technicians, setTechnicians] = useState(initialTechnicians)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState(null)

  const filteredTechnicians = technicians.filter(
    (tech) =>
      tech.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.proveedor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddTechnician = (newTechnician) => {
    if (editingTechnician) {
      setTechnicians(technicians.map((t) => (t.id === editingTechnician.id ? { ...newTechnician, id: t.id } : t)))
      setEditingTechnician(null)
    } else {
      setTechnicians([...technicians, { ...newTechnician, id: Date.now() }])
    }
    setIsModalOpen(false)
  }

  const handleEdit = (technician) => {
    setEditingTechnician(technician)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("¿Está seguro de eliminar este técnico?")) {
      setTechnicians(technicians.filter((t) => t.id !== id))
    }
  }

  const getEstadoBadge = (estado) => {
    const colors = {
      Activo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Inactivo: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      Suspendido: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[estado] || colors.Activo}`}>
        {estado}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Técnicos Autorizados</h1>
        <Button
          onClick={() => {
            setEditingTechnician(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo técnico
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar técnico..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Especialidad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Certificaciones</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTechnicians.map((tech) => (
                <tr key={tech.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{tech.nombre}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{tech.especialidad}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{tech.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{tech.telefono}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{tech.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs">
                    <span className="line-clamp-2">{tech.certificaciones}</span>
                  </td>
                  <td className="px-6 py-4">{getEstadoBadge(tech.estado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Ver detalles de ${tech.nombre}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(tech)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tech.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTechnicians.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron técnicos</p>
          </div>
        )}
      </div>

      <TechnicianModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTechnician(null)
        }}
        onSave={handleAddTechnician}
        technician={editingTechnician}
      />
    </div>
  )
}
