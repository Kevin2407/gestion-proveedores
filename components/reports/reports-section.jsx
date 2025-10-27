"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  FileText,
  AlertTriangle,
  Star,
  Calendar,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportsSection() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes")

  const stats = [
    {
      title: "Proveedores Activos",
      value: "12",
      change: "+2",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Contratos Vigentes",
      value: "8",
      change: "+1",
      trend: "up",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Órdenes del Mes",
      value: "24",
      change: "+5",
      trend: "up",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Gasto Total",
      value: "$2.5M",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
    {
      title: "Equipos Adquiridos",
      value: "156",
      change: "+18",
      trend: "up",
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900",
    },
    {
      title: "Incidencias Abiertas",
      value: "5",
      change: "-3",
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Calificación Promedio",
      value: "4.5",
      change: "+0.3",
      trend: "up",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      title: "Garantías por Vencer",
      value: "8",
      change: "+2",
      trend: "neutral",
      icon: Calendar,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-700",
    },
  ]

  const topProviders = [
    { nombre: "TechSupply Argentina", calificacion: 4.8, ordenes: 45, monto: 1250000 },
    { nombre: "Computación Global", calificacion: 4.5, ordenes: 38, monto: 980000 },
    { nombre: "IT Solutions SRL", calificacion: 4.2, ordenes: 32, monto: 750000 },
  ]

  const recentActivity = [
    { tipo: "orden", descripcion: "Nueva orden de compra OC-2024-025", fecha: "2024-10-27" },
    { tipo: "incidencia", descripcion: "Incidencia INC-2024-004 resuelta", fecha: "2024-10-26" },
    { tipo: "calificacion", descripcion: "Calificación positiva para TechSupply", fecha: "2024-10-25" },
    { tipo: "contrato", descripcion: "Contrato CONT-2024-005 firmado", fecha: "2024-10-24" },
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityIcon = (tipo) => {
    switch (tipo) {
      case "orden":
        return <Package className="w-4 h-4 text-blue-600" />
      case "incidencia":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "calificacion":
        return <Star className="w-4 h-4 text-yellow-600" />
      case "contrato":
        return <FileText className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Reportes Ejecutivos</h1>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="trimestre">Este trimestre</option>
            <option value="año">Este año</option>
          </select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : stat.trend === "down" ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : null}
                  <span
                    className={`text-xs font-semibold ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : stat.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Proveedores */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Top Proveedores</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProviders.map((provider, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <p className="font-semibold text-foreground">{provider.nombre}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{provider.calificacion}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{provider.ordenes} órdenes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">{formatCurrency(provider.monto)}</p>
                    <p className="text-xs text-muted-foreground">Total facturado</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Actividad Reciente</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="mt-1">{getActivityIcon(activity.tipo)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.descripcion}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.fecha).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y análisis adicionales */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Análisis de Desempeño</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Tasa de Cumplimiento</p>
              <p className="text-3xl font-bold text-green-600">94%</p>
              <p className="text-xs text-muted-foreground mt-1">Entregas a tiempo</p>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Tiempo Promedio de Resolución</p>
              <p className="text-3xl font-bold text-blue-600">2.3 días</p>
              <p className="text-xs text-muted-foreground mt-1">Incidencias técnicas</p>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Ahorro en Garantías</p>
              <p className="text-3xl font-bold text-purple-600">$450K</p>
              <p className="text-xs text-muted-foreground mt-1">Este trimestre</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
