import React from 'react';
import './SOCPage.css';

const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M5.072 0.56A1.5 1.5 0 0 1 6.01 0h3.98a1.5 1.5 0 0 1 .938.56l1.78 2.22A1.5 1.5 0 0 1 13 4.22V7c0 3.28-2.205 5.994-5.5 6.856C4.205 12.994 2 10.28 2 7V4.22a1.5 1.5 0 0 1-.708-1.44l1.78-2.22z" />
  </svg>
);

const RadarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M8 3a5 5 0 1 1-3.84 1.79l.74.67A4 4 0 1 0 8 4V3z" />
    <path d="M8 0a8 8 0 1 0 7.446 4.97l-1.096.44A7 7 0 1 1 8 1V0z" />
    <circle cx="8" cy="8" r="1.25" />
  </svg>
);

const LightningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M11.3 1L4.5 8.2H8L6.7 15l6.8-7.2H10L11.3 1z" />
  </svg>
);

const PersonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M8 8a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 1c-2.67 0-5 1.12-5 2.8V14h10v-2.2C13 10.12 10.67 9 8 9z" />
  </svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M7.002 1.566a1.5 1.5 0 0 1 1.996 0l6.857 6.364C16.466 8.52 15.88 10 14.853 10H1.147C.12 10-.466 8.52.145 7.93z" />
    <path d="M7.001 4h2v4h-2zM7 9h2v2H7z" />
  </svg>
);

const isoControls = [
  { id: 'A.5.7', name: 'Threat intelligence', summary: 'Continuous monitoring of threat feeds, correlation into detections, and AI-assisted analysis.' },
  { id: 'A.5.23', name: 'Cloud services security', summary: 'Centralized logging and monitoring for managed cloud platforms and SaaS providers.' },
  { id: 'A.5.30–A.5.43', name: 'Logging & incident management', summary: 'End-to-end coverage from log collection to incident response and lessons learned.' },
  { id: 'A.8.16', name: 'Monitoring activities', summary: 'Real-time visibility into endpoints, identities, and workloads with risk-focused dashboards.' },
  { id: 'A.8.23', name: 'Web & endpoint protections', summary: 'Integration with XDR, EDR, and web gateways for coordinated detection and response.' }
];

const architectureLayers = [
  {
    title: 'Visibility & Collection',
    description: 'Aggregate logs and telemetry from cloud, endpoints, identities, and key business systems into a unified view.',
    inputs: ['Application logs', 'Cloud audit trails', 'Endpoint telemetry', 'Identity events'],
    outputs: ['Normalized events', 'Asset context', 'Signal quality metrics']
  },
  {
    title: 'Detection & Intelligence',
    description: 'Use rules, anomaly models, UEBA, and threat intelligence to turn events into high-fidelity alerts.',
    inputs: ['Normalized events', 'Threat intel feeds', 'Behavior baselines'],
    outputs: ['Correlated alerts', 'Risk scores', 'Detection coverage gaps']
  },
  {
    title: 'Automation & Orchestration',
    description: 'Execute playbooks that enrich, triage, and respond to alerts with human-in-the-loop approvals.',
    inputs: ['Alerts', 'Playbooks', 'Runbooks'],
    outputs: ['Enriched alerts', 'Containment actions', 'Response audit trail']
  },
  {
    title: 'Operations & Response',
    description: 'Analysts investigate, contain, and eradicate threats using guided workflows and AI assistants.',
    inputs: ['Enriched alerts', 'Case notes', 'Threat intel'],
    outputs: ['Resolved incidents', 'Root cause analysis', 'Handoff to platform teams']
  },
  {
    title: 'Assurance & Reporting',
    description: 'Provide evidence for audits, management reviews, and control effectiveness assessments.',
    inputs: ['Incident records', 'Detection metrics', 'Audit requirements'],
    outputs: ['Compliance reports', 'Executive summaries', 'Control maturity insights']
  },
  {
    title: 'Governance & ISMS Integration',
    description: 'Feed SOC insights into the ISMS, risk register, and continuous improvement cycle.',
    inputs: ['Risk register', 'Policy requirements', 'Business impact'],
    outputs: ['Updated risks', 'Improved controls', 'Management review input']
  }
];

const workflowSteps = [
  {
    step: '01',
    title: 'Event collection & normalization',
    summary: 'Telemetry from cloud, endpoints, and identities is ingested into the SIEM/XDR and normalized to a common schema.'
  },
  {
    step: '02',
    title: 'Alert generation & AI pre-triage',
    summary: 'Detections fire and AI agents cluster, de-duplicate, and enrich alerts with context, proposing an initial classification.'
  },
  {
    step: '03',
    title: 'Human triage & prioritization',
    summary: 'Analysts validate AI recommendations, apply playbooks, and assign severity, ownership, and SLAs.'
  },
  {
    step: '04',
    title: 'Investigation',
    summary: 'Analysts and AI assistants pivot across logs, assets, and identities to understand scope, root cause, and blast radius.'
  },
  {
    step: '05',
    title: 'Containment & remediation',
    summary: 'SOAR workflows and platform teams execute containment and remediation actions with full auditability.'
  },
  {
    step: '06',
    title: 'Closure & lessons learned',
    summary: 'Incidents are documented, reviewed, and fed back into detections, playbooks, and the ISMS for continual improvement.'
  }
];

