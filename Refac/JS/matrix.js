/**
 * HETZA-RA - Risk Matrix Logic
 * Hanterar riskkalkyler enligt definierad metod
 */

const RiskMatrix = {

    // Lookup table (S: 0-3, F: 1-2, A: 1-2, P: 1-3)
    lookupTable: {
       0: {
          1: { 1: [ { value: 0, cls: 'low' }, { value: 0, cls: 'low' }, { value: 0, cls: 'low' } ],
              2: [ { value: 0, cls: 'low' }, { value: 0, cls: 'low' }, { value: 0, cls: 'low' } ] },
          2: { 1: [ { value: 0, cls: 'low' }, { value: 0, cls: 'low' }, { value: 0, cls: 'low' } ],
              2: [ { value: 0, cls: 'low' }, { value: 0, cls: 'low' }, { value: 0, cls: 'low' } ] }
       },
       1: {
          1: { 1: [ { value: 0, cls: 'low' }, { value: 0, cls: 'low' }, { value: 1, cls: 'low' } ],
              2: [ { value: 0, cls: 'low' }, { value: 1, cls: 'low' }, { value: 2, cls: 'lowMedium' } ] },
          2: { 1: [ { value: 1, cls: 'lowMedium' }, { value: 2, cls: 'lowMedium' }, { value: 3, cls: 'lowMedium' } ],
              2: [ { value: 2, cls: 'lowMedium' }, { value: 3, cls: 'lowMedium' }, { value: 4, cls: 'medium' } ] }
       },
       2: {
          1: { 1: [ { value: 1, cls: 'lowMedium' }, { value: 2, cls: 'lowMedium' }, { value: 3, cls: 'lowMedium' } ],
              2: [ { value: 2, cls: 'lowMedium' }, { value: 3, cls: 'lowMedium' }, { value: 4, cls: 'medium' } ] },
          2: { 1: [ { value: 3, cls: 'medium' }, { value: 4, cls: 'medium' }, { value: 5, cls: 'medium' } ],
              2: [ { value: 4, cls: 'medium' }, { value: 5, cls: 'medium' }, { value: 6, cls: 'high' } ] }
       },
       3: {
          1: { 1: [ { value: 5, cls: 'high' }, { value: 6, cls: 'high' }, { value: 7, cls: 'high' } ],
              2: [ { value: 6, cls: 'high' }, { value: 7, cls: 'high' }, { value: 8, cls: 'high' } ] },
          2: { 1: [ { value: 7, cls: 'high' }, { value: 8, cls: 'high' }, { value: 9, cls: 'high' } ],
              2: [ { value: 8, cls: 'high' }, { value: 9, cls: 'high' }, { value: 10, cls: 'high' } ] }
       }
    },
    
    // Riskparameter-definitioner
    getSeverityLevels() {
        // 4 nivåer: S0-S3
        return {
            0: t('risk.level.noinjury'),
            1: t('risk.level.slight'),
            2: t('risk.level.serious'),
            3: t('risk.level.death')
        };
    },

    getFrequencyLevels() {
        // 2 nivåer: rarely (0p), often (2p)
        return {
            1: t('risk.level.rarely'),
            2: t('risk.level.often')
        };
    },
    
    getProbabilityLevels() {
        // 3 nivåer: SM (0p), MI (1p), HI (2p)
        return {
            1: t('risk.level.sm'),
            2: t('risk.level.mi'),
            3: t('risk.level.hi')
        };
    },
    
    getAvoidanceLevels() {
        // 2 nivåer: P (0p), H (1p)
        return {
            1: t('risk.level.p_possible'),
            2: t('risk.level.h_hard')
        };
    },
    
    // Backwards compatibility properties
    get severityLevels() { return this.getSeverityLevels(); },
    get frequencyLevels() { return this.getFrequencyLevels(); },
    get probabilityLevels() { return this.getProbabilityLevels(); },
    get avoidanceLevels() { return this.getAvoidanceLevels(); },
    
    thresholds: {
        high: 7,     // 7-10 = unacceptable (red)
        medium: 2    // 2-6 = should be reduced (yellow)
    },              // 0-1 = acceptable (green)

    normalizeSeverityForLookup(S) {
        if (S >= 0 && S <= 3) return S;
        if (S >= 1 && S <= 4) return S - 1; // backward compatibility
        return null;
    },
    
    /**
     * Beräkna riskvärde via lookup-tabell enligt Nohl/Safexpert (0–10)
     * @param {number} S - Severity (1-4: noinjury/slight/serious/death)
     * @param {number} F - Frequency (1-2: rarely/often)
     * @param {number} P - Probability (1-3: SM/MI/HI)
     * @param {number} A - Avoidance (1-2: P/H)
     * @returns {number} Risktal 0-10
     */
    calculateRisk(S, F, P, A) {
        if (!this.validateParameters(S, F, P, A)) {
            console.error('Invalid parameters:', { S, F, P, A });
            return 0;
        }

        const sNorm = this.normalizeSeverityForLookup(S);
        const probIndex = P - 1; // P är 1-3, index 0-2
        const entry = this.lookupTable?.[sNorm]?.[F]?.[A]?.[probIndex];
        return entry?.value ?? 0;
    },
    
    /**
     * Klassificera risk baserat på parametrar
     * Använder både riskvärde och parameterkombinationer
     * @param {number} S - Severity
     * @param {number} F - Frequency
     * @param {number} P - Probability
     * @param {number} A - Avoidance
     * @returns {string} Riskklassning: 'high', 'medium', 'low'
     */
    classifyRisk(S, F, P, A) {
        if (!this.validateParameters(S, F, P, A)) {
            return 'unknown';
        }

        const sNorm = this.normalizeSeverityForLookup(S);
        const probIndex = P - 1;
        const entry = this.lookupTable?.[sNorm]?.[F]?.[A]?.[probIndex];
        return entry?.cls || 'unknown';
    },
    
    /**
     * Få riskklass i klartext
     */
    getRiskClassText(classification) {
        const textKeys = {
            'high': 'risk.class.high',
            'medium': 'risk.class.medium',
            'lowMedium': 'risk.class.lowMedium',
            'low': 'risk.class.low'
        };
        return t(textKeys[classification] || 'risk.class.unknown');
    },
    
    /**
     * Validera parametervärden
     */
    validateParameters(S, F, P, A) {
        const validS = (S >= 0 && S <= 3) || (S >= 1 && S <= 4);
        return (
            validS &&
            F >= 1 && F <= 2 &&
            P >= 1 && P <= 3 &&
            A >= 1 && A <= 2
        );
    },

    mapSeverity(S) {
        // 0 no injury, 1 slight, 2 serious, 3 death
        const map = {0: 'noinjury', 1: 'slight', 2: 'serious', 3: 'death', 4: 'death'};
        return map[S] || 'slight';
    },

    mapFrequency(F) {
        // 1 rarely, 2 often
        return F === 1 ? 'rarely' : 'often';
    },

    mapProbability(P) {
        if (P === 1) return 'SM';
        if (P === 2) return 'MI';
        return 'HI'; // P===3
    },

    mapAvoidance(A) {
        // 1 => P (possible), 2-3 => H (hardly possible)
        return A === 1 ? 'P' : 'H';
    },

    // Poängsättning för additiv modell
    getSeverityScore(S) {
        const scores = {0: 0, 1: 0, 2: 2, 3: 5, 4: 5};
        return scores[S] ?? 0;
    },

    getFrequencyScore(F) {
        return F === 1 ? 0 : 2; // 1=rarely(0p), 2=often(2p)
    },

    getProbabilityScore(P) {
        if (P === 1) return 0; // SM
        if (P === 2) return 1; // MI
        return 2; // HI (P===3)
    },

    getAvoidanceScore(A) {
        return A === 1 ? 0 : 1; // P = 0, H = 1
    },
    
    /**
     * Skapa en komplett riskbeskrivning
     */
    getRiskDescription(S, F, P, A) {
        const riskValue = this.calculateRisk(S, F, P, A);
        const classification = this.classifyRisk(S, F, P, A);
        
        return {
            value: riskValue,
            classification: classification,
            classificationText: this.getRiskClassText(classification),
            parameters: {
                severity: { value: S, text: this.severityLevels[S] },
                frequency: { value: F, text: this.frequencyLevels[F] },
                probability: { value: P, text: this.probabilityLevels[P] },
                avoidance: { value: A, text: this.avoidanceLevels[A] }
            }
        };
    },
    
    /**
     * Beräkna PL-nivå enligt ISO 13849-1:2023
     * @param {number} S - Severity (0-3)
     * @param {number} F - Frequency (1-2)
     * @param {number} A - Avoidance (1-2)
     * @returns {object} {level: 'a'|'b'|'c'|'d'|'e', description: string, color: string}
     */
    calculatePL(S, F, A) {
        // ISO 13849-1:2023 PL-nivåer baserat på risk
        // S: Severity, F: Frequency, A: Avoidance
        const sNorm = (S >= 0 && S <= 3) ? S + 1 : S;
        
        // PL a: Grundläggande säkerhet, låg risk
        if (sNorm === 1 && F === 1 && A === 1) {
            return {
                level: 'a',
                text: 'PL a',
                description: t('risk.pl_a_desc'),
                color: '#22c55e',
                recommendation: t('risk.pl_a_rec')
            };
        }
        
        // PL b: Låg till medel risk
        if ((sNorm === 1 && F <= 2) || (sNorm === 2 && F === 1 && A >= 1)) {
            return {
                level: 'b',
                text: 'PL b',
                description: t('risk.pl_b_desc'),
                color: '#84cc16',
                recommendation: t('risk.pl_b_rec')
            };
        }
        
        // PL c: Medel risk
        if ((sNorm === 2 && F === 2) || (sNorm === 3 && F === 1 && A === 1)) {
            return {
                level: 'c',
                text: 'PL c',
                description: t('risk.pl_c_desc'),
                color: '#eab308',
                recommendation: t('risk.pl_c_rec')
            };
        }
        
        // PL d: Medel-högt risk
        if ((sNorm === 3 && (F === 2 || A >= 2)) || (sNorm === 4 && F === 1 && A === 1)) {
            return {
                level: 'd',
                text: 'PL d',
                description: t('risk.pl_d_desc'),
                color: '#f97316',
                recommendation: t('risk.pl_d_rec')
            };
        }
        
        // PL e: Högt risk, kritisk säkerhetsfunktion
        if (sNorm === 4) {
            return {
                level: 'e',
                text: 'PL e',
                description: t('risk.pl_e_desc'),
                color: '#ef4444',
                recommendation: t('risk.pl_e_rec')
            };
        }
        
        // Default: PL a
        return {
            level: 'a',
            text: 'PL a',
            description: t('risk.pl_a_desc'),
            color: '#22c55e',
            recommendation: t('risk.pl_a_rec')
        };
    },

    /**
     * Get lookup entry for matrix rendering
     */
    getLookupEntry(S, F, P, A) {
        const sNorm = this.normalizeSeverityForLookup(S);
        const probIndex = P - 1;
        return this.lookupTable?.[sNorm]?.[F]?.[A]?.[probIndex] || null;
    },
    
    /**
     * Få info för en specifik PL-nivå (för dropdowns)
     * @param {string} level - 'a', 'b', 'c', 'd', eller 'e'
     * @returns {object} PL info
     */
    getPLInfo(level) {
        const plMap = {
            'a': {
                level: 'a',
                text: 'PL a',
                description: t('risk.pl_a_desc'),
                color: '#22c55e',
                recommendation: t('risk.pl_a_rec')
            },
            'b': {
                level: 'b',
                text: 'PL b',
                description: t('risk.pl_b_desc'),
                color: '#84cc16',
                recommendation: t('risk.pl_b_rec')
            },
            'c': {
                level: 'c',
                text: 'PL c',
                description: t('risk.pl_c_desc'),
                color: '#eab308',
                recommendation: t('risk.pl_c_rec')
            },
            'd': {
                level: 'd',
                text: 'PL d',
                description: t('risk.pl_d_desc'),
                color: '#f97316',
                recommendation: t('risk.pl_d_rec')
            },
            'e': {
                level: 'e',
                text: 'PL e',
                description: t('risk.pl_e_desc'),
                color: '#ef4444',
                recommendation: t('risk.pl_e_rec')
            }
        };
        return plMap[level] || plMap['a'];
    }};

// matrix.js loaded