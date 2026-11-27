/* Practice trainers: a Cisco IOS CLI simulator with guided labs, and a subnetting trainer.
   The simulator covers the commands used in CCNA basics; it is a learning tool, not a full IOS. */
window.TRAINERS = (function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- IPv4 helpers ---------------- */
  const ip2n = (ip) => ip.split(".").reduce((a, o) => (a * 256) + (+o), 0);
  const n2ip = (n) => [24, 16, 8, 0].map((s) => Math.floor(n / Math.pow(2, s)) % 256).join(".");
  const isIp = (s) => /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split(".").every((o) => +o <= 255);
  const maskLen = (m) => { if (!isIp(m)) return -1; const b = ip2n(m).toString(2).padStart(32, "0"); return /^1*0*$/.test(b) ? b.indexOf("0") === -1 ? 32 : b.indexOf("0") : -1; };
  const lenMask = (l) => n2ip(l === 0 ? 0 : (Math.pow(2, 32) - Math.pow(2, 32 - l)));

  /* ---------------- CLI simulator ---------------- */
  function newDevice(kind) {
    const ifs = {};
    if (kind === "switch") {
      for (let i = 1; i <= 24; i++) ifs["GigabitEthernet0/" + i] = { mode: "dynamic", vlan: 1, shut: false, ip: null, desc: "", allowed: "all", native: 1 };
      ifs["Vlan1"] = { shut: true, ip: null, desc: "", svi: true };
    } else {
      for (let i = 0; i <= 2; i++) ifs["GigabitEthernet0/" + i] = { shut: true, ip: null, desc: "", routed: true };
    }
    return { kind, hostname: kind === "switch" ? "Switch" : "Router", mode: "user", cur: [], vlanCur: null, line: null,
      secret: null, encrypt: false, banner: "", domain: "", rsa: false, sshv: 1, users: {}, vty: { transport: "all", login: "" }, con: { password: "", login: false },
      vlans: { 1: "default" }, routes: [], gateway: "", ifs, saved: null, history: [] };
  }
  const prompt = (d) => d.hostname + ({ user: ">", priv: "#", config: "(config)#", if: d.cur.length > 1 ? "(config-if-range)#" : "(config-if)#", vlan: "(config-vlan)#", line: "(config-line)#" }[d.mode]);

  function ifName(d, raw) {
    const m = String(raw).toLowerCase().match(/^(g|gi|gig|giga|gigabitethernet|f|fa|fastethernet|vlan|v)\s*([\d/]+)$/);
    if (!m) return null;
    if (m[1].startsWith("v")) return d.ifs["Vlan" + m[2]] ? "Vlan" + m[2] : (d.kind === "switch" ? (d.ifs["Vlan" + m[2]] = { shut: true, ip: null, desc: "", svi: true }, "Vlan" + m[2]) : null);
    const n = "GigabitEthernet" + m[2];
    return d.ifs[n] ? n : null;
  }
  function ifRange(d, text) {
    // "g0/1 - 12", "g0/1-12", "g0/1 - 4 , g0/24"
    const out = [];
    for (const part of text.split(",")) {
      const m = part.replace(/\s+/g, "").toLowerCase().match(/^([a-z]+)(\d+)\/(\d+)(?:-(\d+))?$/);
      if (!m) return null;
      const a = +m[3], b = m[4] ? +m[4] : a;
      for (let i = a; i <= b; i++) { const n = ifName(d, m[1] + m[2] + "/" + i); if (!n) return null; out.push(n); }
    }
    return out.length ? out : null;
  }
  const short = (n) => n.replace("GigabitEthernet", "Gi");
  function vlanList(s) { if (!/^[\d,\-]+$/.test(s)) return null; const out = []; s.split(",").forEach((p) => { const [a, b] = p.split("-").map(Number); for (let i = a; i <= (b || a); i++) out.push(i); }); return out; }

  function runningConfig(d) {
    const L = ["Building configuration...", "", "Current configuration:", "!", "hostname " + d.hostname, "!"];
    if (d.encrypt) L.push("service password-encryption");
    if (d.secret) L.push("enable secret 9 $9$" + btoa(d.secret).replace(/=/g, "").slice(0, 18));
    if (d.domain) L.push("ip domain-name " + d.domain);
    if (d.sshv === 2) L.push("ip ssh version 2");
    Object.entries(d.users).forEach(([u]) => L.push("username " + u + " secret 9 $9$*****"));
    if (d.kind === "switch") Object.entries(d.vlans).filter(([v]) => v !== "1").forEach(([v, n]) => { L.push("!", "vlan " + v, " name " + n); });
    L.push("!");
    Object.entries(d.ifs).forEach(([n, i]) => {
      L.push("interface " + n);
      if (i.desc) L.push(" description " + i.desc);
      if (d.kind === "switch" && !i.svi) {
        if (i.mode === "access") { L.push(" switchport mode access"); if (i.vlan !== 1) L.push(" switchport access vlan " + i.vlan); }
        if (i.mode === "trunk") { L.push(" switchport mode trunk"); if (i.allowed !== "all") L.push(" switchport trunk allowed vlan " + i.allowed); if (i.native !== 1) L.push(" switchport trunk native vlan " + i.native); }
      }
      if (i.ip) L.push(" ip address " + i.ip + " " + i.mask); else if (i.svi || i.routed) L.push(" no ip address");
      if (i.shut) L.push(" shutdown");
      L.push("!");
    });
    d.routes.forEach((r) => L.push("ip route " + r.join(" ")));
    if (d.gateway) L.push("ip default-gateway " + d.gateway);
    if (d.banner) L.push("banner motd ^C" + d.banner + "^C");
    L.push("!", "line con 0" + (d.con.password ? "\n password " + (d.encrypt ? "7 0822455D0A16" : d.con.password) : "") + (d.con.login ? "\n login" : ""));
    L.push("line vty 0 4" + (d.vty.login === "local" ? "\n login local" : d.vty.login ? "\n login" : "") + (d.vty.transport !== "all" ? "\n transport input " + d.vty.transport : ""));
    L.push("!", "end");
    return L.join("\n");
  }
  function ipBrief(d) {
    const rows = [["Interface", "IP-Address", "OK?", "Method", "Status", "Protocol"]];
    Object.entries(d.ifs).forEach(([n, i]) => {
      const up = !i.shut && (i.svi ? Object.values(d.ifs).some((p) => !p.svi && !p.shut && (p.vlan === +n.slice(4) || p.mode === "trunk")) : (d.kind === "switch" ? +n.split("/")[1] <= 3 || i.mode === "trunk" : !!i.ip));
      rows.push([n, i.ip || "unassigned", "YES", i.ip ? "manual" : "unset", i.shut ? "administratively down" : (up ? "up" : "down"), i.shut ? "down" : (up ? "up" : "down")]);
    });
    const w = [23, 16, 4, 7, 22, 8];
    return rows.map((r) => r.map((c, k) => String(c).padEnd(w[k])).join("")).join("\n");
  }
  function vlanBrief(d) {
    const L = ["VLAN Name                             Status    Ports", "---- -------------------------------- --------- -------------------------------"];
    Object.entries(d.vlans).forEach(([v, name]) => {
      const ports = Object.entries(d.ifs).filter(([, i]) => !i.svi && i.mode !== "trunk" && i.vlan === +v).map(([n]) => short(n));
      const chunks = []; for (let k = 0; k < ports.length; k += 4) chunks.push(ports.slice(k, k + 4).join(", "));
      L.push(String(v).padEnd(5) + name.padEnd(33) + "active    " + (chunks[0] || ""));
      chunks.slice(1).forEach((c) => L.push(" ".repeat(48) + c));
    });
    return L.join("\n");
  }
  function trunks(d) {
    const t = Object.entries(d.ifs).filter(([, i]) => i.mode === "trunk");
    if (!t.length) return "";
    return ["Port        Mode         Encapsulation  Status        Native vlan"].concat(t.map(([n, i]) => short(n).padEnd(12) + "on           802.1q         trunking      " + i.native),
      ["", "Port        Vlans allowed on trunk"], t.map(([n, i]) => short(n).padEnd(12) + (i.allowed === "all" ? "1-4094" : i.allowed))).join("\n");
  }

  /* Command table: [mode(s), pattern, handler]. "<x>" = argument, "<rest>" = rest of line. */
  const C = [];
  const def = (modes, pat, fn, help) => C.push({ modes: modes.split(" "), pat: pat.split(" "), fn, help: help || "" });
  const ALLEXEC = "user priv";
  def("user", "enable", (d) => { d.mode = "priv"; }, "Enter privileged mode");
  def("priv", "disable", (d) => { d.mode = "user"; }, "Back to user mode");
  def("priv", "configure terminal", (d) => { d.mode = "config"; return "Enter configuration commands, one per line.  End with CNTL/Z."; }, "Enter global configuration");
  def(ALLEXEC, "show version", (d) => `Cisco IOS Software, ${d.kind === "switch" ? "C2960 Software (C2960-LANBASEK9-M)" : "ISR4300 Software (X86_64_LINUX_IOSD-UNIVERSALK9-M)"}, Version 15.2 (training simulator)\n${d.hostname} uptime is 1 hour, 4 minutes`, "IOS version and uptime");
  def("priv", "show running-config", runningConfig, "Current configuration");
  def("priv", "show startup-config", (d) => d.saved || "startup-config is not present", "Saved configuration");
  def(ALLEXEC, "show ip interface brief", ipBrief, "Interfaces and IP addresses");
  def(ALLEXEC, "show vlan brief", (d) => d.kind === "switch" ? vlanBrief(d) : "% Invalid input: this is a router", "VLANs and their ports");
  def("priv", "show interfaces trunk", trunks, "Trunk ports");
  def("priv", "show ip route", (d) => {
    const L = ["Codes: L - local, C - connected, S - static", "", d.routes.some((r) => r[0] === "0.0.0.0") ? "Gateway of last resort is set" : "Gateway of last resort is not set", ""];
    Object.entries(d.ifs).forEach(([n, i]) => { if (i.ip && !i.shut) { const len = maskLen(i.mask); const net = n2ip(ip2n(i.ip) - ip2n(i.ip) % Math.pow(2, 32 - len)); L.push(`C        ${net}/${len} is directly connected, ${n}`, `L        ${i.ip}/32 is directly connected, ${n}`); } });
    d.routes.forEach((r) => L.push(`S${r[0] === "0.0.0.0" ? "*" : " "}       ${r[0]}/${maskLen(r[1])} [1/0] via ${r[2]}`));
    return L.join("\n");
  }, "Routing table");
  def(ALLEXEC, "ping <x>", (d, a) => isIp(a[0]) ? (Object.values(d.ifs).some((i) => i.ip && !i.shut) ? `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${a[0]}, timeout is 2 seconds:\n.!!!!\nSuccess rate is 80 percent (4/5)` : `Sending 5, 100-byte ICMP Echos to ${a[0]}:\n.....\nSuccess rate is 0 percent (0/5)`) : "% Unrecognized host or address", "Test reachability");
  def("priv", "copy running-config startup-config", (d) => { d.saved = runningConfig(d); return "Destination filename [startup-config]?\nBuilding configuration...\n[OK]"; }, "Save the configuration");
  def("priv", "write memory", (d) => { d.saved = runningConfig(d); return "Building configuration...\n[OK]"; }, "Save the configuration");
  def("priv", "reload", () => "Proceed with reload? [confirm]  (simulator: reload skipped)", "Restart the device");
  def("config", "hostname <x>", (d, a) => { d.hostname = a[0]; }, "Set the device name");
  def("config", "enable secret <x>", (d, a) => { d.secret = a[0]; }, "Privileged mode password (hashed)");
  def("config", "service password-encryption", (d) => { d.encrypt = true; }, "Hide plain-text passwords");
  def("config", "banner motd <rest>", (d, a) => { d.banner = a[0].replace(/^(.)(.*)\1$/, "$2"); }, "Login warning banner");
  def("config", "ip domain-name <x>", (d, a) => { d.domain = a[0]; }, "Domain name (needed for SSH keys)");
  def("config", "crypto key generate rsa <rest>", (d) => { if (!d.domain) return "% Please define a domain-name first."; d.rsa = true; return "The name for the keys will be: " + d.hostname + "." + d.domain + "\n% Generating 2048 bit RSA keys, keys will be non-exportable...\n[OK]"; }, "Create SSH keys (add: modulus 2048)");
  def("config", "crypto key generate rsa", (d) => { if (!d.domain) return "% Please define a domain-name first."; d.rsa = true; return "How many bits in the modulus [512]: 2048\n% Generating 2048 bit RSA keys ...[OK]"; });
  def("config", "ip ssh version <x>", (d, a) => { d.sshv = +a[0]; }, "SSH version 2");
  def("config", "username <x> secret <x>", (d, a) => { d.users[a[0]] = a[1]; }, "Local user account");
  def("config", "username <x> password <x>", (d, a) => { d.users[a[0]] = a[1]; });
  def("config", "ip route <x> <x> <x>", (d, a) => { if (!isIp(a[0]) || maskLen(a[1]) < 0 || !isIp(a[2])) return "% Invalid input detected."; d.routes.push(a.slice(0, 3)); }, "Static route: network mask next-hop");
  def("config", "ip default-gateway <x>", (d, a) => { d.gateway = a[0]; }, "Switch management gateway");
  def("config", "vlan <x>", (d, a) => { const v = +a[0]; if (!(v >= 1 && v <= 4094)) return "% Invalid VLAN"; if (!d.vlans[v]) d.vlans[v] = "VLAN" + String(v).padStart(4, "0"); d.vlanCur = v; d.mode = "vlan"; }, "Create or edit a VLAN");
  def("config", "no vlan <x>", (d, a) => { delete d.vlans[+a[0]]; });
  def("vlan", "name <x>", (d, a) => { d.vlans[d.vlanCur] = a[0]; }, "Name the VLAN");
  def("config", "interface range <rest>", (d, a) => { const r = ifRange(d, a[0]); if (!r) return "% Invalid interface range"; d.cur = r; d.mode = "if"; }, "Configure many ports at once");
  def("config", "interface <rest>", (d, a) => { const n = ifName(d, a[0]); if (!n) return "% Invalid interface"; d.cur = [n]; d.mode = "if"; }, "Configure an interface");
  def("config", "line vty <x> <x>", (d) => { d.line = "vty"; d.mode = "line"; }, "Remote access lines");
  def("config", "line console <x>", (d) => { d.line = "con"; d.mode = "line"; }, "Console port");
  def("line", "password <x>", (d, a) => { if (d.line === "con") d.con.password = a[0]; else d.vty.password = a[0]; }, "Line password");
  def("line", "login local", (d) => { if (d.line === "vty") d.vty.login = "local"; else d.con.login = true; }, "Use local usernames");
  def("line", "login", (d) => { if (d.line === "vty") d.vty.login = "line"; else d.con.login = true; }, "Ask for the line password");
  def("line", "transport input <x>", (d, a) => { d.vty.transport = a[0].toLowerCase(); }, "ssh, telnet or all");
  def("line", "exec-timeout <x> <x>", () => {}, "Auto logout after minutes seconds");
  const each = (d, f) => { for (const n of d.cur) { const r = f(d.ifs[n], n); if (r) return r; } };
  def("if", "description <rest>", (d, a) => each(d, (i) => { i.desc = a[0]; }), "Text label");
  def("if", "ip address <x> <x>", (d, a) => { if (!isIp(a[0]) || maskLen(a[1]) < 0) return "% Invalid input detected."; if (d.kind === "switch" && !d.ifs[d.cur[0]].svi) return "% IP addresses go on interface vlan on a layer 2 switch"; each(d, (i) => { i.ip = a[0]; i.mask = a[1]; }); }, "Address and mask");
  def("if", "no shutdown", (d) => each(d, (i, n) => { i.shut = false; }), "Turn the port on");
  def("if", "shutdown", (d) => each(d, (i) => { i.shut = true; }), "Turn the port off");
  def("if", "switchport mode <x>", (d, a) => { if (d.kind !== "switch") return "% Invalid input: router port"; const m = a[0].toLowerCase(); const isA = "access".startsWith(m), isT = "trunk".startsWith(m); if (!m || (!isA && !isT)) return "% Use access or trunk"; each(d, (i) => { i.mode = isA ? "access" : "trunk"; }); }, "access or trunk");
  def("if", "switchport access vlan <x>", (d, a) => { const v = +a[0]; if (!(v >= 1 && v <= 4094)) return "% Invalid VLAN"; const existed = !!d.vlans[v]; if (!existed) d.vlans[v] = "VLAN" + String(v).padStart(4, "0"); each(d, (i) => { i.vlan = v; if (i.mode !== "trunk") i.mode = i.mode === "dynamic" ? i.mode : i.mode; }); return existed ? "" : "% Access VLAN does not exist. Creating vlan " + v; }, "Put the port in a VLAN");
  def("if", "switchport trunk allowed vlan <x>", (d, a) => { if (!vlanList(a[0])) return "% Invalid VLAN list"; each(d, (i) => { i.allowed = a[0]; }); }, "VLANs carried by the trunk");
  def("if", "switchport trunk native vlan <x>", (d, a) => each(d, (i) => { i.native = +a[0]; }), "Untagged VLAN on the trunk");
  def("if", "spanning-tree portfast", () => "%Warning: portfast should only be enabled on ports connected to a single host.", "Fast start for PC ports");
  def("config if vlan line", "exit", (d) => { d.mode = d.mode === "config" ? "priv" : "config"; d.cur = []; }, "Up one level");
  def("config if vlan line", "end", (d) => { d.mode = "priv"; d.cur = []; }, "Back to privileged mode");
  def("user priv", "exit", (d) => { if (d.mode === "priv") d.mode = "user"; return "(simulator: session kept open)"; }, "Log out");

  function match(tokens, cmd) {
    const out = [];
    for (let k = 0; k < cmd.pat.length; k++) {
      const p = cmd.pat[k], t = tokens[k];
      if (p === "<rest>") { if (k >= tokens.length) return null; out.push(tokens.slice(k).join(" ")); return out; }
      if (t === undefined) return null;
      if (p === "<x>") { out.push(t); continue; }
      if (!p.startsWith(t.toLowerCase())) return null;
    }
    return tokens.length === cmd.pat.length ? out : null;
  }
  function exec(d, line) {
    let raw = line.trim();
    if (!raw) return "";
    if (raw.endsWith("?")) return helpFor(d, raw.slice(0, -1).trim());
    let tokens = raw.split(/\s+/);
    if (d.mode !== "user" && d.mode !== "priv" && tokens[0] === "do") { const save = d.mode; d.mode = "priv"; const r = exec(d, tokens.slice(1).join(" ")); d.mode = save; return r; }
    const cands = C.filter((c) => c.modes.includes(d.mode));
    for (const c of cands) { const a = match(tokens, c); if (a) { const r = c.fn(d, a); return r == null ? "" : r; } }
    if (["if", "vlan", "line"].includes(d.mode)) {
      // Like IOS: a global configuration command typed in a sub-mode runs in global configuration.
      for (const c of C.filter((x) => x.modes.includes("config"))) {
        const a = match(tokens, c);
        if (a) { const save = d.mode; d.mode = "config"; d.cur = []; const r = c.fn(d, a); if (d.mode === "config" && r && String(r).startsWith("%")) d.mode = save; return r == null ? "" : r; }
      }
    }
    if (C.some((c) => !c.modes.includes(d.mode) && match(tokens, c))) return "% This command is not available in this mode. Prompt " + prompt(d) + (d.mode === "user" ? " : type enable first." : d.mode === "priv" ? " : type configure terminal first." : " : use exit or end, or prefix with do.");
    return "% Invalid input detected. Type ? to see the commands available here.";
  }
  function helpFor(d, partial) {
    const tokens = partial ? partial.split(/\s+/) : [];
    const list = C.filter((c) => c.modes.includes(d.mode) && tokens.every((t, k) => c.pat[k] && (c.pat[k].startsWith("<") || c.pat[k].startsWith(t.toLowerCase()))));
    const seen = new Set(), rows = [];
    const FIRST = { show: "Show running system information", copy: "Copy from one file to another", write: "Write running configuration to memory", ip: "Global IP configuration", interface: "Select an interface to configure",
      line: "Configure a terminal line", crypto: "Encryption module", username: "Establish user name authentication", switchport: "Set switching mode characteristics", no: "Negate a command", spanning: "Spanning Tree", enable: "Modify enable password parameters", vlan: "VLAN commands", login: "Enable password checking", transport: "Define transport protocols for line" };
    list.forEach((c) => { const word = c.pat.slice(0, Math.max(tokens.length + 1, 1)).join(" "); if (!seen.has(word)) { seen.add(word); const multi = list.filter((x) => x.pat.slice(0, tokens.length + 1).join(" ") === word).length > 1; rows.push("  " + word.padEnd(40) + (multi && FIRST[word.split(" ").pop()] ? FIRST[word.split(" ").pop()] : c.help)); } });
    return rows.length ? rows.join("\n") : "% Unrecognized command";
  }
  function complete(d, text) {
    const tokens = text.split(/\s+/), last = tokens.pop().toLowerCase();
    const opts = new Set();
    C.filter((c) => c.modes.includes(d.mode)).forEach((c) => {
      if (tokens.every((t, k) => c.pat[k] && (c.pat[k].startsWith("<") || c.pat[k].startsWith(t.toLowerCase()))) && c.pat[tokens.length] && !c.pat[tokens.length].startsWith("<") && c.pat[tokens.length].startsWith(last)) opts.add(c.pat[tokens.length]);
    });
    return opts.size === 1 ? tokens.concat([...opts][0]).join(" ") + " " : text;
  }

  /* Guided labs: tasks are checked live against the device state. */
  const LABS = [
    { id: "basic", title: "Lab 1: First setup of a switch", device: "switch", intro: "A new switch arrives at a branch office. Give it a name, protect it and save the configuration.",
      tasks: [
        ["Enter privileged mode", (d) => d.mode !== "user" || d.history.some((h) => /^en/.test(h))],
        ["Enter global configuration mode", (d) => d.history.some((h) => /^conf/i.test(h))],
        ["Name the switch SW-BER-01", (d) => d.hostname === "SW-BER-01"],
        ["Set an enable secret", (d) => !!d.secret],
        ["Turn on service password-encryption", (d) => d.encrypt],
        ["Add a login banner (banner motd #Authorised access only#)", (d) => !!d.banner],
        ["Save the configuration", (d) => !!d.saved && d.saved.includes("hostname SW-BER-01")]
      ] },
    { id: "vlans", title: "Lab 2: VLANs and a trunk", device: "switch", intro: "Sales and HR must be separated. Create the VLANs, put the ports in them and build a trunk to the next switch.",
      tasks: [
        ["Create VLAN 10 named SALES", (d) => d.vlans[10] === "SALES"],
        ["Create VLAN 20 named HR", (d) => d.vlans[20] === "HR"],
        ["Ports Gi0/1 to Gi0/4: access ports in VLAN 10", (d) => [1, 2, 3, 4].every((i) => d.ifs["GigabitEthernet0/" + i].mode === "access" && d.ifs["GigabitEthernet0/" + i].vlan === 10)],
        ["Ports Gi0/5 to Gi0/8: access ports in VLAN 20", (d) => [5, 6, 7, 8].every((i) => d.ifs["GigabitEthernet0/" + i].mode === "access" && d.ifs["GigabitEthernet0/" + i].vlan === 20)],
        ["Gi0/24: trunk allowing VLANs 10 and 20", (d) => { const i = d.ifs["GigabitEthernet0/24"]; const v = vlanList(i.allowed === "all" ? "" : i.allowed) || []; return i.mode === "trunk" && v.includes(10) && v.includes(20); }],
        ["Check with show vlan brief", (d) => d.history.some((h) => /^(do )?sh\w* vl/i.test(h))],
        ["Save the configuration", (d) => !!d.saved && d.saved.includes("name HR")]
      ] },
    { id: "router", title: "Lab 3: Router interfaces and a static route", device: "router", intro: "Connect the office LAN to the WAN link and add a route to the second site 192.168.2.0/24.",
      tasks: [
        ["Name the router R1", (d) => d.hostname === "R1"],
        ["Gi0/0: 192.168.1.1 /24 (255.255.255.0) and turn it on", (d) => { const i = d.ifs["GigabitEthernet0/0"]; return i.ip === "192.168.1.1" && i.mask === "255.255.255.0" && !i.shut; }],
        ["Gi0/1: 10.0.0.1 /30 and turn it on", (d) => { const i = d.ifs["GigabitEthernet0/1"]; return i.ip === "10.0.0.1" && i.mask === "255.255.255.252" && !i.shut; }],
        ["Static route to 192.168.2.0/24 via 10.0.0.2", (d) => d.routes.some((r) => r[0] === "192.168.2.0" && r[1] === "255.255.255.0" && r[2] === "10.0.0.2")],
        ["Check with show ip route", (d) => d.history.some((h) => /^(do )?sh\w* ip ro/i.test(h))],
        ["Save the configuration", (d) => !!d.saved && d.saved.includes("ip route 192.168.2.0")]
      ] },
    { id: "ssh", title: "Lab 4: Secure remote access with SSH", device: "switch", intro: "Replace Telnet with SSH so admins can manage the switch securely.",
      tasks: [
        ["Name the switch SW1", (d) => d.hostname === "SW1"],
        ["Set the domain name lab.local", (d) => d.domain === "lab.local"],
        ["Generate RSA keys (crypto key generate rsa modulus 2048)", (d) => d.rsa],
        ["Create user admin with a secret", (d) => !!d.users.admin],
        ["Use SSH version 2", (d) => d.sshv === 2],
        ["VTY lines: login local and transport input ssh", (d) => d.vty.login === "local" && d.vty.transport === "ssh"],
        ["Save the configuration", (d) => !!d.saved && d.saved.includes("transport input ssh")]
      ] }
  ];

  function mountCli(host, labId, onTask) {
    const lab = LABS.find((l) => l.id === labId) || LABS[0];
    const d = newDevice(lab.device);
    let hIdx = -1;
    host.innerHTML = `<div class="cli-wrap">
      <div class="cli-tasks"><p class="pl-label">${esc(lab.device === "switch" ? "Cisco switch" : "Cisco router")}</p><h2>${esc(lab.title)}</h2><p class="muted">${esc(lab.intro)}</p>
        <ol class="cli-list">${lab.tasks.map((t) => `<li><span class="cli-tick"></span><span>${esc(t[0])}</span></li>`).join("")}</ol>
        <p class="cli-score"></p><button class="btn ghost cli-reset">Start again</button></div>
      <div class="cli" role="region" aria-label="Cisco command line simulator">
        <div class="cli-bar"><i></i><i></i><i></i><span>${esc(d.hostname)} console</span></div>
        <pre class="cli-out" aria-live="polite"></pre>
        <label class="cli-in"><span class="cli-prompt"></span><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command"></label>
        <p class="cli-hint">Tab completes, ? lists commands, arrow keys repeat earlier commands. Shortcuts like conf t and sh ip int br work.</p>
      </div></div>`;
    const out = host.querySelector(".cli-out"), inp = host.querySelector("input"), pr = host.querySelector(".cli-prompt");
    const items = host.querySelectorAll(".cli-list li"), score = host.querySelector(".cli-score");
    const doneSet = new Set();
    const print = (t, cls) => { const s = document.createElement("span"); if (cls) s.className = cls; s.textContent = t + "\n"; out.appendChild(s); out.scrollTop = out.scrollHeight; };
    function check() {
      lab.tasks.forEach((t, k) => {
        const ok = !!t[1](d);
        if (ok && !doneSet.has(k)) { doneSet.add(k); items[k].classList.add("ok"); if (window.MOTION) MOTION.pop(items[k]); }
      });
      score.textContent = `${doneSet.size} of ${lab.tasks.length} tasks done` + (doneSet.size === lab.tasks.length ? ". Lab complete." : "");
      if (doneSet.size === lab.tasks.length && onTask) onTask(lab.id);
    }
    function refresh() { pr.textContent = prompt(d) + " "; }
    print(`${d.hostname} con0 is now available\n\nPress RETURN to get started.\n`, "dim");
    refresh(); check();
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const line = inp.value; inp.value = ""; hIdx = -1;
        print(prompt(d) + " " + line, "echo");
        if (line.trim() && !line.trim().endsWith("?")) d.history.push(line.trim());
        const r = exec(d, line);
        if (r) print(r, r.startsWith("%") ? "err" : "");
        refresh(); check();
      } else if (e.key === "Tab") { e.preventDefault(); inp.value = complete(d, inp.value); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (d.history.length) { hIdx = hIdx < 0 ? d.history.length - 1 : Math.max(0, hIdx - 1); inp.value = d.history[hIdx]; } }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (hIdx >= 0) { hIdx = Math.min(d.history.length, hIdx + 1); inp.value = d.history[hIdx] || ""; if (hIdx >= d.history.length) hIdx = -1; } }
      else if (e.key === "?" ) { setTimeout(() => { const v = inp.value; print(prompt(d) + " " + v, "echo"); print(helpFor(d, v.slice(0, -1).trim())); inp.value = v.slice(0, -1); }, 0); }
    });
    host.querySelector(".cli").addEventListener("click", (e) => { if (!e.target.closest("input")) inp.focus({ preventScroll: true }); });
    host.querySelector(".cli-reset").onclick = () => mountCli(host, labId, onTask);
    return { device: d, exec: (l) => { const r = exec(d, l); d.history.push(l); check(); return r; } };
  }

  /* ---------------- Subnetting trainer ---------------- */
  function newQuestion() {
    const prefixes = [16, 20, 22, 23, 24, 25, 26, 26, 27, 27, 28, 28, 29, 30];
    const len = prefixes[Math.floor(Math.random() * prefixes.length)];
    const bases = [[10, 256], [172, 16], [192, 168]];
    const b = bases[Math.floor(Math.random() * 3)];
    const ip = b[0] === 10 ? `10.${rnd(0, 255)}.${rnd(0, 255)}.${rnd(1, 254)}` : b[0] === 172 ? `172.${rnd(16, 31)}.${rnd(0, 255)}.${rnd(1, 254)}` : `192.168.${rnd(0, 255)}.${rnd(1, 254)}`;
    const n = ip2n(ip), size = Math.pow(2, 32 - len), net = n - (n % size);
    return { ip, len, mask: lenMask(len), net: n2ip(net), bc: n2ip(net + size - 1), first: n2ip(net + 1), last: n2ip(net + size - 2), hosts: size - 2, size };
  }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function explain(q) {
    const oct = q.len >= 24 ? 4 : q.len >= 16 ? 3 : 2;
    const m = q.mask.split(".")[oct - 1], block = 256 - +m;
    return `/${q.len} = ${q.mask}. The interesting octet is octet ${oct} (mask ${m}), so the block size is 256 - ${m} = ${block}. ${q.ip} falls in the block starting at ${q.net}. Broadcast is the next block minus 1: ${q.bc}. Hosts: 2^${32 - q.len} - 2 = ${q.hosts}.`;
  }
  function mountSubnet(host, onScore) {
    let q = newQuestion(), streak = 0, best = +(localStorage.getItem("itsa-subnet-best") || 0), total = 0, right = 0;
    const fields = [["net", "Network address"], ["bc", "Broadcast address"], ["first", "First usable host"], ["last", "Last usable host"], ["hosts", "Usable hosts"], ["mask", "Subnet mask"]];
    function draw() {
      host.innerHTML = `<div class="sn">
        <div class="sn-q"><p class="pl-label">Question ${total + 1}</p><p class="sn-ip">${q.ip}<span>/${q.len}</span></p></div>
        <form class="sn-form">${fields.map(([k, l]) => `<label class="field">${l}<input name="${k}" inputmode="decimal" autocomplete="off" spellcheck="false"></label>`).join("")}
          <div class="sn-act"><button class="go" type="submit"><span class="dot">${ICON("check")}</span>Check<span class="chev">${ICON("chevrons")}</span></button></div></form>
        <div class="sn-res" aria-live="polite"></div>
        <div class="sn-stats"><span>Streak <b>${streak}</b></span><span>Best <b>${best}</b></span><span>Score <b>${right}/${total}</b></span></div></div>`;
      const f = host.querySelector("form");
      f.querySelector("input").focus({ preventScroll: true });
      f.onsubmit = (e) => {
        e.preventDefault();
        let all = true;
        fields.forEach(([k]) => {
          const inp = f[k], val = inp.value.trim().replace(/^\//, ""), ok = k === "hosts" ? +val === q.hosts : k === "mask" ? (val === q.mask || +val === q.len) : val === q[k];
          inp.classList.toggle("good", ok); inp.classList.toggle("bad", !ok);
          if (!ok) { all = false; if (window.MOTION) MOTION.shake(inp); }
        });
        total++; if (all) { right++; streak++; if (streak > best) { best = streak; localStorage.setItem("itsa-subnet-best", best); } } else streak = 0;
        if (onScore) onScore(right, total);
        host.querySelector(".sn-res").innerHTML = `<p class="${all ? "sn-good" : "sn-bad"}">${all ? "All correct." : "Not quite. Correct answers:"}</p>
          ${all ? "" : `<ul class="sn-ans">${fields.map(([k, l]) => `<li><span>${l}</span><b>${k === "mask" ? q.mask : q[k]}</b></li>`).join("")}</ul>`}
          <p class="sn-exp">${esc(explain(q))}</p><button class="btn sn-next">Next question</button>`;
        host.querySelector(".sn-stats").innerHTML = `<span>Streak <b>${streak}</b></span><span>Best <b>${best}</b></span><span>Score <b>${right}/${total}</b></span>`;
        const nb = host.querySelector(".sn-next"); nb.focus({ preventScroll: true });
        nb.onclick = () => { q = newQuestion(); draw(); if (window.MOTION) MOTION.step(host.querySelector(".sn"), 1); };
        if (window.MOTION) MOTION.animate(host.querySelector(".sn-res"), [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260 });
      };
    }
    draw();
  }

  return { LABS, mountCli, mountSubnet, _exec: exec, _newDevice: newDevice, _q: newQuestion };
})();