const kpis = [
  {
    label: 'MTTA',
    value: ' 5 min',
    description: 'Mean time for the SOC to acknowledge high-severity alerts after creation.'
  },
  {
    label: 'MTTR',
    value: ' 2 hrs',
    description: 'Mean time to resolve high-severity incidents from detection to closure.'
  },
  {
    label: 'Detection coverage',
    value: '90%+',
    description: 'Percentage of priority threat scenarios backed by at least one active detection.'
  },
  {
    label: 'AI recommendation adoption',
    value: '80%+',
    description: 'How often analysts accept AI-suggested triage or response actions.'
  }
];

const roles = [
  {
    title: 'SOC Manager',
    summary: 'Owns SOC strategy, KPIs, and alignment with the ISMS and risk appetite.',
    focus: 'Governance & reporting'
  },
  {
    title: 'Tier 1 Analyst',
    summary: 'Monitors queues, performs triage, and executes standard playbooks with AI support.',
    focus: 'Triage & containment'
  },
  {
    title: 'Tier 2/3 Analyst',
    summary: 'Leads complex investigations, coordinates remediation with platform owners, and tunes detections.',
    focus: 'Deep investigation'
  },
  {
    title: 'Threat Hunter',
    summary: 'Runs proactive hunts, develops hypotheses, and drives new detections.',
    focus: 'Proactive defense'
  },
  {
    title: 'ISMS / GRC Lead',
    summary: 'Connects SOC outputs to the risk register, audits, and management reviews.',
    focus: 'Risk & compliance'
  }
];

