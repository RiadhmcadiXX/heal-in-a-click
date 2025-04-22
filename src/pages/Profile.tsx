import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DoctorProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string | null;
  profile_image_url: string | null;
  languages: string[] | null;
  education: string[] | null;
  city: string | null;
  specialty: string;
  consultation_fee: number | null;
  bio: string | null;
  location_photos: string[] | null;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [form, setForm] = useState<Omit<DoctorProfile, "id">>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profile_image_url: "",
    languages: [],
    education: [],
    city: "",
    specialty: "",
    consultation_fee: null,
    bio: "",
    location_photos: [],
  });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        setStatusMsg("Failed to load profile. Please try again.");
        setIsLoading(false);
        return;
      }
      if (data) {
        setProfile(data);
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          email: user.email ?? "",
          phone: data.phone ?? "",
          profile_image_url: data.profile_image_url ?? "",
          languages: data.languages ?? [],
          education: data.education ?? [],
          city: data.city ?? "",
          specialty: data.specialty ?? "",
          consultation_fee: data.consultation_fee ?? null,
          bio: data.bio ?? "",
          location_photos: data.location_photos ?? [],
        });
      }
      setIsLoading(false);
    })();
  }, [user]);

  const handleProfilePhotoUpload = (url: string) => {
    setForm(prev => ({
      ...prev,
      profile_image_url: url
    }));
  };

  const handleLocationPhotoUpload = (url: string) => {
    setForm(prev => ({
      ...prev,
      location_photos: [...(prev.location_photos || []), url]
    }));
  };

  const removeLocationPhoto = (urlToRemove: string) => {
    setForm(prev => ({
      ...prev,
      location_photos: prev.location_photos?.filter(url => url !== urlToRemove) || []
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "consultation_fee") {
      setForm((prev) => ({
        ...prev,
        consultation_fee: value === "" ? null : Number(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      languages: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
    }));
  };
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      education: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsLoading(true);
    setStatusMsg(null);

    const { error } = await supabase
      .from("doctors")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        profile_image_url: form.profile_image_url,
        languages: form.languages,
        education: form.education,
        city: form.city,
        specialty: form.specialty,
        consultation_fee: form.consultation_fee,
        bio: form.bio,
        location_photos: form.location_photos,
      })
      .eq("id", profile.id);

    if (error) {
      setStatusMsg("Failed to update profile. Please try again.");
    } else {
      setStatusMsg("Profile updated successfully!");
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p>Please sign in to view your profile.</p>
        <Button onClick={() => navigate("/login")}>Log in</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 container max-w-xl mx-auto px-4 pb-24 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={form.profile_image_url || ''} alt="Profile" />
                  <AvatarFallback>
                    {form.first_name?.[0]}{form.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <PhotoUpload
                  bucketName="doctor_photos"
                  onUploadComplete={handleProfilePhotoUpload}
                  className="w-full max-w-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_image_url">Profile Image URL</Label>
                  <Input
                    id="profile_image_url"
                    name="profile_image_url"
                    value={form.profile_image_url || ""}
                    onChange={handleInputChange}
                  />
                  {form.profile_image_url && (
                    <img
                      src={form.profile_image_url}
                      alt="Profile"
                      className="h-16 w-16 mt-2 rounded-full object-cover border"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    name="languages"
                    value={form.languages?.join(", ") || ""}
                    onChange={handleLanguagesChange}
                    placeholder="English, French, Arabic"
                  />
                  <p className="text-xs text-gray-500">Comma-separated (e.g., English, French)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    name="education"
                    value={form.education?.join(", ") || ""}
                    onChange={handleEducationChange}
                    placeholder="MD, PhD, MSc"
                  />
                  <p className="text-xs text-gray-500">Comma-separated (e.g., MD, MSc)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={form.city || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={form.specialty}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
                  <Input
                    id="consultation_fee"
                    name="consultation_fee"
                    type="number"
                    value={form.consultation_fee ?? ""}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Location Photos</Label>
                <div className="grid grid-cols-2 gap-4">
                  {form.location_photos?.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Location ${index + 1}`}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeLocationPhoto(url)}
                        type="button"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                {(!form.location_photos || form.location_photos.length < 2) && (
                  <PhotoUpload
                    bucketName="doctor_photos"
                    onUploadComplete={handleLocationPhotoUpload}
                  />
                )}
                <p className="text-xs text-gray-500">
                  You can upload up to 2 photos of your location
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio || ""}
                  onChange={handleInputChange}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Tell your patients about your background and philosophy of care.
                </p>
              </div>

              {statusMsg && (
                <div
                  className={
                    statusMsg.includes("success")
                      ? "text-green-600 text-sm"
                      : "text-red-600 text-sm"
                  }
                >
                  {statusMsg}
                </div>
              )}

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
