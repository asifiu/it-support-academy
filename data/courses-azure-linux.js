/* Azure Administrator (aligned with the AZ-104 skill areas) and Linux administration courses.
   AZ-104 areas (Microsoft study guide, check current weights before booking): identities and governance,
   storage, compute, virtual networking, monitoring and maintenance. */
window.COURSES = (window.COURSES || []).concat([
{ id: "azure", title: "Azure administration", icon: "grid", level: "Intermediate", hours: 16, area: "Cloud",
  short: "Run Azure like an administrator: identities and governance, storage, VMs and containers, networking, monitoring and backup.",
  cert: "Prepares for Microsoft AZ-104 (Azure Administrator Associate)",
  modules: [
  { id: "gov", title: "Identities, access and governance", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Before anyone builds anything in Azure, an administrator decides who may do what, where, and within which rules and budgets."],
    ["parts", [["Management groups", "Group subscriptions to apply policy and access once"], ["Subscription", "Billing and access boundary"], ["Resource group", "Container for resources with the same lifecycle"],
      ["Azure RBAC", "Role-based access: who can do what at which scope"], ["Azure Policy", "Rules every resource must follow"], ["Tags", "Labels like owner, cost-centre, environment"], ["Locks", "Prevent deletion or changes (CanNotDelete, ReadOnly)"]]],
    ["part", "2", "Go deeper"],
    ["h", "RBAC in practice"],
    ["parts", [["Owner", "Full access including giving access to others"], ["Contributor", "Create and manage everything, but cannot give access"], ["Reader", "View only"], ["User Access Administrator", "Manage access only"]]],
    ["p", "Assign roles to groups, at the smallest scope that works (resource group rather than subscription). Entra ID roles (like User Administrator) manage the directory; Azure RBAC roles manage resources. They are separate systems."],
    ["h", "Policy and cost control"],
    ["steps", ["Policy examples: allowed locations (only EU regions), require a tag, deny public IPs on VMs", "Initiatives bundle many policies, for example the Microsoft cloud security benchmark", "Budgets in Cost Management send alerts at 50, 80, 100 percent", "Resource locks stop accidental deletion of production"]],
    ["cmd", "az group create -n rg-lab-weu -l westeurope --tags owner=asif env=lab", "Azure CLI: resource group with tags"],
    ["cmd", "az role assignment create --assignee <group-object-id> --role Reader --resource-group rg-lab-weu", "Give a group Reader on one resource group"],
    ["part", "3", "Practice"],
    ["steps", ["Use Microsoft Learn sandbox exercises (free) for RBAC and policy", "Write a naming and tagging standard for a small company", "Design management groups for: Production, Development, Sandbox"]]
  ], quiz: [
    ["Create and manage resources but not give access:", ["Owner", "Contributor", "Reader", "User Access Administrator"], 1],
    ["Enforce 'only EU regions':", ["Tags", "Azure Policy", "Budgets", "Locks"], 1],
    ["Prevent accidental deletion of a resource group:", ["A delete lock", "A tag", "Reader role", "A budget"], 0],
    ["Entra ID roles and Azure RBAC roles are...", ["The same system", "Separate systems", "Only for guests", "Only in AWS"], 1]
  ]},
  { id: "storage", title: "Storage", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A storage account holds blobs (files for apps and backups), Azure Files (SMB/NFS shares), queues and tables, with a chosen redundancy level."],
    ["parts", [["Blob storage", "Objects: backups, images, logs; access tiers Hot, Cool, Cold, Archive"], ["Azure Files", "SMB file shares in the cloud; can replace or extend a file server"], ["Managed disks", "Disks for VMs: Standard HDD/SSD, Premium SSD, Ultra"]]],
    ["part", "2", "Go deeper"],
    ["h", "Redundancy"],
    ["parts", [["LRS", "3 copies in one datacentre"], ["ZRS", "Copies across availability zones in one region"], ["GRS / RA-GRS", "Also copied to a paired region (read access with RA-GRS)"], ["GZRS", "Zones plus a paired region"]]],
    ["h", "Access and security"],
    ["steps", ["Prefer Entra ID authentication and RBAC over account keys", "Shared access signatures (SAS) give time-limited access to one container or blob", "Disable public network access; use private endpoints", "Lifecycle rules move old data to Cool or Archive to save money", "Soft delete and versioning protect against mistakes"]],
    ["h", "Moving data"],
    ["parts", [["AzCopy", "Command-line copy to and from storage"], ["Storage Explorer", "Desktop app to browse storage"], ["Azure File Sync", "Keeps an on-premises file server in sync with Azure Files"]]],
    ["cmd", "azcopy copy \"C:\\Backups\\*\" \"https://stlab.blob.core.windows.net/backups?<SAS>\" --recursive", "Upload a folder with AzCopy and a SAS token"],
    ["part", "3", "Practice"],
    ["steps", ["Create a storage account in the Learn sandbox, upload a file, create a SAS link that expires in one hour", "Set a lifecycle rule: move blobs to Cool after 30 days"]]
  ], quiz: [
    ["Copies across availability zones in one region:", ["LRS", "ZRS", "GRS", "Archive"], 1],
    ["Time-limited access to one blob without sharing the account key:", ["SAS token", "Resource lock", "Tag", "NSG"], 0],
    ["Replace an on-premises SMB file share:", ["Azure Files", "Queue storage", "Table storage", "Azure DNS"], 0]
  ]},
  { id: "compute", title: "Virtual machines, scale and containers", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Azure runs your workloads as virtual machines, scale sets, App Service web apps or containers. An administrator chooses the right size and keeps them available and patched."],
    ["parts", [["Virtual machine", "Full control of the OS; you patch it"], ["Availability zones / sets", "Spread VMs so one failure does not stop the service"], ["VM scale sets", "Many identical VMs that grow and shrink automatically"],
      ["App Service", "Host web apps without managing servers"], ["Azure Container Instances", "Run one container quickly"], ["Container Apps / AKS", "Run many containers; AKS is managed Kubernetes"]]],
    ["part", "2", "Go deeper"],
    ["h", "Running VMs well"],
    ["steps", ["Right-size: start small, watch CPU and memory in Azure Monitor, then resize", "Use Azure Bastion instead of public RDP/SSH ports", "Azure Update Manager schedules OS patching", "Back up with Azure Backup; test a restore", "Stop (deallocate) dev VMs at night to save money; reserved instances or savings plans for always-on servers"]],
    ["cmd", "az vm create -g rg-lab-weu -n vm-web01 --image Ubuntu2204 --size Standard_B2s --admin-username azureuser --generate-ssh-keys", "Create a small Linux VM"],
    ["cmd", "az vm deallocate -g rg-lab-weu -n vm-web01", "Stop and stop paying for compute"],
    ["h", "Infrastructure as code"],
    ["p", "ARM templates and Bicep describe resources in files, so environments can be rebuilt the same way every time. Senior administrators keep these files in Git and deploy them through pipelines."],
    ["part", "3", "Practice"],
    ["steps", ["Create and delete a VM in the Learn sandbox", "Read a small Bicep file that creates a storage account and change its name", "Explain availability zones vs availability sets in one minute"]]
  ], quiz: [
    ["Connect to VMs without opening RDP/SSH to the internet:", ["Azure Bastion", "Public IP", "Port forwarding", "Telnet"], 0],
    ["Identical VMs that scale automatically:", ["Availability set", "VM scale set", "Resource group", "Blob storage"], 1],
    ["Stop paying for a VM's compute when not needed:", ["Restart", "Deallocate", "Tag it", "Lock it"], 1]
  ]},
  { id: "vnet", title: "Virtual networking", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A virtual network (VNet) is your private network in Azure, divided into subnets, protected by network security groups, and connected to other VNets and to your offices."],
    ["parts", [["VNet and subnets", "Private address space, e.g. 10.20.0.0/16 split into /24 subnets"], ["NSG", "Allow/deny rules on subnets or network cards"], ["VNet peering", "Connect two VNets privately"],
      ["VPN Gateway", "Site-to-site VPN to the office, or point-to-site for users"], ["ExpressRoute", "Private line from a provider"], ["Azure DNS / Private DNS", "Name resolution for public and private zones"],
      ["Load Balancer / Application Gateway", "Spread traffic at layer 4 / layer 7 (with WAF)"], ["Azure Firewall", "Central managed firewall"]]],
    ["part", "2", "Go deeper"],
    ["h", "Hub and spoke"],
    ["p", "Common enterprise design: a hub VNet holds shared services (firewall, VPN gateway, DNS), spoke VNets hold workloads and peer to the hub. Traffic between spokes and to the internet goes through the hub firewall."],
    ["h", "NSG rules"],
    ["steps", ["Rules have a priority (lower number wins), source, destination, port, protocol, allow or deny", "Default rules allow traffic inside the VNet and deny inbound from the internet", "Use service tags (Internet, VirtualNetwork, Storage) instead of IP lists", "Troubleshoot with Network Watcher: IP flow verify and effective security rules"]],
    ["warn", "Plan address spaces before building. Overlapping ranges between VNets or with the office network make peering and VPN impossible later."],
    ["part", "3", "Practice"],
    ["steps", ["Plan address spaces for a hub, two spokes and an office network without overlap", "Create a VNet with two subnets and an NSG that allows only HTTPS in the Learn sandbox"]]
  ], quiz: [
    ["Connect two VNets privately:", ["VNet peering", "Public IP", "DNS zone", "NSG"], 0],
    ["NSG rule with priority 100 vs 200 for the same traffic:", ["200 wins", "100 wins", "Both apply", "Neither"], 1],
    ["Layer 7 load balancer with web application firewall:", ["Azure Load Balancer", "Application Gateway", "VPN Gateway", "Private DNS"], 1]
  ]},
  { id: "monitor", title: "Monitoring, backup and recovery", blocks: [
    ["part", "1", "Big picture"],
    ["one", "If you cannot see it, you cannot run it: metrics, logs and alerts tell you about problems before users do; backup and site recovery bring you back after a disaster."],
    ["parts", [["Azure Monitor metrics", "Numbers over time: CPU, disk, network"], ["Log Analytics workspace", "Central logs, queried with KQL"], ["Alerts and action groups", "Email, SMS, Teams or automation when a rule fires"],
      ["Azure Backup", "Scheduled backups of VMs, files and databases into a Recovery Services vault"], ["Azure Site Recovery", "Replicates VMs to another region for disaster recovery"]]],
    ["part", "2", "Go deeper"],
    ["h", "A first KQL query"],
    ["cmd", "Heartbeat\n| summarize LastSeen = max(TimeGenerated) by Computer\n| where LastSeen < ago(15m)", "Servers that stopped reporting in the last 15 minutes"],
    ["h", "Recovery objectives"],
    ["p", "RPO: how much data you may lose (time since last backup). RTO: how long until the service is back. Backup gives a good RPO for data; Site Recovery gives a short RTO for whole systems. Test both at least twice a year."],
    ["part", "3", "Practice"],
    ["steps", ["Run sample KQL queries in the free Log Analytics demo environment", "Write a backup and recovery plan for three servers: what, how often, how long kept, how tested"]]
  ], quiz: [
    ["Language to query Log Analytics:", ["SQL only", "KQL", "PowerShell", "YAML"], 1],
    ["Replicates VMs to another region:", ["Azure Backup", "Site Recovery", "Azure Policy", "Tags"], 1],
    ["Maximum acceptable data loss is the...", ["RTO", "RPO", "SLA", "TTL"], 1]
  ]}
  ]},

