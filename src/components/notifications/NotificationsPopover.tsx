
import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, DollarSign, Activity, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/services/alertsService";
import { formatDate } from "@/lib/utils";
import { optimizedNotificationService } from "@/services/optimizedNotificationService";

export const NotificationsPopover: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await optimizedNotificationService.getAlerts();
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
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAlerts, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'high_value_movement':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'user_activity':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
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

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  const handleRefresh = () => {
    optimizedNotificationService.clearCache();
    fetchAlerts();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notificações</h3>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <Badge variant="secondary">{alerts.length}</Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
              <p className="text-xs mt-1">Todas as operações estão em ordem!</p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !alert.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {alert.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(alert.createdAt)}
                        </span>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {alerts.length > 10 && (
          <div className="p-3 border-t bg-gray-50">
            <p className="text-xs text-center text-muted-foreground">
              Mostrando 10 de {alerts.length} notificações
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs h-auto p-0 ml-2"
                onClick={() => console.log("Ver todas as notificações")}
              >
                Ver todas
              </Button>
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
