
import { useSound } from '@/contexts/SoundContext';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function SoundToggle() {
  const { toggleSounds, soundsEnabled } = useSound();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSounds} 
          aria-label={soundsEnabled ? "Disable sounds" : "Enable sounds"}
        >
          {soundsEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{soundsEnabled ? "Disable sounds" : "Enable sounds"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
