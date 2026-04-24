/**
 * config/risk-data.js - Risk Data Definitions
 * Risk groups, hazard sources, zones, injuries, standards and directives
 */

// Globala riskdata - inbäddad direkt för att undvika fetch-problem med file://
export const riskGroupsData = {
    "riskGroups": [
        "Mekaniska faror",
        "Elektriska faror",
        "Termiska faror",
        "Faror orsakade av buller",
        "Faror orsakade av vibrationer",
        "Faror orsakade av strålning",
        "Faror orsakade av material och ämnen",
        "Ergonomiska faror",
        "Faror i samband med arbetsmiljön",
        "Kombinationer av faror"
    ],
    "hazardSources": [
        "Kläm-/skärpunkt",
        "Snittskada från vassa kanter",
        "Indragningsmöjlighet",
        "Stöt/slag från rörliga delar",
        "Fallande delar/arbetsstycken",
        "Instabilitet/vältningsrisk",
        "Elektrisk stöt",
        "Elektrisk brand",
        "Statisk elektricitet",
        "Brännskada från heta ytor",
        "Frostskada från kalla ytor",
        "Brand/explosion",
        "Buller över 85 dB(A)",
        "Vibrationer - hand/arm",
        "Vibrationer - helkropp",
        "Joniserande strålning",
        "Icke-joniserande strålning",
        "Laser",
        "Farliga ämnen (kemikalier)",
        "Damm/partiklar",
        "Biologiska ämnen",
        "Olämplig arbetsställning",
        "Repetitivt arbete",
        "Tunga lyft",
        "Psykisk belastning",
        "Belysning otillräcklig",
        "Halkrisk",
        "Fallrisk från höjd",
        "Kvävningsrisk",
        "Övertryck/undertryck"
    ],
    "hazardZones": [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J"
    ],
    "injuries": [
        "Kläm-/krossskada",
        "Skärskada",
        "Stickskada",
        "Kontusion (blåmärke)",
        "Fraktur (benbrott)",
        "Amputation",
        "Elektrisk stöt/chock",
        "Brännskada",
        "Frätskada",
        "Förgiftning",
        "Kvävning/syrebrist",
        "Hörselskada",
        "Vibrationsskada",
        "Strålningsskada",
        "Ögonskada",
        "Lungskada",
        "Hudskada",
        "Muskelskada",
        "Ledskada",
        "Ryggskada",
        "Neurologisk skada",
        "Psykisk skada/stress",
        "Fallskada",
        "Dödsfall"
    ],
    "standards": [
        "EN ISO 12100:2010 - Maskinsäkerhet - Allmänna principer för konstruktion",
        "EN ISO 13849-1:2015 - Säkerhetsrelaterade styrsystem",
        "EN ISO 13849-2:2012 - Validering",
        "EN ISO 13857:2019 - Säkerhetsavstånd",
        "EN 60204-1:2018 - Elsäkerhet för maskiner",
        "EN ISO 14120:2015 - Skyddsutrustning",
        "EN 1088:2023 - Säkerhetsbrytare",
        "EN ISO 13850:2015 - Nödstopp",
        "EN ISO 13855:2010 - Säkerhetsavstånd för ljusridåer/laserskannrar",
        "EN 574:1996 - Tvåhandsutrustning",
        "EN ISO 11161:2007 - Integrerade tillverkningssystem",
        "EN ISO 10218-1/2:2011 - Robotsäkerhet",
        "EN ISO 4414:2010 - Pneumatik",
        "EN ISO 4413:2010 - Hydraulik",
        "EN 349:1993 - Minsta avstånd för att undvika klämrisk",
        "EN 894-1/2/3 - Ergonomi och maskinkontroller",
        "EN 547-1/2/3 - Kroppsmått",
        "EN ISO 7010:2020 - Varningsskyltar och säkerhetsskyltar",
        "EN 61310-1/2/3 - Indikering och manövrering"
    ],
    "directives": [
        "Maskindirektivet 2006/42/EG",
        "Maskinförordningen (EU) 2023/1230",
        "Lågspänningsdirektivet 2014/35/EU",
        "EMC-direktivet 2014/30/EU",
        "ATEX-direktivet 2014/34/EU (explosiv miljö)",
        "Tryckutrustningsdirektivet 2014/68/EU",
        "Radio Equipment Directive (RED) 2014/53/EU",
        "RoHS-direktivet 2011/65/EU (farliga ämnen)",
        "REACH-förordningen (EG) 1907/2006 (kemikalier)"
    ]
};

