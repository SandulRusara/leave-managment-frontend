import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { LeaveStats } from '../../types';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await leaveAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const approvalRate = stats.total_requests > 0 
    ? Math.round((stats.approved_requests / stats.total_requests) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-indigo-100 text-lg">
              Monitor and manage leave requests across your organization
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{approvalRate}%</p>
              <p className="text-indigo-100 text-sm">Approval Rate</p>
            </div>
            <Activity className="w-12 h-12 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.total_users}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Requests"
          value={stats.total_requests}
          icon={Calendar}
          color="purple"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending_requests}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={stats.approved_requests}
          icon={CheckCircle}
          color="green"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected_requests}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-900">Approval Rate</h3>
                <p className="text-sm text-gray-600">Overall approval percentage</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">{approvalRate}%</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-900">Active Employees</h3>
                <p className="text-sm text-gray-600">Total registered employees</p>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{stats.total_users}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-900">Needs Review</h3>
                <p className="text-sm text-gray-600">Pending leave requests</p>
              </div>
              <div className="text-2xl font-bold text-amber-600">{stats.pending_requests}</div>
            </div>
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Leave Distribution</h2>
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            {/* Progress bars for different statuses */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Approved</span>
                  <span className="text-emerald-600">{stats.approved_requests}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total_requests > 0 ? (stats.approved_requests / stats.total_requests) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Pending</span>
                  <span className="text-amber-600">{stats.pending_requests}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total_requests > 0 ? (stats.pending_requests / stats.total_requests) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Rejected</span>
                  <span className="text-red-600">{stats.rejected_requests}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total_requests > 0 ? (stats.rejected_requests / stats.total_requests) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;