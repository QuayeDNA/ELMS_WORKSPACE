
// This file is deprecated. Use AuthSwitcher instead.
// Keeping for backward compatibility - will be removed in future versions.

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const AuthForm = () => {
  return (
    <Alert className="max-w-md mx-auto">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        This component is deprecated. Please use the new AuthSwitcher component instead.
        <br />
        <strong>Update your imports:</strong> Replace <code>AuthForm</code> with <code>AuthSwitcher</code>
      </AlertDescription>
    </Alert>
  );
};

export default AuthForm;