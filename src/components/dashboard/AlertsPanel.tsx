
import React, { useState, useEffect } from "react";
import { Alert, AlertsService } from "@/services/alertsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await AlertsService.getAllAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high_value_movement':
        return <DollarSign className="w-4 h-4" />;
      case 'user_activity':
        return <Activity className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const recentAlerts = alerts.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas do Sistema
          </div>
          {alerts.length > 0 && (
            <Badge variant="secondary">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta no momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-xs opacity-90 mt-1">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs opacity-75">
                        {formatDate(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
