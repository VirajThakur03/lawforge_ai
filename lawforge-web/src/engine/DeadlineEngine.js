/**
 * LAWFORGE AI — DeadlineEngine.js
 * Calculates legal action deadlines from country + category + severity + date
 * 100% offline, zero dependencies
 */
import { DEADLINE_DB, DEFAULT_DEADLINES } from '../data/deadlines';

export const DeadlineEngine = {
  /**
   * Calculate deadlines for a given legal situation
   * @returns Array of deadline objects sorted by urgency
   */
  calculate(countryCode, category, severity = 'MEDIUM', analysisDate = new Date()) {
    const countryDB = DEADLINE_DB[countryCode];
    const entry = countryDB?.[category] || DEFAULT_DEADLINES;

    const deadlines = [];

    // Legal Notice deadline
    if (entry.notice_days > 0) {
      deadlines.push(this._buildDeadline(
        `Send Legal Notice / Demand Letter`,
        entry.notice_days,
        analysisDate,
        entry.source,
        severity
      ));
    }

    // Primary court / action deadline
    deadlines.push(this._buildDeadline(
      entry.label,
      entry.court_days,
      analysisDate,
      entry.source,
      severity
    ));

    // Appeal deadline (from today for awareness)
    if (entry.appeal_days > 0) {
      deadlines.push(this._buildDeadline(
        `File Appeal (if unfavourable outcome)`,
        entry.appeal_days,
        analysisDate,
        entry.source,
        severity,
        true // is informational
      ));
    }

    // HIGH severity adds an immediate action item
    if (severity === 'HIGH' && entry.notice_days === 0) {
      deadlines.unshift({
        title: '⚡ Contact a Lawyer IMMEDIATELY',
        dueDate: this._formatDate(new Date(analysisDate.getTime() + 24 * 60 * 60 * 1000)),
        daysRemaining: 1,
        urgency: 'critical',
        source: 'LAWFORGE Safety Protocol',
        isInfo: false,
      });
    }

    return deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  _buildDeadline(title, days, fromDate, source, severity, isInfo = false) {
    const due = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
    const daysRemaining = days;

    let urgency;
    if (daysRemaining <= 3) urgency = 'critical';
    else if (daysRemaining <= 14) urgency = 'high';
    else if (daysRemaining <= 30) urgency = 'medium';
    else urgency = 'low';

    return { title, dueDate: this._formatDate(due), daysRemaining, urgency, source, isInfo };
  },

  _formatDate(date) {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },

  /**
   * Generate .ics calendar event string for a deadline
   */
  generateICS(title, dueDateStr, summary = 'LAWFORGE Legal Deadline') {
    const now = new Date();
    const due = new Date(dueDateStr);
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
    const stamp = `${fmt(now)}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LAWFORGE AI//Legal Deadline//EN',
      'BEGIN:VEVENT',
      `UID:lawforge-${Date.now()}@lawforge.ai`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${fmt(due)}`,
      `DTEND;VALUE=DATE:${fmt(new Date(due.getTime() + 86400000))}`,
      `SUMMARY:⚖️ ${title}`,
      `DESCRIPTION:${summary}`,
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      `DESCRIPTION:7 days until: ${title}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  },

  downloadICS(title, dueDateStr) {
    const ics = this.generateICS(title, dueDateStr);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawforge-deadline-${Date.now()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
