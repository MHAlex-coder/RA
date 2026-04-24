/**
 * Control Report Templates
 * Uses i18n keys for the current CE checklist structure
 */

function buildTemplate(isRegulation) {
    const level1 = {
        id: 'level1',
        titleKey: isRegulation ? 'control.level1.title.regulation' : 'control.level1.title.directive',
        subtitleKey: isRegulation ? 'control.level1.subtitle.regulation' : 'control.level1.subtitle.directive',
        sections: [
            {
                id: 'level1-risk',
                titleKey: 'control.level1.section.risk',
                subtitleKey: '',
                items: [
                    { id: 'control.level1.risk.assessment_done', textKey: 'control.level1.risk.assessment_done', helpKey: '' },
                    { id: 'control.level1.risk.documented', textKey: 'control.level1.risk.documented', helpKey: '' },
                    { id: 'control.level1.risk.parameters', textKey: 'control.level1.risk.parameters', helpKey: '' },
                    { id: 'control.level1.risk.measures', textKey: 'control.level1.risk.measures', helpKey: '' },
                    { id: 'control.level1.risk.residual', textKey: 'control.level1.risk.residual', helpKey: '' }
                ]
            },
            {
                id: 'level1-protection',
                titleKey: 'control.level1.section.protection',
                subtitleKey: '',
                items: [
                    { id: 'control.level1.protection.builtin', textKey: 'control.level1.protection.builtin', helpKey: '' },
                    { id: 'control.level1.protection.guards', textKey: 'control.level1.protection.guards', helpKey: '' },
                    { id: 'control.level1.protection.additional', textKey: 'control.level1.protection.additional', helpKey: '' },
                    { id: 'control.level1.protection.marking', textKey: 'control.level1.protection.marking', helpKey: '' },
                    { id: 'control.level1.protection.scs', textKey: 'control.level1.protection.scs', helpKey: '' },
                    { id: 'control.level1.protection.manual', textKey: 'control.level1.protection.manual', helpKey: '' }
                ]
            },
            {
                id: 'level1-standards',
                titleKey: 'control.level1.section.standards',
                subtitleKey: '',
                items: [
                    { id: 'control.level1.standards.harmonized', textKey: 'control.level1.standards.harmonized', helpKey: '' },
                    { id: 'control.level1.standards.directive', textKey: isRegulation ? 'control.level1.standards.regulation' : 'control.level1.standards.directive', helpKey: '' },
                    { id: 'control.level1.standards.other', textKey: 'control.level1.standards.other', helpKey: '' },
                    { id: 'control.level1.standards.techfile', textKey: isRegulation ? 'control.level1.standards.techfile_reg' : 'control.level1.standards.techfile', helpKey: '' }
                ]
            },
            {
                id: 'level1-verification',
                titleKey: 'control.level1.section.verification',
                subtitleKey: '',
                items: [
                    { id: 'control.level1.verification.functions', textKey: 'control.level1.verification.functions', helpKey: '' },
                    { id: 'control.level1.verification.protections', textKey: 'control.level1.verification.protections', helpKey: '' },
                    { id: 'control.level1.verification.protocols', textKey: 'control.level1.verification.protocols', helpKey: '' },
                    { id: 'control.level1.verification.declaration', textKey: isRegulation ? 'control.level1.verification.declaration_reg' : 'control.level1.verification.declaration', helpKey: '' },
                    { id: 'control.level1.verification.ce', textKey: 'control.level1.verification.ce', helpKey: '' }
                ]
            }
        ]
    };

    const level2 = {
        id: 'level2',
        titleKey: 'control.level2.title',
        subtitleKey: 'control.level2.subtitle',
        sections: [
            {
                id: 'level2-risk',
                titleKey: 'control.level2.section',
                subtitleKey: '',
                items: [
                    { id: 'control.level2.item.lifecycle', textKey: 'control.level2.item.lifecycle', helpKey: '' },
                    { id: 'control.level2.item.allhazards', textKey: 'control.level2.item.allhazards', helpKey: '' },
                    { id: 'control.level2.item.estimation', textKey: 'control.level2.item.estimation', helpKey: '' },
                    { id: 'control.level2.item.hierarchy', textKey: 'control.level2.item.hierarchy', helpKey: '' },
                    { id: 'control.level2.item.residual', textKey: 'control.level2.item.residual', helpKey: '' }
                ]
            }
        ]
    };

    const level3 = {
        id: 'level3',
        titleKey: isRegulation ? 'control.level3.title.regulation' : 'control.level3.title.directive',
        subtitleKey: isRegulation ? 'control.level3.subtitle.regulation' : 'control.level3.subtitle.directive',
        sections: [
            {
                id: 'level3-general',
                titleKey: 'control.level3.section.general',
                subtitleKey: '',
                items: [
                    { id: 'control.level3.item.112.hierarchy', textKey: 'control.level3.item.112.hierarchy', helpKey: 'control.level3.help.112.hierarchy' },
                    { id: 'control.level3.item.112.ppe', textKey: 'control.level3.item.112.ppe', helpKey: 'control.level3.help.112.ppe' },
                    { id: 'control.level3.item.113', textKey: 'control.level3.item.113', helpKey: 'control.level3.help.113' },
                    { id: 'control.level3.item.114', textKey: 'control.level3.item.114', helpKey: 'control.level3.help.114' },
                    { id: 'control.level3.item.115', textKey: 'control.level3.item.115', helpKey: 'control.level3.help.115' },
                    { id: 'control.level3.item.116', textKey: 'control.level3.item.116', helpKey: 'control.level3.help.116' },
                    { id: 'control.level3.item.117', textKey: 'control.level3.item.117', helpKey: 'control.level3.help.117' },
                    { id: 'control.level3.item.118', textKey: 'control.level3.item.118', helpKey: 'control.level3.help.118' },
                    { id: 'control.level3.item.119', textKey: 'control.level3.item.119', helpKey: 'control.level3.help.119' }
                ]
            },
            {
                id: 'level3-controls',
                titleKey: 'control.level3.section.controls',
                subtitleKey: '',
                items: [
                    { id: 'control.level3.item.121.reliability', textKey: 'control.level3.item.121.reliability', helpKey: 'control.level3.help.121.reliability' },
                    { id: 'control.level3.item.121.software', textKey: 'control.level3.item.121.software', helpKey: 'control.level3.help.121.software' },
                    { id: 'control.level3.item.122', textKey: 'control.level3.item.122', helpKey: 'control.level3.help.122' },
                    { id: 'control.level3.item.123', textKey: 'control.level3.item.123', helpKey: 'control.level3.help.123' },
                    { id: 'control.level3.item.124', textKey: 'control.level3.item.124', helpKey: isRegulation ? 'control.level3.help.124.regulation' : 'control.level3.help.124.directive' },
                    { id: 'control.level3.item.125', textKey: 'control.level3.item.125', helpKey: 'control.level3.help.125' },
                    { id: 'control.level3.item.126', textKey: 'control.level3.item.126', helpKey: 'control.level3.help.126' }
                ]
            },
            {
                id: 'level3-mechanical',
                titleKey: 'control.level3.section.mechanical',
                subtitleKey: '',
                items: [
                    { id: 'control.level3.item.13', textKey: 'control.level3.item.13', helpKey: 'control.level3.help.13' }
                ]
            },
            {
                id: 'level3-guards',
                titleKey: 'control.level3.section.guards',
                subtitleKey: '',
                items: [
                    { id: 'control.level3.item.14', textKey: 'control.level3.item.14', helpKey: 'control.level3.help.14' }
                ]
            },
            {
                id: 'level3-other',
                titleKey: 'control.level3.section.other',
                subtitleKey: '',
                items: [
                    { id: 'control.level3.item.15', textKey: 'control.level3.item.15', helpKey: 'control.level3.help.15' }
                ]
            },
            {
                id: 'level3-maintenance',
                titleKey: 'control.level3.section.maintenance',
                subtitleKey: '',
                items: [
                    { id: 'control.level3.item.16', textKey: 'control.level3.item.16', helpKey: 'control.level3.help.16' }
                ]
            },
            {
                id: 'level3-information',
                titleKey: 'control.level3.section.information',
                subtitleKey: '',
                items: [
                    { id: 'control.level3.item.17', textKey: 'control.level3.item.17', helpKey: 'control.level3.help.17' }
                ]
            }
        ]
    };

    return {
        titleKey: isRegulation ? 'control.report.title.regulation' : 'control.report.title.directive',
        noteKey: isRegulation ? 'control.report.note.regulation' : 'control.report.note.directive',
        levels: [level1, level2, level3]
    };
}

