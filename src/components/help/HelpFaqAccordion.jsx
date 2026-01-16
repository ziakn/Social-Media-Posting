import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpFaqAccordion({ questions }) {
    return (
        <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
                {questions.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-xl px-6 bg-white shadow-sm">
                        <AccordionTrigger className="text-lg font-semibold text-gray-900 py-6 hover:no-underline hover:text-primary transition-colors font-display text-left">
                            {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 text-base leading-relaxed pb-6 font-inter">
                            {item.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
