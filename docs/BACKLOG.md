# Content backlog

The daily improvement job takes the first unchecked item, builds it, tests it, publishes it and ticks it here.
Asif can reorder or add items at any time; the job always follows this file.

## Rules for every change
- Plain, simple English (B2); German content at the level it is written for.
- No text, word lists or exercises copied from Schritte plus neu or any other book. Follow the same themes and grammar order where known, write everything new.
- Facts about exams, versions and products must be checked on the vendor's website first. If sources disagree, say so in the content.
- No em dashes. No green colour. Keep the existing block formats (see data/lessons.js header).
- Every module ends with a quiz; every German unit has gap, word-order and write-your-own exercises.
- Run the validation scripts and the browser test before publishing. Bump VERSION in sw.js.

## Security (do first)
- [x] Vendor a pinned copy of @anthropic-ai/sdk 1.14.0 into js/vendor/ (npm + esbuild bundle), import it from the same origin instead of esm.sh, add it to sw.js FILES, add a CSP limiting script-src to self and connect-src to self and api.anthropic.com

## Depth programme (priority 1, his main request: "deep knowledge, not basic")
Each run: take the next course below and grow it into a full road: at least 3 Foundation, 4 Professional and 2 Senior modules, one scenario casebook (real incidents, like data/courses-cases.js), one capstone project with a lab guide, and 10 interview questions. Write in depth: why it works, how it fails, commands with real output, decisions and trade-offs. Keep the fun tone (journey stages, light humour) but never at the cost of accuracy.
- [x] Active Directory: full road done 2026-11-27 (3 Foundation, 9 Professional incl. casebook, capstone and interview, 2 Senior) in data/courses-ad-deep.js
- [ ] Microsoft 365 / Exchange Online
- [ ] Intune and Windows deployment
- [ ] Networking fundamentals + CCNA switching
- [ ] CCNA routing, services, security, automation
- [ ] Azure administration
- [ ] Linux administration
- [ ] New: PowerShell automation course
- [ ] New: Security operations for admins
- [ ] Translate course content into German (data/*-de.js), course by course, so the app can be used fully in German

## German (priority 2)
- [ ] A2.2: Lektion 8 to 14 (media, travel, money, services, relationships), grammar progression after A2.1
- [ ] B1.2: Lektion 8 to 14 (work life, society, environment, culture), grammar progression after B1.1
- [ ] A1.1: Lektion 1 to 7 (for review and for friends starting from zero)
- [ ] A1.2: Lektion 8 to 14
- [ ] B2: job interview, presentations, formal emails and reports
- [ ] More Deutsch Arcade games: listening quiz with IT phone calls, Präpositionen-Sprint, Adjektivendungen-Duell
- [x] IT vocabulary pack: done inside Wortschatz (2000 words, data/wortschatz-*.js)
- [ ] Wortschatz: grow to 3000 words (B1.2 and B2 topics: health system, environment debate, job interview, contracts); append new topics in a new file, never reorder existing words (progress keys use the position)
- [ ] Listening practice: short dialogues read by the speech engine with comprehension questions

## IT courses (priority 3)
- [ ] Windows Server: DNS and DHCP in depth, file services (DFS, quotas), print server (Professional)
- [ ] PowerShell course: from basics to automation with Graph and AD (Foundation to Senior)
- [ ] Security for admins: Defender for Endpoint, vulnerability management, incident response (Professional/Senior)
- [ ] Intune senior module: co-management, Windows Autopatch, app protection at scale
- [ ] Cisco: wireless deep dive and IPv6 routing (Professional)
- [ ] CCNA v2.0 changes: check Cisco's official blueprint and update the six networking courses
- [ ] Virtualisation: Hyper-V clusters, VMware and Proxmox for admins (Professional)
- [ ] Monitoring: Zabbix / PRTG / Grafana basics (Professional)
- [ ] More Cisco CLI labs: OSPF, ACLs, port security, router-on-a-stick

## Career (priority 4)
- [ ] Job search in Germany course: where to search, Anschreiben and Lebenslauf rules, Bewerbungsgespräch, Arbeitsvertrag, salary ranges for IT support and sysadmin
- [ ] Interview simulator with the KI (role-play in English and German)

## Done
- [x] 2026-11-27: Active Directory depth road: new Foundation modules (what AD is, service desk tasks, sign-in chain), Professional deep dives (sites, replication and AD DNS; Kerberos, delegation and gMSA), Senior lifecycle module (DC upgrades, Windows Server 2025 functional level and 32k pages, migrations, forest recovery), capstone lab "corp.lab", 10 interview questions; modules ordered Foundation to Senior
- [x] 2026-11-27: security: @anthropic-ai/sdk 1.14.0 bundled into js/vendor/ (build notes and SHA-256 in js/vendor/README.md), KI loads it from the same origin, cached offline by sw.js; Content Security Policy in index.html (scripts only from self, connections only to self and api.anthropic.com)
- [x] 2026-11-28: speed pass, journey maps with XP/ranks/streak/badges, Deutsch Arcade (5 games), springs and ripples, EN/DE interface, store-ready manifest, AD incidents and network troubleshooting casebooks
- [x] 2026-11-27: Career tracks, 16 courses incl. Azure and Linux, Cisco CLI simulator, subnetting trainer
- [x] 2026-11-27: German A2.1 and B1.1 (14 lessons), KI tutor and German conversation partner
