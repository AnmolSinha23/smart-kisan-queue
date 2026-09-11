import { useEffect, useState, type ComponentType } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell, Check, ChevronLeft, ChevronRight,
  CircleDollarSign, ClipboardCheck, CloudOff, Database, Gauge, IndianRupee, Landmark,
  Leaf, Menu, MessageSquareText, Mic2, Pause, Phone, Play, RotateCcw, Scale, ScanLine,
  ShieldCheck, Signal, Sprout, Truck, UserRound, Users, Warehouse, Weight, Wifi, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DemoProvider, stages, useDemo, type DemoAction, type Stage } from "@/lib/kisan-state";
import { cn } from "@/lib/utils";

type View = "command" | "farmer" | "ivr" | "trace" | "government";
type DialogKind = "arrival" | "qc" | "weight" | "procure" | "payment" | "booking" | null;
const nav: { id: View; label: string; short: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "command", label: "Command Centre", short: "Command", icon: Gauge },
  { id: "farmer", label: "Farmer Experience", short: "Farmer", icon: Sprout },
  { id: "ivr", label: "IVR & SMS", short: "IVR", icon: Phone },
  { id: "trace", label: "Five-ID Trace", short: "Trace", icon: ShieldCheck },
  { id: "government", label: "Government View", short: "Govt", icon: Landmark },
];

const demoSteps: { title: string; text: string; view: View; action?: DemoAction; dialog?: DialogKind }[] = [
  { title: "The operating problem", text: "Sehore has 142 expected farmers. KisanOne begins with live capacity, not static tokens.", view: "command" },
  { title: "One shared operational picture", text: "Every channel reads the same queue, capacity and transaction state.", view: "command" },
  { title: "Farmer requests procurement", text: "Ramesh Kumar submits 52.4 kg of wheat for Sehore centre.", view: "farmer", action: { type: "REQUEST" }, dialog: "booking" },
  { title: "Rules approve capacity", text: "Deterministic rules find a safe window and issue K1-104.", view: "farmer" },
  { title: "Dynamic Call-to-Come", text: "Ramesh receives 10:40–10:55 AM, queue #4, before leaving home.", view: "farmer" },
  { title: "Accessible IVR channel", text: "Key 2 announces the exact same arrival window without a smartphone.", view: "ivr" },
  { title: "Arrival validation", text: "A signed QR links farmer and request at GATE-02.", view: "command", action: { type: "ARRIVE" }, dialog: "arrival" },
  { title: "Live pipeline begins", text: "K1-104 enters the physical process while the queue ETA recalculates.", view: "command" },
  { title: "Quality inspection", text: "Moisture 12.4%, foreign matter 1.8%, Grade A: QC passes.", view: "command", action: { type: "QC" }, dialog: "qc" },
  { title: "Capacity anomaly", text: "WB-04 slows from 12 to 6 farmers per hour.", view: "command", action: { type: "SLOWDOWN" } },
  { title: "AI advises", text: "The advisory forecasts +22 minutes. It does not control procurement.", view: "command" },
  { title: "Rules decide", text: "The rule engine pauses new Call-to-Come releases at 90% utilization.", view: "command" },
  { title: "Farmer protected from waiting", text: "Ramesh sees 11:05 AM and receives a bilingual capacity alert.", view: "farmer" },
  { title: "Device weight captured", text: "RS-232 device WB-04 supplies 52.40 kg without manual re-entry.", view: "command", action: { type: "WEIGHT" }, dialog: "weight" },
  { title: "Procurement transaction", text: "The system creates LOT-2026-0104 and TXN-10482 at Wheat MSP.", view: "command", action: { type: "PROCURE" }, dialog: "procure" },
  { title: "Payment closes the loop", text: "PAY-10482 is completed and the farmer receives confirmation.", view: "command", action: { type: "PAY" }, dialog: "payment" },
  { title: "Five-ID accountability", text: "Inspect the tamper-evident chain from FMR-104 through PAY-10482.", view: "trace" },
  { title: "Government visibility", text: "District officers compare centres and act on bottlenecks, not anecdotes.", view: "government" },
];

export function KisanOneApp() { return <DemoProvider><KisanShell /></DemoProvider>; }

