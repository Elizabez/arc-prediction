export const TEMPO_QUIZ_ABI = [
  {
    type: 'function', name: 'submitQuiz', stateMutability: 'nonpayable',
    inputs: [
      { name: 'quizId', type: 'uint256' },
      { name: 'answerIndex', type: 'uint8' },
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
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function', name: 'totalQuizzes', stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function', name: 'balanceOf', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
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
// Quiz 1–5: open from March 10, 2026
// Every 3 days: +1 quiz → quiz 6 on Mar 13, quiz 7 on Mar 16, ...
// Tempo has 50 quizzes → all unlocked by Mar 10 + (45×3) days = ~Aug 2027
const TEMPO_START_DATE = new Date('2026-03-10T00:00:00Z')

export function getTempoUnlockedCount(totalOnChain = 50): number {
  const now = Date.now()
  const start = TEMPO_START_DATE.getTime()
  if (now < start) return Math.min(5, totalOnChain)
  const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  const extra = Math.floor(daysPassed / 3)
  return Math.min(5 + extra, totalOnChain)
}

export function getTempoUnlockDate(quizId: number): Date {
  if (quizId <= 5) return TEMPO_START_DATE
  return new Date(TEMPO_START_DATE.getTime() + (quizId - 5) * 3 * 24 * 60 * 60 * 1000)
}

export function formatTempoUnlockDate(quizId: number): string {
  return getTempoUnlockDate(quizId).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

export interface QuizData {
  id: number
  title: string
  emoji: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard'
  question: string
  options: [string, string, string, string]
  correctIndex: number
}

// correctIndex MUST match TempoQuiz.sol _loadQuizzes() answerIndex exactly!
export const TEMPO_QUIZZES: QuizData[] = [
  { id: 1,  title: "What is Tempo",           emoji: "🎵", difficulty: "Easy",      question: "What is Tempo?", options: ["A Layer 1 blockchain for payments", "A Layer 2 for Ethereum", "A decentralized exchange", "A crypto wallet"], correctIndex: 0 },
  { id: 2,  title: "Tempo Incubators",        emoji: "🏗️", difficulty: "Easy",      question: "Which companies incubated Tempo?", options: ["Coinbase & Binance", "Stripe & Paradigm", "Visa & Mastercard", "Google & Apple"], correctIndex: 1 },
  { id: 3,  title: "Tempo Design",            emoji: "⚡", difficulty: "Easy",      question: "Tempo is designed to be a low-cost and ______ blockchain.", options: ["High-latency", "High-throughput", "Private-only", "Energy-heavy"], correctIndex: 1 },
  { id: 4,  title: "Tempo Asset Class",       emoji: "💵", difficulty: "Easy",      question: "What asset class is Tempo specifically optimized for?", options: ["NFTs", "Governance tokens", "Stablecoins", "Meme coins"], correctIndex: 2 },
  { id: 5,  title: "Tempo Focus",             emoji: "🎯", difficulty: "Easy",      question: "What is the primary focus of Tempo's architecture?", options: ["Gaming", "Social Media", "Payments at scale", "Supply chain"], correctIndex: 2 },
  { id: 6,  title: "Tempo Testnet Name",      emoji: "🧪", difficulty: "Easy",      question: "What is the name of the current Tempo testnet?", options: ["Allegro", "Moderato", "Presto", "Andante"], correctIndex: 1 },
  { id: 7,  title: "Old Testnet Deprecated",  emoji: "📅", difficulty: "Easy",      question: "When was the old Tempo testnet deprecated?", options: ["January 1, 2025", "March 8, 2025", "December 9, 2025", "February 5, 2026"], correctIndex: 1 },
  { id: 8,  title: "Tempo Validators",        emoji: "🤝", difficulty: "Easy",      question: "Which partner helps Tempo validate against real payment workloads?", options: ["Design Partners", "Retail users", "Validators only", "Mining pools"], correctIndex: 0 },
  { id: 9,  title: "Tempo Partners",          emoji: "🏢", difficulty: "Easy",      question: "Tempo was developed in partnership with fintechs and ______ companies.", options: ["Startup", "Fortune 500", "Non-profit", "Local"], correctIndex: 1 },
  { id: 10, title: "Tempo Faucet",            emoji: "🚿", difficulty: "Easy",      question: "Where can you get funds to test on the Tempo network?", options: ["Mainnet Bridge", "CEX withdrawal", "Faucet", "Mining"], correctIndex: 2 },
  { id: 11, title: "Tempo Remittances",       emoji: "🌍", difficulty: "Medium",    question: "What use case enables fast, cheap cross-border money transfers?", options: ["Remittances", "Microtransactions", "Yield farming", "Tokenized Deposits"], correctIndex: 0 },
  { id: 12, title: "Embedded Finance",        emoji: "📱", difficulty: "Medium",    question: "Which feature allows platforms to embed payment flows directly into apps?", options: ["Flash loans", "Embedded Finance", "Staking", "Governance"], correctIndex: 1 },
  { id: 13, title: "Microtransactions",       emoji: "🔬", difficulty: "Medium",    question: "What use case involves sub-cent payments for APIs and IoT services?", options: ["Global Payouts", "Corporate Treasury", "Microtransactions", "Remittances"], correctIndex: 2 },
  { id: 14, title: "Agentic Commerce",        emoji: "🤖", difficulty: "Medium",    question: "What is 'Agentic Commerce' on Tempo?", options: ["Manual trading", "Programmable payments for autonomous agents", "Real estate tokenization", "Peer-to-peer chat"], correctIndex: 1 },
  { id: 15, title: "Tokenized Deposits",      emoji: "🏦", difficulty: "Medium",    question: "Which use case provides real-time visibility into global cash positions?", options: ["Remittances", "Tokenized Deposits", "NFT Staking", "Payroll"], correctIndex: 1 },
  { id: 16, title: "TIP-20 Standard",         emoji: "📋", difficulty: "Medium",    question: "What is TIP-20 in the Tempo ecosystem?", options: ["A governance proposal", "A token standard for payments", "A security patch", "A wallet address format"], correctIndex: 1 },
  { id: 17, title: "Tempo Acquisition",       emoji: "🔑", difficulty: "Medium",    question: "Who did Tempo acquire in October 2025?", options: ["Commonware", "Merkle", "Ithaca", "Stripe"], correctIndex: 2 },
  { id: 18, title: "Tempo Partnership Nov",   emoji: "🤜", difficulty: "Medium",    question: "Tempo partnered with which company in November 2025?", options: ["Merkle", "Commonware", "Paradigm", "Ithaca"], correctIndex: 1 },
  { id: 19, title: "Blog Feb 25",             emoji: "📰", difficulty: "Medium",    question: "Which blog post was released on Feb 25, 2026?", options: ["Stablecoin Fees", "Stablecoins for Payroll", "Compliance controls", "Tempo x Merkle"], correctIndex: 1 },
  { id: 20, title: "Tempo Chain ID",          emoji: "🔢", difficulty: "Medium",    question: "What is the new Chain ID for the Tempo Moderato testnet?", options: ["1", "137", "42431", "80001"], correctIndex: 2 },
  { id: 21, title: "Tempo RPC URL",           emoji: "🔗", difficulty: "Medium",    question: "What is the RPC URL for the current Tempo testnet?", options: ["https://rpc.tempo.xyz", "https://rpc.moderato.tempo.xyz", "https://test.tempo.xyz", "https://eth.tempo.xyz"], correctIndex: 1 },
  { id: 22, title: "Tempo Purpose",           emoji: "🧭", difficulty: "Medium",    question: "Tempo is described as a ______-purpose blockchain optimized for payments.", options: ["Specific", "General", "Private", "Single"], correctIndex: 1 },
  { id: 23, title: "Ecosystem Partners",      emoji: "🌐", difficulty: "Medium",    question: "Which category of partners helps with stablecoin issuance and custody?", options: ["Retail Partners", "Ecosystem Partners", "Mining Partners", "DAO Partners"], correctIndex: 1 },
  { id: 24, title: "Blog Global Payouts",     emoji: "📆", difficulty: "Medium",    question: "When was the blog 'Stablecoins for Global Payouts' published?", options: ["January 14, 2026", "February 10, 2026", "December 18, 2025", "September 4, 2025"], correctIndex: 0 },
  { id: 25, title: "Testnet Migration",       emoji: "🔄", difficulty: "Medium",    question: "What should developers do when migrating to the new testnet?", options: ["Keep old contracts", "Redeploy any contracts", "Nothing", "Bridge from Mainnet"], correctIndex: 1 },
  { id: 26, title: "Learn Section Focus",     emoji: "📚", difficulty: "Hard",      question: "According to the sources, what is the 'Learn' section's focus?", options: ["Trading tips", "Stablecoin use cases & Tempo architecture", "Mining guides", "NFT minting"], correctIndex: 1 },
  { id: 27, title: "ACH vs Wire Blog",        emoji: "💼", difficulty: "Hard",      question: "Which blog post provides a guide for finance teams comparing ACH and wire?", options: ["Stablecoin Fees", "ACH vs wire vs stablecoins", "Corporate Treasury", "TIP-20"], correctIndex: 1 },
  { id: 28, title: "Tempo x Merkle Date",     emoji: "🗓️", difficulty: "Hard",      question: "What was the date of the Tempo x Merkle announcement?", options: ["Feb 5, 2026", "Feb 9, 2026", "Feb 19, 2026", "Feb 25, 2026"], correctIndex: 1 },
  { id: 29, title: "Remittances Read Time",   emoji: "⏱️", difficulty: "Hard",      question: "How long is the reading time for the 'Stablecoins for Remittances' blog post?", options: ["5 min", "8 min", "10 min", "12 min"], correctIndex: 3 },
  { id: 30, title: "Dec 17 Feature",          emoji: "🆕", difficulty: "Hard",      question: "Which technical feature was introduced on Dec 17, 2025?", options: ["Tempo Testnet", "Tempo Transactions", "TIP-20", "Moderato Testnet"], correctIndex: 1 },
  { id: 31, title: "Design Partners Reach",   emoji: "🌏", difficulty: "Hard",      question: "The 'Design Partners' of Tempo serve how many people worldwide?", options: ["Millions", "Billions", "Thousands", "Hundreds"], correctIndex: 1 },
  { id: 32, title: "Compliance Blog Date",    emoji: "📅", difficulty: "Hard",      question: "Which blog post deep dive focuses on 'Compliance controls'?", options: ["Jan 6, 2026", "Feb 19, 2026", "Feb 5, 2026", "Dec 17, 2025"], correctIndex: 1 },
  { id: 33, title: "Reset Migration",         emoji: "🗄️", difficulty: "Hard",      question: "What must you reset if they depend on old testnet data during migration?", options: ["Wallets", "Databases or indexers", "Internet router", "Social media accounts"], correctIndex: 1 },
  { id: 34, title: "Infrastructure Partners", emoji: "🏗️", difficulty: "Hard",      question: "What was the date of the announcement 'Meet Tempo's infrastructure partners'?", options: ["September 23, 2025", "September 4, 2025", "October 17, 2025", "November 7, 2025"], correctIndex: 0 },
  { id: 35, title: "TIP-20 Read Time",        emoji: "📖", difficulty: "Hard",      question: "What is the duration of the TIP-20 deep dive blog post?", options: ["5 min", "6 min", "8 min", "10 min"], correctIndex: 2 },
  { id: 36, title: "First Blog Post",         emoji: "🥇", difficulty: "Hard",      question: "Which blog post was published first?", options: ["Tempo's testnet is live", "Introducing Tempo", "Tempo x Ithaca", "TIP-20"], correctIndex: 1 },
  { id: 37, title: "Tempo Global Use",        emoji: "🌐", difficulty: "Hard",      question: "Tempo aims to provide global transactions for ______ use case.", options: ["Only retail", "Only corporate", "Any", "Only cross-border"], correctIndex: 2 },
  { id: 38, title: "Tempo Design Input",      emoji: "🏛️", difficulty: "Hard",      question: "What category of companies is Tempo designed with input from?", options: ["Category-defining institutions", "Retail shops", "Central banks only", "Social media influencers"], correctIndex: 0 },
  { id: 39, title: "Old Testnet Fate",        emoji: "⚰️", difficulty: "Hard",      question: "In the Moderato testnet migration, what happened to the old testnet?", options: ["It was merged", "It was deprecated", "It became mainnet", "It was renamed"], correctIndex: 1 },
  { id: 40, title: "Feb 5 Blog Focus",        emoji: "📝", difficulty: "Hard",      question: "What is the focus of the blog post published on Feb 5, 2026?", options: ["Payroll", "Compliance", "Stablecoin Fees", "Remittances"], correctIndex: 2 },
  { id: 41, title: "Global Payouts Read",     emoji: "⏰", difficulty: "Very Hard", question: "How many minutes is the reading time for 'Stablecoins for Global Payouts'?", options: ["5 min", "8 min", "10 min", "12 min"], correctIndex: 2 },
  { id: 42, title: "Real Workloads Group",    emoji: "🔧", difficulty: "Very Hard", question: "Which partner group helps shape the future of Tempo against real workloads?", options: ["Design Partners", "Ecosystem Partners", "Retail Partners", "Validators"], correctIndex: 0 },
  { id: 43, title: "Corporate Treasury Date", emoji: "🗓️", difficulty: "Very Hard", question: "When was the blog 'Stablecoins for Corporate Treasury' published?", options: ["Dec 18, 2025", "Dec 17, 2025", "Dec 9, 2025", "Jan 6, 2026"], correctIndex: 0 },
  { id: 44, title: "New Testnet RC",          emoji: "🚀", difficulty: "Very Hard", question: "The new testnet aligns with which release candidate?", options: ["Beta 1", "Mainnet", "Devnet", "Staging"], correctIndex: 1 },
  { id: 45, title: "New Testnet Reason",      emoji: "❓", difficulty: "Very Hard", question: "Why did Tempo launch a new testnet according to the documentation?", options: ["Security breach", "Faster feature release cycles", "Lack of users", "Legal reasons"], correctIndex: 1 },
  { id: 46, title: "Introducing Read Time",   emoji: "📖", difficulty: "Very Hard", question: "What is the reading time for the 'Introducing Tempo' blog post?", options: ["1 min", "3 min", "5 min", "8 min"], correctIndex: 1 },
  { id: 47, title: "Issuance Category",       emoji: "🗂️", difficulty: "Very Hard", question: "What ecosystem category includes 'Issuance Orchestration & Ramps'?", options: ["Infrastructure", "Partnerships", "Compliance", "Interoperability"], correctIndex: 0 },
  { id: 48, title: "Tempo Intro Date",        emoji: "🎂", difficulty: "Very Hard", question: "On which day in 2025 was Tempo introduced as the payments-first blockchain?", options: ["Sept 4", "Sept 23", "Oct 17", "Dec 9"], correctIndex: 0 },
  { id: 49, title: "Dec 17 Blog Focus",       emoji: "🔍", difficulty: "Very Hard", question: "What is the focus of the blog post dated 12/17/2025?", options: ["Testnet Live", "Introducing Tempo Transactions", "Corporate Treasury", "TIP-20"], correctIndex: 1 },
  { id: 50, title: "Longest Blog Post",       emoji: "🏆", difficulty: "Very Hard", question: "Which blog post has the longest reading time (12 min)?", options: ["Stablecoins for Payroll", "Stablecoins for Global Payouts", "Stablecoins for Remittances", "Stablecoins for Treasury"], correctIndex: 2 },
]
