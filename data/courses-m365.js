/* Microsoft 365 courses. Block format as in lessons.js; every "h" starts a new step in the player. */
window.COURSES = (window.COURSES || []).concat([
{ id: "m365", title: "Microsoft 365 administration", icon: "grid", level: "Beginner", hours: 6,
  short: "Tenant, users, licences, groups, admin roles and the admin centres you use every day.",
  cert: "Supports MD-102 and AB-650 (successor of MS-102)",
  modules: [
  { id: "tenant", title: "The tenant and the admin centres", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A Microsoft 365 tenant is your company's private copy of Microsoft's cloud: its own users, domains, mailboxes, files and settings, isolated from every other company."],
    ["svg", "m365", "Entra ID sits in the middle; every service trusts it"],
    ["h", "What a tenant contains"],
    ["steps", ["An initial domain like contoso.onmicrosoft.com, plus your real domains (contoso.de) after you prove ownership with a DNS TXT record",
      "A directory (Entra ID) with users, groups and devices", "Subscriptions and licences that switch services on per user",
      "Service data: mailboxes, SharePoint sites, Teams, OneDrive", "Policies: security defaults or Conditional Access, retention, sharing"]],
    ["h", "The admin centres"],
    ["parts", [["admin.microsoft.com", "Users, licences, groups, billing, service health, message center"],
      ["entra.microsoft.com", "Identity: sign-in, MFA, Conditional Access, roles, sign-in logs"],
      ["admin.exchange.microsoft.com", "Mailboxes, mail flow, message trace"],
      ["intune.microsoft.com", "Devices, apps, compliance"],
      ["admin.teams.microsoft.com", "Teams policies, meetings, phone, call quality"],
      ["SharePoint admin center", "Sites, sharing limits, storage"],
      ["security.microsoft.com", "Defender: quarantine, incidents, threat policies"],
      ["purview.microsoft.com", "Retention, data loss prevention, eDiscovery, audit"]]],
    ["tip", "Bookmark all of them in one browser folder called 'M365 admin'. On the service desk you jump between three or four of them per ticket."],
    ["part", "2", "Go deeper"],
    ["h", "Adding a custom domain"],
    ["steps", ["Admin center > Settings > Domains > Add domain", "Add the TXT record Microsoft shows at your DNS provider, then Verify",
      "Choose which services use the domain; add the MX, autodiscover CNAME and SPF records Microsoft lists",
      "Change users' sign-in names from @contoso.onmicrosoft.com to @contoso.de"]],
    ["warn", "Changing the MX record moves where email is delivered. Plan it outside office hours and lower the TTL a day before."],
    ["h", "Service health and the message center"],
    ["p", "When many users report the same Microsoft 365 problem, check Health > Service health before troubleshooting single PCs. Microsoft posts incidents and advisories there. The Message center announces changes weeks ahead, for example a feature being retired."],
    ["part", "3", "Practice"],
    ["steps", ["Open admin.microsoft.com (with a trial tenant, or follow the Microsoft Learn MS-900 interactive guides if you have none)",
      "Find Service health and read one recent advisory", "Find where licences are assigned and how many are free", "Write a one-page 'Which admin centre for which ticket' cheat sheet for your homelab repo"]]
  ], quiz: [
    ["Where do you prove you own contoso.de?", ["A TXT record in DNS", "An email to Microsoft", "In Intune", "In Teams"], 0],
    ["Twenty users report Teams is down. First check:", ["Each user's PC", "Service health in the admin center", "The firewall logs", "Reinstall Teams"], 1],
    ["Which admin centre holds sign-in logs?", ["Exchange admin center", "Entra admin center", "Teams admin center", "SharePoint admin center"], 1],
    ["A tenant's initial domain ends with...", [".onmicrosoft.com", ".azure.net", ".office.com", ".local"], 0]
  ]},
  { id: "users", title: "Users, licences and groups", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A user is an identity; a licence switches services on for that identity; a group lets you manage many users at once."],
    ["h", "Three kinds of users"],
    ["parts", [["Cloud-only", "Created in Microsoft 365 / Entra ID, password lives in the cloud"],
      ["Synchronised (hybrid)", "Created in on-premises Active Directory and copied up by Entra Connect; you change them in AD"],
      ["Guest (B2B)", "Someone from another company invited to Teams or SharePoint"]]],
    ["h", "Licences in plain words"],
    ["parts", [["Business Basic", "Web and mobile Office, email, Teams, OneDrive; up to 300 users"],
      ["Business Standard", "Basic plus desktop Office apps"],
      ["Business Premium", "Standard plus Intune, Entra ID P1 (Conditional Access) and Defender for Business"],
      ["E3 / E5", "Enterprise plans, no 300-user cap; E5 adds advanced security, compliance and phone system"]]],
    ["part", "2", "Go deeper"],
    ["h", "Group types and when to use which"],
    ["parts", [["Security group", "Permissions and licence assignment"],
      ["Microsoft 365 group", "Shared mailbox, calendar, SharePoint site and optionally a Team for a group of people"],
      ["Distribution list", "One email address that reaches many people, nothing else"],
      ["Mail-enabled security group", "Permissions plus an email address"],
      ["Dynamic group", "Members added by a rule such as department = Finance (needs Entra ID P1)"]]],
    ["h", "Group-based licensing"],
    ["p", "Assign licences to a group instead of to people. Onboarding becomes 'add to the right groups', offboarding becomes 'remove from groups', and nobody forgets a licence that costs money every month."],
    ["h", "Removing a user safely"],
    ["steps", ["Block sign-in and revoke sessions on the last day", "Convert the mailbox to a shared mailbox if colleagues need the mail (shared mailboxes up to 50 GB need no licence)",
      "Transfer OneDrive files to the manager", "Remove licences and group memberships", "Delete the account after the agreed retention period (deleted users can be restored for 30 days)"]],
    ["part", "3", "Practice"],
    ["steps", ["Create 3 test users and a security group 'Lic-BusinessPremium'", "Assign the licence to the group and watch it apply to the members",
      "Create a Microsoft 365 group and see the mailbox and SharePoint site appear", "Write your offboarding checklist using the steps above"]]
  ], quiz: [
    ["Which licence includes Intune and Conditional Access?", ["Business Basic", "Business Standard", "Business Premium", "Exchange Online Plan 1"], 2],
    ["In a hybrid company you rename a synced user in...", ["Entra ID", "On-premises Active Directory", "Teams", "Exchange admin center"], 1],
    ["One address for a team's announcements, nothing else:", ["Security group", "Distribution list", "Dynamic group", "Guest"], 1],
    ["A leaver's mail must stay readable by the team, without paying a licence:", ["Delete the user", "Convert to shared mailbox", "Forward forever", "Export to PST only"], 1]
  ]},
  { id: "roles", title: "Admin roles and baseline security", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Every admin should have only the rights the job needs, for only as long as needed. Most breaches of Microsoft 365 start with an over-privileged or unprotected account."],
    ["h", "Roles you will meet"],
    ["parts", [["Global Administrator", "Everything. Keep to 2 to 4 people, never for daily work"],
      ["Helpdesk Administrator", "Reset passwords for non-admins, manage service requests"],
      ["User Administrator", "Create and manage users and groups"],
      ["Exchange Administrator", "Mailboxes and mail flow"],
      ["Intune Administrator", "Device management"],
      ["Security Reader / Global Reader", "Look but do not change: good for audits and juniors"]]],
    ["part", "2", "Go deeper"],
    ["h", "Baseline protections"],
    ["steps", ["MFA for everyone, admins first (security defaults on small tenants, Conditional Access on Premium)",
      "Block legacy authentication (old protocols that cannot do MFA)", "Separate admin accounts (admin-anna@) without a mailbox for daily work",
      "Two 'break-glass' emergency accounts excluded from Conditional Access, with long passwords stored offline",
      "Review the audit log and risky sign-ins weekly"]],
    ["h", "Privileged Identity Management"],
    ["p", "With Entra ID P2, admins are 'eligible' for a role and activate it for a few hours with a reason and MFA. No one holds Global Administrator permanently."],
    ["part", "3", "Practice"],
    ["steps", ["List the roles in Entra admin center > Roles and administrators and read what Helpdesk Administrator can do", "Give a test user Global Reader and check what they cannot change", "Write a one-page 'admin account policy' for a 50-person company"]]
  ], quiz: [
    ["Least-privilege role to reset normal users' passwords:", ["Global Administrator", "Helpdesk Administrator", "Billing Administrator", "Exchange Administrator"], 1],
    ["Why block legacy authentication?", ["It is slow", "It cannot enforce MFA", "It costs money", "It breaks Teams"], 1],
    ["Break-glass accounts are...", ["Daily admin accounts", "Emergency accounts excluded from CA", "Guest accounts", "Shared mailboxes"], 1]
  ]}
  ]},

