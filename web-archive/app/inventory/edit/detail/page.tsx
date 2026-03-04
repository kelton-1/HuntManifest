import { Suspense } from "react";
import EditItemClient from "../[id]/EditItemClient";

export default function EditItemDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        }>
            <EditItemClient />
        </Suspense>
    );
}
