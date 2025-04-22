import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProfilePhotoSection } from "@/components/profile/ProfilePhotoSection";
import { LocationPhotosSection } from "@/components/profile/LocationPhotosSection";
import { ProfileFormFields } from "@/components/profile/ProfileFormFields";
import { AvatarSelector } from "@/components/profile/AvatarSelector";

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

  const handleSelectChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              <AvatarSelector
                selected={form.profile_image_url}
                firstName={form.first_name}
                lastName={form.last_name}
                onSelect={handleProfilePhotoUpload}
              />

              <ProfileFormFields
                form={form}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleLanguagesChange={handleLanguagesChange}
                handleEducationChange={handleEducationChange}
              />

              <LocationPhotosSection
                locationPhotos={form.location_photos || []}
                onPhotoUpload={handleLocationPhotoUpload}
                onPhotoRemove={removeLocationPhoto}
              />

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
