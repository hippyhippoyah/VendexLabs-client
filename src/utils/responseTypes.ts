export type VendorList = {
  name: string;
  vendors: string[];
};
export type VendorListUsersResponse = {
  users: {
    email: string;
    name: string | null;
    id: string;
  }[];
  vendor_lists?: VendorList[];
};
export type UsersByAccountIdResponse = {
  users: {
    email: string;
    name: string | null;
    id: string;
  }[];
};
export type AllAccountsResponse = {
  accounts: {
    id: string;
    name: string;
    active: boolean;
  }[];
};
export type AccountSubscriptionsResponse = {
  subscribers: {
    email: string;
    verified: boolean;
  }[];
};
export type VendorOverview = {
  id: string;
  vendor: string;
  logo: string;
  website_url: string;
};
export type IndividualSubscriptionsResponse = {
  email: string;
  vendors: { name: string }[];
};

export type VendorAnalysis = {
  id: string;
  vendor: string;
  company_description: string;
  business_type: string;
  founded_year: number;
  employee_count: number | null;
  industry: string;
  primary_product: string;
  customer_count_estimate: number;
  logo: string;
  website_url: string;
  privacy_policy_url: string;
  tos_url: string;
  headquarters_location: string;
  contact_email: string;
  security_rating: number;
  risk_score: number;
  date: string;
  last_reviewed: string;
  alias: string[];
  data_collected: string[];
  risk_categories: string[];
  breach_history: any[];
  compliance_certifications: string[];
  published_subprocessors: any[];
  shared_data_description: string;
  ml_training_data_description: string;
  supports_data_subject_requests: boolean;
  gdpr_compliant: boolean;
  data_returned_after_termination: boolean;
  data_physical_location: string;
  company_type: string;
  total_funding: string;
  funding_round: string;
  has_enterprise_customers: boolean;
  popularity_index: number;
  revenue_estimate: string;
};