export default function SOCPage() {
  return (
    <div className="soc-page">
      {/* Hero */}
      <header className="soc-hero">
        <div className="soc-hero-inner">
          <div className="soc-hero-eyebrow">
            <ShieldIcon className="soc-hero-icon" />
            <span>Security Operations &amp; ISMS</span>
          </div>
          <h1 className="soc-hero-title">AI	1Augmented Security Operations Center</h1>
          <p className="soc-hero-subtitle">
            A modern SOC that continuously monitors, detects, and responds to threats while providing
            ISO/IEC 27001:2022-aligned evidence and feeding insights back into your Information
            Security Management System.
          </p>
          <div className="soc-hero-tags">
            <span className="soc-tag">ISO/IEC 27001:2022</span>
            <span className="soc-tag">AI-augmented SOC</span>
            <span className="soc-tag">Continuous monitoring</span>
          </div>
        </div>
        <div className="soc-hero-aside">
          <div className="soc-hero-card">
            <RadarIcon className="soc-hero-card-icon" />
            <h3>Always-on visibility</h3>
            <p>
              Centralize events from cloud, endpoints, and identities so the SOC sees risk in one
              place instead of chasing logs across platforms.
            </p>
          </div>
          <div className="soc-hero-card">
            <LightningIcon className="soc-hero-card-icon" />
            <h3>Human + AI response</h3>
            <p>
              AI agents suggest triage and response actions while analysts stay in control and
              approve changes.
            </p>
          </div>
        </div>
      </header>

      <main className="soc-shell">
        {/* Purpose & Scope + ISO controls overview */}
        <section className="soc-section soc-section-grid">
          <div>
            <h2 className="soc-section-title">Purpose &amp; scope</h2>
            <p className="soc-section-body">
              The SOC exists to detect, analyze, and respond to security events and incidents across
              critical systems while maintaining clear evidence for compliance and risk management.
              It serves as the operational heart of the ISMS, turning signals from across the
              environment into decisions, actions, and improvements.
            </p>
            <div className="soc-pill-grid">
              <div className="soc-pill">
                <AlertIcon className="soc-pill-icon" />
                <div>
                  <h3>In scope</h3>
                  <p>
                    Managed cloud platforms, key SaaS applications, corporate identities,
                    endpoints, and critical business services.
                  </p>
                </div>
              </div>
              <div className="soc-pill">
                <PersonIcon className="soc-pill-icon" />
                <div>
                  <h3>Out of scope</h3>
                  <p>
                    Environments and devices that are not onboarded or managed, unless explicitly
                    included by policy or project.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="soc-section-title">ISO/IEC 27001 mapping</h2>
            <p className="soc-section-body">
              The SOC supports multiple Annex A controls, especially around logging, monitoring,
              threat intelligence, and incident management.
            </p>
            <div className="soc-iso-grid">
              {isoControls.map((control) => (
                <article key={control.id} className="soc-iso-card">
                  <div className="soc-iso-id">{control.id}</div>
                  <h3 className="soc-iso-name">{control.name}</h3>
                  <p className="soc-iso-summary">{control.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture layers */}
        <section className="soc-section">
          <div className="soc-section-header">
            <h2 className="soc-section-title">Operating model &amp; architecture layers</h2>
            <p className="soc-section-body">
              From raw telemetry to executive reporting, the SOC is structured into layers that each
              have clear inputs, outputs, and ownership. Together they form a closed loop that keeps
              risk visible and manageable.
            </p>
          </div>
          <div className="soc-layers-grid">
            {architectureLayers.map((layer) => (
              <article key={layer.title} className="soc-layer-card">
                <h3>{layer.title}</h3>
                <p>{layer.description}</p>
                <div className="soc-layer-meta">
                  <div>
                    <h4>Inputs</h4>
                    <ul>
                      {layer.inputs.map((input) => (
                        <li key={input}>{input}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Outputs</h4>
                    <ul>
                      {layer.outputs.map((output) => (
                        <li key={output}>{output}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="soc-section">
          <div className="soc-section-header">
            <h2 className="soc-section-title">SOC workflow at a glance</h2>
            <p className="soc-section-body">
              The standard operating procedure runs from telemetry ingestion to post-incident review
              and ISMS updates, with AI agents assisting at every stage while humans stay accountable.
            </p>
          </div>
          <div className="soc-workflow">
            {workflowSteps.map((step) => (
              <article key={step.step} className="soc-step-card">
                <div className="soc-step-badge">{step.step}</div>
                <div className="soc-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* AI agents & KPIs */}
        <section className="soc-section soc-section-grid">
          <div>
            <h2 className="soc-section-title">AI agents in the SOC</h2>
            <p className="soc-section-body">
              AI agents augment analysts by handling repetitive enrichment and triage tasks, crafting
              investigation paths, and drafting reports. They never act alone on production systems:
              humans approve changes, tune behaviors, and own outcomes.
            </p>
            <ul className="soc-list">
              <li>
                Pre-triage alerts by clustering, de-duplicating, and recommending classifications.
              </li>
              <li>
                Enrich events with asset, user, and threat intelligence context in seconds.
              </li>
              <li>
                Suggest investigation steps, queries, and hypotheses based on similar cases.
              </li>
              <li>
                Draft incident timelines and executive or audit-ready summaries.
              </li>
              <li>
                Feed structured outputs into the ISMS, risk register, and management reviews.
              </li>
            </ul>
            <div className="soc-callout">
              <h3>Guardrails &amp; governance</h3>
              <p>
                All AI actions are logged, reviewed, and subject to the same change and risk
                management practices as human-driven changes. The SOC defines clear boundaries for
                what agents can suggest versus what they can execute.
              </p>
            </div>
          </div>

          <div>
            <h2 className="soc-section-title">Metrics &amp; continual improvement</h2>
            <p className="soc-section-body">
              KPIs tie SOC performance to business and risk outcomes. Trends trigger tuning,
              training, and updates to controls and playbooks.
            </p>
            <div className="soc-kpi-grid">
              {kpis.map((metric) => (
                <article key={metric.label} className="soc-kpi-card">
                  <div className="soc-kpi-label">{metric.label}</div>
                  <div className="soc-kpi-value">{metric.value}</div>
                  <p className="soc-kpi-description">{metric.description}</p>
                </article>
              ))}
            </div>
            <p className="soc-section-body soc-section-body-small">
              KPI reviews feed directly into detection tuning, new playbooks, training plans, and
              ISMS management reviews. Significant incidents are followed by structured
              post-incident reviews.
            </p>
          </div>
        </section>

        {/* Roles & governance */}
        <section className="soc-section soc-section-grid">
          <div>
            <h2 className="soc-section-title">Roles &amp; responsibilities</h2>
            <p className="soc-section-body">
              Clear ownership keeps incidents moving and ensures that controls remain effective over
              time. Each role has defined responsibilities and handoffs.
            </p>
            <div className="soc-roles-grid">
              {roles.map((role) => (
                <article key={role.title} className="soc-role-card">
                  <h3>{role.title}</h3>
                  <p>{role.summary}</p>
                  <span className="soc-role-focus">{role.focus}</span>
                </article>
              ))}
            </div>
          </div>
          <div>
            <h2 className="soc-section-title">Document governance</h2>
            <p className="soc-section-body">
              Runbooks, playbooks, and SOC procedures are living documents. They are versioned,
              reviewed, and tied into the ISMS so that changes are intentional and auditable.
            </p>
            <ul className="soc-list">
              <li>Playbooks and SOPs are version-controlled with clear owners and approvers.</li>
              <li>
                Reviews happen at least annually and after major incidents or system changes.
              </li>
              <li>
                Links into risk register items, policies, and control objectives keep the SOC
                aligned with business priorities.
              </li>
              <li>
                Evidence from incidents and responses is stored in a way that supports audits and
                management reviews.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
