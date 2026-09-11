/**
 * KisanOne API Client
 * Centralized HTTP client for the KisanOne FastAPI backend.
 * All business logic lives in the backend — this file only transports data.
 */

// In dev the Vite proxy rewrites /api/* → backend; in production use the env var directly.
const BASE =
  typeof window !== "undefined" && import.meta.env.DEV
    ? "/api"
    : (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000");

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = (data as { detail?: string })?.detail ?? res.statusText;
    throw new ApiError(res.status, detail);
  }
  return data as T;
}

// ─── Farmers ────────────────────────────────────────────────────────────────────

export interface Farmer {
  farmerId: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  area: string;
  preferredLanguage?: string;
  ekycVerified?: boolean;
}

export const createFarmer = (f: Farmer) => request<Farmer>("POST", "/farmers", f);
export const listFarmers = () => request<Farmer[]>("GET", "/farmers");
export const getFarmer = (id: string) => request<Farmer>("GET", `/farmers/${id}`);

// ─── Centres ────────────────────────────────────────────────────────────────────

export interface Centre {
  centreId: string;
  centreName: string;
  state: string;
  district: string;
  area: string;
  address: string;
  supportedCrops: string[];
  operatingDays: string[];
  operatingHours: string;
  dailyProcurementCapacityKg: number;
  dailyQcCapacity: number;
  dailyWeighmentCapacity: number;
  status: string;
}

export const listCentres = () => request<Centre[]>("GET", "/centres");
export const getCentre = (id: string) => request<Centre>("GET", `/centres/${id}`);

// ─── Crop Configurations ────────────────────────────────────────────────────────

export interface QualityTest {
  testCode: string;
  testName: string;
  unit: string;
  dataType: string;
  required: boolean;
  description?: string;
}

export interface CropConfig {
  cropCode: string;
  cropName: string;
  status: string;
  qualityTests: QualityTest[];
}

export const listCropConfigs = () => request<CropConfig[]>("GET", "/crop-configurations");
export const getCropConfig = (code: string) => request<CropConfig>("GET", `/crop-configurations/${code}`);

// ─── Employees ──────────────────────────────────────────────────────────────────

export interface Employee {
  employeeId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  centreId: string;
  status: string;
}

export const listEmployees = () => request<Employee[]>("GET", "/employees");

// ─── Slots ──────────────────────────────────────────────────────────────────────

export interface SlotAssignResult {
  centreId: string;
  slotId: string;
  centre: Centre;
  slot: {
    slotId: string;
    centreId: string;
    cropCode: string;
    date: string;
    startTime: string;
    endTime: string;
    capacityKg: number;
    allocatedKg: number;
    remainingCapacityKg: number;
    maxFarmers: number;
    allocatedFarmers: number;
    remainingFarmerCapacity: number;
    status: string;
  };
}

export const assignSlot = (p: {
  farmerId: string;
  cropCode: string;
  expectedQuantityKg: number;
  farmerArea?: string;
}) => request<SlotAssignResult>("POST", "/slots/assign", p);

// ─── Procurement Requests ───────────────────────────────────────────────────────

export interface ProcurementRequest {
  requestId: string;
  farmerId: string;
  cropCode: string;
  farmerArea?: string;
  expectedQuantityKg: number;
  assignedCentreId: string;
  assignedSlotId: string;
  status: string;
  lotId?: string;
}

export const createProcurementRequest = (p: {
  requestId: string;
  farmerId: string;
  cropCode: string;
  farmerArea?: string;
  expectedQuantityKg: number;
  autoAssign?: boolean;
  assignedCentreId?: string;
  assignedSlotId?: string;
}) => request<ProcurementRequest>("POST", "/procurement-requests", p);

export const getProcurementRequest = (id: string) =>
  request<ProcurementRequest>("GET", `/procurement-requests/${id}`);

export const listProcurementRequests = () =>
  request<ProcurementRequest[]>("GET", "/procurement-requests");

