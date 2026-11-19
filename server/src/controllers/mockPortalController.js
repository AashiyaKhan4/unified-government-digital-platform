// In-memory configurable state for the 3 mock government portals
const portalState = {
  scholarship: { status: 'Connected', latencyMs: 25, failureRate: 0 },
  income: { status: 'Connected', latencyMs: 35, failureRate: 0 },
  residence: { status: 'Connected', latencyMs: 30, failureRate: 0 }
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MockPortalController {
  // Config management for demo simulation
  static getPortalConfig(req, res) {
    res.json({
      success: true,
      portals: portalState,
      description: 'Mock Government Portals simulating independent departmental APIs with heterogeneous schemas.'
    });
  }

  static updatePortalConfig(req, res) {
    const { portal } = req.params;
    const { status, latencyMs } = req.body;
    if (!portalState[portal]) {
      return res.status(404).json({ success: false, message: `Portal ${portal} not found.` });
    }
    if (status) portalState[portal].status = status;
    if (typeof latencyMs === 'number') portalState[portal].latencyMs = latencyMs;

    res.json({
      success: true,
      portal,
      config: portalState[portal],
      message: `Updated ${portal} portal status to ${portalState[portal].status}`
    });
  }

  // --- 1. SCHOLARSHIP PORTAL (Key: student_name, student_id, birth_date) ---
  static async scholarshipHealth(req, res) {
    const state = portalState.scholarship;
    if (state.status === 'Unavailable' || state.status === 'Down') {
      return res.status(503).json({ status: 'Unavailable', error: 'Scholarship Database Service Offline' });
    }
    if (state.status === 'Delayed') {
      await wait(2000);
    }
    res.json({
      status: state.status,
      portalName: 'MahaDBT / National Scholarship Portal (Mock)',
      schemaVersion: 'NSP-v2.6',
      primaryKey: 'student_name',
      latency: `${state.latencyMs}ms`
    });
  }

  static async scholarshipSubmit(req, res) {
    const state = portalState.scholarship;
    if (state.status === 'Unavailable' || state.status === 'Down') {
      return res.status(503).json({ error: 'Scholarship Portal is temporarily unavailable. 503' });
    }
    if (state.status === 'Delayed') {
      await wait(2500);
    }

    const { student_name, student_id, birth_date, educational_institute, current_course } = req.body;
    res.status(201).json({
      ack_id: 'NSP-ACK-' + Math.floor(100000 + Math.random() * 900000),
      student_name,
      student_id,
      birth_date,
      application_status: 'SUBMITTED',
      received_at: new Date().toISOString(),
      institution: educational_institute,
      course: current_course
    });
  }

  static async scholarshipVerify(req, res) {
    const state = portalState.scholarship;
    if (state.status === 'Unavailable' || state.status === 'Down') {
      return res.status(503).json({ error: 'Scholarship Verification Portal 503 Service Unavailable' });
    }
    if (state.status === 'Delayed') {
      await wait(2500);
    }

    const { student_name, student_id, birth_date } = req.body;
    res.json({
      student_name: student_name || 'Rahul Sharma',
      student_id: student_id || 'CIT-1024',
      birth_date: birth_date || '15-06-2004',
      eligibility_status: 'ELIGIBLE',
      application_status: 'APPROVED',
      scholarship_amount: 50000,
      quota: 'State Merit Scheme 2026',
      verified_by: 'Higher Education Directorate, Maharashtra'
    });
  }

  // --- 2. INCOME CERTIFICATE PORTAL (Key: applicant_name, applicant_number, dob) ---
  static async incomeHealth(req, res) {
    const state = portalState.income;
    if (state.status === 'Unavailable' || state.status === 'Down') {
      return res.status(503).json({ status: 'Unavailable', error: 'Revenue Dept Income Registry 503' });
    }
    if (state.status === 'Delayed') {
      await wait(2000);
    }
    res.json({
      status: state.status,
      portalName: 'Revenue Department Income Registry (Mock)',
      schemaVersion: 'REV-MH-INC-v1.4',
      primaryKey: 'applicant_name',
      latency: `${state.latencyMs}ms`
    });
  }

  static async incomeVerify(req, res) {
    const state = portalState.income;
    if (state.status === 'Unavailable' || state.status === 'Down') {
      return res.status(503).json({ error: 'Income Registry Service Unavailable (503 Outage Simulation)' });
    }
    if (state.status === 'Delayed') {
      await wait(2500);
    }

    const { applicant_name, applicant_number, dob } = req.body;
    res.json({
      applicant_name: applicant_name || 'Rahul Sharma',
      applicant_number: applicant_number || 'CIT-1024',
      dob: dob || '2004-06-15',
      verification_status: 'VERIFIED',
      certificate_status: 'VALID',
      annual_income: 180000,
      certificate_number: 'MH-INC-2026-98124',
      financial_year: '2025-2026',
      issue_date: '2026-04-12',
      issuing_authority: 'Tahasildar Office, Kurla, Mumbai'
    });
  }

  // --- 3. RESIDENCE / DOMICILE PORTAL (Key: fullName, resident_id, date_of_birth) ---
  static async residenceHealth(req, res) {
    const state = portalState.residence;
    if (state.status === 'Unavailable' || state.status === 'Down') {
      return res.status(503).json({ status: 'Unavailable', error: 'Residence / Domicile Database 503' });
    }
    if (state.status === 'Delayed') {
      await wait(2000);
    }
    res.json({
      status: state.status,
      portalName: 'Maharashtra Domicile & Residence Registry (Mock)',
      schemaVersion: 'DOM-MH-v3.1',
      primaryKey: 'fullName',
      latency: `${state.latencyMs}ms`
    });
  }

  static async residenceVerify(req, res) {
    const state = portalState.residence;
    if (state.status === 'Unavailable' || state.status === 'Down') {
      return res.status(503).json({ error: 'Residence Registry Down (503 Outage Simulation)' });
    }
    if (state.status === 'Delayed') {
      await wait(2500);
    }

    const { fullName, resident_id, date_of_birth } = req.body;
    res.json({
      fullName: fullName || 'Rahul Sharma',
      resident_id: resident_id || 'CIT-1024',
      date_of_birth: date_of_birth || '2004-06-15',
      residence_status: 'VERIFIED',
      domicile_status: 'CONFIRMED',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      years_of_residence: 15,
      verification_token: 'MH-DOM-77239',
      verified_at: new Date().toISOString()
    });
  }
}

module.exports = MockPortalController;
