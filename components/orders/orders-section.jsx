"use client"

import { useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import OrderModal from "@/components/orders/order-modal"

const initialOrders = [
  {
    id: 1,
    numero: "OC-2024-001",
    proveedor: "TechSupply Argentina",
    fecha: "2024-01-15",
    monto: 250000,
    estado: "Entregado",
    descripcion: "Notebooks HP EliteBook x10",
  },
  {
    id: 2,
    numero: "OC-2024-002",
    proveedor: "Computación Global",
    fecha: "2024-02-20",
    monto: 180000,
    estado: "Pendiente",
    descripcion: "Monitores Dell 27 pulgadas x5",
  },
  {
    id: 3,
    numero: "OC-2024-003",
    proveedor: "IT Solutions SRL",
    fecha: "2024-03-10",
    monto: 95000,
    estado: "En tránsito",
    descripcion: "Teclados y mouse inalámbricos x20",
  },
]

export default function OrdersSection() {
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)

  const filteredOrders = orders.filter(
    (order) =>
      order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddOrder = (newOrder) => {
    if (editingOrder) {
      setOrders(orders.map((o) => (o.id === editingOrder.id ? { ...newOrder, id: o.id } : o)))
      setEditingOrder(null)
    } else {
      setOrders([...orders, { ...newOrder, id: Date.now() }])
    }
    setIsModalOpen(false)
  }

  const handleEdit = (order) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("¿Está seguro de eliminar esta orden de compra?")) {
      setOrders(orders.filter((o) => o.id !== id))
    }
  }

  const getEstadoBadge = (estado) => {
    const colors = {
      Entregado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "En tránsito": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
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
        <h1 className="text-3xl font-bold text-foreground">Órdenes de Compra</h1>
        <Button
          onClick={() => {
            setEditingOrder(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva orden
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar orden de compra..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Descripción</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Monto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{order.numero}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(order.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{order.descripcion}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatCurrency(order.monto)}</td>
                  <td className="px-6 py-4">{getEstadoBadge(order.estado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Ver detalles de ${order.numero}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron órdenes de compra</p>
          </div>
        )}
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingOrder(null)
        }}
        onSave={handleAddOrder}
        order={editingOrder}
      />
    </div>
  )
}
