"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProductModal from "@/components/products/product-modal"

export default function ProductsSection() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/products")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudieron obtener los productos")
      }

      setProducts(data.data)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return products

    return products.filter((product) => {
      return (
        product.nombre_producto.toLowerCase().includes(term) ||
        (product.descripcion || "").toLowerCase().includes(term)
      )
    })
  }, [products, searchTerm])

  const handleSaveProduct = async (payload) => {
    try {
      const method = payload.id_producto ? "PUT" : "POST"
      const response = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo guardar el producto")
      }

      if (payload.id_producto) {
        setProducts((prev) =>
          prev.map((product) => (product.id_producto === data.data.id_producto ? data.data : product))
        )
      } else {
        setProducts((prev) => [data.data, ...prev])
      }

      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (err) {
      console.error("Error saving product:", err)
      alert(err.message)
    }
  }

  const handleDelete = async (product) => {
    if (!confirm(`¿Eliminar definitivamente "${product.nombre_producto}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products?id=${product.id_producto}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "No se pudo eliminar el producto")
      }

      setProducts((prev) => prev.filter((item) => item.id_producto !== product.id_producto))
    } catch (err) {
      console.error("Error deleting product:", err)
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchProducts}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Productos</h1>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo producto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Descripción</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id_producto} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{product.nombre_producto}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xl">
                    <span className="line-clamp-2">{product.descripcion || "Sin descripción"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          alert(`Producto: ${product.nombre_producto}\nDescripción: ${product.descripcion || "Sin descripción"}`)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product)
                          setIsModalOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  )
}
