import { Booking, BookingStatus } from "@/types/booking";
import { format, addDays } from "date-fns";

export const STORAGE_KEY = "medibook_bookings";
export const DATE_KEY = "medibook_bookings_date";

// ─── Static pools ────────────────────────────────────────────────────────────

const PATIENTS = [
  { name: "Rahul Sharma",        email: "rahul.sharma@gmail.com",      phone: "+91 98201 11234" },
  { name: "Priya Verma",         email: "priya.verma@gmail.com",       phone: "+91 97302 22345" },
  { name: "Amit Patel",          email: "amit.patel@yahoo.com",        phone: "+91 99103 33456" },
  { name: "Sunita Iyer",         email: "sunita.iyer@hotmail.com",     phone: "+91 96204 44567" },
  { name: "Vikram Singh",        email: "vikram.singh@gmail.com",      phone: "+91 95105 55678" },
  { name: "Meera Nair",          email: "meera.nair@gmail.com",        phone: "+91 94106 66789" },
  { name: "Arjun Mehta",         email: "arjun.mehta@gmail.com",       phone: "+91 93207 77890" },
  { name: "Deepa Reddy",         email: "deepa.reddy@gmail.com",       phone: "+91 92308 88901" },
  { name: "Karan Joshi",         email: "karan.joshi@outlook.com",     phone: "+91 91409 99012" },
  { name: "Ananya Gupta",        email: "ananya.gupta@gmail.com",      phone: "+91 90510 00123" },
  { name: "Suresh Pillai",       email: "suresh.pillai@gmail.com",     phone: "+91 89511 11234" },
  { name: "Kavitha Menon",       email: "kavitha.menon@gmail.com",     phone: "+91 88512 22345" },
  { name: "Rohit Agarwal",       email: "rohit.agarwal@gmail.com",     phone: "+91 87613 33456" },
  { name: "Lakshmi Rao",         email: "lakshmi.rao@yahoo.com",       phone: "+91 86714 44567" },
  { name: "Nikhil Desai",        email: "nikhil.desai@gmail.com",      phone: "+91 85715 55678" },
  { name: "Pooja Sharma",        email: "pooja.sharma@gmail.com",      phone: "+91 84716 66789" },
  { name: "Manish Tiwari",       email: "manish.tiwari@gmail.com",     phone: "+91 83817 77890" },
  { name: "Shilpa Kulkarni",     email: "shilpa.kulkarni@gmail.com",   phone: "+91 82918 88901" },
  { name: "Gaurav Chaudhary",    email: "gaurav.chaudhary@yahoo.com",  phone: "+91 78423 33456" },
  { name: "Archana Patil",       email: "archana.patil@gmail.com",     phone: "+91 77524 44567" },
  { name: "Ravi Kumar",          email: "ravi.kumar@gmail.com",        phone: "+91 80221 11234" },
  { name: "Nandita Ghosh",       email: "nandita.ghosh@gmail.com",     phone: "+91 75726 66789" },
  { name: "Pradeep Malhotra",    email: "pradeep.m@gmail.com",         phone: "+91 74827 77890" },
  { name: "Divya Nambiar",       email: "divya.nambiar@gmail.com",     phone: "+91 81120 00123" },
  { name: "Sanjay Kapoor",       email: "sanjay.kapoor@gmail.com",     phone: "+91 65837 77890" },
] as const;

const SERVICES = [
  { name: "General Physician Consultation", price: 500,  duration: 20, notes: "Fever and cold for 3 days" },
  { name: "Thyroid Profile (T3/T4/TSH)",    price: 500,  duration: 15, notes: "Fasting sample required" },
  { name: "Physiotherapy – Initial Assessment", price: 600, duration: 45, notes: "Lower back pain, post L4-L5 disc prolapse" },
  { name: "Gynaecologist Consultation",     price: 1000, duration: 30, notes: "PCOD follow-up" },
  { name: "Complete Blood Count (CBC)",     price: 250,  duration: 15, notes: "Routine check, fasting" },
  { name: "ECG (Electrocardiogram)",        price: 200,  duration: 15, notes: "Pre-surgery cardiac clearance" },
  { name: "Cardiologist Consultation",      price: 1200, duration: 30, notes: "Palpitations and breathlessness" },
  { name: "Dermatologist Consultation",     price: 800,  duration: 20, notes: "Acne and skin pigmentation" },
  { name: "Blood Sugar (Fasting + PP)",     price: 150,  duration: 15, notes: "Diabetic patient, monthly check" },
  { name: "Orthopaedic Consultation",       price: 1000, duration: 30, notes: "Knee pain – X-rays in hand" },
  { name: "Physiotherapy – Follow-up Session", price: 400, duration: 30, notes: "3rd session – shoulder impingement" },
  { name: "Neurologist Consultation",       price: 1500, duration: 30, notes: "Frequent migraines, MRI report attached" },
  { name: "Ultrasound Abdomen & Pelvis",    price: 800,  duration: 30, notes: "Abdominal pain investigation" },
  { name: "Lipid Profile",                  price: 350,  duration: 15, notes: "12-hour fasting, cholesterol monitoring" },
  { name: "TENS / IFT Therapy",             price: 300,  duration: 30, notes: "Cervical spondylosis pain" },
  { name: "Paediatrician Consultation",     price: 700,  duration: 20, notes: "Child aged 4, recurring throat infection" },
  { name: "2D Echocardiography",            price: 1800, duration: 40, notes: "Pre-cardiac clearance for surgery" },
  { name: "Kidney Function Test (KFT)",     price: 400,  duration: 15, notes: "Pre-operative workup" },
  { name: "Dengue NS1 / IgM / IgG",        price: 600,  duration: 15, notes: "High fever for 4 days, dengue suspected" },
  { name: "Post-Surgical Rehabilitation",   price: 900,  duration: 60, notes: "Post ACL repair – 2 weeks post-op" },
] as const;

