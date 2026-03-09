export const TEMPO_QUIZ_ABI = [
  {
    type: 'function', name: 'submitQuiz', stateMutability: 'nonpayable',
    inputs: [
      { name: 'quizId', type: 'uint256' },
      { name: 'answers', type: 'uint8[]' },
    ],
    outputs: [],
  },
  {
    type: 'function', name: 'hasBadge', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }, { name: 'quizId', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function', name: 'getUserProgress', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool[]' }],
  },
  {
    type: 'function', name: 'getUserBadges', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    type: 'function', name: 'totalMinted', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function', name: 'totalQuizzes', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function', name: 'balanceOf', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function', name: 'addQuiz', stateMutability: 'nonpayable',
    inputs: [
      { name: 'quizId', type: 'uint256' },
      { name: 'answerIndexes', type: 'uint8[]' },
    ],
    outputs: [],
  },
  {
    type: 'event', name: 'BadgeMinted',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'quizId', type: 'uint256', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: false },
    ],
  },
] as const

// ── Unlock schedule ───────────────────────────────────────────────
const TEMPO_START_DATE = new Date('2026-03-10T00:00:00Z')

export function getTempoUnlockedCount(total = 16): number {
  const now = Date.now()
  const start = TEMPO_START_DATE.getTime()
  if (now < start) return Math.min(5, total)
  const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return Math.min(5 + Math.floor(daysPassed / 3), total)
}

export function getTempoUnlockDate(quizId: number): Date {
  if (quizId <= 5) return TEMPO_START_DATE
  return new Date(TEMPO_START_DATE.getTime() + (quizId - 5) * 3 * 24 * 60 * 60 * 1000)
}

