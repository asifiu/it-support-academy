/* Networking and Cisco CCNA 200-301 (v1.1) courses, one per exam domain.
   Weights (third-party sources, Nov 2026): Fundamentals 20%, Access 20%, IP Connectivity 25%,
   IP Services 10%, Security 15%, Automation 10%. Practise every command in the CLI trainer or Packet Tracer. */
window.COURSES = (window.COURSES || []).concat([
{ id: "net", title: "Network fundamentals", icon: "grid", level: "Beginner", hours: 10,
  short: "OSI and TCP/IP, cabling, Ethernet, IPv4 and subnetting, IPv6, TCP and UDP, and the Cisco CLI.",
  cert: "CCNA domain 1 (20%) and CCST Networking",
  modules: [
  { id: "models", title: "OSI, TCP/IP and devices", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Networks are built in layers. Each layer does one job and hands its data to the next. Knowing the layer of a problem tells you which tool and which team to use."],
    ["svg", "osi", "OSI layers, TCP/IP layers and what lives where"],
    ["h", "Devices and their layer"],
    ["parts", [["Hub (legacy)", "Layer 1: repeats bits to every port"], ["Switch", "Layer 2: forwards frames by MAC address"], ["Router", "Layer 3: forwards packets between networks by IP"],
      ["Layer 3 switch", "Switching plus routing between VLANs"], ["Firewall", "Layers 3 to 7: allows or blocks traffic by rules"], ["Access point", "Bridges Wi-Fi clients onto the wired LAN"], ["Wireless LAN controller", "Manages many access points centrally"]]],
    ["part", "2", "Go deeper"],
    ["h", "Encapsulation"],
    ["p", "Going down the stack, each layer adds a header: data becomes a segment (TCP/UDP header with ports), a packet (IP header with addresses), a frame (Ethernet header with MAC addresses and a trailer), then bits on the wire. The receiver removes them in reverse."],
    ["h", "TCP vs UDP"],
    ["parts", [["TCP", "Connection (3-way handshake SYN, SYN-ACK, ACK), reliable, ordered: web, mail, SSH"], ["UDP", "No connection, no retransmission, low delay: DNS queries, voice, video, DHCP"]]],
    ["h", "Ports you must know"],
    ["parts", [["20/21 FTP", "File transfer"], ["22 SSH", "Secure remote CLI"], ["23 Telnet", "Insecure remote CLI"], ["25 SMTP", "Mail between servers"], ["53 DNS", "Name resolution (UDP and TCP)"],
      ["67/68 DHCP", "Address assignment"], ["69 TFTP", "Simple file transfer (device images)"], ["80/443 HTTP/HTTPS", "Web"], ["123 NTP", "Time"], ["161/162 SNMP", "Monitoring"], ["514 Syslog", "Log messages"]]],
    ["part", "3", "Practice"],
    ["steps", ["Capture a web request in Wireshark and find each layer's header", "Learn the port table until you can write it from memory", "Install Cisco Packet Tracer (free with a Networking Academy account)"]]
  ], quiz: [
    ["A switch forwards frames using...", ["IP addresses", "MAC addresses", "Port numbers", "Hostnames"], 1],
    ["Which protocol uses a 3-way handshake?", ["UDP", "TCP", "ICMP", "ARP"], 1],
    ["Port 22 is...", ["Telnet", "SSH", "SMTP", "DNS"], 1],
    ["Encapsulation order going down:", ["Frame, packet, segment", "Segment, packet, frame", "Packet, segment, frame", "Bits, frame, packet"], 1]
  ]},
  { id: "ipv4", title: "IPv4 addressing and subnetting", blocks: [
    ["part", "1", "Big picture"],
    ["one", "An IPv4 address has 32 bits split into a network part and a host part. The prefix length (/24) says where the split is."],
    ["h", "Private ranges and special addresses"],
    ["parts", [["10.0.0.0/8", "Private, large companies"], ["172.16.0.0/12", "Private, 172.16 to 172.31"], ["192.168.0.0/16", "Private, homes and small offices"],
      ["127.0.0.0/8", "Loopback (this device)"], ["169.254.0.0/16", "APIPA: no DHCP answer"], ["100.64.0.0/10", "Carrier-grade NAT"]]],
    ["part", "2", "Go deeper"],
    ["h", "The subnetting method"],
    ["steps", ["Block size = 256 minus the mask value in the interesting octet (/26 = 255.255.255.192, block 64)",
      "Networks start at multiples of the block: .0, .64, .128, .192", "Broadcast = next network minus 1", "Usable hosts = 2^(host bits) minus 2 (/26: 2^6 - 2 = 62)"]],
    ["eg", "Host 192.168.10.77/26: block 64, so the network is 192.168.10.64, broadcast 192.168.10.127, usable .65 to .126."],
    ["h", "Quick table"],
    ["parts", [["/24 = .0", "254 hosts"], ["/25 = .128", "126 hosts"], ["/26 = .192", "62 hosts"], ["/27 = .224", "30 hosts"], ["/28 = .240", "14 hosts"], ["/29 = .248", "6 hosts"], ["/30 = .252", "2 hosts (point-to-point links)"]]],
    ["h", "VLSM"],
    ["p", "Variable-length subnet masks give each network only what it needs: a /26 for 50 users, a /28 for 10 printers, /30s for router links. Always assign the largest subnets first."],
    ["part", "3", "Practice"],
    ["steps", ["Open the Subnetting trainer in this app and do 20 questions a day until you score 20/20 in under 10 minutes", "Plan VLSM for 100 users, 50 users, 20 servers and 3 WAN links from 10.10.0.0/24"]]
  ], quiz: [
    ["Usable hosts in a /27:", ["14", "30", "62", "126"], 1],
    ["Network address of 10.1.1.200/26:", ["10.1.1.128", "10.1.1.192", "10.1.1.0", "10.1.1.200"], 1],
    ["A PC has 169.254.20.5. Likely cause:", ["DNS error", "No DHCP answer", "Wrong gateway", "Duplicate MAC"], 1],
    ["Best prefix for a point-to-point router link:", ["/24", "/28", "/30", "/16"], 2]
  ]},
  { id: "ipv6", title: "IPv6 essentials", blocks: [
    ["part", "1", "Big picture"],
    ["one", "IPv6 uses 128-bit addresses written in hex. Every interface usually has several addresses at once."],
    ["h", "Writing addresses"],
    ["steps", ["2001:0db8:0000:0000:0000:0000:0000:0001 becomes 2001:db8::1", "Drop leading zeros in each group", "Replace one run of zero groups with :: (only once per address)"]],
    ["parts", [["Global unicast 2000::/3", "Public, routable"], ["Unique local fc00::/7", "Private (like 10.x)"], ["Link-local fe80::/10", "Only on the local link; always present"], ["Multicast ff00::/8", "One to many; IPv6 has no broadcast"], ["::1", "Loopback"]]],
    ["part", "2", "Go deeper"],
    ["h", "Getting an address"],
    ["parts", [["SLAAC", "Host builds its own address from the router's prefix (router advertisements)"], ["DHCPv6 stateful", "Server assigns addresses"], ["EUI-64", "Interface ID built from the MAC address with FFFE inserted"]]],
    ["cmd", "ipv6 unicast-routing", "Cisco global config: enable IPv6 routing on a router"],
    ["cmd", "ipv6 address 2001:db8:1:1::1/64", "Cisco interface config: set an IPv6 address"],
    ["part", "3", "Practice"],
    ["steps", ["Run ipconfig on your PC and find your fe80:: link-local address", "Shorten five long IPv6 addresses by hand"]]
  ], quiz: [
    ["Link-local addresses start with...", ["2001", "fe80", "ff02", "fc00"], 1],
    ["IPv6 replaces broadcast with...", ["Anycast only", "Multicast", "Unicast", "ARP"], 1],
    ["How many times can :: appear in one address?", ["Once", "Twice", "Unlimited", "Never"], 0]
  ]},
  { id: "cli", title: "The Cisco IOS command line", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Cisco devices are configured in a text CLI with modes. The prompt tells you where you are."],
    ["parts", [["Switch>", "User EXEC: look only"], ["Switch#", "Privileged EXEC: show, debug, copy, reload (enter with enable)"], ["Switch(config)#", "Global configuration (configure terminal)"],
      ["Switch(config-if)#", "Interface configuration (interface g0/1)"], ["Switch(config-line)#", "Console or VTY lines"]]],
    ["part", "2", "Go deeper"],
    ["h", "First configuration of a device"],
    ["cmd", "enable\nconfigure terminal\nhostname SW1\nenable secret Cisco123!\nservice password-encryption\nbanner motd #Authorised access only#", "Name, privileged password, hide passwords, warning banner"],
    ["cmd", "line console 0\n password Console1!\n login\n exec-timeout 5 0", "Protect the console port"],
    ["cmd", "copy running-config startup-config", "Save; running-config lives in RAM and is lost on reboot"],
    ["h", "Show commands you use daily"],
    ["parts", [["show running-config", "Current configuration"], ["show ip interface brief", "Interfaces, IPs, up/down at a glance"], ["show interfaces", "Errors, speed, duplex"], ["show version", "IOS version, uptime"], ["show cdp neighbors", "Directly connected Cisco devices"]]],
    ["tip", "Commands can be shortened (conf t, sh ip int br), the Tab key completes them and ? lists what is possible."],
    ["part", "3", "Practice"],
    ["steps", ["Open the Cisco CLI trainer in this app and complete Lab 1", "Repeat the same in Packet Tracer and save the .pkt in your repo"]]
  ], quiz: [
    ["Enter privileged EXEC mode:", ["configure terminal", "enable", "login", "exit"], 1],
    ["Save the configuration permanently:", ["show run", "copy running-config startup-config", "reload", "write erase"], 1],
    ["Interfaces and IPs at a glance:", ["show version", "show ip interface brief", "show clock", "show flash"], 1]
  ]}
  ]},

