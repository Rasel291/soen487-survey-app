import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Survey } from '../types/survey';
import { useNavigate } from 'react-router-dom';

type Participant = {
  id: string;
  email: string;
  surveyId: string;
  invitedAt?: string | null;
};

const ParticipantManagement: React.FC = () => {
    const navigate = useNavigate();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [emailInput, setEmailInput] = useState('');
    const [loadingSurveys, setLoadingSurveys] = useState(true);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [invalidEmails, setInvalidEmails] = useState<string[]>([]);

    useEffect(() => {
        fetchSurveys();
    }, []);

    useEffect(() => {
        if (selectedSurveyId) {
        fetchParticipants(selectedSurveyId);
        } else {
        setParticipants([]);
        }
    }, [selectedSurveyId]);

    const selectedSurvey = useMemo(
        () => surveys.find((s) => s.id === selectedSurveyId),
        [surveys, selectedSurveyId]
    );

    const fetchSurveys = async () => {
        try {
        setLoadingSurveys(true);
        const response = await api.get('/surveys');
        setSurveys(response.data);

        // optional: preselect first survey
        if (response.data.length > 0) {
            setSelectedSurveyId(response.data[0].id);
        }
        } catch (error) {
        console.error('Error fetching surveys:', error);
        setMessage('Failed to load surveys.');
        } finally {
        setLoadingSurveys(false);
        }
    };

    const fetchParticipants = async (surveyId: string) => {
        try {
        setLoadingParticipants(true);
        const response = await api.get(`/participants/${surveyId}`);
        setParticipants(response.data);
        } catch (error) {
        console.error('Error fetching participants:', error);
        setMessage('Failed to load participants.');
        } finally {
        setLoadingParticipants(false);
        }
    };

    const parseEmails = (raw: string): string[] => {
        return raw
        .split(/[\n,;]+/)
        .map((email) => email.trim())
        .filter(Boolean);
    };

    const handleUpload = async () => {
        if (!selectedSurveyId) {
        setMessage('Please select a survey first.');
        return;
        }

        const emails = parseEmails(emailInput);

        if (emails.length === 0) {
        setMessage('Please enter at least one email.');
        return;
        }

        try {
        setUploading(true);
        setMessage('');
        setInvalidEmails([]);

        const response = await api.post(`/participants/${selectedSurveyId}/upload`, {
            emails,
        });

        setMessage(`Uploaded ${response.data.uploaded} participant(s).`);
        setInvalidEmails(response.data.invalid || []);
        setEmailInput('');
        fetchParticipants(selectedSurveyId);
        } catch (error: any) {
        console.error('Error uploading participants:', error);
        setMessage(error.response?.data?.error || 'Failed to upload participants.');
        } finally {
        setUploading(false);
        }
    };

    const handleSendInvites = async () => {
        if (!selectedSurveyId) {
        setMessage('Please select a survey first.');
        return;
        }

        if (participants.length === 0) {
        setMessage('No participants to send invites to.');
        return;
        }

        try {
        setSending(true);
        setMessage('');

        const response = await api.post(`/participants/${selectedSurveyId}/send`);
        setMessage(`Sent ${response.data.sent} invite(s).`);
        fetchParticipants(selectedSurveyId);
        } catch (error: any) {
        console.error('Error sending invites:', error);
        setMessage(error.response?.data?.error || 'Failed to send invites.');
        } finally {
        setSending(false);
        }
    };

    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
        const text = await file.text();
        setEmailInput(text);
        setMessage('CSV/text file loaded. Review emails, then click Upload Participants.');
        } catch (error) {
        console.error('Error reading file:', error);
        setMessage('Failed to read file.');
        }
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Participant Management</h1>
          <p className="text-slate-600">
            Select a survey, upload participant emails, review the list, and send invitations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Survey Selection and Email Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Select Survey</h2>

            {loadingSurveys ? (
              <p className="text-slate-500">Loading surveys...</p>
            ) : (
              <select
                value={selectedSurveyId}
                onChange={(e) => setSelectedSurveyId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a survey</option>
                {surveys.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.title}
                  </option>
                ))}
              </select>
            )}

            {selectedSurvey && (
              <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <h3 className="font-semibold text-slate-800">{selectedSurvey.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{selectedSurvey.description}</p>
              </div>
            )}

            <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Upload Emails</h2>

            <textarea
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={`Enter emails separated by commas, semicolons, or new lines`}
              rows={10}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedSurveyId}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium px-5 py-3 rounded-lg transition"
              >
                {uploading ? 'Uploading...' : 'Upload Participants'}
              </button>

              <label className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium px-5 py-3 rounded-lg transition text-center">
                Load CSV / TXT
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleSendInvites}
              disabled={sending || !selectedSurveyId || participants.length === 0}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-medium px-5 py-3 rounded-lg transition"
            >
              {sending ? 'Sending Invites...' : 'Send Survey Invites'}
            </button>

            {message && (
              <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-blue-800">
                {message}
              </div>
            )}

            {invalidEmails.length > 0 && (
              <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3">
                <p className="font-semibold text-rose-700 mb-2">Invalid emails:</p>
                <ul className="list-disc list-inside text-rose-700 text-sm space-y-1">
                  {invalidEmails.map((email, index) => (
                    <li key={`${email}-${index}`}>{email}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Participant List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Participant List</h2>

            {!selectedSurveyId ? (
              <p className="text-slate-500">Select a survey to view participants.</p>
            ) : loadingParticipants ? (
              <p className="text-slate-500">Loading participants...</p>
            ) : participants.length === 0 ? (
              <p className="text-slate-500">No participants uploaded yet.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Invite Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-4 py-3 text-sm text-slate-700">{participant.email}</td>
                        <td className="px-4 py-3 text-sm">
                          {participant.invitedAt ? (
                            <span className="inline-flex px-2 py-1 rounded-full bg-teal-100 text-teal-700 font-medium">
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-sm text-slate-500">
              Total participants: <span className="font-semibold">{participants.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantManagement;