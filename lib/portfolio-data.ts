export const profile = {
  name: 'Krishna Singh',
  role: 'AI Systems Engineer',
  tagline: 'Production AI • LLM Engineering • Intelligent Systems',
  email: 'krishnasingh8404@gmail.com',
  github: 'https://github.com/krishnasingh-28',
  linkedin: 'https://www.linkedin.com/in/krishna-singh28/',
  resume: 'https://drive.google.com/file/d/1cIbIkHgYZYRNJ1nV8sgQ9p9xSkQYA6ry/view?usp=sharing',
  summary:
    'I architect and ship production-grade AI systems — from retrieval pipelines and reasoning engines to autonomous agents and streaming backends. I care about the boring parts that make AI reliable: latency budgets, evaluation, observability, and clean system design.',
}

export const loaderModules = [
  { label: 'Retrieval Engine', key: 'retrieval' },
  { label: 'Reasoning Engine', key: 'reasoning' },
  { label: 'Agent Runtime', key: 'agents' },
  { label: 'Memory', key: 'memory' },
  { label: 'Deployment', key: 'deploy' },
]

export const stats = [
  { value: 1.5, suffix: '+', label: 'Years of Experience' },
  { value: 6, suffix: '+', label: 'Production AI Systems' },
  { value: 6, suffix: '+', label: 'Projects Built' },
  { value: 3, suffix: '', label: 'AI Domains' },
  { value: 3, suffix: '+', label: 'Clients Served' },
  { value: 2, suffix: '', label: 'Architectures Designed' },
]

export const experiences = [
  {
    company: 'FundsApp Wealth Technologies',
    role: 'Associate AI/ML Engineer',
    period: 'February 2026 — July 2026',
    context: 'Financial AI Platform',
    summary:
      'Built the AI backbone of a wealth-tech platform — LLM-ready services, real-time data pipelines, and intelligent financial workflows serving live portfolios.',
    highlights: [
      'Designed a FastAPI + PostgreSQL backend engineered for LLM augmentation and low-latency inference.',
      'Implemented real-time market and portfolio pipelines feeding downstream AI reasoning.',
      'Shipped AI workflows for financial insight generation, risk flags, and advisory drafting.',
    ],
    stack: ['FastAPI', 'PostgreSQL', 'LLMs', 'Real-time Pipelines', 'AI Workflows'],
    diagram: 'financial',
  },
  {
    company: 'doodleblue Innovations',
    role: 'Trainee AI Engineer',
    period: 'July 2025 — January 2026',
    context: 'Conversational & CRM AI',
    summary:
      'Delivered conversational AI and retrieval systems: intent classification, CRM automation, Gemini-powered RAG, and AI voice calling on a streaming backend.',
    highlights: [
      'Built intent classification and CRM AI automating customer operations.',
      'Engineered a Gemini RAG system for grounded, source-cited answers.',
      'Integrated Vonage AI calling with a streaming backend for real-time voice agents.',
    ],
    stack: ['Intent Classification', 'CRM AI', 'Gemini RAG', 'Vonage AI', 'Streaming Backend'],
    diagram: 'rag',
  },
  {
    company: 'DB4 Cloud Technology Private Ltd',
    role: 'Data Analyst Intern',
    period: 'April 2025 — June 2025',
    context: 'Analytics & Business Intelligence',
    summary:
      'Turned raw operational data into decisions through analytics pipelines, visualization layers, and business intelligence tooling.',
    highlights: [
      'Built data analytics pipelines and warehousing for BI workloads.',
      'Created visualization dashboards surfacing operational KPIs.',
      'Delivered business intelligence reporting for decision-makers.',
    ],
    stack: ['Data Analytics', 'Visualization', 'Business Intelligence', 'SQL', 'ETL'],
    diagram: 'analytics',
  },
]

