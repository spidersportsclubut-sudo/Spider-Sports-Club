// Static roster for the /staff/agents mission-control page.
// `id` must match the agent_name written to the agent_runs table.

export type AgentRun = {
  id: string;
  agent_name: string;
  run_at: string;
  trigger: string;
  summary: string;
  output_ref: string | null;
  needs_human: boolean;
  status: string;
};

export type AgentMeta = {
  id: string;
  name: string;
  squad: 'Growth' | 'Money' | 'Operations' | 'Governance';
  role: string;
  schedule: string;
};

export const AGENTS: AgentMeta[] = [
  { id: 'ssc-recruiter', name: 'Recruiter', squad: 'Growth', role: 'Answers parent questions, matches families to divisions, invites trial sessions.', schedule: 'On-demand' },
  { id: 'ssc-registration-closer', name: 'Registration Closer', squad: 'Growth', role: 'Nudges parents who started registration but did not finish.', schedule: 'On-demand' },
  { id: 'ssc-sponsor-hunter', name: 'Sponsor Hunter', squad: 'Growth', role: 'Finds local sponsors and drafts outreach emails.', schedule: 'Biweekly Mon 10:00 AM' },
  { id: 'ssc-hype-squad', name: 'Hype Squad', squad: 'Growth', role: 'Drafts Instagram/Facebook content: recaps, training moments.', schedule: 'Weekly Mon 9:00 AM' },
  { id: 'ssc-fee-collector', name: 'Fee Collector', squad: 'Money', role: 'Monthly dues reminders; flags late and overdue accounts.', schedule: '1st + 6th monthly, 8:00 AM' },
  { id: 'ssc-front-desk', name: 'Front Desk', squad: 'Operations', role: 'Answers parent questions on programs, fees, tryouts, cities.', schedule: 'On-demand' },
  { id: 'ssc-schedule-keeper', name: 'Schedule Keeper', squad: 'Operations', role: 'Training/game reminders; field or time changes.', schedule: 'Weekly Sun 6:00 PM' },
  { id: 'ssc-rsvp-chaser', name: 'RSVP Chaser', squad: 'Operations', role: 'Chases unanswered availability RSVPs for headcounts.', schedule: '2x weekly' },
  { id: 'ssc-tryout-tracker', name: 'Tryout Tracker', squad: 'Operations', role: 'Logs 15-point evaluation scores; tracks evaluation windows.', schedule: 'On-demand' },
  { id: 'ssc-club-journalist', name: 'Club Journalist', squad: 'Operations', role: 'Keeps city pages and club news fresh.', schedule: 'On-demand' },
  { id: 'ssc-inbox-guard', name: 'Inbox Guard', squad: 'Operations', role: 'Triages the club inbox; flags urgent, drafts replies.', schedule: 'Daily 8:30 AM' },
  { id: 'ssc-arbitration-director', name: 'Arbitration Director', squad: 'Governance', role: 'Fair dispute resolution for parents and players.', schedule: 'On-demand' },
  { id: 'ssc-oversight', name: 'Oversight', squad: 'Governance', role: 'Audits other agents\u2019 outputs before they reach parents.', schedule: 'On-demand' },
  { id: 'ssc-founders-briefing', name: "Founder's Briefing", squad: 'Governance', role: 'Daily digest to Tsatsu: money, registrations, issues.', schedule: 'Daily 7:00 AM' },
];