// ─── Day templates ────────────────────────────────────────────────────────────
// Each entry: [time, patientIdx, serviceIdx, explicitStatus?]
// No explicitStatus → determined automatically by time relative to now

type SlotDef = [string, number, number, BookingStatus?];

const DAY_TEMPLATES: { offset: number; slots: SlotDef[] }[] = [
  {
    offset: -2,
    slots: [
      ["08:00",  0,  1],                         // Priya → Thyroid
      ["08:30",  7,  4],                         // Deepa → CBC
      ["09:00",  2,  0],                         // Amit  → GP
      ["09:30", 17,  8],                         // Shilpa → Blood Sugar
      ["10:00",  3,  3],                         // Sunita → Gynae
      ["11:00",  4,  5],                         // Vikram → ECG
      ["14:00",  5, 10, "Cancelled"],            // Meera → Physio (no-show)
      ["15:30",  8,  6],                         // Karan → Cardio
    ],
  },
  {
    offset: -1,
    slots: [
      ["08:00", 12, 13],                         // Rohit → Lipid
      ["08:30", 16,  8],                         // Manish → Blood Sugar
      ["09:30",  9,  7],                         // Ananya → Dermato
      ["10:00", 10, 12],                         // Suresh → USG
      ["11:30", 11, 11],                         // Kavitha → Neuro
      ["14:00",  6,  9, "Cancelled"],            // Arjun → Ortho (rescheduled)
      ["15:00", 13, 14],                         // Lakshmi → TENS
      ["16:00", 14, 15],                         // Nikhil → Paediatrics
    ],
  },
  {
    offset: 0,  // TODAY — status auto-computed from current clock
    slots: [
      ["08:00",  1,  1],                         // Priya → Thyroid (fasting)
      ["08:30", 15,  4],                         // Pooja → CBC
      ["09:00",  0,  0],                         // Rahul → GP
      ["09:30", 21, 17],                         // Nandita → KFT
      ["10:00",  2,  2],                         // Amit  → Physio initial
      ["11:00",  3,  3],                         // Sunita → Gynae
      ["14:00", 22,  6],                         // Pradeep → Cardio
      ["15:00", 23, 19],                         // Divya → Post-surgical rehab
      ["16:00", 24,  5, "Pending"],              // Sanjay → ECG (pending confirm)
    ],
  },
  {
    offset: 1,
    slots: [
      ["08:00",  4,  1, "Confirmed"],            // Vikram → Thyroid
      ["09:00",  5,  0, "Confirmed"],            // Meera → GP
      ["10:00",  6,  2, "Confirmed"],            // Arjun → Physio
      ["11:00",  7,  3, "Pending"],              // Deepa → Gynae (awaiting confirm)
      ["14:30",  8,  7, "Confirmed"],            // Karan → Dermato
      ["15:30",  9,  5, "Confirmed"],            // Ananya → ECG
      ["16:00", 10, 16, "Pending"],              // Suresh → 2D Echo (pending)
    ],
  },
  {
    offset: 2,
    slots: [
      ["08:30", 11, 13, "Confirmed"],            // Kavitha → Lipid
      ["09:00", 12,  6, "Pending"],              // Rohit → Cardio (pending)
      ["10:30", 13,  9, "Confirmed"],            // Lakshmi → Ortho
      ["11:00", 18, 18, "Confirmed"],            // Gaurav → Dengue
      ["14:00", 19, 14, "Pending"],              // Archana → TENS
      ["15:00", 20, 11, "Confirmed"],            // Ravi → Neuro
    ],
  },
];

// ─── Auto-status for today's slots ──────────────────────────────────────────

function autoStatus(dateStr: string, time: string): BookingStatus {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  if (dateStr < todayStr) return "Completed";
  if (dateStr > todayStr) return "Confirmed";

  // Today: compare slot time to current clock
  const [h, m] = time.split(":").map(Number);
  const slotMins = h * 60 + m;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // Slot is more than 15 min in the past → Completed
  if (slotMins + 15 <= nowMins) return "Completed";
  return "Confirmed";
}

// ─── Core generator ──────────────────────────────────────────────────────────

export function generateBookings(): Booking[] {
  const today = new Date();
  const bookings: Booking[] = [];
  let idSeq = 2001;

  for (const { offset, slots } of DAY_TEMPLATES) {
    const dateStr = format(addDays(today, offset), "yyyy-MM-dd");

    for (const [time, pIdx, sIdx, explicitStatus] of slots) {
      const patient = PATIENTS[pIdx];
      const service = SERVICES[sIdx];
      const status: BookingStatus =
        explicitStatus ?? autoStatus(dateStr, time);

      bookings.push({
        id: `BK-${idSeq++}`,
        customerName: patient.name,
        email:        patient.email,
        phone:        patient.phone,
        service:      service.name,
        date:         dateStr,
        time,
        status,
        price:        service.price,
        notes:        service.notes,
        duration:     service.duration,
      });
    }
  }

  return bookings;
}

// ─── localStorage helpers ────────────────────────────────────────────────────

/** Load from localStorage if today's data exists; otherwise generate fresh. */
export function loadOrGenerateBookings(): Booking[] {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const storedDate = localStorage.getItem(DATE_KEY);
  if (storedDate === todayStr) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: Booking[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // corrupted — fall through to regenerate
      }
    }
  }

  // Date mismatch or missing → wipe and regenerate
  const fresh = generateBookings();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  localStorage.setItem(DATE_KEY, todayStr);
  return fresh;
}

/** Persist current bookings state (called after every mutation). */
export function persistBookings(bookings: Booking[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}
