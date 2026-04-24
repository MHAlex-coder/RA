/**
 * config/control-questions.js - CE Marking Control Questions
 * Based on Annex I - Basic health and safety requirements
 */

export const controlQuestions = [
    {
        id: "1.1",
        title: "1.1 Allmänt",
        subsections: [
            {
                id: "1.1.2",
                title: "1.1.2 Principer för integration av säkerhet",
                questions: [
                    "Beaktas risker under maskinens alla livsfaser (tillverkning, transport/installation, idrifttagning, användning/underhål, demontering/skrotning)?",
                    "Utgår denna bedömning från att åtgärder vidtas i följande ordning (Konstruktion - Skydd - Information)?",
                    "Beaktas både avsedd användning och förutsebar felaktig användning?",
                    "Beaktas begränsningar vid användning av personlig skyddsutrustning?",
                    "Medföljer specialutrustning och de tillbehör för installation, användning och underhål som krävs?"
                ]
            },
            {
                id: "1.1.3",
                title: "1.1.3 Material och produkter",
                questions: [
                    "Undviks farliga ämnen vid tillverkning av maskinen?",
                    "Undviks farliga ämnen från produkter som används eller framställs av maskinen?",
                    "Undviks risker vid hantering av vätskor eller gaser?"
                ]
            },
            {
                id: "1.1.4",
                title: "1.1.4 Belysning",
                questions: [
                    "Anses normal belysning bring maskinen vara tillräcklig?",
                    "Beaktas behovet av inbyggd belysning för avsett arbete?",
                    "Finns tillräcklig belysning till invändiga delar för säker justering och underhål?",
                    "Undviks att belysningen kan ge skuggade områden?",
                    "Undviks blåndningseffekter?",
                    "Undviks stroboskopiska effekter (pulserade blinkningar)?"
                ]
            },
            {
                id: "1.1.5",
                title: "1.1.5 Konstruktion av maskiner i syfte att underlätta hantering",
                questions: [
                    "Kan maskinen/maskindelar hanteras och transporteras på ett säkert sätt?",
                    "Kan maskin/maskindelar förvaras utan risk för att ta skada?",
                    "Kan maskin/maskindelar transporteras säkert? Plötslig rörelse, instabilitet.",
                    "Om maskin inte kan flyttas för hand, finns då fästanordning för lyftutrustning angivet eller förberedd med gängade hål eller kan lyftutrustning av standardtyp användas (truck, lyftstroppar)?",
                    "Om maskin/maskindel kan flyttas för hand, finns säkra lyftställen (handtag etc.)?",
                    "Kan verktyg och andra potentiellt farliga delar hanteras på ett säkert sätt?"
                ]
            },
            {
                id: "1.1.6",
                title: "1.1.6 Ergonomi",
                questions: [
                    "Undviks risk för obehag, tröthet, fysiska, psykiska påfrestningar?",
                    "Tas hänsyn till personers olika förutsättningar?",
                    "Har operatören tillräckligt med utrymme?",
                    "Undviks att maskinen bestämmer arbetssakten?",
                    "Undviks övervakning som kräver lång koncentration?",
                    "Undviks risker genom att anpassa gränssnittet människamaskin?"
                ]
            },
            {
                id: "1.1.7",
                title: "1.1.7 Arbetsstationer",
                questions: [
                    "Undviks risk för avgaser eller syrebrist?",
                    "Vid användning i riskfylld miljö, är arbetsfölhållandena goda och skyddas operatören mot riskkällan?",
                    "Undviks risker för operatören genom att förse maskinen med en hytt som ger en säker arbeteplats?"
                ]
            },
            {
                id: "1.1.8",
                title: "1.1.8 Säten",
                questions: [
                    "Har maskinen tillräckliga säten för operatören (då det krävs)?",
                    "Är sätet anpassat för operatören?",
                    "Tas hänsyn till vibrationer som operatören utsätts för?",
                    "Är fästen för säte, fotstöd och hallkryds säkert utformade?"
                ]
            }
        ]
    },
    {
        id: "1.2",
        title: "1.2 Styrystem",
        subsections: [
            {
                id: "1.2.1",
                title: "1.2.1 Ett styrystems säkerhet och tillföriltlighet",
                questions: [
                    "Är styrystemet konstruerat och tillverkat så att risksituationer inte uppstår?",
                    "Täll styrystemet normal användning i avsedd miljö?",
                    "Undviks att fel i maskin- eller programmvara leder till farliga situationer?",
                    "Undviks att fel i logik leder till farliga situationer?",
                    "Undviks att rimliga förutsebara människliga misstag leder till farliga situationer?",
                    "Är det möjligt att överväga rimlighet enligt detta dokument?",
                    "Är styrystemet konstruerat så att maskinen inte kan starta på av sig själv?",
                    "Är styrystemets paramtrar ändras okontrollerat?",
                    "Är möjlighet att göra maskinen obehindrad efter återverkan av personlig skyddsutrustning?",
                    "Är möjlighet att gå skuggsanordningarna förbi fullständigt effektiv eller utlöst stoppkommando vid fel i styrystem?",
                    "Kan skyddsanordningarna förbi fullständigt effektiva eller utlöst stoppkommando vid fel i styrystem?",
                    "Är de säkerhetsrelaterade delarna i ett styrystem samordnade (sammansatta maskiner/maskingrupper)?"
                ]
            },
            {
                id: "1.2.2",
                title: "1.2.2 Manöverdon",
                questions: [
                    "Är manöverdonen klart synliga och identifierbara samt märkta på ett bratt sätt?",
                    "Kan manöverdonen användas utan tveksamhet, tidsspillan eller risk för missförstånd?",
                    "Öveensstämmer manövrenets rolelse med dess verkan?",
                    "Är manöverdonen placerade utifrån riskomrade (undantaget nödtopp och programmeringsenheters)?",
                    "Är manöverdonen placerade så att användning inte ger upphov till ytterligare risker?",
                    "Medförjer specialutrustning och de tillbehör för installation, användning och underhål som krävs?",
                    "Täll manöverdonen den påfrestning de kan tänkas utsättas för (beakta utströjning såsom handskar, skör etc.)?",
                    "Kan manöverdon som utför flera funktioner användas säkert utan risk för missförstånd?",
                    "Om NEJ på fråga 8, krävs bekräftelse på begärd funktion (om denna kan innebära en risk)?",
                    "Är manöverdonen ergonomiskt placerade och i övrigt anpassade (ta hänsyn till begränsningar, ex. skyddsutrustning såsom handskar, skor etc.)?",
                    "Finns tillräckliga indikeringsanordningar för säkert användsande (visarinstrument, signaler etc.)?",
                    "Kan indikeringsanordningarna avläsas från manövérplatsen?",
                    "Kan operatör från den huvudsakliga manövérplatsen se att personer befinner sig i riskomraden?"
                ]
            },
            {
                id: "1.2.3",
                title: "1.2.3 Start",
                questions: [
                    "Kan start endast ske genom avsiktlig påverkan på ett för ändamålet avsett manöverdon?",
                    "Undviks avsiktlig återstart efter stopp (oavsett orsaken därför till vid avsevälrd förändring av driftförhållandena, hastighet, truck, oavsiktligt påverkade givare etc.)?",
                    "Sker återstart i automatdrift på ett enkelt och säkert sätt?",
                    "Sker start när flera startanordningar finns, på ett säkert sätt?"
                ]
            },
            {
                id: "1.2.4",
                title: "1.2.4 Stopp",
                subsections: [
                    {
                        id: "1.2.4.1",
                        title: "1.2.4.1 Normalt stopp",
                        questions: [
                            "Finns ett manöverdon som stoppar maskinen fullständigt (normal stoppfunktion)?",
                            "Finns det vid varje arbetsstation, beroende på risktyp möjlighet att stoppa några eller samtliga delar så att maskinen blir säker?",
                            "Är maskinens stoppon (stoppfunktion) överordnad dess startdon (startfunktion)?",
                            "Är kraftförsörjningen till drivorganen för de farliga delarna brutna när dessa stoppats (spänning till elmotorer, olje tryck till hydraulmotorer etc.)?"
                        ]
                    },
                    {
                        id: "1.2.4.2",
                        title: "1.2.4.2 Stopp under driften",
                        questions: [
                            "Övervakas och upprätthålls stoppillståndet när kraftförsörjningen till drivorganen inte bryts?"
                        ]
                    },
                    {
                        id: "1.2.4.3",
                        title: "1.2.4.3 Nödstopp",
                        questions: [
                            "Finns ett manöverdon som stoppar maskinen fullständigt (nödstopp)?",
                            "Är nödstoppen lätt att nå och använda?",
                            "Är nödstoppen röd eller gul bakgrund?",
                            "Är nödstoppen försedd med en märkningssymbol?",
                            "Är nödstoppen märkt med följande (överblickbar) platser?",
                            "Utesluts samtidlig användning från flera manövérplatser, undantaget nödstopp och programmeringsenheters?",
                            "Användtes rörlig nödstopp ger maskinen automatiskt stopp när korrekta styrsignaler inte går fram, inklusive kommunikationsöverfall?",
                            "Har alla manövérplatser alla nödvendiga manövérdon?",
                            "Kan operatör från den huvudsakliga manövérplatsen se att personer befinner sig i riskomraden?"
                        ]
                    },
                    {
                        id: "1.2.4.4",
                        title: "1.2.4.4 Montering av maskiner",
                        questions: [
                            "Stoppas maskinen med tillhörande ansluten utrustning med stoppanordning inklusive nödstopp på ett säkert sätt (beakta alltså både machine maskinen)",
                            "Om maskinkombinationer indelats i nödstopsgrupper är de då lätta att identifiera? Se även EN ISO 13850."
                        ]
                    }
                ]
            },
            {
                id: "1.2.5",
                title: "1.2.5 Val av styr- och funktionssätt",
                questions: [
                    "Är det styrväxt som välts överordnat alla andra styrväxlar förutom nödstopp (auto, installation, hand)?",
                    "Om valjare finns för olika säkerhetsnivåer, kan den då ge lösas i de olika lägena?",
                    "Motsvarar varje val endast ett drifts eller styrväxt?",
                    "Om maskin måste köras med skyddsanordningarna satta ur spel: är manöverdonen placerade och i övrigt anpassade (ta hänsyn till begränsningar, ex. skyddsutrustning såsom handskar, skor etc.)?",
                    "Om NEJ på fråga 4, är styrystemet placerat så att användning inte ger upphov till ytterligare risker?",
                    "Är manöverdonen ergonomiskt placerade och i övrigt anpassade (ta hänsyn till begränsningar, ex. skyddsutrustning såsom handskar, skor etc.)?",
                    "Finns tillräckliga indikeringsanordningar för säkert användsande (visarinstrument, signaler etc.)?",
                    "Kan operatören styra driften från det ställe han eller hon arbetar på?",
                    "Om operatör från den huvudsakliga manövérplatsen, se att ingen person befinner sig i riskomraden?"
                ]
            },
            {
                id: "1.2.6",
                title: "1.2.6 Fel i kraftförsörjningen",
                questions: [
                    "Undviks att maskinen startar oväntad efter avbrott eller variation i kraftförsörjningen?",
                    "Undviks risker pga. okontrollerade ändringar i parameterinställningar?",
                    "Kan maskinen stoppas säkert vid fel i kraftförsörjningen, oavsett driftssätt?",
                    "Undviks att rolig del eller del som håls av maskinen faller eller kastas ut vid fel i kraftförsörjningen?",
                    "Kan skyddsanordningarna förbi fullständigt effektiva vid kraftbortfall?"
                ]
            }
        ]
    },
    {
        id: "1.3",
        title: "1.3 Skydd mot mekaniska riskkällor",
        subsections: [
            {
                id: "1.3",
                title: "1.3 Skydd mot mekaniska riskkällor",
                questions: [
                    "Är rörliga delar (kläm-, skär-, indragning, kross) konstruerade eller placerade så att åtkomst till riskzoner minimeras?",
                    "Är utkast av delar eller bearbetade ämnen förhindrat eller begränsat med skydd/kapsling?",
                    "Är maskinens stabilitet säkerställd vid drift, transport och installation (ingen risk för tippning eller fall)?",
                    "Är roterande delar balanserade och säkrade mot lossnande verktyg/detaljer?",
                    "Är transport-, justerings- och underhållspunkter säkrade så att mekaniska risker undviks?"
                ]
            }
        ]
    },
    {
        id: "1.4",
        title: "1.4 Krav på egenskaper hos skydd och skyddsanordningar",
        subsections: [
            {
                id: "1.4",
                title: "1.4 Krav på egenskaper hos skydd och skyddsanordningar",
                questions: [
                    "Är skydd och skyddsanordningar robusta, fast monterade och motstår förväntade påkänningar?",
                    "Kan skydd endast öppnas/tas bort med avsikt och helst med verktyg (eller ger stoppkommando vid öppning)?",
                    "Begränsar skydd inte sikt eller processövervakning mer än nödvändigt?",
                    "Ger skydd inga nya risker (skarpa kanter, klämrisker, instängning)?",
                    "Återgår rörliga skydd till säkert läge och är förregling/stopp kopplad till skyddets position?",
                    "Är skyddsanordningar (ljusridå, mattor, tvåhandsdon m.m.) placerade och kopplade så att riskzon lämnas innan start?"
                ]
            }
        ]
    },
    {
        id: "1.5",
        title: "1.5 Risker på grund av andra riskkällor",
        subsections: [
            {
                id: "1.5",
                title: "1.5 Risker på grund av andra riskkällor",
                questions: [
                    "Är elektriska risker hanterade enligt relevanta standarder (isolation, jordning, kapsling, EMC)?",
                    "Är termiska risker (heta/kalla ytor, brand, explosion) förebyggda och markerade?",
                    "Är buller- och vibrationsnivåer reducerade vid källan och specificerade för användare?",
                    "Är strålning (laser, UV/IR, ioniserande) begränsad, skärmad och märkt?",
                    "Är risker från farliga ämnen/gaser/vätskor begränsade (inkapsling, ventilation, uppsamling, rengöring)?"
                ]
            }
        ]
    },
    {
        id: "1.6",
        title: "1.6 Underhåll",
        subsections: [
            {
                id: "1.6",
                title: "1.6 Underhåll",
                questions: [
                    "Kan underhåll, inställning och rengöring utföras utanför riskzon eller efter säkert stopp/isolering?",
                    "Finns avstängning och låsbar isolering av energitillförsel (el, tryck, lagrad energi)?",
                    "Är åtkomster för underhåll säkra (plattformar, steg, belysning) och utan mekaniska/elektriska risker?",
                    "Kan förbrukningsvaror/byten hanteras utan spill av farliga ämnen eller risk för brännskador?"
                ]
            }
        ]
    },
    {
        id: "1.7",
        title: "1.7 Information",
        subsections: [
            {
                id: "1.7",
                title: "1.7 Information",
                questions: [
                    "Är märkning, varningsskyltar och symboler tydliga, läsbara och placerade nära relevanta riskzoner?",
                    "Anges rest-risker, behov av personlig skyddsutrustning och driftbegränsningar i instruktionerna?",
                    "Är bruksanvisning komplett, på användarens språk och beskriver installation, drift, underhål och nödlägen?",
                    "Är uppgifter om buller/vibrationer och andra emissioner angivna enligt krav?",
                    "Är instruktioner för reservdelar/verktyg och eventuella särskilda kvalifikationer för arbete inkluderade?"
                ]
            }
        ]
    }
];

