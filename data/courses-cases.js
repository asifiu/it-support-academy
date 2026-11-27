/* Scenario-based professional modules: real incidents worked through like a senior engineer would. */
(function () {
  const add = (courseId, mod) => { const c = (window.COURSES || []).find((x) => x.id === courseId); if (c) c.modules.push(mod); };

  add("ad", { id: "incidents", title: "Active Directory incidents in production", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "In real jobs nobody asks you to 'create a user'. They ask why 300 people cannot log on at 08:05. This module is a casebook: five incidents, worked the way senior admins work them."],
    ["h", "The incident method"],
    ["steps", ["Scope: who is affected, since when, what changed (updates, changes, new devices)?", "Stabilise: restore service first if you can (workaround), find the root cause second", "Evidence over guesses: logs, event IDs, command output", "One change at a time, written in the ticket", "Root cause, fix, prevention: write the post-incident note the same day"]],
    ["part", "2", "Go deeper"],
    ["h", "Case 1: Monday 08:05, nobody can log on in Hamburg"],
    ["p", "Symptom: users at one site get 'The trust relationship...' or very slow logons; Berlin works. Theory: the Hamburg DC is unreachable or unhealthy, so clients fall back to a remote DC or fail."],
    ["cmd", "nltest /dsgetdc:corp.contoso.de /site:Hamburg\ndcdiag /s:DC-HH01 /q\nrepadmin /showrepl DC-HH01", "Which DC do Hamburg clients find? Is DC-HH01 healthy? Is it replicating?"],
    ["p", "Found: DC-HH01 rebooted for updates and the Netlogon service failed because its disk was full (event 2013, low disk space). Fix: free space, restart Netlogon, verify with dcdiag. Prevention: disk monitoring alert at 80 percent, update rings so not all DCs patch at once."],
    ["h", "Case 2: the lockout storm"],
    ["p", "Symptom: 40 accounts lock every few minutes after a password policy change. Theory: something is trying old passwords in bulk: a misconfigured service, a scanner, or an attack."],
    ["cmd", "Get-WinEvent -ComputerName (Get-ADDomain).PDCEmulator -FilterHashtable @{LogName='Security';Id=4740} -MaxEvents 200 |\n  Group-Object { $_.Properties[1].Value } | Sort-Object Count -Descending | Select-Object -First 5 Count, Name", "Group lockout events by the caller computer: who is causing them?"],
    ["p", "Found: one VPN appliance using an old service account password for LDAP lookups, retrying for every user. Fix: update the service account password on the appliance; move it to a group Managed Service Account where supported. Prevention: inventory of service accounts and where they are used."],
    ["warn", "If the caller is an external IP or many random computers, treat it as a password-spraying attack: involve security, check Entra sign-in logs and smart lockout, block at the edge."],
    ["h", "Case 3: the GPO that 'stopped working'"],
    ["p", "Symptom: a new drive-map GPO applies to some users only. Theory: scope (OU link), security filtering, item-level targeting or WMI filter."],
    ["cmd", "gpresult /r /scope user\nGet-GPPermission -Name \"Map Finance S\" -All | Select Trustee, Permission", "Was the GPO filtered out? Which groups can read and apply it?"],
    ["p", "Found: security filtering set to 'Finance-Staff' only, and Authenticated Users removed entirely, so computers could not read the GPO (MS16-072 behaviour). Fix: add Authenticated Users or Domain Computers with Read (not Apply). Prevention: GPO change checklist with a test OU."],
    ["h", "Case 4: replication stopped weeks ago"],
    ["p", "Symptom: a new user exists on DC01 but not on DC02; passwords changed in one site do not work in the other."],
    ["cmd", "repadmin /replsummary\nrepadmin /showrepl DC02 /errorsonly\nGet-ADReplicationFailure -Target DC02", "Which links fail and with which error?"],
    ["p", "Typical errors: 1722 (RPC server unavailable: firewall or DNS), 8453 (access denied), 2042 (too long since last replication: tombstone lifetime exceeded, the DC must be rebuilt). Fix the network or DNS for 1722; for 2042 demote and rebuild the DC rather than forcing it. Prevention: alert on replication failures daily."],
    ["h", "Case 5: someone deleted an OU"],
    ["cmd", "Get-ADObject -Filter 'isDeleted -eq $true -and Name -like \"*Sales*\"' -IncludeDeletedObjects |\n  Restore-ADObject\n# restore the OU first, then its children", "With the AD Recycle Bin enabled, deleted OUs and users come back with their attributes"],
    ["p", "Without the Recycle Bin: authoritative restore from a System State backup in Directory Services Restore Mode. Prevention: 'Protect object from accidental deletion' on OUs, Recycle Bin on, tiered admin rights."],
    ["part", "3", "Practice"],
    ["steps", ["In your lab, cause each incident on purpose (fill a disk, remove Authenticated Users from a GPO, block port 135 between DCs) and solve it with the commands above", "Write one post-incident note per case: impact, timeline, root cause, fix, prevention", "Explain Case 2 out loud as if in an interview (2 minutes)"]]
  ], quiz: [
    ["Event ID for an account lockout on the PDC emulator:", ["4624", "4740", "4625", "1001"], 1],
    ["Replication error 1722 usually points to...", ["Tombstone lifetime", "Network, firewall or DNS", "Wrong password", "Full mailbox"], 1],
    ["Security filtering without Read for computers causes...", ["Faster logons", "The GPO is not applied", "Replication errors", "Lockouts"], 1],
    ["A DC that has not replicated beyond the tombstone lifetime should be...", ["Forced to replicate", "Demoted and rebuilt", "Renamed", "Left alone"], 1],
    ["First goal during an incident:", ["Find someone to blame", "Restore service, then root cause", "Reinstall all servers", "Wait for Monday"], 1]
  ]});

  add("ccna-route", { id: "casebook", title: "Network troubleshooting casebook", level: "Professional", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Six real network problems, each solved with a method instead of luck. Learn the questions to ask and the show commands that answer them."],
    ["h", "Your toolkit"],
    ["parts", [["show ip interface brief", "Up/down state and addresses at a glance"], ["show interfaces <if>", "Errors, CRC, duplex, speed, drops"], ["show ip route", "Is there a route, from which source"], ["show vlan brief / show interfaces trunk", "Port membership and trunks"],
      ["show spanning-tree vlan <n>", "Which ports block, who is root"], ["show ip ospf neighbor", "Are neighbours FULL"], ["show access-lists", "Hit counters: is the ACL matching"], ["ping / traceroute", "Where does the path break"]]],
    ["part", "2", "Go deeper"],
    ["h", "Case 1: one floor has no network"],
    ["p", "All PCs on the 3rd floor: no IP (169.254.x.x). Other floors fine. Theory: access switch uplink or DHCP relay for that VLAN."],
    ["cmd", "show interfaces trunk\nshow ip interface vlan 30 | include Helper", "Is VLAN 30 allowed on the uplink trunk? Does the SVI have ip helper-address?"],
    ["p", "Found: during a change someone typed 'switchport trunk allowed vlan 40', which REPLACED the list instead of adding. Fix: 'switchport trunk allowed vlan add 30'. Lesson: always use 'add' and save configs before changes."],
    ["h", "Case 2: slow file transfers on one PC"],
    ["cmd", "show interfaces gi0/12\n  ... Half-duplex, 100Mb/s ... 1520 late collisions, 3821 CRC", "Late collisions and CRC errors: classic duplex mismatch or a bad cable"],
    ["p", "Fix: set both sides to auto (or both fixed the same), replace the patch cable, re-check the counters after clearing them with clear counters gi0/12."],
    ["h", "Case 3: OSPF neighbour stuck"],
    ["cmd", "show ip ospf neighbor\nshow ip ospf interface gi0/1 | include Timer|Area|Network Type", "Neighbour in INIT/EXSTART, or missing?"],
    ["p", "INIT: hellos only one way (ACL or unidirectional link). EXSTART/EXCHANGE: MTU mismatch. Missing: area, timers, subnet or authentication mismatch, or passive-interface. Fix the mismatch; never just 'clear ip ospf process' and hope."],
    ["h", "Case 4: the network melts every few minutes"],
    ["p", "Symptom: all switches at 100 percent CPU, links flash, users disconnect. Theory: a layer 2 loop, for example a user connected two wall ports with a small unmanaged switch."],
    ["cmd", "show spanning-tree summary\nshow mac address-table move update\nshow logging | include MACFLAP", "Topology changes and MAC flapping point to the loop"],
    ["p", "Fix: shut the port, find the device. Prevention: PortFast plus BPDU Guard on all access ports, storm control, and never disable Spanning Tree."],
    ["h", "Case 5: users reach the internet but not the HR app"],
    ["cmd", "show access-lists HR-IN\ntraceroute 10.50.1.20 source vlan 20", "Hit counters show the deny line matching; traceroute shows where it stops"],
    ["p", "Found: a new deny line was added above the permit for the HR server. ACLs are read top-down; order matters. Fix: resequence and put the specific permit first; document the change."],
    ["h", "Case 6: VPN up, nothing works"],
    ["p", "Tunnel shows up, but no traffic. Typical causes: mismatched interesting traffic (crypto ACLs not mirrored), NAT translating traffic that should go through the tunnel (needs a NAT exemption), or routing pointing to the internet instead of the tunnel."],
    ["part", "3", "Practice"],
    ["steps", ["Rebuild each case in Packet Tracer and break it on purpose, then fix it using only show commands", "For each case write: symptom, the first three commands you would run, root cause, prevention", "Ask a friend to break your topology; solve it within 15 minutes"]]
  ], quiz: [
    ["'switchport trunk allowed vlan 40' on an existing trunk...", ["Adds VLAN 40", "Replaces the allowed list", "Removes VLAN 40", "Does nothing"], 1],
    ["Late collisions and CRC errors suggest...", ["Duplex mismatch or bad cable", "Wrong VLAN", "DNS issue", "OSPF timers"], 0],
    ["OSPF stuck in EXSTART/EXCHANGE often means...", ["MTU mismatch", "Wrong hostname", "No IP route", "Port security"], 0],
    ["Best prevention for loops from user-connected switches:", ["Disable STP", "PortFast + BPDU Guard", "Bigger switches", "Static ARP"], 1],
    ["ACL lines are evaluated...", ["Most specific first automatically", "Top-down, first match wins", "Bottom-up", "Randomly"], 1]
  ]});
})();
