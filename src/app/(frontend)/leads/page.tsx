import LeadManagementDashboard from '@/components/LeadManagementDashboard';

const LeadsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
        <p className="text-gray-600">Track and manage your leads with advanced analytics and filtering</p>
      </div>
      <LeadManagementDashboard />
    </div>
  );
};

export default LeadsPage; 