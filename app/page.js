"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ProvidersSection from "@/components/providers/providers-section"
import ContractsSection from "@/components/contracts/contracts-section"
import OrdersSection from "@/components/orders/orders-section"
import EquipmentSection from "@/components/equipment/equipment-section"
import TechniciansSection from "@/components/technicians/technicians-section"
import RatingsSection from "@/components/ratings/ratings-section"
import IncidentsSection from "@/components/incidents/incidents-section"
import ReportsSection from "@/components/reports/reports-section"

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
          {activeSection === "ordenes" && <OrdersSection />}
          {activeSection === "equipos" && <EquipmentSection />}
          {activeSection === "tecnicos" && <TechniciansSection />}
          {activeSection === "calificaciones" && <RatingsSection />}
          {activeSection === "incidencias" && <IncidentsSection />}
          {activeSection === "reportes" && <ReportsSection />}
        </main>
      </div>
    </div>
  )
}
