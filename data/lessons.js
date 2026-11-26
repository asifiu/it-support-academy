/* Detailed "Teach me" lessons. Key = "week-day".
   Blocks: ["h", title] heading, ["p", text] paragraph, ["eg", text] everyday example,
   ["steps", [..]] numbered steps, ["cmd", command, what you will see / what it means],
   ["tip", text], ["warn", text] common mistake, ["sum", [..]] remember these.
   New lessons are added week by week as we go through the course together. */
window.LESSONS = {

"1-1": [
  ["part", "1", "Big picture"],
  ["h", "What does an IT support person really do?"],
  ["p", "Think of IT support like a doctor's practice for computers. A user comes with a 'pain' (\"my email does not work\"). You ask questions, find the cause, fix it or send them to a specialist, and write everything in the patient file. The patient file is the ticket."],
  ["h", "The 3 support levels"],
  ["p", "Companies split support into levels so easy problems are fixed fast and hard ones go to experts."],
  ["steps", [
    "1st level (service desk): takes every call, email and chat. Fixes the common things: password resets, unlocking accounts, printer problems, Outlook settings, 'how do I...'. Uses the knowledge base (KB). Goal: fix 60-80% of tickets right away.",
    "2nd level: deeper technical work. Server problems, group policies, permissions, software deployment, network issues. Gets tickets that 1st level could not solve.",
    "3rd level: specialists and vendors (Microsoft, the firewall company, the developers). Bugs, design changes."
  ]],
  ["svg", "levels", "Who handles what: most tickets end at 1st level"],
  ["eg", "A user cannot open a shared folder. 1st level checks: is the user in the right group? Is the path correct? If everything looks right but it still fails for the whole department, it goes to 2nd level, because the file server itself may be broken."],
  ["part", "2", "Go deeper"],
  ["h", "The 6-step troubleshooting method"],
  ["p", "Professionals do not guess randomly. They follow the same steps every time. Learn these by heart; interviewers love asking about them."],
  ["steps", [
    "Identify the problem: ask questions. What exactly happens? Since when? What changed? Only you, or others too? Any error message? Can you show me?",
    "Establish a theory of probable cause: start with the simple and likely. 'Question the obvious': is the cable plugged in, is the device on?",
    "Test the theory: try it. If the theory is wrong, make a new theory or escalate.",
    "Plan the fix and do it: think about side effects. Do not delete things you cannot restore.",
    "Verify it works: ask the user to test. Make sure nothing else broke. Prevent it if you can.",
    "Document: write in the ticket what the cause was and what you did. Next time someone finds the answer in 1 minute."
  ]],
  ["svg", "cycle", "The loop professionals follow for every ticket"],
  ["tip", "Short form to remember: Ask, Guess, Test, Fix, Check, Write."],
  ["h", "What makes a good ticket"],
  ["p", "A ticket is a written record of one issue. A bad ticket says: 'PC broken'. A good ticket lets a colleague continue without calling the user again."],
  ["steps", [
    "Who: name, department, phone, device name (e.g. LAP-0231)",
    "What: the exact symptom and error message (screenshot if possible)",
    "Since when and what changed (update, new password, moved desk)",
    "Impact: only this user, a team, or the whole company?",
    "What has already been tried, and the result",
    "Category and priority"
  ]],
  ["h", "Incident or service request?"],
  ["p", "Incident = something that worked is now broken or slow. Service request = the user wants something new or standard (a new mouse, software, access to a folder, a password reset is also usually treated as a request)."],
  ["eg", "'Outlook crashes when I open it' = incident. 'Please install Zoom' = service request."],
  ["warn", "Common beginner mistake: fixing without writing anything down. If it is not in the ticket, for the company it did not happen."],
  ["sum", ["3 levels: 1st fixes common, 2nd fixes technical, 3rd = specialists", "6 steps: identify, theory, test, fix, verify, document", "Good ticket: who, what, since when, impact, tried", "Incident = broken; request = wanted"]]
],

"1-2": [
  ["part", "1", "Big picture"],
  ["h", "What is a virtual machine (VM)?"],
  ["p", "A VM is a computer that runs inside your computer, as a program. It has its own (virtual) CPU, memory, disk and network card. You can install Windows Server in it, break it, and reset it, without any risk to your real PC. This is how you get practical experience at home for free."],
  ["eg", "Like a flat inside a building: the building (your PC) gives electricity and water (CPU, RAM), but each flat (VM) has its own door and furniture."],
  ["svg", "hyperv", "One physical PC, several virtual computers, three kinds of virtual network"],
  ["h", "Hypervisor: the program that runs VMs"],
  ["p", "Type 1 hypervisor runs directly on the hardware (VMware ESXi, Hyper-V on a server, Proxmox): used in companies. Type 2 runs on top of a normal OS (VirtualBox, VMware Workstation). Hyper-V on Windows 11 Pro is actually type 1 underneath, and it is free with your Windows."],
  ["svg", "lab", "Where this course takes your lab: today you start with CLIENT01"],
  ["part", "2", "Go deeper"],
  ["h", "Step by step: switch on Hyper-V"],
  ["steps", [
    "Press the Windows key, type 'Windows features', open 'Turn Windows features on or off'.",
    "Tick 'Hyper-V' (both sub-items). Click OK. Restart when asked.",
    "Or the fast way: open PowerShell as Administrator and run the command below."
  ]],
  ["cmd", "Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All", "It installs Hyper-V and asks 'Do you want to restart now? [Y]'. Type Y. After the restart, search 'Hyper-V Manager' in Start."],
  ["tip", "If Hyper-V is greyed out: virtualisation is off in the BIOS/UEFI. Restart, enter BIOS (often F2, F10 or Del), enable 'Intel VT-x' or 'AMD-V/SVM'."],
  ["h", "Get the free Windows ISO files"],
  ["p", "An ISO is a file that contains a full installation DVD. Microsoft gives free evaluation versions that run 90-180 days: perfect for learning. Go to the Microsoft Evaluation Center, choose Windows 11 Enterprise and Windows Server 2022, select ISO, English (or German, good for practice!)."],
  ["h", "Virtual switch: the network for your VMs"],
  ["steps", [
    "External: VMs are on your real network (like plugging them into your router).",
    "Internal: VMs talk to each other AND to your PC, not to the internet. We use this: it is safe.",
    "Private: VMs only talk to each other."
  ]],
  ["steps", [
    "In Hyper-V Manager, on the right click 'Virtual Switch Manager'.",
    "Choose 'Internal', click 'Create Virtual Switch', name it LabNet, OK."
  ]],
  ["h", "Create your first VM: CLIENT01"],
  ["steps", [
    "Hyper-V Manager > New > Virtual Machine. Name: CLIENT01.",
    "Generation 2 (needed for Windows 11, it uses UEFI).",
    "Memory: 4096 MB. Untick 'dynamic memory' if your PC has little RAM.",
    "Network: LabNet. Disk: 64 GB. Install from ISO: choose the Windows 11 ISO.",
    "Before starting: VM Settings > Security > tick 'Enable Trusted Platform Module' (Windows 11 needs TPM).",
    "Connect, Start, and press a key quickly when it says 'Press any key to boot from CD'.",
    "Install Windows. Choose 'I don't have internet' / domain join instead if it forces a Microsoft account (a local account is fine for now)."
  ]],
  ["h", "Checkpoint = save game"],
  ["p", "A checkpoint stores the VM's state. If you break something, you go back in 10 seconds. Right-click the VM > Checkpoint, name it 'clean install'."],
  ["warn", "A checkpoint is not a backup: it lives on the same disk. If the disk dies, the checkpoint dies too. Also never keep checkpoints of a domain controller for months."],
  ["sum", ["VM = computer inside your computer", "Hyper-V is free on Windows 11 Pro", "LabNet internal switch keeps the lab safe", "Gen 2 + TPM for Windows 11", "Checkpoint before every risky step"]]
],

"1-3": [
  ["part", "1", "Big picture"],
  ["h", "Your Windows toolbox"],
  ["p", "Most support work happens in a few built-in tools. You open almost all of them with Win + R (the Run box) and a short name. Learn the names; it is much faster than clicking through menus, and it impresses colleagues."],
  ["cmd", "compmgmt.msc", "Computer Management: one window with Event Viewer, local users, disks and services together."],
  ["cmd", "devmgmt.msc", "Device Manager: every piece of hardware. A yellow triangle = driver problem."],
  ["cmd", "diskmgmt.msc", "Disk Management: disks, partitions, drive letters."],
  ["cmd", "services.msc", "Services: background programs (Print Spooler, Windows Update). Start, stop, set to automatic."],
  ["cmd", "eventvwr.msc", "Event Viewer: Windows' diary. Errors and warnings with time. The first place to look for 'it crashed yesterday'."],
  ["cmd", "lusrmgr.msc", "Local Users and Groups (not in Home edition)."],
  ["cmd", "control", "The old Control Panel. Still needed for some settings (e.g. Mail profiles)."],
  ["part", "2", "Go deeper"],
  ["h", "Event Viewer: read Windows' diary"],
  ["steps", [
    "Open eventvwr.msc. Left: Windows Logs > System (hardware, drivers, services) and Application (programs).",
    "Each line has Level (Error, Warning, Information), Date and Time, Source, Event ID.",
    "Click an error. Read 'General'. Copy the Source + Event ID and search it on the internet: someone has had the same.",
    "Use 'Filter Current Log' on the right to show only Errors of the last 24 hours."
  ]],
  ["eg", "Event ID 41 (Kernel-Power) = the PC turned off without shutting down properly: power cut, battery, or someone held the power button."],
  ["h", "Services: the Print Spooler example"],
  ["p", "When print jobs are stuck, the classic fix is restarting the Print Spooler service. Try both ways:"],
  ["cmd", "Get-Service Spooler", "Shows Status: Running, Name: Spooler."],
  ["cmd", "Restart-Service Spooler", "Stops and starts it. Run PowerShell as administrator, or you get 'Access denied'."],
  ["h", "Local users and why normal users are not admins"],
  ["p", "An admin account can install anything, including malware. If a normal user opens a bad attachment, the damage stays small. That is the principle of least privilege."],
  ["steps", [
    "On CLIENT01 open lusrmgr.msc > Users > right-click > New User: 'testuser'.",
    "Make another: 'testadmin'. Open it > Member Of > Add > type Administrators > OK.",
    "Sign in as testuser and try to install something: you see the UAC prompt asking for an admin password. That is UAC working."
  ]],
  ["h", "Remote help: Quick Assist"],
  ["p", "Press Win + Ctrl + Q (or search Quick Assist). The helper clicks 'Help someone', gets a code, the user types it in 'Get help'. You see their screen. In German offices you will hear 'Fernwartung'."],
  ["warn", "Never connect to a user's screen without asking first, and close the session when finished. Users must be able to see that you are connected."],
  ["sum", ["Win + R + .msc names = fastest way to tools", "Event Viewer: System and Application logs, filter Errors", "Restart-Service Spooler fixes stuck printing", "Least privilege: normal users are not admins", "Quick Assist: Win + Ctrl + Q"]]
],

"1-4": [
  ["part", "1", "Big picture"],
  ["h", "Hardware in plain words"],
  ["steps", [
    "CPU: the brain. Does the calculations.",
    "RAM: the desk. Bigger desk = more programs open at once. Full RAM = slow PC.",
    "SSD / NVMe: the cupboard. Stores files even when off. NVMe is the fast kind.",
    "PSU / battery: the power. Bad power = random shutdowns.",
    "Docking station: one cable gives the laptop monitors, network, USB and charging. Very common ticket source."
  ]],
  ["h", "Drivers"],
  ["p", "A driver is a translator between Windows and a device. Wrong or missing driver = device does not work. In Device Manager a yellow triangle shows the problem. Right-click the device > Properties > Driver: Update, Roll Back (go back to the old one after a bad update), or Uninstall."],
  ["tip", "If something stopped working after an update, 'Roll Back Driver' is often the 1-minute fix."],
  ["part", "2", "Go deeper"],
  ["h", "Disks: GPT, partitions, drive letters"],
  ["p", "A new disk is empty. You must 1) initialise it (choose GPT, the modern style; MBR is old, max 2 TB), 2) create a partition (a section), 3) format it with a file system (NTFS for Windows), 4) give it a letter."],
  ["steps", [
    "Shut down CLIENT01. Settings > SCSI Controller > Hard Drive > Add > New > 20 GB.",
    "Start it, open diskmgmt.msc. It asks to initialise: GPT > OK.",
    "Right-click the black 'Unallocated' area > New Simple Volume > Next > letter D > NTFS > Finish."
  ]],
  ["h", "When Windows does not start"],
  ["p", "Windows has a repair system called WinRE (Windows Recovery Environment). It opens automatically after 2-3 failed starts, or with Shift + Restart."],
  ["steps", [
    "Startup Repair: Windows tries to fix boot problems itself.",
    "Safe Mode: Windows with minimal drivers. If it works in Safe Mode, a driver or program is the cause.",
    "System Restore: go back to a restore point.",
    "Uninstall Updates: remove the last update that broke it.",
    "Command Prompt: for advanced commands."
  ]],
  ["cmd", "sfc /scannow", "System File Checker. Compares Windows files with the originals and repairs them. Takes 5-15 min. Result 'did not find any integrity violations' = files are OK."],
  ["cmd", "DISM /Online /Cleanup-Image /RestoreHealth", "Repairs the Windows image that sfc uses as source. If sfc says it could not fix something, run DISM, then sfc again."],
  ["h", "'My PC is slow': a standard routine"],
  ["steps", [
    "Ask: always slow, or since when? Slow at startup or all day?",
    "Task Manager (Ctrl + Shift + Esc): which of CPU, Memory, Disk is near 100%? Which process?",
    "Startup tab: disable unneeded programs that start with Windows.",
    "Disk space: under 10% free makes Windows slow.",
    "Windows Update running in the background? Then wait or schedule.",
    "Malware scan with Defender.",
    "Hardware: old HDD instead of SSD, too little RAM, overheating."
  ]],
  ["warn", "Do not reinstall Windows as the first idea. It loses time and data, and the cause may come back."],
  ["sum", ["RAM = desk, SSD = cupboard", "Driver problem: yellow triangle, Roll Back", "New disk: initialise GPT, partition, NTFS, letter", "WinRE with Shift + Restart", "sfc then DISM then sfc"]]
],

"1-5": [
  ["part", "1", "Big picture"],
  ["h", "Onboarding: a new person starts"],
  ["p", "A new employee must be able to work from the first hour. That only works with a checklist, because 10 small things are needed and forgetting one (e.g. MFA) blocks the person."],
  ["steps", [
    "HR sends the request: name, start date, department, manager, job title.",
    "Create the user account in the right OU and the right groups (department groups give the right folders and printers).",
    "Assign a Microsoft 365 licence; the mailbox is created.",
    "Prepare the laptop (image or Autopilot), note the serial number in the asset list.",
    "Day 1: help the user set up MFA, set their own password, check Outlook, Teams, printers.",
    "Hand over and get a signature for the equipment."
  ]],
  ["h", "Offboarding: someone leaves"],
  ["steps", [
    "Disable the account on the last day (do not delete yet: data and audits).",
    "Reset the password and revoke sign-in sessions; remove MFA devices.",
    "Convert the mailbox to a shared mailbox or set forwarding to the manager (as agreed).",
    "Remove from groups and licences (licences cost money).",
    "Collect laptop, phone, badge, tokens; update the asset list.",
    "Delete the account after the agreed period (e.g. 30-90 days)."
  ]],
  ["warn", "Copying an old user to create a new one ('make him like Peter') copies every right Peter collected in 10 years. Use department groups instead."],
  ["part", "2", "Go deeper"],
  ["h", "Imaging: how laptops get Windows"],
  ["p", "Old way: one 'golden image' is made and copied to every PC (WDS/MDT). Modern way: Windows Autopilot. The laptop comes from the shop, the user signs in with the company account, and Intune installs settings and apps over the internet. No IT person has to touch it."],
  ["h", "Why sysprep before cloning"],
  ["p", "Every Windows installation has unique IDs (SID). If you copy the same installation 20 times, all 20 have the same IDs and the domain gets confused. Sysprep removes the unique parts, so each copy becomes a new individual PC on first start."],
  ["cmd", "C:\\Windows\\System32\\Sysprep\\sysprep.exe /generalize /oobe /shutdown", "Windows prepares itself and shuts down. Next start shows the 'new PC' setup screens (OOBE)."],
  ["h", "Asset management"],
  ["p", "Companies must know which device is where: for security, insurance, warranty and offboarding. A simple asset list has: device name, type, serial number, user, location, purchase date, warranty end, status."],
  ["tip", "Make your own asset list now in Excel or Google Sheets with your lab VMs and your real devices. Interviewers ask 'how did you track hardware?'."],
  ["sum", ["Onboarding: account, groups, licence, laptop, MFA, handover", "Offboarding: disable first, delete later", "Never 'copy Peter'", "Autopilot = modern zero-touch setup", "Sysprep before cloning"]]
]
};
