/* System administration courses: Active Directory, Windows deployment and imaging, cloud computing. */
window.COURSES = (window.COURSES || []).concat([
{ id: "ad", title: "Active Directory Domain Services", icon: "server", level: "Intermediate", hours: 9,
  short: "Domains, domain controllers, users, groups, OUs, Group Policy, DNS, replication, FSMO and recovery.",
  cert: "Core skill in almost every sysadmin job ad in Germany",
  modules: [
  { id: "structure", title: "How a domain is built", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Active Directory is the directory of a Windows network: one database of users, computers and groups, held by domain controllers, that decides who can sign in and what they can reach."],
    ["svg", "ad", "Forest, domain, OUs, objects and a linked GPO"],
    ["h", "The building blocks"],
    ["parts", [["Forest", "Outer security boundary; usually one per company"], ["Domain", "corp.contoso.de: shares one database and policies"],
      ["Domain controller (DC)", "Server holding a writable copy of the database; at least two for redundancy"], ["Organisational unit (OU)", "Folder for objects; you link GPOs and delegate rights here"],
      ["Site", "A physical location with its own subnets, so clients use a nearby DC"], ["Global catalog", "Partial copy of every object in the forest, used for searches and logons"]]],
    ["part", "2", "Go deeper"],
    ["h", "Protocols underneath"],
    ["parts", [["DNS", "Clients find DCs through SRV records; AD does not work without it"], ["Kerberos (88)", "Ticket-based logon and access"], ["LDAP (389) / LDAPS (636)", "Reading and searching the directory"], ["SMB (445)", "SYSVOL and NETLOGON shares hold Group Policy and scripts"]]],
    ["h", "FSMO roles"],
    ["parts", [["Schema master", "Forest: changes to the schema"], ["Domain naming master", "Forest: add or remove domains"], ["RID master", "Domain: hands out pools of IDs for new objects"],
      ["PDC emulator", "Domain: time source, password changes and lockouts processed here first"], ["Infrastructure master", "Domain: cross-domain references"]]],
    ["cmd", "netdom query fsmo", "Shows which DC holds each FSMO role"],
    ["part", "3", "Practice"],
    ["steps", ["In your lab, build DC01 and promote a new forest (Week 3 of the quick-start plan has the steps)", "Run netdom query fsmo and Get-ADDomain", "Draw your OU design for a company with Berlin and Hamburg offices"]]
  ], quiz: [
    ["Outer security boundary of Active Directory:", ["OU", "Domain", "Forest", "Site"], 2],
    ["Which role is the time source and handles lockouts first?", ["RID master", "PDC emulator", "Schema master", "Infrastructure master"], 1],
    ["Clients find domain controllers through...", ["DHCP options", "DNS SRV records", "NetBIOS only", "LDAP broadcasts"], 1],
    ["You link Group Policy and delegate rights at the...", ["OU", "Site only", "Forest", "Global catalog"], 0]
  ]},
  { id: "objects", title: "Users, groups and delegation", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Daily AD work is managing users and groups, and letting the service desk do safe tasks without being Domain Admins."],
    ["h", "Group scopes"],
    ["parts", [["Global", "Members from the same domain; use for roles (Finance-Staff)"], ["Domain local", "Use on resources (FS-Finance-Modify)"], ["Universal", "Forest-wide; members and use anywhere"]]],
    ["p", "The AGDLP pattern: Accounts go into Global groups, globals go into Domain Local groups, domain locals get Permissions. Access changes become group changes."],
    ["part", "2", "Go deeper"],
    ["h", "Delegation of control"],
    ["p", "Right-click an OU > Delegate Control lets a group reset passwords or unlock users only in that OU. Service desk staff get exactly that, not Domain Admins."],
    ["h", "PowerShell for daily tasks"],
    ["cmd", "Get-ADUser anna -Properties LastLogonDate, LockedOut, PasswordLastSet", "Quick account check"],
    ["cmd", "Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly", "Users who have not signed in for 90 days"],
    ["cmd", "Get-ADGroupMember 'Finance-Staff' -Recursive | Select Name", "Who is really in a group, including nested groups"],
    ["h", "AD Recycle Bin"],
    ["p", "Once enabled (Active Directory Administrative Center > Enable Recycle Bin), deleted objects can be restored with all attributes and group memberships within the deleted object lifetime (180 days by default)."],
    ["cmd", "Get-ADObject -Filter 'samAccountName -eq \"anna\"' -IncludeDeletedObjects | Restore-ADObject", "Restores a deleted user"],
    ["part", "3", "Practice"],
    ["steps", ["Create Global and Domain Local groups following AGDLP for a Finance share", "Delegate password reset on OU Berlin\\Users to a 'Helpdesk' group and test it", "Enable the Recycle Bin, delete a user and restore it"]]
  ], quiz: [
    ["In AGDLP, permissions are given to...", ["Global groups", "Domain local groups", "Users", "Universal groups"], 1],
    ["Let the service desk reset passwords in one OU:", ["Make them Domain Admins", "Delegate Control on that OU", "Share the admin password", "Use a GPO"], 1],
    ["Restore a deleted user with its groups:", ["AD Recycle Bin", "Recreate it", "DHCP", "System Restore on a PC"], 0]
  ]},
  { id: "gpo", title: "Group Policy in practice", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Group Policy pushes settings to users and computers from the domain: drive maps, printers, security settings, software restrictions."],
    ["svg", "gpo", "Processing order: later wins"],
    ["part", "2", "Go deeper"],
    ["h", "Rules that explain most problems"],
    ["steps", ["Local, Site, Domain, OU: later wins; Enforced beats Block inheritance", "Computer settings apply at startup, user settings at logon, then every 90 to 120 minutes in the background",
      "Security filtering: if you remove Authenticated Users, computers still need Read on the Delegation tab", "User settings linked to a computer OU do nothing unless loopback processing is on"]],
    ["h", "Useful GPOs in a company"],
    ["parts", [["Drive maps (Preferences)", "Map S: for Finance with item-level targeting by group"], ["Printers", "Deploy printers with drivers"], ["Windows LAPS", "Rotate local admin passwords and store them in AD"],
      ["BitLocker", "Turn on encryption, store recovery keys in AD"], ["Security baseline", "Microsoft's recommended settings from the Security Compliance Toolkit"]]],
    ["cmd", "gpresult /h C:\\Temp\\gp.html", "Report of which GPOs applied and which setting won"],
    ["part", "3", "Practice"],
    ["steps", ["Create a drive-map GPO with item-level targeting", "Deploy Windows LAPS and read the password with Get-LapsADPassword", "Break a GPO on purpose (remove Read for computers) and find the cause with gpresult"]]
  ], quiz: [
    ["A GPO linked to a computers OU with only user settings applies when...", ["Always", "Loopback processing is on", "Never", "After a reboot"], 1],
    ["Tool to see which GPO won a setting:", ["gpresult /h", "ipconfig", "nltest", "dcdiag"], 0],
    ["Rotates local admin passwords:", ["Windows LAPS", "WSUS", "DFS", "BitLocker"], 0]
  ]},
  { id: "health", title: "DNS, replication, backup and recovery", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Healthy DNS and replication keep AD working; a tested backup keeps the company alive after a disaster."],
    ["h", "Health checks"],
    ["cmd", "dcdiag /v", "Full domain controller health test"],
    ["cmd", "repadmin /replsummary", "Replication status between all DCs"],
    ["cmd", "repadmin /showrepl", "Detailed inbound replication per partner"],
    ["part", "2", "Go deeper"],
    ["h", "Backing up AD"],
    ["p", "Back up the System State of at least one DC regularly (Windows Server Backup or your backup product). Never restore a DC from an old VM snapshot: it causes USN rollback and broken replication."],
    ["h", "Recovery options"],
    ["parts", [["Recycle Bin", "One deleted object"], ["Authoritative restore", "Restore deleted objects from backup and push them to other DCs"], ["Rebuild a DC", "If one DC is broken, remove it cleanly and promote a new one"], ["Forest recovery", "Last resort; follow Microsoft's forest recovery guide"]]],
    ["h", "Securing AD"],
    ["steps", ["Few Domain Admins, separate admin accounts, no internet browsing with them", "Tiering: domain admin accounts only on DCs, never on workstations", "Protected Users group for admins", "Monitor changes to privileged groups"]],
    ["part", "3", "Practice"],
    ["steps", ["Add DC02 to your lab and check replication with repadmin", "Back up DC01 System State with Windows Server Backup", "Write a one-page 'AD disaster plan' for a small company"]]
  ], quiz: [
    ["Replication summary across DCs:", ["repadmin /replsummary", "gpupdate", "ipconfig /all", "netstat"], 0],
    ["Why not restore a DC from an old snapshot?", ["It is slow", "USN rollback breaks replication", "It deletes DNS", "It needs a licence"], 1],
    ["Domain admin accounts should sign in to...", ["Any PC", "Domain controllers and admin servers only", "Their own laptop", "Kiosk PCs"], 1]
  ]}
  ]},

