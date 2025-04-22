
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PREDEFINED_AVATARS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AvatarSelectorProps {
  selected: string | null;
  firstName: string;
  lastName: string;
  onSelect: (url: string) => void;
}

export function AvatarSelector({
  selected,
  firstName,
  lastName,
  onSelect,
}: AvatarSelectorProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={selected || ""} alt="Profile" />
        <AvatarFallback>
          {firstName?.[0]}{lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-wrap gap-4 justify-center">
        {PREDEFINED_AVATARS.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onSelect(avatar)}
            className={cn(
              "p-1 rounded-full transition-all",
              selected === avatar ? "ring-2 ring-offset-2 ring-primary" : "hover:ring-2 hover:ring-offset-2 hover:ring-primary/50"
            )}
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
            </Avatar>
          </button>
        ))}
      </div>
    </div>
  );
}
