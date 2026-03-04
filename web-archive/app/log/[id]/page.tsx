import HuntDetailClient from './HuntDetailClient';

export function generateStaticParams() {
    return [{ id: '_placeholder' }];
}

export default function HuntDetailPage() {
    return <HuntDetailClient />;
}
