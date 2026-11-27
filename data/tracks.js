/* Career tracks. Each track is an ordered list of course ids (see data/courses-*.js).
   Exam facts checked on the web, 27 Nov 2026 (mostly third-party sources; confirm on the vendor site before booking):
   - Cisco CCNA 200-301 v1.1: Network Fundamentals 20%, Network Access 20%, IP Connectivity 25%,
     IP Services 10%, Security Fundamentals 15%, Automation and Programmability 10%.
     Several sources say v2.0 replaces v1.1 on 3 Feb 2027 under the same number.
   - Cisco CCST Networking 100-150 (50 minutes) and CCST IT Support: entry-level Cisco certificates.
   - Microsoft: MD-102, AZ-900, AZ-104 continue. MS-102 retires 30 Nov 2026; AB-650 named as successor (beta).
   - Microsoft Deployment Toolkit (MDT) is retired (Microsoft Learn, Jan 2026): use Autopilot or ConfigMgr OSD. */
/* Subject areas: how courses are grouped on the Learn page. */
window.AREAS = [
  { id: "m365", title: "Microsoft 365", courses: ["m365", "exchange", "collab", "entra", "intune"] },
  { id: "win", title: "Windows Server and devices", courses: ["ad", "imaging"] },
  { id: "cloud", title: "Cloud", courses: ["cloud", "azure"] },
  { id: "linux", title: "Linux", courses: ["linux"] },
  { id: "net", title: "Networking and Cisco (CCNA)", courses: ["net", "ccna-switch", "ccna-route", "ccna-services", "ccna-security", "ccna-auto"] }
];
window.TRACKS = [
  { id: "support", title: "IT Support", role: "Service desk, 1st and 2nd level support, field support",
    goal: "Solve user problems on Windows, Microsoft 365 and the network, and handle tickets the ITIL way.",
    certs: ["Cisco CCST IT Support", "ITIL 4 / Version 5 Foundation", "Microsoft MD-102 (later)"],
    courses: ["m365", "exchange", "collab", "entra", "intune", "imaging", "net", "linux"] },
  { id: "sysadmin", title: "System Administrator", role: "Windows Server, Active Directory, Microsoft 365 and Azure administration",
    goal: "Run the servers, identities and cloud services a company depends on.",
    certs: ["Microsoft AZ-900", "Microsoft MD-102", "Microsoft AZ-104", "Microsoft AB-650 (successor of MS-102)"],
    courses: ["ad", "m365", "entra", "exchange", "intune", "imaging", "cloud", "azure", "linux", "net"] },
  { id: "network", title: "Network Engineer", role: "Switching, routing, wireless and network security",
    goal: "Design, configure and troubleshoot Cisco networks to CCNA level.",
    certs: ["Cisco CCST Networking (100-150)", "Cisco CCNA (200-301)"],
    courses: ["net", "ccna-switch", "ccna-route", "ccna-services", "ccna-security", "ccna-auto", "linux", "cloud", "azure"] }
];

/* Journey stages: the road from start to the destination job, per track. */
window.JOURNEYS = {
  support: { dest: "IT Support Specialist", stages: [
    { title: "Basecamp", tag: "Where every IT legend starts: with a printer that will not print.", courses: ["net", "m365"] },
    { title: "The Help Desk Valley", tag: "Tickets, Outlook and the eternal question: did you restart it?", courses: ["exchange", "collab"], check: "ITIL Foundation" },
    { title: "Identity Ridge", tag: "Passwords, MFA and people who forgot both.", courses: ["entra", "intune"] },
    { title: "The Deployment Pass", tag: "Laptops for everyone, set up while you drink coffee.", courses: ["imaging", "linux"], check: "Cisco CCST IT Support" } ] },
  sysadmin: { dest: "System Administrator", stages: [
    { title: "Basecamp", tag: "Learn the network before it learns your weaknesses.", courses: ["net", "ad"] },
    { title: "Microsoft Highlands", tag: "Tenants, mailboxes and the art of least privilege.", courses: ["m365", "entra", "exchange"], check: "AZ-900" },
    { title: "Endpoint Forest", tag: "Every device managed, no device left behind.", courses: ["intune", "imaging"], check: "MD-102" },
    { title: "Cloud Summit", tag: "Above the clouds, the bill is still real.", courses: ["cloud", "azure"], check: "AZ-104" },
    { title: "Penguin Plateau", tag: "sudo make me a sandwich.", courses: ["linux"] } ] },
  network: { dest: "Network Engineer", stages: [
    { title: "Basecamp", tag: "Seven layers, one cable, endless possibilities.", courses: ["net"], check: "CCST Networking" },
    { title: "Switching Swamp", tag: "VLANs, trunks and loops that Spanning Tree saves you from.", courses: ["ccna-switch"] },
    { title: "Routing Ridge", tag: "Every packet needs a road. You build the roads.", courses: ["ccna-route", "ccna-services"] },
    { title: "Firewall Fortress", tag: "Deny any any, unless you have a very good reason.", courses: ["ccna-security"], check: "CCNA 200-301" },
    { title: "Automation Peak", tag: "Why type it twenty times when Python can do it once?", courses: ["ccna-auto", "linux", "cloud"] } ] }
};
