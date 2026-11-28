/* Service desk simulator: ticket scenarios.
   imp: 1 one user, 2 team / sensitive, 3 many users or whole company.  urg: 1 can wait, 2 work affected, 3 cannot work / deadline.
   type: "incident" | "request".  kw: words a good short description or note should contain (lower case, any form).
   rounds: decisions. Each option: [text, points, feedback, effect]. Effects:
     "next" go to the next round | "resolve" fix at 1st level | "esc:<Group>" escalate with a note | "link" child of an open outage
     "pend:<minutes>" wait for the user, vendor or approver (the round's "reply" arrives later) | "stay" wrong, try again */
window.DESK = {
  categories: ["Account and access", "Email and Teams", "Hardware", "Software", "Network and VPN", "Printer", "Mobile device", "Security", "Request: access", "Request: hardware", "Request: software"],
  groups: ["Service Desk (1st level)", "Endpoint team", "Network team", "Server team", "M365 team", "IAM team", "Security team (SOC)", "Facilities"],
  tickets: [
  { id: "lock", from: "Jonas Becker", dept: "Sales", ch: "phone", subj: "cant login!!!", body: "Hi, Windows says my account is locked. I changed my password yesterday. I have a customer call in 30 minutes!",
    type: "incident", cat: "Account and access", imp: 1, urg: 3, kw: ["lock", "account", "password", "login", "sign"],
    why: "One user (impact low) who cannot work before a customer call (urgency high): P3.",
    rounds: [
      { q: "First step on the phone?", o: [
        ["Verify his identity with the callback procedure, then look at the account in AD", 10, "Right. Identity first, always, before you touch an account.", "next"],
        ["Unlock it right away, he sounds stressed", -5, "Never change an account before you know who is calling. Social engineering often uses time pressure.", "stay"],
        ["Tell him to wait until the lockout expires", -5, "He has a call in 30 minutes. Help him now.", "stay"]] },
      { q: "Identity confirmed. The account locks again 10 minutes after each unlock. Why?", o: [
        ["An old password is still saved somewhere: phone mail app, mapped drive or second PC. Check the lockout source (event 4740) and remove it", 10, "Exactly. A device with the old password keeps trying. Event 4740 on the PDC emulator names the caller computer.", "next"],
        ["Reset his password again", -5, "A new password does not stop the device that keeps using the old one.", "stay"],
        ["Disable the lockout policy for the domain", -10, "That weakens security for everyone to hide one user's problem.", "stay"]] },
      { q: "The caller is his phone (mail app with the old password). Now:", o: [
        ["Unlock the account, help him update the password on the phone, confirm he can sign in", 10, "Fixed at 1st level.", "resolve"],
        ["Escalate to the IAM team", -3, "This is a standard 1st-level fix, no escalation needed.", "stay"]] }
    ], res: "Old password saved in the phone mail app kept locking the account. Unlocked, updated the phone, user signed in." },

  { id: "outlook", from: "Petra Lang", dept: "Accounting", ch: "email", subj: "outlook problem", body: "Outlook closes as soon as I open it since this morning. I can still work in the browser for now.",
    type: "incident", cat: "Email and Teams", imp: 1, urg: 2, kw: ["outlook", "crash", "close", "start", "add-in"],
    why: "One user, workaround in the browser exists, so urgency medium: P4.",
    rounds: [
      { q: "What do you check first?", o: [
        ["Start Outlook in safe mode (outlook /safe) to test add-ins", 10, "Good test: safe mode loads no add-ins.", "next"],
        ["Recreate the mailbox in Exchange", -10, "The mailbox is fine: the browser works. Never touch the server for a client problem.", "stay"],
        ["Reinstall Office straight away", -3, "Too big a step first. Test cheaply before you reinstall.", "stay"]] },
      { q: "Safe mode works. Next?", o: [
        ["File > Options > Add-ins > COM add-ins: disable the PDF add-in updated yesterday, restart Outlook", 10, "That is the cause. Note the add-in name for problem management if more users report it.", "resolve"],
        ["Tell her to use the browser from now on", -5, "That is a workaround, not a fix.", "stay"]] }
    ], res: "PDF add-in updated yesterday crashed Outlook at start. Disabled the add-in, Outlook works." },

  { id: "vpn", from: "Maria Hoffmann", dept: "Marketing (home office)", ch: "chat", subj: "VPN not working", body: "VPN says error 809 since 07:30. My colleague Tim has the same problem at home.",
    type: "incident", cat: "Network and VPN", imp: 2, urg: 3, kw: ["vpn", "809", "home", "users", "firewall"],
    why: "Several home office users cannot work (impact medium-high, urgency high): P2. The office still works, so not P1.", parent: true,
    rounds: [
      { q: "Before you troubleshoot her laptop:", o: [
        ["Check the scope: monitoring, other tickets, the change calendar", 10, "Right. Her colleague has it too, and the change calendar shows a firewall change last night at 22:00.", "next"],
        ["Reinstall her VPN client", -5, "Two people have the same error at the same time. That points to a central cause, not her laptop.", "stay"]] },
      { q: "Many home users, firewall change last night. What now?", o: [
        ["Make this the parent incident and escalate to the Network team with the evidence", 10, "Yes. One parent ticket, the others are linked as children.", "esc:Network team"],
        ["Escalate to the Server team", -5, "VPN gateways and firewalls belong to the Network team.", "stay"],
        ["Tell users to come to the office and close the ticket", -10, "The service is still broken. Never close an open outage.", "stay"]] }
    ], res: "" },

  { id: "vpn2", from: "Tim Wagner", dept: "Marketing (home office)", ch: "email", subj: "VPN error", body: "Hello, I cannot connect to the VPN, error 809. Please help.",
    type: "incident", cat: "Network and VPN", imp: 2, urg: 3, kw: ["vpn", "809"], child: "vpn",
    why: "Same outage as the open VPN incident: same priority as the parent.",
    rounds: [
      { q: "This matches the open VPN outage. Best handling:", o: [
        ["Link it as a child of the VPN parent incident and tell Tim the team is working on it", 10, "Right: one place to update, and every linked user is informed at resolution.", "link"],
        ["Troubleshoot Tim's laptop separately", -5, "That wastes time on a known central problem.", "stay"],
        ["Escalate it separately to the Network team", -3, "That creates duplicate work for the Network team. Link it.", "stay"]] }
    ], res: "" },

  { id: "vpn3", from: "Sandra Koch", dept: "Legal (home office)", ch: "phone", subj: "VPN 809", body: "VPN is broken, error 809, I need the contract folder for a court deadline today!",
    type: "incident", cat: "Network and VPN", imp: 2, urg: 3, kw: ["vpn", "809", "deadline"], child: "vpn",
    why: "Part of the VPN outage. Her deadline is a reason to offer a workaround, not to change the parent's priority.",
    rounds: [
      { q: "She has a court deadline. Best handling:", o: [
        ["Link to the VPN parent, and offer a workaround: the contract folder via SharePoint in the browser, or work from the office", 10, "Linking plus a workaround is senior-level thinking.", "link"],
        ["Raise the whole outage to P1 because of her", -3, "Priority follows overall impact and urgency. Help her with a workaround instead.", "stay"]] }
    ], res: "" },

  { id: "monitor", from: "Lukas Schmidt", dept: "Controlling", ch: "portal", subj: "2nd screen", body: "Can I please get a second monitor? I work with large Excel files all day.",
    type: "request", cat: "Request: hardware", imp: 1, urg: 1, kw: ["monitor", "screen", "second"],
    why: "A wish for one user that can wait: service request, P4.",
    rounds: [
      { q: "What is needed before anything is ordered?", o: [
        ["Manager approval (cost centre) through the request workflow", 10, "Right. Hardware costs money, so the manager approves.", "pend:40"],
        ["Order it straight away", -5, "Without approval you may spend someone else's budget.", "stay"]], reply: "The manager approved the request." },
      { q: "Approved. Who delivers it?", o: [
        ["Assign the fulfilment task to the Endpoint team (stock and desk setup)", 10, "Correct: the request moves to the team that delivers.", "esc:Endpoint team"],
        ["Security team", -5, "Security does not deliver monitors.", "stay"]] }
    ], res: "" },

  { id: "share", from: "Anna Weber", dept: "Purchasing", ch: "portal", subj: "access finance folder", body: "I need write access to the Finance share for the budget planning.",
    type: "request", cat: "Request: access", imp: 1, urg: 2, kw: ["access", "finance", "share", "write", "folder"],
    why: "Access request for one user: service request, P4 (or P3 with a deadline).",
    rounds: [
      { q: "Anna's manager writes 'just do it'. Who must approve access to Finance data?", o: [
        ["The data owner (Head of Finance), as defined for the Finance share", 10, "Yes. The owner of the data decides, not the requester's manager alone.", "pend:50"],
        ["Nobody, it is an internal share", -10, "Unapproved access to finance data is an audit finding waiting to happen.", "stay"],
        ["Her manager's approval is enough", -3, "Her manager confirms the business need; the data owner grants access to the data.", "stay"]], reply: "The Head of Finance approved read access only, not write." },
      { q: "Approved: READ only. Now:", o: [
        ["Add her to the group GG-Finance-Read (AGDLP), tell her to sign out and in, and note the approval in the ticket", 10, "Correct group, correct level, documented.", "resolve"],
        ["Give her write access as she asked", -10, "Only what was approved. Least privilege.", "stay"],
        ["Add her account directly to the folder ACL", -5, "Rights go to groups, never to single users.", "stay"]] }
    ], res: "Data owner approved read access. Added to GG-Finance-Read, user signed out and in, access confirmed." },

  { id: "phish", from: "Felix Braun", dept: "Logistics", ch: "phone", subj: "dhl mail", body: "I clicked a link in a DHL mail and typed my Microsoft password. Then the page went blank. Is that bad?",
    type: "incident", cat: "Security", imp: 2, urg: 3, kw: ["phishing", "password", "link", "credential"],
    why: "A password is in an attacker's hands: risk for the company (impact medium), act now (urgency high): P2.",
    rounds: [
      { q: "Your first actions:", o: [
        ["Reset his password, revoke all sessions, check his MFA methods and inbox rules", 10, "Correct containment. An attacker may already be signed in.", "next"],
        ["Tell him to delete the mail and be careful next time", -10, "The password is stolen. Deleting the mail changes nothing.", "stay"],
        ["Reply to the phishing mail to complain", -10, "Never interact with the attacker.", "stay"]] },
      { q: "Contained. What else?", o: [
        ["Escalate to the Security team (SOC) with the sender, URL, time and actions taken, so they can block it company-wide", 10, "Yes. Others may have received the same mail.", "esc:Security team (SOC)"],
        ["Close the ticket, the password is reset", -5, "The SOC must check sign-in logs and block the campaign.", "stay"]] }
    ], res: "" },

  { id: "printer", from: "Herr Yilmaz", dept: "Office 2nd floor", ch: "phone", subj: "printer 2OG", body: "The big printer on the 2nd floor shows paper jam, but there is no paper inside. The whole floor cannot print.",
    type: "incident", cat: "Printer", imp: 2, urg: 2, kw: ["printer", "jam", "floor", "2og", "2nd"],
    why: "A whole floor is affected (impact medium), other printers exist (urgency medium): P3.",
    rounds: [
      { q: "First step:", o: [
        ["Tell users to print to the 3rd floor printer for now, and check the printer's web page for the error code", 10, "Workaround first, then diagnose. The web page shows a sensor error.", "next"],
        ["Delete and recreate the print queue on the server", -5, "The printer itself reports a hardware sensor problem; the queue is fine.", "stay"]] },
      { q: "A paper sensor is broken. The printer has a service contract.", o: [
        ["Call the vendor under the service contract and set the ticket to Pending (vendor)", 10, "Right. The vendor's contract (underpinning contract) covers the repair.", "pend:90"],
        ["Open the printer and repair it yourself", -5, "Leased printers under contract are repaired by the vendor.", "stay"]], reply: "The technician replaced the paper sensor. The printer works." },
      { q: "Vendor fixed it.", o: [["Test a print, inform the floor, resolve the ticket", 10, "Done, with a test.", "resolve"]] }
    ], res: "Broken paper sensor. Workaround: 3rd floor printer. Vendor replaced the sensor under contract, test print OK." },

  { id: "camera", from: "Lea Fischer", dept: "HR", ch: "chat", subj: "camera", body: "My camera in Teams is black since the Windows update yesterday.",
    type: "incident", cat: "Hardware", imp: 1, urg: 2, kw: ["camera", "teams", "black", "update"],
    why: "One user, work affected but she can join with audio: P4.",
    rounds: [
      { q: "Most likely quick check:", o: [
        ["Settings > Privacy and security > Camera: is camera access on for apps, and does the Camera app work?", 10, "The update reset privacy settings: camera access was off.", "next"],
        ["Order a new webcam", -5, "Test before you buy.", "stay"]] },
      { q: "Camera access was off.", o: [["Turn it on, test in Teams, resolve", 10, "Fixed.", "resolve"]] }
    ], res: "Windows update turned camera access off. Enabled in privacy settings, Teams camera works." },

  { id: "comply", from: "Daniel Neumann", dept: "Engineering", ch: "email", subj: "Outlook says device must be compliant", body: "After my parental leave Outlook and Teams say my device must be compliant. I cannot work.",
    type: "incident", cat: "Mobile device", imp: 1, urg: 3, kw: ["compliant", "compliance", "device", "intune"],
    why: "One user who cannot work: P3.",
    rounds: [
      { q: "Where do you look?", o: [
        ["Intune > Devices > his laptop > Device compliance and last check-in", 10, "Last check-in was 40 days ago: the compliance validity period (30 days) expired.", "next"],
        ["Remove the Conditional Access policy", -10, "Never switch off protection for everyone to fix one device.", "stay"]] },
      { q: "Last check-in 40 days ago.", o: [
        ["Ask him to open Company Portal > Devices > Check status (sync), wait a few minutes, test Outlook", 10, "The device checks in, compliance is evaluated, access works.", "resolve"],
        ["Wipe the laptop", -10, "Far too drastic. A sync fixes it.", "stay"]] }
    ], res: "Device was offline 40 days, compliance validity expired. Synced via Company Portal, device compliant, Outlook works." },

  { id: "bitlocker", from: "Sophie Richter", dept: "Sales", ch: "phone", subj: "blue screen key", body: "My laptop shows a blue screen asking for a BitLocker recovery key. I am at a customer site.",
    type: "incident", cat: "Security", imp: 1, urg: 3, kw: ["bitlocker", "recovery", "key"],
    why: "One user who cannot work: P3.",
    rounds: [
      { q: "Before you read out a recovery key:", o: [
        ["Verify her identity and ask for the first 8 characters of the Key ID on the screen", 10, "Identity plus matching key ID, so the key goes to the right person and device.", "next"],
        ["Read the key right away", -10, "A recovery key unlocks the disk. Identity first.", "stay"]] },
      { q: "Verified, key ID matches the device in Entra ID.", o: [
        ["Read the key, then rotate the key in Intune and note why the prompt appeared (BIOS update)", 10, "Rotation after use is the professional finish.", "resolve"]] }
    ], res: "Recovery prompt after BIOS update. Identity and key ID verified, key provided, key rotated in Intune." },

  { id: "newphone", from: "Markus Wolf", dept: "Production", ch: "phone", subj: "new phone authenticator", body: "I got a new phone and the Authenticator app is gone. I cannot sign in.",
    type: "incident", cat: "Account and access", imp: 1, urg: 3, kw: ["mfa", "authenticator", "phone"],
    why: "One user who cannot work: P3.",
    rounds: [
      { q: "How do you help?", o: [
        ["Verify identity by the callback procedure, then issue a Temporary Access Pass so he can register Authenticator on the new phone", 10, "Secure and fast.", "resolve"],
        ["Turn off MFA for his account", -10, "Never remove MFA as a fix.", "stay"],
        ["Ask him to send a photo of his ID by WhatsApp", -5, "Use the company's verification process, not private messengers.", "stay"]] }
    ], res: "Identity verified by callback, Temporary Access Pass issued, user registered Authenticator on the new phone." },

  { id: "mfaspam", from: "Claudia Zimmermann", dept: "Finance", ch: "email", subj: "strange approve requests", body: "Last night at 3 a.m. my phone showed many 'approve sign-in' requests. I pressed deny. Is everything ok?",
    type: "incident", cat: "Security", imp: 2, urg: 3, kw: ["mfa", "prompt", "sign-in", "password", "attack"],
    why: "Someone has her password (MFA fatigue attack): P2.",
    rounds: [
      { q: "What does this mean and what do you do?", o: [
        ["Her password is known to an attacker. Reset it, revoke sessions, check sign-in logs for a successful login", 10, "Correct. The prompts only appear after a correct password.", "next"],
        ["It is a glitch, ignore it", -10, "Unexpected MFA prompts are a classic attack sign.", "stay"]] },
      { q: "Contained.", o: [
        ["Escalate to the Security team (SOC) with times and sign-in log details", 10, "The SOC checks whether the attack succeeded anywhere.", "esc:Security team (SOC)"],
        ["Escalate to the Network team", -5, "This is an identity security incident: SOC.", "stay"]] }
    ], res: "" },

  { id: "erp", from: "Dr. Keller (Head of Finance)", dept: "Finance", ch: "phone", subj: "SAP DOWN", body: "Nobody in the company can open SAP. Today is the payroll run!",
    type: "incident", cat: "Software", imp: 3, urg: 3, kw: ["sap", "erp", "down", "payroll", "all"],
    why: "Whole company, business-critical, deadline today: P1.",
    rounds: [
      { q: "This is a P1. First:", o: [
        ["Confirm scope quickly (monitoring, two other users), declare a major incident and escalate to the Server team; the major incident manager runs communication", 10, "Right: P1s are coordinated, not fixed silently by 1st level.", "esc:Server team"],
        ["Restart the user's PC", -10, "Everyone is affected: this is not a PC problem.", "stay"],
        ["Wait for more calls", -10, "A P1 needs action now.", "stay"]] }
    ], res: "" },

  { id: "python", from: "Nina Krüger", dept: "Analytics", ch: "chat", subj: "install python pls", body: "Can you give me admin rights so I can install Python? It is for my work.",
    type: "request", cat: "Request: software", imp: 1, urg: 1, kw: ["python", "install", "software"],
    why: "A software wish for one user: service request, P4.",
    rounds: [
      { q: "How do you handle it?", o: [
        ["No local admin rights. Python is in the Company Portal catalogue: tell her to install it from there", 10, "Least privilege and self-service.", "resolve"],
        ["Add her to the local Administrators group", -10, "Permanent admin rights for convenience are a security risk.", "stay"],
        ["Remote in and install it with your admin account", -3, "Works, but the catalogue is the scalable, documented way.", "stay"]] }
    ], res: "Pointed user to Python in Company Portal; installed by herself, no admin rights needed." },

  { id: "drucker", from: "Frau Schulz", dept: "Einkauf", ch: "email", subj: "Drucker druckt nicht", body: "Guten Morgen, mein Drucker druckt seit heute früh nicht mehr. Die Kollegen können drucken. Danke!",
    type: "incident", cat: "Printer", imp: 1, urg: 2, kw: ["drucker", "printer", "druck", "queue", "warteschlange"],
    why: "Nur eine Nutzerin, Kollegen drucken (Umgehung möglich): P4.",
    rounds: [
      { q: "Only she is affected. First check:", o: [
        ["Her print queue: a stuck job blocks everything behind it. Check the queue and the default printer", 10, "A 300-page job was stuck. Typical single-user printer case.", "next"],
        ["Restart the print server", -10, "Colleagues print fine. Do not restart a server for one user.", "stay"]] },
      { q: "Stuck job found.", o: [
        ["Cancel the job, print a test page, reply in German: 'Der Druckauftrag hing fest. Ich habe ihn gelöscht, Sie können wieder drucken.'", 10, "Fixed, and a clear answer in her language.", "resolve"]] }
    ], res: "Hängender Druckauftrag blockierte die Warteschlange. Auftrag gelöscht, Testseite OK." },

  { id: "laufwerk", from: "Herr Fuchs", dept: "Marketing", ch: "portal", subj: "Zugriff Laufwerk Marketing", body: "Hallo, ich bin neu im Team und brauche Zugriff auf das Laufwerk M: (Marketing). Viele Grüße",
    type: "request", cat: "Request: access", imp: 1, urg: 2, kw: ["zugriff", "laufwerk", "marketing", "access"],
    why: "Zugriffsanfrage eines Nutzers: Service Request, P4.",
    rounds: [
      { q: "He is new in Marketing. What do you need?", o: [
        ["Approval from the Marketing team lead as owner of the share", 10, "Correct.", "pend:30"],
        ["Copy all groups from a colleague in Marketing", -5, "Copying a colleague copies years of extra rights (privilege creep).", "stay"]], reply: "Die Teamleitung Marketing hat den Zugriff genehmigt (Lesen und Schreiben)." },
      { q: "Approved.", o: [["Add him to GG-Marketing, ask him to sign out and in, confirm M: works", 10, "Done the AGDLP way.", "resolve"]] }
    ], res: "Genehmigung der Teamleitung liegt vor. Benutzer zu GG-Marketing hinzugefügt, Laufwerk M: funktioniert." },

  { id: "wifi", from: "Empfang (reception)", dept: "Facility", ch: "phone", subj: "wifi meeting room", body: "Wi-Fi in meeting room B is down. A customer meeting starts in 20 minutes.",
    type: "incident", cat: "Network and VPN", imp: 2, urg: 3, kw: ["wifi", "wlan", "meeting", "room", "access point"],
    why: "A room for an important meeting (impact medium), now (urgency high): P2.",
    rounds: [
      { q: "With 20 minutes left:", o: [
        ["Workaround first: a cable and the guest Wi-Fi from the corridor access point; then check the room's access point in the controller", 10, "The meeting is saved, and you found the access point offline.", "next"],
        ["Reboot the core switch", -10, "That would take down the whole building.", "stay"]] },
      { q: "The access point in room B is offline (no power on the PoE port).", o: [
        ["Escalate to the Network team with AP name, switch port and what you checked", 10, "Switch ports and PoE belong to the Network team.", "esc:Network team"],
        ["Escalate to the Server team", -5, "Wrong team.", "stay"]] }
    ], res: "" },

  { id: "leaver", from: "HR (Frau Becker)", dept: "HR", ch: "portal", subj: "Austritt Thomas Klein", body: "Thomas Klein leaves the company today at 17:00. Please remove all access.",
    type: "request", cat: "Request: access", imp: 1, urg: 2, kw: ["leaver", "austritt", "access", "disable", "klein"],
    why: "Standard leaver request with a fixed time: service request, P4 (P3 if contentious).",
    rounds: [
      { q: "What is the correct leaver handling?", o: [
        ["At 17:00: disable in AD (source), revoke sessions, convert mailbox to shared for the manager, remove groups, collect the laptop; document each step", 10, "The full leaver checklist, in order.", "resolve"],
        ["Delete the account now", -10, "Too early, and deleting loses mailbox and files the company still needs.", "stay"],
        ["Only remove his licence", -5, "He could still sign in to other systems.", "stay"]] }
    ], res: "Leaver checklist done at 17:00: disabled in AD, sessions revoked, mailbox shared to manager, groups removed, laptop collected." },

  { id: "disk", from: "Olaf Hartmann", dept: "Design", ch: "portal", subj: "C full", body: "My laptop says the C: drive is full and everything is slow.",
    type: "incident", cat: "Hardware", imp: 1, urg: 2, kw: ["disk", "full", "c:", "space", "storage"],
    why: "One user, work affected: P4.",
    rounds: [
      { q: "Best approach:", o: [
        ["Check what uses the space; turn on OneDrive Files On-Demand and Storage Sense, clear temp files", 10, "Large local OneDrive copies were the cause.", "resolve"],
        ["Delete his Downloads folder remotely", -10, "Never delete user data without asking.", "stay"],
        ["Order a bigger SSD", -3, "Clean up first.", "stay"]] }
    ], res: "OneDrive kept 120 GB locally. Enabled Files On-Demand and Storage Sense, 140 GB free." },

  { id: "ipad", from: "Assistant to the CEO", dept: "Management", ch: "phone", subj: "CEO iPad lost", body: "The CEO left her company iPad at Munich airport security.",
    type: "incident", cat: "Mobile device", imp: 2, urg: 3, kw: ["ipad", "lost", "ceo", "device"],
    why: "Sensitive data on a lost device (impact medium), act now (urgency high): P2.",
    rounds: [
      { q: "The iPad is a supervised company device. First:", o: [
        ["Enable Lost Mode with a phone number, try to locate it, and revoke her sessions", 10, "Protect the data, keep the chance to recover the device.", "next"],
        ["Wipe it immediately", -3, "Lost Mode first: the airport may find it. Wipe if it is not recovered.", "stay"]] },
      { q: "Airport lost and found has it.", o: [
        ["Keep Lost Mode until it is back in her hands, then disable it, check the device, document the time line", 10, "Clean finish with a time line.", "resolve"]] }
    ], res: "Lost Mode enabled, sessions revoked, device recovered from airport lost and found, Lost Mode removed, time line documented." },

  { id: "adminpw", from: "Kevin Lorenz", dept: "Warehouse", ch: "chat", subj: "admin password", body: "Can you send me the local admin password? I need to install a scanner driver.",
    type: "request", cat: "Request: software", imp: 1, urg: 2, kw: ["driver", "scanner", "install"],
    why: "One user needs a driver: service request, P4.",
    rounds: [
      { q: "Your answer:", o: [
        ["No admin password for users. Install the driver yourself via remote session or deploy it with Intune", 10, "Correct. LAPS passwords are for IT, and every read is logged.", "resolve"],
        ["Send the LAPS password in the chat", -10, "Never send admin passwords to users, least of all in chat.", "stay"]] }
    ], res: "Installed the scanner driver via remote session; no admin password shared." }
  ]
};
