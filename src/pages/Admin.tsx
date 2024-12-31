import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ADMIN_PASSWORD = "admin123"; // In a real app, this should be properly secured

const Admin = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("isAdmin", "true");
      navigate("/admin/dashboard");
      toast.success("Successfully logged in as admin");
    } else {
      toast.error("Invalid password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Admin Login</h2>
          <p className="mt-2 text-muted-foreground">Enter password to access admin dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full"
          />
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </div>
    </div>
  );
};

export default Admin;