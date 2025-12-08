# SOC Management Dashboard - Quick Reference Guide

## 🚀 Quick Start

### Access the Dashboard
- **URL**: `http://localhost:5173/soc-management`
- **From Documentation**: Visit `/soc` → Click "Access SOC Management Dashboard"

### First Look
When you open the dashboard, you'll see:
1. **System Status** (top right) - Green = All systems operational
2. **Quick Stats** (4 cards) - Critical alerts, active incidents, threats, system health
3. **System Metrics** - Real-time health monitoring
4. **Alerts Panel** (main area) - All security alerts
5. **Threat Intelligence** (right sidebar) - Active threat indicators
6. **AI Assistant** (right sidebar) - AI-driven recommendations
7. **Compliance Status** (right sidebar) - Regulatory compliance

---

## 🎯 Alert Severity Levels

| Severity | Color | Response Time | Description |
|----------|-------|---------------|-------------|
| **Critical** | 🔴 Red | < 5 minutes | Immediate threat requiring urgent action |
| **High** | 🟠 Orange | < 15 minutes | Serious threat requiring prompt attention |
| **Medium** | 🟡 Yellow | < 1 hour | Moderate risk requiring investigation |
| **Low** | 🟢 Green | < 4 hours | Minor issue for routine review |

---

## 📊 Alert Status Workflow

```
Active → Investigating → Contained → Resolved
```

### Status Definitions
- **Active** (🔴): New alert requiring triage
- **Investigating** (🟡): Under analysis by security team
- **Contained** (🔵): Threat isolated, remediation in progress
- **Resolved** (🟢): Incident closed, documented

---

## 🔍 Alert Actions

### When to Use Each Action

#### 🔎 **Investigate**
- **When**: Alert is in "Active" status
- **Effect**: Changes status to "Investigating"
- **Next Steps**: Analyze logs, gather evidence, identify scope
- **Best Practice**: Assign to specific analyst

#### 🛡️ **Contain**
- **When**: Alert is "Investigating" and threat confirmed
- **Effect**: Changes status to "Contained"
- **Actions**: Isolate systems, block IPs, quarantine files
- **Best Practice**: Execute containment playbook

#### ✅ **Resolve**
- **When**: Threat is contained and remediated
- **Effect**: Changes status to "Resolved"
- **Required**: Complete documentation of actions taken
- **Best Practice**: Schedule post-incident review

---

## 🤖 AI Recommendations

### How to Use
1. Look for alerts with **blue AI recommendation boxes**
2. Review the AI-suggested action
3. Verify recommendation against your analysis
4. Execute if appropriate, or escalate if uncertain

### AI Capabilities
- ✅ Pre-triage and prioritization
- ✅ Context enrichment from threat intel
- ✅ Investigation path suggestions
- ✅ Response action recommendations
- ⚠️ **Important**: Always verify before acting

### AI Guardrails
- 🔒 No autonomous execution on production systems
- 📝 All recommendations logged for audit
- 👤 Human approval required for critical actions
- 📊 Recommendation acceptance tracked as KPI

---

## 🎛️ Filtering Alerts

### By Severity
```
All Severities → Critical → High → Medium → Low
```

### By Status
```
All Statuses → Active → Investigating → Contained → Resolved
```

### Pro Tips
- **Critical Alerts Only**: Select "Critical" severity filter
- **Active Incidents**: Select "Active" + "Investigating" statuses
- **Recently Resolved**: Select "Resolved" status, sort by time
- **Combine Filters**: Use severity + status for precise results

---

## 📈 System Metrics

### Health Status Indicators

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| **System Health** | ≥ 95% | 80-94% | < 80% |
| **Threat Level** | ≤ 40 | 41-70 | > 70 |
| **Response Time** | ≤ 5 min | 5-15 min | > 15 min |

### Trend Indicators
- **↑ Red**: Increasing (concerning)
- **↓ Green**: Decreasing (improving)
- **→ Gray**: Stable (no change)

---

## 🎯 Threat Intelligence

### Indicator Types
- **IP Address**: Source of malicious traffic
- **File Hash**: Malware signature (MD5/SHA256)
- **Domain**: Malicious website or C2 server
- **Email**: Phishing or spam source

### Confidence Scores
- **90-100%**: High confidence - Take immediate action
- **75-89%**: Medium confidence - Investigate thoroughly
- **50-74%**: Low confidence - Correlate with other indicators
- **< 50%**: Very low - Monitor but don't act

### Using Threat Intel
1. Check if alert IPs/domains match threat indicators
2. Review confidence score and sources
3. Cross-reference with other security tools
4. Update blocklists if high confidence

---

## ✅ Compliance Status

### Framework Meanings

| Framework | What It Covers |
|-----------|----------------|
| **ISO 27001** | Information security management |
| **GDPR** | Data protection and privacy (EU) |
| **SOC 2** | Service organization controls |
| **NIST CSF** | Cybersecurity framework (US) |

### Status Indicators
- **🟢 Compliant**: All controls met
- **🟡 In Review**: Audit in progress
- **🔴 Non-Compliant**: Action required

---

## ⚡ Quick Actions Cheat Sheet

### Responding to Critical Alerts
```
1. Click alert to view full details
2. Review AI recommendation
3. Click "Investigate" button
4. Assign to analyst (yourself or team member)
5. Gather evidence from listed sources
6. If threat confirmed → Click "Contain"
7. Execute containment actions (block IP, isolate system)
8. Verify threat is contained
9. Click "Resolve" when remediation complete
10. Document findings and lessons learned
```

