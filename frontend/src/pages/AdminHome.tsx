import React from 'react';
import { Link } from 'react-router-dom';

const AdminHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your surveys and participants from one place.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Survey Management */}
          <Link
            to="/admin/surveys"
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg hover:border-indigo-300 transition duration-200"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-indigo-100 text-indigo-600 text-3xl mb-6">
              📝
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3 group-hover:text-indigo-600 transition">
              Survey Management
            </h2>
            <p className="text-slate-600 mb-6">
              Create, edit, publish, close, and manage all surveys.
            </p>
            <span className="inline-flex items-center font-medium text-indigo-600 group-hover:translate-x-1 transition">
              Go to Surveys →
            </span>
          </Link>

          {/* Participant Management */}
          <Link
            to="/admin/participants"
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg hover:border-teal-300 transition duration-200"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-teal-100 text-teal-600 text-3xl mb-6">
              👥
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3 group-hover:text-teal-600 transition">
              Participant Management
            </h2>
            <p className="text-slate-600 mb-6">
              Upload participant emails, review the list, and send survey invites.
            </p>
            <span className="inline-flex items-center font-medium text-teal-600 group-hover:translate-x-1 transition">
              Go to Participants →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;