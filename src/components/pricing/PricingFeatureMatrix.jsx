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
        <div className="mb-32">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-display">Compare Features</h2>
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[30%]">Feature</TableHead>
                            <TableHead className="text-center w-[17%]">Free</TableHead>
                            <TableHead className="text-center w-[17%] text-primary font-bold">Creator</TableHead>
                            <TableHead className="text-center w-[17%]">Pro</TableHead>
                            <TableHead className="text-center w-[17%]">Agency</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {features.map((section, idx) => (
                            <React.Fragment key={idx}>
                                <TableRow key={idx} className="bg-gray-50/30 hover:bg-gray-50/30">
                                    <TableCell colSpan={5} className="font-bold text-gray-900 py-3 uppercase text-xs tracking-wider">
                                        {section.category}
                                    </TableCell>
                                </TableRow>
                                {section.features.map((feature, fIdx) => (
                                    <TableRow key={fIdx}>
                                        <TableCell className="font-medium text-gray-700">{feature.name}</TableCell>
                                        <TableCell className="text-center text-gray-600 font-inter">
                                            {renderValue(feature.free)}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-gray-900 font-inter">
                                            {renderValue(feature.creator)}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600 font-inter">
                                            {renderValue(feature.pro)}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600 font-inter">
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
    if (value === true) return <Check className="h-5 w-5 text-success mx-auto" />;
    if (value === false) return <Minus className="h-5 w-5 text-gray-300 mx-auto" />;
    return value;
}