{ id: "ccna-switch", title: "Switching, VLANs and wireless", icon: "server", level: "Intermediate", hours: 10,
  short: "VLANs, trunks, inter-VLAN routing, STP, EtherChannel, CDP/LLDP and wireless LAN architecture.",
  cert: "CCNA domain 2: Network Access (20%)",
  modules: [
  { id: "vlan", title: "VLANs and trunks", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A VLAN splits one physical switch into several separate networks. A trunk carries many VLANs over one link by tagging each frame (802.1Q)."],
    ["svg", "vlan", "Access ports belong to one VLAN; the trunk carries them all"],
    ["part", "2", "Go deeper"],
    ["h", "Configuring VLANs and access ports"],
    ["cmd", "vlan 10\n name SALES\nvlan 20\n name HR\ninterface range g0/1 - 12\n switchport mode access\n switchport access vlan 10", "Create VLANs and put ports into VLAN 10"],
    ["h", "Configuring a trunk"],
    ["cmd", "interface g0/24\n switchport mode trunk\n switchport trunk allowed vlan 10,20\n switchport trunk native vlan 99", "802.1Q trunk carrying VLANs 10 and 20, unused native VLAN 99"],
    ["cmd", "show vlan brief\nshow interfaces trunk", "Check VLAN membership and trunks"],
    ["h", "Inter-VLAN routing"],
    ["parts", [["Router on a stick", "One router port with subinterfaces (g0/0.10, encapsulation dot1Q 10)"], ["Layer 3 switch (SVI)", "interface vlan 10 with an IP; enable ip routing"]]],
    ["warn", "The native VLAN is untagged. A mismatch between the two ends of a trunk leaks traffic between VLANs; set the same unused native VLAN on both sides."],
    ["part", "3", "Practice"],
    ["steps", ["CLI trainer Lab 2: VLANs and a trunk", "Packet Tracer: two switches, VLANs 10 and 20, router on a stick, ping between VLANs"]]
  ], quiz: [
    ["Standard for VLAN tagging on trunks:", ["802.1X", "802.1Q", "802.3ad", "802.11"], 1],
    ["Show which ports are in which VLAN:", ["show vlan brief", "show ip route", "show cdp", "show arp"], 0],
    ["On a router-on-a-stick subinterface you need...", ["switchport mode trunk", "encapsulation dot1Q <vlan>", "spanning-tree portfast", "ip helper-address"], 1]
  ]},
  { id: "stp", title: "Spanning Tree and EtherChannel", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Redundant switch links create loops that flood the network. Spanning Tree blocks extra paths; EtherChannel bundles links so they act as one."],
    ["part", "2", "Go deeper"],
    ["h", "How STP decides"],
    ["steps", ["Elect a root bridge: lowest bridge ID (priority, then MAC)", "Each switch picks its root port: lowest cost path to the root", "Each segment gets one designated port", "All other ports block"]],
    ["parts", [["Rapid PVST+", "Cisco default today: one fast STP instance per VLAN"], ["PortFast", "Access ports to PCs go to forwarding at once"], ["BPDU Guard", "Shuts a PortFast port if a switch is plugged in"]]],
    ["cmd", "spanning-tree vlan 10 root primary\ninterface g0/5\n spanning-tree portfast\n spanning-tree bpduguard enable", "Make this switch root for VLAN 10; protect an access port"],
    ["h", "EtherChannel"],
    ["parts", [["LACP (802.3ad)", "Open standard: active / passive"], ["PAgP", "Cisco: desirable / auto"], ["Static", "mode on, no negotiation"]]],
    ["cmd", "interface range g0/23 - 24\n channel-group 1 mode active", "Bundle two links with LACP"],
    ["cmd", "show etherchannel summary\nshow spanning-tree", "Check bundles and STP roles"],
    ["part", "3", "Practice"],
    ["steps", ["Packet Tracer: three switches in a triangle, find the root and the blocked port", "Change the root with priority and watch the topology move", "Bundle two links with LACP"]]
  ], quiz: [
    ["Root bridge election uses the lowest...", ["IP address", "Bridge ID", "Port number", "VLAN ID"], 1],
    ["Protect an access port from someone plugging in a switch:", ["PortFast", "BPDU Guard", "Trunking", "LACP"], 1],
    ["Open-standard EtherChannel protocol:", ["PAgP", "LACP", "VTP", "CDP"], 1]
  ]},
  { id: "wlan", title: "Wireless LANs", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Wi-Fi connects clients to access points over radio. In companies many APs are managed by a wireless LAN controller or cloud dashboard."],
    ["parts", [["2.4 GHz", "Longer range, only 3 non-overlapping channels (1, 6, 11), crowded"], ["5 GHz", "More channels, faster, shorter range"], ["6 GHz (Wi-Fi 6E/7)", "Lots of clean spectrum, newest devices"]]],
    ["part", "2", "Go deeper"],
    ["h", "Architectures"],
    ["parts", [["Autonomous AP", "Each AP configured on its own"], ["Lightweight AP + WLC", "APs tunnel to a controller with CAPWAP"], ["Cloud-managed", "Meraki-style dashboard"]]],
    ["h", "Security"],
    ["parts", [["WPA2-Personal / WPA3-Personal (SAE)", "Shared passphrase; home and guest"], ["WPA2/WPA3-Enterprise", "802.1X with a RADIUS server; each user signs in"], ["WEP / open", "Insecure; never for company data"]]],
    ["part", "3", "Practice"],
    ["steps", ["Run netsh wlan show interfaces and note channel, band and signal", "Packet Tracer: configure a WLC with a WPA2-Enterprise WLAN"]]
  ], quiz: [
    ["Non-overlapping 2.4 GHz channels:", ["1, 6, 11", "1, 2, 3", "36, 40, 44", "1, 5, 9, 13"], 0],
    ["Lightweight APs talk to the controller with...", ["CAPWAP", "LACP", "STP", "OSPF"], 0],
    ["Each user signs in with their own account:", ["WPA2-Personal", "WPA3-Enterprise (802.1X)", "WEP", "Open"], 1]
  ]}
  ]},

