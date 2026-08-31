export type HomeSystemSlug =
  | 'refrigerator'
  | 'freezer'
  | 'clothes-washer'
  | 'electric-dryer'
  | 'dishwasher'
  | 'electric-water-heater'
  | 'room-air-conditioner'
  | 'dehumidifier';

export interface SystemSource {
  label: string;
  url: string;
  publisher: string;
}

export interface CareTask {
  title: string;
  cadence: string;
  detail: string;
}

export interface HomeSystem {
  slug: HomeSystemSlug;
  name: string;
  shortName: string;
  category: string;
  title: string;
  description: string;
  summary: string;
  energyInput: string;
  energyInputHelp: string;
  labelNote: string;
  accountingNote?: string;
  careTasks: CareTask[];
  redFlags: string[];
  sources: SystemSource[];
  reviewedAt: string;
}

export const HOME_SYSTEMS: HomeSystem[] = [
  {
    slug: 'refrigerator',
    name: 'Refrigerator',
    shortName: 'Refrigerator',
    category: 'Kitchen',
    title: 'Refrigerator running cost and care guide',
    description: 'Calculate refrigerator electricity cost, review safe maintenance, and recognize situations that need professional service.',
    summary: 'Start with the exact model’s annual kWh—not a generic wattage. Then use your own electricity rate and keep food-safety decisions separate from cost decisions.',
    energyInput: 'Estimated Yearly Electricity Use (kWh/year)',
    energyInputHelp: 'Find this on the exact model’s yellow EnergyGuide label or product documentation.',
    labelNote: 'EnergyGuide is a standardized comparison estimate. It is not a promise of what your household will use or pay.',
    careTasks: [
      { title: 'Keep the interior clean', cadence: 'When spills happen', detail: 'Wipe spills promptly and follow the appliance manual for food-safe cleaning.' },
      { title: 'Verify food-safe temperature', cadence: 'Routinely and whenever performance is in doubt', detail: 'Use an appliance thermometer and keep the refrigerator at 40°F or below.' },
      { title: 'Clean accessible condenser areas', cadence: 'Several times a year when the manual permits', detail: 'Vacuum only a grille or coils the manufacturer identifies as homeowner-accessible.' },
      { title: 'Inspect the door gasket', cadence: 'When soiled, loose, or visibly damaged', detail: 'Clean the seal as directed and replace a gasket that no longer seals.' },
    ],
    redFlags: ['The compartment cannot stay at 40°F or below.', 'Smoke, burning odor, sparking, shock, or repeated breaker trips.', 'A suspected refrigerant leak, compressor failure, or sealed-system problem.'],
    sources: [
      { label: 'Refrigerator and freezer care', url: 'https://extension.umn.edu/sanitation-and-preventing-illness/clean-kitchen-required-food-safety', publisher: 'University of Minnesota Extension' },
      { label: 'ENERGY STAR refrigerators', url: 'https://www.energystar.gov/products/refrigerators', publisher: 'ENERGY STAR' },
      { label: 'Refrigerant technician requirements', url: 'https://www.epa.gov/section608/section-608-technician-certification', publisher: 'U.S. EPA' },
    ],
    reviewedAt: '2026-08-31',
  },
  {
    slug: 'freezer',
    name: 'Freezer',
    shortName: 'Freezer',
    category: 'Kitchen',
    title: 'Freezer running cost and care guide',
    description: 'Estimate freezer electricity cost, check safe temperature guidance, and understand manual-defrost precautions.',
    summary: 'Use the annual kWh for the exact freezer model. Temperature and food condition are separate from the electricity-cost estimate.',
    energyInput: 'Estimated Yearly Electricity Use (kWh/year)',
    energyInputHelp: 'Use the exact model’s EnergyGuide label rather than a generic freezer estimate.',
    labelNote: 'The label uses standardized test assumptions and a national reference price. Replace the price with your own rate.',
    careTasks: [
      { title: 'Verify freezer temperature', cadence: 'Routinely and after an outage or performance concern', detail: 'Use an appliance thermometer and keep the freezer at 0°F or below.' },
      { title: 'Clean accessible condenser areas', cadence: 'Several times a year when the manual permits', detail: 'Only clean coils or grilles identified as homeowner-accessible.' },
      { title: 'Inspect the gasket', cadence: 'When dirty, loose, or damaged', detail: 'Clean and inspect the door seal; there is no universal replacement interval.' },
      { title: 'Defrost manual-defrost models', cadence: 'When buildup occurs, following the exact manual', detail: 'Never use an electrical heating device, ice pick, knife, or other sharp object.' },
    ],
    redFlags: ['The freezer cannot maintain 0°F or below.', 'Smoke, burning odor, damaged wiring, or repeated breaker trips.', 'A suspected compressor, internal electrical, or refrigerant-system problem.'],
    sources: [
      { label: 'Refrigeration and defrost safety', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/refrigeration', publisher: 'USDA FSIS' },
      { label: 'Recommended freezer temperature', url: 'https://ask.fsis.usda.gov/article/What-is-the-right-temperature-for-the-freezer', publisher: 'USDA FSIS' },
      { label: 'Refrigerator and freezer care', url: 'https://extension.umn.edu/sanitation-and-preventing-illness/clean-kitchen-required-food-safety', publisher: 'University of Minnesota Extension' },
    ],
    reviewedAt: '2026-08-31',
  },
  {
    slug: 'clothes-washer',
    name: 'Clothes Washer',
    shortName: 'Washer',
    category: 'Laundry',
    title: 'Clothes washer running cost and care guide',
    description: 'Estimate washer electricity cost, avoid hot-water double counting, and build a leak-aware maintenance routine.',
    summary: 'The standardized washer energy figure includes machine electricity and modeled hot-water energy. It excludes clothes-drying energy.',
    energyInput: 'Estimated Yearly Electricity Use (kWh/year)',
    energyInputHelp: 'Use the exact washer’s EnergyGuide label. Optional water use is available in many ENERGY STAR product records.',
    labelNote: 'Washer label use is standardized. Actual cycle choice, water temperature, load size, and household use can change the result.',
    accountingNote: 'Do not add washer annual kWh unchanged to a complete water-heater annual estimate: the washer figure already includes modeled hot-water energy.',
    careTasks: [
      { title: 'Air a front-loader after use', cadence: 'For 1–2 hours after each load when child access is controlled', detail: 'Leave the door ajar only where it cannot create a child-safety risk.' },
      { title: 'Inspect hoses and connections', cadence: 'Every six months', detail: 'Look for cracks, kinks, blisters, loose connections, and leakage.' },
      { title: 'Run the model’s cleaning routine', cadence: 'At the exact manual or indicator cadence', detail: 'Some manufacturers recommend monthly cleaning, but the correct routine is model-specific.' },
      { title: 'Check the floor and shutoff area', cadence: 'Regularly', detail: 'Look for visible leakage around valves, hoses, and the floor.' },
    ],
    redFlags: ['An active leak, bulged hose, or water reaching an electrical connection.', 'Smoke, burning odor, shock, or repeated breaker trips.', 'A problem requiring panel removal, wiring, motor, pump, or internal leak repair.'],
    sources: [
      { label: 'ENERGY STAR clothes washers', url: 'https://www.energystar.gov/products/clothes_washers', publisher: 'ENERGY STAR' },
      { label: 'Home water maintenance', url: 'https://www.epa.gov/watersense/home-maintenance', publisher: 'U.S. EPA WaterSense' },
      { label: 'DOE clothes-washer test procedure', url: 'https://www.energy.gov/sites/default/files/2021-08/cw-tp-nopr_0.pdf', publisher: 'U.S. Department of Energy' },
    ],
    reviewedAt: '2026-08-31',
  },
  {
    slug: 'electric-dryer',
    name: 'Electric Clothes Dryer',
    shortName: 'Electric Dryer',
    category: 'Laundry',
    title: 'Electric dryer running cost and lint-safety guide',
    description: 'Calculate electric dryer cost, distinguish vented from ventless care, and review lint-related safety tasks.',
    summary: 'Dryers do not carry the FTC EnergyGuide label. Use exact-model annual kWh from ENERGY STAR Product Finder when available.',
    energyInput: 'Estimated Annual Energy Use (kWh/year)',
    energyInputHelp: 'Use the exact model’s ENERGY STAR Product Finder record when available; the standardized estimate assumes 283 cycles per year.',
    labelNote: 'Combined Energy Factor (CEF) is an efficiency ratio, not annual kWh. Do not enter CEF as energy use.',
    careTasks: [
      { title: 'Clean the lint filter', cadence: 'Before or after every load', detail: 'A blocked screen reduces airflow and increases drying time.' },
      { title: 'Brush-clean the lint screen', cadence: 'At least every six months, or sooner if clogged', detail: 'Use a nylon brush and follow the model manual.' },
      { title: 'Check the exterior exhaust', cadence: 'Regularly while the dryer runs', detail: 'Confirm the exterior flap opens and airflow is not visibly obstructed.' },
      { title: 'Clean a vented dryer duct', cadence: 'At least yearly', detail: 'Use qualified service for concealed, long, inaccessible, crushed, or persistently restricted ducts.' },
    ],
    redFlags: ['Increasing dry time, unusual heat, scorch marks, smoke, or a burning odor.', 'Crushed or disconnected ducting, or a flap that does not open.', 'Any internal 240-volt, chassis, motor, or wiring work.'],
    sources: [
      { label: 'Certified clothes-dryer data', url: 'https://www.energystar.gov/productfinder/product/certified-clothes-dryers/results', publisher: 'ENERGY STAR' },
      { label: 'Clothes-dryer efficiency criteria', url: 'https://www.energystar.gov/products/clothes_dryers/key_product_criteria', publisher: 'ENERGY STAR' },
      { label: 'Dryer fire report', url: 'https://www.usfa.fema.gov/downloads/pdf/statistics/v13i7.pdf', publisher: 'U.S. Fire Administration' },
    ],
    reviewedAt: '2026-08-31',
  },
  {
    slug: 'dishwasher',
    name: 'Dishwasher',
    shortName: 'Dishwasher',
    category: 'Kitchen',
    title: 'Dishwasher running cost and care guide',
    description: 'Estimate dishwasher electricity cost, understand hot-water accounting, and follow model-specific filter and leak checks.',
    summary: 'The standardized annual kWh includes modeled hot-water energy supplied by an electric-resistance water heater.',
    energyInput: 'Estimated Yearly Electricity Use (kWh/year)',
    energyInputHelp: 'Use the exact dishwasher’s EnergyGuide label; gallons per cycle may be useful as a separate water input.',
    labelNote: 'Cycle choice, water-heating system, household use, and utility rates can make actual cost differ from the label.',
    accountingNote: 'Do not add dishwasher annual kWh unchanged to a complete water-heater annual estimate, because its standardized figure already includes modeled hot-water energy.',
    careTasks: [
      { title: 'Scrape rather than pre-rinse', cadence: 'Before each load', detail: 'Remove food scraps without routinely running dishes under the tap.' },
      { title: 'Inspect visible connections and floor', cadence: 'Regularly', detail: 'Look for moisture at accessible supply connections, the valve, and nearby floor.' },
      { title: 'Clean a removable filter', cadence: 'Only at the exact manual’s cadence', detail: 'Not every dishwasher uses the same filter design.' },
      { title: 'Check accessible spray openings and gasket', cadence: 'As the manual permits', detail: 'Avoid claiming a universal monthly cleaning schedule.' },
    ],
    redFlags: ['Water reaching electrical parts or an active under-unit leak.', 'Smoke, burning odor, or recurring breaker trips.', 'Heating-element, pump, wiring, or under-unit repair.'],
    sources: [
      { label: 'Dishwasher and home water guidance', url: 'https://www.epa.gov/watersense/home-maintenance', publisher: 'U.S. EPA WaterSense' },
      { label: 'DOE dishwasher assumptions', url: 'https://www.energy.gov/cmei/femp/purchasing-energy-efficient-residential-dishwashers', publisher: 'U.S. Department of Energy' },
      { label: 'DOE dishwasher test procedure', url: 'https://www.energy.gov/sites/default/files/2022-12/dishwashers%20TP%20FR.pdf', publisher: 'U.S. Department of Energy' },
    ],
    reviewedAt: '2026-08-31',
  },
  {
    slug: 'electric-water-heater',
    name: 'Electric Water Heater',
    shortName: 'Water Heater',
    category: 'Water',
    title: 'Electric water-heater cost and care guide',
    description: 'Estimate electric water-heater cost, distinguish major technologies, and understand professional maintenance boundaries.',
    summary: 'Capture the technology first: resistance storage, heat pump, and tankless units have different behavior and maintenance needs.',
    energyInput: 'Estimated Yearly Energy Use (kWh/year)',
    energyInputHelp: 'Use the EnergyGuide label for the exact model. UEF and first-hour rating are comparison or sizing metrics, not annual kWh.',
    labelNote: 'DOE’s standardized annual figure assumes 20,075 gallons of hot water per year. Actual household demand may be very different.',
    careTasks: [
      { title: 'Inspect the visible area', cadence: 'Regularly', detail: 'Look for leakage, corrosion, scorching, aged gaskets, and loose visible connections without opening energized covers.' },
      { title: 'Schedule full-system service', cadence: 'At least annually', detail: 'EPA WaterSense presents professional service as the safest complete check.' },
      { title: 'Evaluate tank flushing', cadence: 'Yearly only when the exact manual supports it', detail: 'Because water can be extremely hot and the unit must be isolated safely, use a professional if you are not equipped to do this.' },
      { title: 'Check the relief valve', cadence: 'At least yearly by a qualified professional', detail: 'Never cap, plug, or attempt to repair a temperature-and-pressure relief valve.' },
    ],
    redFlags: ['A tank leak, active relief-valve discharge, steam, or abnormally hot water.', 'Scorching, burning odor, shock, or repeated breaker trips.', 'Any element, thermostat, 240-volt, anode, refrigerant, or pressure-valve repair.'],
    sources: [
      { label: 'Hot-water maintenance', url: 'https://www.epa.gov/watersense/home-maintenance', publisher: 'U.S. EPA WaterSense' },
      { label: 'Residential water-heater guidance', url: 'https://www.energy.gov/cmei/femp/purchasing-energy-efficient-residential-water-heaters', publisher: 'U.S. Department of Energy' },
      { label: 'Hot-water scald guidance', url: 'https://www.cpsc.gov/s3fs-public/5098.pdf', publisher: 'U.S. Consumer Product Safety Commission' },
    ],
    reviewedAt: '2026-08-31',
  },
  {
    slug: 'room-air-conditioner',
    name: 'Room Air Conditioner',
    shortName: 'Room AC',
    category: 'Cooling',
    title: 'Room air-conditioner cost and care guide',
    description: 'Estimate room AC electricity cost, use model-specific annual energy data, and review seasonal filter and seal care.',
    summary: 'The physical EnergyGuide emphasizes estimated annual cost and CEER. Prefer exact-model annual kWh from ENERGY STAR Product Finder when available.',
    energyInput: 'Annual Energy Use (kWh/year)',
    energyInputHelp: 'Use ENERGY STAR Product Finder when available, or calculate from rated watts and your actual operating hours.',
    labelNote: 'CEER is an efficiency ratio, not annual consumption. DOE’s standardized annual cooling calculation assumes 750 operating hours per year.',
    careTasks: [
      { title: 'Clean or replace the filter', cadence: 'Monthly during peak-use seasons', detail: 'Follow the exact model instructions and shorten the interval in dusty conditions if the manual directs.' },
      { title: 'Check the evaporator coil', cadence: 'Yearly', detail: 'Clean only within manual-approved homeowner access.' },
      { title: 'Inspect window seals and grilles', cadence: 'During seasonal setup', detail: 'Check the fit and clear accessible intake and exhaust grilles.' },
      { title: 'Clear drain channels', cadence: 'Occasionally, as the manual allows', detail: 'Stop if water approaches electrical components.' },
    ],
    redFlags: ['A damaged plug or LCDI cord, arcing, smoke, or repeated trips.', 'Water reaching electrical parts.', 'A suspected refrigerant leak or any sealed-system work.'],
    sources: [
      { label: 'Certified room air-conditioner data', url: 'https://www.energystar.gov/productfinder/product/certified-room-air-conditioners/results', publisher: 'ENERGY STAR' },
      { label: 'Home cooling maintenance', url: 'https://www.energy.gov/downloads/energy-saver-101-home-cooling-infographic', publisher: 'U.S. Department of Energy' },
      { label: 'Refrigerant technician requirements', url: 'https://www.epa.gov/section608/section-608-technician-certification', publisher: 'U.S. EPA' },
    ],
    reviewedAt: '2026-08-31',
  },
  {
    slug: 'dehumidifier',
    name: 'Dehumidifier',
    shortName: 'Dehumidifier',
    category: 'Air Quality',
    title: 'Dehumidifier running cost, care, and recall guide',
    description: 'Estimate dehumidifier electricity cost, interpret ENERGY STAR metrics correctly, and check high-priority recall and cleaning guidance.',
    summary: 'Dehumidifiers do not carry the FTC EnergyGuide label. Use exact-model Integrated Annual Energy Consumption from ENERGY STAR Product Finder when available.',
    energyInput: 'Integrated Annual Energy Consumption (kWh/year)',
    energyInputHelp: 'Use the exact-model ENERGY STAR Product Finder record when available.',
    labelNote: 'Integrated Energy Factor (IEF), expressed in liters per kWh, is an efficiency ratio—not annual energy use.',
    careTasks: [
      { title: 'Empty a bucket unit', cadence: 'Daily while operating', detail: 'Disconnect power before cleaning and prevent collected water from reaching electrical parts.' },
      { title: 'Clean the filter and grilles', cadence: 'At the manual or filter-indicator cadence', detail: 'There is no reliable universal interval for every design and environment.' },
      { title: 'Inspect the drain route', cadence: 'Regularly', detail: 'Look for leakage, kinks, blockage, and water near cords or outlets.' },
      { title: 'Respond to frost', cadence: 'Whenever frost forms below about 65°F', detail: 'Switch the unit off and let it defrost before restarting.' },
    ],
    redFlags: ['A model included in a CPSC recall.', 'Overheating, plastic or burning odor, smoke, scorching, or repeated trips.', 'Any compressor, refrigerant, or internal electrical work.'],
    sources: [
      { label: 'ENERGY STAR dehumidifiers', url: 'https://www.energystar.gov/products/dehumidifiers', publisher: 'ENERGY STAR' },
      { label: 'Certified dehumidifier data', url: 'https://www.energystar.gov/productfinder/product/certified-dehumidifiers/results', publisher: 'ENERGY STAR' },
      { label: 'CPSC recall search', url: 'https://www.cpsc.gov/Recalls', publisher: 'U.S. Consumer Product Safety Commission' },
    ],
    reviewedAt: '2026-08-31',
  },
];

export function getHomeSystem(slug: string): HomeSystem | undefined {
  return HOME_SYSTEMS.find((system) => system.slug === slug);
}