{ id: "imaging", title: "Windows deployment and imaging", icon: "download", level: "Intermediate", hours: 6,
  short: "WIM images, DISM, Sysprep, WDS/PXE, Configuration Manager OSD, Autopilot and user-state migration.",
  cert: "Part of MD-102; daily work in field and desktop support",
  modules: [
  { id: "images", title: "Images, WIM and DISM", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Deploying Windows means getting a known, standard Windows onto many PCs: by copying an image, by provisioning from the cloud, or by a mix."],
    ["parts", [["Image (WIM)", "A file containing one or more Windows installations; install.wim on the ISO"], ["Boot image", "Small Windows PE used to start a PC and run setup"],
      ["Thin image", "Plain Windows; apps and settings added later (modern way)"], ["Thick image", "Windows plus apps baked in; fast but must be rebuilt often"]]],
    ["warn", "The Microsoft Deployment Toolkit (MDT) is retired (Microsoft Learn, January 2026): no updates or support. Many old tutorials still use it. Learn Autopilot and Configuration Manager OSD instead."],
    ["part", "2", "Go deeper"],
    ["h", "DISM: the image tool"],
    ["cmd", "dism /Get-WimInfo /WimFile:D:\\sources\\install.wim", "Lists the editions inside the image"],
    ["cmd", "dism /Mount-Image /ImageFile:install.wim /Index:6 /MountDir:C:\\Mount", "Mounts an edition so you can add drivers or updates"],
    ["cmd", "dism /Image:C:\\Mount /Add-Driver /Driver:C:\\Drivers /Recurse", "Adds all drivers in a folder"],
    ["cmd", "dism /Unmount-Image /MountDir:C:\\Mount /Commit", "Saves the changes into the WIM"],
    ["h", "Sysprep"],
    ["p", "Before capturing a reference PC as an image, run Sysprep /generalize: it removes the computer's unique identity (SID, name, drivers state) so every copy becomes a new PC at first boot. An unattend.xml answer file can skip the setup questions."],
    ["part", "3", "Practice"],
    ["steps", ["Mount the Windows 11 ISO and list its editions with DISM", "Mount one index, add a driver folder, commit", "Sysprep a VM and boot it to see the first-start (OOBE) screens"]]
  ], quiz: [
    ["MDT status in 2026:", ["Current and recommended", "Retired, no support", "Only for Windows 12", "Part of Intune"], 1],
    ["Remove a PC's unique identity before capturing:", ["Sysprep /generalize", "chkdsk", "gpupdate", "DISM /Online /Cleanup-Image"], 0],
    ["Plain Windows image with apps added later:", ["Thick image", "Thin image", "Boot image", "Differencing disk"], 1]
  ]},
  { id: "deploy", title: "Deployment methods today", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Companies now use one of three paths: cloud provisioning with Autopilot, on-premises task sequences with Configuration Manager, or a simple network boot with WDS."],
    ["parts", [["Windows Autopilot + Intune", "Cloud; new devices ship straight to users; best for modern, remote-friendly companies"],
      ["Configuration Manager OSD", "On-premises task sequences: wipe, image, drivers, apps; bare-metal rebuilds; supported"],
      ["WDS (PXE)", "Windows Server role to boot PCs over the network; basic and limited"],
      ["Third-party", "Tools like SmartDeploy or vendor imaging services"]]],
    ["part", "2", "Go deeper"],
    ["h", "PXE boot in one minute"],
    ["steps", ["PC starts with network boot (F12)", "DHCP gives an IP and points to the boot server", "The PC downloads a small boot program and Windows PE over TFTP", "Windows PE runs the task sequence or setup"]],
    ["h", "Moving a user to a new PC"],
    ["parts", [["OneDrive Known Folder Move", "Documents and Desktop come back by signing in"], ["USMT", "User State Migration Tool: scanstate on the old PC, loadstate on the new"], ["Manual checklist", "Browser bookmarks, printers, signatures, special apps"]]],
    ["h", "Choosing the method"],
    ["p", "Mostly remote staff and cloud identity: Autopilot. Large estate with existing ConfigMgr, labs or bare-metal rebuilds: ConfigMgr OSD. Small office with a server and occasional rebuilds: WDS or USB install plus Intune."],
    ["part", "3", "Practice"],
    ["steps", ["Create a bootable Windows 11 USB with the Media Creation Tool", "Install WDS on a lab server and PXE-boot an empty VM (Generation 2, network boot first)", "Write a one-page comparison of Autopilot, ConfigMgr OSD and WDS for an interview"]]
  ], quiz: [
    ["Recommended cloud provisioning for new devices:", ["WDS", "Windows Autopilot", "MDT", "Ghost"], 1],
    ["A PXE client gets the boot server address from...", ["DNS", "DHCP", "Active Directory", "SMTP"], 1],
    ["Tool to copy user profiles from an old PC to a new one:", ["USMT", "DISM", "Sysprep", "LAPS"], 0]
  ]}
  ]},

