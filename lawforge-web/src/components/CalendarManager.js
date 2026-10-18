// src/components/CalendarManager.js

export const CalendarManager = {
  /**
   * Generates a standard RFC-5545 .ics content string for a single legal event.
   */
  generateICS(title, dueDateStr, description = "LAWFORGE AI Legal Action Deadline") {
    const now = new Date();
    const due = new Date(dueDateStr);
    
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
    const stamp = `${fmt(now)}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LAWFORGE AI//Legal Calendar Manager//EN',
      'BEGIN:VEVENT',
      `UID:lawforge-${Date.now()}-${Math.floor(Math.random()*1000)}@lawforge.ai`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${fmt(due)}`,
      `DTEND;VALUE=DATE:${fmt(new Date(due.getTime() + 86400000))}`, // 1 day event
      `SUMMARY:⚖️ LAWFORGE: ${title}`,
      `DESCRIPTION:${description} - Calculated strictly based on case jurisdiction guidelines.`,
      'BEGIN:VALARM',
      'TRIGGER:-P3D', // Notify 3 days before
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: 3 days until deadline: ${title}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  },

  /**
   * Generates a multi-event RFC-5545 .ics calendar containing all statutory deadlines.
   */
  generateMultiICS(deadlines = []) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
    const stamp = `${fmt(now)}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

    const events = deadlines.map((dl, i) => {
      const due = new Date(dl.dueDate);
      return [
        'BEGIN:VEVENT',
        `UID:lawforge-deadline-${i}-${Date.now()}@lawforge.ai`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${fmt(due)}`,
        `DTEND;VALUE=DATE:${fmt(new Date(due.getTime() + 86400000))}`,
        `SUMMARY:⚖️ LAWFORGE [${(dl.urgency || 'LEGAL').toUpperCase()}]: ${dl.title}`,
        `DESCRIPTION:${dl.source || 'Statutory Deadline'} - ${dl.daysRemaining} days remaining from initial computation.`,
        'BEGIN:VALARM',
        'TRIGGER:-P3D',
        'ACTION:DISPLAY',
        `DESCRIPTION:LAWFORGE Reminder: 3 days until ${dl.title}`,
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');
    }).join('\r\n');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LAWFORGE AI//Legal Calendar Sync//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      events,
      'END:VCALENDAR'
    ].join('\r\n');
  },

  /**
   * Triggers a client-side download of a .ics calendar file.
   */
  downloadICS(title, dueDateStr, description) {
    const icsContent = this.generateICS(title, dueDateStr, description);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawforge-deadline-${Date.now()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Triggers a bulk client-side download of all deadlines in a single .ics calendar.
   */
  downloadAllICS(deadlines = [], caseId = 'Case') {
    if (!deadlines || !deadlines.length) return;
    const icsContent = this.generateMultiICS(deadlines);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawforge-${caseId.replace(/[^a-zA-Z0-9_-]/g, '_')}-all-deadlines.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
