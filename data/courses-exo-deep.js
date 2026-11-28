/* Exchange Online depth road (backlog: Depth programme, item "Microsoft 365 / Exchange Online", part 1 of 2).
   Adds 3 Foundation modules, 4 Professional deep dives, a casebook, 2 Senior modules, a capstone lab and 10 interview questions
   to the "exchange" course, marks the existing modules with their level and puts everything in road order.
   Progress keys use the module id, so reordering keeps everyone's progress.
   Facts checked on Microsoft Learn / Microsoft Tech Community, 28 Nov 2026:
   - Exchange Online limits: 10,000 recipients per day, 30 messages per minute, 500 recipients per message (1 to 1000 customisable),
     receiving limit 3,600 messages per hour; mailbox 50 GB (Plan 1) / 100 GB (Plan 2); archive up to 1.5 TB with auto-expanding
     archiving (Plan 2 or Plan 1 + Exchange Online Archiving); Recoverable Items 30 GB, 100 GB on hold.
   - Tenant External Recipient Rate Limit (TERRL) scales with licences; NDR 550 5.7.233.
   - Get-MessageTraceV2 replaces Get-MessageTrace: 90 days of data, 10 days per query, up to 5000 results, 100 queries per 5 minutes.
   - EWS in Exchange Online: phased disablement from October 2026 (EwsEnabled $null becomes $false on 1 Oct 2026 unless set),
     permanent shutdown from 1 April 2027. Exchange Server on premises is not affected.
   - SMTP AUTH Basic authentication: the June 2025 plan said March to April 2026; the January 2026 update replaced it with new milestones
     and a final removal date to be announced in the second half of 2027. Sources disagree, so the content says "check the current post".
   - Exchange Server 2016 and 2019 end of support 14 Oct 2025; Exchange Server SE is the supported version; hybrid rich coexistence
     needs the dedicated Exchange hybrid app (shared service principal blocked for EWS since 31 Oct 2025). */
