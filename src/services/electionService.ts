
// This service would connect to a backend API in a production application
// For demo purposes, we'll use local state and mock data

export interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  imageUrl: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  type: "single" | "multi-round";
  currentRound?: number;
  totalRounds?: number;
  candidates: Candidate[];
  results?: Record<string, number>;
  blockchainTxId?: string;
}

// Mock elections data
const MOCK_ELECTIONS: Election[] = [
  {
    id: "election-1",
    title: "Presidential Election 2024",
    description: "National presidential election for the term 2024-2028",
    startDate: "2024-05-01T00:00:00Z",
    endDate: "2024-05-02T23:59:59Z",
    status: "active",
    type: "single",
    candidates: [
      {
        id: "candidate-1",
        name: "Alex Johnson",
        party: "Progressive Party",
        description: "Former governor with 8 years of experience",
        imageUrl: "https://i.pravatar.cc/150?img=1"
      },
      {
        id: "candidate-2",
        name: "Samantha Wells",
        party: "Conservative Alliance",
        description: "Business leader and community advocate",
        imageUrl: "https://i.pravatar.cc/150?img=2"
      },
      {
        id: "candidate-3",
        name: "Miguel Rodriguez",
        party: "People's Coalition",
        description: "Civil rights attorney and social activist",
        imageUrl: "https://i.pravatar.cc/150?img=3"
      }
    ]
  },
  {
    id: "election-2",
    title: "City Council Elections",
    description: "Local city council elections for 5 open positions",
    startDate: "2024-06-15T00:00:00Z",
    endDate: "2024-06-15T23:59:59Z",
    status: "upcoming",
    type: "multi-round",
    currentRound: 1,
    totalRounds: 2,
    candidates: [
      {
        id: "candidate-4",
        name: "Linda Chen",
        party: "Neighborhood First",
        description: "Small business owner and community leader",
        imageUrl: "https://i.pravatar.cc/150?img=4"
      },
      {
        id: "candidate-5",
        name: "Jamal Williams",
        party: "Urban Development Coalition",
        description: "Urban planner with focus on sustainable growth",
        imageUrl: "https://i.pravatar.cc/150?img=5"
      }
    ]
  },
  {
    id: "election-3",
    title: "School Board Referendum",
    description: "Vote on the proposed school funding increase",
    startDate: "2024-03-10T00:00:00Z",
    endDate: "2024-03-15T23:59:59Z",
    status: "completed",
    type: "single",
    candidates: [
      {
        id: "option-1",
        name: "Approve Funding",
        party: "Yes",
        description: "Increase school funding by 5% through property tax adjustment",
        imageUrl: "https://via.placeholder.com/150?text=Yes"
      },
      {
        id: "option-2",
        name: "Reject Proposal",
        party: "No",
        description: "Maintain current funding levels",
        imageUrl: "https://via.placeholder.com/150?text=No"
      }
    ],
    results: {
      "option-1": 1245,
      "option-2": 978
    },
    blockchainTxId: "0xf7b8d9c2e4a1b3c5d6e7f8a9b0c1d2e3f4a5b6c7"
  }
];

export const getElections = async (): Promise<Election[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [...MOCK_ELECTIONS];
};

export const getElectionById = async (id: string): Promise<Election | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_ELECTIONS.find(election => election.id === id) || null;
};

export const castVote = async (
  electionId: string, 
  candidateId: string, 
  userId: string
): Promise<{ success: boolean; txId?: string }> => {
  // Simulate API call and blockchain transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, this would send the vote to a blockchain network
  const txId = "0x" + Math.random().toString(16).substring(2, 42);
  
  return {
    success: true,
    txId
  };
};

export const createElection = async (election: Omit<Election, 'id'>): Promise<Election> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const newElection: Election = {
    ...election,
    id: `election-${Date.now()}`,
  };
  
  // In a real app, this would add to a database
  return newElection;
};
