"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ProvidersSection from "@/components/providers/providers-section"
import ContractsSection from "@/components/contracts/contracts-section"

export default function Home() {
  const [activeSection, setActiveSection] = useState("proveedores")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "proveedores" && <ProvidersSection />}
          {activeSection === "contratos" && <ContractsSection />}
          {activeSection === "ordenes" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground">Órdenes de Compra</h2>
              <p className="text-muted-foreground mt-2">Sección en desarrollo</p>
            </div>
          )}
          {activeSection === "equipos" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground">Equipos Adquiridos</h2>
              <p className="text-muted-foreground mt-2">Sección en desarrollo</p>
            </div>
          )}
          {activeSection === "tecnicos" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground">Técnicos Autorizados</h2>
              <p className="text-muted-foreground mt-2">Sección en desarrollo</p>
            </div>
          )}
          {activeSection === "calificaciones" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground">Calificaciones</h2>
              <p className="text-muted-foreground mt-2">Sección en desarrollo</p>
            </div>
          )}
          {activeSection === "incidencias" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground">Incidencias</h2>
              <p className="text-muted-foreground mt-2">Sección en desarrollo</p>
            </div>
          )}
          {activeSection === "reportes" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground">Reportes Ejecutivos</h2>
              <p className="text-muted-foreground mt-2">Sección en desarrollo</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