{ id: "exchange", title: "Exchange Online", icon: "chat", level: "Intermediate", hours: 6,
  short: "Mailboxes, permissions, mail flow, spam protection, message trace and Outlook troubleshooting.",
  cert: "Part of MD-102 / AB-650 admin skills",
  modules: [
  { id: "recipients", title: "Recipients and mailboxes", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Exchange Online is Microsoft's hosted email server. Every object that can receive mail is a recipient: people, shared boxes, rooms, groups and contacts."],
    ["parts", [["User mailbox", "One per licensed person (50 GB or 100 GB depending on plan)"],
      ["Shared mailbox", "info@, support@; no licence up to 50 GB; people get Full Access and Send As"],
      ["Room / equipment mailbox", "Book meeting rooms, beamers, cars"],
      ["Distribution list", "One address, many recipients"],
      ["Microsoft 365 group", "Shared inbox, calendar and files for a team"],
      ["Mail contact / mail user", "External address shown in the company address book"]]],
    ["part", "2", "Go deeper"],
    ["h", "Permissions on mailboxes"],
    ["parts", [["Full Access", "Open and read the whole mailbox; automapping adds it to Outlook"],
      ["Send As", "Mail looks as if the mailbox itself sent it"],
      ["Send on Behalf", "Mail shows 'Anna on behalf of Support'"]]],
    ["warn", "Automapping only happens when Full Access is given to the user directly, not through a group."],
    ["h", "PowerShell you will use"],
    ["cmd", "Connect-ExchangeOnline", "Sign in to Exchange Online PowerShell (module ExchangeOnlineManagement)"],
    ["cmd", "Get-EXOMailbox -ResultSize Unlimited | Select DisplayName, RecipientTypeDetails", "All mailboxes and their types"],
    ["cmd", "Add-MailboxPermission support -User anna -AccessRights FullAccess -AutoMapping $true", "Full Access with automapping"],
    ["cmd", "Add-RecipientPermission support -Trustee anna -AccessRights SendAs", "Allow Send As"],
    ["cmd", "Set-Mailbox anna -Type Shared", "Convert a leaver's mailbox to shared"],
    ["part", "3", "Practice"],
    ["steps", ["Create a shared mailbox and a room mailbox", "Give one user Full Access and Send As, then test both in Outlook on the web", "Convert a test user's mailbox to shared and remove the licence"]]
  ], quiz: [
    ["Mail should appear to come from support@, not from Anna:", ["Full Access", "Send As", "Send on Behalf", "Forwarding"], 1],
    ["A shared mailbox under 50 GB needs...", ["An E5 licence", "No licence", "A Teams licence", "An Intune licence"], 1],
    ["Automapping does not work when access is granted via...", ["A group", "PowerShell", "The admin centre", "Full Access"], 0]
  ]},
  { id: "mailflow", title: "Mail flow and protection", blocks: [
    ["part", "1", "Big picture"],
    ["svg", "mail", "Every inbound message passes through Exchange Online Protection first"],
    ["h", "DNS records that make mail work"],
    ["parts", [["MX", "Where to deliver mail for your domain"],
      ["SPF (TXT)", "Which servers may send as your domain"],
      ["DKIM (CNAME)", "Signs each message with a key published in DNS"],
      ["DMARC (TXT)", "What receivers do when SPF/DKIM fail: none, quarantine or reject, plus reports"],
      ["Autodiscover (CNAME)", "Helps Outlook find the mailbox settings"]]],
    ["part", "2", "Go deeper"],
    ["h", "Mail flow rules and connectors"],
    ["p", "Mail flow (transport) rules act on every message: add a disclaimer, block attachments, mark external mail with a warning, send a copy for compliance. Connectors control mail between Exchange Online and other systems: a scanner or printer that sends mail, an on-premises Exchange server, a third-party filter."],
    ["h", "Protection and quarantine"],
    ["p", "Exchange Online Protection filters spam, phishing and malware. Defender for Office 365 adds Safe Links and Safe Attachments. Quarantined messages are released in the Defender portal by an admin, or by users if the policy allows."],
    ["h", "Message trace: proof instead of guessing"],
    ["steps", ["Exchange admin center > Mail flow > Message trace", "Enter sender, recipient and time range", "Read the status: Delivered, Failed, Quarantined, Filtered as spam", "Open the detail to see which rule or filter acted"]],
    ["tip", "Ask users for sender, recipient and rough time before you start. Without those three you search blind."],
    ["part", "3", "Practice"],
    ["steps", ["Look up the MX, SPF and DMARC records of a large company with Resolve-DnsName -Type MX / TXT", "Create a mail flow rule that adds '[External]' to the subject of mail from outside", "Send yourself a test mail and find it in message trace"]],
    ["cmd", "Resolve-DnsName microsoft.com -Type MX", "Shows where microsoft.com receives mail"]
  ], quiz: [
    ["Which record lists servers allowed to send for your domain?", ["MX", "SPF", "PTR", "CNAME"], 1],
    ["DMARC tells receivers...", ["Where to deliver mail", "What to do if SPF/DKIM fail", "How big mailboxes are", "Which port to use"], 1],
    ["A scanner sends mail through Microsoft 365 using a...", ["Connector", "Distribution list", "Room mailbox", "DKIM key"], 0],
    ["Best tool to prove what happened to a mail:", ["Message trace", "Outlook rules", "Ping", "Event Viewer"], 0]
  ]},
  { id: "outlook", title: "Outlook troubleshooting", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Most 'email' tickets are Outlook client problems, not server problems. Outlook on the web is your test: if mail works there, the mailbox is fine."],
    ["h", "The usual suspects"],
    ["parts", [["Password prompts", "Old saved credentials, MFA not completed, broken token cache"],
      ["Disconnected / not syncing", "Work Offline on, network or proxy, damaged OST"],
      ["Missing shared mailbox", "Automapping delay, access via group"],
      ["Search not working", "Windows Search index incomplete"],
      ["Slow or crashing", "Add-ins, huge OST, outdated Office"]]],
    ["part", "2", "Go deeper"],
    ["h", "The fix ladder"],
    ["steps", ["Test in Outlook on the web", "Restart Outlook; check for Office updates", "Start in safe mode (outlook.exe /safe) to rule out add-ins",
      "Clear Windows Credential Manager entries for Office", "Create a new Outlook profile (rebuilds the OST from the server)", "Run Microsoft's Outlook troubleshooters in the Get Help app"]],
    ["cmd", "outlook.exe /safe", "Starts Outlook without add-ins"],
    ["cmd", "control mlcfg32.cpl", "Opens Mail settings to create a new profile (on some PCs: Control Panel > Mail)"],
    ["part", "3", "Practice"],
    ["steps", ["Start Outlook in safe mode and look at File > Options > Add-ins", "Create a second Outlook profile and switch between them", "Write a KB article: 'Outlook keeps asking for the password'"]]
  ], quiz: [
    ["Mail works in Outlook on the web but not in Outlook. The problem is most likely...", ["The mailbox", "The Outlook client", "The MX record", "Exchange Online is down"], 1],
    ["Start Outlook without add-ins:", ["outlook.exe /safe", "outlook.exe /reset", "outlook /clean", "mailbox /safe"], 0],
    ["A new Outlook profile fixes problems because it...", ["Deletes the mailbox", "Rebuilds the local OST cache", "Changes the password", "Updates Windows"], 1]
  ]}
  ]},

