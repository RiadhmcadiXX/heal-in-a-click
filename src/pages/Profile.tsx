
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user data
  const [userData, setUserData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1 (555) 123-4567"
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app with Supabase, this would be:
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .update({
      //     first_name: userData.firstName,
      //     last_name: userData.lastName,
      //     phone_number: userData.phoneNumber
      //   })
      //   .eq('id', currentUser.id);
      
      // Mock successful update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle error - show message to user
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    // In a real app with Supabase, this would be:
    // await supabase.auth.signOut();
    
    // Navigate to login page
    navigate("/login");
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container max-w-md mx-auto px-4 pb-24 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  disabled
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t">
              <Button 
                variant="outline" 
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
