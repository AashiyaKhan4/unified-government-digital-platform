const bcrypt = require('bcryptjs');
const {
  UserModel,
  ProfileModel,
  ServiceModel,
  ConnectorModel,
  ConsentModel,
  ApplicationModel,
  AuditLogModel,
  NotificationModel
} = require('../models');

async function seedInitialData() {
  const userCount = await UserModel.count();
  if (userCount > 0) {
    console.log('[Seed] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[Seed] Populating initial demonstration data for Unified Government Digital Platform...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Users
  const citizen = await UserModel.create({
    name: 'Rahul Sharma',
    email: 'citizen@ugdp.gov.in',
    passwordHash,
    role: 'citizen'
  });

  const official = await UserModel.create({
    name: 'Priya Deshmukh',
    email: 'official@ugdp.gov.in',
    passwordHash,
    role: 'official'
  });

  const admin = await UserModel.create({
    name: 'Vikram Patil',
    email: 'admin@ugdp.gov.in',
    passwordHash,
    role: 'admin'
  });

  // 2. Citizen Profile
  await ProfileModel.create({
    userId: citizen._id,
    fullName: 'Rahul Sharma',
    dateOfBirth: '2004-06-15',
    address: 'Flat 402, Green Park, Andheri East, Mumbai, Maharashtra - 400069',
    contact: {
      phone: '+91 98201 12345',
      email: 'citizen@ugdp.gov.in'
    },
    education: {
      course: 'B.Tech in Computer Science & Engineering',
      institution: 'Government College of Engineering, Mumbai',
      year: 2026,
      score: 88.5
    },
    verifiedFields: ['Unified Identity (Verified)', 'Income Certificate (Valid)', 'Domicile / Residence (Verified)']
  });

  // 3. Connectors
  const scholarshipConnector = await ConnectorModel.create({
    name: 'ScholarshipConnector',
    endpoint: 'http://localhost:5000/mock-portals/scholarship',
    mappingRules: {
      'name': 'student_name',
      'citizen_reference': 'student_id',
      'date_of_birth': 'birth_date'
    },
    connectionStatus: 'Connected',
    lastTested: new Date().toISOString()
  });

  const incomeConnector = await ConnectorModel.create({
    name: 'CertificateConnector',
    endpoint: 'http://localhost:5000/mock-portals/income',
    mappingRules: {
      'name': 'applicant_name',
      'citizen_reference': 'applicant_number',
      'date_of_birth': 'dob'
    },
    connectionStatus: 'Connected',
    lastTested: new Date().toISOString()
  });

  const residenceConnector = await ConnectorModel.create({
    name: 'ResidenceConnector',
    endpoint: 'http://localhost:5000/mock-portals/residence',
    mappingRules: {
      'name': 'fullName',
      'citizen_reference': 'resident_id',
      'date_of_birth': 'date_of_birth'
    },
    connectionStatus: 'Connected',
    lastTested: new Date().toISOString()
  });

  // 4. Services
  const scholarshipService = await ServiceModel.create({
    name: 'Post-Matric Scholarship Scheme 2026',
    department: 'Higher & Technical Education Department',
    description: 'Financial assistance for meritorious students in professional degree programs.',
    requirements: ['Unified Profile', 'Income Certificate', 'Residence Verification', 'Academic Records'],
    connectorId: scholarshipConnector._id,
    workflow: ['Application Submitted', 'Initial Validation', 'Inter-department Verification', 'Official Decision'],
    benefits: '₹50,000 / year tuition fee waiver and allowance'
  });

  const incomeService = await ServiceModel.create({
    name: 'Income Certificate Issuance',
    department: 'Revenue & Forest Department',
    description: 'Official certification of annual family income for welfare schemes.',
    requirements: ['Unified Profile', 'Salary / Income Self-declaration'],
    connectorId: incomeConnector._id,
    workflow: ['Application Submitted', 'Revenue Officer Review', 'Digital Certificate Issued'],
    benefits: 'Authoritative income certificate valid for 1 financial year'
  });

  const residenceService = await ServiceModel.create({
    name: 'Domicile & Residence Certificate',
    department: 'District Administration, Government of Maharashtra',
    description: 'Proof of continuous residence in Maharashtra for educational & recruitment quota.',
    requirements: ['Unified Profile', '15-Year Residence Record'],
    connectorId: residenceConnector._id,
    workflow: ['Application Submitted', 'Police / Talathi Verification', 'Sub-Divisional Officer Sanction'],
    benefits: 'Lifetime Domicile Certificate'
  });

  const employmentService = await ServiceModel.create({
    name: 'Chief Minister Employment Generation Scheme (CMEGP)',
    department: 'Department of Skills, Employment, Entrepreneurship and Innovation',
    description: 'Subsidized loan assistance and skill training for young entrepreneurs.',
    requirements: ['Unified Profile', 'Project Proposal', 'Aadhaar / ID Verification'],
    connectorId: residenceConnector._id,
    workflow: ['Application Submitted', 'Bank Linkage', 'District Task Force Approval'],
    benefits: 'Up to ₹50 Lakh project subsidy & mentorship'
  });

  // 5. Consents
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 90);

  const sampleConsent = await ConsentModel.create({
    citizenId: citizen._id,
    requestingServiceId: 'Post-Matric Scholarship Scheme 2026',
    categories: ['Income Certificate', 'Residence Verification', 'Academic Record'],
    purpose: 'Automated inter-departmental eligibility verification for scholarship sanction.',
    status: 'Approved',
    expiry: expiryDate.toISOString()
  });

  // 6. Applications (Demo state)
  await ApplicationModel.create({
    applicationTrackingCode: 'SCH-1025',
    citizenId: citizen._id,
    serviceId: scholarshipService._id,
    serviceName: scholarshipService.name,
    department: scholarshipService.department,
    status: 'Under Verification',
    submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    formData: {
      fullName: 'Rahul Sharma',
      course: 'B.Tech in Computer Science & Engineering',
      institution: 'Government College of Engineering, Mumbai',
      annualIncome: '₹1,80,000',
      category: 'General Merit'
    },
    timeline: [
      {
        stage: 'Application Submitted',
        status: 'Completed',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        details: 'Submitted via Unified Gateway. Tracking Code: SCH-1025'
      },
      {
        stage: 'Initial Validation',
        status: 'Completed',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 120000).toISOString(),
        details: 'Unified Profile data matched and validated.'
      },
      {
        stage: 'Department Verification',
        status: 'Completed',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 350000).toISOString(),
        details: 'Revenue Dept verified Income (₹1,80,000); District Admin confirmed Domicile (Mumbai Suburban).'
      },
      {
        stage: 'Decision / Approval',
        status: 'Under Final Review',
        timestamp: new Date().toISOString(),
        details: 'Verification successful. Assigned to Priya Deshmukh (Dept Officer) for final sanction.'
      }
    ],
    verifiedData: {
      income: {
        certificateNumber: 'MH-INC-2026-98124',
        annualIncome: 180000,
        status: 'VALID',
        issuingAuthority: 'Tahasildar Office, Mumbai'
      },
      residence: {
        district: 'Mumbai Suburban',
        yearsOfResidence: 15,
        status: 'VERIFIED'
      }
    }
  });

  await ApplicationModel.create({
    applicationTrackingCode: 'INC-2031',
    citizenId: citizen._id,
    serviceId: incomeService._id,
    serviceName: incomeService.name,
    department: incomeService.department,
    status: 'Approved',
    submittedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    decisionRemarks: 'Verified against Maharashtra Revenue Portal records. Income certificate issued.',
    timeline: [
      {
        stage: 'Application Submitted',
        status: 'Completed',
        timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        details: 'Application received and registered.'
      },
      {
        stage: 'Revenue Verification',
        status: 'Completed',
        timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        details: 'Tahasildar office verified revenue records.'
      },
      {
        stage: 'Digital Certificate Issued',
        status: 'Approved',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        details: 'Certificate MH-INC-2026-98124 digitally signed and linked to citizen profile.'
      }
    ]
  });

  await ApplicationModel.create({
    applicationTrackingCode: 'RES-1048',
    citizenId: citizen._id,
    serviceId: residenceService._id,
    serviceName: residenceService.name,
    department: residenceService.department,
    status: 'Pending Verification',
    submittedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    statusReason: 'External portal queue delay: verification token pending.',
    timeline: [
      {
        stage: 'Application Submitted',
        status: 'Completed',
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        details: 'Application submitted.'
      },
      {
        stage: 'Local Field Inquiry',
        status: 'Pending',
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 400000).toISOString(),
        details: 'Awaiting Talathi field inquiry report.'
      }
    ]
  });

  // 7. Notifications
  await NotificationModel.create({
    userId: citizen._id,
    message: 'Welcome to Unified Government Digital Platform! Your Unified Citizen Profile is initialized and verified.',
    eventType: 'welcome',
    readStatus: true,
    timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  });

  await NotificationModel.create({
    userId: citizen._id,
    message: 'Your Income Certificate application (INC-2031) has been APPROVED.',
    eventType: 'application_approved',
    readStatus: true,
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  });

  await NotificationModel.create({
    userId: citizen._id,
    message: 'Consent granted to Higher Education Dept for automated cross-verification.',
    eventType: 'consent_granted',
    readStatus: false,
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  });

  // 8. Audit Logs
  await AuditLogModel.create({
    actor: citizen._id,
    action: 'USER_LOGIN',
    resource: '/auth/login',
    outcome: 'Success',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: { role: 'citizen', ip: '127.0.0.1' }
  });

  await AuditLogModel.create({
    actor: citizen._id,
    action: 'CONSENT_GRANTED',
    resource: `/consents/${sampleConsent._id}`,
    outcome: 'Success',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    details: { categories: ['Income Certificate', 'Residence Verification'], duration: '90 days' }
  });

  await AuditLogModel.create({
    actor: 'SYSTEM_WORKFLOW',
    action: 'INTEROP_VERIFY_INCOME',
    resource: 'http://localhost:5000/mock-portals/income/verify',
    outcome: 'Success',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 10000).toISOString(),
    details: {
      requestPayload: { applicant_name: 'Rahul Sharma', applicant_number: citizen._id, dob: '2004-06-15' },
      responseNormalized: { annualIncome: 180000, status: 'VALID' }
    }
  });

  await AuditLogModel.create({
    actor: 'SYSTEM_WORKFLOW',
    action: 'INTEROP_VERIFY_RESIDENCE',
    resource: 'http://localhost:5000/mock-portals/residence/verify',
    outcome: 'Success',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 20000).toISOString(),
    details: {
      requestPayload: { fullName: 'Rahul Sharma', resident_id: citizen._id, date_of_birth: '2004-06-15' },
      responseNormalized: { district: 'Mumbai Suburban', status: 'VERIFIED' }
    }
  });

  console.log('[Seed] Demonstration data successfully initialized!');
}

module.exports = { seedInitialData };
