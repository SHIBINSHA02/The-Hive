// components/dashboard/EmergencyEmailDialog.tsx
import { AlertTriangle,Send,X } from "lucide-react";
import { useState } from "react";

interface EmergencyEmailDialogProps {
    clientName?: string;
    clientEmail?: string;
    contractTitle?: string;
}

export function EmergencyEmailDialog({
    clientName = "",
    clientEmail = "",
    contractTitle = "",
}: EmergencyEmailDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(clientEmail);
    const [subject, setSubject] = useState(`Urgent: Action Required - ${contractTitle}`);
    const [message, setMessage] = useState(
        `Dear ${clientName || "Client"},\n\nThis is an urgent reminder regarding your contract. Please take immediate action to address this matter.\n\nBest regards`
    );
    const [sending, setSending] = useState(false);
    

    const handleSend = async () => {
        if (!email || !subject || !message) {
            console.log({
                title: "Missing Fields",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setSending(true);
        // Simulate sending email
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSending(false);
        setOpen(false);

        console.log({
            title: "Email Sent",
            description: `Emergency email sent to ${email}`,
        });
    };
        
    return (
    <>
    <button
        onClick= {() => setOpen(true) }
        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
    >
        <AlertTriangle className="h-4 w-4" />
        Emergency Email
    </button>

    {/* Modal Overlay - Only renders when isOpen is true */ }
    {
        open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                {/* Modal Content */}
                <div className="w-full max-w-[500px] rounded-lg bg-white shadow-xl animate-in fade-in zoom-in duration-200 border border-gray-200">

                    {/* Header */}
                    <div className="flex flex-col space-y-1.5 p-6 pb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-xl font-semibold leading-none tracking-tight text-blue-600">
                                <AlertTriangle className="h-5 w-5" />
                                Send Emergency Email
                            </h3>
                            {/* Close 'X' button */}
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-gray-900"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">
                            Send an urgent notification to your client. This will be marked as high priority.
                        </p>
                    </div>

                    {/* Body */}
                    <div className="grid gap-4 p-6 pt-0">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Recipient Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="client@example.com"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="subject" className="text-sm font-medium leading-none">
                                Subject
                            </label>
                            <input
                                id="subject"
                                placeholder="Email subject"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="message" className="text-sm font-medium leading-none">
                                Message
                            </label>
                            <textarea
                                id="message"
                                placeholder="Your urgent message..."
                                rows={5}
                                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 p-6 pt-0">
                        <button
                            onClick={() => setOpen(false)}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Send className="h-4 w-4" />
                            {sending ? "Sending..." : "Send Email"}
                        </button>
                    </div>

                </div>
            </div>
        )
    }
    </>
);

    
}