{ id: "collab", title: "SharePoint, OneDrive and Teams", icon: "library", level: "Beginner", hours: 5,
  short: "Where files live, who can open them, how sync works and how Teams is administered.",
  cert: "Part of Microsoft 365 admin skills",
  modules: [
  { id: "sp", title: "SharePoint sites and permissions", blocks: [
    ["part", "1", "Big picture"],
    ["one", "SharePoint Online is the company's file and intranet platform. Every Team stores its files in a SharePoint site."],
    ["svg", "files", "Where files really live"],
    ["h", "Site types"],
    ["parts", [["Team site", "For a team working together; connected to a Microsoft 365 group and usually a Team"],
      ["Communication site", "Intranet pages: news, HR policies, IT announcements"],
      ["Hub site", "Groups related sites with shared navigation"]]],
    ["part", "2", "Go deeper"],
    ["h", "Permissions"],
    ["p", "Every site has three default groups: Owners (full control), Members (edit) and Visitors (read). Permissions flow down to libraries, folders and files. Breaking inheritance on single folders makes access impossible to audit, so avoid it."],
    ["h", "Sharing links"],
    ["parts", [["Specific people", "Safest: only named people can open it"],
      ["People in your organisation", "Anyone with a company account who has the link"],
      ["Anyone", "No sign-in needed; often disabled by admins"]]],
    ["h", "Versions and recycle bin"],
    ["p", "Libraries keep earlier versions of each file: open Version history to restore. Deleted files go to the site recycle bin and then the second-stage recycle bin, together about 93 days."],
    ["part", "3", "Practice"],
    ["steps", ["Create a team site, upload a file and restore an older version", "Share a file with one specific person and check Manage access", "Delete a file and restore it from the recycle bin"]]
  ], quiz: [
    ["Default SharePoint group with edit rights:", ["Owners", "Members", "Visitors", "Guests"], 1],
    ["Files in a Teams channel are stored in...", ["The user's OneDrive", "The team's SharePoint site", "Exchange", "The PC"], 1],
    ["A user overwrote a file yesterday. Fastest fix:", ["Restore from backup tape", "Version history", "Recycle bin", "Reinstall Office"], 1]
  ]},
  { id: "onedrive", title: "OneDrive and sync", blocks: [
    ["part", "1", "Big picture"],
    ["one", "OneDrive is each user's personal cloud storage (usually 1 TB), synced to their PC by the OneDrive app."],
    ["h", "Key features"],
    ["parts", [["Files On-Demand", "Files show in Explorer but download only when opened: cloud icon = online only, tick = on this PC"],
      ["Known Folder Move", "Desktop, Documents and Pictures redirected into OneDrive, so they are backed up and roam"],
      ["Restore your OneDrive", "Roll the whole OneDrive back up to 30 days, for example after ransomware"]]],
    ["part", "2", "Go deeper"],
    ["h", "Sync problems and fixes"],
    ["steps", ["Click the OneDrive cloud icon and read the exact error", "Path too long or invalid characters: rename the file", "File open in another app: close it", "Sync stuck: pause and resume, then reset", "Wrong account signed in: sign out and in again"]],
    ["cmd", "%localappdata%\\Microsoft\\OneDrive\\onedrive.exe /reset", "Resets the sync client; cloud files are not deleted"],
    ["part", "3", "Practice"],
    ["steps", ["Turn on Files On-Demand and mark one folder 'Always keep on this device'", "Create a sync conflict on purpose and resolve it", "Reset OneDrive and watch it resync"]]
  ], quiz: [
    ["Desktop and Documents backed up automatically:", ["Files On-Demand", "Known Folder Move", "Version history", "Retention"], 1],
    ["After ransomware encrypted a user's files:", ["Reinstall Windows only", "Restore your OneDrive to an earlier time", "Delete OneDrive", "Reset the password only"], 1],
    ["The OneDrive reset command deletes cloud files:", ["True", "False"], 1]
  ]},
  { id: "teams", title: "Teams administration", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Teams combines chat, meetings, calls and file collaboration. Admins control it with policies assigned to users."],
    ["h", "What admins manage"],
    ["parts", [["Teams policies", "Who can create teams, use private channels"],
      ["Meeting policies", "Recording, transcription, lobby, who can present"],
      ["Messaging policies", "Edit and delete messages, chat with external users"],
      ["External access and guests", "Chat with other organisations; invite guests into teams"],
      ["Teams Phone", "Phone numbers, call queues, auto attendants (extra licence)"],
      ["Teams Rooms", "Meeting room devices"]]],
    ["part", "2", "Go deeper"],
    ["h", "Troubleshooting meetings"],
    ["steps", ["Check devices: Teams > Settings > Devices and make a test call", "Windows privacy settings must allow microphone and camera", "Network: wired is better than Wi-Fi; VPN can hurt call quality",
      "Reset Teams: Settings > Apps > Installed apps > Microsoft Teams > Advanced options > Reset", "Admin side: Teams admin center > Users > Call history shows network quality per call"]],
    ["part", "3", "Practice"],
    ["steps", ["Create a team with a private channel and find its separate SharePoint site", "Make a Teams test call and check your devices", "Write a KB article: 'No sound in Teams meetings'"]]
  ], quiz: [
    ["Who can record meetings is controlled by a...", ["Messaging policy", "Meeting policy", "Retention label", "Compliance policy"], 1],
    ["A private channel's files live in...", ["The main team site", "Its own SharePoint site", "OneDrive", "Exchange"], 1],
    ["Per-call network quality for a user is in the...", ["Teams admin center", "Intune admin center", "Exchange admin center", "Azure portal"], 0]
  ]}
  ]},

