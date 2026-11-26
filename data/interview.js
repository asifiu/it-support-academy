/* Interview questions asked for IT support / junior sysadmin roles in Germany.
   [question, what a good answer contains]. Practise out loud. */
window.INTERVIEW = {
  technical: [
    ["What happens when you type a website into the browser?", "DNS lookup (resolver), IP found, TCP 3-way handshake, TLS, HTTP request, response, page rendered."],
    ["A user cannot reach the internet. How do you troubleshoot?", "Bottom-up: cable/Wi-Fi, ipconfig (169.254 = DHCP problem), ping gateway, ping 8.8.8.8, nslookup a name (DNS), proxy/VPN, then other users affected?"],
    ["What is DHCP and how does it work?", "Gives IP, mask, gateway, DNS automatically. DORA. Scope, lease, reservation."],
    ["What is DNS? Name some record types.", "Name to IP. A, AAAA, CNAME, MX, PTR, TXT. AD needs internal DNS."],
    ["What is Active Directory?", "Central directory for users, computers, groups; authentication (Kerberos) and authorisation; managed with GPOs; DCs replicate."],
    ["Difference between a security group and a distribution group?", "Security = permissions (and can mail). Distribution = email only."],
    ["What is a GPO? Give examples.", "Central settings for users/computers linked to OUs. Drive maps, printers, password policy, USB block. gpupdate /force, gpresult."],
    ["A GPO is not applying. What do you check?", "Linked to the right OU? Object in that OU? Security filtering? Inheritance blocked? Computer vs user section? gpresult /r, replication."],
    ["User is locked out again and again. Why?", "Old password saved on phone/mapped drive/service/credential manager. Check lockout source on DC event 4740."],
    ["Share vs NTFS permissions?", "Both apply over the network; the most restrictive wins. Best practice: share Full/Change for Authenticated Users, control with NTFS."],
    ["What is the difference between Entra ID and Active Directory?", "AD DS = on-prem, Kerberos/LDAP, GPO. Entra ID = cloud identity, OAuth/SAML, Conditional Access. Hybrid syncs with Entra Connect."],
    ["What is Intune?", "Cloud MDM/MAM: enrol devices (Autopilot), compliance, configuration profiles, app deployment, update rings, wipe/retire."],
    ["How do you set up a new employee?", "Account in right OU, groups, licence, mailbox, laptop via Autopilot/image, MFA, printers, phone, handover document. Use a checklist."],
    ["What is a VLAN? Why use one?", "Logical network on a switch; separates broadcast domains: security (guest, IoT), performance, organisation. Trunk with 802.1Q."],
    ["Explain subnetting: how many hosts in a /26?", "64 addresses, 62 usable. Network + broadcast addresses not usable."],
    ["What ports do you know?", "22 SSH, 25 SMTP, 53 DNS, 80/443 HTTP(S), 389 LDAP, 445 SMB, 3389 RDP, 67/68 DHCP."],
    ["Outlook keeps asking for the password. What do you do?", "Check account/MFA, Credential Manager entries, new Outlook profile, Autodiscover, modern auth, updates."],
    ["A PC is very slow. What do you check?", "Task Manager (CPU/RAM/disk), startup apps, disk space, updates running, malware scan, event logs, hardware (SSD health, RAM)."],
    ["What is RAID? What is a backup?", "RAID = redundancy against disk failure, not a backup. Backup 3-2-1, tested restores, RPO/RTO."],
    ["What would you do if you do not know the answer to a ticket?", "Check KB and logs, search vendor docs, ask a colleague, escalate with a clear note, document the solution afterwards."],
    ["What is the difference between an incident and a problem?", "Incident = restore service now. Problem = find and remove the root cause of one or more incidents."],
    ["Which PowerShell commands do you use?", "Get-ADUser, Unlock-ADAccount, Set-ADAccountPassword, Get-Service, Restart-Service, Test-NetConnection, Get-EventLog / Get-WinEvent."],
    ["How do you handle a phishing click?", "Reset password, revoke sessions, check MFA and inbox rules, isolate device if malware, report to security, inform user kindly."],
    ["What is MFA and why is it important?", "Second factor (app, token). Stops most attacks with stolen passwords."]
  ],
  behaviour: [
    ["Tell me about yourself.", "90 seconds: background (B.Sc. EEE, IT support experience), what you do best, home lab, why this job."],
    ["Tell me about a difficult user.", "STAR: stayed calm, listened, clear steps, kept them updated, result."],
    ["Tell me about a time you made a mistake.", "Real small mistake, how you fixed it, what process you changed."],
    ["How do you prioritise many tickets?", "Impact x urgency, SLAs, quick wins, communicate wait times, escalate when needed."],
    ["How do you learn new technology?", "Docs, lab, small project, write it up. Example: your homelab."],
    ["Why do you want to work here?", "Their tech stack, their industry, team, growth. Read the ad and the website."],
    ["Your German is not fluent. How will you work with German users?", "Honest: A2/B1, learning daily, support phrases ready, written German with tools checked, improving fast; English for technical depth."],
    ["Where do you see yourself in 3 years?", "System administrator with M365 and Azure, certifications, taking on projects."]
  ]
};
