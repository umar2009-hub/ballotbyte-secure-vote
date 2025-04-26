
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getElections, Election } from "@/services/electionService";
import { connectWallet } from "@/services/blockchainService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Vote, Check, Clock, CheckCircle, AlertTriangle, LinkIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { toast } from "sonner";

const UserDashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await getElections();
        setElections(data);
      } catch (error) {
        console.error("Failed to fetch elections:", error);
        toast.error("Failed to load elections");
      } finally {
        setLoading(false);
      }
    };
    
    fetchElections();
  }, []);
  
  const handleConnectWallet = async () => {
    setWalletConnecting(true);
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
      setWalletConnected(true);
      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setWalletConnecting(false);
    }
  };
  
  const hasUserVoted = (electionId: string) => {
    return user?.hasVoted?.includes(electionId) || false;
  };
  
  const getElectionStatusBadge = (status: Election["status"]) => {
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
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP");
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ballot-primary">Voter Dashboard</h1>
          <p className="text-gray-600 mt-1">
            View and participate in active elections
          </p>
        </header>
        
        {/* Wallet Connection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Blockchain Wallet</CardTitle>
            <CardDescription>
              Connect your blockchain wallet to record your votes securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            {walletConnected ? (
              <div className="flex items-center bg-green-50 border border-green-200 rounded px-4 py-3">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="font-medium text-green-700">Wallet Connected</p>
                  <p className="text-sm text-green-600 truncate">
                    {walletAddress}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Connect your wallet to enable blockchain voting</p>
                </div>
                <Button 
                  onClick={handleConnectWallet} 
                  disabled={walletConnecting}
                  className="bg-ballot-primary hover:bg-ballot-primary/90"
                >
                  {walletConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Elections */}
        <h2 className="text-xl font-bold text-ballot-primary mb-4">Available Elections</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-ballot-primary animate-spin" />
            <span className="ml-2 text-lg text-ballot-primary">Loading elections...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <Card key={election.id} className="overflow-hidden border border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{election.title}</CardTitle>
                    {getElectionStatusBadge(election.status)}
                  </div>
                  <CardDescription>{election.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {formatDate(election.startDate)} - {formatDate(election.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Vote className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{election.candidates.length} Candidates</span>
                    </div>
                    
                    {election.type === "multi-round" && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Round {election.currentRound} of {election.totalRounds}</span>
                      </div>
                    )}
                    
                    {hasUserVoted(election.id) && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        <span>You have voted in this election</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t border-gray-200">
                  {election.status === "active" ? (
                    hasUserVoted(election.id) ? (
                      <Button variant="outline" asChild className="w-full">
                        <Link to={`/election/${election.id}`}>View Details</Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full bg-ballot-primary hover:bg-ballot-primary/90">
                        <Link to={`/election/${election.id}`}>
                          <Vote className="h-4 w-4 mr-2" />
                          Cast Vote
                        </Link>
                      </Button>
                    )
                  ) : election.status === "upcoming" ? (
                    <Button variant="outline" disabled className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Not Yet Started
                    </Button>
                  ) : (
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/election/${election.id}`}>View Results</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
            
            {elections.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-ballot-secondary opacity-70 mb-4" />
                <h3 className="text-lg font-medium">No elections available</h3>
                <p className="text-gray-500 mt-2">
                  There are currently no elections available for voting.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
