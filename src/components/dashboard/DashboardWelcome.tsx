import { useEffect, useRef } from 'react'
import { Icon } from '../Icons'

export default function DashboardWelcome({ name }: { name?: string }) {
  const firstName = name?.trim().split(/\s+/)[0]
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return <section className="dashboard-welcome" aria-labelledby="dashboard-heading">
    <div className="welcome-copy">
      <p className="eyebrow"><Icon name="sparkle" />UM PASSO DE CADA VEZ</p>
      <h1 id="dashboard-heading" ref={headingRef} tabIndex={-1}>SEUS PLANOS.<br /><span>UM DIA MAIS LEVE.</span></h1>
      <p>{firstName ? `Que bom te ver, ${firstName}.` : 'Que bom ter você por aqui.'} Organize o que importa, no seu ritmo.</p>
    </div>
    <div className="welcome-postcard" aria-hidden="true">
      <img src="/mascot.png" alt="" />
      <span><Icon name="sparkle" />Você dá conta.</span>
    </div>
  </section>
}
