
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getElectionById, castVote, Election, Candidate } from "@/services/electionService";
import { recordVoteOnBlockchain, verifyVote } from "@/services/blockchainService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Loader2, Calendar, Users, Clock, Check, ChevronLeft, ThumbsUp, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const ElectionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  
  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      
      try {
        const data = await getElectionById(id);
        setElection(data);
      } catch (error) {
        console.error("Failed to fetch election details:", error);
        toast.error("Failed to load election details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchElection();
  }, [id]);
  
  const hasUserVoted = () => {
    return user?.hasVoted?.includes(id || "") || false;
  };
  
  const handleVote = async () => {
    if (!selectedCandidate || !user || !election) return;
    
    setVoting(true);
    try {
      // Cast vote on the backend
      const { success, txId } = await castVote(election.id, selectedCandidate, user.id);
      
      if (success && txId) {
        // Record vote on blockchain
        const tx = await recordVoteOnBlockchain(election.id, selectedCandidate, user.id);
        setTransactionId(tx.txId);
        
        // Update user's voted elections
        user.hasVoted = [...(user.hasVoted || []), election.id];
        localStorage.setItem("ballotbyte_user", JSON.stringify(user));
        
        toast.success("Your vote has been recorded successfully!");
      }
    } catch (error) {
      console.error("Voting failed:", error);
      toast.error("Failed to record your vote. Please try again.");
    } finally {
      setVoting(false);
    }
  };
  
  const handleVerify = async () => {
    if (!transactionId) return;
    
    setVerifying(true);
    try {
      const tx = await verifyVote(transactionId);
      if (tx) {
        setVerified(true);
        toast.success("Vote verification successful!");
      } else {
        toast.error("Could not verify vote on the blockchain");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Vote verification failed");
    } finally {
      setVerifying(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-ballot-primary animate-spin" />
          <span className="ml-2 text-lg">Loading election details...</span>
        </div>
      </div>
    );
  }
  
  if (!election) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-ballot-secondary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Election Not Found</h2>
          <p className="text-gray-600 mb-6">The election you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };
  
  const isVotingEnabled = 
    election.status === "active" && 
    !hasUserVoted() &&
    !transactionId;

  const getStatusBadge = (status: Election["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="border-blue-400 text-blue-500">Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return null;
    }
  };
  
  const calculatePercentage = (candidateId: string) => {
    if (!election.results) return 0;
    
    const totalVotes = Object.values(election.results).reduce((sum, count) => sum + count, 0);
    const candidateVotes = election.results[candidateId] || 0;
    
    return totalVotes > 0 ? Math.round((candidateVotes / totalVotes) * 100) : 0;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-ballot-primary">{election.title}</h1>
            {getStatusBadge(election.status)}
          </div>
          <p className="text-gray-600 mt-1">
            {election.description}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              {formatDate(election.startDate)} - {formatDate(election.endDate)}
            </div>
            
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-gray-500" />
              {election.candidates.length} Candidates
            </div>
            
            {election.type === "multi-round" && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                Round {election.currentRound} of {election.totalRounds}
              </div>
            )}
          </div>
        </header>
        
        {/* Success message after voting */}
        {transactionId && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-lg text-green-800 flex items-center">
                    <Check className="h-5 w-5 mr-2 bg-green-500 text-white rounded-full p-1" />
                    Vote Recorded Successfully
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your vote has been securely recorded on the blockchain
                  </p>
                  <p className="text-xs text-green-600 mt-2 font-mono">
                    Transaction ID: {transactionId}
                  </p>
                </div>
                
                {!verified && (
                  <Button 
                    onClick={handleVerify} 
                    disabled={verifying}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Verify Vote
                      </>
                    )}
                  </Button>
                )}
                
                {verified && (
                  <div className="flex items-center text-green-700">
                    <Check className="h-5 w-5 mr-2" />
                    Vote Verified
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Candidates */}
        <div className="grid grid-cols-1 gap-6">
          {election.candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              election={election}
              isSelected={selectedCandidate === candidate.id}
              onSelect={() => isVotingEnabled && setSelectedCandidate(candidate.id)}
              isVotingEnabled={isVotingEnabled}
              percentage={calculatePercentage(candidate.id)}
              isCompleted={election.status === "completed"}
            />
          ))}
        </div>
        
        {/* Vote Button */}
        {isVotingEnabled && (
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleVote}
              disabled={!selectedCandidate || voting}
              className="bg-ballot-accent hover:bg-ballot-accent/90 text-white font-bold px-8"
            >
              {voting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Recording Vote...
                </>
              ) : (
                "Confirm Vote"
              )}
            </Button>
          </div>
        )}
        
        {/* Blockchain Info */}
        {election.blockchainTxId && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">Blockchain Record</h3>
            <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600">
                This election's results are recorded on the blockchain with transaction ID:
              </p>
              <p className="font-mono text-xs mt-1 break-all">
                {election.blockchainTxId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CandidateCardProps {
  candidate: Candidate;
  election: Election;
  isSelected: boolean;
  onSelect: () => void;
  isVotingEnabled: boolean;
  percentage: number;
  isCompleted: boolean;
}

const CandidateCard = ({
  candidate,
  election,
  isSelected,
  onSelect,
  isVotingEnabled,
  percentage,
  isCompleted
}: CandidateCardProps) => {
  const cardClasses = `border ${isSelected ? 'border-ballot-primary border-2' : 'border-gray-200'} ${isVotingEnabled ? 'cursor-pointer hover:border-ballot-primary' : ''} rounded-lg overflow-hidden transition-all`;

  const handleClick = () => {
    if (isVotingEnabled) {
      onSelect();
    }
  };

  return (
    <Card className={cardClasses} onClick={handleClick}>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 p-6 flex flex-col items-center justify-center bg-gray-50 border-r border-gray-200">
          <Avatar className="h-24 w-24 mb-3">
            <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
            <AvatarFallback className="bg-ballot-primary text-white text-2xl">
              {candidate.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-lg text-center">{candidate.name}</h3>
          <p className="text-sm text-gray-600 text-center">{candidate.party}</p>
          
          {isVotingEnabled && isSelected && (
            <Badge className="mt-2 bg-ballot-primary">Selected</Badge>
          )}
          
          {isCompleted && (
            <div className="mt-3 w-full">
              <div className="flex justify-between text-sm mb-1">
                <span>{percentage}%</span>
                {election.results && (
                  <span>{election.results[candidate.id] || 0} votes</span>
                )}
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )}
        </div>
        
        <div className="md:w-3/4 p-6">
          <p className="text-gray-700">{candidate.description}</p>
          
          {isVotingEnabled && (
            <div className="mt-4">
              <Button
                variant={isSelected ? "default" : "outline"}
                className={isSelected ? "bg-ballot-primary" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                {isSelected ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Selected
                  </>
                ) : (
                  "Select Candidate"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ElectionDetails;
