import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VenueWithRooms, Room } from "@/types/venue";
import {
  MapPin,
  Users,
  Building2,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { venueService } from "@/services/venue.service";
import { toast } from "sonner";
import RoomFormDialog from "./RoomFormDialog";

interface VenueDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue?: VenueWithRooms;
  onRefresh: () => void;
}

const VenueDetailsDialog: React.FC<VenueDetailsDialogProps> = ({
  open,
  onOpenChange,
  venue,
  onRefresh,
}) => {
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);

  if (!venue) return null;

  const handleDeleteRoom = async (roomId: number) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await venueService.deleteRoom(roomId);
        toast.success("Room deleted successfully");
        onRefresh();
      } catch (error) {
        console.error("Error deleting room:", error);
        toast.error("Failed to delete room");
      }
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomDialogOpen(true);
  };

  const handleRoomSuccess = () => {
    toast.success("Room saved successfully");
    setEditingRoom(undefined);
    onRefresh();
  };

  const totalRoomCapacity = venue.rooms?.reduce(
    (sum, room) => sum + room.capacity,
    0
  ) || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{venue.name}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {venue.location}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Venue Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">
                      {venue.capacity.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">
                      {venue.rooms?.length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Room Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span className="text-2xl font-bold">
                      {totalRoomCapacity.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rooms */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rooms</CardTitle>
                    <CardDescription>
                      Individual rooms within this venue
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setRoomDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!venue.rooms || venue.rooms.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      No rooms added yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRoomDialogOpen(true)}
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Room
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room Name</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {venue.rooms.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell className="font-medium">
                              {room.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {room.capacity.toLocaleString()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRoom(room)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRoom(room.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <RoomFormDialog
        open={roomDialogOpen}
        onOpenChange={(open) => {
          setRoomDialogOpen(open);
          if (!open) setEditingRoom(undefined);
        }}
        onSuccess={handleRoomSuccess}
        venueId={venue.id}
        room={editingRoom}
      />
    </>
  );
};

export default VenueDetailsDialog;