{ id: "ccna-route", title: "Routing and IP connectivity", icon: "arrowRight", level: "Intermediate", hours: 10,
  short: "The routing table, static and default routes, OSPFv2 single-area, and first-hop redundancy.",
  cert: "CCNA domain 3: IP Connectivity (25%, the biggest)",
  modules: [
  { id: "table", title: "The routing table", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A router forwards each packet by looking up the destination in its routing table and choosing the most specific match."],
    ["h", "Reading show ip route"],
    ["parts", [["C", "Connected network"], ["L", "Local address of the router itself (/32)"], ["S", "Static route"], ["S*", "Static default route (gateway of last resort)"], ["O", "Learned by OSPF"], ["D", "Learned by EIGRP"]]],
    ["part", "2", "Go deeper"],
    ["h", "How the router chooses"],
    ["steps", ["Longest prefix match wins: 10.1.1.0/24 beats 10.1.0.0/16 for 10.1.1.5", "For equal prefixes from different sources, lowest administrative distance wins", "For equal routes from the same protocol, lowest metric wins"]],
    ["parts", [["Connected", "AD 0"], ["Static", "AD 1"], ["eBGP", "AD 20"], ["EIGRP", "AD 90"], ["OSPF", "AD 110"], ["RIP", "AD 120"]]],
    ["h", "Static and default routes"],
    ["cmd", "ip route 192.168.20.0 255.255.255.0 10.0.0.2\nip route 0.0.0.0 0.0.0.0 203.0.113.1", "Route to one network, and a default route to the internet"],
    ["cmd", "ip route 192.168.20.0 255.255.255.0 10.0.0.6 5", "Floating static: backup route with AD 5, used only if the main one disappears"],
    ["part", "3", "Practice"],
    ["steps", ["CLI trainer Lab 3: router interfaces and a static route", "Packet Tracer: three routers in a line, make end-to-end ping work with static routes"]]
  ], quiz: [
    ["Packet to 10.1.1.5; routes for 10.1.0.0/16 and 10.1.1.0/24 exist. Used route:", ["/16", "/24", "Both", "Default"], 1],
    ["Administrative distance of OSPF:", ["90", "110", "120", "1"], 1],
    ["Default route syntax:", ["ip route 0.0.0.0 0.0.0.0 <next-hop>", "ip default 0", "route add default", "ip route any any"], 0]
  ]},
  { id: "ospf", title: "OSPFv2", blocks: [
    ["part", "1", "Big picture"],
    ["one", "OSPF is a link-state routing protocol: every router learns the full map of its area and calculates the shortest path itself."],
    ["part", "2", "Go deeper"],
    ["h", "Key ideas"],
    ["steps", ["Routers send hellos to form neighbours (hello and dead timers must match, same area, same subnet)", "On Ethernet segments a DR and BDR are elected to reduce updates (highest priority, then highest router ID)",
      "Routers exchange LSAs and build the same database", "Each runs Dijkstra (SPF) to find the best paths; cost is based on bandwidth"]],
    ["cmd", "router ospf 1\n router-id 1.1.1.1\n network 10.0.0.0 0.0.0.255 area 0\n passive-interface g0/1", "Single-area OSPF; passive on the LAN port so no hellos go to PCs"],
    ["cmd", "show ip ospf neighbor\nshow ip route ospf\nshow ip ospf interface brief", "Neighbours, learned routes, OSPF interfaces"],
    ["h", "Why neighbours do not come up"],
    ["parts", [["Area mismatch", "Both sides must be in the same area"], ["Timers differ", "Hello/dead intervals must match"], ["Subnet or mask mismatch", "Interfaces must be in the same subnet"], ["Passive interface", "No hellos are sent"], ["Duplicate router ID", "Each router ID must be unique"]]],
    ["part", "3", "Practice"],
    ["steps", ["Packet Tracer: three routers in area 0, check neighbours and routes", "Break it on purpose (wrong area) and fix it using show commands"]]
  ], quiz: [
    ["OSPF is a...", ["Distance-vector protocol", "Link-state protocol", "Path-vector protocol", "Static method"], 1],
    ["Stop OSPF hellos on a LAN port toward PCs:", ["shutdown", "passive-interface", "no network", "ip ospf cost 0"], 1],
    ["Neighbours must match in...", ["Hostname", "Area and timers", "Router ID", "IOS version"], 1]
  ]},
  { id: "fhrp", title: "First-hop redundancy", blocks: [
    ["part", "1", "Big picture"],
    ["one", "PCs have only one default gateway. A first-hop redundancy protocol lets two routers share one virtual gateway IP, so a router failure does not cut users off."],
    ["parts", [["HSRP", "Cisco: active and standby router, virtual IP and MAC"], ["VRRP", "Open standard version of the same idea"], ["GLBP", "Cisco: shares load across several routers"]]],
    ["part", "2", "Go deeper"],
    ["cmd", "interface g0/0\n standby 1 ip 192.168.1.1\n standby 1 priority 110\n standby 1 preempt", "HSRP: this router becomes active for virtual gateway 192.168.1.1"],
    ["cmd", "show standby brief", "Which router is active"],
    ["part", "3", "Practice"],
    ["steps", ["Packet Tracer: two routers with HSRP, shut the active one and keep pinging"]]
  ], quiz: [
    ["Open standard first-hop redundancy protocol:", ["HSRP", "VRRP", "GLBP", "OSPF"], 1],
    ["Clients use the HSRP...", ["Physical IP of the active router", "Virtual IP", "Loopback", "DNS name only"], 1]
  ]}
  ]},

