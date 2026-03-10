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
  explanation?: string
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
      { question: "What is Arc often described as in the ecosystem?", options: ["A social media platform","An Economic OS for the internet","A simple cloud storage","A standalone wallet"], correctIndex: 1, difficulty: "Easy", explanation: "Arc is positioned as an 'Economic OS for the internet' — a foundational layer that enables programmable money, markets, and financial applications to run on top of it." },
      { question: "Which stablecoin is used for gas fees on Arc?", options: ["USDT","EURC","USDC","DAI"], correctIndex: 2, difficulty: "Easy", explanation: "Arc uses USDC for gas fees, making transaction costs predictable and dollar-denominated rather than tied to a volatile native token." },
      { question: "What type of blockchain is Arc?", options: ["Layer-1","Layer-2","Sidechain","App-chain"], correctIndex: 0, difficulty: "Easy", explanation: "Arc is a Layer-1 blockchain built by Circle, meaning it has its own independent consensus, security, and state — it does not rely on another chain for settlement." },
    ],
  },
  {
    id: 2, title: "Arc Network", emoji: "🔗",
    questions: [
      { question: "Is Arc compatible with the Ethereum Virtual Machine (EVM)?", options: ["No","Only for specific contracts","Yes","Only on mainnet"], correctIndex: 2, difficulty: "Easy", explanation: "Arc is fully EVM-compatible, which means developers can deploy existing Solidity smart contracts and use familiar Ethereum tooling without changes." },
      { question: "Which entity offers the Arc testnet?", options: ["Circle Technology Services, LLC","Ethereum Foundation","Mastercard","Visa"], correctIndex: 0, difficulty: "Easy", explanation: "Circle Technology Services, LLC (CTS), a subsidiary of Circle, operates the Arc testnet and acts as the software provider for the network." },
      { question: "What is the primary target of Arc's finality?", options: ["10 seconds","Under one second","5 minutes","Instantaneous with no consensus"], correctIndex: 1, difficulty: "Easy", explanation: "Arc targets sub-second finality, meaning transactions are confirmed in under one second — a critical requirement for real-world financial applications." },
    ],
  },
  {
    id: 3, title: "Arc Consensus & Interop", emoji: "⚡",
    questions: [
      { question: "What consensus engine powers Arc?", options: ["Proof of Work","Tendermint","Malachite","Snowman"], correctIndex: 2, difficulty: "Medium", explanation: "Arc uses the Malachite consensus engine, which is a Byzantine Fault Tolerant (BFT) protocol designed for high performance, reliability, and long-term operational excellence." },
      { question: "Arc's finality is described as:", options: ["Probabilistic","Deterministic","Delayed","Temporary"], correctIndex: 1, difficulty: "Medium", explanation: "Arc achieves deterministic finality, meaning once a transaction is confirmed it is irreversibly settled — unlike probabilistic finality where deep reorganizations remain theoretically possible." },
      { question: "Which tool allows seamless interoperability across ecosystems like Ethereum and Solana?", options: ["CCTP and Gateway","Metamask only","Standard Bridges","Centralized Exchanges"], correctIndex: 0, difficulty: "Medium", explanation: "Circle's Cross-Chain Transfer Protocol (CCTP) and Circle Gateway enable native USDC to move across chains trustlessly, making Arc interoperable with Ethereum, Solana, and other ecosystems." },
    ],
  },
  {
    id: 4, title: "Arc Privacy & Community", emoji: "🛡️",
    questions: [
      { question: "What type of privacy does Arc offer to businesses?", options: ["Full transparency only","Opt-in configurable privacy","Mandatory privacy for all","No privacy controls"], correctIndex: 1, difficulty: "Medium", explanation: "Arc provides opt-in configurable privacy, allowing businesses to shield sensitive transaction details when needed while preserving auditability — balancing compliance with confidentiality." },
      { question: "Which institution's Digital Assets head mentioned testing programmable settlement on Arc?", options: ["JPMorgan","Goldman Sachs","BlackRock","HSBC"], correctIndex: 1, difficulty: "Medium", explanation: "Mathew McDermott, Head of Digital Assets at Goldman Sachs, highlighted that they are testing programmable settlement and interoperable FX workflows on Arc." },
      { question: "The 'Architecture Review' sessions on Arc Discord are also known as:", options: ["Town Halls","Design Clinics","Dev Meets","Code Reviews"], correctIndex: 1, difficulty: "Medium", explanation: "Arc hosts 'Design Clinics' (also called Architecture Review sessions) on Discord, where developers can get feedback on their technical designs from the core team." },
    ],
  },
  {
    id: 5, title: "Arc Partners & Vision", emoji: "🤝",
    questions: [
      { question: "What is Arc purpose-built to support?", options: ["Gaming only","Real-world financial flows","Social networking","NFT art storage"], correctIndex: 1, difficulty: "Medium", explanation: "Arc is purpose-built for real-world financial flows — it is designed for institutional-grade DeFi, programmable payments, and capital market use cases rather than general-purpose computation." },
      { question: "Which partner is exploring secure payment experiences across fiat and stablecoin rails on Arc?", options: ["Visa","Mastercard","American Express","PayPal"], correctIndex: 1, difficulty: "Medium", explanation: "Mastercard is exploring Arc to deliver secure payment experiences that bridge traditional fiat rails with stablecoin rails, leveraging Arc's speed and programmability." },
      { question: "Cuy Sheffield, who praised Arc's design, is the Head of Crypto at:", options: ["Circle","Visa","Mastercard","Goldman Sachs"], correctIndex: 1, difficulty: "Medium", explanation: "Cuy Sheffield is Visa's Head of Crypto; he noted that Arc's design offers a compelling environment for connecting trusted payments networks to onchain infrastructure." },
    ],
  },
  {
    id: 6, title: "Arc Commerce & Validators", emoji: "🤖",
    questions: [
      { question: "What does 'Agentic Commerce' on Arc enable?", options: ["Manual trading","AI agents to coordinate and settle value","Human-only marketplaces","Traditional bank transfers"], correctIndex: 1, difficulty: "Hard", explanation: "Agentic Commerce on Arc allows AI agents to autonomously post intents, match counterparties, and settle value in real time — enabling a new class of machine-to-machine economic activity." },
      { question: "Arc's validator participation is characterized as:", options: ["Fully permissionless","Permissioned","Proof of Stake only","Non-existent"], correctIndex: 1, difficulty: "Hard", explanation: "While Arc's network access is open to all users, validator participation is permissioned — validators are vetted to meet performance and reliability standards required for institutional financial use." },
      { question: "How are transaction costs described on Arc?", options: ["High and volatile","Predictable and dollar-based","Zero for all users","Hidden"], correctIndex: 1, difficulty: "Hard", explanation: "Arc's gas fees are paid in USDC, making costs predictable and dollar-denominated — businesses can forecast expenses without worrying about native token price volatility." },
    ],
  },
  {
    id: 7, title: "Arc Principles", emoji: "🧭",
    questions: [
      { question: "What core principle describes Arc's interoperability approach?", options: ["Siloed design","Market-neutral and multichain-aligned","Closed ecosystem","Ethereum-only focus"], correctIndex: 1, difficulty: "Hard", explanation: "Arc's 'market-neutral and multichain-aligned' principle means it does not favor any single ecosystem — instead it connects to Ethereum, Solana, and others via CCTP and Gateway to unlock institutional liquidity everywhere." },
      { question: "Arc aims to unite programmable money with what?", options: ["Legacy databases","Onchain innovation and real-world economic activity","Offline paper records","Private intranets"], correctIndex: 1, difficulty: "Hard", explanation: "Arc's vision is to unite programmable money (stablecoins) with onchain innovation and real-world economic activity — bridging digital finance with everyday commerce and institutional markets." },
      { question: "The Malachite consensus engine is designed for:", options: ["BFT (Byzantine Fault Tolerance)","High latency","Experimental use only","Single validator control"], correctIndex: 0, difficulty: "Hard", explanation: "Malachite is a BFT (Byzantine Fault Tolerant) consensus engine, meaning it can tolerate up to one-third of validators acting maliciously and still reach correct consensus — essential for financial-grade reliability." },
    ],
  },
  {
    id: 8, title: "Arc Capital Markets", emoji: "📈",
    questions: [
      { question: "In the context of credit markets, Arc combines stablecoins with:", options: ["External trust signals","Nothing else","Physical gold bars","Cash under mattresses"], correctIndex: 0, difficulty: "Hard", explanation: "Arc's onchain credit market model combines stablecoins with external trust signals such as identity and reputation data, enabling undercollateralized and identity-based lending on-chain." },
      { question: "What benefit does 'Deterministic Finality' provide to capital markets?", options: ["Slows down trading","Eliminates challenge risk and reduces counterparty exposure","Increases fees","Requires manual approval"], correctIndex: 1, difficulty: "Hard", explanation: "Deterministic finality means transactions are permanently settled without any challenge period, which eliminates counterparty exposure and settlement risk — a major improvement over traditional T+2 markets." },
      { question: "Which feature allows businesses to shield sensitive details while preserving auditability?", options: ["Public Ledger","Opt-in privacy controls","Zero knowledge proofs only","Encryption keys"], correctIndex: 1, difficulty: "Hard", explanation: "Arc's opt-in privacy controls let businesses selectively hide transaction details such as counterparty identities or amounts, while still maintaining the auditability required for regulatory compliance." },
    ],
  },
  {
    id: 9, title: "Arc Hub & Settlement", emoji: "🏦",
    questions: [
      { question: "Arc is intended to act as a global hub for what?", options: ["Settlement and routing liquidity across chains","Mining Bitcoin","Cloud computing","Storage of images"], correctIndex: 0, difficulty: "Hard", explanation: "Arc is designed to be a global settlement and liquidity routing hub — aggregating stablecoin liquidity from across the multichain ecosystem and enabling instant cross-chain value transfer." },
      { question: "What type of settlement does Arc modernize capital markets with?", options: ["T+2 settlement","Stablecoin-native settlement","Manual paper settlement","Cheque-based settlement"], correctIndex: 1, difficulty: "Hard", explanation: "Arc replaces legacy T+2 (two-day) settlement with stablecoin-native settlement, allowing capital markets to settle trades instantly and programmatically on-chain." },
      { question: "Arc's approach to coordination is described as:", options: ["Built to control","Built to coordinate, not control","Centralized authority","Mandatory participation"], correctIndex: 1, difficulty: "Hard", explanation: "'Built to coordinate, not control' means Arc aligns builders and financial partners around shared infrastructure rather than imposing centralized governance — enabling collaborative ecosystems." },
    ],
  },
  {
    id: 10, title: "Arc Future", emoji: "🚀",
    questions: [
      { question: "Which service helps unlock institutional liquidity onchain via Arc?", options: ["CCTP and Circle Gateway","Public faucets","Discord bots","Block explorers"], correctIndex: 0, difficulty: "Hard", explanation: "CCTP (Cross-Chain Transfer Protocol) and Circle Gateway together unlock institutional liquidity on Arc by enabling native USDC to flow trustlessly between Arc and other major blockchains." },
      { question: "Arc's vision is a future where money, markets, and software operate as:", options: ["Separate silos","One programmable system","Disconnected networks","Traditional bank accounts"], correctIndex: 1, difficulty: "Hard", explanation: "Arc's long-term vision is a unified programmable system where money, markets, and software are composable — any application can move value and settle transactions natively without relying on intermediaries." },
      { question: "Onchain FX products on Arc feature transparent pricing and what type of settlement?", options: ["Delayed","Instant, deterministic settlement","Manual","End-of-day"], correctIndex: 1, difficulty: "Hard", explanation: "Arc's onchain FX products offer transparent pricing combined with instant, deterministic settlement — eliminating the delays and counterparty risks inherent in traditional foreign exchange clearing." },
    ],
  },
  {
    id: 11, title: "Arc Legal & Compliance", emoji: "⚖️",
    questions: [
      { question: "Which specific entity offers the Arc testnet and acts as the software provider?", options: ["Circle Internet Group, Inc.","Circle Technology Services, LLC (CTS)","Arc Foundation","NYDFS"], correctIndex: 1, difficulty: "Expert", explanation: "Circle Technology Services, LLC (CTS) is the specific legal entity that develops and offers the Arc testnet, operating as the software provider for the network under Circle's corporate structure." },
      { question: "What is the regulatory status of Arc regarding NYDFS?", options: ["Fully licensed","Currently under review","It has not been reviewed or approved by NYDFS","Approved for institutional use only"], correctIndex: 2, difficulty: "Hard", explanation: "Arc has not been reviewed or approved by NYDFS (New York Department of Financial Services), which is an important legal disclosure for users to understand when interacting with the testnet." },
      { question: "While access to Arc is fully open, how is validator participation structured?", options: ["Fully permissionless","Permissioned","Delegated Proof of Stake","Proof of Authority only"], correctIndex: 1, difficulty: "Expert", explanation: "Network access is open to everyone, but validators on Arc are permissioned — they must meet specific requirements to ensure the reliability and security standards needed for institutional financial use cases." },
    ],
  },
  {
    id: 12, title: "Arc Consensus Deep Dive", emoji: "🔮",
    questions: [
      { question: "According to Arc Docs, what is the core purpose of the Malachite consensus engine?", options: ["To maximize gas efficiency","Certainty, reliability, and long-term operational excellence","To enable private transactions by default","To support Ethereum-only assets"], correctIndex: 1, difficulty: "Hard", explanation: "The Malachite consensus engine is built around three pillars: certainty (deterministic finality), reliability (high availability), and long-term operational excellence — qualities essential for financial infrastructure." },
      { question: "In the Arc ecosystem, which partner is specifically categorized under 'Tokenized Assets'?", options: ["BlackRock","Visa","Mastercard","AllUnity"], correctIndex: 0, difficulty: "Expert", explanation: "BlackRock is categorized under 'Tokenized Assets' in the Arc ecosystem, reflecting their role in bringing real-world asset tokenization to the network alongside other financial partners." },
      { question: "Raj Dhamodharan from Mastercard describes their role with Arc as being a(n):", options: ["Liquidity provider","Early design partner","Governance lead","Primary validator"], correctIndex: 1, difficulty: "Expert", explanation: "Raj Dhamodharan (Mastercard's EVP of Blockchain & Digital Assets) describes Mastercard as an early design partner on Arc, highlighting their collaborative involvement in shaping the network's financial use cases." },
    ],
  },
  {
    id: 13, title: "Arc Coordination", emoji: "🧩",
    questions: [
      { question: "What does the principle 'Built to coordinate, not control' imply for Arc?", options: ["Arc dictates market prices","Arc aligns builders and partners across financial sectors to achieve collective goals","Arc controls all validator nodes","Arc restricts cross-chain movements"], correctIndex: 1, difficulty: "Hard", explanation: "This principle means Arc acts as neutral coordination infrastructure — it aligns builders, financial institutions, and partners around shared goals without imposing centralized control over the ecosystem." },
      { question: "Which technical component allows Arc to aggregate stablecoin liquidity across the multichain ecosystem?", options: ["EVM Execution Layer","CCTP and Gateway","Malachite Engine","Deterministic Finality"], correctIndex: 1, difficulty: "Expert", explanation: "CCTP and Circle Gateway are the technical components that aggregate and route stablecoin liquidity across chains, allowing Arc to serve as a multichain liquidity hub." },
      { question: "Under 'Agentic Commerce', what specific capability is enabled for AI agents on Arc?", options: ["Buying and selling NFTs only","Coordination systems to post, match, and settle intents in real time","Running off-chain databases","Predicting gas fees"], correctIndex: 1, difficulty: "Hard", explanation: "Agentic Commerce on Arc enables AI agents to use coordination systems that post economic intents, match them with counterparties, and settle the resulting transactions in real time — fully autonomously." },
    ],
  },
  {
    id: 14, title: "Arc Institutional Use", emoji: "🏛️",
    questions: [
      { question: "According to Mathew McDermott from Goldman Sachs, what is being tested on Arc?", options: ["High-frequency retail trading","Programmable settlement and interoperable FX workflows","Decentralized social media","Privacy-only transfers"], correctIndex: 1, difficulty: "Expert", explanation: "Goldman Sachs is testing programmable settlement (smart contract-driven clearing) and interoperable FX workflows on Arc, exploring how traditional capital market operations can be modernized on-chain." },
      { question: "How does Arc define its 'Market-neutral and multichain-aligned' core principle?", options: ["It only supports Circle-issued tokens","It is interoperable through CCTP and Gateway to unlock institutional liquidity","It competes directly with Ethereum","It is a closed ecosystem for banks"], correctIndex: 1, difficulty: "Hard", explanation: "Arc's market-neutral stance means it integrates with any ecosystem via CCTP and Gateway, unlocking institutional liquidity across Ethereum, Solana, and other chains without picking winners." },
      { question: "In the context of onchain credit markets, Arc combines stablecoins with what type of signals?", options: ["Social media trends","External trust signals like identity and reputation","Stock market indices","Manual bank approvals"], correctIndex: 1, difficulty: "Expert", explanation: "Arc's credit market infrastructure combines stablecoins with external trust signals — such as verifiable identity and on-chain reputation — to enable undercollateralized lending and novel credit products." },
    ],
  },
  {
    id: 15, title: "Arc Credit & Trust", emoji: "💳",
    questions: [
      { question: "What is a specific example of 'Onchain credit with offchain trust' mentioned in the documentation?", options: ["Uncollateralized retail loans","Identity-based lending protocols using verifiable credentials","Bitcoin-backed mortgages","Algorithmically stabilized credit"], correctIndex: 1, difficulty: "Hard", explanation: "Arc's documentation cites identity-based lending protocols using verifiable credentials as a concrete example — where offchain identity proof enables onchain credit issuance without requiring full collateral." },
      { question: "Cuy Sheffield (Visa) highlights that Arc's design offers an environment to explore connecting what to onchain infrastructure?", options: ["Legacy hardware","Trusted payments networks","Satellite internet","Central bank databases"], correctIndex: 1, difficulty: "Expert", explanation: "Cuy Sheffield emphasized that Arc provides an environment for Visa to explore connecting trusted payments networks (like Visa's existing rails) to onchain infrastructure, bridging traditional and blockchain finance." },
      { question: "What does 'Deterministic Finality' specifically eliminate in capital market workflows on Arc?", options: ["Gas fees","Challenge risk and counterparty exposure","The need for smart contracts","EVM compatibility issues"], correctIndex: 1, difficulty: "Hard", explanation: "Deterministic finality eliminates challenge risk (the possibility a settlement could be reversed) and counterparty exposure, making it safe to release assets the moment a transaction confirms." },
    ],
  },
  {
    id: 16, title: "Arc Advanced", emoji: "🎓",
    questions: [
      { question: "Which use case focuses on serving 'under-served markets' using SMB and consumer apps?", options: ["Asset tokenization","Onchain credit markets","Stablecoin FX","Treasury management"], correctIndex: 1, difficulty: "Expert", explanation: "Onchain credit markets on Arc specifically target under-served markets by enabling SMB (small and medium business) lending and consumer credit apps that use verifiable credentials to reach borrowers overlooked by traditional finance." },
      { question: "Arc is described as 'Purpose-built, not general-purpose'. What is its primary focus?", options: ["Gaming and Metaverse","Real-world economic activity and institutional-grade DeFi","NFT marketplaces","Social networking"], correctIndex: 1, difficulty: "Hard", explanation: "Unlike general-purpose blockchains, Arc is specifically optimized for real-world economic activity and institutional-grade DeFi — every design decision prioritizes financial reliability, compliance, and interoperability." },
      { question: "Which entity is listed as an 'Analytics' provider in the Arc ecosystem?", options: ["Elliptic","Circle","Goldman Sachs","AWS"], correctIndex: 0, difficulty: "Expert", explanation: "Elliptic, a blockchain analytics and compliance firm, is listed as the Analytics provider in the Arc ecosystem — helping institutions meet AML/KYC requirements when transacting on Arc." },
    ],
  },
]
