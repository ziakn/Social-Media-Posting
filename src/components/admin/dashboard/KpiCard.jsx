import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({ title, value, icon: Icon, trend, trendValue, description, className }) {
    return (
        <Card className={cn("rounded-md shadow-sm border border-border bg-card text-card-foreground hover:shadow-md transition-shadow", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-tight">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
                {(trend || description) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                        {trend === "up" && <span className="text-emerald-600 flex items-center">↑ {trendValue} </span>}
                        {trend === "down" && <span className="text-rose-600 flex items-center">↓ {trendValue} </span>}
                        {trend === "neutral" && <span className="text-amber-600 flex items-center">→ {trendValue} </span>}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
