import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { leaveAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Send,
  ArrowLeft
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface LeaveForm {
  leave_type: 'sick' | 'vacation' | 'personal' | 'emergency';
  start_date: string;
  end_date: string;
  reason: string;
}

const ApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<LeaveForm>();
  const startDate = watch('start_date');
  const endDate = watch('end_date');

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const daysRequested = calculateDays(startDate, endDate);

  const onSubmit = async (data: LeaveForm) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await leaveAPI.createLeave({
        user_id: user.id,
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        days_requested: daysRequested,
        reason: data.reason,
      });

      toast.success('Leave request submitted successfully!');
      navigate('/leaves');
    } catch (error) {
      toast.error('Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/leaves')}
          className="p-2 hover:bg-white/50 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="text-gray-600 mt-1">Submit a new leave request for approval</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Leave Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'sick', label: 'Sick Leave', icon: '🏥' },
                { value: 'vacation', label: 'Vacation', icon: '🏖️' },
                { value: 'personal', label: 'Personal', icon: '👤' },
                { value: 'emergency', label: 'Emergency', icon: '🚨' },
              ].map((type) => (
                <label key={type.value} className="relative">
                  <input
                    {...register('leave_type', { required: 'Please select a leave type' })}
                    type="radio"
                    value={type.value}
                    className="sr-only peer"
                  />
                  <div className="p-4 border border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-300 hover:bg-blue-25">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.leave_type && (
              <p className="mt-2 text-sm text-red-600">{errors.leave_type.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('start_date', { 
                    required: 'Start date is required',
                    validate: (value) => {
                      const today = new Date().toISOString().split('T')[0];
                      return value >= today || 'Start date cannot be in the past';
                    }
                  })}
                  type="date"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
              </div>
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('end_date', { 
                    required: 'End date is required',
                    validate: (value) => {
                      if (!startDate) return true;
                      return value >= startDate || 'End date must be after start date';
                    }
                  })}
                  type="date"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
              </div>
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {daysRequested > 0 && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Duration: {daysRequested} day{daysRequested > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                {...register('reason', { 
                  required: 'Please provide a reason for your leave',
                  minLength: {
                    value: 10,
                    message: 'Reason must be at least 10 characters long'
                  }
                })}
                rows={4}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 resize-none"
                placeholder="Please provide details about your leave request..."
              />
            </div>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/leaves')}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex items-center justify-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm\" className="text-white" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;