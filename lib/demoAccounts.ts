import { CurrentUser } from "@/store/authStore";

/**
 * 20 demo clinic slots for the WhatsApp outreach campaign.
 * Each slot has 2 logins — Doctor (full access) + Office/Reception (limited access).
 * Share both credentials with each doctor you onboard.
 *
 * WhatsApp message template:
 * ────────────────────────────────
 * 🔑 Your MediBook Demo Access
 *
 * 👨‍⚕️ Doctor Login (full access):
 *   Email:    dr1@medibook.demo
 *   Password: MB-A3K9
 *
 * 🗂️ Reception Login (for your staff):
 *   Email:    rx1@medibook.demo
 *   Password: RX-A3K9
 *
 * 👉 [your-app-link]
 * ────────────────────────────────
 */

export interface DemoSlot {
  slot: number;
  doctor: CurrentUser & { password: string };
  office: CurrentUser & { password: string };
}

export const DEMO_SLOTS: DemoSlot[] = [
  { slot: 1,  doctor: { email: "dr1@medibook.demo",  password: "MB-A3K9", name: "Dr. Demo", role: "doctor" }, office: { email: "rx1@medibook.demo",  password: "RX-A3K9", name: "Reception", role: "office" } },
  { slot: 2,  doctor: { email: "dr2@medibook.demo",  password: "MB-X7P2", name: "Dr. Demo", role: "doctor" }, office: { email: "rx2@medibook.demo",  password: "RX-X7P2", name: "Reception", role: "office" } },
  { slot: 3,  doctor: { email: "dr3@medibook.demo",  password: "MB-B5R1", name: "Dr. Demo", role: "doctor" }, office: { email: "rx3@medibook.demo",  password: "RX-B5R1", name: "Reception", role: "office" } },
  { slot: 4,  doctor: { email: "dr4@medibook.demo",  password: "MB-T8N6", name: "Dr. Demo", role: "doctor" }, office: { email: "rx4@medibook.demo",  password: "RX-T8N6", name: "Reception", role: "office" } },
  { slot: 5,  doctor: { email: "dr5@medibook.demo",  password: "MB-C2W4", name: "Dr. Demo", role: "doctor" }, office: { email: "rx5@medibook.demo",  password: "RX-C2W4", name: "Reception", role: "office" } },
  { slot: 6,  doctor: { email: "dr6@medibook.demo",  password: "MB-Q9L3", name: "Dr. Demo", role: "doctor" }, office: { email: "rx6@medibook.demo",  password: "RX-Q9L3", name: "Reception", role: "office" } },
  { slot: 7,  doctor: { email: "dr7@medibook.demo",  password: "MB-D6Y8", name: "Dr. Demo", role: "doctor" }, office: { email: "rx7@medibook.demo",  password: "RX-D6Y8", name: "Reception", role: "office" } },
  { slot: 8,  doctor: { email: "dr8@medibook.demo",  password: "MB-H1M5", name: "Dr. Demo", role: "doctor" }, office: { email: "rx8@medibook.demo",  password: "RX-H1M5", name: "Reception", role: "office" } },
  { slot: 9,  doctor: { email: "dr9@medibook.demo",  password: "MB-K4P7", name: "Dr. Demo", role: "doctor" }, office: { email: "rx9@medibook.demo",  password: "RX-K4P7", name: "Reception", role: "office" } },
  { slot: 10, doctor: { email: "dr10@medibook.demo", password: "MB-F3Z2", name: "Dr. Demo", role: "doctor" }, office: { email: "rx10@medibook.demo", password: "RX-F3Z2", name: "Reception", role: "office" } },
  { slot: 11, doctor: { email: "dr11@medibook.demo", password: "MB-G7V9", name: "Dr. Demo", role: "doctor" }, office: { email: "rx11@medibook.demo", password: "RX-G7V9", name: "Reception", role: "office" } },
  { slot: 12, doctor: { email: "dr12@medibook.demo", password: "MB-J2S6", name: "Dr. Demo", role: "doctor" }, office: { email: "rx12@medibook.demo", password: "RX-J2S6", name: "Reception", role: "office" } },
  { slot: 13, doctor: { email: "dr13@medibook.demo", password: "MB-L5U1", name: "Dr. Demo", role: "doctor" }, office: { email: "rx13@medibook.demo", password: "RX-L5U1", name: "Reception", role: "office" } },
  { slot: 14, doctor: { email: "dr14@medibook.demo", password: "MB-N8E4", name: "Dr. Demo", role: "doctor" }, office: { email: "rx14@medibook.demo", password: "RX-N8E4", name: "Reception", role: "office" } },
  { slot: 15, doctor: { email: "dr15@medibook.demo", password: "MB-O1I7", name: "Dr. Demo", role: "doctor" }, office: { email: "rx15@medibook.demo", password: "RX-O1I7", name: "Reception", role: "office" } },
  { slot: 16, doctor: { email: "dr16@medibook.demo", password: "MB-R4W3", name: "Dr. Demo", role: "doctor" }, office: { email: "rx16@medibook.demo", password: "RX-R4W3", name: "Reception", role: "office" } },
  { slot: 17, doctor: { email: "dr17@medibook.demo", password: "MB-S9B6", name: "Dr. Demo", role: "doctor" }, office: { email: "rx17@medibook.demo", password: "RX-S9B6", name: "Reception", role: "office" } },
  { slot: 18, doctor: { email: "dr18@medibook.demo", password: "MB-V2H8", name: "Dr. Demo", role: "doctor" }, office: { email: "rx18@medibook.demo", password: "RX-V2H8", name: "Reception", role: "office" } },
  { slot: 19, doctor: { email: "dr19@medibook.demo", password: "MB-W6J5", name: "Dr. Demo", role: "doctor" }, office: { email: "rx19@medibook.demo", password: "RX-W6J5", name: "Reception", role: "office" } },
  { slot: 20, doctor: { email: "dr20@medibook.demo", password: "MB-Y3C9", name: "Dr. Demo", role: "doctor" }, office: { email: "rx20@medibook.demo", password: "RX-Y3C9", name: "Reception", role: "office" } },
];

// Flat list for spreading into MOCK_CREDENTIALS
export const DEMO_CREDENTIALS = DEMO_SLOTS.flatMap((s) => [s.doctor, s.office]);

export const TOTAL_DEMO_SLOTS = DEMO_SLOTS.length; // 20
