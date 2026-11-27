/* Active Directory depth road (backlog: Depth programme, item 1).
   Adds 3 Foundation modules, 2 Professional deep dives, 1 Senior module, a capstone lab and 10 interview questions
   to the "ad" course, then puts all modules in road order: Foundation, Professional, casebook, Senior, capstone, interview.
   Progress keys use the module id, so reordering keeps everyone's progress.
   Facts checked on Microsoft Learn / Microsoft Support, 27 Nov 2026:
   - Windows Server 2025 forest and domain functional level (value 10) needs every DC on Windows Server 2025; it is required for
     the optional 32k database page feature, which is forest-wide and one-way (older 8k backups become unusable except for full forest recovery).
   - New Windows Server 2025 AD deployments enforce LDAP signing by default; upgraded DCs keep their existing policy.
   - NTLMv1 is removed in Windows 11 24H2 and Windows Server 2025; NTLM as a whole is deprecated, not removed.
   - Kerberos RC4 hardening (CVE-2026-20833): audit from Jan 2026, AES-first enforcement April 2026, rollback removed July 2026
     (Microsoft's own pages differ in wording; the content tells learners to check the current state). */
(function () {
  const c = (window.COURSES || []).find((x) => x.id === "ad");
  if (!c) return;
  c.hours = 26;
  c.short = "From the first unlock ticket to forest recovery: domains, DCs, users, groups, Group Policy, DNS, sites and replication, Kerberos, security tiers, upgrades, a capstone lab and interview practice.";

  const mods = [

  { id: "adintro", title: "What Active Directory is and why every company has it", level: "Foundation", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Active Directory (AD) is the company's address book and gatekeeper in one: it knows every user, computer and group, checks who you are when you sign in, and tells servers what you may open."],
    ["eg", "Think of a big office building. AD is the reception desk: it has the list of all employees, gives out ID badges (Kerberos tickets), knows which badge opens which door (groups and permissions) and hands every new desk the house rules (Group Policy)."],
    ["h", "Why companies still use it in the cloud age"],
    ["steps", ["One account per person for Windows sign-in, file shares, printers, VPN, Wi-Fi and many business apps", "Central control: lock one account and the person is out everywhere at once", "Group Policy configures thousands of PCs the same way without touching them", "Most German Mittelstand companies run hybrid: AD on premises, synced to Microsoft Entra ID for Microsoft 365"]],
    ["svg", "ad", "Forest, domain, OUs and objects"],
    ["part", "2", "Go deeper"],
    ["h", "The words you will hear on day one"],
    ["parts", [["Domain", "The company's AD, named like a DNS name: corp.contoso.de"], ["Domain controller (DC)", "A Windows Server that holds the AD database and answers sign-ins"], ["User object", "One person's account: name, login (sAMAccountName), UPN (anna.berg@contoso.de), password, groups"],
      ["Computer object", "Every domain-joined PC has its own account and its own password, changed automatically every 30 days"], ["Group", "A list of users (or other groups); permissions go to groups, not to people"], ["OU", "A folder for organising objects and applying policies"]]],
    ["h", "AD and Entra ID are not the same thing"],
    ["parts", [["Active Directory Domain Services", "On premises; Kerberos, LDAP, Group Policy; for Windows PCs and servers in your network"], ["Microsoft Entra ID", "Cloud identity; OAuth, SAML, OpenID Connect; for Microsoft 365 and SaaS apps"], ["Entra Connect / Cloud Sync", "Copies users from AD to Entra ID so people keep one identity"]]],
    ["tip", "In an interview, saying 'AD handles the on-premises side with Kerberos and Group Policy, Entra ID handles the cloud side, and Entra Connect links them' already sounds like someone who has worked in a real company."],
    ["warn", "Never 'just test something' on a production domain controller. A DC is not a normal server: a wrong click can affect every user in the company."],
    ["part", "3", "Practice"],
    ["steps", ["On any domain PC run whoami /fqdn and whoami /groups: who are you in AD?", "Run echo %LOGONSERVER% to see which DC signed you in", "In your lab open Active Directory Users and Computers and find the built-in Users and Computers containers"]],
    ["cmd", "whoami /upn\nwhoami /groups | findstr /i \"domain\"", "Your UPN and the domain groups in your access token"],
    ["done", ["I can explain AD in two sentences to a non-IT person", "I know the difference between AD and Entra ID", "I found my logon server and my groups"]],
    ["sum", ["AD = directory + authentication + policy", "Domain controllers hold the database", "Permissions go to groups", "Hybrid: AD synced to Entra ID"]]
  ], quiz: [
    ["Which server holds the AD database and answers sign-ins?", ["File server", "Domain controller", "DHCP server", "Print server"], 1],
    ["Microsoft 365 sign-in is checked by...", ["Active Directory only", "Microsoft Entra ID", "The local PC", "The firewall"], 1],
    ["Permissions should be given to...", ["Single users", "Groups", "Computers only", "OUs"], 1],
    ["Which command shows the DC that signed you in?", ["ipconfig", "echo %LOGONSERVER%", "ping dc", "hostname"], 1]
  ]},

  { id: "addesk", title: "Service desk work in AD: find, unlock, reset, add to group", level: "Foundation", blocks: [
    ["part", "1", "Big picture"],
    ["one", "About a third of first-level tickets touch AD: locked accounts, forgotten passwords, 'I need access to the Finance folder'. Doing these fast, safely and with a ticket note is the first real skill an employer checks."],
    ["h", "The four everyday tasks"],
    ["steps", ["Find the right account (there may be two Anna Bergs)", "Unlock a locked account", "Reset a password and force a change at next logon", "Add a user to a group after the request is approved"]],
    ["part", "2", "Go deeper"],
    ["h", "Verify the caller first"],
    ["p", "Most attacks on companies start with a phone call to the service desk. Before any reset, check identity the way your company says: call back on the number in the HR system, a manager confirmation, or an identity check in the self-service portal. Never reset because the caller 'sounds right'."],
    ["h", "Locked or disabled?"],
    ["parts", [["Locked out", "Too many wrong passwords; unlocks by itself after the lockout duration or by you"], ["Disabled", "Somebody turned the account off on purpose (leaver, security). Do not enable it without a ticket from HR or the manager"], ["Expired", "Account expiry date passed, often for contractors"], ["Password expired", "User must set a new one; often seen after holidays"]]],
    ["cmd", "Get-ADUser -Filter \"Surname -eq 'Berg'\" -Properties Department, Enabled, LockedOut | Select Name, SamAccountName, Department, Enabled, LockedOut", "Find the right person: compare the department and the account name before you act"],
    ["cmd", "Unlock-ADAccount -Identity aberg\nSet-ADAccountPassword -Identity aberg -Reset -NewPassword (Read-Host -AsSecureString 'New password')\nSet-ADUser -Identity aberg -ChangePasswordAtLogon $true", "Unlock, reset with a hidden prompt (never type passwords into the command line in clear text), force a change"],
    ["h", "Why it locks again five minutes later"],
    ["p", "If the account locks again right after you unlock it, something still uses the old password: a phone with company email, a mapped drive with saved credentials, a scheduled task, a second PC still signed in. Ask the user about every device. The professional casebook shows how to find the source with event 4740."],
    ["h", "Group changes"],
    ["cmd", "Add-ADGroupMember -Identity 'GG-Finance-Staff' -Members aberg\nGet-ADPrincipalGroupMembership aberg | Select Name", "Add to a role group, then check the result"],
    ["p", "The user gets the new group only in a new access token: sign out and in again (or lock and unlock with a VPN connected). This is the number one reason for 'I was added but it still does not work'."],
    ["h", "The ticket note"],
    ["eg", "Caller verified by call-back to the number in the HR system. Account aberg was locked (LockedOut True, 5 bad attempts). Unlocked at 09:12. Cause: old password saved on the iPhone mail app; user updated it. Tested: user signed in and opened Outlook. Closed."],
    ["part", "3", "Practice"],
    ["steps", ["In your lab create two users with the same surname in different OUs and practise finding the right one", "Lock a test user on purpose (wrong password 5 times with a lockout policy set) and unlock it with PowerShell", "Add a user to a group, test access before and after signing out again", "Write the ticket note for each task"]],
    ["done", ["I always verify the caller before a reset", "I can tell locked, disabled and expired apart", "I know why group changes need a new sign-in", "My ticket notes say cause, action and test"]],
    ["sum", ["Verify, then act", "Locked: unlock; disabled: ask why", "Repeat lockouts: find the old password", "New group = new token = sign out and in"]]
  ], quiz: [
    ["Before resetting a password on the phone you...", ["Reset quickly", "Verify the caller the company way", "Ask for the old password", "Email the new password to anyone"], 1],
    ["An account is disabled. You...", ["Enable it at once", "Check why and need a ticket from HR or the manager", "Delete it", "Reset the password"], 1],
    ["A user was added to a group but still has no access. Most likely:", ["The group is broken", "The user needs a new sign-in for a new token", "DNS is down", "The share was deleted"], 1],
    ["The account locks again minutes after unlocking. Likely cause:", ["A device still uses the old password", "The DC is full", "The user is a hacker", "The OU is wrong"], 0]
  ]},

  { id: "adlogon", title: "What really happens when you sign in", level: "Foundation", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Sign-in is a chain: find a DC through DNS, prove who you are with Kerberos, get your groups and policies. When sign-in is slow or fails, one link in this chain is broken, and you can test each link."],
    ["svg", "logon", "Domain logon from Ctrl+Alt+Del to desktop"],
    ["h", "The chain in five links"],
    ["steps", ["Network: the PC has an IP address and can reach the company network (or VPN)", "DNS: the PC asks its DNS server for SRV records like _ldap._tcp.dc._msdcs.corp.contoso.de and gets a list of DCs", "DC locator: the PC picks a DC in its own AD site and talks to it", "Kerberos: the DC checks the password and gives a ticket-granting ticket (TGT)", "Policy: the PC loads Group Policy from SYSVOL, maps drives, then shows the desktop"]],
    ["part", "2", "Go deeper"],
    ["svg", "dns", "Why a wrong DNS server breaks AD"],
    ["h", "The most common broken link: DNS"],
    ["p", "Domain PCs must use the company DNS servers (usually the DCs), never 8.8.8.8 or the router. Public DNS does not know the SRV records of your domain, so the PC cannot find a DC. Symptoms: very slow logon, 'The domain is not available', Group Policy errors."],
    ["cmd", "nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.contoso.de", "Lists the DCs DNS knows about. No answer = DNS problem, not an AD problem"],
    ["cmd", "nltest /dsgetdc:corp.contoso.de", "Which DC the PC found, in which site, and flags like GC and TIME"],
    ["h", "Time matters"],
    ["p", "Kerberos accepts a clock difference of at most 5 minutes by default. PCs get time from their DC, DCs from the PDC emulator, the PDC emulator from a reliable external source. A PC with a wrong clock gets sign-in errors that look like password problems."],
    ["cmd", "w32tm /query /status\nw32tm /resync", "Where the PC gets its time, and force a sync"],
    ["h", "Cached logon"],
    ["p", "A laptop away from the office can still sign in with cached credentials, but it gets no new Group Policy, no new groups and no new password until it sees a DC again (office or VPN). This explains many 'works at the office, not at home' tickets."],
    ["h", "The trust relationship error"],
    ["p", "'The trust relationship between this workstation and the primary domain failed' means the computer account password in AD and on the PC no longer match (for example after restoring an old snapshot). Fix: sign in with a local admin and repair the secure channel."],
    ["cmd", "Test-ComputerSecureChannel -Verbose\nTest-ComputerSecureChannel -Repair -Credential corp\\helpdesk-admin", "Checks and repairs the computer's trust with the domain without rejoining"],
    ["part", "3", "Practice"],
    ["steps", ["Set a lab client's DNS to 8.8.8.8, try to sign in with a new user and note the error; set it back", "Move the client's clock 10 minutes and try to open a share; then resync", "Break the secure channel (restore an old checkpoint of the client) and repair it with Test-ComputerSecureChannel"]],
    ["done", ["I can name the five links of a domain sign-in", "I can prove DNS is the problem with nslookup SRV", "I know the 5 minute Kerberos rule", "I can repair a broken trust relationship"]],
    ["sum", ["Network, DNS, DC locator, Kerberos, policy", "Domain PCs use company DNS only", "Max 5 minutes clock difference", "Cached logon gets nothing new"]]
  ], quiz: [
    ["A domain PC uses 8.8.8.8 as DNS. Result:", ["Faster logons", "It cannot find a DC through SRV records", "Nothing changes", "Kerberos gets stronger"], 1],
    ["Default maximum clock difference for Kerberos:", ["30 seconds", "5 minutes", "1 hour", "No limit"], 1],
    ["Repair 'trust relationship failed' without rejoining:", ["Test-ComputerSecureChannel -Repair", "gpupdate /force", "ipconfig /renew", "Reset the user's password"], 0],
    ["A laptop signs in with cached credentials at home. It gets...", ["New Group Policy", "No new policy or groups until it reaches a DC", "A new password", "A new IP from the DC"], 1]
  ]},

  { id: "sites", title: "Sites, replication and AD DNS in depth", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Every DC holds a full writable copy of the domain. Replication keeps the copies the same, sites tell AD which DCs are close to each other, and DNS ties it together. Most 'AD is weird' problems are one of these three."],
    ["h", "How replication works"],
    ["steps", ["Multi-master: any writable DC can accept a change", "Each change gets an Update Sequence Number (USN) on the DC where it happened", "Partners pull changes: 'give me everything after USN 48211'", "The up-to-dateness vector stops a change from coming back in circles", "Conflicts are solved per attribute: higher version wins, then later time stamp"]],
    ["part", "2", "Go deeper"],
    ["h", "Inside a site and between sites"],
    ["parts", [["Intra-site", "Change notification: about 15 seconds after a change, partners are told; uncompressed, fast"], ["Inter-site", "On a schedule over site links, default every 180 minutes; compressed"], ["Urgent replication", "Account lockouts and some security changes go immediately"], ["Password changes", "Sent to the PDC emulator at once, so a fresh password works even before normal replication"]]],
    ["h", "Sites, subnets and site links"],
    ["p", "A site is a set of IP subnets. If a subnet is not in Sites and Services, clients from it have no site and may sign in against a DC on the other side of the country. The KCC (Knowledge Consistency Checker) runs every 15 minutes and builds the replication connections; between sites one DC per site, the ISTG, plans the connections."],
    ["cmd", "nltest /dsgetsite\nGet-ADReplicationSubnet -Filter * | Select Name, Site", "Which site am I in? Which subnets are mapped to which site?"],
    ["warn", "A new office or a new VPN subnet without a subnet object is a classic cause of slow logons. Netlogon logs it: look for 'NO_CLIENT_SITE' in %SystemRoot%\\debug\\netlogon.log on the DCs."],
    ["h", "AD-integrated DNS"],
    ["parts", [["AD-integrated zone", "DNS records live in AD and replicate with it; every DC with DNS can update them"], ["Replication scope", "DomainDnsZones (all DNS DCs in the domain) or ForestDnsZones (whole forest)"], ["Secure dynamic updates", "Only domain members can register their own records"], ["Scavenging", "Removes old dynamic records; set no-refresh + refresh to more than the DHCP lease time"], ["Conditional forwarder", "Send queries for partner.de to the partner's DNS, for example over a VPN"]]],
    ["h", "SYSVOL replication"],
    ["p", "SYSVOL (Group Policy files and logon scripts) replicates with DFS Replication, not with AD replication. The old FRS is deprecated and modern Windows Server versions cannot be promoted in a domain that still uses FRS, so migrate with dfsrmig first. A GPO can show a version mismatch when AD replicated but SYSVOL did not."],
    ["cmd", "dfsrmig /getglobalstate\nGet-WinEvent -LogName 'DFS Replication' -MaxEvents 20", "Is SYSVOL on DFSR? Any DFSR errors?"],
    ["h", "Reading replication output"],
    ["cmd", "repadmin /replsummary\nrepadmin /showrepl * /csv > repl.csv\nrepadmin /syncall /AdeP", "Summary of failures, full report for Excel, force a sync of all partitions across sites"],
    ["parts", [["Error 1722", "RPC server unavailable: firewall, DNS or the partner is down"], ["Error 1256 / 1908", "Remote system not available or could not find the DC: network or DNS"], ["Error 8453", "Replication access denied: permissions or a broken secure channel"], ["Error 8606", "Insufficient attributes: often lingering objects"], ["Error 8614 / event 2042", "Too long since last replication (beyond tombstone lifetime, 180 days): rebuild the DC"]]],
    ["h", "Lingering objects and USN rollback"],
    ["p", "A DC that was offline longer than the tombstone lifetime may still have objects others deleted: lingering objects. A DC restored from a VM snapshot without VM-GenerationID support goes back in USN numbers: USN rollback, and its partners ignore its changes. Modern hypervisors with VM-GenerationID protect against this, but backups with System State remain the supported restore method."],
    ["part", "3", "Practice"],
    ["steps", ["Create sites Berlin and Hamburg with two subnets each and a site link with a 60 minute schedule", "Put DC02 in Hamburg, create a user on DC01 and time how long it takes to appear on DC02; then run repadmin /syncall", "Remove the Hamburg client subnet and find the NO_CLIENT_SITE line in netlogon.log", "Turn on scavenging with 7 + 7 days and explain the numbers in your notes"]],
    ["done", ["I can explain USN, up-to-dateness vector and conflict resolution", "Every lab subnet is mapped to a site", "I can read repadmin errors and name the cause", "I know SYSVOL uses DFSR, not AD replication"]],
    ["sum", ["Multi-master, pull-based, per-attribute conflicts", "Intra-site fast, inter-site scheduled", "Unmapped subnets cause slow logons", "SYSVOL = DFSR", "Beyond tombstone lifetime = rebuild"]]
  ], quiz: [
    ["A client subnet is not mapped to any site. Result:", ["Faster logons", "Clients may use a remote DC and log NO_CLIENT_SITE", "DNS stops", "GPOs are deleted"], 1],
    ["Default inter-site replication interval:", ["15 seconds", "15 minutes", "180 minutes", "24 hours"], 2],
    ["SYSVOL replicates with...", ["AD replication", "DFS Replication", "Robocopy", "SMB 1"], 1],
    ["Replication error 1722 points first to...", ["Network, firewall or DNS", "Tombstone lifetime", "Schema version", "A full mailbox"], 0],
    ["Which DC receives password changes immediately?", ["RID master", "PDC emulator", "Schema master", "Any global catalog"], 1]
  ]},

  { id: "kerb", title: "Kerberos, delegation and service accounts in depth", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Kerberos is the ticket system behind every domain sign-in and every access to a file share, SQL server or intranet site. If you understand tickets, SPNs and delegation, you can solve problems most admins only reboot."],
    ["h", "The three exchanges"],
    ["steps", ["AS exchange: the client proves the password to the KDC (on every DC) and gets a TGT, valid 10 hours by default, renewable for 7 days", "TGS exchange: with the TGT the client asks for a service ticket for one service, for example cifs/fs01.corp.contoso.de", "AP exchange: the client shows the service ticket to the server, which can read it because it knows its own account key"]],
    ["p", "The service ticket contains the user's groups (the PAC). That is why new groups need a new sign-in: the old tickets still carry the old list."],
    ["part", "2", "Go deeper"],
    ["h", "SPNs: how Kerberos finds the account behind a service"],
    ["p", "A Service Principal Name like HTTP/intranet.corp.contoso.de is registered on exactly one account. The KDC encrypts the ticket with that account's key. If the SPN is missing, the client falls back to NTLM; if it is on two accounts, Kerberos fails."],
    ["cmd", "setspn -Q HTTP/intranet.corp.contoso.de\nsetspn -X\nsetspn -S HTTP/intranet.corp.contoso.de CORP\\svc-intranet", "Who has this SPN? Any duplicates in the forest? Add it safely (-S checks for duplicates first)"],
    ["h", "Seeing tickets on the client"],
    ["cmd", "klist\nklist purge\nklist get cifs/fs01.corp.contoso.de", "Show tickets, delete them (then lock and unlock or open a new session), request one service ticket to test"],
    ["parts", [["KRB_AP_ERR_MODIFIED", "The ticket was encrypted for a different account: wrong or duplicate SPN, or DNS points to the wrong server"], ["KDC_ERR_S_PRINCIPAL_UNKNOWN", "No account has this SPN"], ["KRB_AP_ERR_SKEW", "Clock difference over 5 minutes"], ["KDC_ERR_ETYPE_NOTSUPP", "Client, account and DC share no encryption type (often an RC4-only device)"]]],
    ["h", "Delegation: when a server acts for the user"],
    ["parts", [["Unconstrained", "The server gets the user's TGT and can act as the user anywhere. Dangerous; only DCs should have it"], ["Constrained (KCD)", "The server may act for the user only to listed services (msDS-AllowedToDelegateTo on the front-end account)"], ["Resource-based (RBCD)", "The back-end resource lists which accounts may delegate to it (msDS-AllowedToActOnBehalfOfOtherIdentity); the owner of the resource decides"]]],
    ["cmd", "Get-ADComputer -Filter {TrustedForDelegation -eq $true} | Select Name\nSet-ADComputer SQL01 -PrincipalsAllowedToDelegateToAccount (Get-ADComputer WEB01)", "Find unconstrained delegation (should be DCs only); allow WEB01 to delegate to SQL01 with RBCD"],
    ["h", "Service accounts done right"],
    ["parts", [["User account with a password", "Old way; password never changes, often in a script, a Kerberoasting target"], ["gMSA", "Group Managed Service Account: AD rotates a long random password (240 bytes) every 30 days by default, only chosen servers can retrieve it; use for services, scheduled tasks, IIS pools"], ["dMSA (Windows Server 2025)", "Delegated Managed Service Account, made to replace old service accounts; check current Microsoft guidance and known security issues before using it"]]],
    ["cmd", "Add-KdsRootKey -EffectiveImmediately   # lab only; in production wait for replication\nNew-ADServiceAccount svc-web -DNSHostName svc-web.corp.contoso.de -PrincipalsAllowedToRetrieveManagedPassword 'GG-WebServers'\nInstall-ADServiceAccount svc-web; Test-ADServiceAccount svc-web", "Create a gMSA that only the web servers may use"],
    ["h", "Encryption types: the end of RC4"],
    ["p", "Microsoft is hardening Kerberos against RC4 (CVE-2026-20833): audit events from January 2026, domain controllers default to AES for accounts with no explicit setting from April 2026, and the rollback option was planned to be removed in July 2026. Windows Server 2025 DCs no longer issue RC4 TGTs. Microsoft's pages word the plan differently, so check the current Microsoft Learn article 'Detect and remediate RC4 usage in Kerberos' before you change anything. Old NAS boxes, Linux keytabs and appliances are the usual RC4 users."],
    ["cmd", "Get-WinEvent -FilterHashtable @{LogName='Security';Id=4769} -MaxEvents 500 |\n  Where-Object { $_.Properties[5].Value -eq '0x17' } | Select TimeCreated, @{n='Service';e={$_.Properties[2].Value}}", "Service tickets issued with RC4 (encryption type 0x17) in the last 500 events: these systems must move to AES"],
    ["warn", "NTLMv1 is removed in Windows 11 24H2 and Windows Server 2025, and NTLM as a whole is deprecated. Any SPN problem that silently falls back to NTLM today may simply fail tomorrow."],
    ["part", "3", "Practice"],
    ["steps", ["Install IIS on a lab server, use a gMSA for the app pool and register the HTTP SPN on it", "Register the same SPN on a second account, see the error, find it with setspn -X, fix it", "Run klist on the client after opening the site and find the HTTP ticket", "Configure RBCD from WEB01 to a file server and explain in your notes why it is safer than unconstrained"]],
    ["done", ["I can explain AS, TGS and AP in my own words", "I can find and fix duplicate SPNs", "I know the three types of delegation and their risks", "My lab service runs on a gMSA", "I can find RC4 tickets in the event log"]],
    ["sum", ["TGT from the KDC, then service tickets per service", "SPN on exactly one account", "Unconstrained delegation only on DCs", "gMSA instead of static passwords", "Move everything to AES"]]
  ], quiz: [
    ["The same SPN is on two accounts. Result:", ["Faster tickets", "Kerberos fails, often KRB_AP_ERR_MODIFIED", "NTLM gets stronger", "Nothing"], 1],
    ["Which delegation type is decided by the owner of the back-end resource?", ["Unconstrained", "Constrained", "Resource-based constrained", "None"], 2],
    ["Best account type for a scheduled task on three servers:", ["Domain Admin", "gMSA", "Guest", "A user with 'password never expires'"], 1],
    ["Default TGT lifetime:", ["1 hour", "10 hours", "30 days", "Unlimited"], 1],
    ["Encryption type 0x17 in event 4769 means...", ["AES256", "RC4", "DES", "No encryption"], 1]
  ]},

  { id: "lifecycle", title: "AD lifecycle: upgrades, functional levels, migrations and forest recovery", level: "Senior", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Senior AD engineers are judged on the big, rare, risky jobs: moving to new DC versions, consolidating domains after a company merger, and bringing a forest back after ransomware. These jobs are won by planning, not by clicking."],
    ["h", "Three projects you will meet"],
    ["parts", [["DC upgrade", "Replace old DCs with new ones, then raise the functional level"], ["Migration", "Move users, groups and computers from one domain or forest to another"], ["Forest recovery", "Rebuild AD from backup after a total compromise or corruption"]]],
    ["part", "2", "Go deeper"],
    ["h", "Upgrading domain controllers"],
    ["steps", ["Inventory: DCs, OS versions, FSMO holders, apps that talk LDAP or Kerberos to DCs (VPN, NAS, printers, Linux)", "Health first: dcdiag and repadmin clean, SYSVOL on DFSR", "Add new DCs (promotion runs the schema and domain preparation automatically), let them replicate", "Move FSMO roles, update DNS server settings in DHCP and on static servers, update time source on the new PDC emulator", "Demote the old DCs cleanly; never just switch them off", "Raise domain, then forest functional level when no old DC is left"]],
    ["cmd", "Move-ADDirectoryServerOperationMasterRole -Identity DC-NEW01 -OperationMasterRole PDCEmulator,RIDMaster,InfrastructureMaster\nSet-ADDomainMode -Identity corp.contoso.de -DomainMode Windows2025Domain", "Move domain FSMO roles, then raise the domain level (check the exact mode name with Get-Help in your version)"],
    ["h", "Windows Server 2025 functional level"],
    ["p", "Windows Server 2025 brings a new forest and domain functional level (value 10) that needs every DC on Windows Server 2025. It is required for the optional 32k database page feature, which lets multivalued attributes hold about 3,200 values instead of about 1,200. Enabling 32k pages is forest-wide and cannot be undone, and older 8k backups become unusable except for a full forest recovery. New Windows Server 2025 deployments also enforce LDAP signing by default. Treat raising a functional level as a one-way change and test it in a copy of production first."],
    ["warn", "Before raising the level or enabling 32k pages: take a fresh System State backup after the change and prove you can restore it in an isolated lab. Your old backups may no longer help you."],
    ["h", "Domain migrations after a merger"],
    ["steps", ["Trust first: create a forest trust with selective authentication, test name resolution with conditional forwarders", "Map identities: who exists in both companies, which groups map to which", "Migrate groups first, then users with SID history so old permissions keep working during the move", "Migrate computers and re-permission file servers (translate ACLs), then remove SID history", "Remove the trust and the old domain only after weeks of quiet logs"]],
    ["p", "Microsoft's old Active Directory Migration Tool is no longer developed, so most migrations today use commercial tools. Whatever the tool, the order and the SID history clean-up are the same."],
    ["warn", "SID history is also an attack path: a forged SID of Domain Admins in SID history gives full rights. Enable SID filtering on trusts and remove SID history when the migration is done."],
    ["h", "Forest recovery after ransomware"],
    ["p", "If attackers had Domain Admin, you cannot trust any DC. Microsoft's AD Forest Recovery guide is the method. In short:"],
    ["steps", ["Isolate: disconnect the network, decide on a clean, isolated recovery network", "Choose a backup from before the compromise (malware may be inside newer backups)", "Restore one writable DC per domain, starting with the forest root, non-authoritatively, then mark SYSVOL authoritative", "Seize FSMO roles on the restored DCs, raise the RID pool by 100,000, clean metadata of all other DCs", "Reset krbtgt twice, reset all admin and service account passwords, reset trust passwords", "Remove the attacker's persistence: new admins, GPOs, scheduled tasks, AdminSDHolder changes, AD CS templates", "Promote new DCs, reconnect sites step by step, monitor"]],
    ["tip", "A senior answer in an interview: 'Backups are not a recovery plan. A recovery plan is a tested runbook, offline or immutable backups of two DCs per domain, and an isolated network to restore into. I would test it once a year.'"],
    ["h", "Decisions and trade-offs"],
    ["parts", [["In-place DC upgrade vs new DC", "In-place is supported but carries old problems along; new DCs are the clean, common choice"], ["Raise level now vs later", "New features and security defaults vs risk for old apps; test first"], ["Consolidate domains vs keep trust", "One domain is simpler to run; a trust is faster to set up but doubles the attack surface"], ["Restore vs rebuild after attack", "Restore is faster; rebuild is cleaner. Most real recoveries mix both"]]],
    ["part", "3", "Practice"],
    ["steps", ["In your lab add a new DC, move all FSMO roles to it, demote the old one and check with netdom query fsmo", "Write a one-page DC upgrade plan with a rollback point for every step", "Read Microsoft's AD Forest Recovery guide and turn it into a 15-step runbook for your lab", "Do a forest recovery drill: restore DC01 System State into an isolated virtual switch"]],
    ["done", ["I can plan a DC upgrade from inventory to functional level", "I know why 32k pages and raised levels are one-way", "I can describe a migration with SID history and its clean-up", "I have a tested forest recovery runbook"]],
    ["sum", ["New DCs, move FSMO, demote old, then raise levels", "Test one-way changes in a copy first", "Migrations: trust, groups, users, computers, clean up", "Forest recovery: isolate, restore one DC per domain, reset krbtgt twice, remove persistence"]]
  ], quiz: [
    ["What does the Windows Server 2025 functional level require?", ["One 2025 DC", "Every DC on Windows Server 2025", "Entra ID P2", "Nothing"], 1],
    ["Enabling the 32k database page feature...", ["Can be undone any time", "Is forest-wide and cannot be undone", "Only affects one DC", "Deletes old users"], 1],
    ["During migration, SID history lets...", ["Users keep old permissions while moving", "Passwords sync to the cloud", "DNS work", "GPOs copy themselves"], 0],
    ["In a forest recovery, after restoring the first DC you...", ["Reconnect all sites", "Seize FSMO, raise the RID pool, reset krbtgt twice", "Delete SYSVOL", "Join all PCs again first"], 1],
    ["Old DCs at the end of an upgrade should be...", ["Switched off", "Demoted cleanly", "Kept forever", "Renamed"], 1]
  ]},

  { id: "adcapstone", title: "Capstone project: build and run corp.lab", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "One project that proves you can run AD: a small company domain, built from zero, documented on GitHub, broken on purpose and repaired. Recruiters and interviewers can see it, and you can talk about it for 20 minutes."],
    ["h", "What you will build"],
    ["parts", [["Company", "Fictional 'Nordlicht Logistik GmbH', offices in Berlin and Hamburg, 40 users"], ["Servers", "DC01 (Berlin), DC02 (Hamburg), FS01 file server, all on Hyper-V"], ["Clients", "CLIENT01 Windows 11 in Berlin, CLIENT02 in Hamburg"], ["Deliverable", "A GitHub repo with scripts, an OU and group design, screenshots, and three incident reports"]]],
    ["part", "2", "Go deeper"],
    ["h", "Lab guide, stage 1: the domain (about 4 hours)"],
    ["steps", ["Create two Hyper-V internal switches and subnets: 10.10.10.0/24 Berlin, 10.10.20.0/24 Hamburg, route between them with a small router VM or OPNsense", "Install DC01, set a static IP and DNS to itself, promote the new forest corp.lab", "Install DC02 in Hamburg, point DNS to DC01 first, promote it as an additional DC, then set DNS to itself and DC01", "Create sites, subnets and a site link; move DC02 into Hamburg"]],
    ["cmd", "Install-WindowsFeature AD-Domain-Services -IncludeManagementTools\nInstall-ADDSForest -DomainName corp.lab -DomainNetbiosName CORP -InstallDns", "Promotes DC01 as the first DC of a new forest"],
    ["h", "Stage 2: structure and people (about 3 hours)"],
    ["steps", ["Design OUs: Nordlicht > Berlin/Hamburg > Users/Computers/Groups, plus Admin and Servers OUs at the top", "Write a PowerShell script that creates 40 users from a CSV (name, department, office) with random first passwords", "Create role groups (GG-) and resource groups (DL-) following AGDLP for Finance, Sales, Dispatch and IT", "Delegate password reset and unlock on the Users OUs to GG-Helpdesk"]],
    ["cmd", "Import-Csv .\\users.csv | ForEach-Object {\n  New-ADUser -Name \"$($_.First) $($_.Last)\" -SamAccountName $_.Sam -UserPrincipalName \"$($_.Sam)@corp.lab\" `\n    -Department $_.Dept -Office $_.Office -Path \"OU=Users,OU=$($_.Office),OU=Nordlicht,DC=corp,DC=lab\" `\n    -AccountPassword (ConvertTo-SecureString $_.Pw -AsPlainText -Force) -ChangePasswordAtLogon $true -Enabled $true }", "Bulk-create users; keep the CSV with test data only, never real names"],
    ["h", "Stage 3: services (about 4 hours)"],
    ["steps", ["FS01: shares for each department with NTFS permissions on DL- groups only, access-based enumeration on", "GPOs: drive maps with item-level targeting, a password and lockout policy, Windows LAPS, a Microsoft security baseline for clients", "Join both clients, sign in as users from each office and check drives and policies with gpresult", "Create a gMSA and run a nightly script with it that exports inactive users to a CSV on FS01"]],
    ["h", "Stage 4: break and fix (about 3 hours)"],
    ["steps", ["Incident A: set CLIENT02's DNS to a public resolver, document symptoms, find the cause with nslookup SRV and nltest", "Incident B: block RPC between sites on the router, read repadmin errors, restore the rule", "Incident C: remove Authenticated Users from the drive-map GPO, find it with gpresult, fix with Read for Domain Computers", "Write one post-incident note per case: impact, timeline, root cause, fix, prevention"]],
    ["h", "Stage 5: secure and recover (about 3 hours)"],
    ["steps", ["Run PingCastle, fix the top three findings, record the score before and after", "Enable the AD Recycle Bin, delete an OU with users, restore it", "Take a System State backup of DC01, then restore it into an isolated switch and check it boots into DSRM", "Create separate admin accounts (adm-), put them in Protected Users, and write a one-page tiering rule"]],
    ["h", "The README that gets you interviews"],
    ["steps", ["One diagram of the lab network and sites", "OU and group design table with the reasons", "Scripts with comments", "Three incident reports", "'What I would do differently in production': monitoring, backup to immutable storage, PAWs, change control"]],
    ["warn", "Use only invented names and the corp.lab domain. No real company data, no real passwords in the repo. Add a .gitignore for any file with secrets."],
    ["part", "3", "Practice"],
    ["steps", ["Do the five stages over one or two weeks", "Push the repo and pin it on your GitHub profile", "Practise a 3-minute tour of the project in English and a 1-minute version in German"]],
    ["done", ["Two DCs in two sites replicate without errors", "40 users and AGDLP groups created by script", "Shares, GPOs, LAPS and a gMSA work", "Three incidents caused, solved and written up", "Recycle Bin and System State restore tested", "README with diagram is on GitHub"]],
    ["sum", ["Build, break, fix, document", "Scripts over clicks", "Incident notes show how you think", "A public, honest project beats a long list of buzzwords"]]
  ], quiz: [
    ["When promoting DC02, its DNS should first point to...", ["8.8.8.8", "DC01", "The router", "Itself only"], 1],
    ["NTFS permissions in the capstone go to...", ["Users", "DL- resource groups", "GG- role groups directly", "Everyone"], 1],
    ["Which tool finds the top AD risks in the lab?", ["PingCastle", "Paint", "ipconfig", "Task Manager"], 0],
    ["What must never go into the GitHub repo?", ["Diagrams", "Scripts", "Real company data and real passwords", "Incident notes"], 2]
  ]},

  { id: "adinterview", title: "Interview practice: 10 Active Directory questions", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "German IT interviews test AD in two ways: 'explain this' and 'what would you do if...'. Strong answers are short, structured and end with a real example from your lab or job. Read each answer, then say it out loud in your own words."],
    ["tip", "Use the STAR shape for scenario questions: Situation, Task, Action, Result. Two minutes is enough."],
    ["part", "2", "Go deeper"],
    ["h", "1. What is the difference between a domain, a tree and a forest?"],
    ["p", "A domain is one AD database and naming space, like corp.contoso.de. A tree is domains with a shared, continuous DNS name. The forest is the outer security boundary: one schema, one configuration, trusts between all its domains. Most companies run one forest with one domain."],
    ["h", "2. Name the FSMO roles and what happens if the PDC emulator fails."],
    ["p", "Schema master and domain naming master per forest; RID master, PDC emulator and infrastructure master per domain. If the PDC emulator is gone, time sync drifts, password changes take longer to reach everyone, and lockouts are handled less cleanly. I would transfer the role if the DC comes back, or seize it if the DC is lost for good, and never bring the old one back online afterwards."],
    ["h", "3. A user says: 'I cannot log on'. How do you troubleshoot?"],
    ["p", "Scope first: one user, one PC or many? Then the account: locked, disabled, expired, password expired (Get-ADUser). Then the PC: network, DNS pointing to the DCs, clock within 5 minutes, secure channel. Then the DC: nltest /dsgetdc and dcdiag. I write each check in the ticket."],
    ["h", "4. Explain AGDLP and why it matters."],
    ["p", "Accounts go into Global role groups, global groups into Domain Local resource groups, and permissions go only to domain local groups. Access changes become group membership changes, which are easy to audit and to remove when someone leaves."],
    ["h", "5. A GPO does not apply. What do you check?"],
    ["p", "Is it linked to the right OU, is the link enabled, is inheritance blocked? Security filtering: can computers still read it? WMI filter? User settings on a computer OU without loopback? Then gpresult /h on the client and the GroupPolicy Operational event log."],
    ["h", "6. How does Kerberos authentication work?"],
    ["p", "The client proves the password to the KDC on a DC and gets a TGT. With the TGT it asks for a service ticket for a specific SPN. The server reads the ticket with its own key. Time must be within 5 minutes and the SPN must exist on one account only."],
    ["h", "7. How do you find the source of repeated account lockouts?"],
    ["p", "Look at event 4740 on the PDC emulator: it shows the caller computer. Then on that computer find what uses the old password: mapped drive, phone, service, scheduled task. If the callers are many or external, treat it as password spraying and involve security."],
    ["h", "8. How do you check AD health and replication?"],
    ["p", "dcdiag on each DC, repadmin /replsummary and /showrepl, DNS SRV records, SYSVOL DFSR state, event logs, free disk space. In a real company I would automate these checks and alert on failures every day."],
    ["h", "9. Someone deleted an OU with 50 users. What now?"],
    ["p", "If the AD Recycle Bin is on, restore the OU first, then its children with Restore-ADObject; group memberships come back. Without it, an authoritative restore from System State backup in DSRM. Afterwards: protect OUs from accidental deletion and review who has delete rights."],
    ["h", "10. How would you protect AD against attackers?"],
    ["p", "Tier model: Domain Admins only on DCs and privileged access workstations. Few admins, separate admin accounts, Protected Users. gMSA for services, Windows LAPS on every machine, AES only, LDAP signing, no NTLMv1 or SMB1. Monitor privileged groups. Regular PingCastle or Purple Knight reports, and a tested forest recovery plan."],
    ["h", "German phrases for the interview"],
    ["parts", [["Ich würde zuerst den Umfang prüfen.", "I would check the scope first."], ["Das Konto war gesperrt, nicht deaktiviert.", "The account was locked, not disabled."], ["Ich habe das in meinem Testlabor nachgestellt.", "I reproduced this in my test lab."], ["Die Ursache war ein falscher DNS-Server.", "The cause was a wrong DNS server."]]],
    ["part", "3", "Practice"],
    ["steps", ["Answer each question out loud in under 2 minutes; record yourself", "Add one example from your capstone lab to every answer", "Ask the KI tutor to interview you with these questions and give feedback", "Answer questions 3 and 7 in German"]],
    ["done", ["I can answer all 10 without reading", "Each answer has a real example", "I practised two answers in German"]],
    ["sum", ["Short, structured, with an example", "Scope, account, PC, DC", "Event 4740 for lockouts", "Recycle Bin first, backup second", "Tier model for security"]]
  ], quiz: [
    ["The outer security boundary of AD is the...", ["Domain", "Forest", "OU", "Site"], 1],
    ["Where do you find the caller computer of a lockout?", ["Event 4740 on the PDC emulator", "DHCP log", "DNS cache", "Task Manager"], 0],
    ["The PDC emulator DC is lost for good. You...", ["Wait", "Seize the role on another DC", "Reinstall all clients", "Delete the domain"], 1],
    ["A good scenario answer uses which shape?", ["STAR", "OSI", "RAID", "DHCP"], 0]
  ]}
  ];

  mods.forEach((m) => { if (!c.modules.some((x) => x.id === m.id)) c.modules.push(m); });
  const order = ["adintro", "addesk", "adlogon", "structure", "objects", "gpo", "health", "sites", "kerb", "incidents", "tiering", "lifecycle", "adcapstone", "adinterview"];
  const rank = (m) => { const i = order.indexOf(m.id); return i < 0 ? order.length : i; };
  c.modules.sort((a, b) => rank(a) - rank(b));
})();
