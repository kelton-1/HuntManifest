import EditItemClient from './EditItemClient';

export function generateStaticParams() {
    return [{ id: '_placeholder' }];
}

export default function EditItemPage() {
    return <EditItemClient />;
}
