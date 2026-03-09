// TempoQuiz ABI — 20 quizzes, bool[20] progress
export const TEMPO_QUIZ_ABI = [
  {
    type: 'function', name: 'submitQuiz', stateMutability: 'nonpayable',
    inputs: [
      { name: 'quizId', type: 'uint256' },
      { name: 'ans0', type: 'uint8' },
      { name: 'ans1', type: 'uint8' },
      { name: 'ans2', type: 'uint8' },
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
    outputs: [{ type: 'bool[20]' }],
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

// ── Unlock schedule ──────────────────────────────────────────
// Quiz 1–5 unlocked immediately on START_DATE (March 10, 2025)
// Every 3 days after that, one more quiz unlocks (quiz 6 on day 3, etc.)
// All times UTC midnight
const START_DATE = new Date('2025-03-10T00:00:00Z')

export function getUnlockedCount(): number {
  const now = Date.now()
  const start = START_DATE.getTime()
  if (now < start) return 0
  const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  // Quiz 1-5 open from day 0; quiz 6 opens after 3 days, quiz 7 after 6 days, etc.
  const extraUnlocked = Math.floor(daysPassed / 3)
  return Math.min(5 + extraUnlocked, 20)
}

export function getUnlockDate(quizId: number): Date {
  if (quizId <= 5) return START_DATE
  const daysAfterStart = (quizId - 5) * 3
  return new Date(START_DATE.getTime() + daysAfterStart * 24 * 60 * 60 * 1000)
}

export function formatUnlockDate(quizId: number): string {
  const d = getUnlockDate(quizId)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

// ── Types ─────────────────────────────────────────────────────
export interface QuizQuestion {
  question: string
  options: [string, string, string, string]
  correctIndex: number
}

export interface QuizData {
  id: number
  title: string
  emoji: string
  questions: [QuizQuestion, QuizQuestion, QuizQuestion]
}

// ── 20 Quizzes ────────────────────────────────────────────────
// correctIndex values MUST match TempoQuiz.sol _loadQuizzes() answer hashes exactly!
export const TEMPO_QUIZZES: QuizData[] = [
  // ── Q1: a0=1, a1=2, a2=2 ──
  {
    id: 1, title: "Welcome to Tempo", emoji: "🎵",
    questions: [
      {
        question: "Tempo is a general-purpose blockchain optimized for what use case?",
        options: ["NFT gaming", "Payments", "DeFi lending", "Social media"],
        correctIndex: 1,
      },
      {
        question: "What is Tempo's approach to transaction fees?",
        options: ["Paid in native volatile token", "Free for all users", "Paid in stablecoins", "Paid in ETH"],
        correctIndex: 2,
      },
      {
        question: "What is Tempo's current testnet codename?",
        options: ["Andantino", "Allegro", "Moderato", "Presto"],
        correctIndex: 2,
      },
    ],
  },

  // ── Q2: a0=2, a1=2, a2=1 ──
  {
    id: 2, title: "Tempo Network Details", emoji: "🔗",
    questions: [
      {
        question: "What is Tempo Moderato testnet's Chain ID?",
        options: ["1337", "42429", "42431", "5042002"],
        correctIndex: 2,
      },
      {
        question: "What is the RPC URL for Tempo Moderato testnet?",
        options: ["rpc.tempo.xyz", "rpc.andantino.tempo.xyz", "rpc.moderato.tempo.xyz", "api.tempo.network"],
        correctIndex: 2,
      },
      {
        question: "Where is Tempo's official block explorer?",
        options: ["scout.tempo.xyz", "explore.tempo.xyz", "scan.tempo.xyz", "blocks.tempo.xyz"],
        correctIndex: 1,
      },
    ],
  },

  // ── Q3: a0=2, a1=2, a2=1 ──
  {
    id: 3, title: "Tempo Finality", emoji: "⚡",
    questions: [
      {
        question: "Approximately how fast are blocks finalized on Tempo?",
        options: ["Every 12 seconds", "Every 2 seconds", "Sub-second (~0.5s)", "Every 1 minute"],
        correctIndex: 2,
      },
      {
        question: "What type of finality does Tempo provide?",
        options: ["Probabilistic", "Eventual", "Deterministic instant", "Optimistic"],
        correctIndex: 2,
      },
      {
        question: "Tempo's deterministic finality gives payment operators certainty similar to:",
        options: ["Bitcoin 6-block confirmation", "Traditional financial system settlement", "Ethereum 2 epochs", "PayPal instant transfer"],
        correctIndex: 1,
      },
    ],
  },

  // ── Q4: a0=1, a1=1, a2=1 ──
  {
    id: 4, title: "Tempo Gas Model", emoji: "⛽",
    questions: [
      {
        question: "What is unusual about Tempo's gas payment model?",
        options: ["Gas is very expensive", "There is no volatile native gas token", "Gas requires staking first", "Gas changes every block"],
        correctIndex: 1,
      },
      {
        question: "What test stablecoin does Tempo's Moderato faucet provide?",
        options: ["TestUSDC", "AlphaUSD", "TempoDollar", "MockUSDT"],
        correctIndex: 1,
      },
      {
        question: "Stable predictable fees on Tempo primarily help enterprises with:",
        options: ["Token speculation", "Accounting and treasury workflows", "Mining operations", "NFT resale pricing"],
        correctIndex: 1,
      },
    ],
  },

  // ── Q5: a0=2, a1=2, a2=2 ──
  {
    id: 5, title: "Tempo EVM Compatibility", emoji: "🔧",
    questions: [
      {
        question: "Can existing Solidity smart contracts be deployed on Tempo without code changes?",
        options: ["No, requires Tempo SDK wrapper", "Only ERC-20 token contracts", "Yes, it is fully EVM compatible", "Only with special Tempo compiler"],
        correctIndex: 2,
      },
      {
        question: "Which deployment tool does Tempo officially support for contract deployment?",
        options: ["Brownie only", "Truffle Suite only", "Foundry / Forge", "Remix IDE only"],
        correctIndex: 2,
      },
      {
        question: "Tempo's contract source verification service is available at:",
        options: ["verify.tempo.xyz", "etherscan.io/verifyContract", "contracts.tempo.xyz", "sourcify.tempo.dev"],
        correctIndex: 2,
      },
    ],
  },

  // ── Q6: a0=1, a1=2, a2=1 ── (unlocks Mar 13)
  {
    id: 6, title: "Tempo Built-in Features", emoji: "✨",
    questions: [
      {
        question: "Which of these is a built-in Tempo protocol feature that requires no custom contract code?",
        options: ["NFT marketplace", "Gas fee sponsorship", "Yield farming vault", "Oracle price feeds"],
        correctIndex: 1,
      },
      {
        question: "Tempo natively supports modern wallet authentication via:",
        options: ["Username and password", "Hardware security keys only", "Passkeys (WebAuthn)", "Email one-time passwords"],
        correctIndex: 2,
      },
      {
        question: "Which advanced transaction capability is natively supported by Tempo?",
        options: ["Flash loans", "Batch transactions", "Cross-chain atomic swaps", "MEV extraction"],
        correctIndex: 1,
      },
    ],
  },

  // ── Q7: a0=1, a1=1, a2=2 ── (unlocks Mar 16)
  {
    id: 7, title: "Tempo & Stablecoins", emoji: "💵",
    questions: [
      {
        question: "Tempo is primarily designed to work with which category of stablecoins?",
        options: ["Algorithmic stablecoins", "Fiat-backed USD stablecoins", "Crypto-collateralized stablecoins", "CBDCs only"],
        correctIndex: 1,
      },
      {
        question: "Tempo is built in close collaboration with design partners to validate against:",
        options: ["NFT trading workloads", "Real payment workloads", "Gaming transaction patterns", "DeFi arbitrage flows"],
        correctIndex: 1,
      },
      {
        question: "Tempo's built-in Stablecoin DEX is specifically optimized for:",
        options: ["Leveraged token trading", "NFT floor price discovery", "FX exchange between stablecoins", "Yield farming pools"],
        correctIndex: 2,
      },
    ],
  },

  // ── Q8: a0=2, a1=2, a2=2 ── (unlocks Mar 19)
  {
    id: 8, title: "Tempo Ecosystem", emoji: "🌍",
    questions: [
      {
        question: "Tempo's open-source code is available under which license?",
        options: ["MIT License", "GPL v3", "Apache 2.0", "Business Source License"],
        correctIndex: 2,
      },
      {
        question: "Which analytics platform provides dedicated Tempo testnet data dashboards?",
        options: ["Dune Analytics", "Nansen Portfolio", "Artemis", "Glassnode Studio"],
        correctIndex: 2,
      },
      {
        question: "Which wallet infrastructure provider added Tempo chain support for fintechs?",
        options: ["MetaMask Institutional", "Rainbow Wallet", "Para (formerly GetPara)", "Trust Wallet"],
        correctIndex: 2,
      },
    ],
  },

  // ── Q9: a0=1, a1=1, a2=2 ── (unlocks Mar 22)
  {
    id: 9, title: "Tempo Transactions", emoji: "💸",
    questions: [
      {
        question: "What makes 'Tempo Transactions' different from standard EVM transactions?",
        options: ["They are anonymous by default", "They are a payment-optimized transaction type with built-in features", "They bypass gas fees entirely", "They execute cross-chain automatically"],
        correctIndex: 1,
      },
      {
        question: "Tempo's built-in fee sponsorship enables developers to offer users:",
        options: ["Unlimited free transactions forever", "Gasless or subsidized transaction flows", "Mining rewards for users", "Automatic validator incentives"],
        correctIndex: 1,
      },
      {
        question: "Scheduled recurring payments on Tempo are handled:",
        options: ["Only through third-party middleware", "Via external server-side cron jobs", "As a native built-in protocol feature", "Manually triggered by validators"],
        correctIndex: 2,
      },
    ],
  },

  // ── Q10: a0=1, a1=2, a2=2 ── (unlocks Mar 25)
  {
    id: 10, title: "Tempo Vision", emoji: "🚀",
    questions: [
      {
        question: "Tempo's core design goal is to deliver what combination of properties?",
        options: [
          "Speed, privacy, and decentralized governance",
          "Instant settlement, predictable fees, and stablecoin-native UX",
          "Maximum decentralization, security, and scalability",
          "High yield, deep liquidity, and composability",
        ],
        correctIndex: 1,
      },
      {
        question: "Which consumer fintech is publicly listed as a Tempo design partner?",
        options: ["Stripe", "Square", "Revolut", "PayPal"],
        correctIndex: 2,
      },
      {
        question: "While Tempo validator participation is permissioned, building on Tempo is:",
        options: [
          "Restricted to reading blockchain data only",
          "Only available with validator permission",
          "Limited to Circle-approved projects",
          "Fully open — anyone can deploy and transact",
        ],
        correctIndex: 3,
      },
    ],
  },

  // ── Q11: a0=0, a1=1, a2=3 ── (unlocks Mar 28)
  {
    id: 11, title: "TIP Standards", emoji: "📋",
    questions: [
      {
        question: "What does 'TIP' stand for in the Tempo ecosystem?",
        options: ["Tempo Improvement Proposal", "Token Issuance Protocol", "Transaction Integration Pattern", "Tempo Interface Parameter"],
        correctIndex: 0,
      },
      {
        question: "TIP-20 is Tempo's standard for:",
        options: ["Block production rules", "Fungible tokens on Tempo", "Validator staking requirements", "Cross-chain bridges"],
        correctIndex: 1,
      },
      {
        question: "What is the purpose of TIP-403 in the Tempo protocol?",
        options: ["Defines token decimals", "Specifies block gas limits", "Governs validator election", "Enables policy-based transfer controls"],
        correctIndex: 3,
      },
    ],
  },

  // ── Q12: a0=2, a1=0, a2=1 ── (unlocks Mar 31)
  {
    id: 12, title: "TIP-20 Rewards", emoji: "🎁",
    questions: [
      {
        question: "TIP-20 Rewards allow token issuers to:",
        options: ["Burn tokens automatically", "Set validator commission rates", "Distribute yield or rewards to token holders natively", "Pause token transfers"],
        correctIndex: 2,
      },
      {
        question: "Where are TIP-20 reward distributions handled in the Tempo protocol?",
        options: ["At the protocol layer, natively built-in", "Via third-party reward contracts only", "Through off-chain snapshots", "Manually by the token issuer each epoch"],
        correctIndex: 0,
      },
      {
        question: "Which type of financial product benefits most from TIP-20 Rewards?",
        options: ["NFT collections", "Yield-bearing stablecoins and tokenized assets", "Prediction markets", "Decentralized identity systems"],
        correctIndex: 1,
      },
    ],
  },

  // ── Q13: a0=3, a1=1, a2=0 ── (unlocks Apr 3)
  {
    id: 13, title: "TIP-403 Policies", emoji: "🛡️",
    questions: [
      {
        question: "TIP-403 policies on Tempo enable token issuers to define:",
        options: ["Block size limits", "Validator rewards schedules", "Mining difficulty adjustments", "Rules for who can hold or transfer their token"],
        correctIndex: 3,
      },
      {
        question: "Which industry has the most direct use for TIP-403 transfer policies?",
        options: ["Regulated financial institutions needing compliance controls", "Gaming companies with in-app currencies", "NFT artists managing royalties", "Validators managing node configurations"],
        correctIndex: 1,
      },
      {
        question: "TIP-403 policies are enforced:",
        options: ["At the protocol level on every token transfer", "Only on bridge transactions", "Via optional smart contract audits", "By validator committees voting on each transfer"],
        correctIndex: 0,
      },
    ],
  },

  // ── Q14: a0=1, a1=3, a2=2 ── (unlocks Apr 6)
  {
    id: 14, title: "Fee Architecture", emoji: "💰",
    questions: [
      {
        question: "On Tempo, who can optionally pay transaction fees on behalf of users?",
        options: ["Only validators", "Any dApp or protocol acting as a fee sponsor", "Circle only", "The Tempo Foundation"],
        correctIndex: 1,
      },
      {
        question: "What makes Tempo's fee model enterprise-friendly compared to ETH gas?",
        options: ["Fees are always zero", "Fees require staking ARC tokens", "Fees can only be paid monthly", "Fees are denominated in stablecoins — predictable and non-volatile"],
        correctIndex: 3,
      },
      {
        question: "Fee sponsorship on Tempo is implemented at:",
        options: ["The application smart contract layer only", "The validator node level only", "The protocol transaction level natively", "A separate L2 rollup"],
        correctIndex: 2,
      },
    ],
  },

  // ── Q15: a0=0, a1=2, a2=3 ── (unlocks Apr 9)
  {
    id: 15, title: "Tempo Blockspace", emoji: "🧱",
    questions: [
      {
        question: "How does Tempo prioritize transaction ordering within a block?",
        options: ["First-come-first-served based on submission time", "Highest gas price wins (like Ethereum)", "Random ordering by validator", "Weighted by stake of sender"],
        correctIndex: 0,
      },
      {
        question: "Tempo's block design is optimized to minimize:",
        options: ["Token decimals", "Smart contract bytecode size", "MEV (Maximal Extractable Value) opportunities", "Validator node count"],
        correctIndex: 2,
      },
      {
        question: "Tempo's high throughput design is intended to handle the demands of:",
        options: ["Individual hobbyist users only", "Small dApp communities", "Academic research networks", "High-volume institutional payment flows"],
        correctIndex: 3,
      },
    ],
  },

  // ── Q16: a0=2, a1=0, a2=1 ── (unlocks Apr 12)
  {
    id: 16, title: "Stablecoin DEX", emoji: "🔄",
    questions: [
      {
        question: "Tempo's native Stablecoin DEX uses which type of pricing curve for low slippage?",
        options: ["Constant product (x*y=k)", "Constant sum formula", "StableSwap (Curve-style) invariant", "Dutch auction model"],
        correctIndex: 2,
      },
      {
        question: "Where is the Stablecoin DEX functionality located in the Tempo stack?",
        options: ["Built into the protocol as a native feature", "Deployed as a third-party smart contract", "Available only on Tempo L2", "Hosted on a centralized matching engine"],
        correctIndex: 0,
      },
      {
        question: "The primary use case for Tempo's Stablecoin DEX is:",
        options: ["Speculative leverage trading", "FX conversion between stablecoins (e.g. USDC to EURC)", "NFT floor price auctions", "Yield-bearing lending pools"],
        correctIndex: 1,
      },
    ],
  },

  // ── Q17: a0=1, a1=3, a2=0 ── (unlocks Apr 15)
  {
    id: 17, title: "Tempo Accounts", emoji: "👤",
    questions: [
      {
        question: "What type of account abstraction does Tempo natively support?",
        options: ["External Owned Accounts (EOA) only", "Smart contract accounts with programmable logic", "Hardware wallet accounts only", "Multi-sig accounts only"],
        correctIndex: 1,
      },
      {
        question: "Tempo's native account system allows users to authenticate with:",
        options: ["Only seed phrases", "Only hardware wallets", "Only MetaMask extension", "Passkeys, social login, or traditional wallets"],
        correctIndex: 3,
      },
      {
        question: "Account recovery on Tempo can be set up using:",
        options: ["Social recovery via trusted contacts or modules", "Only the original seed phrase", "Only a centralized Tempo recovery service", "Validator committee vote"],
        correctIndex: 0,
      },
    ],
  },

  // ── Q18: a0=3, a1=2, a2=1 ── (unlocks Apr 18)
  {
    id: 18, title: "Tempo Payments", emoji: "💳",
    questions: [
      {
        question: "Which payment flow does Tempo natively support at the protocol level?",
        options: ["Leveraged margin payments", "Flash loan repayments", "P2P lending installments", "Scheduled recurring stablecoin transfers"],
        correctIndex: 3,
      },
      {
        question: "Tempo's payment features are designed specifically for:",
        options: ["Retail consumer crypto trading", "DeFi yield optimization", "Institutional-grade payment infrastructure", "NFT marketplace royalties only"],
        correctIndex: 2,
      },
      {
        question: "Instant finality on Tempo eliminates the need for:",
        options: ["Smart contracts in payments", "Stablecoin usage in payments", "Waiting for confirmations before considering a payment final", "Validator nodes in the network"],
        correctIndex: 1,
      },
    ],
  },

  // ── Q19: a0=0, a1=1, a2=2 ── (unlocks Apr 21)
  {
    id: 19, title: "Stablecoin Issuance", emoji: "🏦",
    questions: [
      {
        question: "What does Tempo provide to stablecoin issuers beyond basic ERC-20 transfers?",
        options: ["A full suite: TIP-403 policies, native rewards, and DEX liquidity", "Only a token minting interface", "Only a bridge to Ethereum", "Governance voting for monetary policy"],
        correctIndex: 0,
      },
      {
        question: "TIP-20 tokens on Tempo can optionally include:",
        options: ["Built-in yield distribution via TIP-20 Rewards", "Automatic price pegging mechanisms", "On-chain KYC identity proofs", "Fixed 18 decimal places only"],
        correctIndex: 1,
      },
      {
        question: "Which Tempo feature helps stablecoin issuers meet regulatory compliance requirements?",
        options: ["Anonymous private transactions", "TIP-403 transfer policies with access controls", "Proof-of-work consensus", "Cross-chain bridge whitelists"],
        correctIndex: 2,
      },
    ],
  },

  // ── Q20: a0=2, a1=3, a2=0 ── (unlocks Apr 24)
  {
    id: 20, title: "Tempo Advanced", emoji: "🧠",
    questions: [
      {
        question: "How does Tempo achieve its payment-focused performance without sacrificing EVM compatibility?",
        options: [
          "By forking Ethereum with minor tweaks",
          "By running EVM only on L2 sidechains",
          "By implementing a custom EVM execution environment optimized for payment workloads",
          "By limiting smart contract functionality to simple transfers",
        ],
        correctIndex: 2,
      },
      {
        question: "Tempo's approach to validator permissioning is designed to:",
        options: ["Make it fully anonymous and permissionless like Ethereum", "Allow anyone to become a validator instantly", "Ensure network reliability for enterprise payment SLAs", "Maximize decentralization above all else"],
        correctIndex: 3,
      },
      {
        question: "Which combination best describes Tempo's unique value proposition?",
        options: [
          "EVM-compatible + stablecoin gas + sub-second finality + payment-native features",
          "Zero-knowledge proofs + anonymous transactions + PoW consensus",
          "Maximum decentralization + permissionless validators + volatile gas token",
          "Layer 2 rollup + optimistic fraud proofs + 7-day withdrawal window",
        ],
        correctIndex: 0,
      },
    ],
  },
]
