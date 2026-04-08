import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  text: string;
  type: "multiple_choice" | "checkbox" | "short_answer" | "rating";
  required?: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

const SurveyAccess = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const linkToken = searchParams.get("token") || "";

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const mapApiErrorMessage = (status?: number, fallback?: string) => {
    if (status === 400)
      return "The survey link is invalid. Please check the URL and try again.";
    if (status === 403)
      return "This survey link is invalid or no longer available.";
    if (status === 404) return "Survey not found. Please verify the link.";
    if (status === 409) return "This survey link has already been used.";
    if (status === 410) return "This survey has expired.";
    return fallback || "Something went wrong. Please try again later.";
  };

  const fetchSurvey = useCallback(async () => {
    if (!id || !linkToken) {
      setError("Missing survey token in link.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/surveys/public/${id}`, {
        params: { token: linkToken },
      });

      const surveyData = response.data as Survey;
      setSurvey(surveyData);
      setError("");
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.error;

      if (status === 409) {
        setIsSubmitted(true);
      }

      setError(mapApiErrorMessage(status, message));
    } finally {
      setLoading(false);
    }
  }, [id, linkToken]);

  const validateAnswers = (): boolean => {
    if (!survey?.questions) return true;
    const errors: Record<string, string> = {};
    survey.questions.forEach((question, index) => {
      if (!question.required) return;
      const questionId = question.id ?? `${index}`;
      const answer = answers[questionId];
      const isEmpty =
        answer === undefined ||
        answer === "" ||
        (Array.isArray(answer) && answer.length === 0);
      if (isEmpty) {
        errors[questionId] = "This question is required.";
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitResponse = async () => {
    if (!id || !linkToken) {
      setSubmitError("Invalid survey link.");
      return;
    }

    if (!validateAnswers()) {
      setSubmitError("Please answer all required questions before submitting.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);
    try {
      await api.post(
        `/responses/public/${id}`,
        { answers },
        { params: { token: linkToken } },
      );
      setIsSubmitted(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.error;
      setSubmitError(mapApiErrorMessage(status, message));
      if (status === 409) {
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleCheckboxChange = (
    questionId: string,
    option: string,
    isChecked: boolean,
  ) => {
    setAnswers((prev) => {
      const currentAnswers = Array.isArray(prev[questionId])
        ? (prev[questionId] as string[])
        : [];
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
    fetchSurvey();
  }, [fetchSurvey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center mt-48 h-screen">
        <p className="text-xl font-bold">Loading survey...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-3">Thank you!</h1>
          <p className="text-gray-700">
            Your response has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This link can no longer be used.
          </p>
        </div>
      </div>
    );
  }

  if (error || survey === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="max-w-xl w-full bg-white border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-700 mb-2">
            Unable to open survey
          </h1>
          <p className="text-gray-700">{error || "Survey is unavailable."}</p>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          <p className="text-gray-700 mt-3 whitespace-pre-wrap">
            {survey.description}
          </p>
          <button
            onClick={() => setHasStarted(true)}
            className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start survey
          </button>
        </div>
      </div>
    );
  }
  const questions = survey.questions ?? [];
  const question = questions[currentQuestion];
  const questionId = question.id ?? `${currentQuestion}`;
  const isLast = currentQuestion === questions.length - 1;
  const isFirst = currentQuestion === 0;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="p-4 border border-gray-300 rounded-md mt-4 min-w-[600px]">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{survey.title}</h1>
            <p className="text-sm text-gray-500">{survey.createdAt}</p>
          </div>
          <div className="border border-gray-300 rounded-md p-2">
            <p className="text-sm text-gray-500">
              {currentQuestion + 1} / {questions.length}
            </p>
          </div>
        </div>
        <p>{survey.description}</p>

        {/* Single question */}
        <div className="mt-4 mb-4">
          <p className="font-semibold">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {question.type === "multiple_choice" && question.options && (
            <div className="mt-2 space-y-2 flex flex-col">
              {question.options.map((option, idx) => (
                <div key={idx} className="inline-flex items-center">
                  <label className="flex items-center cursor-pointer relative">
                    <input
                      type="radio"
                      name={`question-${questionId}`}
                      checked={answers[questionId] === option}
                      onChange={() =>
                        handleMultipleChoiceChange(questionId, option)
                      }
                      className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a5 5 0 100 10 5 5 0 000-10z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </span>
                  </label>
                  <span className="ml-2">{option}</span>
                </div>
              ))}
            </div>
          )}
          {question.type === "checkbox" && question.options && (
            <div className="mt-2 space-y-2 flex flex-col">
              {question.options.map((option, idx) => (
                <div key={idx} className="inline-flex items-center">
                  <label className="flex items-center cursor-pointer relative">
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(answers[questionId]) &&
                        (answers[questionId] as string[]).includes(option)
                      }
                      onChange={(event) =>
                        handleCheckboxChange(
                          questionId,
                          option,
                          event.target.checked,
                        )
                      }
                      className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </span>
                  </label>
                  <span className="ml-2">{option}</span>
                </div>
              ))}
            </div>
          )}
          {question.type === "short_answer" && (
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              placeholder="Your answer"
              value={
                typeof answers[questionId] === "string"
                  ? (answers[questionId] as string)
                  : ""
              }
              onChange={(event) =>
                handleTextChange(questionId, event.target.value)
              }
            />
          )}
          {question.type === "rating" && (
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              min={question.scaleMin ?? 1}
              max={question.scaleMax ?? 5}
              placeholder={`Enter a rating from ${question.scaleMin ?? 1} to ${question.scaleMax ?? 5}`}
              value={
                typeof answers[questionId] === "string"
                  ? (answers[questionId] as string)
                  : ""
              }
              onChange={(event) =>
                handleTextChange(questionId, event.target.value)
              }
            />
          )}
          {validationErrors[questionId] && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors[questionId]}
            </p>
          )}
        </div>

        {submitError && (
          <div className="mt-3 border border-red-200 bg-red-50 text-red-700 rounded-md p-3 text-sm">
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <button
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
            disabled={isFirst}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Expires on{" "}
            {survey.expiryDate ? survey.expiryDate.split("T")[0] : "N/A"}
          </span>
          {isLast ? (
            <button
              onClick={submitResponse}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyAccess;
