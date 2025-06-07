import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { LeaveRequest } from '../../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Search,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, statusFilter, searchTerm]);

  const fetchLeaves = async () => {
    try {
      const data = await leaveAPI.getLeaves();
      setLeaves(data);
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
        leave.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.leave_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaves(filtered);
  };

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      const updatedLeave = await leaveAPI.updateLeave(id, status, adminComment);
      
      setLeaves(leaves.map(leave => 
        leave.id === id ? updatedLeave : leave
      ));
      
      setSelectedLeave(null);
      setAdminComment('');
      
      toast.success(`Leave request ${status} successfully!`);
    } catch (error) {
      toast.error('Failed to update leave request');
    } finally {
      setIsUpdating(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
        <p className="text-gray-600 mt-1">Review and manage employee leave applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, reason, or leave type..."
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
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {leaves.length === 0 ? 'No leave requests yet' : 'No matching requests found'}
            </h3>
            <p className="text-gray-600">
              {leaves.length === 0 
                ? 'Leave requests will appear here once employees start applying' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLeaves.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-white/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {leave.user?.name}
                      </h3>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-700 capitalize">{leave.leave_type} Leave</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{leave.reason}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
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
                      <div>
                        <span className="font-medium">Applied:</span>
                        <p>{format(new Date(leave.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    
                    {leave.admin_comment && (
                      <div className="p-3 bg-gray-50 rounded-lg mb-4">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-700">Admin Comment:</span>
                            <p className="text-gray-600 mt-1">{leave.admin_comment}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    {getStatusIcon(leave.status)}
                    
                    {leave.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedLeave(leave)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Review Leave Request
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <span className="font-medium text-gray-700">Employee:</span>
                <p className="text-gray-900">{selectedLeave.user?.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Leave Type:</span>
                <p className="text-gray-900 capitalize">{selectedLeave.leave_type}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <p className="text-gray-900">
                  {format(new Date(selectedLeave.start_date), 'MMM dd, yyyy')} - 
                  {format(new Date(selectedLeave.end_date), 'MMM dd, yyyy')} 
                  ({selectedLeave.days_requested} day{selectedLeave.days_requested > 1 ? 's' : ''})
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Reason:</span>
                <p className="text-gray-900">{selectedLeave.reason}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Comment (Optional)
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a comment for the employee..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedLeave(null);
                  setAdminComment('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedLeave.id, 'rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedLeave.id, 'approved')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaves;