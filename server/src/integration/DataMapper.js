/**
 * DataMapper - Implements schema transformation between heterogeneous portals
 * and the Unified Data Model (UDM) as specified in SDS Module 5 & Class Diagram.
 */
class DataMapper {
  static formatDateToCommon(dateStr) {
    if (!dateStr) return '';
    // If format is DD-MM-YYYY, convert to YYYY-MM-DD
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split('-');
      return `${yyyy}-${mm}-${dd}`;
    }
    return dateStr;
  }

  static formatDateToPortal(dateStr, targetFormat = 'YYYY-MM-DD') {
    if (!dateStr) return '';
    if (targetFormat === 'DD-MM-YYYY') {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return dateStr;
  }

  /**
   * Convert Common Schema -> Target Portal Schema
   */
  static toTarget(portalType, canonical) {
    const common = { ...canonical };
    switch (portalType.toLowerCase()) {
      case 'scholarship':
        return {
          student_name: common.name || common.fullName,
          student_id: common.citizen_reference || common.citizenRef || common.userId,
          birth_date: this.formatDateToPortal(common.date_of_birth || common.dateOfBirth, 'DD-MM-YYYY'),
          educational_institute: common.education?.institution || common.institution || 'University of Mumbai',
          current_course: common.education?.course || common.course || 'B.Tech CSE',
          academic_year: common.education?.year || common.year || 2026,
          marks_percentage: common.education?.score || common.score || 88.5,
          request_source: 'UGDP_GATEWAY'
        };

      case 'income':
      case 'certificate':
        return {
          applicant_name: common.name || common.fullName,
          applicant_number: common.citizen_reference || common.citizenRef || common.userId,
          dob: this.formatDateToPortal(common.date_of_birth || common.dateOfBirth, 'YYYY-MM-DD'),
          verification_type: 'INCOME',
          financial_year: '2025-2026',
          request_source: common.requestingDepartment || 'SCHOLARSHIP_DEPT'
        };

      case 'residence':
      case 'domicile':
        return {
          fullName: common.name || common.fullName,
          resident_id: common.citizen_reference || common.citizenRef || common.userId,
          date_of_birth: this.formatDateToPortal(common.date_of_birth || common.dateOfBirth, 'YYYY-MM-DD'),
          residential_address: common.address || 'Flat 402, Green Park, Andheri East, Mumbai, Maharashtra - 400069',
          district: common.district || 'Mumbai Suburban',
          state: 'Maharashtra',
          request_source: 'UGDP_GATEWAY'
        };

      default:
        return common;
    }
  }

  /**
   * Convert Target Portal Response -> Unified Common Schema
   */
  static toCommon(portalType, portalData) {
    const raw = { ...portalData };
    switch (portalType.toLowerCase()) {
      case 'scholarship':
        return {
          citizen_reference: raw.student_id,
          name: raw.student_name,
          date_of_birth: this.formatDateToCommon(raw.birth_date),
          service_code: 'SCHOLARSHIP-2026',
          verification: (raw.eligibility_status === 'ELIGIBLE' || raw.status === 'APPROVED') ? 'SUCCESS' : 'FAILED',
          status: raw.application_status || raw.status || 'SUBMITTED',
          details: {
            awardAmount: raw.scholarship_amount || 50000,
            institution: raw.educational_institute,
            academicYear: raw.academic_year
          },
          timestamp: new Date().toISOString()
        };

      case 'income':
      case 'certificate':
        return {
          citizen_reference: raw.applicant_number,
          name: raw.applicant_name,
          date_of_birth: this.formatDateToCommon(raw.dob),
          service_code: 'INCOME-CERT-MH',
          verification: (raw.verification_status === 'VERIFIED' || raw.certificate_status === 'VALID') ? 'SUCCESS' : 'FAILED',
          status: raw.certificate_status || 'VALID',
          details: {
            annualIncome: raw.annual_income || 180000,
            certificateNo: raw.certificate_number || 'MH-INC-2026-98124',
            issueDate: raw.issue_date || '2026-04-12',
            issuingAuthority: raw.issuing_authority || 'Tahasildar Office, Mumbai'
          },
          timestamp: new Date().toISOString()
        };

      case 'residence':
      case 'domicile':
        return {
          citizen_reference: raw.resident_id,
          name: raw.fullName,
          date_of_birth: this.formatDateToCommon(raw.date_of_birth),
          service_code: 'RESIDENCE-DOMICILE-MH',
          verification: (raw.residence_status === 'VERIFIED' || raw.domicile_status === 'CONFIRMED') ? 'SUCCESS' : 'FAILED',
          status: raw.residence_status || 'VERIFIED',
          details: {
            district: raw.district || 'Mumbai Suburban',
            yearsOfResidence: raw.years_of_residence || 15,
            verificationRef: raw.verification_token || 'MH-DOM-77239'
          },
          timestamp: new Date().toISOString()
        };

      default:
        return raw;
    }
  }
}

module.exports = DataMapper;
