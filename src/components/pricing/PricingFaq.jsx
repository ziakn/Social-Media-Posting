import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function PricingFaq({ faqs }) {
    return (
        <div className="max-w-3xl mx-auto mb-20 relative z-10 font-sans">
            <h2 className="text-3xl md:text-[2.5rem] font-[650] text-center text-[#2d253b] mb-12 tracking-[-0.03em]">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] rounded-[24px] px-6 overflow-hidden shadow-sm"
                    >
                        <AccordionTrigger className="text-left font-bold text-[#2d253b] hover:no-underline py-6">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-[#4a3d58] text-[1.05rem] leading-relaxed pb-6 font-[420]">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
