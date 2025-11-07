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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { venueService } from "@/services/venue.service";
import { Venue } from "@/types/venue";
import { Loader2 } from "lucide-react";

const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  location: z.string().min(1, "Location is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

type VenueFormData = z.infer<typeof venueSchema>;

interface VenueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  venue?: Venue;
  institutionId?: number;
}

const VenueFormDialog: React.FC<VenueFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  venue,
  institutionId,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditMode = !!venue;

  const form = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: "",
      location: "",
      capacity: 50,
    },
  });

  useEffect(() => {
    if (venue) {
      form.reset({
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
      });
    } else {
      form.reset({
        name: "",
        location: "",
        capacity: 50,
      });
    }
  }, [venue, form]);

  const onSubmit = async (data: VenueFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditMode) {
        await venueService.updateVenue(venue.id, data);
      } else {
        if (!institutionId) {
          throw new Error("Institution ID is required");
        }
        await venueService.createVenue({
          ...data,
          institutionId,
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving venue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Venue" : "Create New Venue"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the venue information below."
              : "Fill in the details to create a new examination venue."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Main Hall, Science Building"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The official name of the venue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Ground Floor, Block A"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed location or address of the venue
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
                  <FormLabel>Total Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 500"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of students the venue can accommodate
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
                {isEditMode ? "Update Venue" : "Create Venue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VenueFormDialog;