{ id: "ccna-services", title: "IP services", icon: "sync", level: "Intermediate", hours: 6,
  short: "NAT, DHCP, DNS, NTP, SNMP, syslog, QoS, SSH and file transfer on Cisco devices.",
  cert: "CCNA domain 4: IP Services (10%)",
  modules: [
  { id: "nat", title: "NAT and DHCP", blocks: [
    ["part", "1", "Big picture"],
    ["one", "NAT lets many private addresses share public ones; DHCP hands out addresses automatically."],
    ["parts", [["Static NAT", "One private to one public (servers)"], ["Dynamic NAT", "Private addresses use a pool of public ones"], ["PAT (overload)", "Many private addresses share one public IP by port numbers: what every office router does"]]],
    ["part", "2", "Go deeper"],
    ["cmd", "access-list 1 permit 192.168.1.0 0.0.0.255\ninterface g0/0\n ip nat inside\ninterface g0/1\n ip nat outside\nip nat inside source list 1 interface g0/1 overload", "PAT: the LAN shares the outside interface address"],
    ["cmd", "show ip nat translations", "Current translations"],
    ["h", "DHCP on a router and relay"],
    ["cmd", "ip dhcp excluded-address 192.168.1.1 192.168.1.10\nip dhcp pool LAN\n network 192.168.1.0 255.255.255.0\n default-router 192.168.1.1\n dns-server 192.168.1.10", "Router as DHCP server"],
    ["cmd", "interface g0/2\n ip helper-address 10.0.0.5", "DHCP relay: forward client broadcasts to a central DHCP server"],
    ["part", "3", "Practice"],
    ["steps", ["Packet Tracer: router with PAT and a DHCP pool; check translations while browsing", "Move DHCP to a server and use ip helper-address"]]
  ], quiz: [
    ["Many users share one public IP using ports:", ["Static NAT", "PAT", "Dynamic NAT", "NAT64"], 1],
    ["Forward DHCP broadcasts to another subnet:", ["ip helper-address", "ip nat outside", "ip dhcp snooping", "ip route"], 0]
  ]},
  { id: "mgmt", title: "Management services", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Every network device needs correct time, central logs, monitoring and secure remote access."],
    ["parts", [["NTP", "Same time everywhere; logs and certificates depend on it"], ["Syslog", "Send device logs to a central server; severity 0 (emergency) to 7 (debug)"], ["SNMP", "Monitoring tools read counters; use SNMPv3 with authentication and encryption"],
      ["SSH", "Encrypted remote CLI; Telnet is plain text"], ["TFTP / FTP / SCP", "Copy IOS images and configs"], ["QoS", "Prioritise voice and video when links are busy"]]],
    ["part", "2", "Go deeper"],
    ["h", "Enabling SSH"],
    ["cmd", "ip domain-name lab.local\ncrypto key generate rsa modulus 2048\nusername admin secret Str0ngPass!\nip ssh version 2\nline vty 0 4\n transport input ssh\n login local", "SSH v2 with a local user; Telnet disabled"],
    ["cmd", "ntp server 10.0.0.1\nlogging host 10.0.0.20\nlogging trap warnings", "Time source and central logging"],
    ["h", "Syslog severities"],
    ["parts", [["0 Emergency", "System unusable"], ["3 Error", "Error conditions"], ["4 Warning", "Warning conditions"], ["6 Informational", "Normal events"], ["7 Debugging", "Debug messages"]]],
    ["part", "3", "Practice"],
    ["steps", ["CLI trainer Lab 4: secure remote access with SSH", "Packet Tracer: point a router at an NTP and syslog server"]]
  ], quiz: [
    ["Encrypted remote CLI:", ["Telnet", "SSH", "TFTP", "SNMPv1"], 1],
    ["Syslog severity 0 is...", ["Debug", "Emergency", "Warning", "Informational"], 1],
    ["Secure SNMP version:", ["v1", "v2c", "v3", "v4"], 2]
  ]}
  ]},

