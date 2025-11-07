import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Users, BookOpen, Mail, Phone, MapPin, Globe, Calendar, Edit, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import types and services
import { Institution, InstitutionStatus, InstitutionType, InstitutionSpecificAnalytics as InstituteAnalyticsTypes } from "@/types/institution";
import { institutionService } from "@/services/institution.service";

// Import the new analytics component
import InstitutionSpecificAnalytics from "@/components/institutions/InstitutionSpecificAnalytics";

// Import user management components
import { UserList } from "@/components/user";

// ========================================
// HELPER COMPONENTS
// ========================================

const StatusBadge = ({ status }: { status: InstitutionStatus }) => {
  const statusConfig = {
    [InstitutionStatus.ACTIVE]: { color: "bg-green-100 text-green-800", label: "Active" },
    [InstitutionStatus.INACTIVE]: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
    [InstitutionStatus.PENDING]: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    [InstitutionStatus.SUSPENDED]: { color: "bg-red-100 text-red-800", label: "Suspended" },
  };

  const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: "Unknown" };
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};

const TypeBadge = ({ type }: { type: InstitutionType }) => {
  const typeLabels = {
    [InstitutionType.UNIVERSITY]: "University",
    [InstitutionType.TECHNICAL_UNIVERSITY]: "Technical University",
    [InstitutionType.POLYTECHNIC]: "Polytechnic",
    [InstitutionType.COLLEGE]: "College",
    [InstitutionType.INSTITUTE]: "Institute",
    [InstitutionType.OTHER]: "Other",
  };

  return (
    <Badge variant="secondary">
      {typeLabels[type] || "Unknown"}
    </Badge>
  );
};

const FacultyCard = ({ faculty }: { faculty: NonNullable<Institution['faculties']>[0] }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{faculty.name}</h4>
            <p className="text-sm text-gray-600">Code: {faculty.code}</p>
          </div>
          <BookOpen className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

export const InstitutionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [analytics, setAnalytics] = useState<InstituteAnalyticsTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // ========================================
  // DATA FETCHING
  // ========================================

  useEffect(() => {
    const fetchInstitutionDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await institutionService.getInstitution(parseInt(id));
        if (response.data) {
          setInstitution(response.data);
        } else {
          setError('Institution not found');
        }
      } catch (err) {
        console.error('Failed to fetch institution details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch institution details');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutionDetails();
  }, [id]);

  // Fetch analytics function
  const fetchAnalytics = async () => {
    if (!id || analytics) return; // Don't fetch if already loaded

    try {
      setAnalyticsLoading(true);
      const response = await institutionService.getInstitutionAnalytics(parseInt(id));
      if (response) {
        setAnalytics(response);
      }
    } catch (err) {
      console.error('Failed to fetch institution analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleBack = () => {
    navigate('/institutions');
  };

  const handleEdit = () => {
    navigate(`/institutions/${id}/edit`);
  };

  const handleActivate = async () => {
    if (!institution) return;

    try {
      await institutionService.updateInstitution(institution.id, {
        status: InstitutionStatus.ACTIVE,
      });
      // Refresh data
      const response = await institutionService.getInstitution(institution.id);
      if (response.data) {
        setInstitution(response.data);
      }
    } catch (error) {
      console.error('Failed to activate institution:', error);
      alert('Failed to activate institution. Please try again.');
    }
  };

  const handleDeactivate = async () => {
    if (!institution) return;

    try {
      await institutionService.updateInstitution(institution.id, {
        status: InstitutionStatus.INACTIVE,
      });
      // Refresh data
      const response = await institutionService.getInstitution(institution.id);
      if (response.data) {
        setInstitution(response.data);
      }
    } catch (error) {
      console.error('Failed to deactivate institution:', error);
      alert('Failed to deactivate institution. Please try again.');
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['basic', 'contact', 'location', 'timestamps'].map((section) => (
            <Card key={section}>
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========================================
  // NO DATA STATE
  // ========================================

  if (!institution) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Institution not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              {institution.name}
            </h1>
            <p className="text-gray-600">Institution Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              if (!showAnalytics && !analytics) {
                fetchAnalytics();
              }
            }}
            variant={showAnalytics ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
          </Button>
          {institution.status !== InstitutionStatus.ACTIVE && (
            <Button onClick={handleActivate} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Activate
            </Button>
          )}
          {institution.status === InstitutionStatus.ACTIVE && (
            <Button onClick={handleDeactivate} variant="outline" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Deactivate
            </Button>
          )}
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Status and Type Badges */}
      <div className="flex items-center space-x-4">
        <StatusBadge status={institution.status} />
        <TypeBadge type={institution.type} />
        <Badge variant="outline">
          Code: {institution.code}
        </Badge>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Institution Name</span>
              <p className="text-lg">{institution.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Code</span>
              <p className="font-mono">{institution.code}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Type</span>
              <div className="mt-1">
                <TypeBadge type={institution.type} />
              </div>
            </div>
            {institution.description && (
              <div>
                <span className="text-sm font-medium text-gray-700">Description</span>
                <p className="text-gray-600">{institution.description}</p>
              </div>
            )}
            {institution.establishedYear && (
              <div>
                <span className="text-sm font-medium text-gray-700">Established Year</span>
                <p>{institution.establishedYear}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {institution.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <p>{institution.contactEmail}</p>
                </div>
              </div>
            )}
            {institution.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Phone</span>
                  <p>{institution.contactPhone}</p>
                </div>
              </div>
            )}
            {institution.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Website</span>
                  <p>
                    <a
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {institution.website}
                    </a>
                  </p>
                </div>
              </div>
            )}
            {(institution.address || institution.city || institution.state || institution.country) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Address</span>
                  <div className="text-sm text-gray-600">
                    {institution.address && <p>{institution.address}</p>}
                    {(institution.city || institution.state) && (
                      <p>{[institution.city, institution.state].filter(Boolean).join(', ')}</p>
                    )}
                    {institution.country && <p>{institution.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserList institutionId={parseInt(id!)} />
        </CardContent>
      </Card>

      {/* Faculties Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Faculties ({institution.faculties?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(institution.faculties?.length || 0) > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {institution.faculties?.map((faculty) => (
                <FacultyCard key={faculty.id} faculty={faculty} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No faculties associated with this institution</p>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm font-medium text-gray-700">Created At</span>
              <p className="text-lg">{new Date(institution.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Updated At</span>
              <p className="text-lg">{new Date(institution.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      {showAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Institution Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <InstitutionSpecificAnalytics
                data={analytics}
                loading={analyticsLoading}
                institutionName={institution.name}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                {analyticsLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading analytics...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Analytics data will appear here</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstitutionDetailsPage;



