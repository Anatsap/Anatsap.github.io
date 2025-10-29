import React, { useState, useEffect } from "react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { QRScanner } from "./components/QRScanner";
import { TrainerModal } from "./components/TrainerModal";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">QR Gym Guide</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exercise = useQuery(api.exercises.getExerciseByCode, 
    scanResult ? { code: scanResult } : "skip"
  );
  const allExercises = useQuery(api.exercises.getAllExercises);
  const initializeSampleData = useMutation(api.exercises.initializeSampleData);

  // Initialize sample data on first load
  useEffect(() => {
    if (allExercises && allExercises.length === 0) {
      initializeSampleData();
    }
  }, [allExercises, initializeSampleData]);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  function extractCodeFromPayload(payload: string): string {
    const trimmed = payload.trim();
    const codeRegex = /^[A-Z]{1,4}-?\d{1,4}$/i;
    if (codeRegex.test(trimmed)) return trimmed.toUpperCase();

    try {
      const url = new URL(trimmed);
      const codeParam = url.searchParams.get("code");
      if (codeParam) return codeParam.toUpperCase();
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length) return parts[parts.length - 1].toUpperCase();
    } catch (e) {
      // not a URL
    }
    return trimmed.toUpperCase();
  }

  function handleScan(data: string) {
    const code = extractCodeFromPayload(data);
    setScanResult(code);
    setScanning(false);
    setMessage(null);
  }

  function handleScanError(error: string) {
    setMessage(error);
    setScanning(false);
  }

  function submitManualCode(e: React.FormEvent) {
    e.preventDefault();
    const code = manualCode.trim().toUpperCase();
    setScanResult(code);
    setMessage(null);
  }

  function reset() {
    setScanResult(null);
    setManualCode("");
    setMessage(null);
    setScanning(false);
  }

  function showMessage(msg: string) {
    setMessage(msg);
    toast(msg);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">QR Gym Guide</h1>
        <Authenticated>
          <p className="text-xl text-gray-600">
            Welcome back, {loggedInUser?.email ?? "friend"}! Scan QR codes to get exercise instructions.
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-gray-600">Sign in to access the gym guide</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="bg-white shadow-md rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Scanner & manual entry */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 border rounded-lg">
                <h2 className="font-semibold mb-3">Scan QR on the machine</h2>
                {!scanning && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => { setScanning(true); setMessage(null); }}
                      className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      Open camera & scan
                    </button>
                    <button
                      onClick={reset}
                      className="px-3 py-2 rounded bg-gray-200 text-sm hover:bg-gray-300"
                    >
                      Reset
                    </button>
                  </div>
                )}

                <QRScanner
                  isScanning={scanning}
                  onScan={handleScan}
                  onError={handleScanError}
                />

                <hr className="my-3" />

                <form onSubmit={submitManualCode} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Or enter machine code</label>
                  <div className="flex gap-2">
                    <input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. LP-02"
                    />
                    <button 
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700" 
                      type="submit"
                    >
                      Open
                    </button>
                  </div>
                </form>

                {scanResult && (
                  <p className="mt-3 text-xs text-gray-600">
                    Current code: <strong>{scanResult}</strong>
                  </p>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Sample codes</h3>
                <div className="flex flex-wrap gap-2">
                  {allExercises?.map((ex) => (
                    <button
                      key={ex.code}
                      onClick={() => { 
                        setManualCode(ex.code); 
                        setScanResult(ex.code); 
                        setMessage(null); 
                      }}
                      className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {ex.code}
                    </button>
                  ))}
                </div>
              </div>

              {message && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 rounded text-red-700">
                  {message}
                </div>
              )}
            </div>

            {/* Right column: Video + instructions */}
            <div className="lg:col-span-2">
              <div className="p-4 border rounded-lg">
                {exercise ? (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-bold">{exercise.machine}</h2>
                      <div className="text-sm text-gray-500">
                        Code: <strong>{scanResult}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="aspect-video bg-black rounded overflow-hidden">
                          <iframe
                            title="exercise video"
                            src={exercise.videoUrl}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <h4 className="font-semibold mb-2">How to do it correctly</h4>
                        <p className="text-sm text-gray-700 mb-4">{exercise.instructions}</p>

                        <button 
                          onClick={() => setShowTrainerModal(true)} 
                          className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                          Sign up with a trainer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : scanResult ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">No exercise found for code: {scanResult}</p>
                    <p className="text-sm">Try scanning a different QR code or check the machine code.</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">No exercise selected</p>
                    <p className="text-sm">Scan a QR code on a machine or enter its code to see a video and instructions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Authenticated>

      <TrainerModal
        isOpen={showTrainerModal}
        onClose={() => setShowTrainerModal(false)}
        exerciseCode={scanResult || undefined}
        onSuccess={showMessage}
      />
    </div>
  );
}
