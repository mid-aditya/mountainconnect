import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  CheckIcon,
  XMarkIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  ShoppingBagIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ContentItem {
  id: string;
  type: 'forum_post' | 'listing' | 'review' | 'comment';
  author: string;
  content: string;
  flagCount: number;
  flagReasons: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
}

interface UserReport {
  id: string;
  reporter: string;
  reportedUser: string;
  reason: string;
  evidence?: string;
  status: 'pending' | 'reviewed' | 'actioned';
  createdAt: string;
}

const ModerationTools: NextPage = () => {
  const [content, setContent] = useState<ContentItem[]>([
    { id: '1', type: 'forum_post', author: 'Hiker123', content: 'Anyone climbed Rinjani this week? Looking for tips...', flagCount: 2, flagReasons: ['Spam', 'Off-topic'], createdAt: '2024-08-22', status: 'pending' },
    { id: '2', type: 'listing', author: 'GearSeller', content: 'Selling fake trekking poles - claiming premium brand...', flagCount: 5, flagReasons: ['Fraud', 'Counterfeit'], createdAt: '2024-08-21', status: 'pending' },
    { id: '3', type: 'review', author: 'SummitSeeker', content: 'This trail was amazing but the operator was rude...', flagCount: 1, flagReasons: ['Defamation'], createdAt: '2024-08-20', status: 'pending' },
    { id: '4', type: 'comment', author: 'TrailBlazer', content: 'Thanks for sharing! Definitely going next month.', flagCount: 0, flagReasons: [], createdAt: '2024-08-19', status: 'pending' },
  ]);

  const [userReports] = useState<UserReport[]>([
    { id: '1', reporter: 'Dewi L.', reportedUser: 'Spammer99', reason: 'Posting spam links repeatedly', status: 'pending', createdAt: '2024-08-22' },
    { id: '2', reporter: 'Fajar N.', reportedUser: 'FakeGear', reason: 'Selling counterfeit equipment', evidence: 'photos_attached', status: 'reviewed', createdAt: '2024-08-20' },
    { id: '3', reporter: 'Admin', reportedUser: 'ToxicUser', reason: 'Harassing other hikers in forum', status: 'actioned', createdAt: '2024-08-15' },
  ]);

  const [stats] = useState({
    pending: 12,
    approvedToday: 45,
    rejectedToday: 8,
    warnings: 3,
  });

  const handleApprove = (id: string) => {
    setContent(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    toast.success('Content approved');
  };

  const handleReject = (id: string) => {
    setContent(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    toast.success('Content rejected');
  };

  const handleRemove = (id: string) => {
    setContent(prev => prev.map(c => c.id === id ? { ...c, status: 'removed' } : c));
    toast.success('Content removed');
  };

  const handleWarn = (userId: string) => {
    toast.success('Warning issued to user');
  };

  const pendingContent = content.filter(c => c.status === 'pending');

  const typeIcons = {
    forum_post: <ChatBubbleLeftIcon className="w-4 h-4" />,
    listing: <ShoppingBagIcon className="w-4 h-4" />,
    review: <StarIcon className="w-4 h-4" />,
    comment: <ChatBubbleLeftIcon className="w-4 h-4" />,
  };

  return (
    <>
      <Head><title>Moderation Tools - MountainConnect ID</title></Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Moderation Dashboard</h1>
            <p className="text-sm text-gray-500">Review flagged content and manage user reports</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-danger-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-primary-600">{stats.approvedToday}</p>
              <p className="text-sm text-gray-500">Approved Today</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-600">{stats.rejectedToday}</p>
              <p className="text-sm text-gray-500">Rejected Today</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-accent-600">{stats.warnings}</p>
              <p className="text-sm text-gray-500">Warnings Issued</p>
            </div>
          </div>

          {/* Pending Content Queue */}
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlagIcon className="w-5 h-5 text-danger-600" />
                <h2 className="font-semibold text-gray-900">Pending Content ({pendingContent.length})</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingContent.map(item => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-gray-100 rounded text-gray-600">{typeIcons[item.type]}</span>
                        <span className="text-sm text-gray-500 capitalize">{item.type.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-400">by {item.author}</span>
                        <span className="text-xs text-gray-400">{format(new Date(item.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-gray-900 mb-2">{item.content}</p>
                      {item.flagCount > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="badge bg-red-100 text-red-700">{item.flagCount} flags</span>
                          {item.flagReasons.map((reason, i) => (
                            <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{reason}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleApprove(item.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleReject(item.id)} className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Reject">
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleRemove(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Remove">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Reports */}
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-accent-600" />
              <h2 className="font-semibold text-gray-900">User Reports</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="p-3 text-left">Reporter</th>
                    <th className="p-3 text-left">Reported User</th>
                    <th className="p-3 text-left">Reason</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {userReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{report.reporter}</td>
                      <td className="p-3 text-gray-600">{report.reportedUser}</td>
                      <td className="p-3 text-gray-600 max-w-xs truncate">{report.reason}</td>
                      <td className="p-3 text-gray-500">{format(new Date(report.createdAt), 'MMM d, yyyy')}</td>
                      <td className="p-3">
                        <span className={`badge ${report.status === 'actioned' ? 'bg-red-100 text-red-700' : report.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {report.status === 'pending' && (
                          <>
                            <button onClick={() => handleWarn(report.reportedUser)} className="btn-secondary text-xs py-1 mr-2">Warn</button>
                            <button className="btn-danger text-xs py-1">Ban</button>
                          </>
                        )}
                        {report.status === 'reviewed' && (
                          <button className="btn-primary text-xs py-1">Take Action</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ModerationTools;