function KisanShell() {
  const { state, dispatch } = useDemo();
  const [view, setView] = useState<View>("command");
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [controls, setControls] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [auto, setAuto] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const goStep = (next: number) => {
    const safe = Math.max(0, Math.min(demoSteps.length - 1, next));
    const step = demoSteps[safe] ?? demoSteps[0];
    if (!step) return;
    dispatch({ type: "DEMO_STEP", step: safe });
    setView(step.view);
    if (step.action) dispatch(step.action);
    setDialog(step.dialog ?? null);
  };
  useEffect(() => {
    if (!auto || !demoOpen) return;
    const timer = window.setInterval(() => {
      if (state.demoStep >= demoSteps.length - 1) { setAuto(false); return; }
      goStep(state.demoStep + 1);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [auto, demoOpen, state.demoStep]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-header-border bg-header text-header-foreground shadow-sm">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 lg:px-6">
          <Button aria-label="Open navigation" variant="ghost" size="icon" className="text-header-foreground hover:bg-header-muted lg:hidden" onClick={() => setMobileNav(true)}><Menu /></Button>
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground"><Leaf className="size-5" /></div>
            <div className="min-w-0"><div className="flex items-baseline gap-2"><strong className="text-lg">KisanOne</strong><span className="hidden text-[10px] font-semibold uppercase text-header-subtle sm:inline">SIH26032</span></div><p className="truncate text-[11px] text-header-subtle">One Platform. One Process. One Farmer.</p></div>
          </div>
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <StatusPill online={state.online} count={state.queuedActions.length} />
            <span className="h-7 w-px bg-header-border" />
            <div className="text-right"><p className="text-xs font-semibold">Sehore Procurement Centre</p><p className="text-[10px] text-header-subtle">Madhya Pradesh · Centre MP-SEH-04</p></div>
          </div>
          <Button className="ml-auto bg-demo text-demo-foreground hover:bg-demo/90 md:ml-2" onClick={() => { setDemoOpen(true); goStep(0); }}><Play className="size-4" /><span className="hidden sm:inline">Start Judge Demo</span><span className="sm:hidden">Demo</span></Button>
          <Button aria-label="Open demo controls" title="Demo controls" variant="outline" size="icon" className="border-header-border bg-header-muted text-header-foreground hover:bg-header-muted/80" onClick={() => setControls(true)}><Activity /></Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r bg-sidebar p-3 lg:block">
          <Navigation view={view} setView={setView} />
          <div className="absolute inset-x-3 bottom-4 rounded-md border bg-sidebar-panel p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Architecture principle</p>
            <p className="mt-1 text-sm font-bold text-primary">AI advisory; Rules decide</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">SIH-83 CodeOps · Smart India Hackathon 2026</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-3 pb-24 sm:p-5 lg:p-6">
          {view === "command" && <CommandCentre setDialog={setDialog} />}
          {view === "farmer" && <FarmerExperience setDialog={setDialog} />}
          {view === "ivr" && <IvrSimulator />}
          {view === "trace" && <Traceability />}
          {view === "government" && <GovernmentDashboard />}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background p-1 lg:hidden">
        {nav.map((item) => <Button key={item.id} variant="ghost" className={cn("h-14 min-w-0 flex-1 flex-col gap-0.5 px-1 text-[10px]", view === item.id && "bg-accent text-primary")} onClick={() => setView(item.id)}><item.icon className="size-4" />{item.short}</Button>)}
      </div>
      <Sheet open={mobileNav} onOpenChange={setMobileNav}><SheetContent side="left" className="w-72"><SheetHeader><SheetTitle>KisanOne</SheetTitle><SheetDescription>Select an operational view.</SheetDescription></SheetHeader><div className="mt-6"><Navigation view={view} setView={(v) => { setView(v); setMobileNav(false); }} /></div></SheetContent></Sheet>
      <DemoControls open={controls} onOpenChange={setControls} setDialog={setDialog} />
      <JudgeDemo open={demoOpen} setOpen={setDemoOpen} auto={auto} setAuto={setAuto} goStep={goStep} />
      <OperationDialog kind={dialog} setKind={setDialog} />
    </div>
  );
}

function Navigation({ view, setView }: { view: View; setView: (v: View) => void }) {
  return <nav aria-label="Main navigation" className="space-y-1">{nav.map(item => <Button key={item.id} variant="ghost" className={cn("w-full justify-start", view === item.id && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")} onClick={() => setView(item.id)}><item.icon />{item.label}</Button>)}</nav>;
}

function StatusPill({ online, count }: { online: boolean; count: number }) {
  return <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", online ? "border-success/30 bg-success/15 text-success-soft" : "border-warning/40 bg-warning/15 text-warning-soft")}>
    {online ? <Wifi className="size-3.5" /> : <CloudOff className="size-3.5" />}{online ? "Online · Synced" : `Offline · ${count} queued`}
  </div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase text-primary">{eyebrow}</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>;
}

function Panel({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-md border bg-card shadow-xs", className)}><div className="border-b px-4 py-3"><h2 className="font-bold">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}</div><div className="p-4">{children}</div></section>;
}

function CommandCentre({ setDialog }: { setDialog: (d: DialogKind) => void }) {
  const { state, arrivalWindow, eta, queuePosition, dispatch } = useDemo();
  const kpis = [["Farmers Today", "142", Users], ["Processed", state.paymentComplete ? "98" : "97", ClipboardCheck], ["In Queue", state.paymentComplete ? "17" : "18", Truck], ["Average Wait", state.bottleneck ? "43 min" : "21 min", Activity], ["Capacity", state.bottleneck ? "91%" : "78%", Gauge]] as const;
  return <>
    <PageHeading eyebrow="Officer Command Centre" title="Sehore Procurement Centre" description="Friday, 11 September 2026 · Wheat procurement shift · OP-07" action={<div className="flex items-center gap-2"><span className={cn("rounded-full px-3 py-1.5 text-xs font-bold", state.bottleneck ? "bg-warning-muted text-warning-foreground" : "bg-success-muted text-success")}>{state.bottleneck ? "Overloaded" : "Operational"}</span><StatusPill online={state.online} count={state.queuedActions.length} /></div>} />
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">{kpis.map(([label, value, Icon]) => <div key={label} className="rounded-md border bg-card p-4 shadow-xs"><div className="flex items-start justify-between"><p className="text-xs font-medium text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <Panel title="Live Operational Pipeline" subtitle="Select a stage to move demo request K1-104">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">{stages.map((stage, i) => { const active = stage === state.stage; const done = i < stages.indexOf(state.stage) || (stage === "Payment" && state.paymentComplete); return <Button key={stage} variant="outline" className={cn("h-auto min-h-20 flex-col gap-1 px-2 py-3", active && "border-primary bg-accent ring-2 ring-primary/20", done && "border-success/40 bg-success-muted")} onClick={() => dispatch({ type: "MOVE", stage })}><span className={cn("grid size-6 place-items-center rounded-full text-[11px]", done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted")}>{done ? <Check className="size-3" /> : i + 1}</span><span className="text-xs">{stage}</span><span className="text-[10px] font-normal text-muted-foreground">{[4,7,11,9,6,3][i]} active</span></Button>})}</div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-primary/20 bg-accent p-3"><span className="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">#{queuePosition}</span><strong className="text-sm">K1-104 · Ramesh Kumar</strong><ArrowRight className="size-4 text-muted-foreground"/><span className="text-sm">{state.stage}</span><span className="ml-auto text-sm font-bold">ETA {eta} min</span></div>
        <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setDialog("arrival")}><ScanLine />Validate arrival</Button><Button size="sm" variant="outline" onClick={() => setDialog("qc")}><ClipboardCheck />QC inspection</Button><Button size="sm" variant="outline" onClick={() => setDialog("weight")}><Scale />Weighment</Button><Button size="sm" variant="outline" onClick={() => setDialog("procure")}><Warehouse />Procure</Button><Button size="sm" variant="outline" onClick={() => setDialog("payment")}><IndianRupee />Payment</Button></div>
      </Panel>
      <Panel title="Dynamic Call-to-Come" subtitle="Rule-controlled farmer release">
        <div className="flex items-center justify-between"><div><p className={cn("text-xl font-bold", state.bottleneck ? "text-warning-foreground" : "text-success")}>{state.bottleneck ? "PAUSED" : "ACTIVE"}</p><p className="text-xs text-muted-foreground">{state.bottleneck ? "Capacity safety rule engaged" : "Release cadence healthy"}</p></div><div className={cn("grid size-11 place-items-center rounded-full", state.bottleneck ? "bg-warning-muted" : "bg-success-muted")}>{state.bottleneck ? <Pause className="text-warning-foreground"/> : <Play className="text-success"/>}</div></div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Metric label="Next release" value={state.bottleneck ? "On hold" : "10:48 AM"}/><Metric label="Arrival window" value={arrivalWindow.split(" – ")[0] ?? arrivalWindow}/><Metric label="Farmers released" value="6"/><Metric label="Waiting at home" value="12"/></div>
      </Panel>
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <CapacityPanel />
      <div className="space-y-4"><DecisionPanel /><Events /></div>
    </div>
    <div className="mt-4"><QueueTable /></div>
  </>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-md bg-muted p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }

function CapacityPanel() {
  const { state } = useDemo(); const rows = [["Gate",78,"14/hr"],["QC",71,"11/hr"],["Weighment",state.bottleneck?94:76,state.bottleneck?"6/hr":"12/hr"],["Unloading",62,"9/hr"],["Storage",48,"240 MT"]] as const;
  return <Panel title="Capacity Intelligence Engine" subtitle="Live capacity utilization and limiting-resource detection"><div className="space-y-4">{rows.map(([name,value,rate]) => <div key={name}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-semibold">{name}</span><span className={cn("font-bold", value >= 90 && "text-warning-foreground")}>{value}% · {rate}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all duration-700", value >= 90 ? "bg-warning" : value >= 75 ? "bg-primary" : "bg-success")} style={{ width: `${value}%` }}/></div>{value >= 90 && <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-warning-foreground"><AlertTriangle className="size-3"/>Warning · limiting resource</p>}</div>)}</div></Panel>;
}

function DecisionPanel() {
  const { state } = useDemo();
  return <Panel title="Decision Intelligence" subtitle="Forecast separately from operational control"><div className="grid gap-3 sm:grid-cols-2"><div className={cn("rounded-md border-l-4 p-3", state.bottleneck ? "border-warning bg-warning-muted" : "border-info bg-info-muted")}><p className="text-[10px] font-bold uppercase">AI Advisory</p><p className="mt-1 text-sm font-bold">{state.bottleneck ? "Weighbridge risk detected" : "No critical risk detected"}</p><p className="mt-1 text-xs text-muted-foreground">{state.bottleneck ? "+22 min projected impact" : "Load remains within plan"}</p></div><div className={cn("rounded-md border-l-4 p-3", state.bottleneck ? "border-warning bg-warning-muted" : "border-success bg-success-muted")}><p className="text-[10px] font-bold uppercase">Rule Engine Decision</p><p className="mt-1 text-sm font-bold">{state.bottleneck ? "PAUSE CALL-TO-COME" : "CONTINUE RELEASES"}</p><p className="mt-1 text-xs text-muted-foreground">Rule CAP-WB-90 · auditable</p></div></div></Panel>;
}

function Events() { const { state } = useDemo(); return <Panel title="Recent Events"><div className="space-y-2">{state.events.slice(0,5).map((event, i) => <div key={`${event.time}-${i}`} className="flex gap-3 text-xs"><span className="font-mono text-muted-foreground">{event.time}</span><span className={cn("size-2 shrink-0 rounded-full mt-1", event.tone === "success" ? "bg-success" : event.tone === "warning" ? "bg-warning" : "bg-info")}/><span>{event.text}</span></div>)}</div></Panel>; }

function QueueTable() {
  const { state, arrivalWindow, eta, queuePosition } = useDemo(); const rows = [
    ["1","Savitri Bai","K1-101","10:30–10:45","Weighment","8 min","In process"],
    ["2","Mohan Patel","K1-102","10:30–10:45","QC","12 min","In process"],
    [String(queuePosition),"Ramesh Kumar","K1-104",arrivalWindow.replaceAll(" AM", ""),state.stage,`${eta} min`,state.bottleneck?"Recalculated":"On time"],
    ["5","Asha Verma","K1-107",state.bottleneck?"11:05–11:20":"10:55–11:10","Called",state.bottleneck?"46 min":"24 min",state.bottleneck?"Delayed":"Released"],
  ];
  return <Panel title="Live Queue" subtitle="ETAs recalculate from throughput, current stage and farmer arrival"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-muted/60 text-[11px] uppercase text-muted-foreground"><tr>{["Position","Farmer","Request ID","Arrival Window","Stage","ETA","Status"].map(h=><th className="px-3 py-2" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[2]} className={cn("border-b last:border-0",row[2]==="K1-104"&&"bg-accent")} >{row.map((cell,i)=><td key={i} className={cn("px-3 py-3",i===0||i===2?"font-bold":"", i===6&&"text-primary")}>{cell}{row[2]==="K1-104"&&i===5&&state.bottleneck?<span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-warning"/>:null}</td>)}</tr>)}</tbody></table></div></Panel>;
}

