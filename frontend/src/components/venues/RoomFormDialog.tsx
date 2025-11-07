import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { venueService } from "@/services/venue.service";
import { Room } from "@/types/venue";
import { Loader2 } from "lucide-react";

const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
}).transform((data) => ({
  ...data,
  capacity: Number(data.capacity),
}));

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  venueId?: number;
  room?: Room;
}

const RoomFormDialog: React.FC<RoomFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  venueId,
  room,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditMode = !!room;

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      capacity: 30,
    },
  });

  useEffect(() => {
    if (room) {
      form.reset({
        name: room.name,
        capacity: room.capacity,
      });
    } else {
      form.reset({
        name: "",
        capacity: 30,
      });
    }
  }, [room, form]);

  const onSubmit = async (data: RoomFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditMode) {
        await venueService.updateRoom(room.id, data);
      } else {
        if (!venueId) {
          throw new Error("Venue ID is required");
        }
        await venueService.createRoom(venueId, data);
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving room:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Room" : "Add New Room"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the room information below."
              : "Fill in the details to add a new room to this venue."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Room 101, Lab A"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The name or number of the room
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 30"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of students this room can hold
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Update Room" : "Add Room"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomFormDialog;
