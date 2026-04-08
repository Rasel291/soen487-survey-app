import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Survey } from '../types/survey';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';

const AdminSurveys: React.FC = () => {
    const navigate = useNavigate();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [currentLink, setCurrentLink] = useState('');

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await api.get("/surveys");
      setSurveys(response.data);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;
    try {
      await api.delete(`/surveys/${id}`);
      setSurveys(surveys.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting survey:", error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await api.post(`/surveys/${id}/publish`);
      setCurrentLink(response.data.link);
      setShowLinkModal(true);
      fetchSurveys(); // refresh to update status
    } catch (error: any) {
      console.error("Error publishing survey:", error);
      alert(error.response?.data?.error || "Failed to publish survey");
    }
  };

  const handleClose = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to close this survey? It will no longer be accessible.",
      )
    )
      return;
    try {
      await api.post(`/surveys/${id}/close`);
      fetchSurveys(); // refresh
    } catch (error: any) {
      console.error("Error closing survey:", error);
      alert(error.response?.data?.error || "Failed to close survey");
    }
  };

  const isSurveyExpired = (expiryDate: string): boolean => {
    return new Date(expiryDate) < new Date();
  };

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            {/* Back Button */}
            <div className="mb-6 pl-6">
                <button
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium text-sm transition"
                >
                    ← Back to Dashboard
                </button>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Surveys</h1>
                    <Link
                        to="/admin/surveys/new"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        + New Survey
                    </Link>
                </div>

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">Loading surveys...</div>
    );
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Surveys</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleSignOut}
              className="bg-white hover:bg-slate-100 text-slate-700 font-medium px-5 py-2.5 rounded-lg shadow-sm border border-slate-200 transition duration-150"
            >
              Sign out
            </button>
            <Link
              to="/admin/surveys/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              + New Survey
            </Link>
          </div>
        </div>

        {surveys.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No surveys yet. Click "New Survey" to create one.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => {
              const expired = isSurveyExpired(survey.expiryDate);
              return (
                <div
                  key={survey.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">
                        {survey.title}
                      </h2>
                      {expired ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                          Expired
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            survey.published
                              ? "bg-teal-100 text-teal-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {survey.published ? "Published" : "Draft"}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2 line-clamp-3">
                      {survey.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      Expires: {formatExpiry(survey.expiryDate)}
                    </p>
                  </div>
                  <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-t border-slate-100">
                    <div className="flex space-x-3">
                      <Link
                        to={`/admin/surveys/edit/${survey.id}`}
                        className="text-teal-600 hover:text-teal-800 font-medium text-sm transition"
                      >
                        Edit
                      </Link>
                      {!expired ? (
                        !survey.published ? (
                          <button
                            onClick={() => handlePublish(survey.id)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition"
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleClose(survey.id)}
                            className="text-orange-600 hover:text-orange-800 font-medium text-sm transition"
                          >
                            Close
                          </button>
                        )
                      ) : (
                        <span className="text-gray-400 text-sm italic">
                          Expired
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="text-rose-600 hover:text-rose-800 font-medium text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                    {survey.published && (
                      <Link
                        to={`/admin/surveys/${survey.id}/analytics`}
                        className="px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm font-medium transition"
                      >
                        View Analytics
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for survey link */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Survey Published!
            </h2>
            <p className="text-gray-600 mb-2">
              Share this link with participants:
            </p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4 break-all">
              <a
                href={currentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {currentLink}
              </a>
            </div>
            <button
              onClick={() => setShowLinkModal(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSurveys;