// ─── Arrival ────────────────────────────────────────────────────────────────────

export interface ArrivalResult {
  requestId: string;
  lotId: string;
  status: string;
  arrivedAt?: string;
}

export const markArrival = (requestId: string, p: { farmerId: string; employeeId: string }) =>
  request<ArrivalResult>("POST", `/procurement-requests/${requestId}/arrival`, p);

// ─── Lots ───────────────────────────────────────────────────────────────────────

export interface Lot {
  lotId: string;
  requestId: string;
  farmerId: string;
  cropCode: string;
  centreId: string;
  status: string;
}

export const getLot = (id: string) => request<Lot>("GET", `/lots/${id}`);
export const getLotByRequest = (requestId: string) =>
  request<Lot>("GET", `/procurement-requests/${requestId}/lot`);

// ─── Quality Checks ─────────────────────────────────────────────────────────────

export interface QCAttempt {
  qcAttemptId: string;
  lotId: string;
  attemptNumber: number;
  employeeId: string;
  tests: Record<string, number>;
  performedAt: string;
}

export interface QCEvaluation {
  evaluationId: string;
  qcAttemptId: string;
  lotId: string;
  cropCode: string;
  grade: string;
  decision: string;
  pricePerKg: number;
  rulebookId: string;
  rulebookVersion: number;
  testResults: Record<string, unknown>;
}

export const submitQualityCheck = (lotId: string, p: { employeeId: string; tests: Record<string, number> }) =>
  request<QCAttempt>("POST", `/lots/${lotId}/quality-checks`, p);

export const evaluateQC = (qcAttemptId: string) =>
  request<QCEvaluation>("POST", `/quality-checks/${qcAttemptId}/evaluate`);

export const getQCEvaluation = (qcAttemptId: string) =>
  request<QCEvaluation>("GET", `/quality-checks/${qcAttemptId}/evaluation`);

export const listQCAttempts = (lotId: string) =>
  request<QCAttempt[]>("GET", `/lots/${lotId}/quality-checks`);

// ─── Weighments ─────────────────────────────────────────────────────────────────

export interface Weighment {
  weighmentId: string;
  lotId: string;
  employeeId: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
}

export const createWeighment = (lotId: string, p: { employeeId: string; grossWeightKg: number; tareWeightKg: number }) =>
  request<Weighment>("POST", `/lots/${lotId}/weighments`, p);

// ─── Government Procurement ─────────────────────────────────────────────────────

export interface GovProcurement {
  procurementId: string;
  lotId: string;
  farmerId: string;
  cropCode: string;
  centreId: string;
  weighmentId: string;
  qcAttemptId: string;
  qualityGrade: string;
  pricePerKg: number;
  procurementQuantityKg: number;
  grossAmount: number;
}

export const createGovProcurement = (lotId: string, p: {
  weighmentId: string;
  procurementQuantityKg: number;
  qcAttemptId: string;
  employeeId: string;
}) => request<GovProcurement>("POST", `/lots/${lotId}/procurement`, p);

// ─── Payments ───────────────────────────────────────────────────────────────────

export interface Payment {
  paymentId: string;
  procurementId: string;
  farmerId: string;
  payableAmount: number;
  paymentStatus: string;
}

export const createPayment = (procurementId: string, p: { employeeId: string }) =>
  request<Payment>("POST", `/procurements/${procurementId}/payment`, p);

export const updatePaymentStatus = (paymentId: string, p: {
  employeeId: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
}) => request<Payment>("PATCH", `/payments/${paymentId}/status`, p);

// ─── Rulebooks ──────────────────────────────────────────────────────────────────

export interface Rulebook {
  cropCode: string;
  version: number;
  environment: string;
  source: string;
  pricing: Record<string, { pricePerKg: number }>;
  gradeThresholds: Record<string, Record<string, number>>;
}

export const getRulebook = (cropCode: string) =>
  request<Rulebook>("GET", `/rulebooks/${cropCode}`);
