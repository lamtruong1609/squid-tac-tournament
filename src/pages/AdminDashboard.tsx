import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayersList } from "@/components/admin/PlayersList";
import { TournamentsList } from "@/components/admin/TournamentsList";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/admin");
      toast.error("Unauthorized access");
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/admin");
    toast.success("Logged out successfully");
  };

  if (!isAuthorized) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>

      <Tabs defaultValue="players" className="w-full">
        <TabsList>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        </TabsList>
        <TabsContent value="players">
          <PlayersList />
        </TabsContent>
        <TabsContent value="tournaments">
          <TournamentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;