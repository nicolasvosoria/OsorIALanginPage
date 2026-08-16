import { IaArcade } from "@/components/ia-arcade"

// El arcade vive en la landing; esta ruta se mantiene para los enlaces que ya
// circulan por fuera y renderiza exactamente el mismo componente.
export default function AIDemoPage() {
  return (
    <main className="min-h-screen bg-black py-10">
      <IaArcade />
    </main>
  )
}
