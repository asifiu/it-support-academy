/* Career tracks. Each track is an ordered list of course ids (see data/courses-*.js).
   Exam facts checked on the web, 27 Nov 2026 (mostly third-party sources; confirm on the vendor site before booking):
   - Cisco CCNA 200-301 v1.1: Network Fundamentals 20%, Network Access 20%, IP Connectivity 25%,
     IP Services 10%, Security Fundamentals 15%, Automation and Programmability 10%.
     Several sources say v2.0 replaces v1.1 on 3 Feb 2027 under the same number.
   - Cisco CCST Networking 100-150 (50 minutes) and CCST IT Support: entry-level Cisco certificates.
   - Microsoft: MD-102, AZ-900, AZ-104 continue. MS-102 retires 30 Nov 2026; AB-650 named as successor (beta).
   - Microsoft Deployment Toolkit (MDT) is retired (Microsoft Learn, Jan 2026): use Autopilot or ConfigMgr OSD. */
window.TRACKS = [
  { id: "support", title: "IT Support", role: "Service desk, 1st and 2nd level support, field support",
    goal: "Solve user problems on Windows, Microsoft 365 and the network, and handle tickets the ITIL way.",
    certs: ["Cisco CCST IT Support", "ITIL 4 / Version 5 Foundation", "Microsoft MD-102 (later)"],
    courses: ["m365", "exchange", "collab", "entra", "intune", "imaging", "net"] },
  { id: "sysadmin", title: "System Administrator", role: "Windows Server, Active Directory, Microsoft 365 and Azure administration",
    goal: "Run the servers, identities and cloud services a company depends on.",
    certs: ["Microsoft AZ-900", "Microsoft MD-102", "Microsoft AZ-104", "Microsoft AB-650 (successor of MS-102)"],
    courses: ["ad", "m365", "entra", "exchange", "intune", "imaging", "cloud", "net"] },
  { id: "network", title: "Network Engineer", role: "Switching, routing, wireless and network security",
    goal: "Design, configure and troubleshoot Cisco networks to CCNA level.",
    certs: ["Cisco CCST Networking (100-150)", "Cisco CCNA (200-301)"],
    courses: ["net", "ccna-switch", "ccna-route", "ccna-services", "ccna-security", "ccna-auto", "cloud"] }
];
