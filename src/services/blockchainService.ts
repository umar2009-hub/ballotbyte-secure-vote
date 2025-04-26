
// This service simulates blockchain interactions
// In a real app, this would connect to Ethereum/MetaMask

export interface BlockchainTransaction {
  txId: string;
  timestamp: number;
  electionId: string;
  candidateId: string;
  hash: string;
  voterHash: string; // anonymized voter ID
}

// Simulate a local blockchain ledger
let transactions: BlockchainTransaction[] = [];

export const connectWallet = async (): Promise<{ address: string }> => {
  // Simulate wallet connection
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Generate a mock Ethereum address
  const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
  
  return { address: mockAddress };
};

export const recordVoteOnBlockchain = async (
  electionId: string,
  candidateId: string,
  voterId: string
): Promise<BlockchainTransaction> => {
  // Simulate blockchain transaction
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Create anonymized voter hash
  const voterHash = await sha256(voterId + Date.now().toString());
  
  // Create transaction hash
  const dataToHash = `${electionId}-${candidateId}-${voterHash}-${Date.now()}`;
  const hash = await sha256(dataToHash);
  
  const transaction: BlockchainTransaction = {
    txId: "0x" + Math.random().toString(16).substring(2, 42),
    timestamp: Date.now(),
    electionId,
    candidateId,
    hash,
    voterHash
  };
  
  // In a real app, this would be submitted to a blockchain network
  transactions.push(transaction);
  
  return transaction;
};

export const verifyVote = async (txId: string): Promise<BlockchainTransaction | null> => {
  // Simulate blockchain query
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return transactions.find(tx => tx.txId === txId) || null;
};

// Helper function to create SHA-256 hash
async function sha256(message: string): Promise<string> {
  // In a browser environment, we'd use the Web Crypto API
  // This is a simple simulation
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
