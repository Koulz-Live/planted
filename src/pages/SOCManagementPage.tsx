import React, { useState, useEffect } from 'react';
import './SOCManagementPage.css';

// ===========================
// Icons
// ===========================

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M5.072.56A1.5 1.5 0 0 1 6.01 0h3.98a1.5 1.5 0 0 1 .938.56l1.78 2.22A1.5 1.5 0 0 1 13 4.22V7c0 3.28-2.205 5.994-5.5 6.856C4.205 12.994 2 10.28 2 7V4.22a1.5 1.5 0 0 1-.708-1.44l1.78-2.22z" />
    <path d="M6.5 8.5L5 7l-.5.5L6.5 9.5 11 5l-.5-.5z" fill="white" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
  </svg>
);

const ActivityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M1 11v-1h2v1H1zm3-2V8h1v1H4zm1-2V6h1v1H5zm1-2V4h1v1H6zm1-2V2h1v1H7zm2 8v-1h1v1H9zm1-2V8h1v1h-1zm1-2V6h1v1h-1zm1-2V4h1v1h-1zm1-2V2h1v1h-1zM2 14v-3h12v3H2z" />
  </svg>
);

const NetworkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z" />
  </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
  </svg>
);

const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M4.318 2.687C5.234 1.582 6.536 1 8 1s2.766.582 3.682 1.687C12.644 3.832 13 5.32 13 7c0 .734-.07 1.396-.202 1.985a3.99 3.99 0 0 0-.483.264c-.27-1.224-.82-2.554-1.582-3.556C9.762 4.35 8.96 4 8 4s-1.762.35-2.733 1.693c-.762 1.002-1.313 2.332-1.582 3.556a3.99 3.99 0 0 0-.483-.264A7.758 7.758 0 0 1 3 7c0-1.68.356-3.168 1.318-4.313z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
  </svg>
);

// ===========================
// Types
// ===========================

interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'contained' | 'resolved';
  assignedTo?: string;
  aiRecommendation?: string;
}

