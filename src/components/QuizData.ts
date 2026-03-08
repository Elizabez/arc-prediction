export const ARC_QUIZ_ABI = [
  { type:'function',name:'submitQuiz',stateMutability:'nonpayable',inputs:[{name:'quizId',type:'uint256'},{name:'ans0',type:'uint8'},{name:'ans1',type:'uint8'},{name:'ans2',type:'uint8'}],outputs:[] },
  { type:'function',name:'hasBadge',stateMutability:'view',inputs:[{name:'user',type:'address'},{name:'quizId',type:'uint256'}],outputs:[{type:'bool'}] },
  { type:'function',name:'getUserProgress',stateMutability:'view',inputs:[{name:'user',type:'address'}],outputs:[{type:'bool[10]'}] },
  { type:'function',name:'getUserBadges',stateMutability:'view',inputs:[{name:'user',type:'address'}],outputs:[{type:'uint256[]'}] },
  { type:'function',name:'totalMinted',stateMutability:'view',inputs:[],outputs:[{type:'uint256'}] },
  { type:'function',name:'balanceOf',stateMutability:'view',inputs:[{name:'user',type:'address'}],outputs:[{type:'uint256'}] },
  { type:'event',name:'BadgeMinted',inputs:[{name:'user',type:'address',indexed:true},{name:'quizId',type:'uint256',indexed:true},{name:'tokenId',type:'uint256',indexed:false}] },
] as const

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

// correctIndex MUST match contract _loadQuizzes answer indices exactly!
export const QUIZZES: QuizData[] = [
  {
    id:1, title:"Welcome to Arc", emoji:"🌐",
    questions:[
      { question:"Arc is designed to be the ___ for the internet.", options:["Social OS","Economic OS","Gaming OS","Privacy OS"], correctIndex:1 },
      { question:"Who built Arc?", options:["Circle","Ethereum Foundation","Binance","Coinbase"], correctIndex:0 },
      { question:"Arc's validator participation is:", options:["Open to anyone","Proof of Work","Anonymous","Permissioned for security & compliance"], correctIndex:3 },
    ]
  },
  {
    id:2, title:"Arc Gas & Fees", emoji:"⛽",
    questions:[
      { question:"What token is used as gas on Arc?", options:["ETH","ARC","USDC","MATIC"], correctIndex:2 },
      { question:"Arc's guiding fee principle is:", options:["0 fees always","1 cent, 1 second, 1 click","Free for validators","Gas auctions"], correctIndex:1 },
      { question:"Arc fee target per transaction is approximately:", options:["$0.001 (stable USDC)","$1.00","$0.10","Free"], correctIndex:0 },
    ]
  },
  {
    id:3, title:"Deterministic Finality", emoji:"⚡",
    questions:[
      { question:"How fast is Arc's transaction finality?", options:["10 minutes","Sub-second","1 minute","10 seconds"], correctIndex:1 },
      { question:"Once a block is finalized on Arc it is:", options:["Can be reversed","May reorganize","Instantly and irreversibly final","Needs 6 confirmations"], correctIndex:2 },
      { question:"Arc's consensus engine is called:", options:["Malachite","Tendermint","Ethereum BFT","PoW Engine"], correctIndex:0 },
    ]
  },
  {
    id:4, title:"Consensus Layer", emoji:"🔗",
    questions:[
      { question:"Arc uses which consensus model?", options:["Proof-of-Authority BFT","Proof of Work","Delegated PoS","Nakamoto"], correctIndex:0 },
      { question:"Block reorganizations on Arc are:", options:["Common","Possible rarely","Impossible","Expected weekly"], correctIndex:2 },
      { question:"Arc's consensus throughput benchmark is:", options:["100 TPS","3000+ TPS","500 TPS","50 TPS"], correctIndex:1 },
    ]
  },
  {
    id:5, title:"EVM Compatibility", emoji:"🔧",
    questions:[
      { question:"Can you deploy Solidity contracts on Arc without changes?", options:["No need rewrite","Yes EVM-compatible","Only Vyper works","Need Arc SDK"], correctIndex:1 },
      { question:"Arc supports which standard EVM tools?", options:["wagmi and viem work natively","Only ethers.js","No tools work","Arc SDK only"], correctIndex:0 },
      { question:"Native USDC on Arc uses how many decimals?", options:["6","8","18","2"], correctIndex:2 },
    ]
  },
  {
    id:6, title:"Arc Architecture", emoji:"🏗️",
    questions:[
      { question:"Arc combines which two layers?", options:["Plasma + Rollup","Malachite consensus + Reth execution","Lightning + PoW","zkEVM + PoS"], correctIndex:1 },
      { question:"Arc's Fee Manager stabilizes fees using:", options:["ETH","ARC token","USDC","BTC"], correctIndex:2 },
      { question:"Arc's Privacy Module uses:", options:["Mixer contracts","View keys for controlled access","ZK proofs only","Tornado Cash"], correctIndex:1 },
    ]
  },
  {
    id:7, title:"Opt-in Privacy", emoji:"🔒",
    questions:[
      { question:"Privacy features on Arc are:", options:["Always on","Opt-in","Mandatory for DeFi","Not planned"], correctIndex:1 },
      { question:"Arc view keys allow:", options:["Anyone to see everything","Only Circle to audit","Controlled read access for auditors","Anonymous transactions"], correctIndex:2 },
      { question:"Arc privacy architecture starts with:", options:["Trusted Execution Environments (TEEs)","ZK-SNARKs","MPC only","Ring signatures"], correctIndex:0 },
    ]
  },
  {
    id:8, title:"Arc Testnet", emoji:"🧪",
    questions:[
      { question:"Arc Testnet Chain ID is:", options:["1","137","5042002","570"], correctIndex:2 },
      { question:"Where do you get testnet USDC?", options:["arc.faucet.io","faucet.circle.com","testnet.arc.faucet","uniswap.org"], correctIndex:1 },
      { question:"Arc Testnet block explorer is at:", options:["etherscan.io","testnet.arcscan.app","arcscan.io","explorer.arc.com"], correctIndex:1 },
    ]
  },
  {
    id:9, title:"What You Can Build", emoji:"🚀",
    questions:[
      { question:"Arc enables 'agentic commerce', meaning:", options:["Human-only transactions","AI agents transact natively onchain","Offline payments","Anonymous dark pools"], correctIndex:1 },
      { question:"Which of these is listed as an Arc use case?", options:["Social media only","Remittance platforms","Gaming NFTs only","Mining pools"], correctIndex:3 },
      { question:"Arc integrates directly with:", options:["MetaMask only","Binance Smart Chain","Circle's full-stack platform","Solana ecosystem"], correctIndex:2 },
    ]
  },
  {
    id:10, title:"Arc Core Principles", emoji:"🎯",
    questions:[
      { question:"Arc is 'market-neutral', meaning:", options:["Only supports one token","Interoperable via Circle CCTP","No fees ever","Closed to outside developers"], correctIndex:1 },
      { question:"Arc's philosophy is 'Built to coordinate, not ___':", options:["Build","Earn","Control","Scale"], correctIndex:2 },
      { question:"Arc is a ___ network open to all developers:", options:["Private","Invite-only","Public","Circle-only"], correctIndex:2 },
    ]
  },
]