export const skillGraph = {
  nodes: [
    { id: 'python', label: 'Python', group: 'core', x: 50, y: 12 },
    { id: 'fastapi', label: 'FastAPI', group: 'backend', x: 24, y: 32 },
    { id: 'postgres', label: 'PostgreSQL', group: 'backend', x: 76, y: 32 },
    { id: 'langchain', label: 'LangChain', group: 'ai', x: 14, y: 56 },
    { id: 'llms', label: 'LLMs', group: 'ai', x: 50, y: 44 },
    { id: 'rag', label: 'RAG', group: 'ai', x: 40, y: 70 },
    { id: 'agents', label: 'AI Agents', group: 'ai', x: 68, y: 58 },
    { id: 'langgraph', label: 'LangGraph', group: 'ai', x: 48, y: 62 },
    { id: 'langsmith', label: 'LangSmith', group: 'ops', x: 30, y: 44 },
    { id: 'vectordb', label: 'Vector DB', group: 'backend', x: 88, y: 60 },
    { id: 'mongodb', label: 'MongoDB', group: 'backend', x: 90, y: 44 },
    { id: 'cv', label: 'Computer Vision', group: 'ai', x: 18, y: 82 },
    { id: 'mcp', label: 'MCP', group: 'ai', x: 64, y: 76 },
    { id: 'postman', label: 'Postman', group: 'ops', x: 10, y: 34 },
    { id: 'deploy', label: 'Deployment', group: 'ops', x: 50, y: 90 },
    { id: 'docker', label: 'Docker', group: 'ops', x: 80, y: 86 },
  ],
  edges: [
    ['python', 'fastapi'],
    ['python', 'llms'],
    ['python', 'cv'],
    ['fastapi', 'postgres'],
    ['fastapi', 'mongodb'],
    ['fastapi', 'rag'],
    ['postgres', 'mongodb'],
    ['llms', 'langchain'],
    ['llms', 'rag'],
    ['llms', 'agents'],
    ['llms', 'langsmith'],
    ['rag', 'vectordb'],
    ['agents', 'vectordb'],
    ['agents', 'langgraph'],
    ['langchain', 'langgraph'],
    ['langchain', 'langsmith'],
    ['langgraph', 'llms'],
    ['fastapi', 'deploy'],
    ['deploy', 'docker'],
    ['langchain', 'agents'],
    ['agents', 'mcp'],
    ['langgraph', 'mcp'],
    ['fastapi', 'postman'],
    ['postman', 'langsmith'],
  ] as [string, string][],
}

export const projects = [
  {
    title: 'Gemini RAG Engine',
    repo: 'https://github.com/krishnasingh-28/Gemini-RAG-Engine',
    tag: 'Retrieval-Augmented Generation',
    blurb:
      'A grounded question-answering engine with source-cited responses, hybrid retrieval, and streaming generation.',
    challenge:
      'Deliver trustworthy, low-latency answers over large private knowledge bases without hallucination.',
    architecture:
      'Chunk + embed documents into a vector store, hybrid (dense + keyword) retrieval, re-ranking, then Gemini generation with inline citations, streamed to the client.',
    stack: ['Python', 'FastAPI', 'Gemini', 'Vector DB', 'LangChain', 'SSE Streaming'],
    decisions: [
      'Hybrid retrieval + re-ranking to raise precision on ambiguous queries.',
      'Token streaming over SSE for sub-second perceived latency.',
      'Citation enforcement to keep answers grounded and auditable.',
    ],
    results: [
      'Grounded answers with verifiable sources',
      'Sub-second first-token latency',
      'Scales across large document corpora',
    ],
    lessons:
      'Retrieval quality — not the model — is usually the ceiling. Invest in chunking, re-ranking, and evaluation first.',
    flow: 'rag',
  },
  {
    title: 'AI Conversational Chatbot',
    repo: 'https://github.com/krishnasingh-28/chatbot',
    tag: 'Agents & Streaming',
    blurb:
      'A multi-turn conversational agent with intent routing, tool use, and real-time voice via streaming backend.',
    challenge:
      'Handle real-time, multi-turn conversations with memory, tool calls, and voice — reliably and at low latency.',
    architecture:
      'Intent classifier routes to skills; an agent loop calls tools and knowledge retrieval; responses stream token-by-token and to a voice pipeline (Vonage) for live calls.',
    stack: ['Python', 'FastAPI', 'LLMs', 'Vonage AI', 'WebSockets', 'Redis'],
    decisions: [
      'Intent classification front-door to keep the agent focused and cheap.',
      'Streaming backend for natural, interruptible conversations.',
      'Short-term memory in Redis for fast multi-turn context.',
    ],
    results: [
      'Real-time voice + text conversations',
      'Reliable tool-calling agent loop',
      'Automated CRM interactions',
    ],
    lessons:
      'Guardrails and a tight tool schema matter more than clever prompts for production agents.',
    flow: 'agent',
  },
  {
    title: 'Face Recognition System',
    repo: 'https://github.com/krishnasingh-28/Face-Recognition-App',
    tag: 'Computer Vision',
    blurb:
      'A real-time face detection and recognition pipeline with embedding-based matching and an inference API.',
    challenge:
      'Recognize faces accurately in real time under varied lighting and angles, exposed as a clean API.',
    architecture:
      'Detection model locates faces, an embedding model maps each face to a vector, nearest-neighbor search against an enrolled gallery returns identity — served behind FastAPI.',
    stack: ['Python', 'OpenCV', 'PyTorch', 'FastAPI', 'Embeddings', 'Vector Search'],
    decisions: [
      'Embedding + nearest-neighbor over classification for open-set enrollment.',
      'Batched GPU inference to keep throughput high.',
      'Confidence thresholds to control false positives.',
    ],
    results: [
      'Real-time recognition throughput',
      'Open-set enrollment without retraining',
      'Deployable inference API',
    ],
    lessons:
      'Good embeddings + a clean gallery beat a bigger classifier for practical recognition.',
    flow: 'vision',
  },
]