export function formatTempoUnlockDate(quizId: number): string {
  return getTempoUnlockDate(quizId).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export interface QuizQuestion {
  question: string
  options: [string, string, string, string]
  correctIndex: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard'
}

export interface QuizData {
  id: number
  title: string
  emoji: string
  questions: QuizQuestion[] // flexible: 3, 4, 5, etc.
}

// correctIndex values MUST match TempoQuiz.sol addQuiz() answerIndexes exactly!
export const TEMPO_QUIZZES: QuizData[] = [
  {
    id: 1, title: "Intro to Tempo", emoji: "🎵",
    questions: [
      { question: "What is Tempo?", options: ["A Layer 1 blockchain for payments","A Layer 2 for Ethereum","A decentralized exchange","A crypto wallet"], correctIndex: 0, difficulty: "Easy" },
      { question: "Which companies incubated Tempo?", options: ["Coinbase & Binance","Stripe & Paradigm","Visa & Mastercard","Google & Apple"], correctIndex: 1, difficulty: "Easy" },
      { question: "Tempo is designed to be a low-cost and ______ blockchain.", options: ["High-latency","High-throughput","Private-only","Energy-heavy"], correctIndex: 1, difficulty: "Easy" },
    ],
  },
  {
    id: 2, title: "Tempo Basics", emoji: "📚",
    questions: [
      { question: "What asset class is Tempo specifically optimized for?", options: ["NFTs","Governance tokens","Stablecoins","Meme coins"], correctIndex: 2, difficulty: "Easy" },
      { question: "What is the primary focus of Tempo's architecture?", options: ["Gaming","Social Media","Payments at scale","Supply chain"], correctIndex: 2, difficulty: "Easy" },
      { question: "What is the name of the current Tempo testnet?", options: ["Allegro","Moderato","Presto","Andante"], correctIndex: 1, difficulty: "Easy" },
    ],
  },
  {
    id: 3, title: "Tempo History", emoji: "📅",
    questions: [
      { question: "When was the old Tempo testnet deprecated?", options: ["January 1, 2025","March 8, 2025","December 9, 2025","February 5, 2026"], correctIndex: 1, difficulty: "Easy" },
      { question: "Which partner helps Tempo validate against real payment workloads?", options: ["Design Partners","Retail users","Validators only","Mining pools"], correctIndex: 0, difficulty: "Easy" },
      { question: "Tempo was developed in partnership with fintechs and ______ companies.", options: ["Startup","Fortune 500","Non-profit","Local"], correctIndex: 1, difficulty: "Easy" },
    ],
  },
  {
    id: 4, title: "Tempo Use Cases I", emoji: "💡",
    questions: [
      { question: "Where can you get funds to test on the Tempo network?", options: ["Mainnet Bridge","CEX withdrawal","Faucet","Mining"], correctIndex: 2, difficulty: "Easy" },
      { question: "What use case enables fast, cheap cross-border money transfers?", options: ["Remittances","Microtransactions","Yield farming","Tokenized Deposits"], correctIndex: 0, difficulty: "Medium" },
      { question: "Which feature allows platforms to embed payment flows directly into apps?", options: ["Flash loans","Embedded Finance","Staking","Governance"], correctIndex: 1, difficulty: "Medium" },
    ],
  },
  {
    id: 5, title: "Tempo Use Cases II", emoji: "⚙️",
    questions: [
      { question: "What use case involves sub-cent payments for APIs and IoT services?", options: ["Global Payouts","Corporate Treasury","Microtransactions","Remittances"], correctIndex: 2, difficulty: "Medium" },
      { question: "What is 'Agentic Commerce' on Tempo?", options: ["Manual trading","Programmable payments for autonomous agents","Real estate tokenization","Peer-to-peer chat"], correctIndex: 1, difficulty: "Medium" },
      { question: "Which use case provides real-time visibility into global cash positions?", options: ["Remittances","Tokenized Deposits","NFT Staking","Payroll"], correctIndex: 1, difficulty: "Medium" },
    ],
  },
  {
    id: 6, title: "Tempo Standards & Partners", emoji: "🤝",
    questions: [
      { question: "What is TIP-20 in the Tempo ecosystem?", options: ["A governance proposal","A token standard for payments","A security patch","A wallet address format"], correctIndex: 1, difficulty: "Medium" },
      { question: "Who did Tempo acquire in October 2025?", options: ["Commonware","Merkle","Ithaca","Stripe"], correctIndex: 2, difficulty: "Medium" },
      { question: "Tempo partnered with which company in November 2025?", options: ["Merkle","Commonware","Paradigm","Ithaca"], correctIndex: 1, difficulty: "Medium" },
    ],
  },
  {
    id: 7, title: "Tempo Network", emoji: "🔗",
    questions: [
      { question: "Which blog post was released on Feb 25, 2026?", options: ["Stablecoin Fees","Stablecoins for Payroll","Compliance controls","Tempo x Merkle"], correctIndex: 1, difficulty: "Medium" },
      { question: "What is the new Chain ID for the Tempo Moderato testnet?", options: ["1","137","42431","80001"], correctIndex: 2, difficulty: "Medium" },
      { question: "What is the RPC URL for the current Tempo testnet?", options: ["https://rpc.tempo.xyz","https://rpc.moderato.tempo.xyz","https://test.tempo.xyz","https://eth.tempo.xyz"], correctIndex: 1, difficulty: "Medium" },
    ],
  },
  {
    id: 8, title: "Tempo Ecosystem", emoji: "🌍",
    questions: [
      { question: "Tempo is described as a ______-purpose blockchain optimized for payments.", options: ["Specific","General","Private","Single"], correctIndex: 1, difficulty: "Medium" },
      { question: "Which category of partners helps with stablecoin issuance and custody?", options: ["Retail Partners","Ecosystem Partners","Mining Partners","DAO Partners"], correctIndex: 1, difficulty: "Medium" },
      { question: "When was the blog 'Stablecoins for Global Payouts' published?", options: ["January 14, 2026","February 10, 2026","December 18, 2025","September 4, 2025"], correctIndex: 0, difficulty: "Medium" },
    ],
  },
  {
    id: 9, title: "Tempo Developer Docs", emoji: "🛠️",
    questions: [
      { question: "What should developers do when migrating to the new testnet?", options: ["Keep old contracts","Redeploy any contracts","Nothing","Bridge from Mainnet"], correctIndex: 1, difficulty: "Medium" },
      { question: "According to the sources, what is the 'Learn' section's focus?", options: ["Trading tips","Stablecoin use cases & Tempo architecture","Mining guides","NFT minting"], correctIndex: 1, difficulty: "Hard" },
      { question: "Which blog post provides a guide for finance teams comparing ACH and wire?", options: ["Stablecoin Fees","ACH vs wire vs stablecoins","Corporate Treasury","TIP-20"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 10, title: "Tempo Blog & Dates", emoji: "📰",
    questions: [
      { question: "What was the date of the Tempo x Merkle announcement?", options: ["Feb 5, 2026","Feb 9, 2026","Feb 19, 2026","Feb 25, 2026"], correctIndex: 1, difficulty: "Hard" },
      { question: "How long is the reading time for the 'Stablecoins for Remittances' blog post?", options: ["5 min","8 min","10 min","12 min"], correctIndex: 3, difficulty: "Hard" },
      { question: "Which technical feature was introduced on Dec 17, 2025?", options: ["Tempo Testnet","Tempo Transactions","TIP-20","Moderato Testnet"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 11, title: "Tempo Migration", emoji: "🔄",
    questions: [
      { question: "The 'Design Partners' of Tempo serve how many people worldwide?", options: ["Millions","Billions","Thousands","Hundreds"], correctIndex: 1, difficulty: "Hard" },
      { question: "Which blog post deep dive focuses on 'Compliance controls'?", options: ["Jan 6, 2026","Feb 19, 2026","Feb 5, 2026","Dec 17, 2025"], correctIndex: 1, difficulty: "Hard" },
      { question: "What must you reset if they depend on old testnet data during migration?", options: ["Wallets","Databases or indexers","Internet router","Social media accounts"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 12, title: "Tempo Timeline I", emoji: "🗓️",
    questions: [
      { question: "What was the date of the announcement 'Meet Tempo's infrastructure partners'?", options: ["September 23, 2025","September 4, 2025","October 17, 2025","November 7, 2025"], correctIndex: 0, difficulty: "Hard" },
      { question: "What is the duration of the TIP-20 deep dive blog post?", options: ["5 min","6 min","8 min","10 min"], correctIndex: 2, difficulty: "Hard" },
      { question: "Which blog post was published first?", options: ["Tempo's testnet is live","Introducing Tempo","Tempo x Ithaca","TIP-20"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 13, title: "Tempo Timeline II", emoji: "📆",
    questions: [
      { question: "Tempo aims to provide global transactions for ______ use case.", options: ["Only retail","Only corporate","Any","Only cross-border"], correctIndex: 2, difficulty: "Hard" },
      { question: "What category of companies is Tempo designed with input from?", options: ["Category-defining institutions","Retail shops","Central banks only","Social media influencers"], correctIndex: 0, difficulty: "Hard" },
      { question: "In the Moderato testnet migration, what happened to the old testnet?", options: ["It was merged","It was deprecated","It became mainnet","It was renamed"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 14, title: "Tempo Content", emoji: "✍️",
    questions: [
      { question: "What is the focus of the blog post published on Feb 5, 2026?", options: ["Payroll","Compliance","Stablecoin Fees","Remittances"], correctIndex: 2, difficulty: "Hard" },
      { question: "How many minutes is the reading time for 'Stablecoins for Global Payouts'?", options: ["5 min","8 min","10 min","12 min"], correctIndex: 2, difficulty: "Very Hard" },
      { question: "Which partner group helps shape the future of Tempo against real workloads?", options: ["Design Partners","Ecosystem Partners","Retail Partners","Validators"], correctIndex: 0, difficulty: "Very Hard" },
    ],
  },
  {
    id: 15, title: "Tempo Testnet Details", emoji: "🧪",
    questions: [
      { question: "When was the blog 'Stablecoins for Corporate Treasury' published?", options: ["Dec 18, 2025","Dec 17, 2025","Dec 9, 2025","Jan 6, 2026"], correctIndex: 0, difficulty: "Very Hard" },
      { question: "The new testnet aligns with which release candidate?", options: ["Beta 1","Mainnet","Devnet","Staging"], correctIndex: 1, difficulty: "Very Hard" },
      { question: "Why did Tempo launch a new testnet according to the documentation?", options: ["Security breach","Faster feature release cycles","Lack of users","Legal reasons"], correctIndex: 1, difficulty: "Very Hard" },
    ],
  },
  {
    id: 16, title: "Tempo Deep Dive", emoji: "🧠",
    questions: [
      { question: "What is the reading time for the 'Introducing Tempo' blog post?", options: ["1 min","3 min","5 min","8 min"], correctIndex: 1, difficulty: "Very Hard" },
      { question: "What ecosystem category includes 'Issuance Orchestration & Ramps'?", options: ["Infrastructure","Partnerships","Compliance","Interoperability"], correctIndex: 0, difficulty: "Very Hard" },
      { question: "On which day in 2025 was Tempo introduced as the payments-first blockchain?", options: ["Sept 4","Sept 23","Oct 17","Dec 9"], correctIndex: 0, difficulty: "Very Hard" },
    ],
  },
]
