"use client"

import { useMemo, useState, useEffect } from "react"
import { X, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const estadoOptions = ["Pendiente", "En proceso", "En tránsito", "Entregado", "Cancelado"]

export default function OrderModal({ isOpen, onClose, onSave, order, providers = [], products = [] }) {
  const [formData, setFormData] = useState({
    id_orden: null,
    id_proveedor: "",
    fecha_pedido: new Date().toISOString().split("T")[0],
    fecha_entrega: "",
    estado: "Pendiente",
  })
  const [items, setItems] = useState([
    { id_producto: "", cantidad: 1, precio_unitario: "" },
  ])

  useEffect(() => {
    if (order) {
      setFormData({
        id_orden: order.id_orden,
        id_proveedor: order.id_proveedor?.toString() || "",
        fecha_pedido: order.fecha_pedido ? order.fecha_pedido.slice(0, 10) : new Date().toISOString().split("T")[0],
        fecha_entrega: order.fecha_entrega ? order.fecha_entrega.slice(0, 10) : "",
        estado: order.estado || "Pendiente",
      })
      setItems(
        order.detalles && order.detalles.length > 0
          ? order.detalles.map((detail) => ({
              id_producto: detail.id_producto?.toString() || "",
              cantidad: detail.cantidad?.toString() || "1",
              precio_unitario: detail.precio_unitario?.toString() || "",
            }))
          : [{ id_producto: "", cantidad: 1, precio_unitario: "" }]
      )
    } else {
      setFormData({
        id_orden: null,
        id_proveedor: "",
        fecha_pedido: new Date().toISOString().split("T")[0],
        fecha_entrega: "",
        estado: "Pendiente",
      })
      setItems([{ id_producto: "", cantidad: 1, precio_unitario: "" }])
    }
  }, [order, isOpen])

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleAddItem = () => {
    setItems((prev) => [...prev, { id_producto: "", cantidad: 1, precio_unitario: "" }])
  }

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.cantidad)
      const unit = Number(item.precio_unitario)
      if (Number.isNaN(quantity) || Number.isNaN(unit)) {
        return sum
      }
      return sum + quantity * unit
    }, 0)
  }, [items])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value || 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const preparedItems = items
      .map((item) => ({
        id_producto: item.id_producto ? Number(item.id_producto) : null,
        cantidad: parseInt(item.cantidad, 10),
        precio_unitario: Number(item.precio_unitario),
      }))
      .filter(
        (item) =>
          item.id_producto &&
          !Number.isNaN(item.cantidad) &&
          !Number.isNaN(item.precio_unitario) &&
          item.cantidad > 0 &&
          item.precio_unitario > 0
      )

    if (preparedItems.length === 0) {
      alert("La orden debe incluir al menos un producto válido")
      return
    }

    if (!formData.id_proveedor) {
      alert("Seleccione un proveedor")
      return
    }

    onSave({
      ...formData,
      id_proveedor: Number(formData.id_proveedor),
      fecha_entrega: formData.fecha_entrega || null,
      items: preparedItems,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {order ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id_proveedor">Proveedor</Label>
            <select
              id="id_proveedor"
              value={formData.id_proveedor}
              onChange={(e) => setFormData({ ...formData, id_proveedor: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Seleccionar proveedor</option>
              {providers.map((provider) => (
                <option key={provider.id_proveedor} value={provider.id_proveedor}>
                  {provider.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_pedido">Fecha del pedido</Label>
            <Input
              id="fecha_pedido"
              type="date"
              value={formData.fecha_pedido}
              onChange={(e) => setFormData({ ...formData, fecha_pedido: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_entrega">Fecha estimada de entrega (opcional)</Label>
            <Input
              id="fecha_entrega"
              type="date"
              value={formData.fecha_entrega}
              onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              {estadoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Productos incluidos</Label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <Label className="text-xs">Producto</Label>
                    <select
                      value={item.id_producto}
                      onChange={(e) => handleItemChange(index, "id_producto", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {products.map((product) => (
                        <option key={product.id_producto} value={product.id_producto}>
                          {product.nombre_producto}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <Label className="text-xs" htmlFor={`cantidad-${index}`}>
                      Cantidad
                    </Label>
                    <Input
                      id={`cantidad-${index}`}
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, "cantidad", e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label className="text-xs" htmlFor={`precio-${index}`}>
                      Precio unitario
                    </Label>
                    <Input
                      id={`precio-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.precio_unitario}
                      onChange={(e) => handleItemChange(index, "precio_unitario", e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 text-sm text-muted-foreground font-medium">
                    Subtotal: {formatCurrency((Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0))}
                  </div>
                  <div className="sm:col-span-12 flex justify-end">
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Agregar producto
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-dashed border-muted px-4 py-3 bg-muted/30 text-sm">
            <span className="font-semibold text-muted-foreground">Total estimado</span>
            <span className="text-foreground font-semibold">{formatCurrency(total)}</span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
