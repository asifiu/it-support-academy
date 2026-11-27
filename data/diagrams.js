/* Diagrams drawn as inline SVG, so they are sharp on every screen and follow light/dark mode.
   Use in any lesson/guide/deep dive with the block ["svg", "id", "caption"]. */
(function () {
  const W = 640;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // box(x, y, w, h, "line1\nline2", kind) kind: "" | "hi" (navy) | "soft" | "warn" | "ok"
  function box(x, y, w, h, text, kind = "") {
    const lines = String(text).split("\n");
    const lh = 17, start = y + h / 2 - ((lines.length - 1) * lh) / 2 + 5;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" class="d-box ${kind}"/>` +
      lines.map((l, i) => `<text x="${x + w / 2}" y="${start + i * lh}" class="d-t ${kind}${i ? " sub" : ""}">${esc(l)}</text>`).join("");
  }
  function arrow(x1, y1, x2, y2, label = "", dashed = false) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="d-a${dashed ? " dash" : ""}" marker-end="url(#ah)"/>` +
      (label ? `<text x="${mx + (x1 === x2 ? 8 : 0)}" y="${my - 6}" class="d-l" text-anchor="${x1 === x2 ? "start" : "middle"}">${esc(label)}</text>` : "");
  }
  function line(x1, y1, x2, y2, cls = "d-line") { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`; }
  function label(x, y, text, anchor = "middle", cls = "d-l") { return `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(text)}</text>`; }
  function frame(x, y, w, h, title) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="d-frame"/>` + label(x + 12, y + 20, title, "start", "d-ft");
  }
  function svg(h, body, title) {
    return `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(title)}" class="diagram"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="d-head"/></marker></defs>${body}</svg>`;
  }

  const D = {};

  D.levels = svg(330,
    box(240, 10, 160, 44, "User\nphone, email, chat, portal", "soft") +
    arrow(320, 54, 320, 82) +
    box(170, 84, 300, 54, "1st level: Service Desk\npasswords, printers, Outlook, how-to", "hi") +
    label(490, 108, "fixes 60-80%", "start") + label(490, 126, "uses the knowledge base", "start") +
    arrow(320, 138, 320, 166, "escalate with a good note") +
    box(170, 168, 300, 54, "2nd level\nservers, GPO, permissions, network") +
    arrow(320, 222, 320, 250, "escalate") +
    box(170, 252, 300, 54, "3rd level\nspecialists, vendors, developers") +
    label(150, 196, "harder,", "end") + label(150, 214, "rarer", "end") + label(150, 112, "common,", "end") + label(150, 130, "fast", "end"),
    "Support levels");

  D.cycle = svg(250,
    box(20, 30, 180, 56, "1 Identify\nask questions", "hi") + arrow(200, 58, 228, 58) +
    box(230, 30, 180, 56, "2 Theory\nmost likely cause") + arrow(410, 58, 438, 58) +
    box(440, 30, 180, 56, "3 Test\ntry it") +
    arrow(530, 86, 530, 150, "works") +
    `<path d="M 470 30 C 470 0, 330 0, 330 28" class="d-a dash" marker-end="url(#ah)"/>` + label(482, 18, "wrong? new theory, or escalate", "start") +
    box(440, 152, 180, 56, "4 Plan + fix\nthink of side effects") + arrow(440, 180, 412, 180) +
    box(230, 152, 180, 56, "5 Verify\nuser tests it") + arrow(230, 180, 202, 180) +
    box(20, 152, 180, 56, "6 Document\ncause + fix in ticket", "ok") +
    label(320, 240, "Ask, Guess, Test, Fix, Check, Write"),
    "Six-step troubleshooting");

  D.lab = svg(380,
    box(250, 8, 140, 40, "Internet", "soft") +
    line(320, 48, 320, 78) + label(330, 68, "home router", "start") +
    frame(14, 78, 612, 292, "Your PC: Windows 11 Pro + Hyper-V (the host)") +
    box(240, 104, 160, 50, "FW01  OPNsense\nWAN: external switch") + label(410, 134, "Week 6", "start") +
    line(320, 154, 320, 186) + label(330, 176, "LAN 10.10.10.1 = gateway", "start") +
    `<rect x="40" y="188" width="560" height="22" rx="6" class="d-bus"/>` + label(320, 204, "LabNet  10.10.10.0/24  (internal virtual switch)", "middle", "d-t hi") +
    line(105, 210, 105, 240) + line(245, 210, 245, 240) + line(385, 210, 385, 240) + line(525, 210, 525, 240) +
    box(40, 240, 130, 62, "DC01\nServer 2022\n10.10.10.10", "hi") +
    box(180, 240, 130, 62, "CLIENT01\nWindows 11\nDHCP") +
    box(320, 240, 130, 62, "LNX01\nUbuntu Server\n10.10.10.20") +
    box(460, 240, 130, 62, "Host vNIC\nyour Windows\n10.10.10.2", "soft") +
    label(105, 322, "AD, DNS, DHCP, files") + label(245, 322, "domain user tests") + label(385, 322, "SSH, nginx") + label(525, 322, "RSAT, browser") +
    label(320, 352, "Week 1: CLIENT01 · Week 3: DC01 · Week 5: LNX01 · Week 6: FW01"),
    "Home lab network");

  D.m365 = svg(400,
    box(250, 160, 140, 64, "Entra ID\nidentity: who you are\nand what you may do", "hi") +
    box(20, 170, 110, 44, "User\nlaptop, phone", "soft") + arrow(130, 192, 248, 192, "sign in once + MFA") +
    box(70, 20, 120, 44, "Exchange\nemail, calendar") + box(210, 20, 100, 44, "Teams\nchat, meetings") +
    box(330, 20, 110, 44, "SharePoint\nteam files") + box(460, 20, 110, 44, "OneDrive\nmy files") +
    line(130, 64, 290, 160, "d-line soft") + line(260, 64, 310, 160, "d-line soft") + line(385, 64, 330, 160, "d-line soft") + line(515, 64, 350, 160, "d-line soft") +
    box(470, 140, 150, 44, "Office apps\nWord, Excel, Outlook") + line(470, 162, 390, 182, "d-line soft") +
    box(470, 210, 150, 44, "Intune\nmanages devices") + line(470, 232, 390, 200, "d-line soft") +
    box(470, 280, 150, 40, "Defender: security") + box(470, 330, 150, 40, "Purview: compliance") +
    box(20, 300, 150, 56, "Active Directory\non-prem (hybrid)", "soft") + arrow(170, 328, 268, 226, "Entra Connect sync") +
    label(320, 390, "Everything trusts Entra ID. Intune tells Entra if a device is safe."),
    "Microsoft 365 overview");

  D.ad = svg(360,
    frame(10, 10, 620, 340, "Forest  (outer boundary, usually one per company)") +
    frame(30, 40, 580, 296, "Domain  corp.company.de") +
    box(50, 70, 120, 48, "DC01\ndomain controller", "hi") + box(50, 150, 120, 48, "DC02\ndomain controller", "hi") +
    `<line x1="110" y1="118" x2="110" y2="150" class="d-a" marker-start="url(#ah)" marker-end="url(#ah)"/>` + label(120, 139, "replication", "start") +
    box(50, 240, 120, 44, "DNS\nfinds the DCs", "soft") +
    box(260, 66, 120, 36, "OU Berlin") + line(320, 102, 320, 122) + line(250, 122, 530, 122) +
    line(250, 122, 250, 140) + line(390, 122, 390, 140) + line(530, 122, 530, 140) +
    box(200, 140, 100, 36, "OU Users") + box(340, 140, 100, 36, "OU Computers") + box(480, 140, 100, 36, "OU Groups") +
    box(200, 196, 100, 54, "Anna\nBen\nuser objects", "soft") + box(340, 196, 100, 54, "LAP-0231\nPC-017\ncomputer objects", "soft") + box(480, 196, 100, 54, "Finance-Staff\nSales-Staff\ngroups", "soft") +
    box(440, 62, 160, 44, "GPO: map drive S:\nlinked to OU Berlin", "warn") + arrow(440, 84, 382, 84) +
    label(400, 290, "Policies link to OUs. Permissions go to groups.") + label(400, 310, "Users and computers sit in OUs."),
    "Active Directory structure");

  D.logon = svg(330,
    box(10, 10, 130, 44, "PC\nuser logs on", "hi") + box(175, 10, 130, 44, "DNS server") + box(340, 10, 130, 44, "Domain controller\nKerberos (KDC)") + box(505, 10, 125, 44, "File server\n\\\\fs01\\Finance") +
    line(75, 54, 75, 320, "d-life") + line(240, 54, 240, 320, "d-life") + line(405, 54, 405, 320, "d-life") + line(567, 54, 567, 320, "d-life") +
    arrow(75, 80, 238, 80, "1 where is a DC?") + arrow(240, 104, 77, 104, "DC01 = 10.10.10.10", true) +
    arrow(75, 140, 403, 140, "2 proof of password (time within 5 min!)") + arrow(405, 166, 77, 166, "TGT: day pass, about 10 h", true) +
    arrow(75, 206, 403, 206, "3 TGT + 'I want fs01'") + arrow(405, 232, 77, 232, "service ticket for fs01", true) +
    arrow(75, 272, 565, 272, "4 service ticket: open the share") + arrow(567, 298, 77, 298, "access checked against the user's groups", true),
    "Domain logon with Kerberos");

  D.dns = svg(170,
    box(10, 20, 110, 54, "1 hosts file\nmanual entries", "soft") + arrow(120, 47, 146, 47) +
    box(148, 20, 110, 54, "2 DNS cache\nrecent answers") + arrow(258, 47, 284, 47) +
    box(286, 20, 130, 54, "3 DNS server\nfrom ipconfig", "hi") + arrow(416, 47, 442, 47) +
    box(444, 20, 186, 54, "4 LLMNR / NetBIOS\nold local fallback", "soft") +
    label(320, 110, "Windows asks in this order and stops at the first answer.") +
    label(320, 134, "On VPN, step 3 must be the COMPANY DNS server, or internal names fail."),
    "Name resolution order");

  D.mail = svg(300,
    box(10, 20, 140, 50, "Sender's server\npartner.de", "soft") + arrow(150, 45, 238, 45, "1 ask MX") +
    box(240, 20, 140, 50, "DNS\nMX record") + arrow(310, 70, 310, 108, "2 deliver here") +
    box(220, 110, 180, 56, "Exchange Online Protection\nspam, malware, SPF/DKIM/DMARC", "hi") +
    arrow(400, 125, 478, 95, "bad") + box(480, 70, 140, 44, "Quarantine", "warn") +
    arrow(400, 150, 478, 150, "suspicious") + box(480, 128, 140, 44, "Junk folder", "warn") +
    arrow(310, 166, 310, 200, "3 good") + box(220, 202, 180, 44, "Mailbox\nExchange Online", "ok") +
    arrow(220, 224, 152, 224) + box(10, 200, 140, 50, "Outlook / OWA\nphone app", "soft") +
    label(320, 286, "Message trace shows which path every single mail took."),
    "How email arrives");

  D.files = svg(250,
    box(10, 20, 170, 50, "Teams channel\n#Finance-General", "hi") + arrow(180, 45, 298, 45) + box(300, 20, 170, 50, "SharePoint site\nof the team") + label(480, 50, "shared with members", "start") +
    box(10, 100, 170, 50, "Teams 1:1 or group chat", "hi") + arrow(180, 125, 298, 125) + box(300, 100, 170, 50, "Sender's OneDrive\nshared with the chat") +
    box(10, 180, 170, 50, "Desktop, Documents\non the laptop", "soft") + arrow(180, 205, 298, 205, "Known Folder Move") + box(300, 180, 170, 50, "User's OneDrive") + label(480, 210, "on all devices", "start"),
    "Where Microsoft 365 files live");

  D.intune = svg(230,
    box(10, 70, 130, 56, "Laptop\nenrolled in Intune", "soft") + arrow(140, 98, 198, 98, "status") +
    box(200, 70, 130, 56, "Intune\ncompliant?\nencrypted, updated", "hi") + arrow(330, 98, 388, 98, "yes / no") +
    box(390, 70, 120, 56, "Entra\nConditional\nAccess", "hi") +
    arrow(510, 85, 548, 40) + box(550, 14, 80, 40, "Allow", "ok") +
    arrow(510, 112, 548, 150) + box(550, 140, 80, 40, "Block", "warn") +
    label(320, 212, "No compliance = no company email. That is the reason for many 'I cannot open Outlook' tickets."),
    "Intune and Conditional Access");

  D.hyperv = svg(320,
    frame(10, 10, 620, 300, "Physical host: CPU, RAM, disk, network card (shared)") +
    box(40, 46, 160, 74, "VM 1\nWindows Server\nown disk (VHDX)", "hi") + box(240, 46, 160, 74, "VM 2\nWindows 11", "hi") + box(440, 46, 160, 74, "VM 3\nUbuntu", "hi") +
    box(150, 150, 340, 40, "Hypervisor (Hyper-V)", "soft") + line(120, 120, 200, 150) + line(320, 120, 320, 150) + line(520, 120, 440, 150) +
    box(40, 226, 170, 56, "External switch\nVMs on your real LAN") + box(235, 226, 170, 56, "Internal switch\nVMs + host only", "ok") + box(430, 226, 170, 56, "Private switch\nVMs only") +
    line(320, 190, 125, 226) + line(320, 190, 320, 226) + line(320, 190, 515, 226),
    "Hyper-V");

  D.ticket = svg(200,
    box(10, 30, 90, 44, "New", "soft") + arrow(100, 52, 118, 52) + box(120, 30, 95, 44, "Assigned") + arrow(215, 52, 233, 52) +
    box(235, 30, 105, 44, "In progress", "hi") + arrow(340, 52, 358, 52) + box(360, 30, 95, 44, "Resolved", "ok") + arrow(455, 52, 473, 52) + box(475, 30, 155, 44, "Closed\n(auto after x days)", "ok") +
    arrow(287, 74, 287, 112) + box(200, 114, 175, 50, "Waiting for customer\nSLA clock paused", "warn") +
    `<path d="M 375 139 C 430 139, 430 90, 330 76" class="d-a dash" marker-end="url(#ah)"/>` + label(470, 125, "user answers") +
    label(553, 92, "user can reopen until closed"),
    "Ticket lifecycle");

  D.print = svg(150,
    box(10, 40, 95, 54, "App\nWord, PDF", "soft") + arrow(105, 67, 125, 67) +
    box(127, 40, 105, 54, "Print Spooler\nservice on PC", "hi") + arrow(232, 67, 252, 67) +
    box(254, 40, 100, 54, "Driver\nPCL / PS") + arrow(354, 67, 374, 67) +
    box(376, 40, 120, 54, "Port or queue\nIP or \\\\printsrv") + arrow(496, 67, 516, 67) +
    box(518, 40, 112, 54, "Printer\npaper, toner", "soft") +
    label(320, 130, "Everyone affected = printer or server. One user = PC, spooler or driver."),
    "Printing chain");

  D.perms = svg(190,
    box(10, 60, 110, 50, "User\ntoken with groups", "soft") + arrow(120, 85, 168, 85) +
    box(170, 50, 150, 70, "Gate 1\nShare permissions\n(over the network)", "hi") + arrow(320, 85, 368, 85) +
    box(370, 50, 150, 70, "Gate 2\nNTFS permissions\n(on the folder)", "hi") + arrow(520, 85, 558, 85) +
    box(560, 60, 70, 50, "File", "ok") +
    label(320, 160, "The stricter gate wins. Allows add up across groups; Deny beats Allow."),
    "Share and NTFS permissions");

  D.gpo = svg(170,
    box(10, 40, 130, 50, "1 Local\npolicy on the PC", "soft") + arrow(140, 65, 166, 65) +
    box(168, 40, 130, 50, "2 Site") + arrow(298, 65, 324, 65) +
    box(326, 40, 130, 50, "3 Domain") + arrow(456, 65, 482, 65) +
    box(484, 40, 146, 50, "4 OUs, top to bottom\nlast one wins", "hi") +
    label(320, 128, "Enforced GPOs win over everything below. 'Block inheritance' stops non-enforced ones."),
    "Group Policy order");


  D.osi = svg(370,
    label(110, 22, "OSI model", "middle", "d-ft") + label(330, 22, "TCP/IP", "middle", "d-ft") + label(530, 22, "Examples", "middle", "d-ft") +
    box(20, 34, 180, 38, "7 Application") + box(20, 76, 180, 38, "6 Presentation") + box(20, 118, 180, 38, "5 Session") +
    box(240, 34, 180, 122, "Application", "hi") + label(530, 99, "HTTP, DNS, SSH, SMTP, TLS") +
    box(20, 160, 180, 38, "4 Transport") + box(240, 160, 180, 38, "Transport", "hi") + label(530, 184, "TCP, UDP: ports, segments") +
    box(20, 202, 180, 38, "3 Network") + box(240, 202, 180, 38, "Internet", "hi") + label(530, 226, "IP, ICMP: packets, routers") +
    box(20, 244, 180, 38, "2 Data link") + box(20, 286, 180, 38, "1 Physical") + box(240, 244, 180, 80, "Network access", "hi") +
    label(530, 268, "Ethernet, Wi-Fi, MAC: frames, switches") + label(530, 310, "Cables, fibre, radio: bits") +
    label(320, 356, "Troubleshoot bottom-up: cable, link, IP, port, application"),
    "OSI and TCP/IP layers");

  D.vlan = svg(300,
    box(60, 110, 160, 60, "Switch 1", "hi") + box(420, 110, 160, 60, "Switch 2", "hi") +
    `<line x1="220" y1="140" x2="420" y2="140" class="d-a" stroke-width="4"/>` + label(320, 128, "Trunk 802.1Q: VLAN 10 + 20 tagged") +
    box(10, 220, 110, 50, "PC Sales\nVLAN 10") + box(150, 220, 110, 50, "PC HR\nVLAN 20", "soft") + box(380, 220, 110, 50, "PC Sales\nVLAN 10") + box(520, 220, 110, 50, "PC HR\nVLAN 20", "soft") +
    line(65, 220, 110, 170) + line(205, 220, 170, 170) + line(435, 220, 470, 170) + line(575, 220, 540, 170) +
    label(140, 205, "access ports") + label(500, 205, "access ports") +
    box(240, 20, 160, 50, "Router / L3 switch\nroutes between VLANs", "soft") + line(320, 70, 320, 140, "d-line soft") +
    label(320, 292, "Sales PCs talk to each other directly; Sales to HR must pass the router"),
    "VLANs and a trunk");

  D.cloudmodels = svg(330,
    label(95, 22, "On-premises", "middle", "d-ft") + label(255, 22, "IaaS", "middle", "d-ft") + label(415, 22, "PaaS", "middle", "d-ft") + label(570, 22, "SaaS", "middle", "d-ft") +
    [["Data and access", 0, 0, 0, 0], ["Application", 0, 0, 0, 1], ["Runtime", 0, 0, 1, 1], ["Operating system", 0, 0, 1, 1], ["Virtualisation", 0, 1, 1, 1], ["Servers, storage", 0, 1, 1, 1], ["Network, datacentre", 0, 1, 1, 1]]
      .map((r, i) => [20, 180, 340, 500].map((x, c) => box(x, 34 + i * 38, 140, 32, r[0], r[c + 1] ? "soft" : "hi")).join("")).join("") +
    `<rect x="20" y="306" width="14" height="14" rx="3" class="d-box hi"/>` + label(42, 318, "You manage", "start") +
    `<rect x="160" y="306" width="14" height="14" rx="3" class="d-box soft"/>` + label(182, 318, "Provider manages", "start"),
    "Shared responsibility by cloud model");


  D.signin = svg(300,
    box(20, 20, 150, 56, "User + browser\nopens the app", "soft") + arrow(170, 48, 238, 48, "1 not signed in") +
    box(240, 20, 160, 56, "App (SP / client)\nSalesforce, Jira...") + arrow(320, 76, 320, 116, "2 redirect to IdP") +
    box(220, 118, 200, 64, "Identity provider\nEntra ID: password + MFA\n+ Conditional Access", "hi") +
    arrow(220, 150, 172, 150, "3 sign in") + box(20, 122, 150, 56, "User proves\nwho they are", "soft") +
    arrow(420, 150, 470, 150) + box(472, 118, 150, 64, "4 token\nSAML assertion or\nOIDC ID token", "ok") +
    arrow(546, 182, 546, 230) + arrow(546, 250, 402, 250) +
    box(240, 228, 160, 50, "5 app trusts the token\nuser is in, no password", "ok") + label(546, 214, "back via browser", "start"),
    "Single sign-on: the app never sees the password");

  D.jml = svg(250,
    box(20, 30, 180, 70, "Joiner\nHR record created\naccount + groups + licence", "hi") + arrow(200, 65, 228, 65) +
    box(230, 30, 180, 70, "Mover\nnew role: add new access\nREMOVE the old access") + arrow(410, 65, 438, 65) +
    box(440, 30, 180, 70, "Leaver\nblock sign-in, revoke\nsessions, collect device", "warn") +
    arrow(320, 100, 320, 150) + box(170, 152, 300, 56, "Access reviews every quarter\nmanagers confirm who still needs what", "ok") +
    label(320, 232, "HR is the source of truth; IAM follows HR, not emails"),
    "Identity lifecycle: joiner, mover, leaver");

  D.mdm = svg(260,
    box(10, 30, 140, 64, "1 Enrol\nAutopilot, ADE,\nAndroid Enterprise", "hi") + arrow(150, 62, 168, 62) +
    box(170, 30, 140, 64, "2 Configure\nprofiles, apps,\nupdates") + arrow(310, 62, 328, 62) +
    box(330, 30, 140, 64, "3 Check\ncompliance policy\nencrypted? patched?") + arrow(470, 62, 488, 62) +
    box(490, 30, 140, 64, "4 Gate access\nConditional Access:\ncompliant only", "ok") +
    arrow(400, 94, 400, 150, "not compliant") + box(300, 152, 200, 56, "Block mail and Teams\nuser fixes it in Company Portal", "warn") +
    arrow(80, 94, 80, 150) + box(10, 152, 210, 56, "End of life: retire or wipe\nremove company data", "soft"),
    "Device management chain");

  D.ticket = svg(260,
    box(10, 30, 110, 50, "New\nlogged", "soft") + arrow(120, 55, 138, 55) +
    box(140, 30, 110, 50, "Assigned\nto a group") + arrow(250, 55, 268, 55) +
    box(270, 30, 110, 50, "In progress\nagent works", "hi") + arrow(380, 55, 398, 55) +
    box(400, 30, 110, 50, "Resolved\nuser confirms", "ok") + arrow(510, 55, 528, 55) +
    box(530, 30, 100, 50, "Closed\nauto after\n3-5 days", "soft") +
    arrow(325, 80, 325, 140) + box(250, 142, 150, 50, "Pending\nwaiting for user,\nSLA clock paused", "warn") +
    arrow(300, 142, 300, 82) + `<path d="M 455 80 C 455 130, 420 130, 400 110" class="d-a dash" marker-end="url(#ah)"/>` + label(470, 120, "reopened: not fixed", "start") +
    label(320, 230, "Every status change and every note is written in the ticket"),
    "Ticket lifecycle");
  window.DIAGRAMS = D;
})();
