
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CheckSquare, LogOut, Shield, User } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-ballot-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <CheckSquare className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">BallotByte</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="hidden md:block">
                <span className="text-sm mr-2">Welcome, {user.name}</span>
                {isAdmin() && <Shield className="inline h-4 w-4 text-ballot-accent" />}
              </div>
              
              {isAdmin() && (
                <Button variant="ghost" asChild className="text-white hover:text-ballot-accent">
                  <Link to="/admin">
                    <Shield className="h-5 w-5 mr-1" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                </Button>
              )}
              
              <Button variant="ghost" asChild className="text-white hover:text-ballot-accent">
                <Link to="/dashboard">
                  <User className="h-5 w-5 mr-1" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                className="text-white hover:text-ballot-accent" 
                onClick={logout}
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" className="bg-white text-ballot-primary hover:bg-ballot-light">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
