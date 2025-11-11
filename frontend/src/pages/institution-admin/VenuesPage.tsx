import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { venueService } from "@/services/venue.service";
import { Venue, VenueWithRooms } from "@/types/venue";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import VenueFormDialog from "@/components/venues/VenueFormDialog";
import VenueDetailsDialog from "@/components/venues/VenueDetailsDialog";
import RoomFormDialog from "@/components/venues/RoomFormDialog";
import { useAuthStore } from "@/stores/auth.store";

const VenuesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    totalCapacity: 0,
    totalRooms: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | VenueWithRooms | undefined>(
    undefined
  );

  const loadVenues = useCallback(async () => {
    try {
      setLoading(true);
      const query = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        institutionId: user?.institutionId,
      };

      const response = await venueService.getVenues(query);
      const venuesData = response?.data || [];
      setVenues(venuesData);
      setTotalPages(response?.pagination?.totalPages || 1);

      // Calculate stats
      const total = response?.pagination?.total || venuesData.length;
      const totalCapacity = venuesData.reduce(
        (sum: number, v: Venue) => sum + (v.capacity || 0),
        0
      );

      setStats({
        total,
        totalCapacity,
        totalRooms: 0, // Will be calculated when we load venue details
      });
    } catch (error) {
      console.error("Error loading venues:", error);
      toast.error("Failed to load venues");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, user?.institutionId]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await venueService.deleteVenue(id);
        toast.success("Venue deleted successfully");
        loadVenues();
      } catch (error) {
        console.error("Error deleting venue:", error);
        toast.error("Failed to delete venue");
      }
    }
  };

  const handleCreateSuccess = () => {
    toast.success("Venue created successfully");
    loadVenues();
  };

  const handleEditSuccess = () => {
    toast.success("Venue updated successfully");
    loadVenues();
  };

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setEditDialogOpen(true);
  };

  const handleViewDetails = async (venue: Venue) => {
    try {
      const response = await venueService.getVenueById(venue.id);
      if (response.success && response.data) {
        setSelectedVenue(response.data);
        setDetailsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error loading venue details:", error);
      toast.error("Failed to load venue details");
    }
  };

  const handleAddRoom = (venue: Venue) => {
    setSelectedVenue(venue);
    setRoomDialogOpen(true);
  };

  const handleRoomSuccess = () => {
    toast.success("Room saved successfully");
    loadVenues();
    if (selectedVenue) {
      handleViewDetails(selectedVenue as Venue);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadVenues();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
          <p className="text-gray-600 mt-1">Manage examination venues and rooms</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Venue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Venues
            </CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
            <p className="text-xs text-blue-700 mt-1">Across institution</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Total Capacity
            </CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {stats.totalCapacity.toLocaleString()}
            </div>
            <p className="text-xs text-green-700 mt-1">Students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Average Capacity
            </CardTitle>
            <MapPin className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {stats.total > 0
                ? Math.round(stats.totalCapacity / stats.total)
                : 0}
            </div>
            <p className="text-xs text-purple-700 mt-1">Per venue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Venues</CardTitle>
          <CardDescription>Find venues by name or location</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by venue name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Venues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Venues List</CardTitle>
          <CardDescription>
            {stats.total} venue{stats.total !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No venues found
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Get started by creating a new venue.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Venue
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venues.map((venue) => (
                      <TableRow key={venue.id}>
                        <TableCell className="font-medium">
                          {venue.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {venue.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {venue.capacity.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {(venue as VenueWithRooms).rooms?.length || 0} rooms
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(venue)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddRoom(venue)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Room
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(venue)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(venue.id)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <VenueFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        institutionId={user?.institutionId}
      />

      <VenueFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
        venue={selectedVenue as Venue}
        institutionId={user?.institutionId}
      />

      <VenueDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        venue={selectedVenue as VenueWithRooms}
        onRefresh={loadVenues}
      />

      <RoomFormDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        onSuccess={handleRoomSuccess}
        venueId={selectedVenue?.id}
      />
    </div>
  );
};

export default VenuesPage;