{ id: "cloud", title: "Cloud computing (Azure and AWS)", icon: "grid", level: "Beginner", hours: 8,
  short: "Cloud models, shared responsibility, Azure core services, AWS equivalents, cost and security.",
  cert: "Prepares for Microsoft AZ-900; first steps toward AZ-104",
  modules: [
  { id: "concepts", title: "Cloud concepts", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Cloud computing means renting computing (servers, storage, databases, software) over the internet, paying for what you use instead of buying hardware."],
    ["svg", "cloudmodels", "Who manages what in each model"],
    ["h", "Service models"],
    ["parts", [["IaaS", "Infrastructure: you rent VMs, disks, networks (Azure VMs, AWS EC2)"], ["PaaS", "Platform: you bring code or data, provider runs the servers (Azure App Service, Azure SQL)"], ["SaaS", "Software: finished app (Microsoft 365, Salesforce)"]]],
    ["h", "Deployment models"],
    ["parts", [["Public cloud", "Shared provider infrastructure"], ["Private cloud", "Dedicated to one organisation"], ["Hybrid", "On-premises plus public cloud working together (very common in Germany)"]]],
    ["part", "2", "Go deeper"],
    ["h", "Shared responsibility"],
    ["p", "The provider always secures the physical datacentre. You always own your data, identities and access. In between it depends on the model: with IaaS you patch the operating system, with SaaS the provider does."],
    ["h", "Why companies move (and why some don't)"],
    ["steps", ["Scale up and down quickly; pay per use (OpEx instead of CapEx)", "High availability across regions and availability zones", "But: data protection (GDPR, data residency in EU regions), costs if unmanaged, skills"]],
    ["part", "3", "Practice"],
    ["steps", ["Create a free Microsoft Learn account and complete 'Describe cloud concepts' (AZ-900 path)", "Write which model each is: Outlook on the web, an Azure VM, Azure SQL Database"]]
  ], quiz: [
    ["Microsoft 365 is an example of...", ["IaaS", "PaaS", "SaaS", "On-premises"], 2],
    ["With an IaaS VM, who patches the operating system?", ["The provider", "You", "Nobody", "The ISP"], 1],
    ["On-premises and public cloud working together:", ["Hybrid", "Private", "Community", "Edge only"], 0]
  ]},
  { id: "azure", title: "Azure core services", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Azure is organised as tenant (Entra ID) > management groups > subscriptions > resource groups > resources."],
    ["parts", [["Subscription", "Billing and access boundary"], ["Resource group", "Container for resources that share a lifecycle"], ["Region / availability zone", "Where it runs; Germany West Central is in Frankfurt"], ["Resource", "A VM, storage account, virtual network..."]]],
    ["part", "2", "Go deeper"],
    ["h", "Services a sysadmin uses first"],
    ["parts", [["Virtual Machines", "Windows and Linux servers"], ["Virtual Network (VNet)", "Private network, subnets, network security groups"], ["Storage account", "Blobs, file shares (Azure Files), queues, tables"],
      ["Azure Backup / Site Recovery", "Back up and replicate VMs"], ["Azure Monitor", "Metrics, logs, alerts"], ["Azure Arc", "Manage on-premises servers from Azure"]]],
    ["h", "Cost and governance"],
    ["steps", ["Use the pricing calculator before you build", "Set budgets and alerts in Cost Management", "Tag resources (owner, project)", "Azure Policy enforces rules such as 'only EU regions'", "RBAC: give Reader or Contributor at the smallest scope"]],
    ["cmd", "az vm list -o table", "Azure CLI: lists VMs (after az login)"],
    ["part", "3", "Practice"],
    ["steps", ["Use the Microsoft Learn sandbox exercises (free, no card) to create a VM and a storage account", "Draw your homelab as it would look in Azure: VNet, subnets, VMs", "Price a small VM in Germany West Central with the calculator"]]
  ], quiz: [
    ["Billing and access boundary in Azure:", ["Resource group", "Subscription", "Region", "Tag"], 1],
    ["Enforce 'only EU regions' across subscriptions:", ["Azure Policy", "Tags", "Azure Monitor", "A VNet"], 0],
    ["Manage on-premises servers from Azure:", ["Azure Arc", "Azure Files", "Site Recovery", "Blob storage"], 0]
  ]},
  { id: "aws", title: "AWS in Azure terms", blocks: [
    ["part", "1", "Big picture"],
    ["one", "AWS and Azure offer the same building blocks under different names. Knowing the mapping lets you read any job ad."],
    ["parts", [["EC2", "Azure Virtual Machines"], ["S3", "Azure Blob Storage"], ["VPC", "Azure Virtual Network"], ["IAM", "Entra ID + Azure RBAC"], ["CloudWatch", "Azure Monitor"],
      ["RDS", "Azure SQL Database / Database for PostgreSQL"], ["Route 53", "Azure DNS"], ["CloudFormation", "ARM / Bicep templates"]]],
    ["part", "2", "Go deeper"],
    ["h", "Certifications"],
    ["p", "Entry level: AWS Certified Cloud Practitioner (CLF-C02) and Microsoft AZ-900. For sysadmin jobs in German Microsoft-heavy companies, AZ-900 then AZ-104 is usually the better first path."],
    ["part", "3", "Practice"],
    ["steps", ["Make your own two-column Azure/AWS cheat sheet", "Read three cloud job ads and list which services they name"]]
  ], quiz: [
    ["AWS S3 is closest to...", ["Azure VMs", "Azure Blob Storage", "Azure DNS", "Entra ID"], 1],
    ["AWS VPC equals Azure...", ["Virtual Network", "Subscription", "Resource group", "Monitor"], 0]
  ]}
  ]}
]);
