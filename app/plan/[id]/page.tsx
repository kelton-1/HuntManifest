import PlanDetailClient from './PlanDetailClient';

// Required for static export with dynamic routes
// Return a placeholder to satisfy Next.js build validation
export function generateStaticParams() {
    return [{ id: '_placeholder' }];
}

export default function PlanDetailPage() {
    return <PlanDetailClient />;
}
