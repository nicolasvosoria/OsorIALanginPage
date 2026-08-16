"use client"

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion"
import { GitBranch, GitCommit, GitPullRequest, Users2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const ACCENT = "#11B30B"

interface MetricsPayload {
  commits: number | null
  pullRequests: number | null
  branches: number | null
  people: number | null
  languages: string[]
}

/** Cuenta desde cero hasta el valor real cuando el número entra en pantalla. */
function CountUp({ value }: { value: number }) {
  const count = useMotionValue(0)
  const display = useTransform(count, (latest) => Math.round(latest).toLocaleString("es-CO"))

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "easeOut" })
    return () => controls.stop()
  }, [count, value])

  return <motion.span>{display}</motion.span>
}

function Metric({
  icon: Icon,
  value,
  label,
  delay,
  visible,
}: {
  icon: typeof GitCommit
  value: number | null
  label: string
  delay: number
  visible: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="p-6 text-center"
    >
      <Icon className="w-8 h-8 sm:w-12 sm:h-12 mb-4 mx-auto" style={{ color: ACCENT }} />
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
        {/* Nunca mostramos un número inventado: hasta que llegue el dato real, va un guion. */}
        {visible && value !== null ? <CountUp value={value} /> : "—"}
      </div>
      <p className="text-gray-400 text-base sm:text-lg">{label}</p>
    </motion.div>
  )
}

export function ImpactMetrics() {
  const [data, setData] = useState<MetricsPayload | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    let cancelled = false

    fetch("/api/github-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: MetricsPayload | null) => {
        if (!cancelled && payload) setData(payload)
      })
      .catch((error) => console.error("No se pudieron cargar las métricas:", error))

    return () => {
      cancelled = true
    }
  }, [])

  // El contador solo arranca cuando la sección está a la vista Y ya hay dato.
  const ready = isInView && data !== null

  return (
    <div ref={ref} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Metric
          icon={GitCommit}
          value={data?.commits ?? null}
          label="Commits publicados"
          delay={0}
          visible={ready}
        />
        <Metric
          icon={GitPullRequest}
          value={data?.pullRequests ?? null}
          label="Pull requests revisados"
          delay={0.1}
          visible={ready}
        />
        <Metric
          icon={GitBranch}
          value={data?.branches ?? null}
          label="Ramas de trabajo"
          delay={0.2}
          visible={ready}
        />
        <Metric
          icon={Users2}
          value={data?.people ?? null}
          label="Personas en las plataformas que construimos"
          delay={0.3}
          visible={ready}
        />
      </div>

      {data?.languages && data.languages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-3 px-4"
        >
          <p className="text-gray-400 text-base sm:text-lg">Lo que estamos usando ahora mismo</p>
          <div className="flex flex-wrap justify-center gap-3">
            {data.languages.map((language) => (
              <span
                key={language}
                className="rounded-full border border-gray-500 px-4 py-1 text-sm text-gray-300"
              >
                {language}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
