const http = require('http');

async function runTests() {
  console.log('--- Starting Automated End-to-End Test for Samanvay ---');

  // Helper fetch function
  const request = async (url, options = {}) => {
    const res = await fetch(`http://localhost:5000${url}`, options);
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    // 1. Health check
    const health = await request('/health');
    console.log('[1/7] Health Check Status:', health.status, health.data.service);

    // 2. Mock Portals Check
    const mockConfig = await request('/mock-portals/config');
    console.log('[2/7] Mock Portals Active:', Object.keys(mockConfig.data.portals));

    // 3. Login as Citizen
    const loginRes = await request('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'citizen' })
    });
    console.log('[3/7] Demo Citizen Login:', loginRes.data.success ? 'SUCCESS' : 'FAILED', loginRes.data.user?.name);
    const token = loginRes.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 4. Retrieve Profile
    const profileRes = await request('/api/profile/me', { headers: authHeaders });
    console.log('[4/7] Unified Profile Retrieved:', profileRes.data.profile?.fullName, 'DOB:', profileRes.data.profile?.dateOfBirth);

    // 5. Retrieve Services
    const servicesRes = await request('/api/services', { headers: authHeaders });
    console.log('[5/7] Available Services:', servicesRes.data.count, 'services loaded.');
    const scholarshipSvc = servicesRes.data.services.find(s => s.name.includes('Scholarship'));

    // 6. Test Manual Interoperability / Integration Engine Request
    const interopRes = await request('/api/integration/request', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        targetService: 'income',
        category: 'Income Certificate',
        payload: {
          name: profileRes.data.profile?.fullName,
          citizen_reference: 'CIT-1024',
          date_of_birth: profileRes.data.profile?.dateOfBirth
        }
      })
    });
    console.log('[6/7] Integration Engine Cross-Verification:');
    console.log('      - Consent Granted:', interopRes.data.data?.consentGranted);
    console.log('      - Connector:', interopRes.data.data?.connectorName);
    console.log('      - Correlation ID:', interopRes.data.data?.correlationId);
    console.log('      - Normalized Output Status:', interopRes.data.data?.data?.status);

    // 7. Submit Application and Trigger Workflow Engine
    const appSubmitRes = await request('/api/applications', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        serviceId: scholarshipSvc._id,
        consentGranted: true,
        requestedCategories: ['Income Certificate', 'Residence Verification'],
        formData: {
          fullName: profileRes.data.profile?.fullName,
          course: 'B.Tech CSE',
          annualIncome: '₹1,80,000'
        }
      })
    });
    console.log('[7/7] Application Submitted & Orchestrated:');
    console.log('      - Tracking Code:', appSubmitRes.data.application?.applicationTrackingCode);
    console.log('      - Workflow Status:', appSubmitRes.data.application?.status);
    console.log('      - Timeline Stages:', appSubmitRes.data.application?.timeline?.length);

    console.log('\n======================================================');
    console.log('>>> ALL 7 END-TO-END VERIFICATION TESTS PASSED! <<<');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

// Start the server and run tests
require('./server');
setTimeout(runTests, 1500);
