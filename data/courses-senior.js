/* Senior-level modules, attached to existing courses. Level tags: Foundation (default), Professional, Senior.
   These cover what senior admins and engineers are judged on: architecture, security, scale, operations. */
(function () {
  const add = (courseId, mod) => {
    const c = (window.COURSES || []).find((x) => x.id === courseId);
    if (c) c.modules.push(Object.assign({ level: "Senior" }, mod));
  };

  add("ad", { id: "tiering", title: "Securing Active Directory (tier model)", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Attackers who reach Domain Admin own the company. Senior AD work is mostly about making that path long, noisy and detectable."],
    ["h", "The enterprise access model in short"],
    ["parts", [["Control plane (old 'Tier 0')", "Domain controllers, AD CS, Entra Connect, identity admins: the crown jewels"], ["Management plane (Tier 1)", "Servers and the admins who run them"], ["User plane (Tier 2)", "Workstations and helpdesk"]]],
    ["p", "Rule: credentials of a higher tier never touch a lower-tier machine. A Domain Admin who signs in to a normal laptop leaves reusable credentials there."],
    ["part", "2", "Go deeper"],
    ["h", "Attacks you must recognise"],
    ["parts", [["Pass-the-hash / pass-the-ticket", "Stolen credential material reused without the password"], ["Kerberoasting", "Request service tickets for accounts with SPNs and crack weak service passwords offline"],
      ["AS-REP roasting", "Accounts without Kerberos pre-authentication leak crackable data"], ["DCSync", "An account with replication rights pulls all password hashes"],
      ["Golden ticket", "Forged TGTs signed with the krbtgt key"], ["AD CS misconfigurations (ESC1 and others)", "Certificate templates that let users request certificates as anyone"]]],
    ["h", "Defences that work"],
    ["steps", ["Privileged Access Workstations for control-plane admins", "Protected Users group and 'Account is sensitive and cannot be delegated' for admins",
      "Group Managed Service Accounts (gMSA) instead of service accounts with static passwords", "Windows LAPS on every machine", "Reset the krbtgt password twice (with a pause for replication) after a suspected compromise and periodically",
      "Disable NTLMv1 and SMBv1; enable LDAP signing and channel binding", "Audit AD CS templates; restrict enrolment rights", "Alert on changes to Domain Admins, Enterprise Admins, AdminSDHolder, GPOs linked to DCs"]],
    ["h", "Assessment tools"],
    ["parts", [["PingCastle", "Free AD health and risk score report"], ["Purple Knight", "Free AD security assessment"], ["BloodHound", "Graphs attack paths to Domain Admin (used by both attackers and defenders)"]]],
    ["part", "3", "Practice"],
    ["steps", ["Run PingCastle in your lab and fix the top three findings", "Create a gMSA and run a scheduled task with it", "Write a one-page tiering policy for a 300-user company"]]
  ], quiz: [
    ["Cracking service account passwords from Kerberos tickets is called...", ["DCSync", "Kerberoasting", "Golden ticket", "Pass-the-hash"], 1],
    ["After a suspected krbtgt compromise you...", ["Reboot DCs", "Reset krbtgt twice with a pause", "Delete Domain Admins", "Disable Kerberos"], 1],
    ["Service accounts with automatic password rotation:", ["gMSA", "Guest", "Protected Users", "Local admin"], 0],
    ["Control-plane admins should sign in from...", ["Any laptop", "A privileged access workstation", "A kiosk", "Their phone"], 1]
  ]});

  add("entra", { id: "zerotrust", title: "Zero Trust architecture and tenant governance", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Zero Trust means: verify explicitly, use least privilege, assume breach. Every request is checked by identity, device and risk, wherever it comes from."],
    ["h", "The pillars"],
    ["parts", [["Identity", "Strong MFA, Conditional Access, PIM for admin roles"], ["Devices", "Compliance from Intune feeding Conditional Access"], ["Applications", "SSO through Entra ID, app consent controlled"],
      ["Data", "Sensitivity labels, DLP, encryption (Purview)"], ["Network", "No implicit trust from the office network; segment and inspect"], ["Visibility", "Logs to a SIEM such as Microsoft Sentinel, automated response"]]],
    ["part", "2", "Go deeper"],
    ["h", "Governance a senior admin owns"],
    ["steps", ["Conditional Access as code: named policies, a naming standard, report-only before enforce, change records", "Access reviews every quarter for guests and privileged groups",
      "Entitlement management: access packages with approval and expiry instead of ad-hoc group adds", "Admin consent workflow: users cannot grant risky app permissions themselves",
      "Lifecycle workflows: joiner, mover, leaver automated from HR data", "Break-glass accounts monitored with alerts on every sign-in"]],
    ["h", "Measuring it"],
    ["p", "Microsoft Secure Score and the Conditional Access gap analysis show where you are. Senior admins report progress in business terms: 'MFA coverage 98%, legacy auth blocked, 0 standing Global Admins'."],
    ["part", "3", "Practice"],
    ["steps", ["Write a Conditional Access naming standard and five policies with it", "Design a joiner-mover-leaver process for a 500-person company", "Prepare a 5-minute talk: 'Our Zero Trust roadmap for the next 12 months'"]]
  ], quiz: [
    ["Zero Trust principle:", ["Trust the office network", "Assume breach", "Admins are always trusted", "VPN equals secure"], 1],
    ["Time-limited admin role activation:", ["PIM", "SSPR", "DKIM", "LAPS"], 0],
    ["Quarterly confirmation that guests still need access:", ["Access reviews", "Message trace", "Autopilot", "Retention"], 0]
  ]});

  add("ccna-route", { id: "design", title: "Enterprise network design and troubleshooting at scale", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Senior network engineers design for failure, change safely and troubleshoot with a method, not with luck."],
    ["h", "Campus design"],
    ["parts", [["Access layer", "Where users and APs connect; PoE, port security, 802.1X"], ["Distribution layer", "Aggregates access switches, routing between VLANs, policy"], ["Core layer", "Fast, simple, redundant transport between buildings and the data centre"],
      ["Collapsed core", "Core and distribution combined; common in medium companies"]]],
    ["h", "Design principles"],
    ["steps", ["No single point of failure on paths that matter: two uplinks, two power supplies, FHRP", "Keep layer 2 domains small; route as close to the access as practical", "Summarise routes at boundaries", "Standardise: same models, same configs, same naming"]],
    ["part", "2", "Go deeper"],
    ["h", "WAN and internet edge"],
    ["parts", [["SD-WAN", "Central policy, several internet links per branch, application-aware routing"], ["BGP", "The internet's routing protocol; enterprises use it with two ISPs (multihoming)"], ["MPLS", "Provider network with service levels; being replaced by SD-WAN in many companies"]]],
    ["h", "Structured troubleshooting"],
    ["steps", ["Define the problem precisely: who, what, since when, what changed", "Pick an approach: bottom-up, top-down, divide-and-conquer from layer 3, or follow the path hop by hop",
      "Compare with a baseline (normal CPU, interface errors, routes)", "Change one thing at a time and record it", "Close with root cause, fix and prevention in the ticket"]],
    ["h", "Change management"],
    ["p", "Senior engineers plan changes with a method of procedure: pre-checks, exact commands, verification, rollback, a maintenance window and a peer review. 'reload in 10' before risky remote changes saves you if you cut yourself off."],
    ["part", "3", "Practice"],
    ["steps", ["Draw a collapsed-core design for a 3-floor office with redundancy", "Write a method of procedure for adding a VLAN to 20 switches", "Packet Tracer: break something in a friend's topology and find it with the divide-and-conquer method"]]
  ], quiz: [
    ["Layer where users and access points connect:", ["Core", "Distribution", "Access", "WAN"], 2],
    ["Protocol used with two ISPs at the internet edge:", ["OSPF", "BGP", "RIP", "STP"], 1],
    ["Safety net before a risky remote change:", ["reload in 10", "erase startup-config", "debug all", "no logging"], 0]
  ]});

  add("m365", { id: "ops", title: "Running Microsoft 365 at scale", blocks: [
    ["part", "1", "Big picture"],
    ["one", "At senior level the job moves from clicking in admin centres to automation, change control and measurable service quality."],
    ["h", "What changes at scale"],
    ["parts", [["Automation", "PowerShell and Microsoft Graph instead of manual work; scripts in Git with reviews"], ["Change control", "Message center changes assessed, pilots before broad rollout"], ["Licensing", "Monthly licence reports; reclaim unused licences"], ["Service management", "SLAs, major incident process, post-incident reviews"]]],
    ["part", "2", "Go deeper"],
    ["h", "Microsoft Graph PowerShell"],
    ["cmd", "Connect-MgGraph -Scopes \"User.Read.All\",\"AuditLog.Read.All\"\nGet-MgUser -All -Property DisplayName,SignInActivity | Where-Object { $_.SignInActivity.LastSignInDateTime -lt (Get-Date).AddDays(-90) }", "Users who have not signed in for 90 days (sign-in activity needs Entra ID P1)"],
    ["h", "Backup and compliance"],
    ["p", "Microsoft keeps the service running but recommends you own your backup and retention strategy. Use retention policies in Purview for legal needs and a third-party or Microsoft 365 Backup product for restores at scale."],
    ["part", "3", "Practice"],
    ["steps", ["Write a script that lists unlicensed and inactive users and exports a CSV", "Design a monthly Microsoft 365 operations report with five numbers management cares about"]]
  ], quiz: [
    ["Modern API for automating Microsoft 365:", ["Microsoft Graph", "SNMP", "LDAP only", "FTP"], 0],
    ["Legal hold and keeping data for 10 years is handled in...", ["Purview retention", "Teams policies", "Intune", "DNS"], 0]
  ]});
})();