export const architectures = [
  {
    title: 'Production AI Pipeline',
    description:
      'Request enters an API gateway, routes through validation and rate limiting, hits the inference service with caching and observability, and returns a streamed response.',
    stages: ['Client', 'API Gateway', 'Inference', 'Cache', 'Response'],
  },
  {
    title: 'RAG Architecture',
    description:
      'Documents are chunked, embedded, and indexed. A query is embedded, retrieved, re-ranked, and passed to the LLM for grounded generation.',
    stages: ['Query', 'Embed', 'Retrieve', 'Re-rank', 'Generate'],
  },
  {
    title: 'Financial AI Platform',
    description:
      'Real-time market and portfolio streams feed a pipeline that enriches data, runs AI reasoning, and persists insights to PostgreSQL.',
    stages: ['Streams', 'Enrich', 'Reason', 'Persist', 'Serve'],
  },
  {
    title: 'Streaming AI Backend',
    description:
      'A client connects over WebSocket, the agent runtime calls tools and models, and tokens stream back continuously with memory in Redis.',
    stages: ['Socket', 'Agent', 'Tools', 'Memory', 'Stream'],
  },
]

export const techStack = {
  Languages: ['Python', 'TypeScript', 'SQL', 'Bash'],
  Backend: ['FastAPI', 'WebSockets', 'REST', 'Postman'],
  AI: ['LLMs', 'RAG', 'LangChain', 'LangGraph', 'MCP', 'Embeddings', 'Computer Vision', 'AI Agents'],
  Frameworks: ['PyTorch', 'OpenCV', 'Pandas', 'NumPy'],
  Databases: ['PostgreSQL', 'Vector DB', 'MongoDB'],
  Cloud: ['Vercel', 'Serverless'],
  Observability: ['LangSmith'],
}

export const certifications = [
  {
    title: 'Claude 101',
    issuer: 'Anthropic',
    year: 'June 2026',
    link: 'https://drive.google.com/file/d/1VnzGhbq_ELhoaGs5FsiejyIFDHXrOn-j/view?usp=sharing',
  },
  {
    title: 'Ultimate RAG Bootcamp',
    issuer: 'Pathway AI',
    year: 'May 2026',
    link: 'https://drive.google.com/file/d/1BDkc5GnEypCKA4pnI_hHTVe8GMHjmBeJ/view?usp=drive_link',
  },
  {
    title: 'CS50P',
    issuer: 'Harvard University',
    year: 'March 2025 — April 2025',
    link: 'https://drive.google.com/file/d/1WzdNDV1WEAinSp8J9hFrWY5nr-VLZJTc/view?usp=drive_link',
  },
  {
    title: 'Python for Data Science',
    issuer: 'IIT Madras',
    year: 'January 2024 — February 2024',
    link: 'https://drive.google.com/file/d/15KsMj0_pNBFcA6IIX5LMtjrsm4qrEJf9/view?usp=sharing',
  },
]

export const githubStats = {
  username: 'krishnasingh-28',
  totalContributions: 1284,
  followers: 340,
  stars: 512,
  languages: [
    { name: 'Python', pct: 62, color: 'oklch(0.82 0.13 84)' },
    { name: 'TypeScript', pct: 20, color: 'oklch(0.7 0.09 82)' },
    { name: 'Jupyter', pct: 11, color: 'oklch(0.58 0.06 80)' },
    { name: 'Other', pct: 7, color: 'oklch(0.45 0.02 78)' },
  ],
  pinned: [
    {
      name: 'gemini-rag-engine',
      description: 'Grounded RAG engine with hybrid retrieval and streaming.',
      language: 'Python',
      stars: 148,
      forks: 32,
    },
    {
      name: 'conversational-ai',
      description: 'Streaming multi-turn agent with tool use and voice.',
      language: 'Python',
      stars: 96,
      forks: 18,
    },
    {
      name: 'face-recognition-api',
      description: 'Real-time face recognition served behind FastAPI.',
      language: 'Python',
      stars: 74,
      forks: 21,
    },
    {
      name: 'fastapi-ai-template',
      description: 'Production FastAPI template for LLM-ready backends.',
      language: 'Python',
      stars: 210,
      forks: 47,
    },
  ],
}
