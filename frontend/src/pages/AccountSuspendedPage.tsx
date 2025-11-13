import { useNavigate } from 'react-router-dom';
import { UserX, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';

export function AccountSuspendedPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <UserX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription>
            Your account has been temporarily suspended
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Your account access has been restricted. This could be due to:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Pending verification</li>
              <li>Administrative action</li>
              <li>Policy violation</li>
              <li>Security concerns</li>
            </ul>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-orange-900">
                  Need Help?
                </p>
                <p className="text-sm text-orange-700">
                  Contact your system administrator or email{' '}
                  <a
                    href="mailto:support@elms.com"
                    className="underline hover:text-orange-900"
                  >
                    support@elms.com
                  </a>
                  {' '}for assistance.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
