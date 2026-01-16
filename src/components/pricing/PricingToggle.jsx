import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function PricingToggle({ isAnnual, setIsAnnual }) {
    return (
        <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-semibold ${!isAnnual ? "text-gray-900" : "text-gray-500"}`}>
                Monthly
            </span>
            <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-semibold ${isAnnual ? "text-gray-900" : "text-gray-500"}`}>
                Yearly <span className="text-success text-xs ml-1">(Save 20%)</span>
            </span>
        </div>
    );
}
