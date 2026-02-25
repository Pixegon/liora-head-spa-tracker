import { Service } from "@/lib/types";

export const SERVICES: Service[] = [
  {
    id: "liora-signature",
    name: "Liora Signature",
    tagline: "75 min · Full ritual",
    totalDurationSeconds: 4500,
    subServices: [
      { id: "scalp-consult",  name: "Scalp Consultation & Oil Application", durationSeconds: 300  },
      { id: "steam-infusion", name: "Warm Steam Infusion",                  durationSeconds: 600  },
      { id: "scalp-massage",  name: "Deep Scalp Massage",                   durationSeconds: 900  },
      { id: "neck-shoulder",  name: "Neck & Shoulder Release",              durationSeconds: 900  },
      { id: "scalp-mask",     name: "Nourishing Scalp Mask",                durationSeconds: 900  },
      { id: "cool-rinse",     name: "Cool Rinse & Blowout",                 durationSeconds: 900  },
    ],
  },
  {
    id: "express-refresh",
    name: "Express Refresh",
    tagline: "30 min · Quick reset",
    totalDurationSeconds: 1800,
    subServices: [
      { id: "express-oil",     name: "Oil Selection & Application", durationSeconds: 300 },
      { id: "express-massage", name: "Scalp Massage",               durationSeconds: 900 },
      { id: "express-rinse",   name: "Rinse & Style",               durationSeconds: 600 },
    ],
  },
  {
    id: "deep-relaxation",
    name: "Deep Relaxation",
    tagline: "60 min · Melt away tension",
    totalDurationSeconds: 3600,
    subServices: [
      { id: "relax-breathwork", name: "Grounding Breathwork",                durationSeconds: 300  },
      { id: "relax-oil",        name: "Warm Oil Infusion",                   durationSeconds: 600  },
      { id: "relax-scalp",      name: "Extended Scalp Massage",              durationSeconds: 1200 },
      { id: "relax-face",       name: "Forehead & Temple Pressure Points",   durationSeconds: 900  },
      { id: "relax-finish",     name: "Cool Mist Finish",                    durationSeconds: 600  },
    ],
  },
  {
    id: "scalp-recovery",
    name: "Scalp Recovery",
    tagline: "45 min · Targeted repair",
    totalDurationSeconds: 2700,
    subServices: [
      { id: "recovery-assess",  name: "Scalp Health Assessment",      durationSeconds: 300 },
      { id: "recovery-exfol",   name: "Gentle Exfoliation",           durationSeconds: 600 },
      { id: "recovery-serum",   name: "Active Serum Application",     durationSeconds: 600 },
      { id: "recovery-massage", name: "Stimulating Scalp Massage",    durationSeconds: 900 },
      { id: "recovery-seal",    name: "Treatment Seal & Rest",         durationSeconds: 300 },
    ],
  },
  {
    id: "premium-indulgence",
    name: "Premium Indulgence",
    tagline: "90 min · The full experience",
    totalDurationSeconds: 5400,
    subServices: [
      { id: "prem-consult", name: "Skin & Scalp Consultation",         durationSeconds: 300  },
      { id: "prem-steam",   name: "Aromatic Steam Session",            durationSeconds: 900  },
      { id: "prem-exfol",   name: "Scalp Exfoliation",                 durationSeconds: 600  },
      { id: "prem-massage", name: "Full Scalp & Crown Massage",        durationSeconds: 1200 },
      { id: "prem-mask",    name: "Premium Repair Mask",               durationSeconds: 900  },
      { id: "prem-face",    name: "Facial Pressure Point Work",        durationSeconds: 900  },
      { id: "prem-finish",  name: "Cooling Scalp Tone & Blowout",      durationSeconds: 600  },
    ],
  },
];
