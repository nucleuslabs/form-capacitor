function pad(n) {
    return String(n).padStart(2,'0');
}

export function formatDate(d) {
    if(!d || Number.isNaN(d.valueOf())) {
        return '';
    }
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
}