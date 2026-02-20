import { Suspense } from "react";
import PlanDetailClient from "../[id]/PlanDetailClient";

export default function PlanDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        }>
            <PlanDetailClient />
        </Suspense>
    );
}
