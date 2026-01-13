import React, { useState } from 'react';
import { ResumeData, AnalysisResult, AppState } from './types';
import * as GeminiService from './services/geminiService';
import FileUpload from './components/FileUpload';
import ScoreChart from './components/ScoreChart';
import ResumePreview from './components/ResumePreview';
import { 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  LayoutTemplate, 
  Download,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [isCondensed, setIsCondensed] = useState(false);

  // Handlers
  const handleFileSelect = async (file: File) => {
    try {
      setLoadingMsg('Parsing resume structure...');
      setAppState(AppState.ANALYZING);
      
      const parsedData = await GeminiService.parseResumeFile(file);
      setResumeData(parsedData);
      
      // If we don't have a JD yet, we can ask user or just analyze generally
      // For this flow, we'll auto-analyze immediately for general ATS
      handleAnalyze(parsedData, jobDescription);

    } catch (error) {
      console.error(error);
      alert("Failed to parse resume. Please try a different file.");
      setAppState(AppState.UPLOAD);
    }
  };

  const handleAnalyze = async (data: ResumeData, jd: string) => {
    try {
      setLoadingMsg('Analyzing against ATS algorithms...');
      const result = await GeminiService.analyzeResume(data, jd);
      setAnalysis(result);
      setAppState(AppState.DASHBOARD);
    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
      setAppState(AppState.UPLOAD); // simplified error handling
    }
  };

  const handleJobDescriptionSubmit = () => {
    if (resumeData) {
      setAppState(AppState.ANALYZING);
      handleAnalyze(resumeData, jobDescription);
    }
  };

  const resetApp = () => {
    setAppState(AppState.UPLOAD);
    setResumeData(null);
    setAnalysis(null);
    setJobDescription('');
  };

  // Render Helpers
  const renderStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">JobSuit<span className="text-blue-600">.ai</span></span>
          </div>
          <div className="flex items-center gap-4">
            {appState === AppState.DASHBOARD && (
              <button 
                onClick={resetApp}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" /> Start Over
              </button>
            )}
            {!process.env.API_KEY && (
               <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Missing API Key</span>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow p-6">
        {/* Upload View */}
        {appState === AppState.UPLOAD && (
          <div className="max-w-4xl mx-auto mt-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Optimize your resume for Fortune 500 ATS</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get a real-time compatibility score, fix formatting errors, and tailor your resume to specific job descriptions using advanced AI.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
               <h2 className="text-lg font-semibold mb-4 text-gray-800">1. Upload Resume</h2>
               <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
            </div>

             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 opacity-60 pointer-events-none">
               <h2 className="text-lg font-semibold mb-4 text-gray-800">2. Add Job Description (Optional)</h2>
               <textarea className="w-full border border-gray-300 rounded-lg p-3 h-32 bg-gray-50" placeholder="Paste the job description here..." disabled></textarea>
            </div>
          </div>
        )}

        {/* Loading / Analyzing View */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[60vh]">
             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
             <h2 className="text-2xl font-semibold text-gray-800">{loadingMsg}</h2>
             <p className="text-gray-500 mt-2">This usually takes about 10-15 seconds.</p>
          </div>
        )}

        {/* Dashboard View */}
        {appState === AppState.DASHBOARD && resumeData && analysis && (
          <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Controls & Feedback (4 cols) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* Score Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
                <ScoreChart score={analysis.overallScore} />
                <div className="w-full mt-6 space-y-3">
                  {analysis.categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        {renderStatusIcon(cat.status)}
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">{cat.score}/100</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Description Input */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Target Role</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Paste a JD to get tailored keyword suggestions.</p>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <button 
                  onClick={handleJobDescriptionSubmit}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Analyze Match <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Actionable Suggestions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[500px] overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Priority Fixes</h3>
                
                {analysis.keywordGaps.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordGaps.map((k, i) => (
                        <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100 font-medium">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {analysis.categories.filter(c => c.status !== 'good').map((cat, i) => (
                    <div key={i} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <p className="text-xs font-bold text-yellow-800 mb-1">{cat.name}</p>
                      <p className="text-sm text-yellow-800">{cat.feedback}</p>
                    </div>
                  ))}
                  {analysis.formattingIssues.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-bold text-gray-700 mb-1">Formatting</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {analysis.formattingIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Resume Preview (8 cols) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setIsCondensed(false)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${!isCondensed ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                      Original Layout
                    </button>
                    <button 
                      onClick={() => setIsCondensed(true)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${isCondensed ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                      <span className="flex items-center gap-1"><LayoutTemplate className="w-3 h-3" /> One-Page ATS</span>
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {isCondensed ? "Optimized spacing for 1-page fit" : "Standard view"}
                  </span>
                </div>
                <button 
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  onClick={() => window.print()}
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>

              {/* Document Container */}
              <div className="flex-grow bg-gray-100 rounded-xl p-8 overflow-y-auto border border-gray-200">
                 <ResumePreview 
                   data={resumeData} 
                   isCondensed={isCondensed} 
                   onUpdate={setResumeData}
                 />
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
