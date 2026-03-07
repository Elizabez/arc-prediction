export const PREDICTION_MARKET_ABI = [
  // Events
  { type: "event", name: "RoundStarted", inputs: [{ name: "roundId", type: "uint256", indexed: true }, { name: "asset", type: "string" }, { name: "lockTime", type: "uint256" }, { name: "resolveTime", type: "uint256" }] },
  { type: "event", name: "RoundLocked", inputs: [{ name: "roundId", type: "uint256", indexed: true }, { name: "lockPrice", type: "int256" }] },
  { type: "event", name: "RoundResolved", inputs: [{ name: "roundId", type: "uint256", indexed: true }, { name: "closePrice", type: "int256" }, { name: "winner", type: "uint8" }] },
  { type: "event", name: "BetPlaced", inputs: [{ name: "roundId", type: "uint256", indexed: true }, { name: "user", type: "address", indexed: true }, { name: "position", type: "uint8" }, { name: "amount", type: "uint256" }] },
  { type: "event", name: "Claimed", inputs: [{ name: "roundId", type: "uint256", indexed: true }, { name: "user", type: "address", indexed: true }, { name: "amount", type: "uint256" }] },

  // Read
  { type: "function", name: "nextRoundId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "minBet", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "treasuryFee", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "roundDuration", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function", name: "getRound", stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [{
      type: "tuple",
      components: [
        { name: "roundId", type: "uint256" },
        { name: "asset", type: "string" },
        { name: "startTime", type: "uint256" },
        { name: "lockTime", type: "uint256" },
        { name: "resolveTime", type: "uint256" },
        { name: "lockPrice", type: "int256" },
        { name: "closePrice", type: "int256" },
        { name: "totalUp", type: "uint256" },
        { name: "totalDown", type: "uint256" },
        { name: "status", type: "uint8" },
        { name: "priceFeed", type: "address" }
      ]
    }]
  },
  {
    type: "function", name: "getBet", stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }, { name: "user", type: "address" }],
    outputs: [{
      type: "tuple",
      components: [
        { name: "position", type: "uint8" },
        { name: "amount", type: "uint256" },
        { name: "claimed", type: "bool" }
      ]
    }]
  },
  {
    type: "function", name: "calculatePayout", stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }, { name: "user", type: "address" }],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function", name: "currentPrice", stateMutability: "view",
    inputs: [{ name: "asset", type: "string" }],
    outputs: [{ type: "int256" }]
  },

  // Write
  {
    type: "function", name: "startRound", stateMutability: "nonpayable",
    inputs: [{ name: "asset", type: "string" }],
    outputs: [{ name: "roundId", type: "uint256" }]
  },
  {
    type: "function", name: "lockRound", stateMutability: "nonpayable",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function", name: "resolveRound", stateMutability: "nonpayable",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function", name: "bet", stateMutability: "nonpayable",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "position", type: "uint8" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function", name: "claim", stateMutability: "nonpayable",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: []
  }
] as const

export const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const
