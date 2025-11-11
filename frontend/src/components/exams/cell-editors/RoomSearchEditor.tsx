import { useState, useRef, useEffect } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { venueService } from '@/services/venue.service';
import { Room } from '@/types/venue';
import { Loader2, DoorClosed } from 'lucide-react';
import { ExamEntryRow } from '../ExamEntryExcelView';

export interface RoomSearchEditorProps extends RenderEditCellProps<ExamEntryRow> {
  // venueId is required - rooms can only be selected after venue is selected
}

export const RoomSearchEditor = (props: RoomSearchEditorProps) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const venueId = props.row.venueId;

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    // Check if venue is selected
    if (!venueId) {
      setError('Please select a venue first');
      return;
    }

    // Load rooms for the selected venue
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  const loadRooms = async () => {
    if (!venueId) {
      setError('Please select a venue first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await venueService.getRoomsByVenue(venueId, {
        limit: 100, // Load all rooms for the venue
      });

      // Service now properly transforms backend response to { data: [...], pagination: {...} }
      const roomsData = response.data || [];

      if (roomsData.length === 0) {
        setError('No rooms available in this venue');
      } else {
        setRooms(roomsData);

        // If row already has roomIds, set display value
        if (props.row.roomIds) {
          const roomIdArray = props.row.roomIds.split(',').map(id => parseInt(id.trim()));
          const selectedRooms = roomsData.filter(r => roomIdArray.includes(r.id));
          if (selectedRooms.length > 0) {
            setDisplayValue(selectedRooms.map(r => r.name).join(', '));
          }
        }
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const searchRooms = (searchTerm: string) => {
    if (!venueId || rooms.length === 0) return;

    setDisplayValue(searchTerm);
  };

  const handleSelect = (room: Room) => {
    // For now, single room selection
    // Later, we can extend this to support multiple room selection
    const updatedRow = {
      ...props.row,
      roomIds: room.id.toString(), // Store as comma-separated string
      roomNames: room.name,
      venueLocation: room.name, // Update location to show room name
      roomCapacity: room.capacity,
    };
    props.onRowChange(updatedRow, true);
  };

  const handleMultiSelect = (room: Room) => {
    // Add to existing selection
    const currentIds = props.row.roomIds ? props.row.roomIds.split(',').map(id => id.trim()) : [];
    const currentNames = props.row.roomNames ? props.row.roomNames.split(',').map(n => n.trim()) : [];

    if (currentIds.includes(room.id.toString())) {
      // Remove if already selected
      const newIds = currentIds.filter(id => id !== room.id.toString());
      const newNames = currentNames.filter((_, idx) => currentIds[idx] !== room.id.toString());

      // Calculate total capacity
      const totalCapacity = rooms
        .filter(r => newIds.includes(r.id.toString()))
        .reduce((sum, r) => sum + r.capacity, 0);

      const updatedRow = {
        ...props.row,
        roomIds: newIds.join(','),
        roomNames: newNames.join(', '),
        venueLocation: newNames.join(', ') || props.row.venueName,
        roomCapacity: totalCapacity,
      };
      props.onRowChange(updatedRow);
    } else {
      // Add to selection
      const newIds = [...currentIds, room.id.toString()];
      const newNames = [...currentNames, room.name];

      // Calculate total capacity
      const totalCapacity = rooms
        .filter(r => newIds.includes(r.id.toString()))
        .reduce((sum, r) => sum + r.capacity, 0);

      const updatedRow = {
        ...props.row,
        roomIds: newIds.join(','),
        roomNames: newNames.join(', '),
        venueLocation: newNames.join(', '),
        roomCapacity: totalCapacity,
      };
      props.onRowChange(updatedRow);
    }
  };

  if (error && !venueId) {
    return (
      <div className="flex items-center gap-2 h-full px-2 text-sm text-amber-600">
        <span>{error}</span>
      </div>
    );
  }

  const selectedRoomIds = props.row.roomIds ? props.row.roomIds.split(',').map(id => id.trim()) : [];

  return (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          value={displayValue || (props.row.roomNames || '')}
          onChange={(e) => searchRooms(e.target.value)}
          placeholder={loading ? "Loading rooms..." : error ? error : "Select room(s)..."}
          disabled={!venueId || loading}
          className="border-none shadow-none p-0 px-2 h-full focus-visible:ring-0"
        />
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search rooms..."
            disabled={loading || error !== ''}
          />
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {!loading && error && (
            <div className="py-6 text-center text-sm text-muted-foreground">{error}</div>
          )}
          {!loading && !error && rooms.length === 0 && (
            <CommandEmpty>No rooms found in this venue.</CommandEmpty>
          )}
          {!loading && !error && rooms.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                Click to select. Shift+Click to select multiple rooms.
              </div>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {rooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.id.toString());
                  return (
                    <CommandItem
                      key={room.id}
                      value={room.name}
                      onSelect={() => handleSelect(room)}
                      onClick={(e) => {
                        if (e.shiftKey) {
                          e.preventDefault();
                          handleMultiSelect(room);
                        }
                      }}
                      className={isSelected ? 'bg-blue-50' : ''}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <DoorClosed className={`h-4 w-4 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-muted-foreground'}`} />
                        <div className="flex flex-col flex-1">
                          <div className={`font-medium ${isSelected ? 'text-blue-600' : ''}`}>
                            {room.name}
                            {isSelected && <span className="ml-2 text-xs">(Selected)</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Capacity: {room.capacity} seats
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedRoomIds.length > 0 && (
                <div className="px-3 py-2 border-t bg-muted/50 text-xs">
                  <div className="font-medium">Selected: {selectedRoomIds.length} room(s)</div>
                  <div className="text-muted-foreground">
                    Total Capacity: {props.row.roomCapacity || 0} seats
                  </div>
                </div>
              )}
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
