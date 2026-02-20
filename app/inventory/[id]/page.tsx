import InventoryItemDetailClient from './InventoryItemClient';

export function generateStaticParams() {
    return [{ id: '_placeholder' }];
}

export default function InventoryItemDetailPage() {
    return <InventoryItemDetailClient />;
}
