import { User } from "lucide-react"

export default function Header() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-foreground">Sistema de Gestión de Proveedores</h2>

      {/* <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">Usuario Admin</p>
          <p className="text-xs text-muted-foreground">admin@sistema.com</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      </div> */}
    </header>
  )
}
