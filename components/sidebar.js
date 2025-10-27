"use client"

import { FolderOpen, FileText, ShoppingCart, Laptop, Wrench, Star, AlertTriangle, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { id: "proveedores", label: "Proveedores", icon: FolderOpen },
  { id: "contratos", label: "Contratos", icon: FileText },
  { id: "ordenes", label: "Órdenes de compra", icon: ShoppingCart },
  { id: "equipos", label: "Equipos adquiridos", icon: Laptop },
  { id: "tecnicos", label: "Técnicos autorizados", icon: Wrench },
  { id: "calificaciones", label: "Calificaciones", icon: Star },
  { id: "incidencias", label: "Incidencias", icon: AlertTriangle },
  { id: "reportes", label: "Reportes ejecutivos", icon: BarChart3 },
]

export default function Sidebar({ activeSection, setActiveSection }) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-[17.5px] border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Sistema de Gestión</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
