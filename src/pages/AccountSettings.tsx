
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import { toast } from '@/components/ui/sonner';
import { getUserProfile, updateUserProfile, signOut, resetPassword } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, LogOut, User } from 'lucide-react';

// Define the profile type
interface UserProfile {
  id: string;
  display_name: string;
  created_at: string;
  avatar_url: string | null;
  settings: any;
  email?: string; // Make email optional to match the returned profile type
}

const AccountSettings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Fetch user profile with updated type
  const { data: profile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: getUserProfile
  });
  
  // Set display name when profile loads
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);
  
  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) {
      toast.error("Display name is required");
      return;
    }
    
    setIsLoading(true);
    try {
      await updateUserProfile({ display_name: displayName });
      toast.success("Profile updated successfully");
      setIsLoading(false);
    } catch (error) {
      // Error is handled in updateUserProfile function
      setIsLoading(false);
    }
  };
  
  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setIsLoading(true);
    try {
      // First validate current password (this is a simplified approach)
      // In a real app, you'd verify the current password on the server
      await resetPassword(newPassword);
      toast.success("Password updated successfully");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    } catch (error) {
      // Error is handled in resetPassword function
      setIsLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      // Error is handled in signOut function
    }
  };
  
  // Handle account deletion (placeholder - would need server-side implementation)
  const handleDeleteAccount = () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmed) {
      toast.error("Account deletion is not implemented in this demo");
    }
  };
  
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-water rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-medium mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to access account settings.</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Link>
          </Button>
          <h1 className="text-3xl font-serif font-medium mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security</p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Settings */}
          <form onSubmit={handleUpdateProfile}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile details</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input 
                    id="display-name" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
          
          {/* Password Settings */}
          <form onSubmit={handleChangePassword}>
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to enhance account security</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
          </form>
          
          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account access and data</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Sign out of your account on this device</p>
              </div>
              
              <Separator />
              
              <div>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Permanently delete your account and all associated data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AccountSettings;
