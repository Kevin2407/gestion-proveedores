"use client"

import { useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ContractModal from "@/components/contracts/contract-modal"

const initialContracts = [
  {
    id: 1,
    numero: "CONT-2024-001",
    proveedor: "TechSupply Argentina",
    fechaInicio: "2024-01-15",
    fechaFin: "2025-01-15",
    monto: 500000,
    estado: "Activo",
  },
  {
    id: 2,
    numero: "CONT-2024-002",
    proveedor: "Computación Global",
    fechaInicio: "2024-02-20",
    fechaFin: "2025-02-20",
    monto: 750000,
    estado: "Activo",
  },
  {
    id: 3,
    numero: "CONT-2024-003",
    proveedor: "IT Solutions SRL",
    fechaInicio: "2024-03-10",
    fechaFin: "2024-09-10",
    monto: 300000,
    estado: "Finalizado",
  },
]

export default function ContractsSection() {
  const [contracts, setContracts] = useState(initialContracts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContract, setEditingContract] = useState(null)

  const filteredContracts = contracts.filter(
    (contract) =>
      contract.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.proveedor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddContract = (newContract) => {
    if (editingContract) {
      setContracts(contracts.map((c) => (c.id === editingContract.id ? { ...newContract, id: c.id } : c)))
      setEditingContract(null)
    } else {
      setContracts([...contracts, { ...newContract, id: Date.now() }])
    }
    setIsModalOpen(false)
  }

  const handleEdit = (contract) => {
    setEditingContract(contract)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("¿Está seguro de eliminar este contrato?")) {
      setContracts(contracts.filter((c) => c.id !== id))
    }
  }

  const getEstadoBadge = (estado) => {
    const colors = {
      Activo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Finalizado: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[estado] || colors.Pendiente}`}>
        {estado}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
        <Button
          onClick={() => {
            setEditingContract(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo contrato
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar contrato..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha Inicio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha Fin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Monto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{contract.numero}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{contract.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(contract.fechaInicio).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(contract.fechaFin).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatCurrency(contract.monto)}</td>
                  <td className="px-6 py-4">{getEstadoBadge(contract.estado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Ver detalles de ${contract.numero}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(contract.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron contratos</p>
          </div>
        )}
      </div>

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingContract(null)
        }}
        onSave={handleAddContract}
        contract={editingContract}
      />
    </div>
  )
}
