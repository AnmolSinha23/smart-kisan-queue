import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

export const stages = ["Gate", "QC", "Weighment", "Unloading", "Procurement", "Payment"] as const;
export type Stage = (typeof stages)[number];

export type DemoState = {
  requestCreated: boolean;
  arrived: boolean;
  bottleneck: boolean;
  online: boolean;
  stage: Stage;
  weightConfirmed: boolean;
  qcPassed: boolean;
  procurementComplete: boolean;
  paymentComplete: boolean;
  queuedActions: string[];
  events: { time: string; text: string; tone: "info" | "success" | "warning" }[];
  sms: string[];
  demoStep: number;
};

export type DemoAction =
  | { type: "RESET" }
  | { type: "REQUEST" }
  | { type: "ARRIVE" }
  | { type: "SLOWDOWN" }
  | { type: "RESTORE_CAPACITY" }
  | { type: "QC" }
  | { type: "WEIGHT" }
  | { type: "PROCURE" }
  | { type: "PAY" }
  | { type: "OFFLINE" }
  | { type: "ONLINE" }
  | { type: "MOVE"; stage: Stage }
  | { type: "DEMO_STEP"; step: number };

const initialState: DemoState = {
  requestCreated: true,
  arrived: false,
  bottleneck: false,
  online: true,
  stage: "Gate",
  weightConfirmed: false,
  qcPassed: false,
  procurementComplete: false,
  paymentComplete: false,
  queuedActions: [],
  events: [
    { time: "10:39:08", text: "Call-to-Come issued to K1-104", tone: "success" },
    { time: "10:37:42", text: "Capacity plan recalculated · 18 farmers", tone: "info" },
    { time: "10:35:11", text: "WB-04 telemetry healthy · 12/hr", tone: "info" },
  ],
  sms: ["KisanOne: K1-104 approved. Please arrive 10:40 AM–10:55 AM. Queue #4."],
  demoStep: 0,
};

const now = () => new Date().toLocaleTimeString("en-IN", { hour12: false });

function addEvent(state: DemoState, text: string, tone: "info" | "success" | "warning" = "info") {
  return [{ time: now(), text, tone }, ...state.events].slice(0, 8);
}

function reducer(state: DemoState, action: DemoAction): DemoState {
  const queueOffline = (label: string) => (state.online ? state.queuedActions : [...state.queuedActions, label]);
  switch (action.type) {
    case "RESET": return initialState;
    case "REQUEST": return { ...state, requestCreated: true, stage: "Gate", events: addEvent(state, "Request K1-104 approved by capacity rules", "success"), sms: [...state.sms, "KisanOne: Your wheat procurement request K1-104 is approved."] };
    case "ARRIVE": return { ...state, arrived: true, stage: "Gate", queuedActions: queueOffline("Arrival K1-104"), events: addEvent(state, `Arrival validated at GATE-02${state.online ? "" : " · queued offline"}`, "success") };
    case "SLOWDOWN": return { ...state, bottleneck: true, events: addEvent(state, "WB-04 throughput fell 12→6/hr · releases paused", "warning"), sms: [...state.sms, "KisanOne alert: Centre capacity has slowed. Your revised arrival time is 11:05 AM. कृपया 11:05 बजे आएं।"] };
    case "RESTORE_CAPACITY": return { ...state, bottleneck: false, events: addEvent(state, "WB-04 restored to 12/hr · releases resumed", "success"), sms: [...state.sms, "KisanOne: Centre capacity restored. Your 10:40–10:55 AM window is active."] };
    case "QC": return { ...state, qcPassed: true, stage: "Weighment", queuedActions: queueOffline("QC pass K1-104"), events: addEvent(state, "QC passed · Grade A · moisture 12.4%", "success") };
    case "WEIGHT": return { ...state, weightConfirmed: true, stage: "Unloading", queuedActions: queueOffline("Weight 52.40 kg"), events: addEvent(state, "52.40 kg captured from RS-232 WB-04", "success") };
    case "PROCURE": return { ...state, procurementComplete: true, stage: "Payment", queuedActions: queueOffline("Procurement TXN-10482"), events: addEvent(state, "LOT-2026-0104 and TXN-10482 generated", "success") };
    case "PAY": return { ...state, paymentComplete: true, stage: "Payment", queuedActions: queueOffline("Payment PAY-10482"), events: addEvent(state, "Payment PAY-10482 completed", "success"), sms: [...state.sms, "KisanOne: ₹1,192.10 payment completed for TXN-10482."] };
    case "OFFLINE": return { ...state, online: false, events: addEvent(state, "Connectivity lost · offline-first mode active", "warning") };
    case "ONLINE": return { ...state, online: true, queuedActions: [], events: addEvent(state, `${state.queuedActions.length} local action(s) synced`, "success") };
    case "MOVE": return { ...state, stage: action.stage, events: addEvent(state, `K1-104 moved to ${action.stage}`, "info") };
    case "DEMO_STEP": return { ...state, demoStep: action.step };
  }
}

type ContextValue = { state: DemoState; dispatch: React.Dispatch<DemoAction>; arrivalWindow: string; eta: number; queuePosition: number; gross: number };
const DemoContext = createContext<ContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({
    state,
    dispatch,
    arrivalWindow: state.bottleneck ? "11:05 AM – 11:20 AM" : "10:40 AM – 10:55 AM",
    eta: state.paymentComplete ? 0 : state.bottleneck ? 40 : state.stage === "Gate" ? 18 : Math.max(4, 16 - stages.indexOf(state.stage) * 3),
    queuePosition: state.paymentComplete ? 0 : Math.max(1, 4 - stages.indexOf(state.stage)),
    gross: 1192.1,
  }), [state]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside DemoProvider");
  return value;
}