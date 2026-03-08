import { Participant } from '../storage/db';

export function generateCSV(listName: string, dateIso: string, participants: Participant[]) {
    const dateObj = new Date(dateIso);
    const dateStr = dateObj.toLocaleDateString();

    // CSV Header
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `List: ${listName},Date: ${dateStr}\n\n`;
    csvContent += 'Name,Present\n';

    // Rows
    participants.forEach(p => {
        // Escape quotes in names if any
        const name = `"${p.name.replace(/"/g, '""')}"`;
        const present = p.present ? 'Yes' : 'No';
        csvContent += `${name},${present}\n`;
    });

    // Export Trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${dateStr.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link);
}