// Översättningar för standardlistor (värde = svensk bas, label byts per språk)
export const riskListLabels = {
    riskGroups: {
        "Mekaniska faror": { sv: "Mekaniska faror", en: "Mechanical hazards" },
        "Elektriska faror": { sv: "Elektriska faror", en: "Electrical hazards" },
        "Termiska faror": { sv: "Termiska faror", en: "Thermal hazards" },
        "Faror orsakade av buller": { sv: "Faror orsakade av buller", en: "Noise hazards" },
        "Faror orsakade av vibrationer": { sv: "Faror orsakade av vibrationer", en: "Vibration hazards" },
        "Faror orsakade av strålning": { sv: "Faror orsakade av strålning", en: "Radiation hazards" },
        "Faror orsakade av material och ämnen": { sv: "Faror orsakade av material och ämnen", en: "Materials and substances hazards" },
        "Ergonomiska faror": { sv: "Ergonomiska faror", en: "Ergonomic hazards" },
        "Faror i samband med arbetsmiljön": { sv: "Faror i samband med arbetsmiljön", en: "Workplace/environment hazards" },
        "Kombinationer av faror": { sv: "Kombinationer av faror", en: "Combined hazards" }
    },
    hazardSources: {
        "Kläm-/skärpunkt": { sv: "Kläm-/skärpunkt", en: "Pinch/shear point" },
        "Snittskada från vassa kanter": { sv: "Snittskada från vassa kanter", en: "Cut from sharp edges" },
        "Indragningsmöjlighet": { sv: "Indragningsmöjlighet", en: "Draw-in / entanglement" },
        "Stöt/slag från rörliga delar": { sv: "Stöt/slag från rörliga delar", en: "Impact from moving parts" },
        "Fallande delar/arbetsstycken": { sv: "Fallande delar/arbetsstycken", en: "Falling parts / workpieces" },
        "Instabilitet/vältningsrisk": { sv: "Instabilitet/vältningsrisk", en: "Instability / overturning" },
        "Elektrisk stöt": { sv: "Elektrisk stöt", en: "Electric shock" },
        "Elektrisk brand": { sv: "Elektrisk brand", en: "Electrical fire" },
        "Statisk elektricitet": { sv: "Statisk elektricitet", en: "Static electricity" },
        "Brännskada från heta ytor": { sv: "Brännskada från heta ytor", en: "Burn from hot surfaces" },
        "Frostskada från kalla ytor": { sv: "Frostskada från kalla ytor", en: "Cold surface injury" },
        "Brand/explosion": { sv: "Brand/explosion", en: "Fire / explosion" },
        "Buller över 85 dB(A)": { sv: "Buller över 85 dB(A)", en: "Noise above 85 dB(A)" },
        "Vibrationer - hand/arm": { sv: "Vibrationer - hand/arm", en: "Vibration - hand/arm" },
        "Vibrationer - helkropp": { sv: "Vibrationer - helkropp", en: "Vibration - whole body" },
        "Joniserande strålning": { sv: "Joniserande strålning", en: "Ionizing radiation" },
        "Icke-joniserande strålning": { sv: "Icke-joniserande strålning", en: "Non-ionizing radiation" },
        "Laser": { sv: "Laser", en: "Laser" },
        "Farliga ämnen (kemikalier)": { sv: "Farliga ämnen (kemikalier)", en: "Hazardous substances (chemicals)" },
        "Damm/partiklar": { sv: "Damm/partiklar", en: "Dust / particles" },
        "Biologiska ämnen": { sv: "Biologiska ämnen", en: "Biological agents" },
        "Olämplig arbetsställning": { sv: "Olämplig arbetsställning", en: "Awkward posture" },
        "Repetitivt arbete": { sv: "Repetitivt arbete", en: "Repetitive work" },
        "Tunga lyft": { sv: "Tunga lyft", en: "Heavy lifting" },
        "Psykisk belastning": { sv: "Psykisk belastning", en: "Mental/psychological load" },
        "Belysning otillräcklig": { sv: "Belysning otillräcklig", en: "Insufficient lighting" },
        "Halkrisk": { sv: "Halkrisk", en: "Slip hazard" },
        "Fallrisk från höjd": { sv: "Fallrisk från höjd", en: "Fall from height" },
        "Kvävningsrisk": { sv: "Kvävningsrisk", en: "Asphyxiation risk" },
        "Övertryck/undertryck": { sv: "Övertryck/undertryck", en: "Overpressure / underpressure" }
    },
    hazardZones: {
        "A": { sv: "A", en: "A" },
        "B": { sv: "B", en: "B" },
        "C": { sv: "C", en: "C" },
        "D": { sv: "D", en: "D" },
        "E": { sv: "E", en: "E" },
        "F": { sv: "F", en: "F" },
        "G": { sv: "G", en: "G" },
        "H": { sv: "H", en: "H" },
        "I": { sv: "I", en: "I" },
        "J": { sv: "J", en: "J" }
    },
    injuries: {
        "Kläm-/krossskada": { sv: "Kläm-/krossskada", en: "Crushing injury" },
        "Skärskada": { sv: "Skärskada", en: "Laceration" },
        "Stickskada": { sv: "Stickskada", en: "Puncture wound" },
        "Kontusion (blåmärke)": { sv: "Kontusion (blåmärke)", en: "Contusion (bruise)" },
        "Fraktur (benbrott)": { sv: "Fraktur (benbrott)", en: "Fracture" },
        "Amputation": { sv: "Amputation", en: "Amputation" },
        "Elektrisk stöt/chock": { sv: "Elektrisk stöt/chock", en: "Electric shock" },
        "Brännskada": { sv: "Brännskada", en: "Burn" },
        "Frätskada": { sv: "Frätskada", en: "Corrosive injury" },
        "Förgiftning": { sv: "Förgiftning", en: "Poisoning" },
        "Kvävning/syrebrist": { sv: "Kvävning/syrebrist", en: "Asphyxiation / oxygen deprivation" },
        "Hörselskada": { sv: "Hörselskada", en: "Hearing damage" },
        "Vibrationsskada": { sv: "Vibrationsskada", en: "Vibration injury" },
        "Strålningsskada": { sv: "Strålningsskada", en: "Radiation injury" },
        "Ögonskada": { sv: "Ögonskada", en: "Eye injury" },
        "Lungskada": { sv: "Lungskada", en: "Lung injury" },
        "Hudskada": { sv: "Hudskada", en: "Skin injury" },
        "Muskelskada": { sv: "Muskelskada", en: "Muscle injury" },
        "Ledskada": { sv: "Ledskada", en: "Joint injury" },
        "Ryggskada": { sv: "Ryggskada", en: "Back injury" },
        "Neurologisk skada": { sv: "Neurologisk skada", en: "Neurological injury" },
        "Psykisk skada/stress": { sv: "Psykisk skada/stress", en: "Psychological injury / stress" },
        "Fallskada": { sv: "Fallskada", en: "Fall injury" },
        "Dödsfall": { sv: "Dödsfall", en: "Fatality" }
    }
};

/**
 * Get list for dropdowns (standards, directives, etc.)
 * @param {string} key - List key
 * @returns {string[]} List items
 */
export function getListForDropdown(key) {
    if (!riskGroupsData || !riskGroupsData[key]) return [];
    return riskGroupsData[key];
}
