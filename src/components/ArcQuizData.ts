export const ARC_QUIZ_ABI = [
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
// Quiz 1–5: open from March 10, 2026. Every 3 days: +1 quiz
const ARC_START_DATE = new Date('2026-03-10T00:00:00Z')

export function getArcUnlockedCount(total = 16): number {
  const now = Date.now()
  const start = ARC_START_DATE.getTime()
  if (now < start) return Math.min(5, total)
  const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return Math.min(5 + Math.floor(daysPassed / 3), total)
}

export function getArcUnlockDate(quizId: number): Date {
  if (quizId <= 5) return ARC_START_DATE
  return new Date(ARC_START_DATE.getTime() + (quizId - 5) * 3 * 24 * 60 * 60 * 1000)
}

export function formatArcUnlockDate(quizId: number): string {
  return getArcUnlockDate(quizId).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export interface QuizQuestion {
  question: string
  options: [string, string, string, string]
  correctIndex: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
}

export interface QuizData {
  id: number
  title: string
  emoji: string
  questions: QuizQuestion[] // flexible: can be 3, 4, 5, etc.
}

// correctIndex values MUST match ArcQuiz.sol addQuiz() answerIndexes exactly!
export const ARC_QUIZZES: QuizData[] = [
  {
    id: 1, title: "Arc Basics", emoji: "🌐",
    questions: [
      { question: "What is Arc often described as in the ecosystem?", options: ["A social media platform","An Economic OS for the internet","A simple cloud storage","A standalone wallet"], correctIndex: 1, difficulty: "Easy" },
      { question: "Which stablecoin is used for gas fees on Arc?", options: ["USDT","EURC","USDC","DAI"], correctIndex: 2, difficulty: "Easy" },
      { question: "What type of blockchain is Arc?", options: ["Layer-1","Layer-2","Sidechain","App-chain"], correctIndex: 0, difficulty: "Easy" },
    ],
  },
  {
    id: 2, title: "Arc Network", emoji: "🔗",
    questions: [
      { question: "Is Arc compatible with the Ethereum Virtual Machine (EVM)?", options: ["No","Only for specific contracts","Yes","Only on mainnet"], correctIndex: 2, difficulty: "Easy" },
      { question: "Which entity offers the Arc testnet?", options: ["Circle Technology Services, LLC","Ethereum Foundation","Mastercard","Visa"], correctIndex: 0, difficulty: "Easy" },
      { question: "What is the primary target of Arc's finality?", options: ["10 seconds","Under one second","5 minutes","Instantaneous with no consensus"], correctIndex: 1, difficulty: "Easy" },
    ],
  },
  {
    id: 3, title: "Arc Consensus & Interop", emoji: "⚡",
    questions: [
      { question: "What consensus engine powers Arc?", options: ["Proof of Work","Tendermint","Malachite","Snowman"], correctIndex: 2, difficulty: "Medium" },
      { question: "Arc's finality is described as:", options: ["Probabilistic","Deterministic","Delayed","Temporary"], correctIndex: 1, difficulty: "Medium" },
      { question: "Which tool allows seamless interoperability across ecosystems like Ethereum and Solana?", options: ["CCTP and Gateway","Metamask only","Standard Bridges","Centralized Exchanges"], correctIndex: 0, difficulty: "Medium" },
    ],
  },
  {
    id: 4, title: "Arc Privacy & Community", emoji: "🛡️",
    questions: [
      { question: "What type of privacy does Arc offer to businesses?", options: ["Full transparency only","Opt-in configurable privacy","Mandatory privacy for all","No privacy controls"], correctIndex: 1, difficulty: "Medium" },
      { question: "Which institution's Digital Assets head mentioned testing programmable settlement on Arc?", options: ["JPMorgan","Goldman Sachs","BlackRock","HSBC"], correctIndex: 1, difficulty: "Medium" },
      { question: "The 'Architecture Review' sessions on Arc Discord are also known as:", options: ["Town Halls","Design Clinics","Dev Meets","Code Reviews"], correctIndex: 1, difficulty: "Medium" },
    ],
  },
  {
    id: 5, title: "Arc Partners & Vision", emoji: "🤝",
    questions: [
      { question: "What is Arc purpose-built to support?", options: ["Gaming only","Real-world financial flows","Social networking","NFT art storage"], correctIndex: 1, difficulty: "Medium" },
      { question: "Which partner is exploring secure payment experiences across fiat and stablecoin rails on Arc?", options: ["Visa","Mastercard","American Express","PayPal"], correctIndex: 1, difficulty: "Medium" },
      { question: "Cuy Sheffield, who praised Arc's design, is the Head of Crypto at:", options: ["Circle","Visa","Mastercard","Goldman Sachs"], correctIndex: 1, difficulty: "Medium" },
    ],
  },
  {
    id: 6, title: "Arc Commerce & Validators", emoji: "🤖",
    questions: [
      { question: "What does 'Agentic Commerce' on Arc enable?", options: ["Manual trading","AI agents to coordinate and settle value","Human-only marketplaces","Traditional bank transfers"], correctIndex: 1, difficulty: "Hard" },
      { question: "Arc's validator participation is characterized as:", options: ["Fully permissionless","Permissioned","Proof of Stake only","Non-existent"], correctIndex: 1, difficulty: "Hard" },
      { question: "How are transaction costs described on Arc?", options: ["High and volatile","Predictable and dollar-based","Zero for all users","Hidden"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 7, title: "Arc Principles", emoji: "🧭",
    questions: [
      { question: "What core principle describes Arc's interoperability approach?", options: ["Siloed design","Market-neutral and multichain-aligned","Closed ecosystem","Ethereum-only focus"], correctIndex: 1, difficulty: "Hard" },
      { question: "Arc aims to unite programmable money with what?", options: ["Legacy databases","Onchain innovation and real-world economic activity","Offline paper records","Private intranets"], correctIndex: 1, difficulty: "Hard" },
      { question: "The Malachite consensus engine is designed for:", options: ["BFT (Byzantine Fault Tolerance)","High latency","Experimental use only","Single validator control"], correctIndex: 0, difficulty: "Hard" },
    ],
  },
  {
    id: 8, title: "Arc Capital Markets", emoji: "📈",
    questions: [
      { question: "In the context of credit markets, Arc combines stablecoins with:", options: ["External trust signals","Nothing else","Physical gold bars","Cash under mattresses"], correctIndex: 0, difficulty: "Hard" },
      { question: "What benefit does 'Deterministic Finality' provide to capital markets?", options: ["Slows down trading","Eliminates challenge risk and reduces counterparty exposure","Increases fees","Requires manual approval"], correctIndex: 1, difficulty: "Hard" },
      { question: "Which feature allows businesses to shield sensitive details while preserving auditability?", options: ["Public Ledger","Opt-in privacy controls","Zero knowledge proofs only","Encryption keys"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 9, title: "Arc Hub & Settlement", emoji: "🏦",
    questions: [
      { question: "Arc is intended to act as a global hub for what?", options: ["Settlement and routing liquidity across chains","Mining Bitcoin","Cloud computing","Storage of images"], correctIndex: 0, difficulty: "Hard" },
      { question: "What type of settlement does Arc modernize capital markets with?", options: ["T+2 settlement","Stablecoin-native settlement","Manual paper settlement","Cheque-based settlement"], correctIndex: 1, difficulty: "Hard" },
      { question: "Arc's approach to coordination is described as:", options: ["Built to control","Built to coordinate, not control","Centralized authority","Mandatory participation"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 10, title: "Arc Future", emoji: "🚀",
    questions: [
      { question: "Which service helps unlock institutional liquidity onchain via Arc?", options: ["CCTP and Circle Gateway","Public faucets","Discord bots","Block explorers"], correctIndex: 0, difficulty: "Hard" },
      { question: "Arc's vision is a future where money, markets, and software operate as:", options: ["Separate silos","One programmable system","Disconnected networks","Traditional bank accounts"], correctIndex: 1, difficulty: "Hard" },
      { question: "Onchain FX products on Arc feature transparent pricing and what type of settlement?", options: ["Delayed","Instant, deterministic settlement","Manual","End-of-day"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 11, title: "Arc Legal & Compliance", emoji: "⚖️",
    questions: [
      { question: "Which specific entity offers the Arc testnet and acts as the software provider?", options: ["Circle Internet Group, Inc.","Circle Technology Services, LLC (CTS)","Arc Foundation","NYDFS"], correctIndex: 1, difficulty: "Expert" },
      { question: "What is the regulatory status of Arc regarding NYDFS?", options: ["Fully licensed","Currently under review","It has not been reviewed or approved by NYDFS","Approved for institutional use only"], correctIndex: 2, difficulty: "Hard" },
      { question: "While access to Arc is fully open, how is validator participation structured?", options: ["Fully permissionless","Permissioned","Delegated Proof of Stake","Proof of Authority only"], correctIndex: 1, difficulty: "Expert" },
    ],
  },
  {
    id: 12, title: "Arc Consensus Deep Dive", emoji: "🔮",
    questions: [
      { question: "According to Arc Docs, what is the core purpose of the Malachite consensus engine?", options: ["To maximize gas efficiency","Certainty, reliability, and long-term operational excellence","To enable private transactions by default","To support Ethereum-only assets"], correctIndex: 1, difficulty: "Hard" },
      { question: "In the Arc ecosystem, which partner is specifically categorized under 'Tokenized Assets'?", options: ["BlackRock","Visa","Mastercard","AllUnity"], correctIndex: 0, difficulty: "Expert" },
      { question: "Raj Dhamodharan from Mastercard describes their role with Arc as being a(n):", options: ["Liquidity provider","Early design partner","Governance lead","Primary validator"], correctIndex: 1, difficulty: "Expert" },
    ],
  },
  {
    id: 13, title: "Arc Coordination", emoji: "🧩",
    questions: [
      { question: "What does the principle 'Built to coordinate, not control' imply for Arc?", options: ["Arc dictates market prices","Arc aligns builders and partners across financial sectors to achieve collective goals","Arc controls all validator nodes","Arc restricts cross-chain movements"], correctIndex: 1, difficulty: "Hard" },
      { question: "Which technical component allows Arc to aggregate stablecoin liquidity across the multichain ecosystem?", options: ["EVM Execution Layer","CCTP and Gateway","Malachite Engine","Deterministic Finality"], correctIndex: 1, difficulty: "Expert" },
      { question: "Under 'Agentic Commerce', what specific capability is enabled for AI agents on Arc?", options: ["Buying and selling NFTs only","Coordination systems to post, match, and settle intents in real time","Running off-chain databases","Predicting gas fees"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 14, title: "Arc Institutional Use", emoji: "🏛️",
    questions: [
      { question: "According to Mathew McDermott from Goldman Sachs, what is being tested on Arc?", options: ["High-frequency retail trading","Programmable settlement and interoperable FX workflows","Decentralized social media","Privacy-only transfers"], correctIndex: 1, difficulty: "Expert" },
      { question: "How does Arc define its 'Market-neutral and multichain-aligned' core principle?", options: ["It only supports Circle-issued tokens","It is interoperable through CCTP and Gateway to unlock institutional liquidity","It competes directly with Ethereum","It is a closed ecosystem for banks"], correctIndex: 1, difficulty: "Hard" },
      { question: "In the context of onchain credit markets, Arc combines stablecoins with what type of signals?", options: ["Social media trends","External trust signals like identity and reputation","Stock market indices","Manual bank approvals"], correctIndex: 1, difficulty: "Expert" },
    ],
  },
  {
    id: 15, title: "Arc Credit & Trust", emoji: "💳",
    questions: [
      { question: "What is a specific example of 'Onchain credit with offchain trust' mentioned in the documentation?", options: ["Uncollateralized retail loans","Identity-based lending protocols using verifiable credentials","Bitcoin-backed mortgages","Algorithmically stabilized credit"], correctIndex: 1, difficulty: "Hard" },
      { question: "Cuy Sheffield (Visa) highlights that Arc's design offers an environment to explore connecting what to onchain infrastructure?", options: ["Legacy hardware","Trusted payments networks","Satellite internet","Central bank databases"], correctIndex: 1, difficulty: "Expert" },
      { question: "What does 'Deterministic Finality' specifically eliminate in capital market workflows on Arc?", options: ["Gas fees","Challenge risk and counterparty exposure","The need for smart contracts","EVM compatibility issues"], correctIndex: 1, difficulty: "Hard" },
    ],
  },
  {
    id: 16, title: "Arc Advanced", emoji: "🎓",
    questions: [
      { question: "Which use case focuses on serving 'under-served markets' using SMB and consumer apps?", options: ["Asset tokenization","Onchain credit markets","Stablecoin FX","Treasury management"], correctIndex: 1, difficulty: "Expert" },
      { question: "Arc is described as 'Purpose-built, not general-purpose'. What is its primary focus?", options: ["Gaming and Metaverse","Real-world economic activity and institutional-grade DeFi","NFT marketplaces","Social networking"], correctIndex: 1, difficulty: "Hard" },
      { question: "Which entity is listed as an 'Analytics' provider in the Arc ecosystem?", options: ["Elliptic","Circle","Goldman Sachs","AWS"], correctIndex: 0, difficulty: "Expert" },
    ],
  },
]
