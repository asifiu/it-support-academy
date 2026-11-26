/* ITIL Foundation course, 8 lessons (one per week), then a 40-question mock.
   Exam facts (checked Nov 2026 from secondary sources; confirm on peoplecert.org before booking):
   ITIL Version 5 Foundation launched early 2026. 40 multiple-choice questions, 60 minutes, closed book,
   pass 26/40 (65%). Non-native speakers may get extra time. ITIL 4 is still offered.
   Version 5 weights reported: key terms 30%, service value system 40%, four dimensions 10%,
   product & service lifecycle 10%, value streams 5%, AI 2.5%, other frameworks 2.5%.
   The core ideas below (value, outcomes, utility/warranty, guiding principles, four dimensions)
   are the same in ITIL 4 and Version 5. Where names differ, the lesson says so. */
window.ITIL = {
  exam: { questions: 40, minutes: 60, pass: 26 },
  lessons: [
  { id: "I1", title: "Key terms 1: value, service, product, stakeholders",
    notes: [
      ["Service management", "A set of specialised organisational capabilities for enabling value for customers in the form of services."],
      ["Value", "The perceived benefits, usefulness and importance of something. Value is co-created by provider and consumer."],
      ["Organisation", "A person or group with its own functions, responsibilities, authorities and relationships to reach its objectives."],
      ["Product", "A configuration of an organisation's resources designed to offer value for a consumer."],
      ["Service", "A means of enabling value co-creation by facilitating outcomes customers want, without the customer managing specific costs and risks."],
      ["Service offering", "A description of one or more services, designed for a target group. It can include goods, access to resources and service actions."],
      ["Service relationship", "Cooperation between provider and consumer: provision, consumption and relationship management."],
      ["Customer / User / Sponsor", "Customer defines requirements and owns the outcome. User uses the service. Sponsor authorises the budget."]
    ],
    job: "On the service desk: the user calls you, the customer (e.g. head of sales) agreed the service, the sponsor (finance) pays for it.",
    quiz: [
      ["Who authorises budget for service consumption?", ["User", "Customer", "Sponsor", "Supplier"], 2],
      ["Value in ITIL is...", ["Created only by the provider", "Co-created by provider and consumer", "Only financial", "Fixed by contract"], 1],
      ["A service enables outcomes WITHOUT the customer managing...", ["Users", "Specific costs and risks", "Requirements", "Feedback"], 1],
      ["A description of services for a target group is a...", ["Service offering", "Product", "Practice", "Value stream"], 0],
      ["The person who uses the service day to day is the...", ["Sponsor", "User", "Customer", "Supplier"], 1],
      ["A configuration of resources designed to offer value:", ["Product", "Outcome", "Output", "Risk"], 0]
    ] },
  { id: "I2", title: "Key terms 2: output, outcome, cost, risk, utility, warranty",
    notes: [
      ["Output", "A tangible or intangible deliverable of an activity (e.g. a laptop handed over)."],
      ["Outcome", "A result for a stakeholder enabled by one or more outputs (e.g. the new employee works from day one)."],
      ["Cost", "Money spent on an activity or resource. Services remove some costs and may impose others."],
      ["Risk", "A possible event that could cause harm or loss, or make it harder to reach objectives. Also uncertainty of outcome."],
      ["Utility", "Fit for purpose: what the service does. Functionality that meets a need."],
      ["Warranty", "Fit for use: how it performs. Availability, capacity, security, continuity."],
      ["Service level", "One or more metrics that define expected or achieved service quality."],
      ["Quality", "The totality of a product's or service's characteristics relevant to meeting needs."]
    ],
    job: "Email that works but is down every Monday has utility but poor warranty. An SLA states the warranty in numbers (e.g. 99.5% availability).",
    quiz: [
      ["'Fit for purpose' describes...", ["Warranty", "Utility", "Risk", "Cost"], 1],
      ["Availability and security are part of...", ["Utility", "Warranty", "Output", "Sponsor"], 1],
      ["A laptop delivered to a new hire is an...", ["Outcome", "Output", "Value stream", "Risk"], 1],
      ["'The new hire can work on day one' is an...", ["Output", "Outcome", "Cost", "Warranty"], 1],
      ["A possible event that could cause harm or loss:", ["Risk", "Utility", "Outcome", "Offering"], 0],
      ["Metrics that define expected service quality:", ["Service level", "Product", "Sponsor", "Change"], 0]
    ] },
  { id: "I3", title: "The four dimensions",
    notes: [
      ["Why", "Every service must be looked at from four sides, or something gets forgotten."],
      ["1. Organisations and people", "Structure, roles, skills, culture, communication."],
      ["2. Information and technology", "The information managed and the technology used (apps, infrastructure, AI)."],
      ["3. Partners and suppliers", "Other organisations involved in designing, delivering and supporting services."],
      ["4. Value streams and processes", "How the parts work together to create value; activities, workflows, controls."],
      ["External factors (PESTLE)", "Political, Economic, Social, Technological, Legal, Environmental factors affect all four dimensions."],
      ["Version 5 note", "Version 5 frames the dimensions under 'product and service management'. The four names are what you learn."]
    ],
    job: "Rolling out Intune: train staff (people), set up tenant (technology), check the reseller licence contract (suppliers), define the enrolment workflow (processes).",
    quiz: [
      ["Which is NOT one of the four dimensions?", ["Organisations and people", "Partners and suppliers", "Marketing and sales", "Value streams and processes"], 2],
      ["Contracts with a hardware vendor belong to...", ["Information and technology", "Partners and suppliers", "Organisations and people", "PESTLE"], 1],
      ["Skills and culture belong to...", ["Organisations and people", "Value streams and processes", "Partners and suppliers", "Technology"], 0],
      ["The 'L' in PESTLE is...", ["Logistics", "Legal", "Leadership", "Lean"], 1],
      ["Workflows and controls belong to...", ["Value streams and processes", "Information and technology", "Partners", "People"], 0],
      ["A cloud provider hosting your ticket tool is considered in...", ["Partners and suppliers", "Organisations and people", "Governance", "Continual improvement"], 0]
    ] },
  { id: "I4", title: "The seven guiding principles",
    notes: [
      ["Focus on value", "Everything should link back to value for stakeholders."],
      ["Start where you are", "Measure and reuse what already works before building new."],
      ["Progress iteratively with feedback", "Small steps, check, adjust."],
      ["Collaborate and promote visibility", "Work across teams; make work and decisions visible."],
      ["Think and work holistically", "No service or part stands alone; see the whole system."],
      ["Keep it simple and practical", "Fewest steps that achieve the objective; cut what adds no value."],
      ["Optimise and automate", "Optimise first, then automate. Automating a bad process makes a fast bad process."],
      ["Exam tip", "Questions describe a situation and ask which principle applies. Look for the key word: 'existing' = start where you are; 'small steps' = iteratively; 'remove steps' = keep it simple."]
    ],
    job: "Before writing a PowerShell script for onboarding, first remove pointless approval steps (keep it simple), then automate.",
    quiz: [
      ["'Assess what already exists before building new' is...", ["Focus on value", "Start where you are", "Optimise and automate", "Think holistically"], 1],
      ["'Deliver in small steps and check results':", ["Progress iteratively with feedback", "Keep it simple", "Collaborate", "Start where you are"], 0],
      ["What should happen before automation?", ["Optimisation", "Outsourcing", "Hiring", "Nothing"], 0],
      ["'Remove steps that do not add value':", ["Keep it simple and practical", "Focus on value", "Think holistically", "Collaborate"], 0],
      ["How many guiding principles are there?", ["4", "5", "7", "9"], 2],
      ["Making work and decisions visible to others:", ["Collaborate and promote visibility", "Optimise and automate", "Start where you are", "Focus on value"], 0]
    ] },
  { id: "I5", title: "The service value system (SVS)",
    notes: [
      ["Purpose", "Shows how all parts of an organisation work together to turn opportunity and demand into value."],
      ["Inputs", "Opportunity and demand."],
      ["Components (ITIL 4)", "Guiding principles, governance, service value chain, practices, continual improvement."],
      ["Output", "Value for the organisation, its customers and other stakeholders."],
      ["Governance", "How the organisation is directed and controlled: evaluate, direct, monitor."],
      ["Continual improvement", "Ongoing at every level. Model: What is the vision? Where are we now? Where do we want to be? How do we get there? Take action. Did we get there? How do we keep the momentum?"],
      ["Version 5 note", "Sources differ on whether Version 5 keeps the 'service value chain' or replaces it with the product and service lifecycle. Read the official syllabus section on the SVS before your exam."]
    ],
    job: "Monthly ticket review where the team picks one recurring issue to fix is continual improvement in action.",
    quiz: [
      ["The inputs of the SVS are...", ["Opportunity and demand", "Cost and risk", "Users and tickets", "Outputs"], 0],
      ["The output of the SVS is...", ["Tickets", "Value", "Changes", "Contracts"], 1],
      ["Governance activities:", ["Evaluate, direct, monitor", "Plan, do, check", "Buy, build, run", "Detect, log, close"], 0],
      ["First question of the continual improvement model:", ["Where are we now?", "What is the vision?", "Did we get there?", "Take action"], 1],
      ["Continual improvement happens...", ["Only yearly", "At all levels, all the time", "Only after outages", "Only in IT"], 1]
    ] },
  { id: "I6", title: "Product and service lifecycle + value streams",
    notes: [
      ["Lifecycle (Version 5)", "Discover, Design, Acquire, Build, Transition, Operate, Deliver, Support. Iterative, not a straight line."],
      ["Discover", "Understand needs, opportunities and demand."],
      ["Design", "Shape the product or service and its experience."],
      ["Acquire / Build", "Obtain or create the components."],
      ["Transition", "Move new or changed services into live use safely."],
      ["Operate / Deliver / Support", "Run it, deliver it to users, help them when it fails."],
      ["Value stream", "A series of steps an organisation takes to create and deliver products and services to consumers. Example: 'new employee gets a working laptop'."],
      ["ITIL 4 equivalent", "ITIL 4 value chain activities: plan, improve, engage, design & transition, obtain/build, deliver & support."]
    ],
    job: "The service desk lives mostly in Support and Deliver, but every ticket feeds Discover (what users need next).",
    quiz: [
      ["Moving a new service into live use is...", ["Discover", "Transition", "Acquire", "Design"], 1],
      ["The lifecycle is...", ["Strictly linear", "Iterative", "Only for software", "Yearly"], 1],
      ["Steps that create and deliver value to consumers:", ["Value stream", "Governance", "Sponsor", "Warranty"], 0],
      ["Fixing a user's broken app belongs mostly to...", ["Support", "Discover", "Acquire", "Design"], 0],
      ["Understanding needs and demand:", ["Discover", "Operate", "Build", "Transition"], 0]
    ] },
  { id: "I7", title: "AI, other frameworks and the practices you use at work",
    notes: [
      ["AI in ITIL 5", "AI is treated as part of information and technology: use it to classify tickets, suggest KB articles, predict incidents; manage its risks (bias, data protection, accountability)."],
      ["DevOps / Agile / Lean", "ITIL works alongside them: small batches, fast feedback, automation."],
      ["PRINCE2", "Project management framework; ITIL is service management."],
      ["Incident management (job)", "Minimise negative impact by restoring normal operation as quickly as possible."],
      ["Problem management (job)", "Reduce likelihood and impact of incidents by finding causes. Known error = problem analysed, not resolved, maybe with a workaround."],
      ["Change enablement (job)", "Maximise successful changes by assessing risk. Standard (pre-approved), normal, emergency."],
      ["Service request (job)", "Handle pre-defined user requests (password reset, new mouse) effectively."],
      ["Service desk (job)", "Capture demand for incident resolution and service requests; single point of contact."],
      ["Exam note", "Version 5 Foundation reportedly does not test the practices in depth, but every interview does."]
    ],
    job: "In interviews, explain incident vs problem vs change with a real example from your ticket week.",
    quiz: [
      ["Restore normal service operation as fast as possible:", ["Problem management", "Incident management", "Change enablement", "Governance"], 1],
      ["A pre-approved low-risk change:", ["Emergency change", "Standard change", "Normal change", "Known error"], 1],
      ["A problem with a documented cause or workaround:", ["Known error", "Incident", "Request", "Outcome"], 0],
      ["Single point of contact for users:", ["Service desk", "CAB", "Sponsor", "Supplier"], 0],
      ["PRINCE2 is mainly about...", ["Projects", "Incidents", "Networks", "Cloud"], 0],
      ["A sensible AI use in a service desk:", ["Suggest KB articles for tickets", "Approve all changes alone", "Replace governance", "Store passwords"], 0]
    ] },
  { id: "I8", title: "Mock exam",
    notes: [
      ["Format", "40 questions drawn from all lessons, 60-minute timer, pass 26."],
      ["Technique", "Read the last line of the question first. Eliminate 2 answers. No negative marking: never leave a blank."],
      ["After the mock", "Note every wrong answer's lesson. Repeat that lesson's quiz until 100%."]
    ],
    job: "Book the exam only after scoring 32+ twice. Ask the Agentur für Arbeit about a Bildungsgutschein first.",
    quiz: [] }
  ]
};
