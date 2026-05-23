# Compliance Checklist - MountainConnect ID

## Indonesian Laws Compliance

### UU PDP (Undang-Undang Perlindungan Data Pribadi)

#### 1. Data Inventory & Mapping

- [ ] Complete data inventory across all systems (DB, files, backups, logs)
- [ ] Document data categories: identity, contact, location, health, financial, biometric
- [ ] Map data flows (collection → processing → storage → transfer → deletion)
- [ ] Document legal basis for each processing activity
- [ ] Maintain data processing register (Rekam Kegiatan Pemrosesan)

#### 2. Consent Management

- [ ] Implement granular consent mechanisms (opt-in/opt-out)
- [ ] Separate consent for marketing, analytics, third-party sharing
- [ ] Record consent timestamp, version, and scope
- [ ] Provide easy consent withdrawal mechanism
- [ ] Display consent request in Bahasa Indonesia
- [ ] Store consent proof for regulatory audit

#### 3. Data Subject Rights

| Right | Implementation | Status |
|-------|---------------|--------|
| Access | User can download full profile data export | [ ] |
| Rectification | User can edit profile, contact, emergency info | [ ] |
| Erasure | "Delete Account" with data purge confirmation | [ ] |
| Restriction | User can pause account without deletion | [ ] |
| Portability | Export data in JSON/CSV format | [ ] |
| Object | Opt-out from marketing, profiling, location tracking | [ ] |

#### 4. Data Breach Notification

- [ ] Incident detection system (automated alerts)
- [ ] Breach assessment workflow
- [ ] Notification to PPI (Pengawas Perlindungan Data Pribadi) within 72 hours
- [ ] Notification to affected individuals
- [ ] Breach register maintenance
- [ ] Recovery and remediation procedures

#### 5. DPO Appointment

- [ ] Designate Data Protection Officer (Penanggung Jawab Pelindungan Data)
- [ ] Publish DPO contact information
- [ ] DPO can be contacted: dpo@mountainconnect.id
- [ ] DPO duties documented and trained
- [ ] DPO independence ensured

#### 6. Cross-Border Transfer

- [ ] Document all data transfer destinations
- [ ] Ensure adequate protection level in receiving country
- [ ] Use Standard Contractual Clauses (SCC) for transfers
- [ ] Record transfer basis and safeguards
- [ ] Available countries: Singapore (AWS), Ireland (Firebase)

#### 7. Privacy by Design

- [ ] Data minimization implemented (collect only necessary)
- [ ] Purpose limitation enforced
- [ ] Default privacy settings (highest protection)
- [ ] Security by default (encryption, access control)
- [ ] Privacy impact assessments for new features

#### 8. Technical & Organizational Measures

- [ ] Encryption at rest (AES-256)
- [ ] Encryption in transit (TLS 1.3)
- [ ] Access control (RBAC, least privilege)
- [ ] Audit logging (who, when, what)
- [ ] Regular security testing (pentest, vuln scan)
- [ ] Employee security training
- [ ] NDAs for employees with data access

---

### Peraturan Menparekraf Compliance

#### 1. TN (Taman Nasional) MoU Requirements

- [ ] Valid MoU with each TN management (BNF, BTN Tambora, etc.)
- [ ] Kuota integration with TN systems
- [ ] Real-time hiker distribution data sharing
- [ ] Incident reporting to TN authorities
- [ ] Ranger coordination channel established
- [ ] Conservation fee collection and remittance

#### 2. climbing Permit System

- [ ] Integration with online permit systems
- [ ] Permit validation before booking confirmation
- [ ] Permit QR code generation and scanning
- [ ] Permit status tracking and reminders
- [ ] Permit cancellation/refund handling

#### 3. Operator Licensing

- [ ] Guide certification verification
- [ ] Operator license validation
- [ ] Safety equipment requirements check
- [ ] Insurance coverage verification
- [ ] Rating and review system for operators

#### 4. Safety & Rescue

- [ ] SOS alert system integration with SAR
- [ ] Emergency contact directory per TN
- [ ] First aid kit requirements for trips
- [ ] Weather alert and trail closure system
- [ ] Evacuation procedure documentation

---

## Technical Implementation Requirements

### Data Localization

- [ ] Primary database in Indonesia (AWS Jakarta)
- [ ] Backup storage in Indonesia
- [ ] Personal data not stored outside Indonesia without safeguards

### Retention Periods

| Data Type | Retention | Basis |
|-----------|-----------|-------|
| Account data | Until account deletion + 30 days | Active use |
| Trip history | 7 years | Tax/legal requirement |
| SOS records | 10 years | Safety regulation |
| Transaction records | 10 years | Tax law |
| Location tracks | 2 years | Service improvement |
| Analytics data | 2 years | Anonymized |
| Backup data | 90 days | Backup cycle |

### Security Standards

- [ ] ISO 27001 aligned
- [ ] SOC 2 Type II certification (target)
- [ ] PCI DSS compliance (if storing cards)
- [ ] OWASP Top 10 mitigation
- [ ] Regular penetration testing

---

## Audit & Review Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Data inventory review | Quarterly | DPO |
| Consent audit | Monthly | Compliance |
| Access log review | Weekly | Security |
| Security testing | Annual | Security Team |
| Compliance review | Annual | DPO + Legal |
| Third-party audit | Annual | External Auditor |
| Incident response drill | Bi-annual | Operations |

---

## Document Control

- Document Owner: DPO
- Review Frequency: Annual
- Last Reviewed: [DATE]
- Next Review: [DATE]
- Version: 1.0
