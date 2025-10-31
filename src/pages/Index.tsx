import { useState } from "react";
import QrScanner from 'react-qr-scanner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, Play, User } from "lucide-react";
import { toast } from "sonner";

// Mock database: map machine codes to exercise data
const EXERCISES: Record<string, {
  machine: string;
  video: string;
  text: string;
}> = {
  "101": {
    machine: "Leg Press",
    video: "https://www.youtube.com/embed/8BcPHWGQO44",
    text: "Place your feet shoulder-width on the platform, keep your back pressed to the seat, lower slowly and push evenly with both legs. Breathe out on the push. Avoid locking the knees.",
  },
  "102": {
    machine: "Bench Press",
    video: "https://www.youtube.com/embed/vthMCtgVtFw",
    text: "Lie flat on the bench, plant your feet, grip slightly wider than shoulder-width, lower the bar to mid-chest and press up explosively while exhaling. Keep scapulae retracted.",
  },
  "103": {
    machine: "Treadmill",
    video: "https://www.youtube.com/embed/5X3r1s5x46s",
    text: "Use a controlled warm-up, maintain upright posture, short quick arm swings and avoid leaning forward. Start slow then increase speed gradually.",
  },
  "104": {
    machine: "Lat Pulldown",
    video: "https://www.youtube.com/embed/CAwf7n6Luuc",
    text: "Sit with thighs secured, grip the bar wider than shoulders, pull down to upper chest while keeping torso upright. Squeeze shoulder blades together at the bottom, control the return.",
  },
  "105": {
    machine: "Squat Rack",
    video: "https://www.youtube.com/embed/ultWZbUMPL8",
    text: "Position bar on upper back, feet shoulder-width apart, toes slightly out. Lower by bending knees and hips, keep chest up and knees tracking over toes. Drive through heels to stand.",
  },
  "106": {
    machine: "Cable Row",
    video: "https://www.youtube.com/embed/UCXxvVItLoM",
    text: "Sit with feet on platform, knees slightly bent. Pull handle to lower abdomen, keep back straight and squeeze shoulder blades together. Control the return without leaning forward.",
  },
  "107": {
    machine: "Shoulder Press",
    video: "https://www.youtube.com/embed/qEwKCR5JCog",
    text: "Sit with back supported, grip handles at shoulder height. Press upward until arms are extended but not locked. Lower with control back to start position. Keep core engaged throughout.",
  },
  "108": {
    machine: "Leg Curl",
    video: "https://www.youtube.com/embed/ELOCsoDSmrg",
    text: "Lie face down, align knees with machine pivot. Curl legs up toward glutes while keeping hips pressed to bench. Control the descent and avoid jerking motions.",
  },
  "109": {
    machine: "Chest Fly",
    video: "https://www.youtube.com/embed/eozdVDA78K0",
    text: "Sit with back against pad, grip handles with slight bend in elbows. Bring handles together in front of chest in a hugging motion. Keep shoulder blades retracted throughout.",
  },
  "110": {
    machine: "Leg Extension",
    video: "https://www.youtube.com/embed/YyvSfVjQeL0",
    text: "Sit with back against pad, position ankles under padded lever. Extend legs until knees are straight, pause briefly. Lower with control, don't let weights slam down.",
  },
  "111": {
    machine: "Bicep Curl",
    video: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    text: "Stand with feet hip-width, grip bar with underhand grip. Curl bar up by bending elbows, keep upper arms stationary. Lower with control, full extension at bottom.",
  },
  "112": {
    machine: "Tricep Extension",
    video: "https://www.youtube.com/embed/2-LAMcpzODU",
    text: "Stand facing away from cable, grip rope overhead. Extend arms forward and up until fully extended. Keep elbows close to head, control the return behind head.",
  },
};

