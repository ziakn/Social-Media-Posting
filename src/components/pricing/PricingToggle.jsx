import { Switch } from "@/components/ui/switch";

export default function PricingToggle({ isAnnual, setIsAnnual }) {
    return (
        <div className="flex items-center justify-center gap-4 mb-16 font-sans">
            <span className={`text-sm font-bold ${!isAnnual ? "text-[#2d253b]" : "text-[#4a3d58]/60"}`}>
                Monthly
            </span>
            <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-[#5e4a7a]"
            />
            <span className={`text-sm font-bold ${isAnnual ? "text-[#2d253b]" : "text-[#4a3d58]/60"}`}>
                Yearly <span className="text-[#5e4a7a] text-xs ml-1">(Save 20%)</span>
            </span>
        </div>
    );
}
