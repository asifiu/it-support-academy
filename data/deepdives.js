/* "How it really works": the knowledge behind the fixes. Same block format as lessons.js.
   Read one per week next to the plan; come back when a ticket does not make sense. */
window.DEEPDIVES = [
{ id: "logon", title: "What happens when someone logs on to a domain PC", tags: "active directory kerberos login dc time trust",
  blocks: [
  ["p", "Every morning hundreds of people press Ctrl+Alt+Del. When it fails, you can only fix it fast if you know the steps in between. Here they are."],
  ["h", "Step 1: the PC finds a domain controller (DC)"],
  ["p", "The PC asks its DNS server: 'where are the domain controllers for lab.example.com?' It asks for special SRV records like _ldap._tcp.dc._msdcs.lab.example.com. The answer is a list of DCs, preferably in the PC's own AD site."],
  ["warn", "If the PC uses a public DNS server (8.8.8.8 or the home router), it never finds a DC. This is the No. 1 reason for 'the domain is not available' and failed domain joins."],
  ["cmd", "nltest /dsgetdc:lab.example.com", "Shows which DC the PC found. An error here = DNS or network problem, not a password problem."],
  ["h", "Step 2: Kerberos, the ticket system"],
  ["p", "Windows does not send the password over the network. It proves it knows the password and receives a TGT (ticket granting ticket), a kind of day pass valid about 10 hours. Later, for every server (file share, printer, intranet) it shows the day pass and gets a service ticket for that server."],
  ["eg", "Like a festival wristband: you show ID once at the entrance (TGT), then at each stage you just show the wristband (service ticket)."],
  ["p", "Kerberos needs correct time: if the PC clock differs from the DC by more than 5 minutes (default), logon and access fail with strange errors."],
  ["cmd", "w32tm /query /status", "Shows the time source. In a domain it should be a DC, not 'Local CMOS Clock'."],
  ["cmd", "klist", "Lists the user's Kerberos tickets. 'klist purge' deletes them so new ones (with new group memberships) are fetched."],
  ["h", "Step 3: the computer account and the 'trust'"],
  ["p", "The PC itself also has an account in AD with a password that changes automatically every 30 days. If a PC was restored from an old image or snapshot, its password no longer matches: 'The trust relationship between this workstation and the primary domain failed.'"],
  ["cmd", "Test-ComputerSecureChannel -Repair -Credential lab\\admin", "Repairs the trust without leaving and re-joining the domain. Run as local admin on the affected PC."],
  ["h", "Step 4: the access token"],
  ["p", "After logon Windows builds a token: the user's SID plus the SIDs of ALL groups they are in. Every file and share is checked against this token. The token is built only at logon."],
  ["warn", "You add a user to a group and they still have no access? Their token is old. They must sign out and in again (or lock/unlock is NOT enough). For file shares, 'klist purge' and reconnecting can be enough."],
  ["h", "Step 5: profile and Group Policy"],
  ["p", "Windows loads the user profile (C:\\Users\\name), applies Group Policy, runs logon scripts, maps drives. A slow logon is usually here: big roaming profiles, slow scripts, unreachable drive maps."],
  ["h", "Cached logon: laptops on the train"],
  ["p", "Windows remembers the last logons (cached credentials), so laptops can log on without a DC. But: a password changed in the office from another PC is not known to the laptop until it sees a DC again (VPN or office)."],
  ["sum", ["DNS finds the DC", "Kerberos: TGT then service tickets, time must be within 5 min", "Trust broken = computer password mismatch, repair it", "Group change needs a new logon", "Laptops use cached credentials offline"]]
]},
{ id: "names", title: "How a name becomes an IP address", tags: "dns resolution hosts cache vpn suffix nslookup",
  blocks: [
  ["p", "When a user types \\\\fileserver or intranet.company.de, Windows must turn the name into an IP. It tries several places in order. Knowing the order explains many 'works for me, not for her' tickets."],
  ["steps", [
    "The hosts file: C:\\Windows\\System32\\drivers\\etc\\hosts. Old entries here override everything (and malware likes to write here).",
    "The DNS client cache: answers remembered for a while (the TTL). 'ipconfig /displaydns' shows it.",
    "The DNS servers from the network settings, in order. Short names get the DNS suffix added (fileserver becomes fileserver.company.local).",
    "Fallbacks for short names in the local network: LLMNR and NetBIOS (old, often disabled for security)."
  ]],
  ["cmd", "Resolve-DnsName fileserver", "Shows the full name, the IP and where the answer came from. Better than nslookup because it uses the same path as Windows."],
  ["cmd", "nslookup fileserver.company.local 10.10.10.10", "Asks ONE specific DNS server directly. Compare servers when answers differ."],
  ["cmd", "ipconfig /flushdns", "Deletes the cache. Use after a server got a new IP."],
  ["h", "Split DNS and VPN"],
  ["p", "At home, the laptop's DNS is the home router, which knows nothing about company names. The VPN must hand over the company DNS servers and suffix. If it does not, the user can reach 10.1.2.3 but not \\\\fileserver."],
  ["eg", "Ticket: 'VPN works, Outlook works, but S: drive does not'. Outlook is in the cloud (public DNS works), the file server is internal (needs company DNS). Check: Resolve-DnsName fileserver while on VPN."],
  ["h", "TTL: why changes take time"],
  ["p", "Every DNS answer has a TTL (time to live) in seconds. Until it runs out, clients and servers keep the old answer. Before moving a server, admins lower the TTL a day earlier."],
  ["sum", ["Order: hosts file, cache, DNS server, LLMNR/NetBIOS", "Resolve-DnsName shows what Windows really gets", "VPN must give company DNS", "Old answers live until the TTL ends"]]
]},
{ id: "gpo", title: "How Group Policy really applies", tags: "gpo group policy gpupdate gpresult sysvol loopback",
  blocks: [
  ["h", "Where GPOs live"],
  ["p", "A GPO has two halves: an object in AD and a folder in SYSVOL (\\\\domain\\SYSVOL) on every DC. Both are replicated between DCs. If replication is broken, PCs talking to different DCs get different settings."],
  ["h", "Order: L, S, D, OU"],
  ["p", "Local policy first, then Site, then Domain, then OUs from top to bottom. Later wins. So a GPO on the 'Berlin > Laptops' OU beats one on the domain, unless the domain GPO is set to 'Enforced'. 'Block inheritance' on an OU stops higher GPOs (except enforced ones)."],
  ["h", "When it applies"],
  ["steps", [
    "Computer settings: at startup, then in the background every 90 minutes plus a random 0-30 minutes.",
    "User settings: at logon, then in the background the same way.",
    "Some settings ONLY apply at startup/logon: software installation, folder redirection, some drive maps. 'gpupdate /force' then asks for a restart or logoff.",
    "Domain controllers refresh every 5 minutes."
  ]],
  ["h", "Who gets it: filters"],
  ["p", "Security filtering: by default 'Authenticated Users'. If you replace it with a group, computers also need read rights (keep 'Domain Computers' or Authenticated Users with Read on the Delegation tab), or the GPO silently does not apply. WMI filters can limit a GPO to e.g. Windows 11 only."],
  ["h", "Computer vs user part"],
  ["p", "User settings apply to users whose account is in the linked OU; computer settings to computers in the linked OU. A user setting linked to a computers OU does nothing, unless loopback processing is on (used for meeting room PCs and terminal servers)."],
  ["cmd", "gpresult /r", "Quick summary: which GPOs applied, which were filtered out and why."],
  ["cmd", "gpresult /h C:\\Temp\\gp.html", "Full HTML report with the winning GPO for each setting. Run as admin for the computer part."],
  ["cmd", "gpupdate /force", "Applies all policies again now."],
  ["warn", "Do not edit the 'Default Domain Policy' for everything. Keep it for password and account policy; make separate, well-named GPOs for the rest."],
  ["sum", ["GPO = AD object + SYSVOL folder", "LSDOU, later wins, enforced beats block", "Every 90 + 0-30 min; some only at logon/startup", "Security filter groups still need Read for computers", "gpresult /h tells the truth"]]
]},
{ id: "mail", title: "How email and Outlook work", tags: "exchange outlook mx spf dkim dmarc autodiscover ost",
  blocks: [
  ["h", "How mail arrives"],
  ["steps", [
    "Someone sends to anna@company.de. Their mail server asks DNS for the MX record of company.de.",
    "The MX points to Exchange Online Protection (company-de.mail.protection.outlook.com).",
    "EOP checks spam, malware, SPF, DKIM, DMARC, then delivers to the inbox, the junk folder or quarantine."
  ]],
  ["h", "SPF, DKIM, DMARC in one minute"],
  ["p", "SPF (a TXT record) lists which servers may send for your domain. DKIM signs each mail with a key published in DNS. DMARC tells receivers what to do if SPF/DKIM fail (none, quarantine, reject) and where to send reports. When a company's newsletter tool is not in SPF, its mails land in spam everywhere."],
  ["h", "How Outlook finds the mailbox"],
  ["p", "Outlook uses Autodiscover: from the email address it finds the server settings automatically. With Exchange Online, sign-in is modern authentication (an Entra ID window, MFA). Outlook keeps a local copy in an .ost file (cached mode) so it works offline and fast."],
  ["tip", "Hold Ctrl and right-click the Outlook icon in the system tray: 'Test Email AutoConfiguration' and 'Connection Status' show exactly what Outlook connects to."],
  ["h", "Why a new profile fixes so much"],
  ["p", "The profile stores accounts, settings and the path to the .ost. A damaged .ost or profile causes missing folders, sync errors and crashes. A new profile builds a fresh .ost from the server: the mail is safe on the server, nothing is lost (except local .pst files, which you must re-add)."],
  ["h", "Shared mailboxes and automapping"],
  ["p", "If a user gets Full Access, Outlook adds the shared mailbox automatically (automapping), usually within an hour. Automapping does not work when access is given through a group: then the user adds it manually."],
  ["h", "Message trace: the truth about 'I never got it'"],
  ["p", "In the Exchange admin center, message trace shows for each mail: received, delivered, filtered as spam, quarantined, or failed. Ask the user for sender, recipient and approximate time."],
  ["sum", ["MX tells the world where your mail goes", "SPF, DKIM, DMARC prove mails are really yours", "Autodiscover + modern auth connect Outlook", "New profile = new .ost, server data is safe", "Message trace before guessing"]]
]},
{ id: "signin", title: "How Microsoft 365 sign-in, MFA and Conditional Access work", tags: "entra id azure ad mfa conditional access token sign-in logs",
  blocks: [
  ["h", "The flow"],
  ["steps", [
    "The user opens Outlook or office.com. The app sends them to login.microsoftonline.com (Entra ID).",
    "Entra checks the password (in the cloud, or on-prem in hybrid setups), then asks for MFA if a policy says so.",
    "Conditional Access policies check conditions: who, which app, which device (compliant in Intune?), where (country, network), risk.",
    "If allowed, Entra issues tokens. Apps use them for about an hour and silently refresh them for days, so users are not asked again and again."
  ]],
  ["p", "That is why 'I changed my password but my phone still gets mail' happens: refresh tokens stay valid until they are revoked or expire. After a compromise, always revoke sessions."],
  ["h", "Sign-in logs: your best friend"],
  ["p", "Entra admin center > Users > the user > Sign-in logs. Each failed sign-in has an error code and the Conditional Access result. Common ones:"],
  ["steps", [
    "50126: wrong username or password.",
    "50053: account locked (smart lockout after too many wrong passwords) or sign-in blocked.",
    "50076 / 50074: MFA required; user did not finish it.",
    "53003: blocked by Conditional Access (look at the 'Conditional Access' tab to see which policy).",
    "530032 or similar 53xxx codes: blocked by security defaults or device requirements."
  ]],
  ["cmd", "dsregcmd /status", "On a Windows PC: shows if the device is Entra joined / hybrid joined and if it has a Primary Refresh Token (AzureAdPrt : YES). No PRT = single sign-on problems."],
  ["h", "New phone, MFA lost"],
  ["p", "The user must register a new method. As admin you can 'Require re-register MFA' or delete old methods in the user's Authentication methods, after you verified the person (call back on a known number, ask the manager)."],
  ["warn", "MFA fatigue attacks: an attacker who knows the password sends push after push until the user taps Approve. Teach users: never approve a prompt you did not start, report it. Number matching helps."],
  ["sum", ["Entra ID checks password, MFA, Conditional Access", "Tokens refresh silently; revoke after compromise", "Sign-in logs + error code = the answer", "dsregcmd /status for device SSO", "Verify identity before resetting MFA"]]
]},
{ id: "print", title: "How printing works (and why it breaks)", tags: "printer spooler driver point and print queue",
  blocks: [
  ["h", "The chain"],
  ["steps", [
    "The app sends the document to the Print Spooler service on the PC.",
    "The driver turns it into the printer's language (PCL, PostScript).",
    "The job goes to a port: directly to the printer's IP (TCP/IP port), or to a print server queue (\\\\printsrv\\Floor2) which forwards it.",
    "The printer prints, or shows an error (paper, toner, jam)."
  ]],
  ["p", "Any link can break: spooler hung, wrong driver, printer has a new IP, print server down, printer itself in an error state. Ask: does it fail for everyone (printer/server) or one user (PC/driver)?"],
  ["h", "Print servers vs direct IP"],
  ["p", "With a print server, drivers and queues are managed centrally and pushed by GPO. Many companies now use cloud printing (Universal Print, PaperCut, 'follow-me' printing with badge release)."],
  ["h", "PrintNightmare and Point and Print"],
  ["p", "Since the 2021 PrintNightmare security fixes, normal users cannot install printer drivers by default. If a user adds a printer and gets an admin prompt, that is expected. The fix is to deploy the printer (with driver) by GPO or Intune, not to make the user admin."],
  ["cmd", "Get-Printer | Select Name, DriverName, PortName", "Lists printers, drivers and ports on the PC."],
  ["cmd", "Get-PrintJob -PrinterName \"Floor2\"", "Shows the jobs waiting in a queue."],
  ["cmd", "Stop-Service Spooler; Remove-Item C:\\Windows\\System32\\spool\\PRINTERS\\* -Force; Start-Service Spooler", "Clears ALL stuck jobs on this PC (or print server). Run as admin. Tell users jobs will be lost."],
  ["sum", ["App > spooler > driver > port/queue > printer", "Everyone affected = printer or server", "Driver install needs admin since PrintNightmare: deploy centrally", "Clear the spool folder for stuck queues"]]
]},
{ id: "perms", title: "How permissions decide who may open a file", tags: "ntfs share permissions inheritance deny effective access groups",
  blocks: [
  ["h", "Two gates"],
  ["p", "Over the network a user passes two gates: share permissions and NTFS permissions. The stricter one wins. Best practice: share permission 'Everyone/Authenticated Users: Full control' or 'Change', and do the real control in NTFS."],
  ["h", "NTFS rules"],
  ["steps", [
    "Permissions add up across all the user's groups (Read from one group + Modify from another = Modify).",
    "An explicit Deny beats Allow. Use Deny almost never; it causes confusing tickets.",
    "Inheritance: subfolders get the parent's permissions unless inheritance is disabled.",
    "Moving a file inside the same volume keeps its permissions; copying gets the target folder's permissions."
  ]],
  ["h", "AGDLP: the clean way"],
  ["p", "Accounts go into Global groups (by role: 'Finance-Staff'), global groups go into Domain Local groups (by resource: 'FS-Finance-Modify'), and only the domain local group gets Permissions on the folder. Then access changes are just group changes, never folder changes."],
  ["h", "Check before you change"],
  ["p", "Folder > Properties > Security > Advanced > Effective Access: pick a user, see what they really get. Then add them to the right group, ask for owner approval, and remember: new group membership needs a new logon."],
  ["cmd", "icacls \"D:\\Shares\\Finance\"", "Shows NTFS permissions in text. (OI)(CI) = inherited by files and folders, F = full, M = modify, RX = read & execute."],
  ["cmd", "whoami /groups", "Run on the user's PC (as the user): shows the groups in their current token. If the new group is missing, they need to log on again."],
  ["sum", ["Share and NTFS: stricter wins", "Allows add up; Deny wins", "Use groups, never single users on folders (AGDLP)", "Effective Access + whoami /groups before changing anything"]]
]},
{ id: "boot", title: "How Windows boots and updates", tags: "uefi boot bcd winre update servicing bsod",
  blocks: [
  ["h", "Boot chain"],
  ["steps", [
    "UEFI firmware checks hardware (POST) and, with Secure Boot, verifies the boot loader is signed.",
    "Windows Boot Manager reads the BCD (boot configuration data) and starts the Windows loader.",
    "The kernel loads drivers; boot-start drivers (storage, BitLocker) come first.",
    "Services start, then the logon screen."
  ]],
  ["p", "BitLocker sits in this chain: if firmware or boot settings change (BIOS update, docking at boot, Secure Boot changed), the TPM does not release the key and the user sees the BitLocker recovery screen. The 48-digit key is in AD or Entra ID (device > BitLocker keys)."],
  ["h", "Updates"],
  ["p", "Monthly cumulative updates arrive on the second Tuesday ('Patch Tuesday'). They download, install, and finish during restart. A PC that is never restarted is not patched. Feature updates (new Windows version) are bigger and yearly."],
  ["h", "Blue screen (BSOD)"],
  ["p", "A stop code (e.g. IRQL_NOT_LESS_OR_EQUAL, PAGE_FAULT_IN_NONPAGED_AREA) means a driver or hardware did something forbidden. Windows writes a small dump to C:\\Windows\\Minidump. Look for a pattern: same stop code after the same driver update or only on the dock = driver."],
  ["cmd", "Get-WinEvent -FilterHashtable @{LogName='System'; Id=41,1001,6008} -MaxEvents 10", "41 = unexpected restart, 1001 = BugCheck (BSOD details), 6008 = unexpected shutdown."],
  ["cmd", "perfmon /rel", "Reliability Monitor: a timeline of crashes, updates and installs. Great for 'since when?'."],
  ["sum", ["UEFI > Boot Manager > kernel > drivers > logon", "BitLocker recovery after firmware/boot changes; key in AD/Entra", "No restart = no patch", "BSOD: stop code + minidump + what changed"]]
]},
{ id: "desk", title: "A real day on the service desk", tags: "workday priority communication escalation sla documentation",
  blocks: [
  ["h", "Morning"],
  ["steps", [
    "Read the handover / shift notes and any open major incidents.",
    "Check monitoring and the queue: anything P1/P2 or close to breaching SLA first.",
    "Check your own 'waiting for customer' tickets: follow up or close after the agreed reminders."
  ]],
  ["h", "During the day"],
  ["steps", [
    "Phone and chat first (people waiting live), then email tickets by priority and SLA.",
    "Same symptom from 3+ people in a short time = stop working them separately, raise it as a possible major incident.",
    "Time-box: if you are 15-20 minutes into a 1st level ticket with no progress, check the KB, ask a colleague or escalate with a good note.",
    "Write the ticket note while you work, not at the end of the day."
  ]],
  ["h", "A good escalation note"],
  ["p", "Symptom, scope (who, how many), since when, what changed, what you checked and the results, error messages/screenshots, how to reach the user and when. The next level should never need to ask the user the same questions."],
  ["h", "Talking to users"],
  ["steps", [
    "Repeat the problem back in your words: they feel heard, you avoid misunderstandings.",
    "Say what you will do and when you will update them. Then do it, even if the update is 'still working on it'.",
    "No jargon. 'I will restart a program on the printer server' instead of 'I will bounce the spooler'.",
    "Angry user: let them finish, apologise for the trouble (not for things you did not do), focus on the next step."
  ]],
  ["h", "Habits that get you promoted"],
  ["steps", [
    "Turn every repeated fix into a KB article.",
    "Turn every repeated manual task into a script (and share it).",
    "Notice patterns and raise a problem record.",
    "Never share or ask for passwords; never 'quickly' give someone admin rights."
  ]],
  ["sum", ["Queue by priority and SLA, live channels first", "3 similar tickets = possible major incident", "Time-box and escalate with a complete note", "Update users before they chase you", "KB articles and scripts make you stand out"]]
]}
];
