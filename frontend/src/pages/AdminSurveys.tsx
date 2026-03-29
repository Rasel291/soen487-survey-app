import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Survey } from '../types/survey';

const AdminSurveys: React.FC = () => {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            const response = await api.get('/surveys');
            setSurveys(response.data);
        } catch (error) {
            console.error('Error fetching surveys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this survey?')) return;
        try {
            await api.delete(`/surveys/${id}`);
            setSurveys(surveys.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting survey:', error);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Loading surveys...</div>;

    // Helper: format expiry date from ISO string (YYYY-MM-DD)
    const formatExpiry = (isoString: string) => {
        if (!isoString) return 'No expiry';
        return isoString.split('T')[0];
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8">
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

                {surveys.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                        No surveys yet. Click "New Survey" to create one.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {surveys.map((survey) => (
                            <div
                                key={survey.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">
                                            {survey.title}
                                        </h2>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${survey.published
                                                ? 'bg-teal-100 text-teal-800'
                                                : 'bg-amber-100 text-amber-800'
                                                }`}
                                        >
                                            {survey.published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mt-2 line-clamp-3">{survey.description}</p>
                                    <p className="text-sm text-gray-500 mt-3">
                                        Expires: {formatExpiry(survey.expiryDate)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-t border-slate-100">
                                    <Link
                                        to={`/admin/surveys/edit/${survey.id}`}
                                        className="text-teal-600 hover:text-teal-800 font-medium text-sm transition"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(survey.id)}
                                        className="text-rose-600 hover:text-rose-800 font-medium text-sm transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSurveys;