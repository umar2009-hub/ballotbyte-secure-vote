
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  aadhaarNumber: string;
  email?: string;
  role: "voter" | "admin";
  hasVoted?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (aadhaarNumber: string, otp: string) => Promise<boolean>;
  loginWithBiometric: (biometricData: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock users for demonstration
const MOCK_USERS: User[] = [
  { 
    id: "user-1", 
    name: "John Voter", 
    aadhaarNumber: "123456789012", 
    email: "voter@example.com",
    role: "voter",
    hasVoted: []
  },
  { 
    id: "admin-1", 
    name: "Admin User", 
    aadhaarNumber: "999999999999", 
    email: "admin@example.com",
    role: "admin",
    hasVoted: []
  },
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("ballotbyte_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data", error);
        localStorage.removeItem("ballotbyte_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (aadhaarNumber: string, otp: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would verify with a backend
      const matchedUser = MOCK_USERS.find(u => u.aadhaarNumber === aadhaarNumber);
      
      if (matchedUser && otp === "123456") { // Mock OTP check
        setUser(matchedUser);
        localStorage.setItem("ballotbyte_user", JSON.stringify(matchedUser));
        toast.success("Login successful");
        return true;
      } else {
        toast.error("Invalid credentials");
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithBiometric = async (biometricData: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demonstration, just log the user in as the first mock user
      const demoUser = MOCK_USERS[0];
      setUser(demoUser);
      localStorage.setItem("ballotbyte_user", JSON.stringify(demoUser));
      toast.success("Biometric verification successful");
      return true;
    } catch (error) {
      console.error("Biometric login failed:", error);
      toast.error("Biometric verification failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ballotbyte_user");
    toast.info("You have been logged out");
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const value = {
    user,
    loading,
    login,
    loginWithBiometric,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
