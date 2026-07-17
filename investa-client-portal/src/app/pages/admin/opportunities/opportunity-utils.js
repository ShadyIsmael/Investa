export function lookupLabel(items, id, fallback) {
    if (fallback)
        return fallback;
    if (id === null || id === undefined || id === '')
        return '-';
    const found = items.find(item => String(item.id) === String(id));
    return found?.name || found?.value || found?.label || found?.key || String(id);
}
export function opportunityTitle(opportunity) {
    return opportunity?.title || 'Untitled opportunity';
}
export function opportunityDescription(opportunity) {
    return opportunity?.shortDescription || opportunity?.description || opportunity?.fullDescription || '';
}
export function money(value) {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value ?? 0);
}
