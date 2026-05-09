// Seed dataset migrated from timeline.html.
// Used to seed Postgres on first deploy AND as a fallback in dev when DB is empty.

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
  initialStatus?: string;
};

export const SEED_PROGRAMS: ProgramSeed[] = [
  // ── TIER 1 ──
  { slug:"nvidia", name:"NVIDIA Inception", org:"NVIDIA", tier:1, kind:"credits", dilution:"non", visa:"open", loc:"remote", amount:"s", rolling:true, terms:"Up to $100K DGX Cloud + GTC demo + Cap Connect", note:"Single highest-leverage credits play. Position KVASI as real-world counterpart to Cosmos sim eval." },
  { slug:"capfac", name:"Capital Factory · All Access + CDI", org:"Capital Factory", tier:1, kind:"membership", dilution:"zero", visa:"open", loc:"austin", amount:"m", rolling:true, terms:"Membership free → optional $250K credits for 1%", note:"8th-floor Center for Defense Innovation co-locates DIU + AFWERX + AAL — largest US DoD innovation node under one roof." },
  { slug:"yc-f26", name:"Y Combinator F26", org:"YC", tier:1, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"m", start_date:"2026-08-01", end_date:"2026-08-15", point_date:"2026-08-15", rolling:false, terms:"$125K @ 7% + $375K MFN; ~0.6–1% accept", note:"YC's Robotics RFS targets exactly KVASI. Co-founder gap is the #1 silent kill." },
  { slug:"nsf-pitch", name:"NSF SBIR Project Pitch", org:"NSF", tier:1, kind:"grant", dilution:"non", visa:"gated", loc:"remote", amount:"m", rolling:true, terms:"$305K Phase I → $1.25M Phase II → +$500K IIb", note:"3-week response. Robotics is named topic. Confirm 51% US-citizen ownership before applying." },
  { slug:"zfellows", name:"Z Fellows", org:"Cory Levy", tier:1, kind:"fellowship", dilution:"dilutive", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"$10K @ $1B cap + network", note:"Weekly cohorts, fast yes/no, no opportunity cost." },
  { slug:"emergent", name:"Emergent Ventures", org:"Mercatus / Tyler Cowen", tier:1, kind:"grant", dilution:"non", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"$5K–$50K, 3-question app", note:"Fast, signal-positive, non-dilutive." },
  { slug:"unshackled", name:"Unshackled Ventures", org:"Unshackled", tier:1, kind:"vc", dilution:"dilutive", visa:"open", loc:"bay", amount:"m", rolling:true, terms:"$300–750K pre-seed; employer-of-record for O-1/H1B", note:"100/100 visa filings success; robotics in portfolio (Daxo, Apolink). Most important visa runway play." },
  { slug:"msfh", name:"MS Founders Hub", org:"Microsoft", tier:1, kind:"credits", dilution:"non", visa:"open", loc:"remote", amount:"s", rolling:true, terms:"$150K–$350K Azure (with Pegasus tier)", note:"Self-serve. Stack on Inception. Pegasus tier unlocks M12 + 24-mo enterprise GTM." },
  { slug:"gcp-ai", name:"GCP AI Tier", org:"Google", tier:1, kind:"credits", dilution:"non", visa:"open", loc:"remote", amount:"m", rolling:true, terms:"$250K–$350K GCP credits", note:"Self-serve. Stack on Inception + MS." },
  { slug:"hf-lerobot", name:"Hugging Face / LeRobot", org:"Hugging Face", tier:1, kind:"credits", dilution:"zero", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"Co-branded dataset listing + blog", note:"Cheapest credibility win. Co-author with Remi Cadene's team." },
  { slug:"o1a", name:"O-1A Petition", org:"USCIS", tier:1, kind:"grant", dilution:"non", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"~15-day premium processing", note:"Blocking precondition for full-time CEO role + accelerator participation." },

  // ── TIER 2 ──
  { slug:"massrobo", name:"MassRobotics Accelerator", org:"MassRobotics", tier:2, kind:"accelerator", dilution:"zero", visa:"open", loc:"boston", amount:"s", start_date:"2026-09-01", end_date:"2026-10-31", point_date:"2026-10-31", rolling:false, terms:"$100K, no dilution, 13 weeks", note:"Cohort = your customer base. Equity-free is rare for accelerators." },
  { slug:"hax", name:"HAX (SOSV)", org:"SOSV", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"other", amount:"m", rolling:true, terms:"$250K–$550K; 6-mo Newark residency", note:"33–50% portfolio is robotics; supply-chain unmatched." },
  { slug:"skydeck", name:"Berkeley SkyDeck", org:"UC Berkeley", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"s", start_date:"2027-01-13", end_date:"2027-02-13", point_date:"2027-02-13", rolling:false, terms:"$200K @ 7.5%; BAIR network", note:"600+ investor demo day." },
  { slug:"spc", name:"SPC Founder Fellowship", org:"South Park Commons", tier:2, kind:"fellowship", dilution:"dilutive", visa:"open", loc:"bay", amount:"m", start_date:"2026-07-01", end_date:"2026-09-30", rolling:false, terms:"$400K @ 7% + guaranteed $600K next round", note:"Strongest cultural fit for research→founder pivot." },
  { slug:"neo", name:"Neo Residency", org:"Ali Partovi", tier:2, kind:"fellowship", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", start_date:"2026-06-01", end_date:"2026-08-31", point_date:"2026-08-31", rolling:false, terms:"$750K uncapped SAFE; equity scales 0.75–5%", note:"Cleanest terms in market. Partovi explicitly hunts technical founders." },
  { slug:"alchemist", name:"Alchemist Accelerator", org:"Alchemist", tier:2, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"xs", start_date:"2026-08-01", end_date:"2026-09-30", rolling:false, terms:"$25K + ~5%, 6 months", note:"Only accelerator with explicit enterprise-monetization mandate." },
  { slug:"afwerx", name:"AFWERX Open Topic", org:"USAF", tier:2, kind:"defense", dilution:"non", visa:"gated", loc:"remote", amount:"s", start_date:"2026-07-01", end_date:"2026-09-15", rolling:false, terms:"$75K Phase I → $1.7M Phase II → $1–15M STRATFI", note:"Periodic open-topic windows. Requires US-citizen majority." },
  { slug:"diu", name:"DIU CSO / MYSTIC DEPOT lineage", org:"DIU", tier:2, kind:"defense", dilution:"non", visa:"open", loc:"remote", amount:"l", rolling:true, terms:"OT contract; no citizenship gate", note:"DIU + ODNI literally solicited 'vendor-agnostic AI eval harness' — KVASI is the answer." },
  { slug:"nist-aisi", name:"NIST AI Safety Institute", org:"NIST", tier:2, kind:"grant", dilution:"non", visa:"open", loc:"remote", amount:"m", start_date:"2026-06-01", end_date:"2026-12-31", rolling:false, terms:"From $10M congressional appropriation", note:"KVASI's product *is* what NIST AISI funds." },
  { slug:"tedco", name:"TEDCO Pre-Seed Builder Fund", org:"TEDCO (MD)", tier:2, kind:"vc", dilution:"non", visa:"open", loc:"other", amount:"m", rolling:true, terms:"Up to $750K convertible note", note:"Requires Maryland entity. UMD alum status helps." },
  { slug:"newlab", name:"Newlab + NYCEDC Founder Fellowship", org:"Newlab", tier:2, kind:"membership", dilution:"non", visa:"open", loc:"nyc", amount:"s", start_date:"2026-11-01", end_date:"2026-12-31", point_date:"2026-12-31", rolling:false, terms:"Newlab membership + up to $75K NYCEDC grant", note:"84,000 sq ft pilot space; Kyber Labs (peer) is a member." },
  { slug:"icorps", name:"NSF I-Corps National Teams", org:"NSF", tier:2, kind:"grant", dilution:"non", visa:"open", loc:"remote", amount:"xs", rolling:true, terms:"$50K + 100 customer-discovery interviews", note:"Sponsor via UMD or UT Austin." },
  { slug:"darpa-aie", name:"DARPA AIE / FastTrack", org:"DARPA", tier:2, kind:"defense", dilution:"non", visa:"open", loc:"remote", amount:"l", rolling:true, terms:"~$1M up to 18 months", note:"No citizenship gate. T&E-relevant programs run frequently." },
  { slug:"iqt", name:"In-Q-Tel", org:"IQT", tier:3, kind:"vc", dilution:"dilutive", visa:"open", loc:"other", amount:"l", rolling:true, terms:"Equity + work-product contract", note:"Pursue once a USG customer exists. Anduril/Saronic precedent." },
  { slug:"converge", name:"OpenAI Converge 3", org:"OpenAI Startup Fund", tier:3, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", start_date:"2026-10-01", end_date:"2026-12-31", rolling:false, terms:"TBA; prior cohorts $1M", note:"Not yet announced. OpenAI portfolio (Figure, 1X, PI) IS KVASI's customer base." },

  // ── TIER 3 cohort ──
  { slug:"a16z", name:"a16z Speedrun SR008", org:"Andreessen Horowitz", tier:3, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"l", start_date:"2026-10-01", end_date:"2026-12-15", rolling:false, terms:"$1M @ 6%", note:"SR007 closed May 17 (missed). SR008 expected late 2026." },
  { slug:"techstars-space", name:"Techstars Space (LA)", org:"Techstars", tier:3, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"other", amount:"s", start_date:"2027-03-02", end_date:"2027-06-10", rolling:false, terms:"$220K total; $20K @ 5% + $200K MFN", note:"Defer to Spring 2027. Sponsors: USSF + JPL + Aerospace Corp + Starburst." },
  { slug:"sequoia-arc", name:"Sequoia Arc", org:"Sequoia", tier:3, kind:"accelerator", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", start_date:"2026-09-01", end_date:"2026-10-31", rolling:false, terms:"$1M – $5M", note:"Wait until 3+ paying customers. Fall '26 target." },

  // ── FUNDING-ONLY FUNDS ──
  { slug:"goose", name:"Goose Capital (Houston)", org:"Goose Capital", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"other", amount:"l", rolling:true, terms:"$500K–$2M check", note:"Breakthrough-tech thesis; WCB Robotics in portfolio." },
  { slug:"atxvp", name:"ATX Venture Partners", org:"ATX VP", tier:3, kind:"fund", dilution:"dilutive", visa:"open", loc:"austin", amount:"m", rolling:true, terms:"Pre-seed/seed checks $250K–$1M", note:"Rendezvous Robotics (defense adjacency) in portfolio." },
  { slug:"toyota", name:"Toyota Ventures Frontier", org:"Toyota Ventures", tier:2, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$1–10M strategic check", note:"Frontier Fund explicitly funds embodied AI. Strategic sleeve for Series Seed." },
  { slug:"lux", name:"Lux Capital", org:"Lux", tier:2, kind:"fund", dilution:"dilutive", visa:"open", loc:"nyc", amount:"xl", rolling:true, terms:"$1–10M lead seed; $5M+ Series A", note:"Backed Skild AI (closest customer). Top lead candidate for priced round." },
  { slug:"crv", name:"CRV", org:"CRV", tier:2, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"xl", rolling:true, terms:"$1–10M lead seed; $5M+ Series A", note:"Backed both Encord (closest pitch comp) AND Skild (closest customer). Single highest-leverage VC outreach." },
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
  { slug:"angels", name:"Angel Network · Karpathy / Abbeel / Levine / Finn / Naval / Gil", org:"Various", tier:1, kind:"fund", dilution:"dilutive", visa:"open", loc:"bay", amount:"s", rolling:true, terms:"$25K–$250K angel checks", note:"Highest signal-to-dollar for embodied AI. Each warm intro = $50–100M lead-VC pull." },
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
