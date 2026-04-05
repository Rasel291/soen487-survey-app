import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Question, QuestionType } from '../types/survey';

// Helper: get today's date 
const getTodayUTC = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
        .toISOString()
        .split('T')[0];
};

const SurveyForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (id) {
            const fetchSurvey = async () => {
                try {
                    const response = await api.get(`/surveys/${id}`);
                    const survey = response.data;
                    setTitle(survey.title);
                    setDescription(survey.description);
                    if (survey.expiryDate) {
                        const utcDate = survey.expiryDate.split('T')[0];
                        setExpiryDate(utcDate);
                    }
                    if (survey.questions) {
                        setQuestions(survey.questions);
                    }
                } catch (err) {
                    console.error(err);
                    setError('Failed to load survey');
                }
            };
            fetchSurvey();
        }
    }, [id]);

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        const q = updatedQuestions[questionIndex];
        if (q.options) {
            q.options[optionIndex] = value;
            setQuestions(updatedQuestions);
        }
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...questions];
        const q = updatedQuestions[questionIndex];
        if (q.options && q.options.length > 1) {
            q.options = q.options.filter((_, i) => i !== optionIndex);
            setQuestions(updatedQuestions);
        }
    };

    const addOption = (questionIndex: number) => {
        const updatedQuestions = [...questions];
        const q = updatedQuestions[questionIndex];
        if (q.options) {
            q.options.push(`Option ${q.options.length + 1}`);
            setQuestions(updatedQuestions);
        }
    };

    const addQuestion = (type: QuestionType) => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: '',
            type,
            required: false,
            ...(type === 'multiple_choice' || type === 'checkbox' ? { options: ['Option 1'] } : {}),
            ...(type === 'rating' ? { scaleMin: 1, scaleMax: 5 } : {})
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setQuestions(updatedQuestions);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !expiryDate) {
            setError('All fields are required');
            return;
        }
        if (questions.length === 0) {
            setError("Please add at least one question");
            return;
        }
        
        setLoading(true);
        try {
            const payload = { title, description, expiryDate, questions };
            if (id) {
                await api.put(`/surveys/${id}`, payload);
            } else {
                await api.post('/surveys', payload);
            }
            navigate('/admin/surveys');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-8">
                        <h1 className="text-2xl font-bold text-slate-800 mb-6">
                            {id ? 'Edit Survey' : 'Create New Survey'}
                        </h1>
                        {error && (
                            <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded">
                                <p className="text-rose-700">{error}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Date
                                </label>
                                <input
                                    type="date"
                                    id="expiryDate"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    min={getTodayUTC()}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">Questions</h2>

                                <select
                                    onChange={(e) => {
                                    if (e.target.value) {
                                        addQuestion(e.target.value as QuestionType);
                                        e.target.value = '';
                                    }
                                    }}
                                    className="w-60 border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    defaultValue=""
                                >
                                    <option value="" disabled>+ Add Question</option>
                                    <option value="short_answer">Short Answer</option>
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="checkbox">Checkboxes</option>
                                    <option value="rating">Rating</option>
                                </select>
                                </div>
                                {questions.map((q, qIndex) => (
                                <div
                                    key={q.id}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-6">
                                    <div className="flex justify-between items-center mb-4">

                                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 capitalize">
                                        {q.type.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                        <span className="text-sm text-gray-500">Required</span>
                                        <div className="relative">
                                            <input
                                            type="checkbox"
                                            checked={q.required}
                                            onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                                            className="sr-only"
                                            />
                                            <div className={`w-10 h-5 rounded-full transition ${q.required ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition transform ${q.required ? 'translate-x-5' : ''}`}></div>
                                        </div>
                                        </label>

                                        <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-gray-400 hover:text-red-500 transition text-lg"
                                        >
                                        ✕
                                        </button>

                                    </div>
                                    </div>

                                    <input
                                    type="text"
                                    placeholder="Type your question here..."
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                    className="w-full text-lg font-medium border-b border-gray-300 focus:outline-none focus:border-indigo-500 pb-2"
                                    required/>

                                    {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
                                    <div className="mt-5 space-y-2">

                                        {q.options?.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center space-x-3">

                                            <div className={`w-4 h-4 border ${q.type === 'multiple_choice' ? 'rounded-full' : 'rounded'} border-gray-400`}></div>

                                            <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            className="flex-1 border-b border-gray-300 bg-transparent px-2 py-1 focus:outline-none focus:border-indigo-500 text-sm"
                                            />

                                            <button
                                            type="button"
                                            onClick={() => removeOption(qIndex, oIndex)}
                                            className="text-gray-400 hover:text-red-500 text-lg"
                                            >
                                            ✕
                                            </button>
                                        </div>
                                        ))}

                                        <button
                                        type="button"
                                        onClick={() => addOption(qIndex)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2"
                                        >
                                        + Add Option
                                        </button>
                                    </div>
                                    )}

                                    {q.type === 'rating' && (
                                    <div className="mt-5 flex items-center space-x-6">
                                        <div>
                                        <label className="text-sm text-gray-500">Min</label>
                                        <input
                                            type="number"
                                            value={q.scaleMin}
                                            onChange={(e) => updateQuestion(qIndex, 'scaleMin', parseInt(e.target.value))}
                                            className="w-16 ml-2 border rounded px-2 py-1"
                                        />
                                        </div>

                                        <div>
                                        <label className="text-sm text-gray-500">Max</label>
                                        <input
                                            type="number"
                                            value={q.scaleMax}
                                            onChange={(e) => updateQuestion(qIndex, 'scaleMax', parseInt(e.target.value))}
                                            className="w-16 ml-2 border rounded px-2 py-1"
                                        />
                                        </div>
                                    </div>
                                    )}

                                    {q.type === 'short_answer' && (
                                    <div className="mt-5">
                                        <div className="w-full border-b border-gray-300 py-2 text-gray-400 text-sm italic">
                                        User will type a short answer here...
                                        </div>
                                    </div>
                                    )}

                                </div>
                                ))}

                                {questions.length === 0 && (
                                <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                                    No questions added yet.
                                </div>
                                )}

                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/surveys')}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
                                >
                                    {loading ? 'Saving...' : id ? 'Update Survey' : 'Create Survey'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyForm;