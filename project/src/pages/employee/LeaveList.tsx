import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { leaveAPI } from '../../services/api';
import { LeaveRequest } from '../../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const LeaveList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, statusFilter, searchTerm]);

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

  const filterLeaves = () => {
    let filtered = leaves;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(leave =>
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.leave_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaves(filtered);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="text-gray-600 mt-1">Track and manage all your leave applications</p>
        </div>
        <button
          onClick={() => navigate('/apply')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reason or leave type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {leaves.length === 0 ? 'No leave requests yet' : 'No matching requests found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {leaves.length === 0 
                ? 'Start by applying for your first leave request' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {leaves.length === 0 && (
              <button
                onClick={() => navigate('/apply')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Apply for Leave
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLeaves.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-white/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {leave.leave_type} Leave
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{leave.reason}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Start Date:</span>
                        <p>{format(new Date(leave.start_date), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <span className="font-medium">End Date:</span>
                        <p>{format(new Date(leave.end_date), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p>{leave.days_requested} day{leave.days_requested > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    {leave.admin_comment && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Admin Comment:</span>
                        <p className="text-gray-600 mt-1">{leave.admin_comment}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs text-gray-500">
                      Applied on {format(new Date(leave.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    {getStatusIcon(leave.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveList;