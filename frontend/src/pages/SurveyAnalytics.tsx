import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Survey } from '../types/survey';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface SurveyResponse {
    id: string;
    surveyId: string;
    answers: Record<string, string | string[] | number>;
    submittedAt: { _seconds: number; _nanoseconds: number } | string | null;
    accessToken?: string;
}
const formatSubmittedAt = (submittedAt: SurveyResponse['submittedAt']): string => {
    if (!submittedAt) return 'N/A';
    if (typeof submittedAt === 'object' && '_seconds' in submittedAt) {
        return new Date(submittedAt._seconds * 1000).toLocaleString();
    }
    if (typeof submittedAt === 'string') {
        return new Date(submittedAt).toLocaleString();
    }
    return 'N/A';
};

const SurveyAnalytics: React.FC = () => {
    const { id } = useParams();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const [surveyRes, responsesRes] = await Promise.all([
                    api.get(`/surveys/${id}`),
                    api.get(`/surveys/${id}/responses`)
                ]);
                setSurvey(surveyRes.data);
                setResponses(responsesRes.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load analytics data.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAnalyticsData();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-xl font-medium text-gray-500">Loading analytics...</p>
        </div>
    );
    if (error || !survey) return (
        <div className="p-6 text-center text-red-500 font-medium">
            {error || 'Survey not found'}
        </div>
    );

    const totalResponses = responses.length;
    const questions = survey.questions ?? [];

    const getChoiceCounts = (questionId: string, options: string[]) => {
        const counts: Record<string, number> = {};
        options.forEach(opt => counts[opt] = 0);
        responses.forEach(res => {
            const answer = res.answers[questionId];
            if (Array.isArray(answer)) {
                answer.forEach(a => { if (a in counts) counts[a]++; });
            } else if (typeof answer === 'string' && answer in counts) {
                counts[answer]++;
            }
        });
        return counts;
    };

    const getRatingCounts = (questionId: string, min: number, max: number) => {
        const labels = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
        const counts: Record<string, number> = {};
        labels.forEach(l => counts[l] = 0);
        responses.forEach(res => {
            const answer = String(res.answers[questionId]);
            if (answer in counts) counts[answer]++;
        });
        return { labels, counts };
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                            Analytics: {survey.title}
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            Created on {survey.createdAt ? survey.createdAt.split('T')[0] : 'N/A'}
                        </p>
                    </div>
                    <Link
                        to="/admin/surveys"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm font-medium"
                    >
                        &larr; Back to Surveys
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            Total Responses
                        </p>
                        <p className="text-5xl font-extrabold text-indigo-600 mt-2">{totalResponses}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            Total Questions
                        </p>
                        <p className="text-5xl font-extrabold text-violet-500 mt-2">{questions.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            Expires
                        </p>
                        <p className="text-2xl font-extrabold text-emerald-500 mt-2">
                            {survey.expiryDate ? survey.expiryDate.split('T')[0] : 'N/A'}
                        </p>
                    </div>
                </div>

                {totalResponses === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No responses yet</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Charts and individual responses will appear here once participants submit.
                        </p>
                    </div>
                ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {questions.map((q, index) => {
                          const questionId = q.id ?? `${index}`;

                          if ((q.type === 'multiple_choice' || q.type === 'checkbox') && q.options) {
                            const counts = getChoiceCounts(questionId, q.options);

                            const pieData = {
                              labels: Object.keys(counts),
                              datasets: [
                                {
                                  data: Object.values(counts),
                                  backgroundColor: [
                                    '#4F46E5',
                                    '#10B981',
                                    '#F59E0B',
                                    '#EF4444',
                                    '#3B82F6',
                                    '#8B5CF6',
                                    '#14B8A6',
                                    '#F97316'
                                  ],
                                  borderWidth: 1,
                                  borderColor: '#ffffff'
                                }
                              ]
                            };

                            return (
                              <div
                                key={questionId}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                              >
                                <h2 className="text-base font-bold text-slate-800 mb-1">
                                  {q.text}
                                </h2>

                                <p className="text-xs text-slate-400 mb-4 uppercase tracking-wide">
                                  {q.type === 'checkbox' ? 'Checkbox' : 'Multiple Choice'}
                                </p>

                                <div className="w-full max-w-[280px] mx-auto" style={{ height: 280 }}>
                                  <Pie
                                    data={pieData}
                                    options={{
                                      maintainAspectRatio: false,
                                      plugins: {
                                        legend: {
                                          position: 'bottom',
                                          labels: {
                                            color: '#475569',
                                            font: { size: 12 }
                                          }
                                        },
                                        tooltip: {
                                          backgroundColor: '#1F2937',
                                          titleColor: '#fff',
                                          bodyColor: '#fff'
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          if (q.type === 'rating') {
                            const min = q.scaleMin ?? 1;
                            const max = q.scaleMax ?? 5;
                            const { labels, counts } = getRatingCounts(questionId, min, max);

                            const barData = {
                              labels,
                              datasets: [
                                {
                                  label: 'Responses',
                                  data: labels.map(l => counts[l]),
                                  backgroundColor: '#4F46E5',
                                  borderColor: '#3730A3',
                                  borderWidth: 1,
                                  borderRadius: 6
                                }
                              ]
                            };

                            return (
                              <div
                                key={questionId}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                              >
                                <h2 className="text-base font-bold text-slate-800 mb-1">
                                  {q.text}
                                </h2>

                                <p className="text-xs text-slate-400 mb-4 uppercase tracking-wide">
                                  Rating Scale
                                </p>

                                <div style={{ height: 280 }}>
                                  <Bar
                                    data={barData}
                                    options={{
                                      maintainAspectRatio: false,
                                      scales: {
                                        y: {
                                          beginAtZero: true,
                                          ticks: { stepSize: 1 },
                                          grid: { color: '#E5E7EB' }
                                        },
                                        x: {
                                          grid: { display: false }
                                        }
                                      },
                                      plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                          backgroundColor: '#1F2937',
                                          titleColor: '#fff',
                                          bodyColor: '#fff'
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // SHORT ANSWER
                          if (q.type === 'short_answer') {
                            const textAnswers = responses
                              .map(r => r.answers[questionId])
                              .filter(a => typeof a === 'string' && a.trim() !== '') as string[];

                            return (
                              <div
                                key={questionId}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                              >
                                <h2 className="text-base font-bold text-slate-800 mb-1">
                                  {q.text}
                                </h2>

                                <p className="text-xs text-slate-400 mb-4 uppercase tracking-wide">
                                  Short Answer
                                </p>

                                <p className="text-sm text-slate-500 mb-3">
                                  {textAnswers.length} responses
                                </p>

                                <ul className="space-y-2 max-h-64 overflow-y-auto">
                                  {textAnswers.length === 0 ? (
                                    <li className="text-slate-400 italic text-sm">
                                      No answers yet
                                    </li>
                                  ) : (
                                    textAnswers.map((a, i) => (
                                      <li
                                        key={i}
                                        className="text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-2 border border-slate-100"
                                      >
                                        {a}
                                      </li>
                                    ))
                                  )}
                                </ul>
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">Individual Responses</h2>
                                <span className="text-sm text-slate-500">{totalResponses} total</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 whitespace-nowrap">#</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Submitted At</th>
                                            {questions.map((q, index) => (
                                                <th key={q.id ?? index} className="px-6 py-4 min-w-[180px]">
                                                    {q.text}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {responses.map((r, rowIndex) => (
                                            <tr key={r.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-slate-400 text-xs">{rowIndex + 1}</td>
                                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                    {formatSubmittedAt(r.submittedAt)}
                                                </td>
                                                {questions.map((q, index) => {
                                                    const questionId = q.id ?? `${index}`;
                                                    const answer = r.answers[questionId];
                                                    const display = Array.isArray(answer)
                                                        ? answer.join(', ')
                                                        : answer ?? '';
                                                    return (
                                                        <td key={questionId} className="px-6 py-4 text-slate-700">
                                                            {display
                                                                ? display
                                                                : <span className="text-slate-300 italic">—</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SurveyAnalytics;