/**
 * Control questions specific to Low Voltage Directive 2014/35/EU
 * Annex I - Principal elements of the safety objectives for electrical equipment
 */
export const lowVoltageControlQuestions = [
    {
        id: "lvd-1",
        title: "1. Allmänna villkor",
        subsections: [
            {
                id: "lvd-1.1",
                title: "1.1 Väsentliga egenskaper",
                questions: [
                    "Är de väsentliga egenskaperna som produktsäkerheten beror på markerade på produkten eller, om detta inte är möjligt, i ett bifogat dokument?",
                    "Är tillverkarens namn och varumärke eller identifieringsmärke samt typ-, serie- eller partinummer tydligt angivna?",
                    "Är nominell spänning eller spänningsområde samt nominell frekvens markerade?"
                ]
            },
            {
                id: "lvd-1.2",
                title: "1.2 Skydd mot faror från elutrustning",
                questions: [
                    "Är personer och husdjur tillräckligt skyddade mot faror för fysisk skada eller annan skada som kan uppstå genom direkt eller indirekt kontakt?",
                    "Genereras inte temperaturer, ljusbågar eller strålning som kan orsaka fara?",
                    "Är personer, husdjur och egendom tillräckligt skyddade mot icke-elektriska faror från utrustningen?",
                    "Är isoleringen anpassad till förutsebara förhållanden?"
                ]
            }
        ]
    },
    {
        id: "lvd-2",
        title: "2. Skydd mot faror som kan uppstå från elutrustning",
        subsections: [
            {
                id: "lvd-2.1",
                title: "2.1 Elektriska risker",
                questions: [
                    "Är elutrustningen konstruerad och tillverkad så att personer och husdjur skyddas mot direkt kontakt (beröring) med spänningsförande delar?",
                    "Är elutrustningen konstruerad så att indirekt kontakt (via ledande delar) inte medför risk för elektrisk stöt?",
                    "Finns lämplig jordning eller dubbel/förstärkt isolering?",
                    "Är jordningskontinuiteten verifierad genom mätning (resistans < 1,0 Ω mellan jordpunkter)?",
                    "Är elutrustningen skyddad mot kortslutning, överbelastning och överspänningar?",
                    "Är elutrustningen utformad så att risken för elektrisk stöt vid normal användning och vid enstaka fel är försumbar?"
                ]
            },
            {
                id: "lvd-2.2",
                title: "2.2 Temperaturrisker",
                questions: [
                    "Kan elutrustningen under normal drift uppnå temperaturer som kan orsaka brand, äventyra isoleringen eller påverka säkerheten negativt?",
                    "Finns skydd mot överhettning (termiska skydd, termostater)?",
                    "Är tillräcklig kylning/ventilation säkerställd?",
                    "Är höljets yttemperatur under farlig nivå vid normal drift?"
                ]
            },
            {
                id: "lvd-2.3",
                title: "2.3 Mekaniska risker",
                questions: [
                    "Är höljen och skydd konstruerade så att de ger tillräckligt mekaniskt skydd?",
                    "Undviks skarpa kanter och utstickande delar som kan orsaka skada?",
                    "Är elutrustningen konstruerad för att motstå mekanisk påfrestning under normal användning?"
                ]
            },
            {
                id: "lvd-2.4",
                title: "2.4 Brandrisk",
                questions: [
                    "Är material valda så att brandrisken minimeras?",
                    "Är flamskyddande material använda där så krävs?",
                    "Finns brandspridningsskydd mellan olika delar av utrustningen?",
                    "Är elutrustningen konstruerad så att risk för antändning av omgivande material undviks?"
                ]
            }
        ]
    },
    {
        id: "lvd-3",
        title: "3. Konstruktion och tillverkning",
        subsections: [
            {
                id: "lvd-3.1",
                title: "3.1 Teknisk konstruktion",
                questions: [
                    "Är den tekniska konstruktionen säker enligt aktuell teknikutveckling?",
                    "Är harmoniserade standarder tillämpade (t.ex. EN 60204-1 för elsäkerhet i maskiner)?",
                    "Har lämpliga komponenter valts med avseende på spänning, ström, frekvens och miljöförhållanden?",
                    "Är kretsbrytare, säkringar och andra skyddsanordningar korrekt dimensionerade?"
                ]
            },
            {
                id: "lvd-3.2",
                title: "3.2 Ledningar och kablar",
                questions: [
                    "Är ledningar och kablar rätt dimensionerade för förväntad strömbelastning?",
                    "Är kabelgenomföringar och anslutningar utförda på ett säkert sätt?",
                    "Är flexibla kablar skyddade mot mekanisk belastning, nötning och skarpa böjar?",
                    "Är färgkodning korrekt enligt standarder (blå=N, grön/gul=PE, etc.)?"
                ]
            },
            {
                id: "lvd-3.3",
                title: "3.3 Inkoppling och jordning",
                questions: [
                    "Är anslutningsklämmor/terminalblock säkert utformade och ordentligt dimensionerade?",
                    "Är jordningsklämmor tydligt märkta och lättåtkomliga?",
                    "Är jordledaren dimensionerad för högsta förväntade felström?",
                    "Kan anslutningsordningen inte göras felaktig?"
                ]
            },
            {
                id: "lvd-3.4",
                title: "3.4 Dokumentation",
                questions: [
                    "Finns installation- och bruksanvisning på lämpligt språk?",
                    "Anges nominell spänning, frekvens, effekt och andra elektriska data?",
                    "Finns kopplingsschema eller blockdiagram där så behövs?",
                    "Finns information om säker installation, användning, underhåll och avyttring?"
                ]
            }
        ]
    },
    {
        id: "lvd-4",
        title: "4. Provning och överensstämmelse",
        subsections: [
            {
                id: "lvd-4.1",
                title: "4.1 Typgodkännande och provning",
                questions: [
                    "Har elutrustningen genomgått lämplig typgodkännande- eller säkerhetsprovning?",
                    "Är elsäkerhetsprovning (högspoling, isolationsprov, skyddsklasstest) genomförd?",
                    "Har EMC-provning (elektromagnetisk kompatibilitet) utförts där så krävs?",
                    "Finns dokumentation av genomförda tester?"
                ]
            },
            {
                id: "lvd-4.2",
                title: "4.2 CE-märkning och försäkran",
                questions: [
                    "Är CE-märkningen anbragt på elutrustningen eller på dataplåten?",
                    "Finns EU-försäkran om överensstämmelse upprättad?",
                    "Anges vilka harmoniserade standarder som tillämpats (t.ex. EN 60204-1)?",
                    "Är teknisk dokumentation tillgänglig för myndigheter på begäran?"
                ]
            }
        ]
    }
];

// Create default copy for comparison purposes
export const defaultControlQuestions = JSON.parse(JSON.stringify(controlQuestions));

/**
 * Get all control question keys recursively
 * Used for tracking which questions have been answered
 */
export function getAllControlQuestionKeys(questionSections = []) {
    const keys = [];
    const traverse = (subsection) => {
        if (subsection.questions) {
            subsection.questions.forEach((_, idx) => keys.push(`${subsection.id}::${idx}`));
        }
        if (subsection.subsections) {
            subsection.subsections.forEach(traverse);
        }
    };
    questionSections.forEach(section => {
        if (section.subsections) {
            section.subsections.forEach(traverse);
        }
    });
    return keys;
}
