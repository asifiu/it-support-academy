/* Software guides. Every guide has 3 parts:
   1 Big picture (what it is, why, where you meet it, its parts), 2 Go deeper, 3 Practice (lab + "done when").
   Blocks as in lessons.js, plus: ["part", "1", "title"], ["one", "one-sentence definition"],
   ["parts", [[name, what it does], ...]], ["done", [check, ...]]. */
window.GUIDES = [
{ id: "m365", title: "Microsoft 365", short: "The cloud office package most German companies use: email, Teams, files, Office apps, identity and device management.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Microsoft 365 is a monthly subscription that gives a company email, chat and meetings, file storage, the Office apps, and the tools to manage users and devices, all run by Microsoft in the cloud."],
  ["eg", "Think of a serviced office building: the company rents it, Microsoft runs the electricity, security and cleaning (servers, updates, backups of the platform), and the company's IT decides who gets a key and which rooms they may enter."],
  ["h", "Why companies use it"],
  ["steps", ["No own mail server or file server to maintain", "Works from anywhere (home office, phone)", "One login for everything, with MFA", "Pay per user per month; scale up and down"]],
  ["h", "The parts and what each one does"],
  ["parts", [
    ["Entra ID", "The identity: user accounts, groups, passwords, MFA, who may sign in where. Everything else depends on it."],
    ["Exchange Online", "Email, calendars, contacts, shared mailboxes."],
    ["Teams", "Chat, meetings, calls. Each team stores its files in SharePoint."],
    ["SharePoint Online", "Team sites and document libraries (the new 'file server')."],
    ["OneDrive", "Each user's personal file storage, synced to the PC."],
    ["Office apps", "Word, Excel, PowerPoint, Outlook, desktop and web."],
    ["Intune", "Manages laptops and phones: settings, apps, updates, security, wipe."],
    ["Defender", "Security: anti-malware, email protection, device protection."],
    ["Purview", "Compliance: retention, data loss prevention, eDiscovery."]
  ]],
  ["svg", "m365", "Microsoft 365 at a glance: Entra ID in the middle, everything else trusts it"],
  ["h", "How it fits together"],
  ["p", "A user signs in once (Entra ID). Outlook talks to Exchange, Teams talks to Teams and SharePoint, files sync with OneDrive. Intune makes sure the laptop is safe before Entra lets it in (Conditional Access). In many companies the users still come from on-prem Active Directory and are synced to Entra ID (hybrid)."],
  ["h", "Where you meet it on the job"],
  ["steps", ["Creating users and giving licences (onboarding)", "Outlook, Teams, OneDrive tickets (half of all 1st level tickets)", "Shared mailboxes, distribution lists, Teams membership", "MFA resets, sign-in problems", "Enrolling laptops in Intune"]],
  ["h", "Licences in plain words"],
  ["parts", [
    ["Business Basic", "Web and mobile Office only, email, Teams, OneDrive. Max 300 users."],
    ["Business Standard", "Basic + desktop Office apps."],
    ["Business Premium", "Standard + Intune, Entra ID P1 (Conditional Access), Defender for Business. Common in German SMEs."],
    ["E3 / E5", "Enterprise plans (no 300-user limit); E5 adds advanced security, compliance and phone system."]
  ]],
  ["h", "Where you click: the admin centres"],
  ["parts", [
    ["admin.microsoft.com", "Microsoft 365 admin center: users, licences, groups, service health, billing"],
    ["entra.microsoft.com", "Entra admin center: identity, MFA, Conditional Access, sign-in logs"],
    ["admin.exchange.microsoft.com", "Exchange admin center: mailboxes, mail flow, message trace"],
    ["admin.teams.microsoft.com", "Teams admin center: policies, call quality, meeting rooms"],
    ["intune.microsoft.com", "Intune admin center: devices, apps, compliance"],
    ["security.microsoft.com", "Defender portal: quarantine, incidents, device security"]
  ]],
  ["part", "2", "Go deeper"],
  ["h", "Tenant"],
  ["p", "A tenant is the company's own private instance of Microsoft 365, with a name like company.onmicrosoft.com. The company adds its real domain (company.de) by proving ownership with a DNS TXT record, then points the MX record to Exchange Online."],
  ["h", "Users, licences, groups"],
  ["p", "A user without a licence can sign in but has no mailbox or apps. Licences are best assigned through groups (group-based licensing), so onboarding is just 'add to group'. Group types: security groups (permissions), Microsoft 365 groups (shared mailbox + calendar + SharePoint site + optional Team), distribution lists (email only)."],
  ["h", "Admin roles: least privilege"],
  ["p", "Global Administrator can do everything and should be used by very few people. A service desk agent usually gets Helpdesk Administrator (reset passwords for non-admins), User Administrator, or Exchange Recipient Administrator. Interviewers like this question."],
  ["h", "Service health and message center"],
  ["p", "If many users report Teams or Outlook problems at once, first check Health > Service health in the admin center: Microsoft publishes outages there. The Message center announces upcoming changes."],
  ["tip", "Learn the deep dives 'How email and Outlook work' and 'How Microsoft 365 sign-in works' in the Office handbook next."],
  ["part", "3", "Practice"],
  ["warn", "A real tenant is the best lab, but Microsoft changes its free offers often. The Microsoft 365 Developer Program sandbox is now mainly for Visual Studio subscribers, and Business trials usually ask for a payment card. Only start a trial if you can cancel it in time, and set a calendar reminder."],
  ["h", "Option A: with a trial tenant"],
  ["steps", [
    "Start a Microsoft 365 Business Premium trial with a new address like yourname-lab@outlook.com (not a work address)",
    "Create 5 users (Anna Finance, Ben Sales...), a security group 'Finance-Staff', assign licences via the group",
    "Turn on MFA for one user and sign in as them on your phone",
    "Create a shared mailbox 'support@' and give Anna Full Access + Send As",
    "Create a Team 'Finance', upload a file, then find that file in SharePoint",
    "Give one user the Helpdesk Administrator role and test what they can and cannot do"
  ]],
  ["h", "Option B: no tenant (free)"],
  ["steps", [
    "Microsoft Learn: 'Microsoft 365 Fundamentals (MS-900)' learning path, all modules (free, with exercises)",
    "Watch the admin center walkthrough videos on Microsoft Learn / Microsoft Mechanics on YouTube",
    "Do the Office handbook runbooks for Outlook, Teams, OneDrive and write a KB article for each in your homelab repo"
  ]],
  ["done", [
    "I can name the 9 parts of Microsoft 365 and what each does",
    "I can explain Business Basic vs Standard vs Premium",
    "I know which admin centre to open for: a password reset, a missing email, a non-compliant laptop",
    "I created a user, gave a licence and a shared mailbox (Option A) or wrote 3 KB articles (Option B)"
  ]]
]},
{ id: "ad", title: "Active Directory", short: "The on-premises phone book and gatekeeper of a Windows company network: users, computers, groups, policies.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Active Directory Domain Services (AD DS) is a database on Windows servers (domain controllers) that stores every user, computer and group of a company and checks who is allowed to sign in and access what."],
  ["eg", "AD is the company's reception desk plus key cabinet: it knows every employee (users), every room (computers, file shares), which team each person is in (groups), and hands out keys (Kerberos tickets)."],
  ["h", "Why companies use it"],
  ["steps", ["One account per person for every PC in the company", "Central control: password rules, settings and drives pushed to all PCs (Group Policy)", "Access to folders and printers managed through groups", "Disable one account and the person is locked out everywhere"]],
  ["h", "The parts"],
  ["parts", [
    ["Domain", "The company's AD space, named like a DNS name: corp.company.de"],
    ["Domain controller (DC)", "A Windows Server that holds a copy of the AD database and answers logons. Companies have at least 2."],
    ["Users", "Accounts for people (and service accounts for programs)"],
    ["Computers", "Every domain-joined PC and server also has an account"],
    ["Groups", "Collections of users/computers used to give permissions"],
    ["OUs", "Organisational units: folders to organise objects and link policies"],
    ["Group Policy (GPO)", "Settings pushed to users and computers in an OU"],
    ["DNS", "AD cannot work without it: clients find DCs through DNS"]
  ]],
  ["svg", "ad", "How a domain is organised"],
  ["h", "Where you meet it on the job"],
  ["steps", ["Password resets and unlocking (daily)", "Adding users to groups for folder access", "Creating and disabling accounts (on/offboarding)", "Joining PCs to the domain", "Checking why a policy or drive map did not apply"]],
  ["h", "Tools you use"],
  ["parts", [
    ["dsa.msc", "Active Directory Users and Computers (ADUC): the classic tool"],
    ["dsac.exe", "Active Directory Administrative Center: newer, has the AD Recycle Bin"],
    ["gpmc.msc", "Group Policy Management"],
    ["PowerShell", "ActiveDirectory module: Get-ADUser, New-ADUser, Unlock-ADAccount..."],
    ["RSAT", "Remote Server Administration Tools: install these tools on your Windows 11 PC"]
  ]],
  ["part", "2", "Go deeper"],
  ["h", "Forest, domain, trust"],
  ["p", "A forest is the outer boundary (one company, usually one forest). It can contain several domains. Most companies have one forest with one domain. Trusts connect forests, for example after a company merger."],
  ["h", "Replication and sites"],
  ["p", "Every DC holds a full copy and changes replicate between DCs within seconds to minutes (longer between sites). A password changed on DC1 reaches DC2 shortly after. 'Sites' tell PCs to use the DC in their own building."],
  ["h", "FSMO roles (interview favourite)"],
  ["p", "Five special jobs held by one DC each: Schema Master and Domain Naming Master (forest-wide), RID Master, PDC Emulator and Infrastructure Master (domain-wide). The PDC Emulator is the time source and the place where account lockouts are processed first."],
  ["h", "Distinguished names and LDAP"],
  ["p", "Every object has a path like CN=Anna Schmidt,OU=Users,OU=Berlin,DC=corp,DC=company,DC=de. Programs read AD through LDAP (port 389, LDAPS 636)."],
  ["h", "Hybrid with Entra ID"],
  ["p", "Entra Connect copies users and groups from AD to Entra ID. In hybrid companies AD stays the 'source of truth': you change names and groups in AD, not in the cloud."],
  ["tip", "Read the deep dives 'What happens when someone logs on', 'How Group Policy really applies' and 'How permissions decide who may open a file'."],
  ["part", "3", "Practice"],
  ["p", "This one you can do completely free in your Hyper-V lab (Week 3)."],
  ["steps", [
    "Build DC01 (Windows Server 2022 evaluation) and promote it to a new forest lab.example.com",
    "OUs: Berlin > Users, Computers, Groups",
    "Create 5 users and 2 groups in ADUC, then 5 more with PowerShell",
    "Join CLIENT01 to the domain, log on as a domain user",
    "Lock a user on purpose, find and unlock with PowerShell",
    "Create a share, give one group access, prove another user cannot open it",
    "Create a GPO that maps the share as S: and check it with gpresult"
  ]],
  ["cmd", "Get-ADUser -Filter * -SearchBase \"OU=Users,OU=Berlin,DC=lab,DC=example,DC=com\" | Select Name, Enabled", "Lists all users in that OU"],
  ["done", [
    "I can explain domain, DC, OU, group, GPO in one sentence each",
    "My lab has a working domain and a domain-joined client",
    "I can reset, unlock, disable a user in ADUC and PowerShell",
    "Group-based folder access and a drive-map GPO work in my lab"
  ]]
]},
{ id: "winserver", title: "Windows Server", short: "The Windows version for servers; it does jobs (roles) like AD, DNS, DHCP, file and print for the whole company.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Windows Server is the server edition of Windows. On its own it does little; you add roles (jobs) to it, and then it serves many users at once."],
  ["eg", "Windows 11 is a private car. Windows Server is a bus: same engine, built to carry many people, and you choose the route (role) it drives."],
  ["h", "The roles you will see most"],
  ["parts", [
    ["AD DS", "Domain controller (see the Active Directory guide)"],
    ["DNS Server", "Name resolution for the company"],
    ["DHCP Server", "Gives IP addresses to clients"],
    ["File and Storage Services", "File shares, quotas, DFS"],
    ["Print Server", "Central printer queues and drivers"],
    ["Hyper-V", "Runs virtual machines"],
    ["Remote Desktop Services", "Terminal servers: many users work on one server"],
    ["IIS", "Web server for internal websites and apps"],
    ["WSUS", "Central Windows Update server (being replaced by cloud options)"]
  ]],
  ["h", "Versions and editions"],
  ["p", "Common versions in companies: 2016, 2019, 2022, 2025. Editions: Standard (most servers) and Datacenter (unlimited Windows VMs on a host). Installation types: 'Desktop Experience' (with GUI) or 'Server Core' (no GUI, managed remotely, smaller attack surface)."],
  ["h", "How you manage it"],
  ["parts", [
    ["Server Manager", "Add roles and features, see status"],
    ["Windows Admin Center", "Free web-based tool for many servers"],
    ["RSAT on Windows 11", "Manage from your own PC (best practice: do not work on the server's desktop)"],
    ["PowerShell remoting", "Enter-PSSession / Invoke-Command for many servers at once"],
    ["RDP", "Remote desktop to the server when needed"]
  ]],
  ["part", "2", "Go deeper"],
  ["h", "Health basics an admin checks"],
  ["steps", ["Free disk space (C: and data disks)", "Services that should run are running", "Event Viewer: errors in System and Application", "Last successful backup", "Pending updates and last reboot"]],
  ["h", "Licensing in one paragraph"],
  ["p", "Windows Server is licensed per CPU core (minimum 16 cores per server) plus Client Access Licences (CALs) for users or devices that connect. RDS needs extra RDS CALs. You do not need to master this, but know CALs exist."],
  ["h", "Patching"],
  ["p", "Servers are patched monthly in a maintenance window, usually test servers first. Domain controllers one at a time, never all at once."],
  ["part", "3", "Practice"],
  ["steps", [
    "Download the Windows Server 2022 evaluation ISO (180 days) and install it in Hyper-V with Desktop Experience",
    "Rename it, set a static IP, install all updates",
    "Install the roles DNS and DHCP (Week 3), File Server, Print Server",
    "Install Windows Admin Center on your host or CLIENT01 and add the server",
    "Optional: install a second VM as Server Core and manage it only remotely"
  ]],
  ["cmd", "Get-WindowsFeature | Where Installed", "Lists installed roles and features"],
  ["cmd", "Install-WindowsFeature DHCP -IncludeManagementTools", "Installs a role from PowerShell"],
  ["done", [
    "I can list 6 server roles and what they do",
    "I installed a server, set a static IP and added roles",
    "I can check disk, services, events and uptime of a server with PowerShell"
  ]]
]},
{ id: "entra", title: "Microsoft Entra ID", short: "The cloud identity behind Microsoft 365: accounts, MFA, Conditional Access, single sign-on.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Entra ID (formerly Azure Active Directory) is Microsoft's cloud directory: it holds the accounts used to sign in to Microsoft 365 and thousands of other cloud apps, and decides if a sign-in is allowed."],
  ["eg", "If Active Directory is the reception desk inside the office building, Entra ID is the passport control for the whole internet: it checks passport (password), fingerprint (MFA) and travel rules (Conditional Access)."],
  ["h", "AD vs Entra ID"],
  ["parts", [
    ["Active Directory", "On-prem servers, Kerberos/LDAP, Group Policy, OUs, domain-joined PCs in the office network"],
    ["Entra ID", "Cloud service, web protocols (OAuth, SAML, OpenID), Conditional Access, no OUs, devices joined over the internet"]
  ]],
  ["h", "The parts"],
  ["parts", [
    ["Users", "Cloud-only or synced from AD"],
    ["Groups", "Security and Microsoft 365 groups; 'dynamic' groups fill themselves by rules (needs P1)"],
    ["MFA / Authentication methods", "Authenticator app, phone, FIDO2 keys, passkeys"],
    ["Conditional Access", "If-then rules for sign-ins (needs P1)"],
    ["Enterprise applications", "Single sign-on to other apps (Salesforce, Zoom...)"],
    ["Devices", "Registered, Entra joined, or hybrid joined computers and phones"],
    ["Roles", "Admin rights like Helpdesk Administrator"],
    ["Sign-in logs", "Every sign-in with result and reason"]
  ]],
  ["h", "Where you meet it on the job"],
  ["steps", ["MFA resets and new phones", "'I cannot sign in' tickets (read the sign-in logs)", "Blocking a user after phishing; revoking sessions", "Checking if a laptop is joined and compliant"]],
  ["part", "2", "Go deeper"],
  ["h", "Licences"],
  ["p", "Entra ID Free comes with every Microsoft 365 tenant. P1 (in Business Premium, E3) adds Conditional Access and dynamic groups. P2 (in E5) adds risk-based policies and Privileged Identity Management."],
  ["svg", "intune", "Device status from Intune decides access in Entra"],
  ["h", "Conditional Access example"],
  ["p", "Policy: IF user is in 'All users' AND app is 'Office 365' AND device is NOT compliant THEN block. Result: only Intune-managed laptops can open company email. Admins test new policies in 'report-only' mode first."],
  ["h", "Hybrid identity"],
  ["p", "Entra Connect Sync (or the lighter Cloud Sync) copies AD users to Entra ID. Sign-in then works with password hash sync (most common), pass-through authentication, or federation (ADFS, being retired by many)."],
  ["tip", "Read the Office handbook deep dive 'How Microsoft 365 sign-in, MFA and Conditional Access work' and the runbook 'New phone, MFA does not work'."],
  ["part", "3", "Practice"],
  ["steps", [
    "With a tenant: Entra admin center > Users: create a user, require MFA, sign in, then read your own sign-in log",
    "Create a Conditional Access policy in report-only mode (block sign-ins from outside Germany) and look at the report",
    "Create a dynamic group 'Dept-Finance' with rule user.department -eq \"Finance\" (P1 needed)",
    "Without a tenant: Microsoft Learn 'SC-900' identity modules, then explain AD vs Entra ID out loud in 2 minutes"
  ]],
  ["done", [
    "I can explain AD vs Entra ID with 3 differences",
    "I can find a sign-in error code and say what it means",
    "I can describe one Conditional Access policy in if-then form"
  ]]
]},
{ id: "intune", title: "Microsoft Intune", short: "Manages company laptops and phones over the internet: setup, settings, apps, updates, security, wipe.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Intune is Microsoft's cloud tool for managing devices (MDM) and apps (MAM): it sets up new laptops automatically, pushes settings and software, keeps them updated, checks they are safe, and can wipe them when lost."],
  ["eg", "Group Policy is a remote control that only works inside the office. Intune is the same remote control working anywhere the laptop has internet."],
  ["h", "The parts"],
  ["parts", [
    ["Enrollment", "How a device joins Intune: Autopilot, user sign-in, Company Portal app (phones/BYOD)"],
    ["Windows Autopilot", "New laptop from the shop: user signs in, everything installs by itself"],
    ["Configuration profiles", "Settings: Wi-Fi, VPN, BitLocker, restrictions"],
    ["Compliance policies", "Rules a device must meet (encrypted, updated, PIN) to be 'compliant'"],
    ["Apps", "Install Office, Teams, 7-Zip, line-of-business apps"],
    ["Update rings", "When and how Windows updates install"],
    ["Endpoint security", "Antivirus, firewall, disk encryption policies"],
    ["Company Portal", "App where users install approved software themselves"]
  ]],
  ["svg", "intune", "Why a non-compliant laptop cannot open email"],
  ["h", "Where you meet it on the job"],
  ["steps", ["New laptops for new employees (Autopilot)", "'My laptop is not compliant, I cannot open email'", "Software requests deployed to a group", "Lost device: remote lock or wipe", "Checking a device's status and last check-in"]],
  ["part", "2", "Go deeper"],
  ["h", "MDM vs MAM"],
  ["p", "MDM manages the whole device (company laptops). MAM protects only company data inside apps (e.g. Outlook on a private phone): copy-paste to private apps can be blocked and company data wiped without touching private photos."],
  ["h", "Wipe vs Retire"],
  ["p", "Wipe = factory reset (company devices). Retire = remove company data and management only (private devices)."],
  ["h", "Compliance + Conditional Access"],
  ["p", "Intune marks a device compliant or not; Entra Conditional Access uses that result to allow or block access. This pair is the core of modern 'zero trust' setups."],
  ["h", "Troubleshooting basics"],
  ["steps", ["Intune admin center > Devices > the device: last check-in, compliance details, app install status", "On the PC: Settings > Accounts > Access work or school > Info > Sync", "Event Viewer: Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider"]],
  ["part", "3", "Practice"],
  ["steps", [
    "With a Business Premium trial: enrol CLIENT02 (Settings > Accounts > Access work or school > Connect > Join this device to Microsoft Entra ID)",
    "Create a compliance policy (BitLocker + minimum OS) for a test group and watch the device status change",
    "Deploy 7-Zip or the Company Portal app and confirm installation",
    "Without tenant: Microsoft Learn MD-102 modules 'Enroll devices' and 'Manage compliance'; write a one-page Autopilot explanation in your repo"
  ]],
  ["done", [
    "I can explain MDM vs MAM and wipe vs retire",
    "I know where to look when a device is not compliant",
    "I can describe the Autopilot flow from box to desk"
  ]]
]},
{ id: "exchange", title: "Exchange Online and Outlook", short: "Microsoft's email server in the cloud, and Outlook, the app people use to read it.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Exchange Online stores and delivers the company's email, calendars and contacts; Outlook (desktop, web, phone) is the window users look through."],
  ["eg", "Exchange is the post office with everyone's mailbox; Outlook is the key and the window to look into your own box."],
  ["h", "The parts"],
  ["parts", [
    ["User mailbox", "One per licensed person"],
    ["Shared mailbox", "info@, support@: no licence needed (up to 50 GB), many people work in it"],
    ["Room / equipment mailbox", "Book meeting rooms and beamers"],
    ["Distribution list", "One address, mail goes to many people"],
    ["Microsoft 365 group", "Shared inbox + calendar + files for a team"],
    ["Mail flow rules", "Rules for all mail: disclaimers, block, redirect"],
    ["Exchange Online Protection", "Spam and malware filter, quarantine"],
    ["Message trace", "Track any message: delivered, junk, quarantined, failed"]
  ]],
  ["h", "Where you meet it on the job"],
  ["steps", ["'I did not get the email'", "Shared mailbox access and Send As", "Out-of-office for someone who is sick", "Mailbox full, archive", "Outlook profile problems"]],
  ["part", "2", "Go deeper"],
  ["svg", "mail", "The path of every incoming email"],
  ["p", "Read the Office handbook deep dive 'How email and Outlook work' (MX, SPF, DKIM, DMARC, Autodiscover, OST, automapping)."],
  ["h", "PowerShell for Exchange"],
  ["cmd", "Install-Module ExchangeOnlineManagement; Connect-ExchangeOnline", "Connect to your tenant from PowerShell"],
  ["cmd", "Get-Mailbox -ResultSize Unlimited | Select DisplayName, RecipientTypeDetails", "All mailboxes and their type"],
  ["cmd", "Set-MailboxAutoReplyConfiguration anna -AutoReplyState Enabled -InternalMessage \"Out of office\"", "Out-of-office for a user (with manager approval)"],
  ["part", "3", "Practice"],
  ["steps", [
    "With a tenant: create a shared mailbox, give access, watch automapping appear in Outlook",
    "Send a mail from a private account and find it in message trace",
    "Create a transport rule that adds a disclaimer to outgoing mail",
    "Without tenant: create a new Outlook profile on your own PC with your private Outlook.com account; find the OST file in %localappdata%\\Microsoft\\Outlook"
  ]],
  ["done", [
    "I can name 5 recipient types",
    "I can explain why a new profile fixes many Outlook problems",
    "I know how to prove where an email went (message trace)"
  ]]
]},
{ id: "teams", title: "Teams, SharePoint and OneDrive", short: "Where people chat, meet and keep their files in Microsoft 365, and how the three connect.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Teams is for talking (chat, meetings, calls), SharePoint is for team files and intranet sites, OneDrive is for each person's own files. Under the hood Teams stores its files in SharePoint and OneDrive."],
  ["eg", "OneDrive is your desk drawer, SharePoint is the shared team cupboard, Teams is the meeting room with a door into that cupboard."],
  ["svg", "files", "Where files really live"],
  ["h", "Where files really live"],
  ["parts", [
    ["Files in a channel", "In the team's SharePoint site, folder named after the channel"],
    ["Files sent in a 1:1 or group chat", "In the sender's OneDrive, shared with the chat members"],
    ["My own documents", "OneDrive (with Known Folder Move, Desktop/Documents/Pictures sync there)"]
  ]],
  ["h", "Where you meet it on the job"],
  ["steps", ["Meeting audio/camera problems", "OneDrive sync errors", "'I cannot find the file from Teams'", "Guest access for external partners", "Who may see which SharePoint site"]],
  ["part", "2", "Go deeper"],
  ["h", "A team is a Microsoft 365 group"],
  ["p", "Creating a team creates a Microsoft 365 group, a SharePoint site and a shared mailbox/calendar. Owners manage members. Private and shared channels get their own separate SharePoint sites."],
  ["h", "SharePoint permissions"],
  ["p", "Each site has Owners, Members, Visitors groups. Sharing links: 'People in your organisation', 'Specific people', 'Anyone' (often disabled by admins). Avoid breaking inheritance on single folders: it becomes unmanageable."],
  ["h", "OneDrive Files On-Demand"],
  ["p", "Files show in Explorer but download only when opened (cloud icon = online only, green tick = on this PC). Frees disk space."],
  ["part", "3", "Practice"],
  ["steps", [
    "With a tenant: create a team, a standard channel and a private channel; upload files; open each in SharePoint and see the different sites",
    "Share a file with one person only, then check 'Manage access'",
    "Without tenant: use your private OneDrive: turn on Files On-Demand, mark a folder 'Always keep on this device', run onedrive.exe /reset and watch it resync"
  ]],
  ["done", [
    "I can say where a channel file and a chat file are stored",
    "I can explain Owners/Members/Visitors",
    "I can fix a basic OneDrive sync problem"
  ]]
]},
{ id: "hyperv", title: "Hyper-V and virtualisation", short: "Run many computers inside one: how your home lab and most company servers work.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Virtualisation lets one physical computer run many virtual machines (VMs), each with its own operating system; Hyper-V is Microsoft's hypervisor, built into Windows 11 Pro and Windows Server."],
  ["eg", "A building (the physical server) divided into flats (VMs). Each flat has its own door and furniture, but they share the building's water and power (CPU, RAM, disk)."],
  ["svg", "hyperv", "Host, hypervisor, VMs and virtual switches"],
  ["h", "Why companies use it"],
  ["steps", ["Fewer physical servers: less power, space, cost", "New server in minutes from a template", "Snapshots before risky changes", "Move VMs between hosts without downtime (live migration)"]],
  ["h", "The parts"],
  ["parts", [
    ["Host", "The physical machine running the hypervisor"],
    ["Guest / VM", "The virtual computer"],
    ["Virtual switch", "Network for VMs: external, internal, private"],
    ["Virtual disk (VHDX)", "A file that acts as the VM's hard disk"],
    ["Checkpoint", "Saved state you can go back to"],
    ["Hyper-V Manager", "The management tool"]
  ]],
  ["h", "Other products you will hear about"],
  ["parts", [["VMware vSphere / ESXi", "Market leader in big companies (licensing changed after Broadcom bought it, so many are moving)"], ["Proxmox VE", "Free/open-source, popular in German SMEs and labs"], ["Azure / AWS", "Rent VMs in the cloud"]]],
  ["part", "2", "Go deeper"],
  ["p", "Read the Week 1, Day 2 'Teach me' lesson: it covers enabling Hyper-V, switch types, Generation 2, TPM and checkpoints step by step."],
  ["h", "Resources"],
  ["p", "vCPU = a share of real CPU time; you can give more vCPUs than real cores (overcommit) but not wisely. RAM is the usual limit: the sum of running VMs' RAM must fit in the host. Dynamic Memory lets Hyper-V move RAM between VMs."],
  ["part", "3", "Practice"],
  ["steps", ["Enable Hyper-V", "Create internal switch LabNet", "Create CLIENT01 (Windows 11 eval, Gen 2, TPM, 4 GB)", "Checkpoint, break something on purpose (delete a desktop file), revert", "Export the VM and import it as a copy"]],
  ["cmd", "Get-VM | Select Name, State, MemoryAssigned, Uptime", "Status of all VMs on the host"],
  ["done", ["Hyper-V Manager opens and shows my VMs", "CLIENT01 runs Windows 11 on LabNet", "I reverted a checkpoint successfully", "I can explain why a checkpoint is not a backup"]]
]},
{ id: "powershell", title: "PowerShell", short: "The admin's command line and scripting language for Windows and Microsoft 365.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "PowerShell is a command line and scripting language from Microsoft that lets you manage Windows, Active Directory, Microsoft 365 and more by typing commands instead of clicking, and repeat them for 1 or 1,000 objects."],
  ["eg", "Clicking is ordering food one dish at a time. PowerShell is giving the kitchen one written order for the whole table."],
  ["h", "Why it matters for your career"],
  ["steps", ["Some tasks are only possible in PowerShell", "Bulk work: 50 new users from a CSV in seconds", "Reports: who has not logged on for 90 days", "It is the step from support to system administrator"]],
  ["h", "The parts"],
  ["parts", [
    ["Cmdlet", "A command named Verb-Noun: Get-Service, Restart-Computer"],
    ["Pipeline |", "Passes objects from one command to the next"],
    ["Module", "A package of cmdlets: ActiveDirectory, ExchangeOnlineManagement, Microsoft.Graph"],
    ["Script (.ps1)", "Saved commands you can run again"],
    ["Windows PowerShell 5.1", "Built into Windows"],
    ["PowerShell 7", "New cross-platform version, install separately"],
    ["VS Code", "The editor to write scripts (the old ISE is no longer developed)"]
  ]],
  ["part", "2", "Go deeper"],
  ["h", "Three commands that teach you everything else"],
  ["cmd", "Get-Command *service*", "Find commands by name"],
  ["cmd", "Get-Help Restart-Service -Examples", "Examples for a command (run Update-Help once as admin)"],
  ["cmd", "Get-Service | Get-Member", "What properties and methods the objects have"],
  ["h", "Objects, not text"],
  ["p", "Get-Service returns service objects with properties (Name, Status, StartType). So you can filter and sort without cutting text: Get-Service | Where-Object Status -eq Stopped | Sort-Object Name."],
  ["h", "Safety"],
  ["steps", ["-WhatIf shows what would happen", "-Confirm asks before each change", "Test on one object before 1,000", "Never put passwords in scripts", "Execution policy is not a security boundary, but signed scripts are good practice"]],
  ["part", "3", "Practice"],
  ["steps", [
    "Open Windows Terminal > PowerShell. Run Get-Command, Get-Help, Get-Member on 3 commands",
    "One-liner: the 5 processes using most memory",
    "Script: PC report (name, OS, uptime, free disk) saved as report.ps1 in your homelab repo",
    "Week 5: bulk-create AD users from CSV"
  ]],
  ["cmd", "Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5 Name, @{n='MB';e={[int]($_.WorkingSet/1MB)}}", "Top 5 memory users in MB"],
  ["done", ["I can find a command and its examples without Google", "I can filter, sort and select objects", "I wrote and ran my first .ps1 script"]]
]},
{ id: "itsm", title: "Ticket systems (ITSM tools)", short: "The software where every IT request and incident lives: Jira Service Management, ServiceNow, and others.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "An ITSM (IT service management) tool records every request and problem as a ticket, sends it to the right team, tracks deadlines (SLAs), and stores solutions in a knowledge base."],
  ["eg", "A hospital's patient file system plus waiting-room display: who is next, how urgent, which doctor, and what was done."],
  ["h", "Tools you see in German job ads"],
  ["parts", [
    ["ServiceNow", "Big enterprises; very powerful, expensive"],
    ["Jira Service Management", "Very common; free plan for small teams, good for learning"],
    ["Freshservice, Zendesk", "SMEs, easy to use"],
    ["OTRS / Znuny, Zammad", "Popular in Germany, open source options"],
    ["GLPI", "Open source, ticketing + asset inventory"],
    ["TOPdesk, Matrix42, HelpLine", "Common in German public sector and Mittelstand"]
  ]],
  ["h", "The parts (same in every tool)"],
  ["parts", [
    ["Ticket", "One request or incident with number, status, history"],
    ["Queue", "List of tickets for a team"],
    ["Request types / categories", "Password reset, new laptop, incident..."],
    ["Portal", "Where users open tickets themselves"],
    ["SLA", "Deadlines for first response and resolution"],
    ["Knowledge base", "Articles for agents and users"],
    ["Automation", "Auto-assign, reminders, auto-close"],
    ["CMDB / assets", "Inventory of devices and services linked to tickets"]
  ]],
  ["part", "2", "Go deeper"],
  ["svg", "ticket", "The life of a ticket"],
  ["h", "Ticket lifecycle"],
  ["p", "New > Assigned > In progress > Waiting for customer / Waiting for third party (SLA clock paused) > Resolved > Closed (auto after a few days if the user does not reopen)."],
  ["h", "Priority and SLA"],
  ["p", "Priority = impact x urgency (you will code this in js/priority.js). Each priority has SLA targets, e.g. P1: respond 15 min, resolve 4 h. Breached SLAs show up in reports and in your team lead's mood."],
  ["h", "Work notes vs replies"],
  ["p", "Internal notes are for IT only (technical detail, what you tried). Public replies go to the user: friendly, no jargon, clear next step."],
  ["part", "3", "Practice (free)"],
  ["steps", [
    "Create a free Jira Service Management site (atlassian.com, free plan for small teams; check the current limits)",
    "Create a service project 'IT Support' with the IT service management template",
    "Request types: Password reset, New hardware, Software install, Report a problem",
    "SLAs: Time to first response and Time to resolution per priority",
    "Open 20 tickets from the app's Ticket trainer through the portal, work them as agent with notes and replies",
    "Write 5 knowledge base articles from the Office handbook in your own words",
    "Screenshot queue, SLA report and one ticket history for your homelab repo; now 'Jira Service Management (hands-on lab)' may go on your CV"
  ]],
  ["done", [
    "I can explain queue, SLA, request type, KB, CMDB",
    "My JSM project has 20 worked tickets with notes and SLA data",
    "I can show the screenshots in an interview"
  ]]
]},
{ id: "linux", title: "Linux for support staff", short: "The other operating system you will meet: servers, firewalls, appliances, cloud.",
  blocks: [
  ["part", "1", "Big picture"],
  ["one", "Linux is a free, open-source operating system family; in offices it rarely runs on desks but very often on servers, network devices, storage boxes, firewalls and in the cloud."],
  ["eg", "If Windows is the car everyone drives, Linux is the engine inside many machines in the building: you do not see it, but you must know how to open the bonnet."],
  ["h", "Where you meet it"],
  ["steps", ["Web servers, databases, monitoring (Zabbix, Grafana)", "Firewalls and appliances (OPNsense is FreeBSD, but very similar)", "NAS storage (Synology), printers, IP phones", "Cloud VMs and containers (Docker)"]],
  ["h", "The parts"],
  ["parts", [
    ["Kernel", "The core of the system"],
    ["Distribution", "Kernel + tools packaged: Ubuntu, Debian, Red Hat Enterprise Linux (RHEL), SUSE (German!)"],
    ["Shell (bash)", "Where you type commands"],
    ["Package manager", "apt (Debian/Ubuntu), dnf (RHEL): installs software"],
    ["systemd", "Starts and manages services"],
    ["SSH", "Secure remote login (port 22)"]
  ]],
  ["part", "2", "Go deeper"],
  ["h", "Ten commands for your first day"],
  ["cmd", "pwd ; ls -la ; cd /var/log", "Where am I, what is here, go somewhere"],
  ["cmd", "cat file ; less file ; tail -f /var/log/syslog", "Read files; follow a log live"],
  ["cmd", "grep -i error /var/log/syslog", "Find lines with 'error'"],
  ["cmd", "sudo apt update && sudo apt upgrade", "Update all software"],
  ["cmd", "systemctl status nginx", "Is a service running? Why not?"],
  ["cmd", "df -h ; free -h ; top", "Disk, memory, processes"],
  ["h", "Permissions"],
  ["p", "Every file has owner, group, others, each with r (read 4), w (write 2), x (execute 1). chmod 640 = owner rw, group r, others nothing. sudo runs one command as admin (root)."],
  ["part", "3", "Practice"],
  ["steps", ["Install Ubuntu Server LTS as VM LNX01 (Week 5)", "SSH in from Windows Terminal: ssh user@10.10.10.20", "Install nginx, check it with systemctl, open it from CLIENT01", "OverTheWire Bandit levels 0 to 10 (free, in the browser + SSH)"]],
  ["done", ["I can log in with SSH and move around the filesystem", "I can install, start and check a service", "I can read chmod numbers"]]
]}
];

/* Which guide to read first on which day (week-day). */
window.GUIDE_FOR = {
  "1-2": "hyperv", "3-1": "winserver", "3-2": "ad", "4-1": "m365", "4-2": "exchange", "4-3": "teams",
  "4-4": "intune", "4-5": "entra", "5-1": "powershell", "5-3": "linux", "6-4": "hyperv", "7-1": "itsm"
};