{ id: "entra", title: "Microsoft Entra ID", icon: "badge", level: "Intermediate", hours: 6,
  short: "Cloud identity: sign-in, MFA, Conditional Access, hybrid sync, single sign-on and logs.",
  cert: "Supports AZ-104, MD-102 and SC-300",
  modules: [
  { id: "identity", title: "Identities and hybrid sync", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Entra ID (formerly Azure Active Directory) is the cloud directory behind Microsoft 365: it decides who you are and whether you may sign in."],
    ["parts", [["Active Directory", "On-premises, Kerberos and LDAP, Group Policy, OUs"],
      ["Entra ID", "Cloud, web sign-in (OAuth, SAML, OpenID Connect), Conditional Access, no OUs"]]],
    ["part", "2", "Go deeper"],
    ["h", "Hybrid identity"],
    ["parts", [["Entra Connect Sync", "Classic sync server copies users, groups and password hashes from AD to Entra ID"],
      ["Entra Cloud Sync", "Lighter agent-based sync managed from the cloud"],
      ["Password hash sync", "Most common sign-in method: a hash of the hash is synced; works even if AD is down"],
      ["Pass-through authentication", "Cloud asks on-premises agents to check the password"],
      ["Federation (AD FS)", "Sign-in handled on-premises; many companies are moving away from it"]]],
    ["h", "Device identities"],
    ["parts", [["Entra registered", "Personal device with a work account added"],
      ["Entra joined", "Company device that signs in with Entra ID only"],
      ["Hybrid joined", "Joined to on-premises AD and registered in Entra ID"]]],
    ["cmd", "dsregcmd /status", "Shows if the PC is Entra joined or hybrid joined and if it has a Primary Refresh Token (AzureAdPrt : YES)"],
    ["part", "3", "Practice"],
    ["steps", ["Run dsregcmd /status on your PC and read the Device State section", "Draw your company's identity picture: AD, sync, Entra ID, apps", "Explain password hash sync out loud in two minutes"]]
  ], quiz: [
    ["Most common hybrid sign-in method:", ["Federation", "Password hash sync", "Pass-through only", "LDAP"], 1],
    ["A company laptop that signs in only with Entra ID is...", ["Registered", "Entra joined", "Hybrid joined", "Workgroup"], 1],
    ["Entra ID organises users with OUs:", ["True", "False"], 1]
  ]},
  { id: "access", title: "MFA and Conditional Access", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Conditional Access is a set of if-then rules for every sign-in: if these conditions, then grant, require MFA, or block."],
    ["svg", "intune", "Intune reports device health; Conditional Access decides"],
    ["h", "Building blocks of a policy"],
    ["parts", [["Users", "Who it applies to (and who is excluded, like break-glass accounts)"],
      ["Target resources", "Which apps: all cloud apps, Exchange, SharePoint"],
      ["Conditions", "Location, device platform, sign-in risk, client app"],
      ["Grant", "Block, or allow with MFA / compliant device / approved app"],
      ["Session", "Sign-in frequency, app-enforced restrictions"]]],
    ["part", "2", "Go deeper"],
    ["h", "Policies most companies start with"],
    ["steps", ["Require MFA for all admins", "Require MFA for all users", "Block legacy authentication", "Require a compliant or hybrid-joined device for company data", "Block sign-ins from countries you never work in"]],
    ["warn", "Always create new policies in report-only mode first and check the impact in the sign-in logs. A wrong policy can lock out the whole company, including you."],
    ["h", "MFA methods, strongest first"],
    ["parts", [["Passkeys / FIDO2 keys", "Phishing-resistant"], ["Authenticator with number matching", "Strong and common"], ["SMS / voice call", "Weakest; use only as backup"]]],
    ["part", "3", "Practice"],
    ["steps", ["Create a report-only policy that requires MFA for one test user", "Sign in as that user and read the Conditional Access tab in the sign-in log", "Write down the five starter policies in your own words"]]
  ], quiz: [
    ["Before enforcing a new Conditional Access policy you should...", ["Delete old ones", "Run it in report-only mode", "Turn off MFA", "Notify Microsoft"], 1],
    ["Most phishing-resistant method:", ["SMS", "Voice call", "Passkey / FIDO2", "Email code"], 2],
    ["Break-glass accounts are usually...", ["Included in every policy", "Excluded from Conditional Access", "Guest users", "Disabled"], 1]
  ]},
  { id: "logs", title: "Sign-in logs and troubleshooting", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Every sign-in is logged with a result and a reason. Reading those logs turns 'I cannot sign in' into a two-minute ticket."],
    ["h", "Error codes you will see often"],
    ["parts", [["50126", "Wrong username or password"], ["50053", "Account locked (smart lockout) or blocked"], ["50076 / 50074", "MFA required and not completed"],
      ["53003", "Blocked by Conditional Access: open the Conditional Access tab"], ["50055", "Password expired"], ["700016", "App not found in the tenant: wrong tenant or app not consented"]]],
    ["part", "2", "Go deeper"],
    ["h", "After a compromised account"],
    ["steps", ["Reset the password and revoke all sessions (refresh tokens otherwise keep working)", "Check and reset MFA methods", "Check inbox rules and forwarding", "Review sign-ins from unknown locations", "Report to security; GDPR assessment by the data protection officer"]],
    ["cmd", "Revoke-MgUserSignInSession -UserId anna@contoso.de", "Microsoft Graph PowerShell: invalidates refresh tokens"],
    ["part", "3", "Practice"],
    ["steps", ["Sign in with a wrong password on purpose and find the 50126 entry", "Write a one-page 'sign-in error codes' cheat sheet for your desk"]]
  ], quiz: [
    ["Error 53003 means...", ["Wrong password", "Blocked by Conditional Access", "Password expired", "Mailbox full"], 1],
    ["After a password reset the attacker's phone still syncs mail because...", ["MFA is off", "Refresh tokens are still valid", "DNS is cached", "The mailbox is shared"], 1],
    ["Error 50126 means...", ["Wrong username or password", "Account locked", "MFA required", "Tenant missing"], 0]
  ]}
  ]},

