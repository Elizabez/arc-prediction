export const ARC_QUIZ_ABI = [
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
// Arc has 30 quizzes total → all unlocked by Mar 10 + (25×3) = Nov 14, 2026
const ARC_START_DATE = new Date('2026-03-10T00:00:00Z')

export function getArcUnlockedCount(totalOnChain = 30): number {
  const now = Date.now()
  const start = ARC_START_DATE.getTime()
  if (now < start) return Math.min(5, totalOnChain)
  const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  const extra = Math.floor(daysPassed / 3)
  return Math.min(5 + extra, totalOnChain)
}

export function getArcUnlockDate(quizId: number): Date {
  if (quizId <= 5) return ARC_START_DATE
  return new Date(ARC_START_DATE.getTime() + (quizId - 5) * 3 * 24 * 60 * 60 * 1000)
}

export function formatArcUnlockDate(quizId: number): string {
  return getArcUnlockDate(quizId).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export interface QuizData {
  id: number
  title: string
  emoji: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  question: string
  options: [string, string, string, string]
  correctIndex: number
}

// correctIndex MUST match ArcQuiz.sol _loadQuizzes() answerIndex exactly!
export const ARC_QUIZZES: QuizData[] = [
  { id: 1,  title: "Arc OS",            emoji: "🌐", difficulty: "Easy",   question: "What is Arc often described as in the ecosystem?", options: ["A social media platform", "An Economic OS for the internet", "A simple cloud storage", "A standalone wallet"], correctIndex: 1 },
  { id: 2,  title: "Arc Gas Token",     emoji: "⛽", difficulty: "Easy",   question: "Which stablecoin is used for gas fees on Arc?", options: ["USDT", "EURC", "USDC", "DAI"], correctIndex: 2 },
  { id: 3,  title: "Arc Chain Type",    emoji: "🔗", difficulty: "Easy",   question: "What type of blockchain is Arc?", options: ["Layer-1", "Layer-2", "Sidechain", "App-chain"], correctIndex: 0 },
  { id: 4,  title: "Arc EVM",           emoji: "⚙️", difficulty: "Easy",   question: "Is Arc compatible with the Ethereum Virtual Machine (EVM)?", options: ["No", "Only for specific contracts", "Yes", "Only on mainnet"], correctIndex: 2 },
  { id: 5,  title: "Arc Testnet",       emoji: "🧪", difficulty: "Easy",   question: "Which entity offers the Arc testnet?", options: ["Circle Technology Services, LLC", "Ethereum Foundation", "Mastercard", "Visa"], correctIndex: 0 },
  { id: 6,  title: "Arc Finality Goal", emoji: "⚡", difficulty: "Easy",   question: "What is the primary target of Arc's finality?", options: ["10 seconds", "Under one second", "5 minutes", "Instantaneous with no consensus"], correctIndex: 1 },
  { id: 7,  title: "Arc Consensus",     emoji: "🔮", difficulty: "Medium", question: "What consensus engine powers Arc?", options: ["Proof of Work", "Tendermint", "Malachite", "Snowman"], correctIndex: 2 },
  { id: 8,  title: "Arc Finality Type", emoji: "✅", difficulty: "Medium", question: "Arc's finality is described as:", options: ["Probabilistic", "Deterministic", "Delayed", "Temporary"], correctIndex: 1 },
  { id: 9,  title: "Arc Interop",       emoji: "🌉", difficulty: "Medium", question: "Which tool allows for seamless interoperability across ecosystems like Ethereum and Solana?", options: ["CCTP and Gateway", "Metamask only", "Standard Bridges", "Centralized Exchanges"], correctIndex: 0 },
  { id: 10, title: "Arc Privacy",       emoji: "🛡️", difficulty: "Medium", question: "What type of privacy does Arc offer to businesses?", options: ["Full transparency only", "Opt-in configurable privacy", "Mandatory privacy for all", "No privacy controls"], correctIndex: 1 },
  { id: 11, title: "Arc Institution",   emoji: "🏦", difficulty: "Medium", question: "Which institution's Digital Assets head mentioned testing programmable settlement on Arc?", options: ["JPMorgan", "Goldman Sachs", "BlackRock", "HSBC"], correctIndex: 1 },
  { id: 12, title: "Arc Community",     emoji: "💬", difficulty: "Medium", question: "The 'Architecture Review' sessions on Arc Discord are also known as:", options: ["Town Halls", "Design Clinics", "Dev Meets", "Code Reviews"], correctIndex: 1 },
  { id: 13, title: "Arc Purpose",       emoji: "🎯", difficulty: "Medium", question: "What is Arc purpose-built to support?", options: ["Gaming only", "Real-world financial flows", "Social networking", "NFT art storage"], correctIndex: 1 },
  { id: 14, title: "Arc Partner Pay",   emoji: "💳", difficulty: "Medium", question: "Which partner is exploring secure payment experiences across fiat and stablecoin rails on Arc?", options: ["Visa", "Mastercard", "American Express", "PayPal"], correctIndex: 1 },
  { id: 15, title: "Arc Head Crypto",   emoji: "👤", difficulty: "Medium", question: "Cuy Sheffield, who praised Arc's design, is the Head of Crypto at:", options: ["Circle", "Visa", "Mastercard", "Goldman Sachs"], correctIndex: 1 },
  { id: 16, title: "Arc AI Commerce",   emoji: "🤖", difficulty: "Hard",   question: "What does 'Agentic Commerce' on Arc enable?", options: ["Manual trading", "AI agents to coordinate and settle value", "Human-only marketplaces", "Traditional bank transfers"], correctIndex: 1 },
  { id: 17, title: "Arc Validators",    emoji: "🔐", difficulty: "Hard",   question: "Arc's validator participation is characterized as:", options: ["Fully permissionless", "Permissioned", "Proof of Stake only", "Non-existent"], correctIndex: 1 },
  { id: 18, title: "Arc Tx Costs",      emoji: "💰", difficulty: "Hard",   question: "How are transaction costs described on Arc?", options: ["High and volatile", "Predictable and dollar-based", "Zero for all users", "Hidden"], correctIndex: 1 },
  { id: 19, title: "Arc Interop Core",  emoji: "🧭", difficulty: "Hard",   question: "What core principle describes Arc's interoperability approach?", options: ["Siloed design", "Market-neutral and multichain-aligned", "Closed ecosystem", "Ethereum-only focus"], correctIndex: 1 },
  { id: 20, title: "Arc Money Vision",  emoji: "🚀", difficulty: "Hard",   question: "Arc aims to unite programmable money with what?", options: ["Legacy databases", "Onchain innovation and real-world economic activity", "Offline paper records", "Private intranets"], correctIndex: 1 },
  { id: 21, title: "Arc Malachite",     emoji: "⚔️", difficulty: "Hard",   question: "The Malachite consensus engine is designed for:", options: ["BFT (Byzantine Fault Tolerance)", "High latency", "Experimental use only", "Single validator control"], correctIndex: 0 },
  { id: 22, title: "Arc Credit",        emoji: "📊", difficulty: "Hard",   question: "In the context of credit markets, Arc combines stablecoins with:", options: ["External trust signals", "Nothing else", "Physical gold bars", "Cash under mattresses"], correctIndex: 0 },
  { id: 23, title: "Arc Finality Cap",  emoji: "📉", difficulty: "Hard",   question: "What benefit does 'Deterministic Finality' provide to capital markets?", options: ["Slows down trading", "Eliminates challenge risk and reduces counterparty exposure", "Increases fees", "Requires manual approval"], correctIndex: 1 },
  { id: 24, title: "Arc Privacy Biz",   emoji: "🔒", difficulty: "Hard",   question: "Which feature allows businesses to shield sensitive details while preserving auditability?", options: ["Public Ledger", "Opt-in privacy controls", "Zero knowledge proofs only", "Encryption keys"], correctIndex: 1 },
  { id: 25, title: "Arc Global Hub",    emoji: "🌏", difficulty: "Hard",   question: "Arc is intended to act as a global hub for what?", options: ["Settlement and routing liquidity across chains", "Mining Bitcoin", "Cloud computing", "Storage of images"], correctIndex: 0 },
  { id: 26, title: "Arc Settlement",    emoji: "🤝", difficulty: "Hard",   question: "What type of settlement does Arc modernize capital markets with?", options: ["T+2 settlement", "Stablecoin-native settlement", "Manual paper settlement", "Cheque-based settlement"], correctIndex: 1 },
  { id: 27, title: "Arc Coordination",  emoji: "🧩", difficulty: "Hard",   question: "Arc's approach to coordination is described as:", options: ["Built to control", "Built to coordinate, not control", "Centralized authority", "Mandatory participation"], correctIndex: 1 },
  { id: 28, title: "Arc Liquidity",     emoji: "💧", difficulty: "Hard",   question: "Which service helps unlock institutional liquidity onchain via Arc?", options: ["CCTP and Circle Gateway", "Public faucets", "Discord bots", "Block explorers"], correctIndex: 0 },
  { id: 29, title: "Arc Future Vision", emoji: "🔭", difficulty: "Hard",   question: "Arc's vision is a future where money, markets, and software operate as:", options: ["Separate silos", "One programmable system", "Disconnected networks", "Traditional bank accounts"], correctIndex: 1 },
  { id: 30, title: "Arc FX Settlement", emoji: "💱", difficulty: "Hard",   question: "Onchain FX products on Arc feature transparent pricing and what type of settlement?", options: ["Delayed", "Instant, deterministic settlement", "Manual", "End-of-day"], correctIndex: 1 },
]
