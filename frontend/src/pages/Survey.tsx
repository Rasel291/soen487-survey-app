import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export interface Survey {
    id?: string;
    title: string;
    description: string;
    expiryDate: string;
    published: boolean;
    createdAt: string;
    createdBy: string;
    questions?: Question[];
}

interface Question {
    id?: string;
    type: 'text' | 'multiple-choice' | 'checkbox';
    questionText: string;
    options?: string[];
}

const fallbackQuestions: Question[] = [
    {
        id: "q1",
        type: "text",
        questionText: "What do you like most about our product?"
    },
    {
        id: "q2",
        type: "multiple-choice",
        questionText: "How often do you use our product?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"]
    },
    {
        id: "q3",
        type: "checkbox",
        questionText: "Which features do you use?",
        options: ["Feature A", "Feature B", "Feature C", "Feature D"]
    }
];

const SurveyAccess = () => {

    const { id } = useParams();

    const fetchSurvey = useCallback(async () => {
        const response = await api.get(`/surveys/${id}`);
        const survey = response.data as Survey;
        console.log("Fetched Survey:", response.data);
        setSurvey({
            ...survey,
            questions: survey.questions && survey.questions.length > 0 ? survey.questions : fallbackQuestions,
        });
    }, [id]);

    const submitResponse = async () => {
        const response = await api.post(`/responses/${id}`, {
            answers: answers,
        });
        console.log("Submit Response Result:", response.data);
    }

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

    const handleTextChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleMultipleChoiceChange = (questionId: string, option: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    };

    const handleCheckboxChange = (questionId: string, option: string, isChecked: boolean) => {
        setAnswers((prev) => {
            const currentAnswers = Array.isArray(prev[questionId]) ? prev[questionId] as string[] : [];
            if (isChecked) {
                return {
                    ...prev,
                    [questionId]: [...currentAnswers, option],
                };
            } else {
                return {
                    ...prev,
                    [questionId]: currentAnswers.filter((ans) => ans !== option),
                };
            }
        });
    };

    useEffect(() => {
        console.log("Current Answers:", answers);
    }, [answers]);

    useEffect(() => {
        fetchSurvey();
    }, [fetchSurvey]);

    if (survey === null) {
        return (
            <div className="flex flex-col items-center mt-48 h-screen">
                <p className="text-xl font-bold">Loading survey...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="p-4 border border-gray-300 rounded-md mt-4 min-w-[600px]">
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">{survey.title}</h1>
                        <p className="text-sm text-gray-500">{survey.createdAt}</p>
                    </div>
                    <div className="border border-gray-300 rounded-md p-2">
                        <p className="text-sm text-gray-500"> {id} </p>
                    </div>
                </div>
                <p>{survey.description}</p>
                {survey.questions && (
                    <div className="mt-4">
                        {survey.questions.map((question, index) => {
                            const questionId = question.id ?? `${index}`;

                            return (
                                <div key={index} className="mb-4">
                                    <p className="font-semibold">{question.questionText}</p>
                                    {question.type === 'multiple-choice' && question.options && (
                                        <div className="mt-2 space-y-2 flex flex-col">
                                            {question.options.map((option, idx) => (
                                                <div key={idx} className="inline-flex items-center">
                                                    <label className="flex items-center cursor-pointer relative">
                                                        <input
                                                            type="radio"
                                                            name={`question-${questionId}`}
                                                            checked={answers[questionId] === option}
                                                            onChange={() => handleMultipleChoiceChange(questionId, option)}
                                                            className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                                                        />
                                                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                                                <path fillRule="evenodd" d="M10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd"></path>
                                                            </svg>
                                                        </span>
                                                    </label>
                                                    <span className="ml-2">{option}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {question.type === 'checkbox' && question.options && (
                                        <div className="mt-2 space-y-2 flex flex-col">
                                            {question.options.map((option, idx) => (
                                                <div key={idx} className="inline-flex items-center">
                                                    <label className="flex items-center cursor-pointer relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={Array.isArray(answers[questionId]) && answers[questionId].includes(option)}
                                                            onChange={(event) => handleCheckboxChange(questionId, option, event.target.checked)}
                                                            className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                                                        />
                                                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                            </svg>
                                                        </span>
                                                    </label>
                                                    <span className="ml-2">{option}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {question.type === 'text' && (
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md p-2 mt-1"
                                            placeholder="Your answer"
                                            value={typeof answers[questionId] === 'string' ? answers[questionId] : ''}
                                            onChange={(event) => handleTextChange(questionId, event.target.value)}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                <div className="mt-4 items-end text-sm text-gray-500 flex justify-between">
                    <div>
                        <button onClick={submitResponse} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Submit
                        </button>
                    </div>
                    <div>
                        created by {survey.createdBy}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SurveyAccess;