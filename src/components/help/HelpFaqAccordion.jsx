import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpFaqAccordion({ questions }) {
    return (
        <div className="lg:col-span-8 relative z-10 font-sans">
            <Accordion type="single" collapsible className="w-full space-y-4">
                {questions.map((item, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-[rgba(255,255,255,0.6)] rounded-[24px] px-8 bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] shadow-sm overflow-hidden"
                    >
                        <AccordionTrigger className="text-xl font-bold text-[#2d253b] py-6 hover:no-underline hover:text-[#5e4a7a] transition-all text-left tracking-tight">
                            {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-[#4a3d58] text-[1.05rem] leading-relaxed pb-8 font-[420]">
                            {item.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
