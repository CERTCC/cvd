# cvd
Coordinated Vulnerability Disclosure 

This CVD repository is an implementaion of [CVD Guide](https://vuls.cert.org/confluence/display/CVD/The+CERT+Guide+to+Coordinated+Vulnerability+Disclosure) guidance document. The CVD guidance document highlights [various phases](https://vuls.cert.org/confluence/display/CVD/4.+Phases+of+CVD) of a CVD as Discovery, Reporting, Triage, Remediation, Public Awareness followed by Deployment. There are also [Roles](https://vuls.cert.org/confluence/display/CVD/3.+Roles+in+CVD) defined in CVD that identifies several stakeholders intergral to the defined CVD process. Below is a quick overview of these phases in a tabular form.

| Phases/Roles | Finder | Reporter | Vendor | Coordinator | Deployer |
| --- | --- | --- | --- | --- | --- |
| Discovery | Finds Vulnerabilities | - | - | - | - |
| Reporting | Prepares Report | Reports Vulnerabilities | Receives Reports | Receives Report, Assists Reporting| - |
| Triage | - |Validates and Prioritizes report for response | Prepares pacthces, Develops advisory | Validates reports receive and Priorit |-|
| Remediation | - | Confirms Fix | Prepares patches, Develops advisory | Coordinates multiparty response, Develops advisory | - |
| Public Awareness | Publishes report | Publishes report | Publishes report | Publishes report | Receives Report |
| Deployment | - | - | - | Monitors Deployment | Deploys fixes and/or mitigations |

This repostiory attempts to build a machine that will follow CVD process providing both **CVD data schemas** and related **CVD processing engines** that will carry us through these phases.  

