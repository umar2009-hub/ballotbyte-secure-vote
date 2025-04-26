
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fingerprint, Shield, Mail, CheckSquare, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithBiometric, loading } = useAuth();
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  const handleSendOtp = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    
    // Simulate OTP sending
    toast.info("Sending OTP to your registered mobile number");
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setOtpSent(true);
    toast.success("OTP sent successfully");
  };
  
  const handleAadhaarLogin = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    const success = await login(aadhaarNumber, otp);
    if (success) {
      navigate("/dashboard");
    }
  };
  
  const handleBiometricLogin = async () => {
    // Simulate fingerprint scanning
    toast.info("Scanning fingerprint...");
    
    const success = await loginWithBiometric("mock-fingerprint-data");
    if (success) {
      navigate("/dashboard");
    }
  };
  
  const handleFacialLogin = async () => {
    // Simulate facial recognition
    toast.info("Scanning facial features...");
    
    const success = await loginWithBiometric("mock-facial-data");
    if (success) {
      navigate("/dashboard");
    }
  };

  // For demo purposes - admin login hint
  const loginAsAdmin = async () => {
    setAadhaarNumber("999999999999");
    setOtp("123456");
    setOtpSent(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <CheckSquare className="h-12 w-12 text-ballot-primary mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-ballot-primary">Secure Login</h1>
            <p className="text-gray-600 mt-2">
              Authenticate securely to access the voting platform
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 auth-form">
            <Tabs defaultValue="aadhaar" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="aadhaar" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Aadhaar + OTP
                </TabsTrigger>
                <TabsTrigger value="biometric" className="flex items-center">
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Biometric
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="aadhaar">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number
                    </label>
                    <Input
                      placeholder="Enter your 12-digit Aadhaar number"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={12}
                      disabled={otpSent || loading}
                    />
                  </div>
                  
                  {!otpSent ? (
                    <Button 
                      onClick={handleSendOtp} 
                      className="w-full bg-ballot-primary hover:bg-ballot-primary/90"
                      disabled={loading || aadhaarNumber.length !== 12}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          One-Time Password (OTP)
                        </label>
                        <Input
                          placeholder="Enter the 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          maxLength={6}
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          OTP sent to your registered mobile number
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleAadhaarLogin} 
                        className="w-full bg-ballot-primary hover:bg-ballot-primary/90"
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>
                      
                      <button 
                        type="button" 
                        className="text-xs text-ballot-secondary hover:underline w-full text-center"
                        onClick={() => setOtpSent(false)}
                      >
                        Change Aadhaar number?
                      </button>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="biometric">
                <div className="space-y-6">
                  <div className="text-center p-4">
                    <p className="text-gray-600 mb-6">
                      Choose your preferred biometric verification method
                    </p>
                    
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full border-ballot-primary text-ballot-primary hover:bg-ballot-primary/10 h-16"
                        onClick={handleBiometricLogin}
                        disabled={loading}
                      >
                        <Fingerprint className="h-6 w-6 mr-3" />
                        Fingerprint Authentication
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full border-ballot-primary text-ballot-primary hover:bg-ballot-primary/10 h-16"
                        onClick={handleFacialLogin}
                        disabled={loading}
                      >
                        <Shield className="h-6 w-6 mr-3" />
                        Facial Recognition
                      </Button>
                    </div>
                    
                    {loading && (
                      <div className="mt-4 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 mr-2 animate-spin text-ballot-primary" />
                        <span className="text-ballot-primary">Authenticating...</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-6">
                      Biometric data is processed securely and never stored
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Having trouble logging in? <a href="#" className="text-ballot-secondary hover:underline">Get Help</a>
            </p>
            
            {/* Demo helper - would be removed in production */}
            <button
              onClick={loginAsAdmin}
              className="text-xs text-ballot-primary mt-8 opacity-50 hover:opacity-100"
            >
              Demo: Login as Admin (999999999999 / 123456)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
