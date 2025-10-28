"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  DollarSign,
  Download,
  FileText,
  Package,
  Star,
  Users,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const INITIAL_REPORT_DATA = {
  totales: {
    total_proveedores: 0,
    total_tecnicos: 0,
    total_productos: 0,
    total_ordenes: 0,
    total_calificaciones: 0,
    total_fallas: 0,
    promedio_calificaciones: 0,
    gasto_mes_actual: 0,
  },
  mejoresCalificaciones: [],
  proveedoresSinFallas: [],
  ordenesPorEstado: [],
  auditoriaOrdenes: [],
  ordenesRecientes: [],
}

const formatNumber = (value) => Number(value || 0).toLocaleString("es-AR")

const formatCurrency = (value) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const formatDateTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatStateLabel = (value) => {
  if (!value) return "Sin estado"
  const lower = value.toString().toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export default function ReportsSection() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes")
  const [reportData, setReportData] = useState(INITIAL_REPORT_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/reports?period=${selectedPeriod}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Error al obtener los reportes (${response.status})`)
      }

      const body = await response.json()

      if (!body.success) {
        throw new Error(body.error || "No se pudo generar el tablero de reportes")
      }

      const payload = body.data || {}

      setReportData({
        totales: { ...INITIAL_REPORT_DATA.totales, ...(payload.totales || {}) },
        mejoresCalificaciones: payload.mejoresCalificaciones || [],
        proveedoresSinFallas: payload.proveedoresSinFallas || [],
        ordenesPorEstado: payload.ordenesPorEstado || [],
        auditoriaOrdenes: payload.auditoriaOrdenes || [],
        ordenesRecientes: payload.ordenesRecientes || [],
      })
    } catch (err) {
      console.error("Error al cargar /api/reports", err)
      setError(err.message || "Se produjo un error desconocido")
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const totalOrdenes = reportData.totales.total_ordenes || 0

  const ordersByState = useMemo(() => {
    return (reportData.ordenesPorEstado || []).map((item) => {
      const cantidad = Number(item.cantidad || 0)
      const porcentaje = totalOrdenes ? Math.round((cantidad / totalOrdenes) * 100) : 0
      return {
        estado: formatStateLabel(item.estado),
        cantidad,
        monto_total: Number(item.monto_total || 0),
        porcentaje,
      }
    })
  }, [reportData.ordenesPorEstado, totalOrdenes])

  const stats = useMemo(() => {
    const totales = reportData.totales

    return [
      {
        title: "Proveedores registrados",
        value: formatNumber(totales.total_proveedores),
        icon: Users,
        accent: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200",
        caption: "Catálogo actualizado",
      },
      {
        title: "Técnicos operativos",
        value: formatNumber(totales.total_tecnicos),
        icon: Wrench,
        accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
        caption: "Incluye especialidades",
      },
      {
        title: "Productos disponibles",
        value: formatNumber(totales.total_productos),
        icon: Package,
        accent: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-200",
        caption: "Inventario actual",
      },
      {
        title: "Órdenes generadas",
        value: formatNumber(totales.total_ordenes),
        icon: FileText,
        accent: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200",
        caption: "Historial completo",
      },
      {
        title: "Gasto del mes",
        value: formatCurrency(totales.gasto_mes_actual),
        icon: DollarSign,
        accent: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200",
        caption: "Ordenes emitidas",
      },
      {
        title: "Promedio de calificaciones",
        value: Number(totales.promedio_calificaciones || 0).toFixed(1),
        icon: Star,
        accent: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-200",
        caption: `${formatNumber(totales.total_calificaciones)} evaluaciones`,
      },
      {
        title: "Incidencias registradas",
        value: formatNumber(totales.total_fallas),
        icon: AlertTriangle,
        accent: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200",
        caption: "Fallas asociadas a proveedores",
      },
    ]
  }, [reportData.totales])

  const handleExport = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes Ejecutivos</h1>
          <p className="text-sm text-muted-foreground">
            Indicadores generados en tiempo real desde la base de datos SQL Server.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedPeriod}
            onChange={(event) => setSelectedPeriod(event.target.value)}
            className="flex h-10 min-w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="trimestre">Este trimestre</option>
            <option value="año">Este año</option>
          </select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReports} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">No se pudieron cargar los reportes.</p>
          <p className="mt-1">{error}</p>
          <Button variant="ghost" className="mt-3" onClick={fetchReports}>
            Reintentar
          </Button>
        </div>
      )}

      {!error && loading && (
        <div className="rounded-lg border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Obteniendo métricas actualizadas...
        </div>
      )}

      {!error && !loading && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.title} className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.accent}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                {stat.caption && <p className="mt-4 text-xs text-muted-foreground">{stat.caption}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-xl font-semibold text-foreground">Mejores calificaciones</h2>
                <p className="text-sm text-muted-foreground">Últimas evaluaciones destacadas por proveedor.</p>
              </div>
              <div className="px-6 py-5">
                {reportData.mejoresCalificaciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no hay calificaciones registradas.</p>
                ) : (
                  <div className="space-y-4">
                    {reportData.mejoresCalificaciones.map((item) => (
                      <div key={`${item.id_calificacion ?? item.id_proveedor}-${item.fecha_evaluacion}`} className="rounded-lg border border-border/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{item.nombre}</p>
                            <p className="text-xs text-muted-foreground">Evaluado el {formatDate(item.fecha_evaluacion)}</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200">
                            <Star className="h-4 w-4" />
                            <span className="text-sm font-semibold">{Number(item.puntaje || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        {item.comentarios && (
                          <p className="mt-3 text-sm text-muted-foreground">“{item.comentarios}”</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-xl font-semibold text-foreground">Órdenes recientes</h2>
                <p className="text-sm text-muted-foreground">Últimas cinco órdenes emitidas por el área de compras.</p>
              </div>
              <div className="px-6 py-5">
                {reportData.ordenesRecientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todavía no se registran órdenes en el sistema.</p>
                ) : (
                  <div className="space-y-4">
                    {reportData.ordenesRecientes.map((order) => (
                      <div key={order.id_orden} className="flex flex-col gap-2 rounded-lg border border-border/70 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Orden #{order.id_orden}</p>
                          <p className="text-xs text-muted-foreground">{order.proveedor_nombre}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="font-semibold text-foreground">{formatCurrency(order.monto_total)}</p>
                          <p>{formatStateLabel(order.estado)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(order.fecha_pedido)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-xl font-semibold text-foreground">Proveedores sin incidencias</h2>
                <p className="text-sm text-muted-foreground">Organizaciones sin registros de fallas en la auditoría.</p>
              </div>
              <div className="px-6 py-5">
                {reportData.proveedoresSinFallas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay proveedores con historial limpio en este período.</p>
                ) : (
                  <div className="space-y-4">
                    {reportData.proveedoresSinFallas.map((provider) => (
                      <div key={provider.id_proveedor} className="rounded-lg border border-border/70 p-4">
                        <p className="font-semibold text-foreground">{provider.nombre}</p>
                        <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                          <span>Correo: {provider.correo || "Sin correo"}</span>
                          <span>Teléfono: {provider.telefono || "Sin teléfono"}</span>
                          <span>Alta: {formatDate(provider.fecha_alta)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-xl font-semibold text-foreground">Órdenes por estado</h2>
                <p className="text-sm text-muted-foreground">Distribución y monto asociado a cada fase del flujo.</p>
              </div>
              <div className="px-6 py-5">
                {ordersByState.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay órdenes registradas para graficar.</p>
                ) : (
                  <div className="space-y-4">
                    {ordersByState.map((state) => (
                      <div key={state.estado} className="space-y-2 rounded-lg border border-border/70 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <p className="font-semibold text-foreground">{state.estado}</p>
                          <p className="text-muted-foreground">{formatNumber(state.cantidad)} órdenes</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{state.porcentaje}% del total</span>
                          <span>{formatCurrency(state.monto_total)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${state.porcentaje}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xl font-semibold text-foreground">Auditoría de órdenes</h2>
              <p className="text-sm text-muted-foreground">Bitácora de cambios recientes realizados por los procedimientos almacenados.</p>
            </div>
            <div className="px-6 py-5">
              {reportData.auditoriaOrdenes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No se registraron operaciones en la auditoría.</p>
              ) : (
                <div className="space-y-4">
                  {reportData.auditoriaOrdenes.map((audit) => (
                    <div key={audit.id_auditoria} className="rounded-lg border border-border/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Orden #{audit.id_orden || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">
                            Proveedor: {audit.proveedor_nombre || "Sin asignar"}
                          </p>
                        </div>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                          {audit.accion || "Acción no definida"}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                        <span>Estado registrado: {formatStateLabel(audit.estado)}</span>
                        <span>Fecha del pedido: {formatDate(audit.fecha_pedido)}</span>
                        <span>Auditado el: {formatDateTime(audit.fecha_auditoria)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
