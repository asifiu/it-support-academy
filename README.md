# IT Support Academy

An 8-week, hands-on plan to get job-ready for **IT Support / Service Desk / Junior System Administrator** roles in Germany, with an **ITIL Foundation** course and a **workplace German** side panel. It is a small web app that works on a PC and on a phone, also offline.

## Why these topics

The plan comes from 55 real IT support and sysadmin job ads in Germany (Oct to Nov 2026). Number of ads that asked for each skill:

| Skill | Ads | Where in the plan |
|---|---|---|
| Hardware, client setup, imaging | 36 | Week 1 |
| Ticket system / ticket handling | 35 | Week 7 + Ticket trainer |
| Networking (TCP/IP) | 32 | Week 2 |
| Documentation | 28 | Every lab, Week 7 |
| Microsoft 365 | 27 | Week 4 |
| Active Directory | 24 | Week 3 |
| VLAN / switching | 23 | Week 2 |
| Security | 20 | Week 6 |
| Firewall | 19 | Weeks 2 and 6 |
| ITIL | 16 | ITIL course, Week 7 |
| Intune / MDM | 14 | Week 4 |
| German C1 / fluent | 11 | German panel |
| Windows Server | 10 | Week 3 |
| Scripting (PowerShell, Bash) | 10 | Week 5 |
| Linux | 8 | Week 5 |

## The 8 weeks

| Week | Topic |
|---|---|
| 1 | Support basics, Windows 11, building the Hyper-V home lab |
| 2 | Networking: OSI, subnetting, DNS, DHCP, VLANs, troubleshooting |
| 3 | Windows Server, Active Directory, Group Policy, file shares, printers |
| 4 | Microsoft 365, Entra ID, Exchange Online, Teams/OneDrive, Intune |
| 5 | PowerShell, Linux, Bash, automation |
| 6 | Security, patching, BitLocker, LAPS, backup, virtualisation, OPNsense firewall |
| 7 | Service desk in practice: real ticket tool, incident/problem/change, KB |
| 8 | Portfolio, interview drill (EN + DE), ITIL mock, applications |

**Daily rhythm (about 4 hours):** 1 h learn, 2 h lab, 30 min ITIL, 30 min German. Saturday: weekly test + write up the lab on GitHub. Sunday: rest.

## What is in the app

- **Today**: what to do today, based on your start date.
- **8-week plan**: every day has a detailed **Teach me** lesson (plain language, examples, every command explained), key points, a hands-on lab, self-check questions, free links, and a notes box.
- **Home lab**: the VMs you build (DC01, CLIENT01, LNX01, OPNsense...) and the IP plan.
- **Ticket trainer**: 12 realistic tickets (some in German). Choose type, impact, urgency and the best first action; get feedback.
- **ITIL**: 8 lessons (one per week) with quizzes and a 40-question, 60-minute mock exam.
- **Interview**: 32 technical and behaviour questions with answer hints.
- **German (DE button, on every page)**: flashcards with spaced repetition and pronunciation (phone support, instructions, tickets/email, IT words, job grammar, interview), plus role-play dialogs.
- **Progress & sync**: progress is stored in your browser. Export a file on one device and import it on another.

## Use it

- **On this PC**: open `index.html`, or run `python -m http.server 8765` in this folder and open http://localhost:8765 (needed for offline/install).
- **On the phone**: the app needs to be online at one address (for example GitHub Pages). Then open it in Chrome (Android: menu > Install app) or Safari (iPhone: Share > Add to Home Screen).

## Change the content

All learning content is plain data in `data/`:

| File | Content |
|---|---|
| `data/plan.js` | 8 weeks, 5 days each, weekly quizzes, home lab table |
| `data/lessons.js` | Detailed "Teach me" lessons, key `"week-day"` |
| `data/itil.js` | ITIL lessons and quiz questions |
| `data/german.js` | German decks and dialogs |
| `data/tickets.js` | Ticket trainer scenarios |
| `data/interview.js` | Interview questions |

After a change, raise `VERSION` in `sw.js` so installed phones load the new content.

## Your coding task

`js/priority.js` holds `calcPriority(impact, urgency)`, the ITIL priority matrix the Ticket trainer uses. It is yours to write (5 to 10 lines).

## Notes

- Lessons for weeks 2 to 8 are added week by week as the course goes on.
- ITIL exam facts were checked from secondary sources in Nov 2026. Read the official PeopleCert syllabus before booking.
- All tools and resources in the plan are free (evaluation ISOs, free tiers, open source).
