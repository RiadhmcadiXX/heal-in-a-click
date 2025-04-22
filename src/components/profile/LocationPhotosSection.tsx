
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "@/components/PhotoUpload";

interface LocationPhotosSectionProps {
  locationPhotos: string[];
  onPhotoUpload: (url: string) => void;
  onPhotoRemove: (url: string) => void;
}

export function LocationPhotosSection({
  locationPhotos,
  onPhotoUpload,
  onPhotoRemove,
}: LocationPhotosSectionProps) {
  return (
    <div className="space-y-4">
      <Label>Location Photos</Label>
      <div className="grid grid-cols-2 gap-4">
        {locationPhotos?.map((url, index) => (
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
              onClick={() => onPhotoRemove(url)}
              type="button"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      {(!locationPhotos || locationPhotos.length < 2) && (
        <PhotoUpload
          bucketName="doctor_photos"
          onUploadComplete={onPhotoUpload}
        />
      )}
      <p className="text-xs text-gray-500">
        You can upload up to 2 photos of your location
      </p>
    </div>
  );
}
