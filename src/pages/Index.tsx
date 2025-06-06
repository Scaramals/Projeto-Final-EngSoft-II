
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard page
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-xl text-muted-foreground">Redirecionando para o dashboard...</p>
    </div>
  );
};

export default Index;
