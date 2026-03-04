import PlanDetailClient from './PlanDetailClient';

export function generateStaticParams() {
    return [{ id: '_placeholder' }];
}

export default function PlanDetailPage() {
    return <PlanDetailClient />;
}