### Daily SOC Workflow
```
08:00 - Open dashboard, review overnight alerts
08:15 - Triage any new critical/high alerts
09:00 - Investigate assigned incidents
10:00 - Review threat intelligence updates
11:00 - Continue incident investigations
12:00 - Lunch break
13:00 - Update alert statuses
14:00 - Containment actions for confirmed threats
15:00 - Documentation and reporting
16:00 - Handoff to next shift
17:00 - End of shift
```

---

## 🚨 Emergency Procedures

### Critical Alert Response (< 5 minutes)
1. **Acknowledge** alert immediately
2. **Assess** severity and blast radius
3. **Contain** if actively exploited
4. **Escalate** to senior analyst if needed
5. **Document** all actions taken

### Mass Incident Event
1. Alert SOC manager immediately
2. Activate incident response team
3. Execute emergency playbooks
4. Maintain situation awareness
5. Provide regular status updates

### System Down/Unavailable
1. Check system status indicator (top right)
2. Alert IT operations team
3. Switch to backup monitoring systems
4. Document downtime and missed alerts
5. Review missed alerts when system restored

---

## 📞 Escalation Contacts

### When to Escalate
- ❗ Critical severity + High confidence threat
- ❗ Active data exfiltration
- ❗ Ransomware detected
- ❗ Multiple concurrent critical alerts
- ❗ Threat beyond your skill level
- ❗ Management notification required

### Escalation Path
```
Tier 1 Analyst
    ↓
Tier 2/3 Senior Analyst
    ↓
SOC Manager
    ↓
CISO / Security Leadership
```

---

## 💡 Pro Tips

### Efficiency Tips
- ✨ Use keyboard shortcuts (if configured)
- ✨ Keep most common filters saved
- ✨ Review AI recommendations first
- ✨ Batch similar alerts together
- ✨ Document as you investigate

### Investigation Tips
- 🔍 Always check threat intelligence first
- 🔍 Look for related alerts (same IP, user, system)
- 🔍 Review user's recent activity
- 🔍 Check if alert matches known false positive
- 🔍 Correlate with other security tool data

### Documentation Tips
- 📝 Document findings in real-time
- 📝 Include timestamps for all actions
- 📝 Note evidence sources
- 📝 Record commands executed
- 📝 Capture screenshots of key findings

---

## 🔐 Security Best Practices

### Operational Security
- 🔒 Never share credentials
- 🔒 Lock workstation when away
- 🔒 Use encrypted communications
- 🔒 Follow least privilege principle
- 🔒 Report suspicious activity immediately

### Data Handling
- 🗄️ Treat all alert data as sensitive
- 🗄️ Don't export data without approval
- 🗄️ Redact PII in reports
- 🗄️ Use secure channels for sharing
- 🗄️ Follow data retention policies

---

## 📚 Additional Resources

### Internal Documentation
- **Full Documentation**: Visit `/soc` page
- **Playbooks**: Security Operations SharePoint
- **Runbooks**: Incident Response Wiki
- **Training**: Security Academy Portal

### External References
- **MITRE ATT&CK**: https://attack.mitre.org/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **ISO 27001**: https://www.iso.org/standard/27001
- **Threat Intelligence Feeds**: Internal TI Platform

---

## 🆘 Getting Help

### In-Dashboard Help
- Hover over (?) icons for tooltips
- Click AI Assistant for queries
- Review alert recommendations

### Technical Support
- **Email**: soc-support@planted.example
- **Slack**: #security-ops
- **Phone**: x5555 (internal)
- **Emergency**: 24/7 Hotline

### Training & Onboarding
- **New Analyst Training**: 2-week program
- **Tool Certification**: Available quarterly
- **Tabletop Exercises**: Monthly
- **Simulated Incidents**: Bi-weekly

---

## 📊 Performance Metrics

### Individual Analyst KPIs
- **MTTA** (Mean Time to Acknowledge): < 5 minutes
- **MTTR** (Mean Time to Resolve): < 2 hours
- **Escalation Rate**: < 15%
- **False Positive Rate**: < 10%
- **AI Recommendation Adoption**: > 80%

### Team KPIs
- **Detection Coverage**: > 90%
- **Alert Closure Rate**: > 95%
- **SLA Compliance**: > 98%
- **Customer Satisfaction**: > 4.5/5

---

## 🎓 Quick Training Scenarios

### Scenario 1: Failed Login Attempts
```
Alert: "Multiple failed login attempts"
Severity: Critical
Action: 
1. Click "Investigate"
2. Check if IP is in threat intel
3. Review user account activity
4. If confirmed attack → "Contain"
5. Block IP at firewall
6. Reset user password
7. Enable MFA if not active
8. "Resolve" with documentation
```

### Scenario 2: Data Exfiltration
```
Alert: "Unusual data transfer detected"
Severity: High
Action:
1. Click "Investigate"
2. Identify user and destination
3. Check file classification
4. Review user access rights
5. If unauthorized → "Contain"
6. Disable user account
7. Quarantine transferred files
8. Notify data owner
9. "Resolve" with incident report
```

### Scenario 3: Malware Detection
```
Alert: "Malware signature detected"
Severity: High
Action:
1. Click "Investigate"
2. Note endpoint and malware type
3. Check AI recommendation
4. "Contain" immediately
5. Isolate endpoint from network
6. Run full system scan
7. Remove/quarantine malware
8. Restore from clean backup
9. "Resolve" with remediation notes
```

---

**Version**: 1.0.0  
**Last Updated**: December 8, 2025  
**For**: Security Operations Team  
**Maintained By**: SOC Management

---

## 🔖 Bookmark These URLs

- **SOC Dashboard**: http://localhost:5173/soc-management
- **Documentation**: http://localhost:5173/soc
- **Main Platform**: http://localhost:5173/

---

**Need help?** Contact the Security Operations Team at soc-support@planted.example
