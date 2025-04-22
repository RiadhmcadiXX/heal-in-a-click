
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PhotoUpload } from "@/components/PhotoUpload";

interface ProfilePhotoSectionProps {
  profileImageUrl: string | null;
  firstName: string;
  lastName: string;
  onPhotoUpload: (url: string) => void;
}

export function ProfilePhotoSection({
  profileImageUrl,
  firstName,
  lastName,
  onPhotoUpload,
}: ProfilePhotoSectionProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={profileImageUrl || ''} alt="Profile" />
        <AvatarFallback>
          {firstName?.[0]}{lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <PhotoUpload
        bucketName="doctor_photos"
        onUploadComplete={onPhotoUpload}
        className="w-full max-w-xs"
      />
    </div>
  );
}
