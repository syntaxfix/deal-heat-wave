
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, KeyRound } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    setSubmitting(true);

    // The correct Supabase flow: call updateUser via auth
    // This only works if the user has a valid session from the reset link (supabase sets it for you after the magic link opens)
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message || "Failed to reset password");
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    toast.success("Password changed! Please sign in.");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your new password below. You will be redirected to login after success.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-green-600 text-center">
                Password changed! Redirecting...
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    minLength={6}
                    onChange={e => setPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirm}
                    minLength={6}
                    onChange={e => setConfirm(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Changing..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
