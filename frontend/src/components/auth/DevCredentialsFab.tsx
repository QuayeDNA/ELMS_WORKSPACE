import { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DevCredential } from './devCredentials';
import { DEV_CREDENTIALS } from './devCredentials';
import { toast } from 'sonner';

interface Props {
  onSelect?: (credential: DevCredential) => void;
}

type Position = 'top' | 'bottom' | 'left' | 'right';

export function DevCredentialsFab({ onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>('top');
  const fabRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && fabRef.current) {
      const calculatePosition = () => {
        const fabRect = fabRef.current!.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Check available space in each direction
        const spaceTop = fabRect.top;
        const spaceBottom = viewportHeight - fabRect.bottom;
        const spaceLeft = fabRect.left;
        const spaceRight = viewportWidth - fabRect.right;

        // Calculate maximum available height for dropdown
        let maxHeight = 0;
        let bestPosition: Position = 'top'; // Default to top since FAB is at bottom

        // For bottom-right positioned FAB, prioritize top, then left, then right, then bottom as last resort
        const minRequiredHeight = 100; // Minimum height needed to be useful

        if (spaceTop >= minRequiredHeight) {
          bestPosition = 'top';
          maxHeight = Math.min(spaceTop - 16, viewportHeight * 0.8);
        } else if (spaceLeft >= minRequiredHeight) {
          bestPosition = 'left';
          maxHeight = Math.min(viewportHeight - 32, viewportHeight * 0.8);
        } else if (spaceRight >= minRequiredHeight) {
          bestPosition = 'right';
          maxHeight = Math.min(viewportHeight - 32, viewportHeight * 0.8);
        } else {
          // Last resort - bottom, even if it might overflow
          bestPosition = 'bottom';
          maxHeight = Math.min(spaceBottom - 16, viewportHeight * 0.8);
        }

        setPosition(bestPosition);
        // Store max height for styling
        if (dropdownRef.current) {
          dropdownRef.current.style.maxHeight = `${maxHeight}px`;
        }
      };

      // Small delay to ensure DOM is ready
      setTimeout(calculatePosition, 0);
      window.addEventListener('resize', calculatePosition);
      return () => window.removeEventListener('resize', calculatePosition);
    }
  }, [isOpen]);

  if (process.env.NODE_ENV !== 'development') return null;

  function selectCredential(credential: DevCredential) {
    onSelect?.(credential);
    toast.success(`Selected ${credential.role}: ${credential.name}`);
    setIsOpen(false);
  }

  const getDropdownClasses = () => {
    const baseClasses = "absolute z-50 w-80 bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto";
    const responsiveClasses = "max-w-[calc(100vw-2rem)]";

    switch (position) {
      case 'top':
        return `${baseClasses} ${responsiveClasses} bottom-full mb-2 right-0`;
      case 'bottom':
        return `${baseClasses} ${responsiveClasses} top-full mt-2 right-0`;
      case 'left':
        return `${baseClasses} ${responsiveClasses} right-full mr-2 bottom-0`;
      case 'right':
        return `${baseClasses} ${responsiveClasses} left-full ml-2 bottom-0`;
      default:
        return `${baseClasses} ${responsiveClasses} bottom-full mb-2 right-0`;
    }
  };

  return (
    <div ref={fabRef} className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50">
      <div className="relative">
        <Button
          onClick={() => setIsOpen((s) => !s)}
          className="rounded-full h-10 w-10 md:h-12 md:w-12 flex items-center justify-center p-0 shadow-lg hover:shadow-xl transition-shadow"
          variant="outline"
          aria-label="Development credentials"
        >
          <User className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        {isOpen && (
          <div ref={dropdownRef} className={getDropdownClasses()}>
            <div className="px-3 py-2 bg-orange-50 font-semibold text-xs text-orange-900 uppercase tracking-wide border-b border-orange-100">
              Development Helper
            </div>
            {DEV_CREDENTIALS.map((group, groupIndex) => (
              <div key={groupIndex} className="border-b border-orange-100 last:border-b-0">
                <div className="px-3 py-2 bg-orange-50 font-semibold text-xs text-orange-900 uppercase tracking-wide">
                  {group.role}
                </div>
                {group.users.map((credential) => (
                  <button
                    key={credential.id}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 transition-colors focus:bg-orange-50 focus:outline-none"
                    onClick={() => selectCredential(credential)}
                  >
                    <div className="font-medium text-sm truncate">{credential.name}</div>
                    <div className="text-xs text-gray-500 truncate">{credential.email}</div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DevCredentialsFab;