{ id: "intune", title: "Microsoft Intune", icon: "server", level: "Intermediate", hours: 7,
  short: "Enrol, configure, secure and update Windows and phones from the cloud. Core of MD-102.",
  cert: "Main topic of MD-102 (Endpoint Administrator)",
  modules: [
  { id: "enrol", title: "Enrolment and Autopilot", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Intune is Microsoft's cloud tool for managing devices (MDM) and the company data inside apps (MAM), anywhere the device has internet."],
    ["h", "Ways a device gets into Intune"],
    ["parts", [["Windows Autopilot", "New PC from the vendor: user signs in, Intune sets everything up"],
      ["User-driven join", "Settings > Accounts > Access work or school > Join Entra ID"],
      ["Co-management", "PC managed by Configuration Manager and Intune together"],
      ["Company Portal (BYOD)", "Personal phones and PCs enrol through the app"],
      ["Apple / Android Enterprise", "Company phones via Apple Business Manager or Android zero-touch"]]],
    ["part", "2", "Go deeper"],
    ["h", "How Autopilot works"],
    ["steps", ["The vendor or reseller registers the device hardware hash with your tenant", "You assign an Autopilot deployment profile (user-driven or pre-provisioned)",
      "The user unboxes the PC, connects to the internet and signs in", "Windows joins Entra ID, enrols in Intune and installs apps and policies (Enrollment Status Page shows progress)", "The device is ready, without IT touching it"]],
    ["part", "3", "Practice"],
    ["steps", ["With a tenant: export your VM's hardware hash (Get-WindowsAutopilotInfo) and import it", "Create a deployment profile and reset the VM to test Autopilot", "Without a tenant: Microsoft Learn MD-102 module 'Enroll devices' and draw the Autopilot flow"]]
  ], quiz: [
    ["Zero-touch setup of a new Windows PC from the cloud:", ["WDS", "Windows Autopilot", "MDT", "Sysprep only"], 1],
    ["Personal phones usually enrol through...", ["Autopilot", "Company Portal", "Group Policy", "WDS"], 1],
    ["The Enrollment Status Page shows...", ["Mail flow", "Setup progress of apps and policies", "Sign-in logs", "Licences"], 1]
  ]},
  { id: "policies", title: "Compliance and configuration", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Configuration profiles set how a device should be; compliance policies check whether it is safe enough to access company data."],
    ["parts", [["Configuration profile", "Wi-Fi, VPN, BitLocker, restrictions, settings catalog (thousands of settings)"],
      ["Compliance policy", "Encryption on, minimum OS version, PIN, Defender running"],
      ["Endpoint security", "Antivirus, firewall, disk encryption, attack surface reduction"],
      ["Update rings / feature updates", "When Windows updates install and which version devices run"]]],
    ["part", "2", "Go deeper"],
    ["h", "Assignments"],
    ["p", "Policies are assigned to groups of users or devices. Use filters (for example 'only Windows 11 company devices') to target precisely. Conflicting settings from two policies show as 'Conflict' in the report."],
    ["h", "Troubleshooting a non-compliant device"],
    ["steps", ["Intune admin center > Devices > the device > Device compliance: which setting failed", "On the PC: Settings > Accounts > Access work or school > Info > Sync", "Check the last check-in time", "Event Viewer: Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider"]],
    ["part", "3", "Practice"],
    ["steps", ["Create a compliance policy requiring BitLocker and assign it to a test group", "Watch a device become non-compliant and then compliant", "Write the 'my laptop is not compliant' KB article"]]
  ], quiz: [
    ["Checks whether a device is safe enough:", ["Configuration profile", "Compliance policy", "App protection policy", "Update ring"], 1],
    ["Where on the PC do you force an Intune sync?", ["Control Panel > Sync", "Settings > Accounts > Access work or school > Info > Sync", "gpupdate /force", "Task Manager"], 1],
    ["Two policies set the same setting differently. Intune shows...", ["Success", "Conflict", "Pending forever", "Nothing"], 1]
  ]},
  { id: "apps", title: "Apps, updates and remote actions", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Intune installs and updates software, keeps Windows patched, and can lock, wipe or retire a device remotely."],
    ["h", "App types"],
    ["parts", [["Microsoft 365 Apps", "Built-in app type for Office"], ["Microsoft Store (new)", "Store apps via winget"], ["Win32 (.intunewin)", "Any installer packaged with the Content Prep Tool"], ["Line-of-business", "MSI, APPX, iOS/Android packages"]]],
    ["part", "2", "Go deeper"],
    ["h", "Remote actions"],
    ["parts", [["Sync", "Ask the device to check in now"], ["Restart", "Remote reboot"], ["Fresh start", "Reinstall Windows, remove OEM apps"],
      ["Retire", "Remove company data and management, keep personal data (BYOD)"], ["Wipe", "Factory reset (company devices)"], ["BitLocker key rotation", "New recovery key after it was shown to someone"]]],
    ["h", "App protection (MAM)"],
    ["p", "On personal phones, app protection policies stop users copying company data from Outlook or Teams into private apps and allow wiping only company data."],
    ["part", "3", "Practice"],
    ["steps", ["Deploy 7-Zip as a Win32 app or from the Store and check install status", "Create an update ring with a 7-day deferral for a pilot group", "Explain wipe vs retire with one real example each"]]
  ], quiz: [
    ["Remove company data from a private phone but keep photos:", ["Wipe", "Retire", "Fresh start", "Restart"], 1],
    ["Packaging any .exe installer for Intune uses...", ["Win32 app with .intunewin", "Group Policy", "WDS", "Sysprep"], 0],
    ["Stop copying company mail text into WhatsApp on BYOD:", ["App protection policy", "Update ring", "Conditional Access only", "DKIM"], 0]
  ]}
  ]}
]);
