import { useState, useRef, useEffect } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { venueService } from '@/services/venue.service';
import { Venue } from '@/types/venue';
import { Loader2, MapPin } from 'lucide-react';

export interface VenueSearchEditorProps extends RenderEditCellProps<any> {
  institutionId: number | string;
}

export const VenueSearchEditor = (props: VenueSearchEditorProps) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert institutionId to number
  const institutionIdNum = typeof props.institutionId === 'string'
    ? parseInt(props.institutionId)
    : props.institutionId;

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    if (props.row.venueName) {
      fetchInitialVenue(props.row.venueName);
    } else {
      // Load initial venues even for new rows
      loadInitialVenues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialVenues = async () => {
    if (!institutionIdNum) return;

    try {
      setLoading(true);
      const response = await venueService.getVenues({
        institutionId: institutionIdNum,
        limit: 50,
      });
      setVenues(response.data);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialVenue = async (venueIdOrName: string) => {
    if (!institutionIdNum) return;

    try {
      setLoading(true);
      const response = await venueService.getVenues({
        institutionId: institutionIdNum,
        limit: 50,
      });
      setVenues(response.data);

      const found = response.data.find(
        v => v.id.toString() === venueIdOrName || v.name === venueIdOrName
      );
      if (found) {
        setDisplayValue(found.name);
      }
    } catch (error) {
      console.error('Error fetching venue:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchVenues = async (searchTerm: string) => {
    if (!institutionIdNum) return;

    if (searchTerm.length < 2) {
      // Load all venues for empty search
      loadInitialVenues();
      return;
    }

    try {
      setLoading(true);
      const response = await venueService.getVenues({
        institutionId: institutionIdNum,
        search: searchTerm,
        limit: 20,
      });
      setVenues(response.data);
    } catch (error) {
      console.error('Error searching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (venue: Venue) => {
    setDisplayValue(venue.name);
    setIsOpen(false);
    // Update all venue-related fields in the row
    props.onRowChange({
      ...props.row,
      venueId: venue.id,
      venueName: venue.name,
      venueLocation: venue.location,
      venueCapacity: venue.capacity,
    });
    props.onClose(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => {
            setDisplayValue(e.target.value);
            searchVenues(e.target.value);
          }}
          placeholder="Search venue..."
          className="border-none shadow-none p-0 px-2 h-full focus-visible:ring-0"
        />
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or location..."
            onValueChange={searchVenues}
          />
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {!loading && venues.length === 0 && (
            <CommandEmpty>No venues found.</CommandEmpty>
          )}
          <CommandGroup className="max-h-[300px] overflow-auto">
            {venues.map((venue) => (
              <CommandItem
                key={venue.id}
                value={venue.name}
                onSelect={() => handleSelect(venue)}
              >
                <div className="flex items-start gap-2 w-full">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex flex-col flex-1">
                    <div className="font-medium">{venue.name}</div>
                    <div className="text-sm text-muted-foreground">{venue.location}</div>
                    <div className="text-xs text-muted-foreground">
                      Capacity: {venue.capacity} seats
                    </div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