interface ThreatIndicator {
  type: string;
  value: string;
  confidence: number;
  lastSeen: Date;
  sources: string[];
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

// ===========================
// Mock Data Generator
// ===========================

const generateMockAlerts = (): SecurityAlert[] => {
  const now = new Date();
  return [
    {
      id: 'ALT-001',
      severity: 'critical',
      title: 'Multiple failed login attempts detected',
      description: '15 failed login attempts from IP 45.142.212.61 targeting admin accounts',
      source: 'Azure AD',
      timestamp: new Date(now.getTime() - 5 * 60000),
      status: 'investigating',
      assignedTo: 'Sarah Chen',
      aiRecommendation: 'Block source IP and enforce MFA on affected accounts'
    },
    {
      id: 'ALT-002',
      severity: 'high',
      title: 'Unusual data exfiltration pattern',
      description: 'Large file transfer (2.3GB) to external storage at unusual hour',
      source: 'DLP Gateway',
      timestamp: new Date(now.getTime() - 12 * 60000),
      status: 'active',
      aiRecommendation: 'Review user activity and quarantine transferred files'
    },
    {
      id: 'ALT-003',
      severity: 'medium',
      title: 'Suspicious PowerShell execution',
      description: 'Base64 encoded command executed on endpoint WKST-1423',
      source: 'EDR',
      timestamp: new Date(now.getTime() - 25 * 60000),
      status: 'investigating',
      assignedTo: 'Mike Rodriguez'
    },
    {
      id: 'ALT-004',
      severity: 'high',
      title: 'Malware signature detected',
      description: 'Trojan.GenericKD.67891234 detected on endpoint WKST-0892',
      source: 'Antivirus',
      timestamp: new Date(now.getTime() - 45 * 60000),
      status: 'contained',
      assignedTo: 'Sarah Chen',
      aiRecommendation: 'Isolate endpoint and perform full system scan'
    },
    {
      id: 'ALT-005',
      severity: 'low',
      title: 'Port scan detected',
      description: 'Sequential port scanning activity from internal network',
      source: 'Firewall',
      timestamp: new Date(now.getTime() - 60 * 60000),
      status: 'resolved'
    }
  ];
};

const generateThreatIndicators = (): ThreatIndicator[] => {
  const now = new Date();
  return [
    {
      type: 'IP Address',
      value: '45.142.212.61',
      confidence: 95,
      lastSeen: new Date(now.getTime() - 5 * 60000),
      sources: ['Azure AD', 'Firewall Logs']
    },
    {
      type: 'File Hash',
      value: 'a3f8d9e2c1b0...',
      confidence: 88,
      lastSeen: new Date(now.getTime() - 45 * 60000),
      sources: ['EDR', 'Antivirus']
    },
    {
      type: 'Domain',
      value: 'malicious-cdn.xyz',
      confidence: 92,
      lastSeen: new Date(now.getTime() - 120 * 60000),
      sources: ['DNS Logs', 'Threat Intel Feed']
    },
    {
      type: 'Email',
      value: 'phishing@fake-bank.com',
      confidence: 85,
      lastSeen: new Date(now.getTime() - 180 * 60000),
      sources: ['Email Gateway']
    }
  ];
};

// ===========================
// Main Component
// ===========================

export default function SOCManagementPage() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [threatIndicators, setThreatIndicators] = useState<ThreatIndicator[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // System metrics
  const [metrics] = useState<SystemMetric[]>([
    { name: 'System Health', value: 98, unit: '%', status: 'healthy', trend: 'stable' },
    { name: 'Threat Level', value: 65, unit: '/100', status: 'warning', trend: 'up' },
    { name: 'Active Monitors', value: 247, unit: '', status: 'healthy', trend: 'stable' },
    { name: 'Response Time', value: 2.3, unit: 'min', status: 'healthy', trend: 'down' }
  ]);

  useEffect(() => {
    // Initialize data
    setAlerts(generateMockAlerts());
    setThreatIndicators(generateThreatIndicators());

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Randomly update alert statuses
      setAlerts(prev => 
        prev.map(alert => {
          if (Math.random() > 0.95 && alert.status !== 'resolved') {
            const statuses: SecurityAlert['status'][] = ['investigating', 'contained', 'resolved'];
            const currentIndex = statuses.indexOf(alert.status);
            if (currentIndex < statuses.length - 1) {
              return { ...alert, status: statuses[currentIndex + 1] };
            }
          }
          return alert;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#dc2626';
      case 'investigating': return '#f59e0b';
      case 'contained': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleAlertAction = (alertId: string, action: 'investigate' | 'contain' | 'resolve') => {
    setAlerts(prev =>
      prev.map(alert => {
        if (alert.id === alertId) {
          let newStatus: SecurityAlert['status'] = alert.status;
          switch (action) {
            case 'investigate':
              newStatus = 'investigating';
              break;
            case 'contain':
              newStatus = 'contained';
              break;
            case 'resolve':
              newStatus = 'resolved';
              break;
          }
          return { ...alert, status: newStatus };
        }
        return alert;
      })
    );
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const activeCount = alerts.filter(a => a.status === 'active' || a.status === 'investigating').length;

  return (
    <div className="soc-mgmt-page">
      {/* Header */}
      <header className="soc-mgmt-header">
        <div className="soc-mgmt-header-content">
          <div>
            <div className="soc-mgmt-badge">
              <ShieldCheckIcon />
              <span>Security Operations Center</span>
            </div>
            <h1 className="soc-mgmt-title">SOC Management Dashboard</h1>
            <p className="soc-mgmt-subtitle">
              Real-time threat detection, incident response, and AI-augmented security operations
            </p>
          </div>
          <div className="soc-mgmt-status">
            <div className="status-indicator status-green">
              <span className="status-dot"></span>
              <span>All Systems Operational</span>
            </div>
            <div className="soc-mgmt-timestamp">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="soc-mgmt-stats">
        <div className="stat-card stat-critical">
          <div className="stat-icon">
            <AlertTriangleIcon />
          </div>
          <div className="stat-content">
            <div className="stat-value">{criticalCount}</div>
            <div className="stat-label">Critical Alerts</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon">
            <ActivityIcon />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active Incidents</div>
          </div>
        </div>
        <div className="stat-card stat-threats">
          <div className="stat-icon">
            <NetworkIcon />
          </div>
          <div className="stat-content">
            <div className="stat-value">{threatIndicators.length}</div>
            <div className="stat-label">Threat Indicators</div>
          </div>
        </div>
        <div className="stat-card stat-health">
          <div className="stat-icon">
            <EyeIcon />
          </div>
          <div className="stat-content">
            <div className="stat-value">{metrics[0].value}%</div>
            <div className="stat-label">System Health</div>
          </div>
        </div>
      </section>

      {/* System Metrics */}
      <section className="soc-mgmt-section">
        <h2 className="section-title">System Metrics</h2>
        <div className="metrics-grid">
          {metrics.map(metric => (
            <div key={metric.name} className={`metric-card metric-${metric.status}`}>
              <div className="metric-header">
                <span className="metric-name">{metric.name}</span>
                <span className={`metric-trend trend-${metric.trend}`}>
                  {metric.trend === 'up' && '↑'}
                  {metric.trend === 'down' && '↓'}
                  {metric.trend === 'stable' && '→'}
                </span>
              </div>
              <div className="metric-value">
                {metric.value}{metric.unit}
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-bar-fill" 
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="soc-mgmt-grid">
        {/* Alerts Panel */}
        <section className="soc-mgmt-section alerts-section">
          <div className="section-header">
            <h2 className="section-title">Security Alerts</h2>
            <div className="section-filters">
              <select 
                value={filterSeverity} 
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="investigating">Investigating</option>
                <option value="contained">Contained</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="alerts-list">
            {filteredAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`alert-card alert-${alert.severity} ${selectedAlert?.id === alert.id ? 'selected' : ''}`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="alert-header">
                  <div className="alert-id-severity">
                    <span className="alert-id">{alert.id}</span>
                    <span 
                      className="alert-severity"
                      style={{ backgroundColor: getSeverityColor(alert.severity) }}
                    >
                      {alert.severity}
                    </span>
                    <span 
                      className="alert-status"
                      style={{ color: getStatusColor(alert.status) }}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <span className="alert-time">
                    <ClockIcon className="time-icon" />
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
                <h3 className="alert-title">{alert.title}</h3>
                <p className="alert-description">{alert.description}</p>
                <div className="alert-meta">
                  <span className="alert-source">Source: {alert.source}</span>
                  {alert.assignedTo && (
                    <span className="alert-assignee">Assigned: {alert.assignedTo}</span>
                  )}
                </div>
                {alert.aiRecommendation && (
                  <div className="alert-ai">
                    <BrainIcon className="ai-icon" />
                    <span className="ai-label">AI Recommendation:</span>
                    <span className="ai-text">{alert.aiRecommendation}</span>
                  </div>
                )}
                <div className="alert-actions">
                  {alert.status === 'active' && (
                    <button 
                      className="action-btn btn-investigate"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAlertAction(alert.id, 'investigate');
                      }}
                    >
                      Investigate
                    </button>
                  )}
                  {alert.status === 'investigating' && (
                    <button 
                      className="action-btn btn-contain"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAlertAction(alert.id, 'contain');
                      }}
                    >
                      Contain
                    </button>
                  )}
                  {(alert.status === 'investigating' || alert.status === 'contained') && (
                    <button 
                      className="action-btn btn-resolve"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAlertAction(alert.id, 'resolve');
                      }}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Threat Intelligence Panel */}
        <aside className="soc-mgmt-sidebar">
          <section className="soc-mgmt-section">
            <h2 className="section-title">Threat Intelligence</h2>
            <div className="threat-indicators">
              {threatIndicators.map((indicator, idx) => (
                <div key={idx} className="threat-card">
                  <div className="threat-header">
                    <span className="threat-type">{indicator.type}</span>
                    <span className="threat-confidence">
                      {indicator.confidence}% confidence
                    </span>
                  </div>
                  <div className="threat-value">{indicator.value}</div>
                  <div className="threat-meta">
                    <span className="threat-time">
                      Last seen: {formatTimestamp(indicator.lastSeen)}
                    </span>
                    <div className="threat-sources">
                      Sources: {indicator.sources.join(', ')}
                    </div>
                  </div>
                  <div className="threat-confidence-bar">
                    <div 
                      className="threat-confidence-fill"
                      style={{ width: `${indicator.confidence}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="soc-mgmt-section">
            <h2 className="section-title">AI Security Assistant</h2>
            <div className="ai-assistant">
              <div className="ai-status">
                <BrainIcon className="ai-status-icon" />
                <div>
                  <div className="ai-status-label">AI Agent Active</div>
                  <div className="ai-status-text">Monitoring and analyzing threats</div>
                </div>
              </div>
              <div className="ai-insights">
                <h3>Recent AI Actions</h3>
                <ul className="ai-actions-list">
                  <li>
                    <CheckCircleIcon className="check-icon" />
                    <span>Correlated 3 alerts into single incident</span>
                  </li>
                  <li>
                    <CheckCircleIcon className="check-icon" />
                    <span>Enriched IP with threat intelligence</span>
                  </li>
                  <li>
                    <CheckCircleIcon className="check-icon" />
                    <span>Suggested containment for ALT-001</span>
                  </li>
                  <li>
                    <CheckCircleIcon className="check-icon" />
                    <span>Auto-triaged 5 low-priority alerts</span>
                  </li>
                </ul>
              </div>
              <button className="ai-query-btn">
                Ask AI Security Assistant
              </button>
            </div>
          </section>

          <section className="soc-mgmt-section">
            <h2 className="section-title">Compliance Status</h2>
            <div className="compliance-grid">
              <div className="compliance-item">
                <span className="compliance-label">ISO 27001</span>
                <span className="compliance-status status-pass">Compliant</span>
              </div>
              <div className="compliance-item">
                <span className="compliance-label">GDPR</span>
                <span className="compliance-status status-pass">Compliant</span>
              </div>
              <div className="compliance-item">
                <span className="compliance-label">SOC 2</span>
                <span className="compliance-status status-warning">In Review</span>
              </div>
              <div className="compliance-item">
                <span className="compliance-label">NIST CSF</span>
                <span className="compliance-status status-pass">Compliant</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
