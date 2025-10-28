"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import OrderModal from "@/components/orders/order-modal"

export default function OrdersSection() {
  const [orders, setOrders] = useState([])
  const [providers, setProviders] = useState([])
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [ordersResponse, providersResponse, productsResponse] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/providers?mode=options"),
        fetch("/api/products"),
      ])

      const ordersJson = await ordersResponse.json()
      const providersJson = await providersResponse.json()
      const productsJson = await productsResponse.json()

      if (!ordersJson.success) {
        throw new Error(ordersJson.error || "No se pudieron obtener las órdenes")
      }

      if (!providersJson.success) {
        throw new Error(providersJson.error || "No se pudieron obtener los proveedores")
      }

      if (!productsJson.success) {
        throw new Error(productsJson.error || "No se pudieron obtener los productos")
      }

      setOrders(ordersJson.data)
      setProviders(providersJson.data)
      setProducts(productsJson.data)
    } catch (err) {
      console.error("Error fetching orders data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return orders

    return orders.filter((order) => {
      return (
        order.proveedor_nombre.toLowerCase().includes(term) ||
        (order.estado || "").toLowerCase().includes(term)
      )
    })
  }, [orders, searchTerm])

  const handleSaveOrder = async (payload) => {
    try {
      const method = editingOrder ? "PUT" : "POST"
      const response = await fetch("/api/orders", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo guardar la orden")
      }

      if (editingOrder) {
        setOrders((prev) =>
          prev.map((order) => (order.id_orden === data.data.id_orden ? data.data : order))
        )
        setEditingOrder(null)
      } else {
        setOrders((prev) => [data.data, ...prev])
      }

      setIsModalOpen(false)
    } catch (err) {
      console.error("Error saving order:", err)
      alert(err.message)
    }
  }

  const handleEdit = (order) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const handleDelete = async (order) => {
    if (!confirm("¿Eliminar esta orden de compra y sus detalles?")) {
      return
    }

    try {
      const response = await fetch(`/api/orders?id=${order.id_orden}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo eliminar la orden")
      }

      setOrders((prev) => prev.filter((item) => item.id_orden !== order.id_orden))
    } catch (err) {
      console.error("Error deleting order:", err)
      alert(err.message)
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

  const renderItemsSummary = (order) => {
    if (!order.detalles || order.detalles.length === 0) {
      return "Sin detalles"
    }

    const [first, ...rest] = order.detalles
    if (rest.length === 0) {
      return `${first.cantidad} x ${first.producto_nombre}`
    }

    return `${first.cantidad} x ${first.producto_nombre} + ${rest.length} ítem(s)`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Cargando órdenes...</p>
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
          placeholder="Buscar por proveedor o estado..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Orden</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha pedido</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha entrega</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Detalle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Monto total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id_orden} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">#{order.id_orden}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.proveedor_nombre}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {order.fecha_pedido ? new Date(order.fecha_pedido).toLocaleDateString("es-AR") : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {order.fecha_entrega ? new Date(order.fecha_entrega).toLocaleDateString("es-AR") : "Pendiente"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-sm">{renderItemsSummary(order)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatCurrency(order.monto_total || 0)}</td>
                  <td className="px-6 py-4">{getEstadoBadge(order.estado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const detailLines = order.detalles
                            .map((item) => `${item.cantidad} x ${item.producto_nombre} (${formatCurrency(item.subtotal)})`)
                            .join('\n')
                          alert(`Orden #${order.id_orden}\nProveedor: ${order.proveedor_nombre}\nMonto total: ${formatCurrency(order.monto_total || 0)}\n\nDetalle:\n${detailLines || 'Sin registros'}`)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(order)}>
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
        onSave={handleSaveOrder}
        order={editingOrder}
        providers={providers}
        products={products}
      />
    </div>
  )
}