{ id: "ccna-security", title: "Network security", icon: "alert", level: "Intermediate", hours: 8,
  short: "Threats, ACLs, port security, DHCP snooping, ARP inspection, AAA, VPNs and wireless security.",
  cert: "CCNA domain 5: Security Fundamentals (15%)",
  modules: [
  { id: "acl", title: "Access control lists", blocks: [
    ["part", "1", "Big picture"],
    ["one", "An ACL is an ordered list of permit and deny lines. The router checks from the top and stops at the first match; at the end there is an invisible deny any."],
    ["parts", [["Standard ACL (1-99)", "Matches source IP only; place close to the destination"], ["Extended ACL (100-199)", "Source, destination, protocol and port; place close to the source"], ["Named ACL", "Same, with a readable name and editable line numbers"]]],
    ["part", "2", "Go deeper"],
    ["h", "Wildcard masks"],
    ["p", "Wildcards are inverted masks: 0 means 'must match', 255 means 'any'. 192.168.1.0 0.0.0.255 matches the whole /24; host 10.0.0.5 equals 10.0.0.5 0.0.0.0."],
    ["cmd", "ip access-list extended WEB-ONLY\n permit tcp 192.168.10.0 0.0.0.255 any eq 443\n permit udp 192.168.10.0 0.0.0.255 any eq 53\n deny ip any any log\ninterface g0/1\n ip access-group WEB-ONLY in", "Allow only HTTPS and DNS out of VLAN 10"],
    ["warn", "Order matters: a broad permit above a specific deny makes the deny useless. Write the most specific lines first."],
    ["part", "3", "Practice"],
    ["steps", ["Write an ACL that lets HR reach the HR server only on 443", "Test in Packet Tracer and read the hit counters with show access-lists"]]
  ], quiz: [
    ["Every ACL ends with an implicit...", ["permit any", "deny any", "log", "nothing"], 1],
    ["Wildcard for one host:", ["0.0.0.0", "255.255.255.255", "0.0.0.255", "255.0.0.0"], 0],
    ["Extended ACLs are best placed close to the...", ["Destination", "Source", "Internet", "Core"], 1]
  ]},
  { id: "l2sec", title: "Layer 2 security and AAA", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Most attacks inside a LAN abuse switches: unknown devices, fake DHCP servers, ARP spoofing. Switch features stop them."],
    ["parts", [["Port security", "Limit MAC addresses per port; shut or restrict on violation"], ["DHCP snooping", "Only trusted ports may answer DHCP; blocks rogue DHCP servers"], ["Dynamic ARP inspection", "Checks ARP replies against the DHCP snooping table"], ["802.1X", "Users or devices authenticate before the port opens"]]],
    ["part", "2", "Go deeper"],
    ["cmd", "interface g0/5\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security violation restrict\n switchport port-security mac-address sticky", "Allow two learned MACs on a desk port"],
    ["cmd", "ip dhcp snooping\nip dhcp snooping vlan 10\ninterface g0/24\n ip dhcp snooping trust", "Only the uplink may answer DHCP"],
    ["h", "AAA"],
    ["parts", [["Authentication", "Who are you"], ["Authorisation", "What may you do"], ["Accounting", "What did you do"], ["RADIUS", "Open standard, UDP; common for network access and Wi-Fi"], ["TACACS+", "Cisco, TCP 49; separates the three As; common for device admin"]]],
    ["h", "VPNs"],
    ["parts", [["Site-to-site IPsec", "Connects two offices over the internet"], ["Remote access", "Users connect from home (SSL/TLS or IPsec clients)"]]],
    ["part", "3", "Practice"],
    ["steps", ["Packet Tracer: port security with sticky MACs, then plug in a second PC and see the violation", "Explain RADIUS vs TACACS+ in one minute"]]
  ], quiz: [
    ["Block a rogue DHCP server:", ["Port security", "DHCP snooping", "BPDU Guard", "HSRP"], 1],
    ["TACACS+ uses...", ["UDP 1812", "TCP 49", "UDP 514", "TCP 22"], 1],
    ["Users authenticate before a switch port opens:", ["802.1Q", "802.1X", "802.3ad", "802.11ac"], 1]
  ]}
  ]},

