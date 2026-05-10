// Seed dataset migrated from timeline.html.
// Used to seed Postgres on first deploy AND as a fallback in dev when DB is empty.
//
// `priority` = true for incubators/accelerators/fellowships that pay ≥$500K
// guaranteed funding to each startup on acceptance. These bubble to the top
// of the default sort. Funding-only VCs are NOT priority by default — their
// "check size" is conditional on a separate diligence process, not on joining.

export type ProgramSeed = {
  slug: string;
  name: string;
  org: string;
  tier: 1 | 2 | 3;
  kind: string;
  dilution: string;
  visa: string;
  loc: string;
  amount: string | null;
  terms: string | null;
  note: string;
  start_date?: string;
  end_date?: string;
  point_date?: string;
  rolling: boolean;
  priority?: boolean; // ≥$500K guaranteed on acceptance (incubator-kind only)
  initialStatus?: string;
};

export const SEED_PROGRAMS: ProgramSeed[] = [
  // ── TIER 1 ──
  { slug:"nvidia", name:"NVIDIA Inception", org:"NVIDIA", tier:1, kind:"credits", dilution:"non", visa:"open", loc:"remote", amount:"s", rolling:true, terms:"Up to $100K DGX Cloud + GTC demo + Cap Connect", note:"Single highest-leverage credits play. Position KVASI as real-world counterpart to Cosmos sim eval." },
  { slug:"capfac", name:"Capital Factory · All Access + CDI", org:"Capital Factory", tier:1, kind:"membership", dilution:"zero", visa:"open", loc:"austin", amount:"m", rolling:true, terms:"Membership free → optional $250K credits for 1%", note:"8th-floor Center for Defense Innovation co-locates DIU + AFWERX + AAL — largest US DoD innovation node under one roof." },
  { slug:"yc-f26", name:"Y Combinator F26", org:"YC", tier:1, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"m", start_date:"2026-08-01", end_date:"2026-08-15", point_date:"2026-08-15", rolling:false, terms:"$125K @ 7% + $375K MFN; ~0.6–1% accept", note:"YC's Robotics RFS targets exactly KVASI. Co-founder gap is the #1 silent kill. Aug deadline estimated; check ycombinator.com/apply for exact date." },
  { slug:"nsf-pitch", name:"NSF SBIR Project Pitch", org:"NSF", tier:1, kind:"grant", dilution:"non", visa:"gated", loc:"remote", amount:"m", rolling:true, terms:"$305K Phase I → $1.25M Phase II → +$500K IIb", note:"3-week response. Robotics is named topic. Confirm 51% US-citizen ownership before applying." },
  { slug:"zfellows", name:"Z Fellows", org:"Cory Levy", tier:1, kind:"fellowship", dilution:"dilutive", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"$10K @ $1B cap + network", note:"Weekly cohorts, fast yes/no, no opportunity cost." },
  { slug:"emergent", name:"Emergent Ventures", org:"Mercatus / Tyler Cowen", tier:1, kind:"grant", dilution:"non", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"$5K–$50K, 3-question app", note:"Fast, signal-positive, non-dilutive." },
  { slug:"unshackled", name:"Unshackled Ventures", org:"Unshackled", tier:1, kind:"vc", dilution:"dilutive", visa:"open", loc:"bay", amount:"m", rolling:true, terms:"$300–750K pre-seed; employer-of-record for O-1/H1B", note:"100/100 visa filings success; robotics in portfolio (Daxo, Apolink). Most important visa runway play." },
  { slug:"msfh", name:"MS Founders Hub", org:"Microsoft", tier:1, kind:"credits", dilution:"non", visa:"open", loc:"remote", amount:"s", rolling:true, terms:"$150K–$350K Azure (with Pegasus tier)", note:"Self-serve. Stack on Inception. Pegasus tier unlocks M12 + 24-mo enterprise GTM." },
  { slug:"gcp-ai", name:"GCP AI Tier", org:"Google", tier:1, kind:"credits", dilution:"non", visa:"open", loc:"remote", amount:"m", rolling:true, terms:"$250K–$350K GCP credits", note:"Self-serve. Stack on Inception + MS." },
  { slug:"hf-lerobot", name:"Hugging Face / LeRobot", org:"Hugging Face", tier:1, kind:"credits", dilution:"zero", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"Co-branded dataset listing + blog", note:"Cheapest credibility win. Co-author with Remi Cadene's team." },
  { slug:"o1a", name:"O-1A Petition", org:"USCIS", tier:1, kind:"grant", dilution:"non", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"~15-day premium processing", note:"Blocking precondition for full-time CEO role + accelerator participation." },
  { slug:"angels", name:"Angel Network · Karpathy / Abbeel / Levine / Finn / Naval / Gil", org:"Various", tier:1, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"s", rolling:true, terms:"$25K–$250K angel checks", note:"Highest signal-to-dollar for embodied AI. Each warm intro = $50–100M lead-VC pull." },

  // ── TIER 2 — verified deadlines ──
  { slug:"massrobo", name:"MassRobotics Physical AI Fellowship", org:"MassRobotics + AWS + NVIDIA", tier:2, kind:"accelerator", dilution:"zero", visa:"open", loc:"boston", amount:"s", rolling:false, start_date:"2026-12-01", end_date:"2027-01-30", point_date:"2027-01-30", terms:"8-week virtual; AWS + NVIDIA credits; equity-free", note:"2026 cohort closed Jan 30, started Apr 6. Next (3rd) cohort applications expected Dec 2026 – Jan 2027. Cohort = your customer base." },
  { slug:"hax", name:"HAX (SOSV)", org:"SOSV", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"other", amount:"m", rolling:true, terms:"$250K–$550K; 6-mo Newark residency", note:"33–50% portfolio is robotics; supply-chain unmatched." },
  { slug:"skydeck", name:"Berkeley SkyDeck Batch 23", org:"UC Berkeley", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"s", start_date:"2026-08-01", end_date:"2026-09-30", point_date:"2026-09-30", rolling:false, terms:"$200K @ 7.5%; BAIR network", note:"Batch 23 applications open August 2026. Spring 2027 cohort. 600+ investor demo day." },
  { slug:"spc-fall26", name:"SPC Founder Fellowship · Fall 2026", org:"South Park Commons", tier:2, kind:"fellowship", dilution:"dilutive", visa:"open", loc:"bay", amount:"m", priority:true, start_date:"2026-07-01", end_date:"2026-08-15", point_date:"2026-08-15", rolling:false, terms:"$400K @ 7% + guaranteed $600K next round", note:"Spring 2026 closed Feb 1. Fall apps open summer 2026; bootcamp kicks off late September. Strongest cultural fit for research→founder pivot." },
  { slug:"neo", name:"Neo Residency", org:"Ali Partovi", tier:2, kind:"fellowship", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", priority:true, rolling:true, terms:"$750K uncapped SAFE + $450K compute; 3-mo SF + 2-wk Oregon bootcamp; equity scales 0.75–5%", note:"Rolling admission. Cleanest terms in market. Partovi explicitly hunts technical founders. 12–15 startups per cohort." },
  { slug:"alchemist", name:"Alchemist Accelerator", org:"Alchemist", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"xs", rolling:true, terms:"$25K–$175K + ~5%, 6 months", note:"Rolling app deadlines (next class Jan 2026 confirmed). Only accelerator with explicit enterprise-monetization mandate." },
  { slug:"afwerx", name:"AFWERX Open Topic (DAF SBIR 26.BZ Rel 1)", org:"USAF", tier:2, kind:"defense", dilution:"non", visa:"gated", loc:"remote", amount:"s", start_date:"2026-05-06", end_date:"2026-06-06", point_date:"2026-06-06", rolling:false, terms:"$75K Phase I → $1.7M Phase II → $1–15M STRATFI", note:"SBIR/STTR reauthorized April 13, 2026 (P.L. S.3971) through Sept 30, 2031. Current solicitation closes 2026-06-06. Requires US-citizen majority." },
  { slug:"diu", name:"DIU CSO / MYSTIC DEPOT lineage", org:"DIU", tier:2, kind:"defense", dilution:"non", visa:"open", loc:"remote", amount:"l", rolling:true, terms:"OT contract; no citizenship gate", note:"DIU + ODNI literally solicited 'vendor-agnostic AI eval harness' — KVASI is the answer." },
  { slug:"nist-aisi", name:"NIST AISI / SBIR 2026 Phase I", org:"NIST", tier:2, kind:"grant", dilution:"non", visa:"open", loc:"remote", amount:"s", rolling:false, terms:"Phase I ~$100K (6-mo) → Phase II up to $400K (24-mo); $10M AISI appropriation", note:"FY26 NOFO 2026-NIST-SBIR-01. KVASI's product *is* what NIST AISI funds. Check nist.gov/oam/funding-opportunities for exact close." },
  { slug:"tedco", name:"TEDCO Pre-Seed Builder Fund", org:"TEDCO (MD)", tier:2, kind:"vc", dilution:"non", visa:"open", loc:"other", amount:"m", rolling:true, terms:"Up to $750K convertible note", note:"Requires Maryland entity. UMD alum status helps." },
  { slug:"newlab-2027", name:"Newlab + NYCEDC Founder Fellowship · 2027", org:"Newlab", tier:2, kind:"membership", dilution:"non", visa:"open", loc:"nyc", amount:"s", start_date:"2026-10-01", end_date:"2026-12-31", point_date:"2026-12-31", rolling:false, terms:"Newlab membership + up to $75K NYCEDC investment", note:"2026 cohort closed Dec 31, 2025; programming started March 2026. 2027 cycle expected to open Q4 2026. 84,000 sq ft pilot space." },
  { slug:"icorps", name:"NSF I-Corps National Teams", org:"NSF", tier:2, kind:"grant", dilution:"non", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"$50K + 100 customer-discovery interviews", note:"Sponsor via UMD or UT Austin." },
  { slug:"darpa-aie", name:"DARPA AIE / I2O Office-Wide BAA", org:"DARPA", tier:2, kind:"defense", dilution:"non", visa:"open", loc:"remote", amount:"l", rolling:true, terms:"~$1M up to 18 months; office-wide BAA HR001126S0001 open Nov 28, 2025", note:"No citizenship gate. AIEs target start within 3 months of announcement. Active 2026 RFIs: Physical Intelligence in Robotics (due May 27, 2026), MATHBAC (due June 16, 2026)." },
  { slug:"toyota", name:"Toyota Ventures Frontier", org:"Toyota Ventures", tier:2, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$1–10M strategic check", note:"Frontier Fund explicitly funds embodied AI. Strategic sleeve for Series Seed." },
  { slug:"lux", name:"Lux Capital", org:"Lux", tier:2, kind:"fund", dilution:"dilutive", visa:"open", loc:"nyc", amount:"xl", rolling:true, terms:"$1–10M lead seed; $5M+ Series A; Fund IX $1.5B (Jan 2026)", note:"Backed Skild AI (closest customer). Top lead candidate for priced round." },
  { slug:"crv", name:"CRV", org:"CRV", tier:2, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$1–10M lead seed; $5M+ Series A", note:"Backed both Encord (closest pitch comp) AND Skild (closest customer). Single highest-leverage VC outreach." },

  // ── TIER 3 cohort ──
  { slug:"a16z-speedrun", name:"a16z Speedrun · SR008 (TBA)", org:"Andreessen Horowitz", tier:3, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", priority:true, rolling:false, terms:"$1M @ 6%", note:"SR007 closed May 17, 2026 (program runs Jul 27 – Oct 11, 2026; Demo Day Oct 6). SR008 not yet announced — historically opens Q4." },
  { slug:"techstars-space", name:"Techstars Space (LA) · Fall 2026", org:"Techstars", tier:3, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"other", amount:"s", start_date:"2026-03-02", end_date:"2026-06-10", point_date:"2026-06-10", rolling:false, terms:"$220K total; $20K @ 5% + $200K MFN; program Sept 14 – Dec 10, 2026", note:"APPLICATIONS OPEN NOW (Mar 2 – Jun 10, 2026). Sponsors: USSF + JPL + Aerospace Corp + Starburst. Demo Day Dec 10, 2026." },
  { slug:"sequoia-arc", name:"Sequoia Arc · Fall 2026 (TBA)", org:"Sequoia", tier:3, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", priority:true, rolling:false, terms:"$1M – $5M; Americas + Europe/UK eligible", note:"Spring 2026 closed Feb 23. Fall 2026 not yet announced — Sequoia runs bi-annual cadence; expect Aug/Sep deadline." },
  { slug:"openai-grove", name:"OpenAI Grove / Converge 3 (TBA)", org:"OpenAI Startup Fund", tier:3, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", priority:true, rolling:false, terms:"Grove: pre-idea, no $; Converge: ~$1M @ TBD terms", note:"Grove Jan 2026 cohort closed Jan 12. Converge 3 not yet announced — Converge 2 closed Jan 26, 2024; cadence ~24 months suggests early 2026 announcement window. OpenAI portfolio (Figure, 1X, PI) IS KVASI's customer base." },

  // ── NEW · Priority $500K+ INCUBATORS (US) ──
  { slug:"ai2-incubator", name:"AI2 Incubator", org:"Allen Institute for AI", tier:1, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"other", amount:"l", priority:true, rolling:true, terms:"Up to $600K @ $10M cap (SAFE, ~7% common) + $1M+ non-dilutive cloud credits", note:"Seattle-based. Strongest AI-research-pedigree incubator outside SF. Founder-friendly common-stock SAFE structure. Rolling apps." },
  { slug:"pearx-w27", name:"Pear PearX · W27", org:"Pear VC", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", priority:true, start_date:"2026-08-01", end_date:"2026-10-15", point_date:"2026-10-15", rolling:false, terms:"Up to $2M check; 12-week pre-seed program kicks off Jan 2027", note:"Robotics is a named focus area. PearX W26 already kicked off Jan 2026; S26 starts Jul 2026. W27 applications expected Aug-Oct 2026." },
  { slug:"nfx-fast", name:"NFX FAST", org:"NFX", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", priority:true, rolling:true, terms:"$150K discovery (uncapped SAFE) OR $1.5–3M pre-seed/seed @ 15% SAFE; 9-day decision", note:"Targets companies that have raised <$2M. Robotics + Defense + AI explicit thesis. Largest pre/seed fund in the world ($325M Fund VI)." },
  { slug:"ai-grant", name:"AI Grant · Batch 4", org:"Nat Friedman + Daniel Gross", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"m", rolling:false, terms:"$250K uncapped SAFE + $350K Azure + $250K partner credits (Replicate/Anthropic/Modal/OpenAI)", note:"Nat Friedman + Daniel Gross. $250K cash below $500K threshold but $850K total package + signal value. Friedman/Gross now operate NFDG; status of Batch 4 unclear post-Meta acqui-hire." },
  { slug:"greylock-edge", name:"Greylock Edge", org:"Greylock", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"Flexible: priced seed, uncapped SAFE, OR no capital + $500K AWS/GCP/Azure credits; 3-mo bespoke", note:"Pre-idea / pre-seed / seed all eligible. No fixed batch — rolling. Highly selective. $1B Fund 17 (Oct 2023)." },
  { slug:"conviction-embed", name:"Conviction Embed", org:"Conviction", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"s", rolling:false, terms:"$150K uncapped SAFE + $500K+ cloud/compute credits (AWS/Azure/OpenAI/Anthropic/Pinecone/W&B)", note:"Sarah Guo. 8-week mostly-remote with weekend in-person. Cohort-based; check conviction.com for next intake." },
  { slug:"mucker-direct", name:"Mucker Capital · Direct", org:"Mucker Capital", tier:3, kind:"vc", dilution:"dilutive", visa:"open", loc:"other", amount:"l", priority:true, rolling:true, terms:"$500K – $10M direct seed/Series A check (separate from MuckerLab $100–175K)", note:"LA-based. 20–25 portfolio companies/year. Direct check size qualifies; the lab program does not." },

  // ── NEW · Priority $500K+ PROGRAMS (Europe) ──
  { slug:"eic-accelerator", name:"EIC Accelerator", org:"European Innovation Council", tier:1, kind:"grant", dilution:"non", visa:"open", loc:"other", amount:"xl", priority:true, rolling:true, terms:"€1M–€2.5M grant + €1M–€10M equity (EIC Fund); 6 cutoffs/year (bimonthly batches); €414M 2026 budget", note:"Largest non-dilutive deep-tech program in Europe. Open + Challenges tracks. EU-incorporated entity required. Robotics + AI both eligible. 4–6 week first-stage decision." },
  { slug:"seedcamp", name:"Seedcamp", org:"Seedcamp", tier:3, kind:"vc", dilution:"dilutive", visa:"open", loc:"other", amount:"m", rolling:true, terms:"€300K–€1.4M pre-seed/seed lead; rolling", note:"Europe's longest-running seed fund. Fund VII active. UK/EU founders preferred." },
  { slug:"ef-london", name:"Entrepreneur First · London Spring 27", org:"Entrepreneur First", tier:3, kind:"fellowship", dilution:"dilutive", visa:"open", loc:"other", amount:"s", rolling:false, terms:"£6K Talent Investment + up to $250K founder-friendly SAFE post-IC; 12-wk London FORM + 12-wk SF LAUNCH", note:"Solo-founder matching. Sub-$500K threshold but high signal for technical-founder pivots. Spring 2026 program active; Spring 2027 apps open ~Q3 2026." },

  // ── NEW · Priority $500K+ PROGRAMS (India / SEA) ──
  { slug:"peak-xv-surge", name:"Peak XV Surge", org:"Peak XV (ex-Sequoia India)", tier:1, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"other", amount:"xl", priority:true, rolling:true, terms:"Up to $3M seed + 16-week company-building program; 2 cohorts/year; ~10–20 companies per cohort", note:"India + SEA focus. Surge 11 just completed. Rolling apps; 6–8 week response. ~4,800 applications evaluated per cohort. AI/robotics eligible." },
  { slug:"accel-atoms-ai", name:"Accel Atoms · AI Cohort 2027", org:"Accel + Google AI Futures Fund", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"other", amount:"xl", priority:true, rolling:false, start_date:"2027-01-01", end_date:"2027-01-26", point_date:"2027-01-26", terms:"Up to $2M co-invest (Accel + Google) per startup", note:"AI Cohort 2026 closed Jan 26, 2026 (program started Feb). Annual cadence — expect 2027 cohort apps to close ~Jan 26, 2027. Indian / Indian-origin AI founders. 5–10 per cohort." },
  { slug:"lightspeed-ascends", name:"Lightspeed India Ascends 2027", org:"Lightspeed", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"other", amount:"xl", priority:true, rolling:false, start_date:"2027-01-01", end_date:"2027-02-15", point_date:"2027-02-15", terms:"$200K–$3M ticket + ~$500K non-dilutive credits (Anthropic/Groq/Google Cloud/AWS)", note:"Under-25 Indian founders building R&D-first deep tech (AI, robotics, space, defense, biotech). 2026 cohort already selected (Sapien Labs, Eyecandy Robotics, Sentience, Celestial). 2027 cycle estimated Q1." },
  { slug:"antler-india-ai", name:"Antler India · AI Residency", org:"Antler India", tier:3, kind:"fellowship", dilution:"dilutive", visa:"open", loc:"other", amount:"m", rolling:true, terms:"₹4 Cr (~$480K) for equity; 3-week IC decision; 45-day cycle, quarterly cohorts", note:"Just below $500K threshold but priority-adjacent. Day-zero solo-founder team-formation. Doubled checks in 2026." },
  { slug:"blume-founders", name:"Blume Founders Fund", org:"Blume Ventures", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"other", amount:"xs", rolling:true, terms:"$25K – $100K (1–2% carve-out from core fund)", note:"Network-side small-check program tied to Blume Fund IV ($250M). India seed/pre-Series A leader. Robotics + AI named verticals." },

  // ── EXISTING · TIER 3 FUNDING-ONLY FUNDS ──
  { slug:"goose", name:"Goose Capital (Houston)", org:"Goose Capital", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"other", amount:"l", rolling:true, terms:"$500K–$2M check", note:"Breakthrough-tech thesis; WCB Robotics in portfolio." },
  { slug:"atxvp", name:"ATX Venture Partners", org:"ATX VP", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"austin", amount:"m", rolling:true, terms:"Pre-seed/seed checks $250K–$1M", note:"Rendezvous Robotics (defense adjacency) in portfolio." },
  { slug:"founders-fund", name:"Founders Fund", org:"Founders Fund", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$2M+ seed; FF Science vehicle", note:"Anduril, Palantir, SpaceX-adjacent thesis. Trae Stephens for defense angle." },
  { slug:"a16z-am-dyn", name:"a16z American Dynamism", org:"Andreessen Horowitz", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$2M+ seed; $10M+ Series A", note:"Katherine Boyle / David Ulevitch. Defense + national-priority robotics." },
  { slug:"shield-cap", name:"Shield Capital", org:"Shield Capital", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$2–15M defense-tech checks", note:"Phil Bronner. Pure-play national-security fund." },
  { slug:"frontier-fund", name:"America's Frontier Fund", org:"AFF", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"other", amount:"xl", rolling:true, terms:"$5M+ critical-tech checks", note:"Eric Schmidt-backed. Critical and emerging tech mandate." },
  { slug:"8vc", name:"8VC", org:"8VC", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"austin", amount:"xl", rolling:true, terms:"$2–10M lead seed/A", note:"Joe Lonsdale (Austin). Backed Anduril, Saronic, Palantir alumni." },
  { slug:"khosla", name:"Khosla Ventures", org:"Khosla", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$1–5M seed; bigger Series A", note:"Backed Skild AI. Direct robotics thesis at frontier-model layer." },
  { slug:"eclipse", name:"Eclipse Ventures", org:"Eclipse", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3M+ seed; specialist hardware/industrial", note:"Lior Susan. Bright Machines, Owl, Ouster portfolio." },
  { slug:"schematic", name:"Schematic Ventures", org:"Schematic", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$500K–$2M pre-seed/seed lead", note:"Julian Counihan. Supply chain + robotics + autonomous systems thesis." },
  { slug:"conviction", name:"Conviction Partners", org:"Conviction", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$1–10M, AI infra focus", note:"Sarah Guo. AI-infra thesis (Mistral, Sierra)." },
  { slug:"radical", name:"Radical Ventures", org:"Radical", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"other", amount:"xl", rolling:true, terms:"$2–10M seed/A in AI", note:"Jordan Jacobs (Toronto). Cohere, Waabi, Twelve Labs." },
  { slug:"innovation-endeavors", name:"Innovation Endeavors", org:"Innovation Endeavors", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$2–10M seed/A", note:"Eric Schmidt's fund. Backed Saildrone, Anyscale." },
  { slug:"dcvc", name:"DCVC (Data Collective)", org:"DCVC", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3M+ seed lead, deep-tech focus", note:"Matt Ocko. Industrial-AI thesis: Anduril (early), Capella Space." },
  { slug:"bmw-i", name:"BMW i Ventures", org:"BMW", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$1–5M strategic check", note:"Mobility + robotics + AV strategic." },
  { slug:"trucks-vc", name:"Trucks Venture Capital", org:"Trucks VC", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$500K–$2M seed", note:"Reilly Brennan. Mobility + transportation autonomy." },
  { slug:"day-one", name:"Day One Ventures · First Check", org:"Day One", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"s", rolling:true, terms:"$100K + PR/marketing support", note:"Masha Bucher. Quarterly First Check program." },
  { slug:"liquid2", name:"Liquid 2 Ventures", org:"Liquid 2", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$500K–$2M pre-seed lead", note:"Joe Montana. High check-to-decision speed." },
  { slug:"susa", name:"Susa Ventures", org:"Susa", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$1–3M seed lead", note:"Eva Ho / Leo Polovets. Data/infra thesis." },
  { slug:"floodgate", name:"Floodgate", org:"Floodgate", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$1–3M pre-seed/seed lead", note:"Mike Maples Jr. 'Thunder Lizards' philosophy." },
  { slug:"slow", name:"Slow Ventures", org:"Slow", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$500K–$3M seed", note:"Sam Lessin. Generalist; strong on contrarian deep-tech bets." },
  { slug:"hyphen", name:"Hyphen Capital", org:"Hyphen", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$100K–$4.5M, AAPI founder lead", note:"Backs Asian-American founders." },
  { slug:"gold-house", name:"Gold House Ventures", org:"Gold House", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"m", rolling:true, terms:"$30M fund; $250K–$2M checks", note:"AAPI founder fund; LPs include NEA, Bain, Lightspeed." },
  { slug:"initialized", name:"Initialized Capital", org:"Initialized", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3–8M lead seed", note:"Garry Tan's old fund. Strong YC alumni network." },
  { slug:"general-cat", name:"General Catalyst", org:"General Catalyst", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3M+ seed, $10M+ Series A", note:"Hemant Taneja. Strong defense + applied-AI thesis." },
  { slug:"bvp", name:"Bessemer Venture Partners", org:"BVP", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$2M+ seed, multi-stage", note:"Receptive to research-spinout narratives. PhD-led data." },
  { slug:"sequoia", name:"Sequoia Capital (direct)", org:"Sequoia", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3–10M seed; multi-stage", note:"Backed Physical Intelligence (KVASI's customer)." },
  { slug:"nea", name:"NEA", org:"NEA", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3–10M seed; large Series A+", note:"Aaron Jacobson. Backed Diligent Robotics (Austin)." },
  { slug:"lightspeed", name:"Lightspeed Venture Partners", org:"Lightspeed", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3M+ seed, multi-stage", note:"Backed Saronic (Austin defense robotics)." },
  { slug:"greylock", name:"Greylock", org:"Greylock", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3M+ seed, Series A+", note:"Reid Hoffman / Saam Motamedi. AI infra & dev-tools network." },
  { slug:"spark", name:"Spark Capital", org:"Spark", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$3M+ seed; multi-stage", note:"Nabeel Hyatt. Backed Cresta, Discord." },
  { slug:"felicis", name:"Felicis Ventures", org:"Felicis", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$2–6M seed/A", note:"Aydin Senkut. Backed Adept, Runway, Notion." },
  { slug:"tribe", name:"Tribe Capital", org:"Tribe", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", rolling:true, terms:"$1–5M seed; data-driven thesis", note:"Arjun Sethi. Backed Bolt, Slack early." },
  { slug:"iqt", name:"In-Q-Tel", org:"IQT", tier:3, kind:"vc", dilution:"dilutive", visa:"open", loc:"other", amount:"l", rolling:true, terms:"Equity + work-product contract", note:"Pursue once a USG customer exists. Anduril/Saronic precedent." },
];

// Slugs that previously existed but were renamed/superseded.
// Used by the seed/upsert route to delete stale rows.
export const RETIRED_SLUGS: string[] = [
  "spc",        // → spc-fall26
  "newlab",     // → newlab-2027
  "a16z",       // → a16z-speedrun
  "converge",   // → openai-grove
];

export const STATUSES = [
  { value: "discovered",   label: "Discovered",   tone: "warm" },
  { value: "researching",  label: "Researching",  tone: "warm" },
  { value: "preparing",    label: "Preparing",    tone: "info" },
  { value: "applied",      label: "Applied",      tone: "accent" },
  { value: "interviewing", label: "Interviewing", tone: "accent" },
  { value: "accepted",     label: "Accepted",     tone: "success" },
  { value: "rejected",     label: "Rejected",     tone: "error" },
  { value: "deferred",     label: "Deferred",     tone: "warning" },
  { value: "passed",       label: "Passed",       tone: "warm" },
] as const;

export const KINDS = [
  { value: "accelerator", label: "Accelerator" },
  { value: "fellowship",  label: "Fellowship" },
  { value: "grant",       label: "Grant" },
  { value: "vc",          label: "VC / Pre-seed" },
  { value: "fund",        label: "Funding-only fund" },
  { value: "credits",     label: "Credits" },
  { value: "defense",     label: "DoD / Defense" },
  { value: "membership",  label: "Membership" },
] as const;

export const AMOUNTS = [
  { value: "xs", label: "≤ $50K" },
  { value: "s",  label: "$50K – $250K" },
  { value: "m",  label: "$250K – $750K" },
  { value: "l",  label: "$750K – $2M" },
  { value: "xl", label: "$2M+" },
] as const;

export const LOCATIONS = [
  { value: "austin", label: "Austin" },
  { value: "bay",    label: "Bay Area" },
  { value: "boston", label: "Boston" },
  { value: "nyc",    label: "NYC" },
  { value: "remote", label: "Remote" },
  { value: "other",  label: "Other" },
] as const;
