import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Camera,
  Trash2,
  Download,
  Smartphone,
  AlertTriangle,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

// ========================================
// TYPES
// ========================================

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  systemAlerts: boolean;
  examReminders: boolean;
  securityAlerts: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  sidebar: 'expanded' | 'collapsed';
  density: 'compact' | 'normal' | 'spacious';
}

// ========================================
// MAIN COMPONENT
// ========================================

export function SettingsPage() {
  const { user } = useAuthStore();

  // ========================================
  // STATE
  // ========================================

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    systemAlerts: true,
    examReminders: true,
    securityAlerts: true,
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    sidebar: 'expanded',
    density: 'normal',
  });

  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    avatar: false,
    deleteAccount: false,
  });

  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ========================================
  // EVENT HANDLERS - PROFILE
  // ========================================

  const handleProfileChange = (field: keyof ProfileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async () => {
    try {
      setLoading((prev) => ({ ...prev, profile: true }));

      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Profile Updated', {
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Update Failed', {
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const handleProfileCancel = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  };

  // ========================================
  // EVENT HANDLERS - PASSWORD
  // ========================================

  const validatePassword = (): boolean => {
    const errors: typeof passwordErrors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePasswordSubmit = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, password: true }));

      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Password Updated', {
        description: 'Your password has been updated successfully.',
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error('Update Failed', {
        description: 'Failed to update password. Please try again.',
      });
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  // ========================================
  // EVENT HANDLERS - AVATAR
  // ========================================

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', {
        description: 'Please select an image file.',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', {
        description: 'Image size must be less than 5MB.',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, avatar: true }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to server
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Avatar Updated', {
        description: 'Your profile picture has been updated.',
      });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Upload Failed', {
        description: 'Failed to upload image. Please try again.',
      });
    } finally {
      setLoading((prev) => ({ ...prev, avatar: false }));
    }
  };

  const handleAvatarRemove = async () => {
    try {
      setLoading((prev) => ({ ...prev, avatar: true }));

      // TODO: Remove from server
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAvatarPreview(null);

      toast.success('Avatar Removed', {
        description: 'Your profile picture has been removed.',
      });
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      toast.error('Removal Failed', {
        description: 'Failed to remove image. Please try again.',
      });
    } finally {
      setLoading((prev) => ({ ...prev, avatar: false }));
    }
  };

  // ========================================
  // EVENT HANDLERS - NOTIFICATIONS
  // ========================================

  const handleNotificationToggle = (setting: keyof NotificationSettings) => {
    setNotifications((prev) => {
      const newSettings = { ...prev, [setting]: !prev[setting] };

      // TODO: Save to server
      const settingName = setting.replace(/([A-Z])/g, ' $1').toLowerCase();
      toast.success('Notification Settings Updated', {
        description: `${settingName} ${newSettings[setting] ? 'enabled' : 'disabled'}.`,
      });

      return newSettings;
    });
  };

  // ========================================
  // EVENT HANDLERS - APPEARANCE
  // ========================================

  const handleThemeChange = (theme: AppearanceSettings['theme']) => {
    setAppearance((prev) => ({ ...prev, theme }));
    // TODO: Apply theme
    toast.success('Theme Updated', {
      description: `Theme changed to ${theme}.`,
    });
  };

  const handleSidebarChange = (sidebar: AppearanceSettings['sidebar']) => {
    setAppearance((prev) => ({ ...prev, sidebar }));
    // TODO: Apply sidebar setting
  };

  const handleDensityChange = (density: AppearanceSettings['density']) => {
    setAppearance((prev) => ({ ...prev, density }));
    // TODO: Apply density setting
  };

  // ========================================
  // EVENT HANDLERS - DANGEROUS ACTIONS
  // ========================================

  const handleExportData = async () => {
    toast.info('Preparing Export', {
      description: 'Your data export is being prepared. You will be notified when ready.',
    });

    // TODO: Implement data export
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );

    if (!confirmed) return;

    try {
      setLoading((prev) => ({ ...prev, deleteAccount: true }));

      // TODO: Implement account deletion
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Account Deletion Scheduled', {
        description: 'Your account has been scheduled for deletion.',
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Deletion Failed', {
        description: 'Failed to delete account. Please contact support.',
      });
    } finally {
      setLoading((prev) => ({ ...prev, deleteAccount: false }));
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar & Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Update your personal information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : getInitials()}
                </div>
                {loading.avatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-gray-600">Upload a profile picture. Max size: 5MB. Formats: JPG, PNG, GIF</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="relative" disabled={loading.avatar}>
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={loading.avatar}
                    />
                  </Button>
                  {avatarPreview && (
                    <Button size="sm" variant="ghost" onClick={handleAvatarRemove} disabled={loading.avatar}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileForm.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileForm.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleProfileCancel} disabled={loading.profile}>
                Cancel
              </Button>
              <Button onClick={handleProfileSubmit} disabled={loading.profile}>
                {loading.profile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">User ID</Label>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">{user?.id}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Role</Label>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg font-medium">
                {user?.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Institution</Label>
              <p className="text-sm text-gray-900">{user?.institutionId || 'Super Admin'}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Active</span>
              </div>
            </div>

            <Separator />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Two-Factor Auth</p>
                  <p className="text-xs text-blue-700 mt-1">Enable 2FA for enhanced security</p>
                  <Button variant="link" size="sm" className="p-0 h-auto text-blue-600 mt-2">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Setup Now
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Password Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security & Privacy</span>
            </CardTitle>
            <CardDescription>Manage your account security and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600 flex items-center">
                  <X className="h-3 w-3 mr-1" />
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {passwordErrors.newPassword}
                  </p>
                )}
                {!passwordErrors.newPassword && passwordForm.newPassword && (
                  <p className="text-sm text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Strong password
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {passwordErrors.confirmPassword}
                  </p>
                )}
                {!passwordErrors.confirmPassword &&
                  passwordForm.confirmPassword &&
                  passwordForm.newPassword === passwordForm.confirmPassword && (
                    <p className="text-sm text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Passwords match
                    </p>
                  )}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-2 text-gray-400" />
                  At least 8 characters long
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-2 text-gray-400" />
                  Contains uppercase and lowercase letters
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-2 text-gray-400" />
                  Contains at least one number
                </li>
              </ul>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button onClick={handlePasswordSubmit} disabled={loading.password}>
                {loading.password && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={() => handleNotificationToggle('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Alerts</Label>
                <p className="text-sm text-gray-500">Get notified about system updates</p>
              </div>
              <Switch checked={notifications.systemAlerts} onCheckedChange={() => handleNotificationToggle('systemAlerts')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exam Reminders</Label>
                <p className="text-sm text-gray-500">Receive exam schedule reminders</p>
              </div>
              <Switch checked={notifications.examReminders} onCheckedChange={() => handleNotificationToggle('examReminders')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Security Alerts</Label>
                <p className="text-sm text-gray-500">Get notified about security events</p>
              </div>
              <Switch checked={notifications.securityAlerts} onCheckedChange={() => handleNotificationToggle('securityAlerts')} />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>Customize the look and feel of your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={appearance.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleThemeChange('light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant={appearance.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleThemeChange('dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={appearance.theme === 'auto' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleThemeChange('auto')}
                  >
                    Auto
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Sidebar</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={appearance.sidebar === 'expanded' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSidebarChange('expanded')}
                  >
                    Expanded
                  </Button>
                  <Button
                    variant={appearance.sidebar === 'collapsed' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSidebarChange('collapsed')}
                  >
                    Collapsed
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Density</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={appearance.density === 'compact' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDensityChange('compact')}
                  >
                    Compact
                  </Button>
                  <Button
                    variant={appearance.density === 'normal' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDensityChange('normal')}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={appearance.density === 'spacious' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDensityChange('spacious')}
                  >
                    Spacious
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="lg:col-span-3 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription>Irreversible actions that affect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Export Your Data</h4>
                <p className="text-sm text-gray-600 mt-1">Download all your account data as a JSON file</p>
              </div>
              <Button variant="outline" onClick={handleExportData} className="shrink-0">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading.deleteAccount}
                className="shrink-0"
              >
                {loading.deleteAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




