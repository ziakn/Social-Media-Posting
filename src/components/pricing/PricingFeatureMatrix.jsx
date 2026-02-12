import React from "react";
import { Check, Minus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function PricingFeatureMatrix({ features }) {
    return (
        <div className="mb-32 relative z-10 font-sans">
            <h2 className="text-3xl md:text-[2.5rem] font-[650] text-center text-[#2d253b] mb-12 tracking-[-0.03em]">Compare Features</h2>
            <div className="rounded-[32px] border border-[rgba(255,255,255,0.6)] overflow-hidden bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] shadow-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#5e4a7a]/5 hover:bg-[#5e4a7a]/5 border-[rgba(255,255,255,0.2)]">
                            <TableHead className="w-[30%] text-[#2d253b] font-bold py-6">Feature</TableHead>
                            <TableHead className="text-center w-[17%] text-[#4a3d58] font-bold">Free</TableHead>
                            <TableHead className="text-center w-[17%] text-[#5e4a7a] font-extrabold uppercase tracking-widest text-[0.7rem]">Creator</TableHead>
                            <TableHead className="text-center w-[17%] text-[#4a3d58] font-bold">Pro</TableHead>
                            <TableHead className="text-center w-[17%] text-[#4a3d58] font-bold">Agency</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {features.map((section, idx) => (
                            <React.Fragment key={idx}>
                                <TableRow key={idx} className="bg-[#5e4a7a]/5 hover:bg-[#5e4a7a]/5 border-[rgba(255,255,255,0.2)]">
                                    <TableCell colSpan={5} className="font-bold text-[#5e4a7a] py-4 uppercase text-[0.7rem] tracking-[0.15em]">
                                        {section.category}
                                    </TableCell>
                                </TableRow>
                                {section.features.map((feature, fIdx) => (
                                    <TableRow key={fIdx} className="border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] transition-colors">
                                        <TableCell className="font-medium text-[#2d253b] py-4">{feature.name}</TableCell>
                                        <TableCell className="text-center text-[#4a3d58]">
                                            {renderValue(feature.free)}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-[#5e4a7a]">
                                            {renderValue(feature.creator)}
                                        </TableCell>
                                        <TableCell className="text-center text-[#4a3d58]">
                                            {renderValue(feature.pro)}
                                        </TableCell>
                                        <TableCell className="text-center text-[#4a3d58]">
                                            {renderValue(feature.agency)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function renderValue(value) {
    if (value === true) return <Check className="h-5 w-5 text-[#5e4a7a] mx-auto stroke-[3px]" />;
    if (value === false) return <Minus className="h-5 w-5 text-[#4a3d58]/20 mx-auto" />;
    return <span className="font-bold text-[0.95rem]">{value}</span>;
}
