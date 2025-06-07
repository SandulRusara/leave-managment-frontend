import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { leaveAPI } from '../../services/api';
import { LeaveRequest } from '../../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      if (user) {
        const data = await leaveAPI.getLeaves(user.id);
        setLeaves(data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-600 bg-emerald-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-amber-600 bg-amber-100';
    }
  };

  const pendingLeaves = leaves.filter(leave => leave.status === 'pending').length;
  const approvedLeaves = leaves.filter(leave => leave.status === 'approved').length;
  const totalDaysRequested = leaves.reduce((sum, leave) => sum + leave.days_requested, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100 text-lg">
              Manage your leave requests and track your time off
            </p>
          </div>
          <button
            onClick={() => navigate('/apply')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={leaves.length}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Pending Approval"
          value={pendingLeaves}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Approved Leaves"
          value={approvedLeaves}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Days Requested"
          value={totalDaysRequested}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Leave Requests</h2>
          <button
            onClick={() => navigate('/leaves')}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All
          </button>
        </div>

        {leaves.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests yet</h3>
            <p className="text-gray-600 mb-6">Start by applying for your first leave request</p>
            <button
              onClick={() => navigate('/apply')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Apply for Leave
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {leaves.slice(0, 5).map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {leave.leave_type} Leave
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{leave.reason}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{format(new Date(leave.start_date), 'MMM dd, yyyy')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}</span>
                    <span>{leave.days_requested} day{leave.days_requested > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="text-right">
                  {leave.status === 'approved' && (
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  )}
                  {leave.status === 'rejected' && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  {leave.status === 'pending' && (
                    <Clock className="w-6 h-6 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;