
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare, Shield, Vote, FileText, CheckCircle2, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="ballot-gradient text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <CheckSquare className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Secure Online Voting Platform</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Vote with confidence using blockchain technology and advanced biometric authentication.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6">
            {user ? (
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')} 
                className="bg-white text-ballot-primary hover:bg-ballot-light"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')} 
                  className="bg-white text-ballot-primary hover:bg-ballot-light"
                >
                  Login to Vote
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-ballot-primary">
            Revolutionizing Democratic Processes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="h-12 w-12 text-ballot-primary" />}
              title="Secure Authentication"
              description="Multi-factor authentication with Aadhaar verification and biometric security measures."
            />
            
            <FeatureCard 
              icon={<FileText className="h-12 w-12 text-ballot-primary" />}
              title="Transparent Ledger"
              description="All votes are recorded on a blockchain ledger, ensuring transparency and immutability."
            />
            
            <FeatureCard 
              icon={<CheckCircle2 className="h-12 w-12 text-ballot-primary" />}
              title="Verifiable Results"
              description="Voters can verify their vote was counted correctly without compromising privacy."
            />
          </div>
        </div>
      </section>
      
      {/* Security Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-6 text-ballot-primary">
                Bank-Grade Security
              </h2>
              <p className="mb-6 text-lg">
                We employ the highest security standards to protect your vote and personal information:
              </p>
              <ul className="space-y-4">
                <SecurityItem text="End-to-end encryption for all data" />
                <SecurityItem text="Biometric verification prevents identity fraud" />
                <SecurityItem text="Immutable blockchain records ensure vote integrity" />
                <SecurityItem text="Anonymous vote storage preserves privacy" />
              </ul>
            </div>
            <div className="md:w-1/2 md:pl-12 flex justify-center">
              <Lock className="h-48 w-48 text-ballot-secondary opacity-90" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-ballot-primary text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; {new Date().getFullYear()} BallotByte Secure Voting Platform</p>
          <p className="text-sm opacity-75">Ensuring democracy through technology</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3 text-ballot-primary">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const SecurityItem = ({ text }: { text: string }) => (
  <li className="flex items-start">
    <CheckCircle2 className="h-5 w-5 text-ballot-secondary mr-2 mt-0.5" />
    <span>{text}</span>
  </li>
);

export default Index;
