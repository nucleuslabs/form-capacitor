function pad(n: number) {
    return String(n).padStart(2,'0');
}

export function formatDate(d: Date) {
    let date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
    let time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    return `${date}T${time}`
}