const Index = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [currentExercise, setCurrentExercise] = useState<typeof EXERCISES[string] | null>(null);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    trainer: "Olena",
    datetime: "",
  });

  const extractCodeFromPayload = (payload: string): string => {
    const trimmed = payload.trim();
    const codeRegex = /^\d{3,4}$/;
    if (codeRegex.test(trimmed)) return trimmed;

    try {
      const url = new URL(trimmed);
      const codeParam = url.searchParams.get("code");
      if (codeParam) return codeParam;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
    } catch (e) {
      // not a URL
    }
    return trimmed;
  };

  const handleScan = (result: any) => {
    if (result?.text) {
      const code = extractCodeFromPayload(result.text);
      setScanResult(code);
      if (EXERCISES[code]) {
        setCurrentExercise(EXERCISES[code]);
        toast.success(`Exercise loaded: ${EXERCISES[code].machine}`);
      } else {
        setCurrentExercise(null);
        toast.error(`No exercise found for code: ${code}`);
      }
      setScanning(false);
    }
  };

  const handleError = (error: any) => {
    console.error("QR scan error:", error);
    toast.error("Camera access denied. Please enable camera permissions or enter code manually.");
    setScanning(false);
  };

  const submitManualCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    setScanResult(code);
    if (EXERCISES[code]) {
      setCurrentExercise(EXERCISES[code]);
      toast.success(`Exercise loaded: ${EXERCISES[code].machine}`);
    } else {
      setCurrentExercise(null);
      toast.error(`No exercise found for code: ${code}`);
    }
  };

  const submitSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Trainer signup:", signupData, "for exercise:", scanResult);
    setShowTrainerModal(false);
    toast.success("Request sent! Your trainer will contact you soon.");
    setSignupData({ name: "", email: "", trainer: "Olena", datetime: "" });
  };

  const reset = () => {
    setScanResult(null);
    setCurrentExercise(null);
    setManualCode("");
  };

  return (
    <div className="min-h-screen">
      {/* Header with gradient */}
      <header className="relative overflow-hidden border-b bg-gradient-to-br from-primary via-primary/90 to-secondary">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl animate-float">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Gym QR Guide</h1>
              <p className="text-lg text-white/90 drop-shadow">Train Smart — Scan, Learn, Improve</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium flex items-center gap-2">
              <Play className="h-4 w-4" />
              Video Tutorials
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Expert Trainers
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Scanner & manual entry */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary rounded-lg shadow-glow">
                    <Camera className="h-5 w-5 text-primary-foreground" />
                  </div>
                  Scan Machine
                </CardTitle>
                <CardDescription>Point camera at QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!scanning ? (
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => setScanning(true)} className="w-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <Camera className="mr-2 h-4 w-4" />
                      Open Camera
                    </Button>
                    <Button onClick={reset} variant="outline" className="w-full hover:bg-muted transition-colors">
                      <X className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border-2 border-primary shadow-glow animate-pulse-soft">
                      <QrScanner
                        constraints={{ facingMode: "environment" }}
                        onResult={handleScan}
                        videoStyle={{ width: "100%" }}
                        containerStyle={{ width: "100%" }}
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium animate-pulse">
                        Scanning...
                      </div>
                    </div>
                    <Button onClick={() => setScanning(false)} variant="destructive" className="w-full hover:scale-105 transition-transform" size="sm">
                      Cancel Scan
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Allow camera access and point at the machine's QR code
                    </p>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <form onSubmit={submitManualCode} className="space-y-3">
                  <div>
                    <Label htmlFor="manual-code">Enter Machine Code</Label>
                    <Input
                      id="manual-code"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="e.g. 101"
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full">
                    Load Exercise
                  </Button>
                </form>

                {scanResult && (
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border border-primary/20 shadow-sm">
                    <p className="text-xs text-muted-foreground">Current code:</p>
                    <p className="font-mono font-bold text-lg text-primary">{scanResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2">
              <CardHeader className="bg-gradient-to-br from-secondary/10 to-transparent">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 bg-secondary rounded-lg">
                    <Play className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Try sample codes:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(EXERCISES).map((code) => (
                    <Button
                      key={code}
                      onClick={() => {
                        setManualCode(code);
                        setScanResult(code);
                        setCurrentExercise(EXERCISES[code]);
                        toast.success(`Loaded: ${EXERCISES[code].machine}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 hover:scale-110 font-mono font-bold"
                    >
                      {code}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Video + instructions */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-xl border-2 overflow-hidden">
              <CardContent className="p-6">
                {currentExercise ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-glow animate-float">
                            <Play className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                            {currentExercise.machine}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-transparent rounded-full text-xs font-mono font-bold text-primary border border-primary/20">
                            {scanResult}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowTrainerModal(true)}
                        size="lg"
                        className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 gradient-accent border-0"
                      >
                        <User className="h-4 w-4" />
                        Book Trainer
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-2xl border-4 border-primary/20" style={{ paddingBottom: "56.25%" }}>
                          <iframe
                            title="exercise video"
                            src={currentExercise.video}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                          />
                          <div className="absolute top-3 left-3 px-3 py-1.5 bg-accent text-accent-foreground text-xs rounded-full font-medium shadow-lg flex items-center gap-1.5 animate-pulse-soft">
                            <div className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse"></div>
                            Watch & Learn
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <Card className="h-full bg-gradient-to-br from-secondary/10 to-transparent border-2 border-secondary/20 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <div className="p-1.5 bg-secondary rounded-lg">
                                <Play className="h-4 w-4 text-secondary-foreground" />
                              </div>
                              How to Execute
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed text-foreground">
                              {currentExercise.text}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 animate-float shadow-lg">
                      <Camera className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">No Exercise Selected</h3>
                    <p className="text-muted-foreground max-w-md text-lg">
                      Scan a QR code on a machine or enter its code to see video tutorials and proper form instructions.
                    </p>
                    <div className="mt-8 flex gap-3">
                      <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium text-primary">📹 HD Videos</div>
                      <div className="px-4 py-2 bg-secondary/10 rounded-lg text-sm font-medium text-secondary">💪 Expert Tips</div>
                      <div className="px-4 py-2 bg-accent/10 rounded-lg text-sm font-medium text-accent">🎯 Perfect Form</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Trainer signup modal */}
      <Dialog open={showTrainerModal} onOpenChange={setShowTrainerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book a Training Session</DialogTitle>
            <DialogDescription>
              Get personalized guidance from our certified trainers
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSignup} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                required
                value={signupData.name}
                onChange={(e) => setSignupData((s) => ({ ...s, name: e.target.value }))}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                required
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData((s) => ({ ...s, email: e.target.value }))}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="trainer">Preferred Trainer</Label>
              <Select
                value={signupData.trainer}
                onValueChange={(value) => setSignupData((s) => ({ ...s, trainer: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Olena">Olena</SelectItem>
                  <SelectItem value="Ivan">Ivan</SelectItem>
                  <SelectItem value="Kateryna">Kateryna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="datetime">Preferred Date & Time</Label>
              <Input
                id="datetime"
                required
                type="datetime-local"
                value={signupData.datetime}
                onChange={(e) => setSignupData((s) => ({ ...s, datetime: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowTrainerModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