function FarmerExperience({ setDialog }: { setDialog: (d: DialogKind) => void }) {
  const { state, arrivalWindow, eta, queuePosition, gross } = useDemo();
  return <div className="mx-auto max-w-5xl"><PageHeading eyebrow="Farmer Experience · किसान सेवा" title="Namaste, Ramesh Kumar" description="FMR-104 · Wheat · Sehore Procurement Centre" action={<Button onClick={() => setDialog("booking")}><Sprout/>Book Procurement</Button>} />
    {state.bottleneck && <div className="mb-4 flex gap-3 rounded-md border border-warning/40 bg-warning-muted p-4 text-sm"><AlertTriangle className="size-5 shrink-0 text-warning-foreground"/><div><p className="font-bold">Capacity slowdown · क्षमता में देरी</p><p className="mt-1 text-muted-foreground">Your centre arrival has moved to 11:05 AM. Please do not leave early. / कृपया 11:05 बजे आएं।</p></div></div>}
    <section className="overflow-hidden rounded-md border bg-card shadow-sm"><div className="bg-primary px-5 py-4 text-primary-foreground"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold opacity-80">CALL-TO-COME · K1-104</p><h2 className="mt-1 text-xl font-bold">Your centre is ready for you</h2></div><Bell className="size-6"/></div></div><div className="p-5"><p className="text-xs font-bold uppercase text-muted-foreground">आगमन समय / Arrival Window</p><p className="mt-1 text-3xl font-bold text-primary">{arrivalWindow}</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="कतार / Queue" value={`#${queuePosition}`}/><Metric label="अनुमानित प्रतीक्षा / Est. Wait" value={`${eta} min`}/><Metric label="फसल / Crop" value="Wheat"/><Metric label="मात्रा / Quantity" value="52.4 kg"/></div><div className="mt-4 rounded-md bg-success-muted p-3 text-sm text-success"><strong>Advice:</strong> Bring Aadhaar and bank passbook. Reach only within your issued window.</div></div></section>
    <div className="mt-4 grid gap-4 md:grid-cols-2"><Panel title="Live Queue Tracking" subtitle="Updates automatically from centre operations"><div className="space-y-3">{stages.map((s,i)=><div key={s} className="flex items-center gap-3"><span className={cn("grid size-7 place-items-center rounded-full text-xs",i<stages.indexOf(state.stage)||(s==="Payment"&&state.paymentComplete)?"bg-success text-success-foreground":s===state.stage?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground")}>{i<stages.indexOf(state.stage)?<Check className="size-3"/>:i+1}</span><span className={cn("text-sm",s===state.stage&&"font-bold")}>{s}</span>{s===state.stage&&<span className="ml-auto text-xs text-primary">Current stage</span>}</div>)}</div></Panel><Panel title="Payment & Transaction History"><div className="rounded-md border p-4"><div className="flex items-start justify-between"><div><p className="font-bold">TXN-10482</p><p className="text-xs text-muted-foreground">LOT-2026-0104 · Wheat Grade A</p></div><span className={cn("rounded-full px-2 py-1 text-xs font-bold",state.paymentComplete?"bg-success-muted text-success":"bg-muted")}>{state.paymentComplete?"Paid":"Pending"}</span></div><div className="mt-4 flex justify-between border-t pt-3"><span className="text-sm text-muted-foreground">Net amount</span><strong>₹{gross.toLocaleString("en-IN",{minimumFractionDigits:2})}</strong></div></div></Panel></div>
  </div>;
}

function IvrSimulator() {
  const { state, arrivalWindow, eta, queuePosition } = useDemo(); const [digits,setDigits]=useState(""); const [transcript,setTranscript]=useState("Welcome to KisanOne. किसानवन में आपका स्वागत है। Press 1 for request status, 2 for arrival time, 3 for queue position."); const [speaking,setSpeaking]=useState(false);
  const response = (key:string) => key==="1" ? `Request K1-104 is ${state.paymentComplete?"complete":`at ${state.stage}`}.` : key==="2" ? `Your Call-to-Come window is ${arrivalWindow}. ${state.bottleneck?"The time changed due to centre capacity slowdown.":"Please arrive only in this window."}` : key==="3" ? `Your queue position is ${queuePosition}. Estimated wait is ${eta} minutes.` : `You pressed ${key}. Press 1, 2 or 3 for KisanOne services.`;
  const press=(key:string)=>{setDigits(d=>`${d}${key}`.slice(-12));const text=response(key);setTranscript(text);if(["1","2","3"].includes(key)) speak(text);};
  const speak=(text=transcript)=>{if(typeof window==="undefined"||!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.9;u.onstart=()=>setSpeaking(true);u.onend=()=>setSpeaking(false);window.speechSynthesis.speak(u)};
  const stop=()=>{if(typeof window!=="undefined"&&"speechSynthesis" in window)window.speechSynthesis.cancel();setSpeaking(false)};
  return <><PageHeading eyebrow="Inclusive access" title="IVR & SMS Simulator" description="The same live data for feature phones, voice and text channels"/><div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><Panel title="KisanOne IVR · 1800-11-26032" subtitle="Accessible DTMF telephone simulation"><div className="mx-auto max-w-xs"><div className="rounded-md bg-header p-4 text-header-foreground"><p className="text-xs text-header-subtle">LIVE TRANSCRIPT</p><p aria-live="polite" className="mt-2 min-h-24 text-sm leading-relaxed">{transcript}</p><p className="mt-3 text-right font-mono text-lg">{digits||"—"}</p></div><div className="mt-3 grid grid-cols-3 gap-2">{["1","2","3","4","5","6","7","8","9","*","0","#"].map(k=><Button key={k} variant="outline" className="h-14 text-lg" aria-label={`Press ${k}`} onClick={()=>press(k)}>{k}{["1","2","3"].includes(k)&&<span className="text-[9px] text-muted-foreground">{k==="1"?"Status":k==="2"?"Window":"Queue"}</span>}</Button>)}</div><div className="mt-3 flex gap-2"><Button className="flex-1" onClick={()=>speak()} disabled={speaking}><Play/>{speaking?"Playing":"Play voice"}</Button><Button variant="outline" onClick={stop}><X/>Stop</Button></div></div></Panel><Panel title="SMS Alert Stream" subtitle={`${state.sms.length} messages sent to Ramesh Kumar · ••••••4210`}><div className="space-y-3">{[...state.sms].reverse().map((sms,i)=><div key={`${sms}-${i}`} className="flex gap-3 rounded-md border bg-muted/40 p-3"><MessageSquareText className="size-5 shrink-0 text-primary"/><div><p className="text-sm">{sms}</p><p className="mt-1 text-[10px] text-muted-foreground">Delivered · {i===0?"just now":"10:39 AM"}</p></div></div>)}</div></Panel></div></>;
}

function Traceability() {
  const { state } = useDemo(); const [selected,setSelected]=useState(0); const nodes: [string,string,string,string,string,string][]=[
    ["Farmer","FMR-104","Ramesh Kumar","Registry","VERIFIED","9d0c…7ae1"], ["Request","K1-104","OP-07","WEB-PORTAL","APPROVED","a42b…1fc8"], ["Lot","LOT-2026-0104","OP-07","WB-04",state.procurementComplete?"CREATED":"PENDING","2b7e…90dd"], ["Transaction","TXN-10482","OP-07","PROC-02",state.procurementComplete?"POSTED":"PENDING","f510…20ac"], ["Payment","PAY-10482","PFMS","BANK-API",state.paymentComplete?"SETTLED":"PENDING","7c21…bf09"]
  ]; const n=nodes[selected] ?? nodes[0];
  if (!n) return null;
  return <><PageHeading eyebrow="End-to-end accountability" title="Five-ID Traceability" description="One inspectable chain from farmer identity to final payment"/><Panel title="Tamper-evident procurement chain" subtitle="Select any node to inspect its audit evidence"><div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">{nodes.map((node,i)=><div key={node[1]} className="contents"><Button variant="outline" className={cn("h-auto min-h-24 flex-1 flex-col",selected===i&&"border-primary bg-accent ring-2 ring-primary/20")} onClick={()=>setSelected(i)}><span className="text-[10px] uppercase text-muted-foreground">{node[0]}</span><strong>{node[1]}</strong><span className={cn("text-[10px]",node[4]==="PENDING"?"text-muted-foreground":"text-success")}>{node[4]}</span></Button>{i<nodes.length-1&&<ArrowRight className="mx-auto size-4 rotate-90 text-muted-foreground lg:rotate-0"/>}</div>)}</div></Panel><div className="mt-4 grid gap-4 md:grid-cols-[1fr_.7fr]"><Panel title={`${n[0]} evidence · ${n[1]}`}><dl className="grid grid-cols-2 gap-4 text-sm"><Detail label="Created By" value={n[2]}/><Detail label="Timestamp" value={selected<2?"11 Sep 2026, 10:39":"11 Sep 2026, 10:52"}/><Detail label="Operator" value={selected===0?"Citizen Registry":n[2]}/><Detail label="Device" value={n[3]}/><Detail label="Status" value={n[4]}/><Detail label="Centre" value="MP-SEH-04"/></dl></Panel><Panel title="SHA-256 Demo Hash"><div className="rounded-md bg-header p-4 font-mono text-sm text-header-foreground"><p className="break-all">{n[5]}c8481fdd2b27e479a6b0f13c98e4073512</p></div><p className="mt-3 flex items-center gap-2 text-xs text-success"><ShieldCheck className="size-4"/>Previous hash linked · integrity verified</p></Panel></div></>;
}

function Detail({label,value}:{label:string;value:string}) { return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>; }

function GovernmentDashboard() {
  const { state }=useDemo(); const centres=[["Sehore",state.bottleneck?94:78,"142",state.bottleneck?"Weighment":"Healthy"],["Bhopal",68,"218","Healthy"],["Raisen",84,"176","QC pressure"],["Vidisha",57,"131","Healthy"]] as const;
  return <><PageHeading eyebrow="Government monitoring" title="Sehore District & Madhya Pradesh" description="Procurement performance, centre comparison and emerging bottlenecks"/><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><GovKpi label="Procured today" value="1,284 MT" change="+8.4% vs plan"/><GovKpi label="Farmers served" value={state.paymentComplete?"4,829":"4,828"} change="91% on time"/><GovKpi label="Avg. wait" value={state.bottleneck?"29 min":"23 min"} change="Target <30 min"/><GovKpi label="Active centres" value="38 / 42" change="4 planned closure"/></div><div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><Panel title="Peer Centre Comparison" subtitle="Live utilization across nearby procurement centres"><div className="space-y-3">{centres.map(([name,value,farmers,status])=><div key={name} className="grid grid-cols-[80px_1fr_52px] items-center gap-3"><div><p className="text-sm font-bold">{name}</p><p className="text-[10px] text-muted-foreground">{farmers} farmers</p></div><div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className={cn("h-full",value>=90?"bg-warning":value>=80?"bg-info":"bg-success")} style={{width:`${value}%`}}/></div><p className="mt-1 text-[10px] text-muted-foreground">{status}</p></div><strong className="text-right text-sm">{value}%</strong></div>)}</div></Panel><Panel title="District Alerts" subtitle="Prioritized by operational impact"><div className="space-y-3">{state.bottleneck&&<AlertItem level="Critical" text="Sehore WB-04 at 94%; releases paused"/>}<AlertItem level="Watch" text="Raisen QC utilization at 84%"/><AlertItem level="Info" text="Bhopal on-time rate improved 6%"/></div></Panel></div><div className="mt-4 grid gap-4 md:grid-cols-3"><Panel title="Commodity Mix"><p className="text-3xl font-bold">62%</p><p className="text-xs text-muted-foreground">Wheat · 796 MT</p><div className="mt-3 h-2 rounded-full bg-muted"><div className="h-full w-[62%] rounded-full bg-brand"/></div></Panel><Panel title="Payments"><p className="text-3xl font-bold">₹4.8 Cr</p><p className="text-xs text-muted-foreground">96.2% settled within SLA</p></Panel><Panel title="Storage Readiness"><p className="text-3xl font-bold">71%</p><p className="text-xs text-muted-foreground">8,420 MT district capacity free</p></Panel></div></>;
}

function GovKpi({label,value,change}:{label:string;value:string;change:string}) { return <div className="rounded-md border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-xl font-bold sm:text-2xl">{value}</p><p className="mt-1 text-[10px] text-success">{change}</p></div>; }
function AlertItem({level,text}:{level:string;text:string}) { return <div className="flex gap-3 rounded-md border p-3"><AlertTriangle className={cn("size-4 shrink-0",level==="Critical"?"text-warning-foreground":"text-info")}/><div><p className="text-[10px] font-bold uppercase text-muted-foreground">{level}</p><p className="mt-0.5 text-xs font-medium">{text}</p></div></div>; }

function DemoControls({open,onOpenChange,setDialog}:{open:boolean;onOpenChange:(v:boolean)=>void;setDialog:(d:DialogKind)=>void}) {
  const {state,dispatch}=useDemo(); const actions:{label:string;icon:ComponentType<{className?:string}>;action:DemoAction;dialog?:DialogKind}[]=[
    ["Reset Demo",RotateCcw,{type:"RESET"}], ["Simulate Farmer Request",UserRound,{type:"REQUEST"},"booking"], ["Simulate Farmer Arrival",ScanLine,{type:"ARRIVE"},"arrival"], ["Slow Weighbridge 12→6/hr",AlertTriangle,{type:"SLOWDOWN"}], ["Restore Weighbridge 12/hr",Activity,{type:"RESTORE_CAPACITY"}], ["Complete QC",ClipboardCheck,{type:"QC"},"qc"], ["Simulate Weight · WB-04",Scale,{type:"WEIGHT"},"weight"], ["Complete Procurement",Warehouse,{type:"PROCURE"},"procure"], ["Complete Payment",CircleDollarSign,{type:"PAY"},"payment"], ["Switch Offline",CloudOff,{type:"OFFLINE"}], ["Restore Connectivity",Wifi,{type:"ONLINE"}],
  ].map(([label,icon,action,dialog])=>({label:label as string,icon:icon as ComponentType<{className?:string}>,action:action as DemoAction,dialog:dialog as DialogKind}));
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>Demo Controller</SheetTitle><SheetDescription>Drive the shared KisanOne operational state.</SheetDescription></SheetHeader><div className="mt-5 rounded-md bg-header p-3 text-header-foreground"><StatusPill online={state.online} count={state.queuedActions.length}/>{!state.online&&<p className="mt-2 text-xs text-header-subtle">Actions stay on this device and sync automatically after connectivity returns.</p>}</div><div className="mt-4 space-y-2">{actions.map(({label,icon:Icon,action,dialog})=><Button key={label} variant="outline" className="h-11 w-full justify-start" disabled={(action.type==="OFFLINE"&&!state.online)||(action.type==="ONLINE"&&state.online)} onClick={()=>{dispatch(action);if(dialog)setDialog(dialog)}}><Icon/>{label}</Button>)}</div><div className="mt-5 rounded-md border bg-muted p-3 text-xs"><p className="font-bold">Live shared state</p><p className="mt-1 text-muted-foreground">Stage: {state.stage} · Capacity: {state.bottleneck?"Overloaded":"Normal"} · {state.queuedActions.length} offline actions</p></div></SheetContent></Sheet>;
}

function JudgeDemo({open,setOpen,auto,setAuto,goStep}:{open:boolean;setOpen:(v:boolean)=>void;auto:boolean;setAuto:(v:boolean)=>void;goStep:(n:number)=>void}) {
  const {state,dispatch}=useDemo(); const step=demoSteps[state.demoStep] ?? demoSteps[0];
  if (!step) return null;
  return <div className={cn("fixed inset-x-3 bottom-20 z-50 mx-auto max-w-2xl transition-all lg:bottom-5",open?"translate-y-0 opacity-100":"pointer-events-none translate-y-8 opacity-0")} role="dialog" aria-label="Judge demo walkthrough"><div className="overflow-hidden rounded-md border border-demo/40 bg-header text-header-foreground shadow-2xl"><div className="h-1 bg-header-muted"><div className="h-full bg-demo transition-all" style={{width:`${((state.demoStep+1)/demoSteps.length)*100}%`}}/></div><div className="p-4"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-md bg-demo font-bold text-demo-foreground">{state.demoStep+1}</div><div className="min-w-0"><p className="text-[10px] font-bold uppercase text-header-subtle">Judge Demo · Step {state.demoStep+1} of 18</p><h2 className="mt-0.5 font-bold">{step.title}</h2><p className="mt-1 text-sm leading-relaxed text-header-subtle">{step.text}</p></div><Button variant="ghost" size="icon" className="ml-auto text-header-foreground hover:bg-header-muted" onClick={()=>setOpen(false)}><X/></Button></div><div className="mt-4 flex items-center gap-2"><Button size="icon" variant="outline" className="border-header-border bg-header-muted text-header-foreground" disabled={state.demoStep===0} onClick={()=>goStep(state.demoStep-1)}><ChevronLeft/></Button><Button variant="outline" className="border-header-border bg-header-muted text-header-foreground" onClick={()=>setAuto(!auto)}>{auto?<Pause/>:<Play/>}{auto?"Pause":"Auto play"}</Button><Button className="ml-auto bg-demo text-demo-foreground hover:bg-demo/90" onClick={()=>{if(state.demoStep===demoSteps.length-1){dispatch({type:"RESET"});goStep(0)}else goStep(state.demoStep+1)}}>{state.demoStep===demoSteps.length-1?"Restart":"Next"}<ChevronRight/></Button></div></div></div></div>;
}

function OperationDialog({kind,setKind}:{kind:DialogKind;setKind:(k:DialogKind)=>void}) {
  const {state,dispatch,gross}=useDemo(); if(!kind)return null;
  const config={arrival:{title:"Arrival Validation",desc:"Validate farmer and request at the centre gate",action:{type:"ARRIVE"} as DemoAction,cta:"Validate & Admit"},qc:{title:"QC Inspection",desc:"Record commodity quality against procurement rules",action:{type:"QC"} as DemoAction,cta:"Pass QC"},weight:{title:"Weighment Console",desc:"Live simulated device stream from RS-232 WB-04",action:{type:"WEIGHT"} as DemoAction,cta:"Confirm Weight"},procure:{title:"Procurement Transaction",desc:"Generate the lot and procurement transaction",action:{type:"PROCURE"} as DemoAction,cta:"Complete Procurement"},payment:{title:"Payment Transaction",desc:"Close the procurement loop with payment confirmation",action:{type:"PAY"} as DemoAction,cta:"Mark Payment Completed"},booking:{title:"Book Procurement",desc:"Capacity-aware request for Sehore Procurement Centre",action:{type:"REQUEST"} as DemoAction,cta:"Generate Request K1-104"}}[kind];
  return <Dialog open onOpenChange={(v)=>!v&&setKind(null)}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{config.title}</DialogTitle><DialogDescription>{config.desc}</DialogDescription></DialogHeader><div className="space-y-3">{kind==="arrival"&&<><FormRow label="Farmer ID" value="FMR-104"/><FormRow label="Request ID" value="K1-104"/><div className="grid place-items-center rounded-md border-2 border-dashed bg-muted p-6"><ScanLine className="size-10 text-primary"/><p className="mt-2 font-bold">Signed QR verified</p><p className="text-xs text-muted-foreground">10:43 AM · OP-07 · GATE-02</p></div></>}{kind==="qc"&&<div className="grid grid-cols-2 gap-3"><FormRow label="Moisture" value="12.4%"/><FormRow label="Foreign Matter" value="1.8%"/><FormRow label="Grade" value="A"/><FormRow label="Rule Result" value="PASS"/></div>}{kind==="weight"&&<div className="rounded-md bg-header p-6 text-center text-header-foreground"><p className="text-xs text-header-subtle">RS-232 · WB-04 · STREAMING</p><p className="mt-4 font-mono text-5xl font-bold">52.40 <span className="text-xl">KG</span></p><p className="mt-3 text-xs text-success-soft"><Signal className="mr-1 inline size-3"/>Stable reading · checksum valid</p></div>}{kind==="procure"&&<><FormRow label="Lot ID" value="LOT-2026-0104"/><FormRow label="Rate" value="₹2,275 / qtl · Wheat MSP"/><FormRow label="Gross amount" value={`₹${gross.toLocaleString("en-IN",{minimumFractionDigits:2})}`}/></>}{kind==="payment"&&<><FormRow label="Transaction" value="TXN-10482"/><FormRow label="Payment ID" value="PAY-10482"/><FormRow label="Amount" value={`₹${gross.toLocaleString("en-IN",{minimumFractionDigits:2})}`}/><FormRow label="Mode" value="DBT · Bank a/c ••••6192"/></>}{kind==="booking"&&<><FormRow label="Farmer ID / किसान आईडी" value="FMR-104 · Ramesh Kumar"/><FormRow label="Crop / फसल" value="Wheat"/><FormRow label="Quantity / मात्रा" value="52.4 kg"/><FormRow label="Centre / केंद्र" value="Sehore Procurement Centre"/><div className="rounded-md bg-success-muted p-3 text-xs text-success"><Check className="mr-1 inline size-4"/>Capacity engine: safe arrival slot available</div></>}</div><DialogFooter><Button variant="outline" onClick={()=>setKind(null)}>Cancel</Button><Button onClick={()=>{dispatch(config.action);setKind(null)}} disabled={(kind==="qc"&&state.qcPassed)||(kind==="weight"&&state.weightConfirmed)||(kind==="payment"&&state.paymentComplete)}><Check/>{config.cta}</Button></DialogFooter></DialogContent></Dialog>;
}

function FormRow({label,value}:{label:string;value:string}) { return <div><label className="text-xs font-semibold text-muted-foreground">{label}</label><div className="mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">{value}</div></div>; }