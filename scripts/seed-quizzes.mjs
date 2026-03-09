/**
 * Seed addQuiz() for Arc and Tempo contracts
 * Usage: node scripts/seed-quizzes.mjs
 */
import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// ── Chains ────────────────────────────────────────────────────────────────────
const arcChain = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
}
const tempoChain = {
  id: 42431,
  name: 'Tempo Testnet',
  nativeCurrency: { name: 'aUSD', symbol: 'aUSD', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.moderato.tempo.xyz'] } },
}

// ── Private key (deployer = contract owner) ───────────────────────────────────
const PRIVATE_KEY = '0x179b6ef9230c26a1f93b999dec9d6e75ab8337b42747b2c938b0e54b20521cdb'
const account = privateKeyToAccount(PRIVATE_KEY)
console.log('Deployer:', account.address)

// ── ABI ───────────────────────────────────────────────────────────────────────
const ABI = parseAbi([
  'function addQuiz(uint256 quizId, uint8[] calldata answerIndexes) external',
  'function totalQuizzes() external view returns (uint256)',
  'function owner() external view returns (address)',
])

// ── Quiz data — correctIndex from ArcQuizData.ts ──────────────────────────────
const ARC_QUIZZES = [
  { id: 1,  answers: [1, 2, 0] }, // Arc Basics
  { id: 2,  answers: [2, 0, 1] }, // Arc Network
  { id: 3,  answers: [2, 1, 0] }, // Arc Consensus & Interop
  { id: 4,  answers: [1, 1, 1] }, // Arc Privacy & Community
  { id: 5,  answers: [1, 1, 1] }, // Arc Partners & Vision
  { id: 6,  answers: [1, 1, 1] }, // Arc Commerce & Validators
  { id: 7,  answers: [1, 1, 0] }, // Arc Principles
  { id: 8,  answers: [0, 1, 1] }, // Arc Capital Markets
  { id: 9,  answers: [0, 1, 1] }, // Arc Hub & Settlement
  { id: 10, answers: [0, 1, 1] }, // Arc Future
  { id: 11, answers: [1, 2, 1] }, // Arc Legal & Compliance
  { id: 12, answers: [1, 0, 1] }, // Arc Consensus Deep Dive
  { id: 13, answers: [1, 1, 1] }, // Arc Coordination
  { id: 14, answers: [1, 1, 1] }, // Arc Institutional Use
  { id: 15, answers: [1, 1, 1] }, // Arc Credit & Trust
  { id: 16, answers: [1, 1, 0] }, // Arc Advanced
]

// ── Quiz data — correctIndex from TempoQuizData.ts ────────────────────────────
const TEMPO_QUIZZES = [
  { id: 1,  answers: [0, 1, 1] }, // Intro to Tempo
  { id: 2,  answers: [2, 2, 1] }, // Tempo Basics
  { id: 3,  answers: [1, 0, 1] }, // Tempo History
  { id: 4,  answers: [2, 0, 1] }, // Tempo Use Cases I
  { id: 5,  answers: [2, 1, 1] }, // Tempo Use Cases II
  { id: 6,  answers: [1, 2, 1] }, // Tempo Standards & Partners
  { id: 7,  answers: [1, 2, 1] }, // Tempo Network
  { id: 8,  answers: [1, 1, 0] }, // Tempo Ecosystem
  { id: 9,  answers: [1, 1, 1] }, // Tempo Developer Docs
  { id: 10, answers: [1, 3, 1] }, // Tempo Blog & Dates
  { id: 11, answers: [1, 1, 1] }, // Tempo Migration
  { id: 12, answers: [0, 2, 1] }, // Tempo Timeline I
  { id: 13, answers: [2, 0, 1] }, // Tempo Timeline II
  { id: 14, answers: [2, 2, 0] }, // Tempo Content
  { id: 15, answers: [0, 1, 1] }, // Tempo Testnet Details
  { id: 16, answers: [1, 0, 0] }, // Tempo Deep Dive
]

// ── Seed function ─────────────────────────────────────────────────────────────
async function seedContract(chain, contractAddr, quizzes, label) {
  console.log(`\n═══ ${label} ═══`)
  console.log(`Contract: ${contractAddr}`)

  const pub = createPublicClient({ chain, transport: http() })
  const wallet = createWalletClient({ account, chain, transport: http() })

  // Check current state
  const total = await pub.readContract({ address: contractAddr, abi: ABI, functionName: 'totalQuizzes' })
  console.log(`totalQuizzes before: ${total}`)
  if (total >= quizzes.length) {
    console.log('✅ Already seeded — skipping')
    return
  }

  for (const quiz of quizzes) {
    if (quiz.id <= total) {
      console.log(`  Quiz #${quiz.id} — already exists, skip`)
      continue
    }
    try {
      const hash = await wallet.writeContract({
        address: contractAddr, abi: ABI,
        functionName: 'addQuiz',
        args: [BigInt(quiz.id), quiz.answers],
      })
      console.log(`  ✅ Quiz #${quiz.id} tx: ${hash}`)
      // Wait a bit between txs
      await new Promise(r => setTimeout(r, 1500))
    } catch (e) {
      console.error(`  ❌ Quiz #${quiz.id} failed:`, e.shortMessage ?? e.message)
    }
  }

  const totalAfter = await pub.readContract({ address: contractAddr, abi: ABI, functionName: 'totalQuizzes' })
  console.log(`totalQuizzes after: ${totalAfter}`)
}

// ── Run ───────────────────────────────────────────────────────────────────────
// Seed ALL known Arc contracts (local + production)
const ARC_CONTRACTS = [
  '0x15a9C1Ff1F9ECBC7CF93b2F22bF620B811932466', // Vercel production
  '0x51Da50901c084cc8Deee6bA4Ea13CfB66A978654', // local .env
  '0x53dB10bf276bE8F3806cB780525B6B20d7230Ff2', // broadcast latest
]
const TEMPO_CONTRACTS = [
  '0xf5a3c71d1a4afd8b04c647e6da8b31b3fb650d03', // newly deployed on Moderato
]

;(async () => {
  for (const addr of ARC_CONTRACTS) {
    await seedContract(arcChain, addr, ARC_QUIZZES, `Arc ${addr.slice(0,10)}`)
  }
  for (const addr of TEMPO_CONTRACTS) {
    await seedContract(tempoChain, addr, TEMPO_QUIZZES, `Tempo ${addr.slice(0,10)}`)
  }
  console.log('\n🎉 Done!')
})()
