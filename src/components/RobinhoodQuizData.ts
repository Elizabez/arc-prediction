export const ROBINHOOD_QUIZ_ABI = [
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
const RH_START_DATE = new Date('2026-03-10T00:00:00Z')

export function getRobinhoodUnlockedCount(total = 16): number {
  const now = Date.now()
  const start = RH_START_DATE.getTime()
  if (now < start) return Math.min(5, total)
  const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return Math.min(5 + Math.floor(daysPassed / 3), total)
}

export function getRobinhoodUnlockDate(quizId: number): Date {
  if (quizId <= 5) return RH_START_DATE
  return new Date(RH_START_DATE.getTime() + (quizId - 5) * 3 * 24 * 60 * 60 * 1000)
}

export function formatRobinhoodUnlockDate(quizId: number): string {
  return getRobinhoodUnlockDate(quizId).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
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
  questions: QuizQuestion[]
}

// correctIndex MUST match addQuiz() answerIndexes exactly!
// Quiz  1: [1,2,2]  Quiz  2: [1,1,1]  Quiz  3: [1,2,2]  Quiz  4: [2,1,2]
// Quiz  5: [1,1,1]  Quiz  6: [1,2,2]  Quiz  7: [1,2,2]  Quiz  8: [1,1,1]
// Quiz  9: [1,1,2]  Quiz 10: [2,1,3]  Quiz 11: [2,1,1]  Quiz 12: [1,1,2]
// Quiz 13: [1,1,1]  Quiz 14: [1,1,1]  Quiz 15: [1,1,1]  Quiz 16: [0,2,2]
export const ROBINHOOD_QUIZZES: QuizData[] = [
  {
    id: 1, title: 'RH Chain Layer', emoji: '🔴',
    questions: [
      { question: 'What Layer is the Robinhood Chain on Ethereum?', options: ['Layer 1', 'Layer 2', 'Layer 3', 'Sidechain'], correctIndex: 1, difficulty: 'Easy' },
      { question: "Which platform's technology is Robinhood Chain built on?", options: ['Optimism', 'Polygon', 'Arbitrum', 'ZKSync'], correctIndex: 2, difficulty: 'Easy' },
      { question: 'What is the native gas token for the Robinhood Chain Testnet?', options: ['HOOD', 'USDC', 'ETH', 'ARB'], correctIndex: 2, difficulty: 'Easy' },
    ],
  },
  {
    id: 2, title: 'Chain Setup', emoji: '🚀',
    questions: [
      { question: 'To enable testnet in the Robinhood Wallet, which setting must you access?', options: ['Privacy Settings', 'Developer Settings', 'Asset Management', 'Security Center'], correctIndex: 1, difficulty: 'Easy' },
      { question: 'Do tokens on the Robinhood Chain testnet have real-world value?', options: ['Yes', 'No', 'Only for Robinhood Gold users', 'Redeemable for stocks'], correctIndex: 1, difficulty: 'Easy' },
      { question: 'What is the primary long-term goal of the Robinhood Chain?', options: ['Meme coin trading', 'Tokenization of real-world assets (RWA)', 'Replacing Ethereum', 'Social media integration'], correctIndex: 1, difficulty: 'Easy' },
    ],
  },
  {
    id: 3, title: 'People & Market', emoji: '👤',
    questions: [
      { question: 'Who is the CEO of Robinhood who announced the tokenization plan in June 2025?', options: ['Brian Armstrong', 'Vlad Tenev', 'Steven Goldfeder', 'Johann Kerbrat'], correctIndex: 1, difficulty: 'Easy' },
      { question: 'What tool is used to receive free testnet funds for experimentation?', options: ['Bridge', 'Swap', 'Faucet', 'Stake'], correctIndex: 2, difficulty: 'Easy' },
      { question: 'In which market did Robinhood first roll out tokenized U.S. stocks?', options: ['USA', 'Asia', 'European Union (EU)', 'United Kingdom'], correctIndex: 2, difficulty: 'Easy' },
    ],
  },
  {
    id: 4, title: 'Testnet 101', emoji: '🧪',
    questions: [
      { question: 'Is the Robinhood Chain testnet connected to your real brokerage account?', options: ['Yes', 'Only for crypto balances', 'No, it is independent', 'Only via Robinhood Gold'], correctIndex: 2, difficulty: 'Easy' },
      { question: "What is Robinhood Markets' stock ticker on NASDAQ?", options: ['ROBIN', 'HOOD', 'RBH', 'COIN'], correctIndex: 1, difficulty: 'Easy' },
      { question: "Where is Robinhood's headquarters located?", options: ['New York', 'San Francisco', 'Menlo Park', 'Chicago'], correctIndex: 2, difficulty: 'Easy' },
    ],
  },
  {
    id: 5, title: 'Wallet & Access', emoji: '💳',
    questions: [
      { question: 'Can you add Robinhood Chain Testnet to a browser wallet like MetaMask?', options: ['No, only Robinhood Wallet', 'Yes, using manual configuration', 'Only on desktop browsers', 'By invitation only'], correctIndex: 1, difficulty: 'Easy' },
      { question: "What was Part One of Robinhood's three-part blockchain integration plan?", options: ['Launching a DEX', 'Tokenized stock trading in the EU', 'Activating Robinhood Chain', 'Acquiring Bitstamp'], correctIndex: 1, difficulty: 'Easy' },
      { question: 'Does participating in the testnet activities require spending real money?', options: ['Yes', 'No, it is free', 'Requires a $10 deposit', 'Requires Robinhood Gold'], correctIndex: 1, difficulty: 'Easy' },
    ],
  },
  {
    id: 6, title: 'Airdrop & Network', emoji: '📡',
    questions: [
      { question: 'What is the current status of official airdrop rewards for testnet users?', options: ['Confirmed 1:1 ratio', 'No official information on rewards', 'Only for developers', 'Registration is closed'], correctIndex: 1, difficulty: 'Easy' },
      { question: 'What is the specific Chain ID for Robinhood Chain Testnet?', options: ['137', '42161', '46630', '11155111'], correctIndex: 2, difficulty: 'Medium' },
      { question: 'Which network can you bridge test ETH from to reach Robinhood Chain?', options: ['Mainnet', 'Goerli', 'Sepolia', 'Base'], correctIndex: 2, difficulty: 'Medium' },
    ],
  },
  {
    id: 7, title: 'DeFi Apps', emoji: '💱',
    questions: [
      { question: 'Which platform is used for Swaps and Liquidity on the testnet?', options: ['Uniswap', 'Synthra', 'SushiSwap', 'PancakeSwap'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'Which platform is recommended for minting a domain on the testnet?', options: ['ENS', 'Unstoppable Domains', 'InfinityName', 'Space ID'], correctIndex: 2, difficulty: 'Medium' },
      { question: "Which is one of the platforms to mint various NFTs for on-chain activity?", options: ['OpenSea', 'Blur', 'Morkie', 'Rarible'], correctIndex: 2, difficulty: 'Medium' },
    ],
  },
  {
    id: 8, title: 'Dev Infrastructure', emoji: '🛠️',
    questions: [
      { question: 'Who is the recommended infrastructure provider for building on Robinhood Chain?', options: ['Infura', 'Alchemy', 'QuickNode', 'Ankr'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'What technology does Robinhood Chain use for data availability on Ethereum?', options: ['Calldata', 'Ethereum blobs', 'Sidechains', 'State channels'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'Why did Robinhood acquire the cryptocurrency exchange Bitstamp?', options: ['To launch a new wallet', 'To enable 24/7 trading', 'To offer credit cards', 'To build a Layer 3'], correctIndex: 1, difficulty: 'Medium' },
    ],
  },
  {
    id: 9, title: 'Partners & Explorer', emoji: '🤝',
    questions: [
      { question: 'Which company behind Arbitrum is collaborating with Robinhood?', options: ['Labs101', 'Offchain Labs', 'Matter Labs', 'Optimism Foundation'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'What exclusive test assets will developers gain access to in the coming months?', options: ['Rare NFTs', 'Stock Tokens', 'Algorithmic Stablecoins', 'Governance tokens'], correctIndex: 1, difficulty: 'Medium' },
      { question: "What is the URL for the Robinhood Chain Testnet Block Explorer?", options: ['etherscan.io', 'arbiscan.io', 'explorer.testnet.chain.robinhood.com', 'rhscan.com'], correctIndex: 2, difficulty: 'Medium' },
    ],
  },
  {
    id: 10, title: 'Roadmap & dApps', emoji: '🗺️',
    questions: [
      { question: "Activating the custom Robinhood Chain is which part of the roadmap?", options: ['Part One', 'Part Two', 'Part Three', 'Part Four'], correctIndex: 2, difficulty: 'Medium' },
      { question: "Where can you deploy a smart contract to claim a 'GM' badge?", options: ['GitHub', 'Onchaingm', 'Remix', 'Etherscan'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'How many U.S. stocks are currently available for tokenized trading in the EU?', options: ['Over 100', 'Over 500', 'Over 1,000', 'Over 2,000'], correctIndex: 3, difficulty: 'Medium' },
    ],
  },
  {
    id: 11, title: 'ERC Standards', emoji: '📋',
    questions: [
      { question: 'Which standard does the Bundler API manage for account abstraction workflows?', options: ['ERC-20', 'ERC-721', 'ERC-4337', 'ERC-1155'], correctIndex: 2, difficulty: 'Medium' },
      { question: "What was Robinhood's crypto revenue in Q4 of the previous year?", options: ['$100 million', '$221 million', '$500 million', '$1 billion'], correctIndex: 1, difficulty: 'Medium' },
      { question: 'Which specific entity offers the Robinhood Chain?', options: ['Robinhood Financial LLC (RHF)', 'Robinhood Digital Assets, LLC (RHDA)', 'Robinhood Crypto, LLC (RHC)', 'Robinhood Securities, LLC (RHS)'], correctIndex: 1, difficulty: 'Hard' },
    ],
  },
  {
    id: 12, title: 'Foundry & Verify', emoji: '💻',
    questions: [
      { question: "In Foundry, which command is used to initialize a new deployment project?", options: ['forge build', 'forge init', 'forge create', 'forge deploy'], correctIndex: 1, difficulty: 'Hard' },
      { question: "What is the '--verifier-url' for Blockscout verification on Robinhood Chain?", options: ['https://etherscan.io/api', 'https://explorer.testnet.chain.robinhood.com/api/', 'https://rpc.robinhood.com', 'https://blockscout.com/api'], correctIndex: 1, difficulty: 'Hard' },
      { question: 'Which Alchemy service allows developers to sponsor gas fees for users?', options: ['Node API', 'Bundler API', 'Gas Manager', 'Smart Wallet API'], correctIndex: 2, difficulty: 'Hard' },
    ],
  },
  {
    id: 13, title: 'Compliance', emoji: '⚖️',
    questions: [
      { question: 'Which entity is licensed by the NYSDFS for virtual currency business?', options: ['RHDA', 'RHC', 'RHF', 'RCT'], correctIndex: 1, difficulty: 'Hard' },
      { question: 'What is the FDIC insurance limit for funds in the Robinhood Cash Card account at Sutton Bank?', options: ['$100,000', '$250,000', '$500,000', 'No insurance'], correctIndex: 1, difficulty: 'Hard' },
      { question: 'What is the foreign exchange (FX) fee per transaction for tokenized stocks in the EU?', options: ['0%', '0.1%', '0.5%', '1%'], correctIndex: 1, difficulty: 'Hard' },
    ],
  },
  {
    id: 14, title: 'Tokenization', emoji: '🏦',
    questions: [
      { question: 'On which network are the current EU tokenized stocks issued?', options: ['Robinhood Chain Testnet', 'Arbitrum One', 'Ethereum Mainnet', 'Polygon'], correctIndex: 1, difficulty: 'Hard' },
      { question: 'Which bank issues the Robinhood Gold Card?', options: ['Sutton Bank', 'Coastal Community Bank', 'JPMorgan', 'Bitstamp'], correctIndex: 1, difficulty: 'Hard' },
      { question: "Which Foundry flag is used to verify a contract during the 'forge script' process?", options: ['--check', '--verify', '--validate', '--confirm'], correctIndex: 1, difficulty: 'Hard' },
    ],
  },
  {
    id: 15, title: 'Account Abstraction', emoji: '🔐',
    questions: [
      { question: "Which API manages 'UserOperations' for account abstraction?", options: ['Node API', 'Bundler API', 'Gas Manager', 'Alchemy API'], correctIndex: 1, difficulty: 'Hard' },
      { question: 'Which entity offers Portfolio Management (Robinhood Strategies)?', options: ['Robinhood Securities, LLC', 'Robinhood Asset Management, LLC (RAM)', 'Robinhood Financial LLC', 'Offchain Labs'], correctIndex: 1, difficulty: 'Hard' },
      { question: "What must the 'Currency Symbol' be set to when adding the network manually?", options: ['HOOD', 'ETH', 'ARB', 'RHC'], correctIndex: 1, difficulty: 'Hard' },
    ],
  },
  {
    id: 16, title: 'Deep Dive', emoji: '🧠',
    questions: [
      { question: 'Which group of funds invested $5.77 billion into Robinhood?', options: ['Sequoia Capital, a16z, Ribbit Capital', 'Blackrock & Circle', 'Offchain Labs & Alchemy', 'JPMorgan & Sutton Bank'], correctIndex: 0, difficulty: 'Hard' },
      { question: 'What specific type of Layer 2 is Robinhood Chain?', options: ['Optimistic Rollup', 'ZK-Rollup', 'Arbitrum Orbit', 'Validium'], correctIndex: 2, difficulty: 'Hard' },
      { question: 'Besides stocks, what other assets does Robinhood plan to tokenize in Part Three?', options: ['Bitcoin only', 'Art NFTs', 'Bonds and private stocks', 'Fiat currencies'], correctIndex: 2, difficulty: 'Hard' },
    ],
  },
]