/**
 * Build Low Voltage Directive 2014/35/EU control template
 */
function buildLowVoltageTemplate() {
    const lvdLevel1 = {
        id: 'lvd-level1',
        titleKey: 'control.lvd.title',
        subtitleKey: 'control.lvd.subtitle',
        sections: [
            {
                id: 'lvd-scope',
                titleKey: 'control.lvd.section.scope',
                subtitleKey: '',
                items: [
                    { id: 'lvd.machinery_directive', textKey: 'control.lvd.item.machinery_directive', helpKey: '' },
                    { id: 'lvd.en60204_design', textKey: 'control.lvd.item.en60204_design', helpKey: '' },
                    { id: 'lvd.rated_voltage', textKey: 'control.lvd.item.rated_voltage', helpKey: '' }
                ]
            },
            {
                id: 'lvd-marking',
                titleKey: 'control.lvd.section.marking',
                subtitleKey: '',
                items: [
                    { id: 'lvd.nameplate_present', textKey: 'control.lvd.item.nameplate_present', helpKey: '' },
                    { id: 'lvd.manufacturer_name', textKey: 'control.lvd.item.manufacturer_name', helpKey: '' },
                    { id: 'lvd.machine_designation', textKey: 'control.lvd.item.machine_designation', helpKey: '' },
                    { id: 'lvd.electrical_data_marked', textKey: 'control.lvd.item.electrical_data_marked', helpKey: '' },
                    { id: 'lvd.ce_marking_visible', textKey: 'control.lvd.item.ce_marking_visible', helpKey: '' }
                ]
            },
            {
                id: 'lvd-electric-hazards',
                titleKey: 'control.lvd.section.electric_hazards',
                subtitleKey: '',
                items: [
                    { id: 'lvd.direct_contact_protection', textKey: 'control.lvd.item.direct_contact_protection', helpKey: '' },
                    { id: 'lvd.ip_class', textKey: 'control.lvd.item.ip_class', helpKey: '' },
                    { id: 'lvd.earthing_correct', textKey: 'control.lvd.item.earthing_correct', helpKey: '' },
                    { id: 'lvd.all_conductive_parts', textKey: 'control.lvd.item.all_conductive_parts', helpKey: '' },
                    { id: 'lvd.earth_conductor_color', textKey: 'control.lvd.item.earth_conductor_color', helpKey: '' },
                    { id: 'lvd.earth_continuity_verified', textKey: 'control.lvd.item.earth_continuity_verified', helpKey: '' },
                    { id: 'lvd.rcd_used', textKey: 'control.lvd.item.rcd_used', helpKey: '' }
                ]
            },
            {
                id: 'lvd-overcurrent',
                titleKey: 'control.lvd.section.overcurrent',
                subtitleKey: '',
                items: [
                    { id: 'lvd.fuses_sized', textKey: 'control.lvd.item.fuses_sized', helpKey: '' },
                    { id: 'lvd.short_circuit_protection', textKey: 'control.lvd.item.short_circuit_protection', helpKey: '' },
                    { id: 'lvd.motor_protection', textKey: 'control.lvd.item.motor_protection', helpKey: '' }
                ]
            },
            {
                id: 'lvd-insulation',
                titleKey: 'control.lvd.section.insulation',
                subtitleKey: '',
                items: [
                    { id: 'lvd.insulation_verified', textKey: 'control.lvd.item.insulation_verified', helpKey: '' },
                    { id: 'lvd.insulation_tested', textKey: 'control.lvd.item.insulation_tested', helpKey: '' },
                    { id: 'lvd.sensitive_electronics', textKey: 'control.lvd.item.sensitive_electronics', helpKey: '' }
                ]
            },
            {
                id: 'lvd-thermal',
                titleKey: 'control.lvd.section.thermal',
                subtitleKey: '',
                items: [
                    { id: 'lvd.no_overheating', textKey: 'control.lvd.item.no_overheating', helpKey: '' },
                    { id: 'lvd.thermal_protection_installed', textKey: 'control.lvd.item.thermal_protection_installed', helpKey: '' },
                    { id: 'lvd.ventilation_adequate', textKey: 'control.lvd.item.ventilation_adequate', helpKey: '' },
                    { id: 'lvd.surface_temperatures_safe', textKey: 'control.lvd.item.surface_temperatures_safe', helpKey: '' }
                ]
            },
            {
                id: 'lvd-mechanical-env',
                titleKey: 'control.lvd.section.mechanical_env',
                subtitleKey: '',
                items: [
                    { id: 'lvd.enclosure_strength', textKey: 'control.lvd.item.enclosure_strength', helpKey: '' },
                    { id: 'lvd.no_sharp_edges', textKey: 'control.lvd.item.no_sharp_edges', helpKey: '' },
                    { id: 'lvd.cable_protection', textKey: 'control.lvd.item.cable_protection', helpKey: '' }
                ]
            },
            {
                id: 'lvd-cables-conductors',
                titleKey: 'control.lvd.section.cables_conductors',
                subtitleKey: '',
                items: [
                    { id: 'lvd.conductor_size', textKey: 'control.lvd.item.conductor_size', helpKey: '' },
                    { id: 'lvd.cables_protected', textKey: 'control.lvd.item.cables_protected', helpKey: '' },
                    { id: 'lvd.flexible_cables_protected', textKey: 'control.lvd.item.flexible_cables_protected', helpKey: '' },
                    { id: 'lvd.color_coded', textKey: 'control.lvd.item.color_coded', helpKey: '' }
                ]
            },
            {
                id: 'lvd-connections-terminals',
                titleKey: 'control.lvd.section.connections_terminals',
                subtitleKey: '',
                items: [
                    { id: 'lvd.terminals_suitable', textKey: 'control.lvd.item.terminals_suitable', helpKey: '' },
                    { id: 'lvd.earth_terminals_marked', textKey: 'control.lvd.item.earth_terminals_marked', helpKey: '' },
                    { id: 'lvd.earth_secure_connection', textKey: 'control.lvd.item.earth_secure_connection', helpKey: '' }
                ]
            },
            {
                id: 'lvd-documentation',
                titleKey: 'control.lvd.section.documentation',
                subtitleKey: '',
                items: [
                    { id: 'lvd.schematic_available', textKey: 'control.lvd.item.schematic_available', helpKey: '' },
                    { id: 'lvd.electrical_data_documented', textKey: 'control.lvd.item.electrical_data_documented', helpKey: '' },
                    { id: 'lvd.user_manual_safety_info', textKey: 'control.lvd.item.user_manual_safety_info', helpKey: '' },
                    { id: 'lvd.instructions_clear', textKey: 'control.lvd.item.instructions_clear', helpKey: '' }
                ]
            },
            {
                id: 'lvd-testing-verification',
                titleKey: 'control.lvd.section.testing_verification',
                subtitleKey: '',
                items: [
                    { id: 'lvd.visual_inspection', textKey: 'control.lvd.item.visual_inspection', helpKey: '' },
                    { id: 'lvd.earth_continuity_measured', textKey: 'control.lvd.item.earth_continuity_measured', helpKey: '' },
                    { id: 'lvd.function_test', textKey: 'control.lvd.item.function_test', helpKey: '' },
                    { id: 'lvd.results_documented', textKey: 'control.lvd.item.results_documented', helpKey: '' }
                ]
            },
            {
                id: 'lvd-ce-conformity',
                titleKey: 'control.lvd.section.ce_conformity',
                subtitleKey: '',
                items: [
                    { id: 'lvd.risk_assessment_done', textKey: 'control.lvd.item.risk_assessment_done', helpKey: '' },
                    { id: 'lvd.eu_declaration', textKey: 'control.lvd.item.eu_declaration', helpKey: '' },
                    { id: 'lvd.standards_listed', textKey: 'control.lvd.item.standards_listed', helpKey: '' },
                    { id: 'lvd.technical_doc_archived', textKey: 'control.lvd.item.technical_doc_archived', helpKey: '' }
                ]
            }
        ]
    };

    return {
        titleKey: 'control.report.title.lvd',
        noteKey: 'control.report.note.lvd',
        levels: [lvdLevel1]
    };
}

export const CONTROL_REPORT_TEMPLATES = {
    directive: buildTemplate(false),
    regulation: buildTemplate(true),
    lowvoltage: buildLowVoltageTemplate()
};
