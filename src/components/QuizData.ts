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

export const QUIZZES: QuizData[] = [
  {
    id:1, title:"Welcome to Arc", emoji:"🌐",
    questions:[
      { question:"Arc is designed to be the ___ for the internet.", options:["Social OS","Gaming OS","Economic OS","Privacy OS"], correctIndex:2 },
      { question:"Who built Arc?", options:["Ethereum Foundation","Circle","Binance","Coinbase"], correctIndex:1 },
      { question:"Arc's validator participation is:", options:["Open to anyone","Permissioned for security & compliance","Proof of Work","Anonymous"], correctIndex:1 },
    ]
  },
  {
    id:2, title:"Arc Gas & Fees", emoji:"⛽",
    questions:[
      { question:"What token is used as gas on Arc?", options:["ETH","ARC","USDC","MATIC"], correctIndex:2 },
      { question:"Arc's target fee per transaction is approximately:", options:["$1.00","$0.10","$0.001","$0.01"], correctIndex:3 },
      { question:"Arc's guiding principle for fees is:", options:["0 fees always","1 cent, 1 second, 1 click","Free for validators","Gas auctions"], correctIndex:1 },
    ]
  },
  {
    id:3, title:"Deterministic Finality", emoji:"⚡",
    questions:[
      { question:"How fast is Arc's transaction finality?", options:["10 minutes","1 minute","Sub-second","10 seconds"], correctIndex:2 },
      { question:"Once a block is finalized on Arc, it:", options:["Can be reversed with enough validators","May be reorganized","Is instantly and irreversibly final","Needs 6 confirmations"], correctIndex:2 },
      { question:"Arc's consensus engine is called:", options:["Tendermint Classic","Ethereum BFT","Malachite","PoW Engine"], correctIndex:2 },
    ]
  },
  {
    id:4, title:"Consensus Layer", emoji:"🔗",
    questions:[
      { question:"Arc uses which consensus model?", options:["Proof of Work","Delegated PoS","Proof-of-Authority BFT","Nakamoto Consensus"], correctIndex:2 },
      { question:"Arc's consensus throughput benchmark is:", options:["100 TPS","500 TPS","3000+ TPS","50 TPS"], correctIndex:2 },
      { question:"Block reorganizations on Arc are:", options:["Common","Possible rarely","Impossible","Expected weekly"], correctIndex:2 },
    ]
  },
  {
    id:5, title:"EVM Compatibility", emoji:"🔧",
    questions:[
      { question:"Can you deploy Solidity contracts on Arc without changes?", options:["No, need rewrite","Yes, EVM-compatible","Only Vyper works","Need Arc SDK"], correctIndex:1 },
      { question:"Native USDC on Arc uses how many decimals?", options:["6","8","18","2"], correctIndex:2 },
      { question:"The ERC20 interface for USDC on Arc uses how many decimals?", options:["18","8","2","6"], correctIndex:3 },
    ]
  },
  {
    id:6, title:"Arc Architecture", emoji:"🏗️",
    questions:[
      { question:"Arc combines which two layers?", options:["Plasma + Rollup","Malachite consensus + Reth execution","Lightning + PoW","zkEVM + PoS"], correctIndex:1 },
      { question:"The Fee Manager on Arc stabilizes fees using:", options:["ETH","ARC token","USDC","BTC"], correctIndex:2 },
      { question:"Arc's Privacy Module provides confidential transfers via:", options:["Zero-knowledge proofs only","View keys","Mixer contracts","Tornado Cash"], correctIndex:1 },
    ]
  },
  {
    id:7, title:"Opt-in Privacy", emoji:"🔒",
    questions:[
      { question:"Privacy features on Arc are:", options:["Always on","Opt-in","Mandatory for DeFi","Not planned"], correctIndex:1 },
      { question:"Arc view keys allow:", options:["Anyone to see everything","Only Circle to audit","Controlled read access for auditors","Anonymous transactions"], correctIndex:2 },
      { question:"Arc's privacy architecture starts with:", options:["ZK-SNARKs","MPC only","Trusted Execution Environments (TEEs)","Ring signatures"], correctIndex:2 },
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
      { question:"Which of these is NOT listed as a use case on Arc?", options:["Prediction markets","Cross-border payments","NFT gaming collectibles","Tokenized securities"], correctIndex:2 },
      { question:"Arc enables 'agentic commerce', meaning:", options:["Human-only transactions","AI agents transact natively onchain","Offline payments","Anonymous dark pools"], correctIndex:1 },
      { question:"Arc integrates directly with:", options:["MetaMask only","Binance Smart Chain","Circle's full-stack platform","Solana ecosystem"], correctIndex:2 },
    ]
  },
  {
    id:10, title:"Arc Core Principles", emoji:"🎯",
    questions:[
      { question:"Arc is described as 'market-neutral', meaning:", options:["Only supports one token","Interoperable via Circle CCTP across chains","No fees ever","Closed to outside developers"], correctIndex:1 },
      { question:"Arc's philosophy is 'Built to coordinate, not ___':", options:["Build","Earn","Control","Scale"], correctIndex:2 },
      { question:"Arc is a ___ network open to all developers:", options:["Private","Invite-only","Public","Circle-only"], correctIndex:2 },
    ]
  },
]
