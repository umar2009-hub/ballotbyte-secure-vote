
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getElections, createElection, Election } from "@/services/electionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Calendar, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "single" as const
  });
  const [creatingElection, setCreatingElection] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
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
  
  const handleCreateElection = async () => {
    if (!newElection.title || !newElection.description || !newElection.startDate || !newElection.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setCreatingElection(true);
    try {
      const createdElection = await createElection({
        title: newElection.title,
        description: newElection.description,
        startDate: newElection.startDate,
        endDate: newElection.endDate,
        status: "upcoming",
        type: newElection.type,
        candidates: [],
        currentRound: newElection.type === "multi-round" ? 1 : undefined,
        totalRounds: newElection.type === "multi-round" ? 2 : undefined,
      });
      
      setElections([...elections, createdElection]);
      setDialogOpen(false);
      resetNewElection();
      toast.success("Election created successfully");
    } catch (error) {
      console.error("Failed to create election:", error);
      toast.error("Failed to create election");
    } finally {
      setCreatingElection(false);
    }
  };
  
  const resetNewElection = () => {
    setNewElection({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      type: "single"
    });
  };
  
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
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculate stats
  const activeCount = elections.filter(e => e.status === "active").length;
  const upcomingCount = elections.filter(e => e.status === "upcoming").length;
  const completedCount = elections.filter(e => e.status === "completed").length;

  // Calculate total votes (for completed elections)
  const calculateTotalVotes = () => {
    return elections
      .filter(e => e.status === "completed" && e.results)
      .reduce((total, election) => {
        if (election.results) {
          const electionVotes = Object.values(election.results).reduce((sum, count) => sum + count, 0);
          return total + electionVotes;
        }
        return total;
      }, 0);
  };
  
  const totalVotes = calculateTotalVotes();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ballot-primary">Election Control Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor all election activities
              </p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0 bg-ballot-primary hover:bg-ballot-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Election
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create New Election</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new election. You can add candidates after creation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Election Title</Label>
                    <Input
                      id="title"
                      value={newElection.title}
                      onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                      placeholder="Presidential Election 2024"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newElection.description}
                      onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                      placeholder="Description of the election and its purpose"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={newElection.startDate}
                        onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={newElection.endDate}
                        onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Election Type</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="single"
                          value="single"
                          checked={newElection.type === "single"}
                          onChange={() => setNewElection({ ...newElection, type: "single" })}
                          className="mr-2"
                        />
                        <Label htmlFor="single">Single Round</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="multi"
                          value="multi"
                          checked={newElection.type === "multi-round"}
                          onChange={() => setNewElection({ ...newElection, type: "multi-round" })}
                          className="mr-2"
                        />
                        <Label htmlFor="multi">Multi-Round</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={creatingElection}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateElection}
                    disabled={creatingElection}
                  >
                    {creatingElection ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Election"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Elections"
            value={activeCount.toString()}
            icon={<Calendar className="h-8 w-8 text-green-500" />}
            color="bg-green-50 border-green-200"
          />
          
          <StatCard 
            title="Upcoming Elections"
            value={upcomingCount.toString()}
            icon={<Calendar className="h-8 w-8 text-blue-500" />}
            color="bg-blue-50 border-blue-200"
          />
          
          <StatCard 
            title="Completed Elections"
            value={completedCount.toString()}
            icon={<CheckCircle2 className="h-8 w-8 text-gray-500" />}
            color="bg-gray-50 border-gray-200"
          />
          
          <StatCard 
            title="Total Votes Cast"
            value={totalVotes.toString()}
            icon={<Users className="h-8 w-8 text-ballot-primary" />}
            color="bg-ballot-light border-ballot-primary/20"
          />
        </div>
        
        {/* Election Management Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          {["all", "active", "upcoming", "completed"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              <ElectionsList 
                elections={
                  tabValue === "all" 
                    ? elections 
                    : elections.filter(e => e.status === tabValue)
                } 
                loading={loading} 
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <Card className={color}>
    <CardContent className="p-6 flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div>
        {icon}
      </div>
    </CardContent>
  </Card>
);

interface ElectionsListProps {
  elections: Election[];
  loading: boolean;
}

const ElectionsList = ({ elections, loading }: ElectionsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-ballot-primary animate-spin" />
        <span className="ml-2 text-lg text-ballot-primary">Loading elections...</span>
      </div>
    );
  }
  
  if (elections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-ballot-secondary opacity-70 mb-4" />
        <h3 className="text-lg font-medium">No elections found</h3>
        <p className="text-gray-500 mt-2">
          There are no elections in this category.
        </p>
      </div>
    );
  }
  
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
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-4">
      {elections.map((election) => (
        <Card key={election.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-2/3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-medium">{election.title}</h3>
                  <p className="text-gray-600 mt-1">{election.description}</p>
                </div>
                {getStatusBadge(election.status)}
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  {formatDate(election.startDate)} - {formatDate(election.endDate)}
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-500" />
                  {election.candidates.length} Candidates
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 border-t md:border-t-0 md:border-l border-gray-200 md:w-1/3 flex flex-row md:flex-col justify-between items-center md:items-start">
              <div className="text-sm">
                {election.status === "completed" && election.results && (
                  <div>
                    <p className="font-medium">Results:</p>
                    <p className="text-gray-600">
                      {Object.values(election.results).reduce((sum, count) => sum + count, 0)} votes cast
                    </p>
                  </div>
                )}
                
                {election.type === "multi-round" && (
                  <div className="mt-2">
                    <p className="font-medium">Type:</p>
                    <p className="text-gray-600">
                      Multi-round (Round {election.currentRound}/{election.totalRounds})
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4 md:mt-auto">
                <Button variant="outline" size="sm">
                  Details
                </Button>
                
                {election.status === "upcoming" && (
                  <Button size="sm" className="bg-ballot-secondary hover:bg-ballot-secondary/90">
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminDashboard;