(function () {
  const c = (window.COURSES || []).find((x) => x.id === "exchange");
  if (!c) return;
  c.hours = 24;
  c.short = "From the first 'my mail is gone' ticket to hybrid exit: mailboxes, permissions, Outlook, mail flow, SPF/DKIM/DMARC, message trace and NDR codes, retention and holds, hybrid and migration, security hardening, a capstone lab and interview practice.";

  const lvl = { recipients: "Foundation", mailflow: "Professional", outlook: "Professional" };
  c.modules.forEach((m) => { if (lvl[m.id] && !m.level) m.level = lvl[m.id]; });

  const mods = [

  { id: "exointro", title: "What Exchange Online is and how one email travels", level: "Foundation", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Exchange Online is the mail and calendar server of Microsoft 365, run by Microsoft in its data centres. You do not patch it or buy disks for it, but you still own the configuration: who has which mailbox, who may read what, which mail gets in and which mail goes out."],
    ["eg", "Think of a large post office that Microsoft runs for you. Microsoft owns the building, the sorting machines and the trucks. You decide who gets a letterbox, who has a key to which box, what the house rules for parcels are, and you are the one the customers call when a letter is missing."],
    ["h", "The five parts you meet every day"],
    ["parts", [["Mailboxes and recipients", "User, shared, room and equipment mailboxes, groups and contacts"], ["Clients", "Outlook for Windows (classic and new), Outlook on the web, Outlook mobile, Teams calendar"],
      ["Mail flow", "How mail enters and leaves: MX record, Exchange Online Protection, connectors, rules"], ["Protection", "Spam, phishing and malware filters; Defender for Office 365 on top"],
      ["Compliance", "Retention, holds, audit and eDiscovery, managed in Microsoft Purview"]]],
    ["svg", "mail", "One external email: DNS, Exchange Online Protection, then the mailbox"],
    ["part", "2", "Go deeper"],
    ["h", "The journey of one email from outside"],
    ["steps", ["A partner sends to anna@contoso.de. Their server asks DNS for the MX record of contoso.de", "The MX points to contoso-de.mail.protection.outlook.com, so the mail goes to Exchange Online Protection (EOP)", "EOP checks the connection (IP reputation), then SPF, DKIM and DMARC of the sender, then spam, phishing and malware", "Mail flow rules run (for example the [External] tag)", "The message lands in Anna's Inbox, in Junk, or in quarantine", "Outlook gets a notification and shows the mail within seconds"]],
    ["h", "Where you manage it"],
    ["parts", [["Exchange admin center (admin.exchange.microsoft.com)", "Mailboxes, groups, mail flow, message trace, connectors"], ["Microsoft Defender portal (security.microsoft.com)", "Anti-spam and anti-phishing policies, quarantine, DKIM, restricted users"],
      ["Microsoft Purview portal", "Retention, holds, eDiscovery, audit"], ["Microsoft 365 admin center", "Users, licences, service health"], ["Exchange Online PowerShell", "Everything, in bulk, and things the portals do not show"]]],
    ["tip", "When someone says 'Exchange is down', open Service health in the Microsoft 365 admin center first. Microsoft posts incidents there, often before the users notice."],
    ["warn", "Exchange Online is not a backup. Deleted items are kept for a limited time only (14 days by default, up to 30). Long-term protection comes from retention policies, not from Microsoft's data centres."],
    ["part", "3", "Practice"],
    ["steps", ["Look up the MX record of your own or a test domain with Resolve-DnsName -Type MX", "In a trial tenant open the Exchange admin center and find Recipients, Mail flow and Reports", "Open the Defender portal and find the anti-spam policies and the quarantine"]],
    ["cmd", "Resolve-DnsName contoso.de -Type MX\n\nName        Type TTL  Section NameExchange                               Preference\n----        ---- ---  ------- ------------                               ----------\ncontoso.de  MX   3600 Answer  contoso-de.mail.protection.outlook.com     0", "The MX record sends mail for contoso.de to Exchange Online Protection"],
    ["done", ["I can explain the path of an external email in six steps", "I know which portal does what", "I found the MX record of a domain"]],
    ["sum", ["Microsoft runs the servers, you own the configuration", "MX points to EOP, EOP filters, then the mailbox", "EAC for mail, Defender for protection, Purview for compliance", "Deleted items are not a backup"]]
  ], quiz: [
    ["Which DNS record decides where mail for your domain is delivered?", ["SPF", "MX", "DKIM", "PTR"], 1],
    ["Where do you release a quarantined message?", ["Microsoft Defender portal", "Teams admin center", "Intune", "Entra ID"], 0],
    ["Retention and litigation holds are managed in...", ["Microsoft Purview", "Outlook", "The MX record", "Windows Server"], 0],
    ["By default, deleted items can be recovered for...", ["24 hours", "14 days", "1 year", "Forever"], 1]
  ]},

  { id: "exodesk", title: "Service desk mail tickets: the ten you will see every week", level: "Foundation", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Most mail tickets are the same ten problems. If you know the cause, the first check and the fix for each one, you close them in minutes and escalate the rest with a clean note."],
    ["h", "The first three questions, always"],
    ["steps", ["Does it work in Outlook on the web (outlook.office.com)? If yes, the problem is the client, not the mailbox", "Only you, or colleagues too? One user is a user problem, many users is a service or configuration problem", "For missing mail: who is the sender, who is the recipient, and roughly when? Without these three you cannot trace"]],
    ["part", "2", "Go deeper"],
    ["h", "The ten tickets"],
    ["parts", [["'I cannot see the shared mailbox'", "Check Full Access; automapping can take up to an hour; access via a group does not automap"],
      ["'I cannot send as info@'", "Send As missing, or the user picked the address but has only Send on Behalf"],
      ["'A mail from a customer never arrived'", "Message trace; then Junk, quarantine, Inbox rules, Focused Inbox 'Other'"],
      ["'My mailbox is full'", "Check size; turn on the archive; a retention tag moves old mail to the archive"],
      ["'I deleted a mail by mistake'", "Deleted Items, then 'Recover items deleted from this folder'"],
      ["'Outlook keeps asking for my password'", "Credential Manager, MFA not completed, broken profile; see the Outlook module"],
      ["'Please set my out of office' (user is ill)", "Only with a manager's request; Set-MailboxAutoReplyConfiguration"],
      ["'The meeting room does not accept my booking'", "Room calendar processing: AutoAccept, booking window, conflicts, delegates"],
      ["'Please forward my mail to my private address'", "Usually blocked by policy (external auto-forward is off by default); explain and decline"],
      ["'I get strange bounce messages'", "Read the NDR code; maybe the account sends spam; see message trace and NDR module"]]],
    ["h", "Commands for the service desk"],
    ["cmd", "Get-EXOMailboxStatistics anna | Select DisplayName, ItemCount, TotalItemSize", "How big a mailbox is"],
    ["cmd", "Enable-Mailbox anna -Archive", "Turn on the online archive"],
    ["cmd", "Set-MailboxAutoReplyConfiguration anna -AutoReplyState Enabled -InternalMessage \"Ich bin bis 05.12. nicht im Büro.\" -ExternalMessage \"I am out of the office until 5 Dec.\"", "Set out of office for a user (with approval)"],
    ["cmd", "Get-InboxRule -Mailbox anna | Select Name, Enabled, ForwardTo, RedirectTo, DeleteMessage", "Inbox rules that forward or delete mail, a classic cause of 'mail disappears' and a sign of a hacked account"],
    ["cmd", "Set-CalendarProcessing room-berlin-1 -AutomateProcessing AutoAccept -AllowConflicts $false", "Room mailbox accepts bookings automatically and refuses double bookings"],
    ["tip", "A ticket note that a colleague can continue: 'OWA works, Outlook not. Same for 1 user only. Cleared Credential Manager, new profile created, Outlook syncs. User confirmed. Closed.'"],
    ["warn", "Hidden Inbox rules that delete or forward mail are a typical sign of a compromised account. If you find one the user did not create, do not just delete it: treat it as a security incident and escalate."],
    ["h", "German for the phone"],
    ["parts", [["Funktioniert es in Outlook im Browser?", "Does it work in Outlook on the web?"], ["Wer hat die Mail geschickt und wann ungefähr?", "Who sent the mail and roughly when?"], ["Ich habe Ihnen Vollzugriff auf das Postfach gegeben.", "I have given you full access to the mailbox."], ["Das kann bis zu einer Stunde dauern.", "That can take up to an hour."]]],
    ["part", "3", "Practice"],
    ["steps", ["Create a shared mailbox, give a test user Full Access, and time how long automapping takes", "Create an Inbox rule in a test mailbox that moves mail to a folder, then find it with Get-InboxRule", "Set out of office for a test user with PowerShell and check it in Outlook on the web", "Write a one-line ticket note for each of the ten tickets"]],
    ["done", ["I can name the first check for all ten tickets", "I always ask: OWA, scope, sender/recipient/time", "I know when a ticket becomes a security incident"]],
    ["sum", ["OWA works = client problem", "Sender, recipient, time before tracing", "Group access does not automap", "Unknown forwarding rules = possible compromise"]]
  ], quiz: [
    ["Mail works in Outlook on the web but not in Outlook. First conclusion?", ["The mailbox is broken", "The problem is on the client side", "The MX record is wrong", "The licence expired"], 1],
    ["A user found an Inbox rule forwarding all mail to an unknown Gmail address. You...", ["Delete it and close the ticket", "Treat it as a possible compromise and escalate", "Ignore it", "Turn off the archive"], 1],
    ["Which cmdlet turns on the online archive?", ["Enable-Mailbox -Archive", "Set-Mailbox -Archive", "New-Archive", "Start-ManagedFolderAssistant"], 0],
    ["To trace a missing mail you need...", ["Only the subject", "Sender, recipient and rough time", "The user's password", "The IP of the PC"], 1]
  ]},

  { id: "exoclients", title: "How Outlook finds and talks to the mailbox", level: "Foundation", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Outlook does not 'just know' where your mailbox is. It asks Autodiscover, signs in with modern authentication through Entra ID, gets a token, and then syncs a local copy (the OST). Every Outlook problem breaks one of these steps."],
    ["steps", ["Discover: Autodiscover tells Outlook which server and settings belong to anna@contoso.de", "Authenticate: Outlook signs in through Entra ID (password, MFA, Conditional Access) and gets an access token", "Connect: classic Outlook uses MAPI over HTTP; new Outlook and Outlook on the web use the cloud service directly", "Sync: classic Outlook keeps a cached copy in an OST file; the new Outlook keeps much less locally"]],
    ["part", "2", "Go deeper"],
    ["h", "Classic Outlook and the new Outlook"],
    ["parts", [["Classic Outlook for Windows", "Full desktop app, OST cache, COM add-ins, PST support; still the most used in German offices"], ["New Outlook for Windows", "Built on Outlook on the web; web add-ins only, no COM add-ins; settings sync with the cloud"],
      ["Outlook on the web (OWA)", "Your test tool: if it works there, the mailbox and the service are fine"], ["Outlook mobile", "Uses its own Microsoft cloud sync; often controlled by Intune app protection"]]],
    ["h", "Modern authentication, in one picture"],
    ["p", "Basic authentication (sending a password every time) is switched off in Exchange Online for Outlook, ActiveSync, POP, IMAP, EWS and PowerShell. Outlook now gets an OAuth token from Entra ID. That is why MFA and Conditional Access work, and also why a broken token cache can cause endless password prompts."],
    ["h", "Where things go wrong"],
    ["parts", [["Autodiscover", "Wrong or old DNS record, a leftover on-premises Exchange answering first"], ["Authentication", "MFA not finished, Conditional Access blocks the device, password changed"], ["Connection", "Proxy, VPN or firewall blocks Microsoft 365 endpoints"], ["OST", "Damaged or huge cache: slow, crashes, folders out of date"]]],
    ["cmd", "Resolve-DnsName autodiscover.contoso.de -Type CNAME\n\nName                     Type  TTL  Section NameHost\n----                     ----  ---  ------- --------\nautodiscover.contoso.de  CNAME 3600 Answer  autodiscover.outlook.com", "The Autodiscover record of a cloud-only company points to Microsoft"],
    ["tip", "Hold Ctrl and right-click the Outlook icon in the system tray: 'Test E-mail AutoConfiguration' shows which Autodiscover URL answered, and 'Connection Status' shows each connection and its state."],
    ["warn", "A company that moved to Exchange Online but still has an old Exchange server on the network may see Outlook find the old server first. Autodiscover lookups inside the domain can ask Active Directory (SCP record) before DNS."],
    ["part", "3", "Practice"],
    ["steps", ["Run Test E-mail AutoConfiguration in Outlook and read the log tab", "Open Connection Status and note the protocol and server names", "Find your OST file (%localappdata%\\Microsoft\\Outlook) and its size", "Open the same mailbox in Outlook on the web and in the new Outlook and compare"]],
    ["done", ["I can name the four steps: discover, authenticate, connect, sync", "I can tell classic and new Outlook apart", "I know what Autodiscover and the OST are for"]],
    ["sum", ["Autodiscover finds the mailbox", "Entra ID gives the token, MFA and CA apply", "Classic Outlook caches in an OST", "OWA is the test that the mailbox is fine"]]
  ], quiz: [
    ["Which service tells Outlook where the mailbox is?", ["DHCP", "Autodiscover", "SMTP", "DKIM"], 1],
    ["The local cache of classic Outlook is the...", ["PST", "OST", "EML", "MSG"], 1],
    ["COM add-ins work in...", ["New Outlook", "Classic Outlook", "Outlook on the web", "Outlook mobile"], 1],
    ["Endless password prompts in Outlook today are usually about...", ["Modern auth tokens, MFA or Conditional Access", "The MX record", "Mailbox size", "DMARC"], 0]
  ]},

  { id: "exoauth", title: "SPF, DKIM and DMARC in depth: proving who sent a mail", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "SMTP itself trusts anybody: any server can write 'From: ceo@contoso.de'. SPF, DKIM and DMARC are three DNS-based checks that let a receiver decide whether a mail really comes from the domain it claims."],
    ["parts", [["SPF", "'These IP addresses may send mail for my domain.' Checks the envelope sender (Return-Path)"], ["DKIM", "'Every mail I send carries a signature; the public key is in my DNS.' Survives forwarding"], ["DMARC", "'The visible From domain must match SPF or DKIM, and here is what to do if it does not.' Plus reports"]]],
    ["eg", "SPF is the list of couriers allowed to carry your letters. DKIM is your wax seal on every letter. DMARC is the note to every post office: 'if the seal is missing and the courier is not on my list, throw it away and tell me'."],
    ["part", "2", "Go deeper"],
    ["h", "SPF: the rules that break it"],
    ["cmd", "Resolve-DnsName contoso.de -Type TXT | Where-Object Strings -like \"v=spf1*\"\n\nStrings : {v=spf1 include:spf.protection.outlook.com include:_spf.newsletter-tool.example -all}", "One SPF record that allows Microsoft 365 and a newsletter service"],
    ["steps", ["Only one SPF record per domain. Two records = SPF permerror = fail", "At most 10 DNS lookups (each include, a, mx, redirect counts, nested ones too). Too many = permerror", "-all (hard fail) or ~all (soft fail) at the end; never +all", "SPF checks the Return-Path domain, not the From address the user sees. That is why DMARC is needed"]],
    ["h", "DKIM in Microsoft 365"],
    ["p", "Microsoft signs mail for the onmicrosoft.com domain automatically. For your own domain you publish two CNAME records (selector1 and selector2) that the Defender portal shows you, then switch DKIM signing on. Two selectors let Microsoft rotate keys without downtime."],
    ["cmd", "Get-DkimSigningConfig | Select Domain, Enabled, Status\n\nDomain       Enabled Status\n------       ------- ------\ncontoso.de   True    Valid", "DKIM is on and the DNS records are correct"],
    ["tip", "Always copy the exact CNAME values from the Defender portal or from Get-DkimSigningConfig (Selector1CNAME, Selector2CNAME). The format for new domains has changed over time, so old blog posts may show the wrong value."],
    ["h", "DMARC: alignment and the rollout plan"],
    ["cmd", "_dmarc.contoso.de  TXT  \"v=DMARC1; p=none; rua=mailto:dmarc@contoso.de; pct=100\"", "Start: monitor only, send aggregate reports"],
    ["steps", ["Week 1 to 4: p=none, collect rua reports, find every service that sends as your domain (CRM, newsletter, ticket tool, scanner)", "Fix each one: add it to SPF, or better, let it DKIM-sign with your domain", "Move to p=quarantine, then p=reject when the reports are clean", "Keep watching reports: new SaaS tools appear all the time"]],
    ["p", "Alignment means the domain in the visible From matches the SPF domain (Return-Path) or the DKIM d= domain. A newsletter tool can pass SPF for its own domain and still fail DMARC for yours."],
    ["p", "Large mailbox providers now require SPF, DKIM and DMARC from bulk senders (Google and Yahoo since 2024, Microsoft for Outlook.com consumer mailboxes since 2025). A company without them sees more and more mail in the customers' junk folders."],
    ["h", "Reading the result in a header"],
    ["cmd", "Authentication-Results: spf=pass (sender IP is 40.107.x.x) smtp.mailfrom=contoso.de;\n dkim=pass (signature was verified) header.d=contoso.de;\n dmarc=pass action=none header.from=contoso.de;\n compauth=pass reason=100", "All three checks passed; compauth is Microsoft's combined verdict"],
    ["warn", "Do not jump to p=reject on day one. You will silently block your own invoices, password reset mails from the web shop and the HR tool, and you will find out from angry customers."],
    ["part", "3", "Practice"],
    ["steps", ["Read the SPF record of three companies and count the DNS lookups", "Send a mail from a test tenant to a Gmail address and read Authentication-Results in 'Show original'", "Paste a message header into the Microsoft Message Header Analyzer and find spf, dkim, dmarc and compauth", "Write a DMARC rollout plan for a company with a CRM and a newsletter tool"]],
    ["done", ["I can explain alignment in two sentences", "I know the two SPF rules that break it", "I can read Authentication-Results", "I have a safe DMARC rollout plan"]],
    ["sum", ["SPF = allowed IPs, max 10 lookups, one record", "DKIM = signature, two selectors in M365", "DMARC = alignment + policy + reports", "none, then quarantine, then reject"]]
  ], quiz: [
    ["A domain has two SPF TXT records. The result is...", ["Both are merged", "SPF permerror (treated as fail)", "Only the first counts", "Nothing changes"], 1],
    ["DMARC passes when the From domain aligns with...", ["SPF or DKIM", "Only MX", "Only PTR", "The display name"], 0],
    ["Why does Microsoft 365 use two DKIM selectors?", ["One for inbound, one for outbound", "To rotate keys without downtime", "For IPv4 and IPv6", "Because SPF needs it"], 1],
    ["Safe first DMARC policy for a new rollout:", ["p=reject", "p=none with rua reports", "p=quarantine pct=100", "No DMARC record"], 1]
  ]},

  { id: "exotrace", title: "Message trace, headers and NDR codes: proof instead of guessing", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "When a mail is 'lost' there are only four places it can be: never sent, rejected (an NDR came back), filtered (Junk or quarantine), or delivered and then moved by a rule or a person. Message trace tells you which, in minutes."],
    ["part", "2", "Go deeper"],
    ["h", "Message trace in the new EAC and in PowerShell"],
    ["p", "Message trace in the Exchange admin center searches the last 90 days. In PowerShell, Get-MessageTraceV2 replaces the old Get-MessageTrace: it also covers 90 days, but returns at most 10 days per query and up to 5000 results, and Microsoft throttles it at 100 queries in 5 minutes. Times are in UTC, which is one or two hours behind German time."],
    ["cmd", "Get-MessageTraceV2 -SenderAddress rechnung@lieferant.example -RecipientAddress anna@contoso.de -StartDate (Get-Date).AddDays(-3) -EndDate (Get-Date)\n\nReceived            SenderAddress               RecipientAddress  Subject          Status\n--------            -------------               ----------------  -------          ------\n27.11.2026 07:14:02 rechnung@lieferant.example  anna@contoso.de   Rechnung 4711    Quarantined", "The invoice was quarantined, not lost"],
    ["cmd", "Get-MessageTraceV2 -MessageTraceId <id> -RecipientAddress anna@contoso.de | Get-MessageTraceDetailV2 | Select Date, Event, Detail", "Every step of one message: Receive, Spam, Quarantine, Deliver, and why"],
    ["h", "Status values and what to do next"],
    ["parts", [["Delivered", "It reached the mailbox. Look for Inbox rules, Focused Inbox, a delegate or the user moving it"], ["Failed", "Open the detail: an NDR with a code was sent to the sender"], ["Quarantined", "Release it in the Defender portal if it is safe; tune the policy or report a false positive"],
      ["Filtered as spam", "It went to Junk. Check the SCL and the reason in the detail"], ["Pending", "Retrying, often a problem on the other side; wait and check again"], ["Expanded", "Sent to a distribution group; trace each member"]]],
    ["h", "NDR codes you must know"],
    ["parts", [["550 5.1.1 / 5.1.10", "Recipient not found: typo, deleted user, wrong address in the sender's autocomplete"], ["550 5.2.2", "Recipient mailbox is full"], ["550 5.7.1", "Not allowed: restricted group, moderation, or a rule blocks the sender"],
      ["550 5.4.1", "Recipient address rejected: Access denied. Directory-Based Edge Blocking: the address does not exist in your tenant"], ["550 5.7.23", "SPF failed for the sending domain"], ["550 5.7.509", "DMARC failed and the sender domain has p=reject"],
      ["550 5.1.8", "Bad outbound sender: the account was blocked for sending spam (see Restricted entities)"], ["550 5.7.233", "The tenant exceeded its daily limit for external recipients"], ["4.4.7", "Message expired: the receiving server did not answer for too long"]]],
    ["h", "Reading a header from the bottom up"],
    ["p", "Every server adds a Received line at the top, so the oldest hop is at the bottom. Read from the bottom to see where the mail started and where it waited. Big time jumps between two Received lines show where the delay was. X-Forefront-Antispam-Report shows the SCL (spam confidence level) and the filter verdict."],
    ["tip", "Paste headers into the Message Header Analyzer (Microsoft Remote Connectivity Analyzer site, or the Message Header Analyzer add-in). It converts the times and shows the delay per hop."],
    ["warn", "A 5.1.8 means one of your users is sending spam, almost always because the account is compromised. Reset the password, revoke sessions, check Inbox rules and MFA methods, then ask security to release the user from Restricted entities."],
    ["part", "3", "Practice"],
    ["steps", ["Send a mail to a non-existing address in your tenant and read the NDR", "Trace it in the EAC and in PowerShell and compare the output", "Open the header of a newsletter in your own mailbox and find the first and last Received line", "Write a decision table: status value, next step, who owns it"]],
    ["done", ["I can trace a mail in the EAC and with Get-MessageTraceV2", "I know the nine NDR codes above", "I can find the delay in a header"]],
    ["sum", ["Four places a mail can be: not sent, rejected, filtered, moved", "Get-MessageTraceV2: 90 days, 10 days per query", "Times in UTC", "5.1.8 = compromised sender, act fast"]]
  ], quiz: [
    ["Which cmdlet replaces Get-MessageTrace?", ["Get-MessageTraceV2", "Search-MessageTrackingLog", "Get-MailTrace", "Trace-Message"], 0],
    ["A sender gets 550 5.1.1. Most likely cause?", ["Mailbox full", "Recipient address does not exist", "SPF fail", "Tenant limit"], 1],
    ["NDR 550 5.1.8 for one of your users means...", ["The user's mailbox is full", "The account was blocked for sending spam", "DKIM is off", "The MX record is missing"], 1],
    ["In a message header, the oldest Received line is...", ["At the top", "At the bottom", "In the subject", "Not shown"], 1]
  ]},

  { id: "exocomp", title: "Retention, holds, audit and eDiscovery", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A company must keep some mail for years (in Germany, business letters and invoices are kept for 6 or 10 years under HGB and AO) and must delete other data when it is no longer needed (GDPR). Exchange Online does both with retention in Microsoft Purview, holds for legal cases, and audit logs that show who did what."],
    ["tip", "German retention law is the company's decision with its tax adviser and data protection officer. Your job is to build what they decide and prove that it works. Do not invent retention periods yourself."],
    ["part", "2", "Go deeper"],
    ["h", "Where deleted mail really goes"],
    ["steps", ["User deletes: mail goes to Deleted Items", "User empties Deleted Items: mail goes to Recoverable Items (user can still restore it for 14 days by default, admin can set up to 30)", "Single item recovery (on by default) keeps even purged items for that period", "If the mailbox is on hold or under a retention policy, items stay in Recoverable Items until the retention period ends, even if the user purges them"]],
    ["parts", [["Recoverable Items quota", "30 GB, raised to 100 GB when the mailbox is on hold"], ["Archive", "50 GB with Plan 1; up to 1.5 TB with auto-expanding archive (Plan 2 or Plan 1 + Exchange Online Archiving)"]]],
    ["h", "Retention policies, labels and holds"],
    ["parts", [["Retention policy (Purview)", "Applies to whole locations: all mailboxes, or some. 'Keep 10 years, then delete'"], ["Retention label", "Applies to single items or folders; users or auto-apply rules set it. 'Invoice: keep 10 years'"],
      ["Litigation Hold", "Keeps everything in a mailbox, forever or for a time, for a legal case. Needs Exchange Online Plan 2 or the Archiving add-on"], ["eDiscovery hold", "Hold tied to a case in Purview eDiscovery, can use a query"],
      ["MRM retention tags (Exchange)", "Older Exchange feature, still used to move mail to the archive after N years"]]],
    ["cmd", "Set-Mailbox anna -LitigationHoldEnabled $true -LitigationHoldDuration 3650\nGet-Mailbox anna | Select LitigationHoldEnabled, LitigationHoldDuration, InPlaceHolds", "Put a mailbox on Litigation Hold for 10 years and check all holds on it"],
    ["p", "If you delete a user whose mailbox is on hold, the mailbox becomes an inactive mailbox: no licence, still searchable, kept until the hold ends. That is the right way to keep a leaver's mail for years."],
    ["h", "Audit: who did what"],
    ["p", "Mailbox auditing is on by default and records actions such as delegates sending mail, items being deleted, and owners signing in. Search it in Purview Audit or with Search-UnifiedAuditLog. Audit (Standard) keeps records for 180 days; longer needs Audit (Premium) licences."],
    ["cmd", "Search-UnifiedAuditLog -StartDate (Get-Date).AddDays(-7) -EndDate (Get-Date) -RecordType ExchangeAdmin -Operations Add-MailboxPermission | Select CreationDate, UserIds, AuditData", "Who granted mailbox permissions in the last week"],
    ["warn", "A hold keeps data but costs space. A mailbox on hold whose Recoverable Items folder reaches 100 GB stops accepting deletions and may stop working normally. Turn on the archive (auto-expanding) for mailboxes on long holds."],
    ["warn", "Retention policies with 'delete' actions really delete, across thousands of mailboxes, and cannot be undone. Use Preservation Lock only when legal asks for it in writing: after locking, nobody, not even a Global Administrator, can make the policy weaker."],
    ["part", "3", "Practice"],
    ["steps", ["Delete a test mail, purge it, then restore it from Recoverable Items", "Put a test mailbox on Litigation Hold, purge a mail, and find it with a Purview content search", "Create a retention label 'Rechnung, 10 Jahre' and publish it to a test mailbox", "Search the audit log for your own last mailbox permission change"]],
    ["done", ["I can explain where deleted mail goes, step by step", "I know the difference between a policy, a label and a hold", "I know what an inactive mailbox is", "I found an action in the audit log"]],
    ["sum", ["Deleted Items, Recoverable Items, then gone, unless on hold", "Policies for locations, labels for items, holds for cases", "Mailbox on hold + deleted user = inactive mailbox", "Audit Standard: 180 days"]]
  ], quiz: [
    ["The best way to keep a leaver's mail for years without a licence:", ["Export to PST on a USB stick", "Hold, then delete the user: inactive mailbox", "Forward it to the manager", "Keep the licence forever"], 1],
    ["Litigation Hold needs...", ["Exchange Online Plan 2 or the Archiving add-on", "Only Plan 1", "Teams Premium", "Intune"], 0],
    ["Recoverable Items quota on a mailbox on hold:", ["10 GB", "30 GB", "100 GB", "Unlimited"], 2],
    ["Who decides how long invoices must be kept?", ["The service desk", "The company with its tax adviser and legal", "Microsoft", "The user"], 1]
  ]},

  { id: "exohybrid", title: "Hybrid and migrations: moving mailboxes without losing a day", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Many German companies still have, or recently had, an Exchange Server in the basement. Hybrid connects it with Exchange Online so both look like one organisation: one address book, shared calendars (free/busy), and mailboxes that move to the cloud in the background while people keep working."],
    ["h", "Ways to get mail into Exchange Online"],
    ["parts", [["Cutover migration", "All mailboxes at once from an old Exchange; for small companies, one weekend"], ["Hybrid (remote move)", "The standard for companies with AD and Exchange: users moved in batches, Outlook reconfigures itself"],
      ["IMAP migration", "From any IMAP server (old hoster): mail only, no calendars or contacts"], ["Cross-tenant migration", "Company merger or carve-out: from one Microsoft 365 tenant to another"], ["Third-party tools", "Complex moves, public folders, many sources"]]],
    ["part", "2", "Go deeper"],
    ["h", "What hybrid needs"],
    ["steps", ["A supported Exchange Server: Exchange 2016 and 2019 reached end of support on 14 Oct 2025; Exchange Server Subscription Edition (SE) is the supported version", "Entra Connect or Cloud Sync, so users exist in both places with the same addresses", "The Hybrid Configuration Wizard (HCW): sets up connectors, organisation relationship, OAuth", "The dedicated Exchange hybrid app in Entra ID: since 31 Oct 2025 free/busy, MailTips and photos only work through it", "Public certificate and published endpoints (Classic hybrid) or the Hybrid Agent (Modern hybrid)"]],
    ["h", "A remote move, step by step"],
    ["steps", ["Create a migration batch in the EAC (or New-MigrationBatch) with 20 pilot users", "Exchange Online copies the mailbox in the background; users keep working", "The batch stops at 95 percent (if you choose manual completion)", "At the agreed time you complete the batch: the last changes are copied and the on-premises mailbox becomes a remote mailbox", "Outlook shows 'The administrator made a change, restart Outlook'; after restart it connects to the cloud"]],
    ["cmd", "Get-MigrationBatch | Select Identity, Status, TotalCount, SyncedCount, FailedCount\nGet-MigrationUser -BatchId Pilot1 | Get-MigrationUserStatistics | Select Identity, Status, PercentageComplete, Error", "Batch status and the users that failed"],
    ["h", "The usual failures"],
    ["parts", [["Bad items", "Corrupt items in the source mailbox; raise the bad item limit only after looking at them"], ["Too large items", "Single items bigger than the limit (150 MB) do not move"], ["Permissions across premises", "Full Access works across hybrid; Send As and folder delegation may need extra work; move teams together"],
      ["Wrong addresses", "Missing proxyAddresses or a missing mail.onmicrosoft.com address: the move fails"], ["Autodiscover", "Outlook still finds the on-premises server; check DNS and the SCP"]]],
    ["h", "After the last mailbox: can the server go?"],
    ["p", "If users are still synced from AD, Microsoft supports managing their mail attributes with the Exchange Management Tools and the Exchange Recipient Management PowerShell, without a running Exchange server. Only then can you switch the last server off. Simply turning it off without this plan leaves you unable to manage addresses in a supported way."],
    ["tip", "Move the people who share mailboxes and calendars in the same batch: assistants with their managers, a team with its team mailbox. This avoids most 'I cannot see my boss's calendar' tickets after the move."],
    ["warn", "Never remove Exchange from AD by uninstalling it while users are still synced and you have no recipient management plan. You lose the supported way to set mail attributes, and fixes become manual attribute editing."],
    ["part", "3", "Practice"],
    ["steps", ["Draw your company (or lab) as it would look in hybrid: AD, Entra Connect, Exchange SE, Exchange Online", "Write a migration plan for 200 users in 5 waves, with pilot, communication mail in German and English, and rollback", "In a test tenant, run an IMAP migration from a free test mailbox", "List the tickets you expect on the day after each wave and prepare KB answers"]],
    ["done", ["I can name four migration methods and when to use each", "I know what HCW and the dedicated hybrid app do", "I can read migration batch statistics", "I know why the last Exchange server is special"]],
    ["sum", ["Hybrid = one organisation across both", "Exchange SE is the supported on-premises version", "Move by batches, complete at a planned time", "Plan recipient management before removing the last server"]]
  ], quiz: [
    ["Which on-premises version is supported for hybrid after October 2025?", ["Exchange 2013", "Exchange 2016", "Exchange Server SE", "Exchange 2010"], 2],
    ["An IMAP migration moves...", ["Mail only", "Mail, calendar and contacts", "Only contacts", "Public folders"], 0],
    ["Why move a manager and the assistant in the same batch?", ["To save licences", "Delegation and shared calendars work best when both are on the same side", "Microsoft requires it", "It is faster"], 1],
    ["What should be in place before you remove the last Exchange server in a synced environment?", ["A recipient management plan (Management Tools / Recipient Management PowerShell)", "Nothing", "A new MX record", "A second tenant"], 0]
  ]},

  { id: "exocases", title: "Exchange Online casebook: six real incidents", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Real incidents never say 'configure DMARC'. They say 'the CEO's mails go to spam at our biggest customer'. Each case below: symptom, how to find the cause, fix, and how to stop it coming back."],
    ["part", "2", "Go deeper"],
    ["h", "Case 1: invoices go to customers' spam folders"],
    ["p", "Symptom: since Monday, three customers say invoices from the ERP land in Junk. Check: header of one invoice at the customer: dmarc=fail, spf=pass for the ERP provider's domain, no DKIM. Cause: the company moved DMARC to p=quarantine, but the ERP sends as rechnung@contoso.de through its own servers. Fix: set up DKIM signing for contoso.de in the ERP (or a subdomain like billing.contoso.de with its own SPF and DKIM). Prevent: read DMARC reports for 4 weeks before every policy step."],
    ["h", "Case 2: a user sends 4,000 mails at night"],
    ["p", "Symptom: the user gets NDR 550 5.1.8 in the morning. Message trace: thousands of mails to unknown external addresses between 02:00 and 03:00. Sign-in logs: a sign-in from abroad with a successful MFA prompt the user approved 'by mistake'. Inbox rule: everything with 'invoice' moved to RSS Feeds. Fix: revoke sessions, reset password, remove the rule and unknown MFA methods, release from Restricted entities after cleanup, report to security. Prevent: number matching, phishing-resistant MFA for admins, alerts on new Inbox rules."],
    ["h", "Case 3: the scanner stopped sending mail"],
    ["p", "Symptom: the multifunction printer cannot send scans. Check: the device uses SMTP AUTH with a username and password (Basic auth). Microsoft is retiring Basic auth for SMTP AUTH; the dates were moved several times (a plan for March to April 2026 was replaced in January 2026 by new milestones, with the final date to be announced in the second half of 2027), so always check the current Exchange team blog post. Fix options: device firmware with OAuth, a connector-based relay with the office's fixed public IP, or High Volume Email for internal-only mail. Prevent: list every device and app in the SMTP AUTH clients report."],
    ["h", "Case 4: the line-of-business app cannot read the mailbox any more"],
    ["p", "Symptom: from October 2026 the old CRM plug-in that files mails stops working. Cause: Exchange Web Services (EWS) is being retired in Exchange Online: phased disablement from October 2026, full shutdown from 1 April 2027. Check: EWS usage report in the Microsoft 365 admin center. Fix: vendor update that uses Microsoft Graph; until then an allow list for that app (only until April 2027). Prevent: an application inventory with the API each one uses."],
    ["h", "Case 5: free/busy between cloud and on-premises is gone"],
    ["p", "Symptom: cloud users see on-premises colleagues as 'no information'. Check: the Exchange servers still use the shared service principal. Cause: since 31 Oct 2025 hybrid free/busy needs the dedicated Exchange hybrid app and a supported build. Fix: update to Exchange SE, run the HCW or Microsoft's script to create the dedicated app, enable the setting override. Prevent: follow the Exchange team blog; hybrid changes are announced months ahead."],
    ["h", "Case 6: a manager's mail 'disappears'"],
    ["p", "Symptom: some mails are read and gone before the manager sees them. Message trace: Delivered. Audit log: MoveToDeletedItems by the assistant, who has Full Access and an Outlook rule in her own profile that processes the manager's mailbox. Fix: change the delegate setup (calendar delegate, not Full Access), remove the rule. Prevent: review Full Access permissions every quarter."],
    ["tip", "Pattern in all six: trace or header first, then the log that proves the cause (sign-in log, audit log, usage report), then the fix, then one change that stops it next time."],
    ["part", "3", "Practice"],
    ["steps", ["Pick two cases and write the ticket notes as you would in a real tool", "For case 2, write the list of containment steps in the right order", "For case 3, make a table of three fix options with pros and cons", "Tell case 1 in German in under two minutes"]],
    ["done", ["I can explain each case with symptom, proof, fix, prevention", "I know which log proves what", "I know the EWS and SMTP AUTH changes"]],
    ["sum", ["Spam at customers: check DMARC alignment of every sender", "5.1.8: compromised account, contain first", "Scanners: plan for the end of Basic SMTP AUTH", "EWS: Graph instead, April 2027 is final"]]
  ], quiz: [
    ["ERP invoices fail DMARC after p=quarantine. Best fix?", ["Remove DMARC", "Let the ERP DKIM-sign with your domain", "Add +all to SPF", "Ask customers to whitelist"], 1],
    ["Which report shows apps still using EWS?", ["EWS usage report in the Microsoft 365 admin center", "DHCP log", "Intune compliance", "Message trace"], 0],
    ["First step for a user blocked with 5.1.8 after a night of spam:", ["Release the user immediately", "Contain: revoke sessions, reset password, check rules and MFA", "Increase the sending limit", "Delete the mailbox"], 1],
    ["Hybrid free/busy stopped working in late 2025. Likely cause?", ["The MX record", "Missing dedicated Exchange hybrid app", "DMARC", "Mailbox size"], 1]
  ]},

  { id: "exosec", title: "Hardening Exchange Online like a senior admin", level: "Senior", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A mailbox is the key to everything: password resets, invoices, contracts. Attackers want mailboxes, so a senior admin removes old doors (legacy protocols), limits who and what can reach mail (RBAC, app scopes), and watches for the typical signs of abuse."],
    ["part", "2", "Go deeper"],
    ["h", "Close the old doors"],
    ["parts", [["POP and IMAP", "Turn off for everyone, enable only for named mailboxes that need it (Set-CASMailboxPlan, Set-CASMailbox)"], ["SMTP AUTH", "Off at tenant level (Set-TransportConfig -SmtpClientAuthenticationDisabled $true), on only per mailbox for devices that still need it"],
      ["EWS", "Retiring in Exchange Online (from October 2026, final 1 April 2027); set EwsEnabled on purpose and keep an allow list only for apps with a migration date"], ["Direct Send", "Anyone can send to your MX as your domain without authentication; Microsoft added a setting to reject it (Set-OrganizationConfig -RejectDirectSend $true). Test with printers and apps first"],
      ["External auto-forwarding", "Off by default in the outbound spam policy; allow only for named senders with a business reason"]]],
    ["cmd", "Get-CASMailbox -ResultSize Unlimited | Where-Object { $_.PopEnabled -or $_.ImapEnabled } | Select Name, PopEnabled, ImapEnabled\nGet-TransportConfig | Select SmtpClientAuthenticationDisabled", "Which mailboxes still have POP/IMAP, and is SMTP AUTH off at tenant level"],
    ["h", "Least privilege for people and apps"],
    ["parts", [["Exchange RBAC role groups", "Use Recipient Management or Help Desk for the service desk, not Exchange Administrator or Global Administrator"], ["Management scopes", "Limit a role to a set of mailboxes, for example only the Berlin office"],
      ["RBAC for Applications", "Give an app (service principal) Mail.Send or Mail.Read only for a scope of mailboxes, instead of the whole tenant"], ["PIM", "Exchange Administrator only when needed, with approval and a time limit"]]],
    ["cmd", "New-ServicePrincipal -AppId <app-id> -ObjectId <sp-object-id> -DisplayName \"Invoice robot\"\nNew-ManagementScope -Name \"Finance mailboxes\" -RecipientRestrictionFilter \"Department -eq 'Finance'\"\nNew-ManagementRoleAssignment -App <app-id> -Role \"Application Mail.Read\" -CustomResourceScope \"Finance mailboxes\"", "An app can read only Finance mailboxes, not the CEO's"],
    ["warn", "An app with tenant-wide Mail.Read in Graph can read every mailbox, including the board's. Ask every vendor which permission they need and scope it. Review app permissions in Entra ID every quarter."],
    ["h", "Detect abuse early"],
    ["steps", ["Alert on new Inbox rules that forward, delete or move to RSS Feeds or Archive", "Alert on new mailbox permissions (Full Access, Send As) and on new forwarding (ForwardingSmtpAddress)", "Watch Restricted entities and outbound spam alerts", "Turn on Defender for Office 365 Safe Links and Safe Attachments if licensed; use preset security policies (Standard or Strict) as the baseline", "Use admin accounts without a mailbox; admins read mail with their normal account"]],
    ["cmd", "Get-Mailbox -ResultSize Unlimited | Where-Object { $_.ForwardingSmtpAddress -or $_.ForwardingAddress } | Select Name, ForwardingSmtpAddress, DeliverToMailboxAndForward", "Find every mailbox with forwarding set by an admin or by the user in OWA"],
    ["h", "Scripts without passwords"],
    ["p", "The ExchangeOnlineManagement module (V3) uses REST and modern auth; the old Remote PowerShell was retired. For scheduled scripts use app-only authentication with a certificate (Connect-ExchangeOnline -AppId -CertificateThumbprint -Organization), never a stored admin password."],
    ["tip", "Microsoft's Configuration Analyzer in the Defender portal compares your protection policies with the Standard and Strict presets. A quick way to show a manager where the tenant stands."],
    ["part", "3", "Practice"],
    ["steps", ["In a test tenant, list all mailboxes with POP, IMAP or SMTP AUTH and write a plan to switch them off", "Find all mailboxes with forwarding and all Inbox rules that forward externally", "Create a scoped Help Desk role group that can only manage the Berlin mailboxes", "Connect to Exchange Online with a certificate and an app registration instead of a user"]],
    ["done", ["I can list the legacy doors and how to close them", "I can scope an app to a set of mailboxes", "I know the four signs of mailbox abuse", "My scripts use certificates, not passwords"]],
    ["sum", ["POP, IMAP, SMTP AUTH off by default, on by exception", "EWS: plan Graph before April 2027", "Scope people with RBAC, apps with RBAC for Applications", "Alert on rules, forwarding and permissions"]]
  ], quiz: [
    ["Best way to give a mail robot access to Finance mailboxes only:", ["Tenant-wide Mail.Read", "RBAC for Applications with a management scope", "Give it a Global Admin account", "Share the CEO's password"], 1],
    ["Which setting turns off SMTP AUTH for the whole tenant?", ["Set-TransportConfig -SmtpClientAuthenticationDisabled $true", "Set-Mailbox -Smtp $false", "Disable-SmtpAuth", "Remove-MX"], 0],
    ["A strong sign of a compromised mailbox:", ["A large archive", "A new rule that moves mail to RSS Feeds", "A room mailbox", "A DKIM key"], 1],
    ["Scheduled Exchange scripts should sign in with...", ["A stored admin password", "App-only auth with a certificate", "Basic auth", "The service desk account"], 1]
  ]},

  { id: "exoarch", title: "Designing mail for a company: routing, gateways and the road ahead", level: "Senior", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A senior admin is asked 'how should our mail work?' and must answer with a design: where the MX points, who filters, how apps send mail, how hybrid ends, and what breaks next year. Every choice has costs, and you must write them down."],
    ["part", "2", "Go deeper"],
    ["h", "Design decision 1: who filters inbound mail?"],
    ["parts", [["MX to Exchange Online Protection", "Simplest, best signal for Microsoft's filters, fewer moving parts. The default choice"], ["MX to a third-party gateway first", "Common in German companies (local vendor, archiving, encryption). You must turn on Enhanced Filtering for Connectors so EOP sees the real sender IP, or SPF and spoof checks break"],
      ["Centralized mail transport (hybrid)", "Cloud mail goes out through on-premises first. Only when compliance demands it; adds delay and a single point of failure"]]],
    ["h", "Design decision 2: how do apps and devices send?"],
    ["parts", [["Microsoft Graph sendMail with RBAC for Applications", "Modern, scoped, no passwords. Best for new apps"], ["SMTP relay via connector (fixed IP or certificate)", "For devices that cannot do OAuth; mail to internal and external"],
      ["High Volume Email", "Internal-only bulk mail (alerts, reports)"], ["Azure Communication Services Email", "Large volumes to external recipients, newsletters from apps"], ["SMTP AUTH with Basic auth", "Being retired; do not build anything new on it"]]],
    ["h", "Design decision 3: when does hybrid end?"],
    ["steps", ["All mailboxes moved, public folders moved or retired", "Mail routing no longer depends on on-premises (MX and outbound go directly to Exchange Online)", "Apps that relayed through Exchange on premises moved to the options above", "Recipient management plan in place (Management Tools / Recipient Management PowerShell), or users become cloud-only", "Then: remove the HCW connectors, update Autodiscover, decommission servers"]],
    ["h", "Design decision 4: limits that shape the design"],
    ["parts", [["10,000 recipients per day per mailbox, 30 messages per minute", "No newsletters from user mailboxes; use a service"], ["500 recipients per message (customisable 1 to 1000)", "Large lists via distribution groups (a group counts as one)"],
      ["Tenant External Recipient Rate Limit", "The whole tenant has a daily external limit that grows with licences; trial tenants are lower"], ["3,600 received messages per hour per mailbox", "A shared mailbox used by an app as a 'queue' can hit it"]]],
    ["h", "The road ahead (check dates on Microsoft's sites before you plan)"],
    ["parts", [["EWS in Exchange Online", "Phased disablement from October 2026, permanent shutdown from 1 April 2027"], ["Basic auth for SMTP AUTH", "Retirement announced; the timeline was changed in 2025 and again in January 2026; final date to be announced in the second half of 2027"],
      ["Exchange Server 2016 / 2019", "Out of support since 14 Oct 2025; Exchange Server SE is subscription-based"], ["New Outlook for Windows", "Microsoft is moving users to it step by step; COM add-ins must be replaced by web add-ins"]]],
    ["tip", "Write designs as decision records: context, options, decision, consequences. In two years nobody remembers why the MX points to a gateway, and your record saves the next admin a week."],
    ["warn", "A third-party gateway in front of EOP without Enhanced Filtering makes every mail look like it comes from the gateway's IP. SPF fails or is useless, spoof protection weakens, and real phishing gets through."],
    ["part", "3", "Practice"],
    ["steps", ["Write a decision record: 'MX to EOP or to our existing gateway?' for a 300-person Mittelstand company", "Make an inventory table of 8 typical senders (scanner, ERP, web shop, monitoring, HR tool, newsletter, ticket tool, backup software) and pick the sending method for each", "Draw the hybrid exit plan as a timeline with owners", "Present the design in 5 minutes to the KI tutor and ask it to play a sceptical IT manager"]],
    ["done", ["I can defend an inbound filtering design", "I can choose a sending method per app", "I know the steps to end hybrid", "I wrote one decision record"]],
    ["sum", ["MX to EOP unless there is a strong reason", "Gateway in front = Enhanced Filtering for Connectors", "Apps: Graph or connector, not Basic SMTP AUTH", "Write decisions down with their consequences"]]
  ], quiz: [
    ["MX points to a third-party gateway, then to EOP. What must you configure?", ["Enhanced Filtering for Connectors", "Nothing", "A second MX to Gmail", "Turn off DKIM"], 0],
    ["A new internal app must send alert mails to staff only. Good choice?", ["Basic SMTP AUTH", "High Volume Email or Graph with scoped permissions", "A personal mailbox with the password in the script", "POP3"], 1],
    ["Per-mailbox daily recipient limit in Exchange Online:", ["1,000", "10,000", "100,000", "Unlimited"], 1],
    ["Good format to document a design choice:", ["A chat message", "A decision record: context, options, decision, consequences", "A screenshot", "Nothing, it is obvious"], 1]
  ]},

  { id: "exocapstone", title: "Capstone lab: run mail for 'Kaffee & Co. GmbH'", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "You are the new admin of a small coffee roaster with 25 staff. Build and run their mail in a Microsoft 365 test tenant, end to end, and document it like a real handover. This is the project you show in an interview."],
    ["tip", "Use a free Microsoft 365 developer or trial tenant and a cheap test domain. Never use a real company's domain or real customer data in a lab."],
    ["part", "2", "Go deeper"],
    ["h", "Stage 1: foundation (day 1)"],
    ["steps", ["Add your test domain, create MX, SPF, Autodiscover; check with Resolve-DnsName", "Create 5 users, a shared mailbox info@, a room 'Röstraum' and a distribution list team@", "Give two users Full Access and Send As on info@; test automapping", "Set the room to AutoAccept without conflicts"]],
    ["h", "Stage 2: protect (day 2)"],
    ["steps", ["Turn on DKIM; publish DMARC with p=none and a rua address", "Apply the Standard preset security policy", "Create a mail flow rule that tags external mail [Extern]", "Turn off POP, IMAP and SMTP AUTH at tenant level"]],
    ["h", "Stage 3: operate (day 3)"],
    ["steps", ["Send test mail in and out; trace them with the EAC and Get-MessageTraceV2", "Cause three NDRs on purpose (unknown recipient, full mailbox via a low quota, restricted group) and document each code", "Create a retention label 'Rechnung, 10 Jahre' and a retention policy for all mailboxes", "Put one 'leaver' on Litigation Hold, then delete the user and find the inactive mailbox"]],
    ["h", "Stage 4: break and fix (day 4)"],
    ["steps", ["Create a hidden forwarding Inbox rule in one mailbox (your 'attacker'), then find it with your own detection script", "Write a PowerShell report: mailbox sizes, forwarding, POP/IMAP status, Full Access permissions, as CSV", "Move DMARC to p=quarantine after checking the reports", "Write a KB article in German and English: 'Geteiltes Postfach wird nicht angezeigt'"]],
    ["cmd", "Connect-ExchangeOnline\n$r = foreach ($m in Get-EXOMailbox -ResultSize Unlimited) {\n  $s = Get-EXOMailboxStatistics $m.UserPrincipalName\n  [pscustomobject]@{ Name = $m.DisplayName; Type = $m.RecipientTypeDetails; Size = $s.TotalItemSize; Forward = $m.ForwardingSmtpAddress }\n}\n$r | Export-Csv .\\mailbox-report.csv -NoTypeInformation -Encoding UTF8", "A start for the stage 4 report; add POP/IMAP and permissions yourself"],
    ["h", "Deliverables"],
    ["parts", [["Handover document", "DNS records, policies, mailboxes, who has which rights, and why"], ["Runbook", "The ten service desk tickets with steps for this tenant"], ["Scripts", "Your report and detection scripts in a GitHub repo, without tenant IDs or real names"], ["Lessons learned", "Three things that went wrong and what you changed"]]],
    ["warn", "Remove secrets before you push to GitHub: no tenant IDs, app secrets, certificate files or passwords. Use placeholders like <tenant-id>."],
    ["part", "3", "Practice"],
    ["steps", ["Do the four stages over four lab days", "Record a 3-minute screen video of stage 3 explaining what you see", "Ask the KI tutor to review your handover document like a senior admin", "Add the project to your CV as 'Exchange Online lab: build, secure, operate'"]],
    ["done", ["All four stages done and documented", "Three NDRs caused and explained", "Detection script found the hidden rule", "Repo pushed without secrets"]],
    ["sum", ["Build, protect, operate, break and fix", "Document like a handover", "Scripts beat clicks for reports", "No secrets in Git"]]
  ], quiz: [
    ["Where should a lab like this run?", ["The employer's production tenant", "A trial or developer test tenant with a test domain", "A customer's tenant", "Nowhere"], 1],
    ["DMARC in stage 2 starts with...", ["p=reject", "p=none and reports", "No record", "p=quarantine pct=100"], 1],
    ["Before pushing scripts to GitHub you remove...", ["Comments", "Tenant IDs, secrets and passwords", "Line breaks", "The README"], 1],
    ["The leaver on hold becomes, after deletion, ...", ["A shared mailbox", "An inactive mailbox", "A contact", "A PST file"], 1]
  ]},

  { id: "exointerview", title: "Exchange Online interview: 10 questions with model answers", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Interviewers for IT support and sysadmin jobs in Germany ask Exchange questions in two ways: 'what is X' and 'what do you do when Y'. Answer the second kind with a short structure: scope, check, cause, fix, prevent."],
    ["part", "2", "Go deeper"],
    ["h", "1. A customer says our mail never arrived. What do you do?"],
    ["p", "Ask sender, recipient and time. Run message trace. If Failed, read the NDR code; if Quarantined, check and release; if Delivered at their side, it is their filter. Share the proof, for example the trace or the NDR, with the customer."],
    ["h", "2. Full Access, Send As, Send on Behalf?"],
    ["p", "Full Access opens the mailbox; Send As sends as the mailbox itself; Send on Behalf shows 'Anna on behalf of Support'. Automapping only works for direct Full Access, not via a group."],
    ["h", "3. Explain SPF, DKIM and DMARC."],
    ["p", "SPF lists the servers allowed to send for a domain, DKIM signs each message with a key in DNS, DMARC requires the From domain to align with SPF or DKIM and tells receivers what to do on failure. I roll DMARC out from none to quarantine to reject based on reports."],
    ["h", "4. Outlook keeps asking for the password."],
    ["p", "Test OWA. If OWA works: check MFA and Conditional Access in the sign-in logs, clear Credential Manager, update Office, new profile. If many users: check service health and recent CA changes."],
    ["h", "5. A user's account sends spam. Steps?"],
    ["p", "Contain first: block sign-in or revoke sessions, reset the password, remove unknown MFA methods, Inbox rules and forwarding. Check the audit and sign-in logs for scope. Then release from Restricted entities and report it as a security incident."],
    ["h", "6. How do you keep a leaver's mail?"],
    ["p", "Convert to a shared mailbox if the team needs it and it is under 50 GB; for legal retention, put it on hold before deleting the user so it becomes an inactive mailbox. Never just export a PST to a USB stick."],
    ["h", "7. What is a mail flow rule, what is a connector?"],
    ["p", "A rule acts on messages (tag, block, copy, disclaimer). A connector defines how mail travels between Exchange Online and another system, such as a gateway, an on-premises server or a scanner relay."],
    ["h", "8. What changes in Exchange Online should an admin know about now?"],
    ["p", "EWS retirement (phased from October 2026, final 1 April 2027): apps must move to Microsoft Graph. Basic auth for SMTP AUTH is being retired, with a timeline that has changed several times, so devices need OAuth or a relay. Exchange 2016 and 2019 are out of support, so hybrid needs Exchange SE and the dedicated hybrid app."],
    ["h", "9. How would you migrate 300 mailboxes from Exchange on premises?"],
    ["p", "Hybrid with remote moves. Pilot batch, then waves with manual completion out of hours, moving teams and delegates together. Communication in German and English, a KB for day-one tickets, and a plan for public folders and the last server."],
    ["h", "10. How do you secure Exchange Online?"],
    ["p", "Legacy protocols off by default, preset security policies, DKIM and DMARC, no external auto-forwarding, least-privilege RBAC and scoped app permissions, alerts on rules, forwarding and permission changes, admin accounts without mailboxes, PIM."],
    ["h", "German phrases for the interview"],
    ["parts", [["Ich habe zuerst die Nachrichtenablaufverfolgung geprüft.", "I first checked the message trace."], ["Die Mail lag in der Quarantäne.", "The mail was in quarantine."], ["Das Konto war kompromittiert, deshalb habe ich die Sitzungen widerrufen.", "The account was compromised, so I revoked the sessions."], ["Wir haben DMARC schrittweise eingeführt.", "We introduced DMARC step by step."]]],
    ["part", "3", "Practice"],
    ["steps", ["Answer each question out loud in under 2 minutes; record yourself", "Add an example from your capstone lab to every answer", "Ask the KI tutor to interview you with these questions", "Answer questions 1 and 5 in German"]],
    ["done", ["I can answer all 10 without reading", "Each answer has a real example", "I practised two answers in German"]],
    ["sum", ["Scope, check, cause, fix, prevent", "Trace first, then talk", "Contain a compromised account before cleaning", "Know the current retirements: EWS, Basic SMTP AUTH, Exchange 2016/2019"]]
  ], quiz: [
    ["Good answer shape for 'what do you do when...' questions:", ["Scope, check, cause, fix, prevent", "Restart everything", "Call Microsoft first", "Say 'it depends' and stop"], 0],
    ["Automapping works when Full Access is given...", ["Via a group", "Directly to the user", "Via a mail contact", "Never"], 1],
    ["EWS in Exchange Online is fully shut down from...", ["1 April 2027", "1 January 2025", "It is not retired", "31 December 2030"], 0],
    ["'Die Mail lag in der Quarantäne' means...", ["The mail was in quarantine", "The mail was deleted", "The mail was forwarded", "The mail was encrypted"], 0]
  ]}
  ];

  mods.forEach((m) => { if (!c.modules.some((x) => x.id === m.id)) c.modules.push(m); });
  const order = ["exointro", "exodesk", "exoclients", "recipients", "outlook", "mailflow", "exoauth", "exotrace", "exocomp", "exohybrid", "exocases", "exosec", "exoarch", "exocapstone", "exointerview"];
  const rank = (m) => { const i = order.indexOf(m.id); return i < 0 ? order.length : i; };
  c.modules.sort((a, b) => rank(a) - rank(b));
})();