{ id: "ccna-auto", title: "Automation and programmability", icon: "chat", level: "Intermediate", hours: 5,
  short: "Controller-based networking, SDN, REST APIs, JSON and configuration tools like Ansible.",
  cert: "CCNA domain 6: Automation and Programmability (10%)",
  modules: [
  { id: "sdn", title: "Controllers, APIs and JSON", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Instead of typing into each device, engineers increasingly describe what they want and let controllers and scripts configure many devices at once."],
    ["parts", [["Data plane", "Forwards traffic"], ["Control plane", "Decides where traffic goes (routing protocols, STP)"], ["Management plane", "How we configure and monitor (CLI, SNMP, APIs)"],
      ["SDN controller", "Central brain: Cisco Catalyst Center (formerly DNA Center), SD-WAN"], ["Northbound API", "Controller to apps and scripts"], ["Southbound API", "Controller to devices"]]],
    ["part", "2", "Go deeper"],
    ["h", "REST APIs"],
    ["parts", [["GET", "Read"], ["POST", "Create"], ["PUT / PATCH", "Replace / update"], ["DELETE", "Remove"], ["200 / 201", "OK / created"], ["401 / 403 / 404", "Not authenticated / forbidden / not found"]]],
    ["h", "JSON"],
    ["cmd", "{\n  \"hostname\": \"SW1\",\n  \"vlans\": [10, 20],\n  \"mgmt\": { \"ip\": \"10.0.0.11\", \"ssh\": true }\n}", "Objects in { }, arrays in [ ], keys always in double quotes"],
    ["h", "Configuration management"],
    ["parts", [["Ansible", "Agentless, pushes over SSH, playbooks in YAML"], ["Terraform", "Infrastructure as code, declarative"], ["Puppet / Chef", "Agent-based, pull model"]]],
    ["part", "3", "Practice"],
    ["steps", ["Use Cisco DevNet's free sandboxes and call a REST API with your browser or Postman", "Write a JSON description of your lab switch", "Read a simple Ansible playbook that sets a hostname"]]
  ], quiz: [
    ["Plane that decides where traffic goes:", ["Data", "Control", "Management", "User"], 1],
    ["HTTP method to read data:", ["POST", "GET", "DELETE", "PUT"], 1],
    ["Agentless tool using SSH and YAML playbooks:", ["Puppet", "Chef", "Ansible", "SNMP"], 2]
  ]}
  ]}
]);
