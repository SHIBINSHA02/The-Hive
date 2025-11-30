// components/dashboard/ContractTable.tsx

import { Badge, Mail } from "lucide-react";


export interface Contract {
    id: string;
    clientName: string;
    contractTitle: string;
    deadline: string;
    amount: string;
    status: "urgent" | "warning" | "normal" | "overdue";
    email?: string;
}

interface ContractTableProps {
    title: string;
    contracts: Contract[];
    showEmailAction?: boolean;
    onSendEmail?: (contract: Contract) => void;
    variant?: "deadline" | "payment" | "delayed";
}

const statusStyles = {
    urgent: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    normal: "bg-success/10 text-success border-success/20",
    overdue: "bg-destructive text-destructive-foreground",
};

const statusLabels = {
    urgent: "Urgent",
    warning: "Due Soon",
    normal: "On Track",
    overdue: "Overdue",
};

export function ContractTable({
    title,
    contracts,
    showEmailAction = false,
    onSendEmail,
    variant = "deadline"
}: ContractTableProps) {
    return (
        <div className="bg-card rounded-lg shadow-card ">
            <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg text-blue-600 font-semibold font-sans">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="rounded-3xl bg-blue-50 w-full mt-10 ">
                    <thead className="bg-muted/50  text-blue-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Contract
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {variant === "payment" ? "Due Date" : "Deadline"}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Status
                            </th>
                            {showEmailAction && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Action
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border divide-blue-100 ">
                        {contracts.map((contract, index) => (
                            <tr
                                key={contract.id}
                                className=
                                    "hover:bg-muted/30 transition-colors animate-fade-in"
                                
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-foreground">
                                        {contract.clientName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-muted-foreground">
                                        {contract.contractTitle}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-foreground">
                                        {contract.deadline}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-red-700">
                                        {contract.amount}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge className="text-xs">
                                        {statusLabels[contract.status]}
                                    </Badge>
                                </td>
                                {showEmailAction && (
                                    <td className="px-6 py-4  ">
                                        <button
                                           
                                            onClick={() => onSendEmail?.(contract)}
                                            className="text-xs flex bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Mail className="h-auto w-4 mr-1 " />
                                            Send Reminder
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
