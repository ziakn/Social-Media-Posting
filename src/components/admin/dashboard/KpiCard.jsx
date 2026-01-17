import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({ title, value, icon: Icon, trend, trendValue, description, className }) {
    return (
        <Card className={cn("shadow-sm hover:shadow-md transition-shadow", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(trend || description) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend === "up" && <span className="text-green-600 font-medium">↑ {trendValue} </span>}
                        {trend === "down" && <span className="text-red-600 font-medium">↓ {trendValue} </span>}
                        {trend === "neutral" && <span className="text-yellow-600 font-medium">→ {trendValue} </span>}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