{ id: "linux", title: "Linux administration", icon: "server", level: "Intermediate", hours: 14, area: "Linux",
  short: "The shell, users and permissions, packages and services, networking and SSH, storage, scripting, logs and hardening.",
  cert: "Prepares for LPIC-1, CompTIA Linux+ or Linux Foundation LFCS",
  modules: [
  { id: "shell", title: "The shell and the filesystem", blocks: [
    ["part", "1", "Big picture"],
    ["one", "On Linux almost everything is done in the shell, and almost everything is a file: configuration, logs, even devices."],
    ["parts", [["/etc", "Configuration files"], ["/var/log", "Log files"], ["/home", "Users' home folders"], ["/root", "Home of the root user"], ["/usr/bin, /bin", "Programs"], ["/tmp", "Temporary files"], ["/dev", "Devices (disks, terminals)"], ["/proc, /sys", "Live information from the kernel"]]],
    ["part", "2", "Go deeper"],
    ["h", "Commands you will use every hour"],
    ["cmd", "pwd; ls -lah; cd /var/log; cd ~; cd -", "Where am I, list everything with sizes, move around"],
    ["cmd", "cp -r src dst; mv old new; rm -i file; mkdir -p a/b/c", "Copy, move/rename, remove (ask first), create folders"],
    ["cmd", "cat file; less file; head -n 20 file; tail -f /var/log/syslog", "Read files; follow a log live"],
    ["cmd", "grep -ri \"error\" /var/log; find / -name \"*.conf\" 2>/dev/null", "Search inside files; find files by name"],
    ["h", "Pipes and redirection"],
    ["cmd", "ps aux | grep nginx | wc -l\ndf -h > disk.txt\ncommand 2>> errors.log", "| sends output to the next command, > writes a file, >> appends, 2> is the error stream"],
    ["tip", "man <command> opens the manual; most commands also accept --help."],
    ["part", "3", "Practice"],
    ["steps", ["Play OverTheWire Bandit levels 0 to 10 (free, over SSH)", "On your LNX01 VM: find the 5 largest files in /var with du -ah /var | sort -h | tail -5"]]
  ], quiz: [
    ["Configuration files live in...", ["/home", "/etc", "/tmp", "/dev"], 1],
    ["Follow a log file live:", ["cat -f", "tail -f", "less -l", "grep -f"], 1],
    ["Append output to a file:", [">", ">>", "|", "2>"], 1]
  ]},
  { id: "users", title: "Users, groups, permissions and sudo", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Every file has an owner, a group and permissions for owner, group and others. Admins work as normal users and use sudo only when needed."],
    ["h", "Reading permissions"],
    ["p", "-rw-r----- means: a file, owner can read and write, group can read, others nothing. In numbers r=4, w=2, x=1, so rw-r----- = 640. For folders, x means 'can enter'."],
    ["parts", [["chmod 640 file", "Set permissions"], ["chown anna:it file", "Change owner and group"], ["useradd -m -s /bin/bash anna", "Create user with home folder"], ["passwd anna", "Set password"], ["usermod -aG sudo anna", "Add to a group (keep -a!)"], ["id anna", "Show user and groups"]]],
    ["part", "2", "Go deeper"],
    ["h", "sudo"],
    ["p", "sudo runs one command as root and logs it. Who may use it is set in /etc/sudoers; always edit it with visudo, which checks syntax. Give rights to groups (%admins) and only for the commands needed."],
    ["h", "Special permissions"],
    ["parts", [["setuid (4xxx)", "Program runs as the file owner (e.g. passwd)"], ["setgid on a folder (2xxx)", "New files inherit the folder's group: good for shared team folders"], ["sticky bit (1xxx)", "Only the owner may delete their files (/tmp)"]]],
    ["warn", "usermod -G without -a REPLACES all groups of the user. Always use usermod -aG."],
    ["part", "3", "Practice"],
    ["steps", ["Create users anna and ben and a group it; make /srv/it writable for the group with setgid", "Give the it group sudo rights only for systemctl restart nginx via visudo"]]
  ], quiz: [
    ["chmod 750 gives others...", ["read", "nothing", "read+execute", "everything"], 1],
    ["Safe way to edit sudo rules:", ["nano /etc/sudoers", "visudo", "chmod 777", "echo >> sudoers"], 1],
    ["Add anna to group docker without removing others:", ["usermod -G docker anna", "usermod -aG docker anna", "groupadd anna", "chown docker anna"], 1]
  ]},
  { id: "services", title: "Packages, services and logs", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Software comes from package repositories; services are started and watched by systemd; logs tell you why something failed."],
    ["parts", [["apt (Debian, Ubuntu)", "apt update && apt upgrade; apt install nginx"], ["dnf (RHEL, Rocky, Fedora)", "dnf update; dnf install nginx"], ["systemctl", "start, stop, restart, enable, status of services"], ["journalctl", "Read systemd logs"]]],
    ["part", "2", "Go deeper"],
    ["cmd", "sudo systemctl enable --now nginx\nsystemctl status nginx\njournalctl -u nginx --since \"1 hour ago\"", "Start now and at boot; status; logs of the last hour"],
    ["cmd", "systemctl list-units --failed", "All failed services"],
    ["h", "Troubleshooting a service"],
    ["steps", ["systemctl status: is it running, what was the last error", "journalctl -u name -e: read the end of the log", "Check the config syntax (nginx -t, sshd -t)", "Check the port: ss -tlnp | grep :80", "Check the firewall (ufw status / firewall-cmd --list-all) and SELinux (getenforce)"]],
    ["part", "3", "Practice"],
    ["steps", ["Install nginx, break its config on purpose, find the error with nginx -t and journalctl, fix it", "Write a cron job that deletes files older than 7 days in /tmp/reports"]]
  ], quiz: [
    ["Start a service now and at every boot:", ["systemctl start", "systemctl enable --now", "service on", "apt start"], 1],
    ["Logs of one systemd service:", ["journalctl -u <name>", "cat /etc/passwd", "dmesg -u", "ls /var"], 0],
    ["Which process listens on port 80:", ["ss -tlnp", "ping", "df -h", "chmod"], 0]
  ]},
  { id: "net", title: "Networking, SSH and firewalls", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Linux servers are managed over the network, almost always with SSH. You check addresses, routes and DNS with a few commands and protect the server with a firewall."],
    ["cmd", "ip a; ip r; ss -tulpn; resolvectl status", "Addresses, routes, listening ports, DNS settings"],
    ["cmd", "ping -c 4 8.8.8.8; dig example.com; curl -I https://example.com", "Reachability, DNS lookup, HTTP test"],
    ["part", "2", "Go deeper"],
    ["h", "SSH done properly"],
    ["steps", ["Create a key on your PC: ssh-keygen -t ed25519", "Copy it to the server: ssh-copy-id user@server", "In /etc/ssh/sshd_config set PasswordAuthentication no and PermitRootLogin no, then sshd -t and systemctl reload ssh", "Use ~/.ssh/config for short host names"]],
    ["h", "Firewalls"],
    ["parts", [["ufw (Ubuntu)", "ufw allow 22/tcp; ufw allow 443/tcp; ufw enable"], ["firewalld (RHEL)", "firewall-cmd --add-service=https --permanent; firewall-cmd --reload"], ["nftables", "The modern packet filter underneath"]]],
    ["warn", "Allow SSH in the firewall BEFORE enabling it, or you lock yourself out of a remote server."],
    ["part", "3", "Practice"],
    ["steps", ["Set up key-only SSH to your LNX01 VM", "Enable ufw allowing only 22 and 443 and test from Windows"]]
  ], quiz: [
    ["Modern command to show IP addresses:", ["ifconfig only", "ip a", "ipconfig", "netsh"], 1],
    ["Disable password logins for SSH in...", ["/etc/ssh/sshd_config", "/etc/hosts", "/etc/passwd", "~/.bashrc"], 0],
    ["Before enabling a firewall on a remote server you must...", ["Reboot", "Allow SSH", "Delete iptables", "Install nginx"], 1]
  ]},
  { id: "storage", title: "Disks, LVM and backups", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Disks are partitioned, formatted with a filesystem and mounted into the single directory tree. LVM lets you grow storage without downtime."],
    ["cmd", "lsblk; df -h; du -sh /var/*; blkid", "Disks and partitions, free space, folder sizes, UUIDs"],
    ["part", "2", "Go deeper"],
    ["h", "Adding a disk"],
    ["steps", ["Partition: fdisk /dev/sdb or parted", "Format: mkfs.ext4 /dev/sdb1 (or xfs)", "Mount: mkdir /data; mount /dev/sdb1 /data", "Make it permanent in /etc/fstab using the UUID, then test with mount -a"]],
    ["h", "LVM in one picture"],
    ["p", "Physical volumes (disks) form a volume group; logical volumes are carved from it and can be extended online: lvextend -r -L +10G /dev/vg_data/lv_data grows the volume and the filesystem."],
    ["h", "Backups"],
    ["parts", [["rsync -a --delete", "Mirror folders, locally or over SSH"], ["tar -czf", "Archive and compress"], ["Snapshots (LVM, cloud)", "Fast, consistent point in time"], ["Borg / Restic", "Deduplicated, encrypted backups"]]],
    ["part", "3", "Practice"],
    ["steps", ["Add a virtual disk to LNX01, create an ext4 filesystem and mount it via /etc/fstab", "Back up /etc to /data with tar every night via cron"]]
  ], quiz: [
    ["Permanent mounts are configured in...", ["/etc/fstab", "/etc/hosts", "/proc/mounts", "/etc/sudoers"], 0],
    ["Grow a logical volume and its filesystem together:", ["lvextend -r", "mkfs", "fdisk -g", "mount -a"], 0],
    ["Show disks and partitions as a tree:", ["lsblk", "ls -l", "ps", "top"], 0]
  ]},
  { id: "scripting", title: "Bash scripting and automation", blocks: [
    ["part", "1", "Big picture"],
    ["one", "Anything you type twice can become a script; anything a script does on a schedule becomes a cron job or a systemd timer."],
    ["cmd", "#!/usr/bin/env bash\nset -euo pipefail\nlimit=80\nuse=$(df / --output=pcent | tail -1 | tr -dc '0-9')\nif (( use > limit )); then\n  echo \"$(date -Is) disk at ${use}%\" >> /var/log/disk-alert.log\nfi", "Disk usage alert: strict mode, variables, command substitution, if"],
    ["part", "2", "Go deeper"],
    ["h", "Building blocks"],
    ["parts", [["Variables", "name=value (no spaces); use \"$name\" with quotes"], ["Loops", "for f in *.log; do gzip \"$f\"; done"], ["Exit codes", "0 = success; check with $? or if command; then"], ["Functions", "backup() { tar -czf \"$1.tgz\" \"$1\"; }"], ["set -euo pipefail", "Stop on errors, unset variables and failed pipes"]]],
    ["h", "Scheduling"],
    ["cmd", "crontab -e\n0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1", "Run every night at 02:00 and log the output"],
    ["h", "From scripts to configuration management"],
    ["p", "When you manage many servers, use Ansible: an inventory of hosts and YAML playbooks that describe the wanted state. It connects over SSH and needs no agent."],
    ["part", "3", "Practice"],
    ["steps", ["Write the disk alert script above, make it executable (chmod +x) and schedule it", "Write a script that creates users from a CSV file", "Install Ansible and run a playbook that installs nginx on LNX01"]]
  ], quiz: [
    ["Stop a bash script on the first error:", ["set -e", "exit 0", "echo $?", "chmod +x"], 0],
    ["Cron line for every day at 02:00:", ["0 2 * * *", "2 0 * * *", "* 2 * * *", "0 0 2 * *"], 0],
    ["Agentless configuration management over SSH:", ["Puppet", "Ansible", "Chef", "SCCM"], 1]
  ]},
  { id: "hardening", title: "Hardening and containers", level: "Senior", blocks: [
    ["part", "1", "Big picture"],
    ["one", "A production Linux server is minimal, patched, monitored and locked down. Many applications now run in containers on top of it."],
    ["h", "Hardening checklist"],
    ["steps", ["Install only what is needed; remove unused services", "Automatic security updates (unattended-upgrades / dnf-automatic)", "Key-only SSH, no root login, fail2ban against brute force", "Firewall default deny inbound", "SELinux (RHEL) or AppArmor (Ubuntu) enforcing", "Central logging and monitoring (rsyslog to a SIEM, Prometheus node exporter)", "Benchmark with CIS or Lynis and fix findings"]],
    ["part", "2", "Go deeper"],
    ["h", "Containers"],
    ["parts", [["Image", "Read-only template (nginx:1.27)"], ["Container", "A running instance of an image"], ["Dockerfile", "Recipe to build an image"], ["Volume", "Persistent data outside the container"], ["Registry", "Where images are stored (Docker Hub, Azure Container Registry)"], ["Kubernetes", "Runs and heals many containers across many servers"]]],
    ["cmd", "docker run -d --name web -p 8080:80 nginx\ndocker ps\ndocker logs web\ndocker exec -it web sh", "Run, list, read logs, open a shell inside"],
    ["h", "Security of containers"],
    ["steps", ["Use small official base images and scan them (Trivy)", "Do not run as root inside the container", "Never bake secrets into images", "Pin versions; rebuild regularly for patches"]],
    ["part", "3", "Practice"],
    ["steps", ["Run Lynis on LNX01 and fix the top five suggestions", "Install Docker, run nginx in a container and serve your own index.html from a volume"]]
  ], quiz: [
    ["Block repeated SSH login attempts:", ["fail2ban", "nginx", "cron", "rsync"], 0],
    ["A running instance of an image is a...", ["Volume", "Container", "Registry", "Dockerfile"], 1],
    ["Never put this into a container image:", ["Your app", "Secrets", "A base OS", "Labels"], 1]
  ]}
  ]}
]);
