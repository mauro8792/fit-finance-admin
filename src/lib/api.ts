import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fit-finance-backend-8lhp.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================
// AUTH
// ============================

export async function loginAdmin(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function checkAuthStatus() {
  const { data } = await api.get("/auth/check-auth-status");
  return data;
}

// ============================
// ORGANIZATIONS
// ============================

/** Escala del logo/imagen en la pantalla de login (PWA); alineado con `fit-finance` / `fit-finance-ui-3`. */
export type LoginHeroScale = "compact" | "default" | "comfortable";

export interface OrganizationData {
  id: number;
  name: string;
  slug: string;
  type: "independent_coach" | "gym";
  isActive: boolean;
  logoUrl?: string;
  logoLightUrl?: string;
  /** PWA install icons (Cloudinary/CDN), también en `tenant.branding` */
  icon192?: string;
  icon512?: string;
  /** Solo pantalla de login (`fit-finance-ui-3`); prioridad sobre logo en /auth/login */
  loginImageUrl?: string;
  /** Tamaño visual del hero en login (no reemplaza un archivo bien recortado). */
  loginHeroScale?: LoginHeroScale;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
  _coachCount?: number;
  _studentCount?: number;
}

export async function getOrganizations(): Promise<OrganizationData[]> {
  const { data } = await api.get("/organizations");
  return data;
}

export async function getOrganization(id: number): Promise<OrganizationData> {
  const { data } = await api.get(`/organizations/${id}`);
  return data;
}

export async function createOrganization(
  dto: Partial<OrganizationData>
): Promise<OrganizationData> {
  const { data } = await api.post("/organizations", dto);
  return data;
}

export async function updateOrganization(
  id: number,
  dto: Partial<OrganizationData>
): Promise<OrganizationData> {
  const { data } = await api.patch(`/organizations/${id}`, dto);
  return data;
}

/** Solo `tenant.branding` (logos, PWA, login hero, footer, contacto en JSON). */
export async function patchOrganizationBranding(
  id: number,
  dto: Partial<
    Pick<
      OrganizationData,
      | "logoUrl"
      | "logoLightUrl"
      | "icon192"
      | "icon512"
      | "loginImageUrl"
      | "loginHeroScale"
      | "footerText"
      | "contactEmail"
      | "contactPhone"
    >
  >
): Promise<OrganizationData> {
  const { data } = await api.patch(`/organizations/${id}/branding`, dto);
  return data;
}

export async function getOrganizationStats(
  id: number
): Promise<{ coaches: number; students: number; activeStudents: number }> {
  const { data } = await api.get(`/organizations/${id}/stats`);
  return data;
}

// ============================
// ORG ADMINS
// ============================

export interface OrgAdminData {
  id: number;
  email: string;
  fullName: string;
  organizationId: number | null;
  isActive: boolean;
  roles: { id: number; name: string }[];
}

export async function createOrgAdmin(
  organizationId: number,
  dto: { email: string; password: string; fullName: string }
): Promise<{ user: Partial<OrgAdminData>; organization: OrganizationData }> {
  const { data } = await api.post(`/organizations/${organizationId}/admins`, dto);
  return data;
}

export async function getOrgAdmins(organizationId: number): Promise<OrgAdminData[]> {
  const { data } = await api.get(`/organizations/${organizationId}/admins`);
  return data;
}

// ============================
// SUBSCRIPTIONS
// ============================

/** La API puede devolver features como lista de claves activas o como mapa booleano. */
export type PlanFeaturesPayload = string[] | Record<string, boolean>;

const PLAN_FEATURE_KEYS = [
  "routines",
  "nutrition",
  "progress",
  "payments",
  "multiCoach",
] as const;

const DEFAULT_PLAN_FEATURES: Record<string, boolean> = {
  routines: true,
  nutrition: true,
  progress: true,
  payments: true,
};

/** Normaliza `features` del plan a un mapa para formularios y UI. */
export function planFeaturesToRecord(
  features: PlanFeaturesPayload | null | undefined,
): Record<string, boolean> {
  if (features == null) {
    return { ...DEFAULT_PLAN_FEATURES };
  }
  if (Array.isArray(features)) {
    const out: Record<string, boolean> = {};
    for (const key of PLAN_FEATURE_KEYS) {
      out[key] = features.includes(key);
    }
    return out;
  }
  return { ...DEFAULT_PLAN_FEATURES, ...features };
}

export interface SubscriptionPlanData {
  id: number;
  name: string;
  slug: string;
  type: string;
  maxStudents: number | null;
  maxCoaches: number | null;
  priceUsd: number;
  priceArs: number;
  durationDays: number | null;
  isActive: boolean;
  description: string;
  features: PlanFeaturesPayload;
}

export interface SubscriptionData {
  id: number;
  organizationId: number | null;
  studentId: number | null;
  planId: number;
  status: "trial" | "active" | "expired" | "suspended" | "cancelled";
  startDate: string;
  endDate: string | null;
  trialEndsAt: string | null;
  nextBillingDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlanData;
  organization?: OrganizationData;
}

export async function getPlans(): Promise<SubscriptionPlanData[]> {
  const { data } = await api.get("/subscriptions/plans");
  return data;
}

export async function getPlan(id: number): Promise<SubscriptionPlanData> {
  const { data } = await api.get(`/subscriptions/plans/${id}`);
  return data;
}

export async function createPlan(
  dto: Partial<SubscriptionPlanData>
): Promise<SubscriptionPlanData> {
  const { data } = await api.post("/subscriptions/plans", dto);
  return data;
}

export async function updatePlan(
  id: number,
  dto: Partial<SubscriptionPlanData>
): Promise<SubscriptionPlanData> {
  const { data } = await api.patch(`/subscriptions/plans/${id}`, dto);
  return data;
}

export async function seedPlans(): Promise<SubscriptionPlanData[]> {
  const { data } = await api.post("/subscriptions/plans/seed");
  return data;
}

export async function getSubscriptions(): Promise<SubscriptionData[]> {
  const { data } = await api.get("/subscriptions");
  return data;
}

export async function getSubscription(id: number): Promise<SubscriptionData> {
  const { data } = await api.get(`/subscriptions/${id}`);
  return data;
}

export async function createSubscription(
  dto: Partial<SubscriptionData>
): Promise<SubscriptionData> {
  const { data } = await api.post("/subscriptions", dto);
  return data;
}

export async function updateSubscription(
  id: number,
  dto: Partial<SubscriptionData>
): Promise<SubscriptionData> {
  const { data } = await api.patch(`/subscriptions/${id}`, dto);
  return data;
}

// ============================
// SUBSCRIPTION PAYMENTS
// ============================

export interface SubscriptionPaymentData {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  method: "transfer" | "mercadopago" | "cash" | "card" | "other";
  paymentDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  notes: string | null;
  registeredBy: string | null;
  createdAt: string;
  subscription?: SubscriptionData;
}

export async function createSubscriptionPayment(
  dto: Partial<SubscriptionPaymentData>
): Promise<SubscriptionPaymentData> {
  const { data } = await api.post("/subscriptions/payments", dto);
  return data;
}

export async function getAllSubscriptionPayments(): Promise<
  SubscriptionPaymentData[]
> {
  const { data } = await api.get("/subscriptions/payments");
  return data;
}

export async function getSubscriptionPayments(
  subscriptionId: number
): Promise<SubscriptionPaymentData[]> {
  const { data } = await api.get(
    `/subscriptions/${subscriptionId}/payments`
  );
  return data;
}

export async function getExpiringSoonSubscriptions(): Promise<
  SubscriptionData[]
> {
  const { data } = await api.get("/subscriptions/alerts/expiring-soon");
  return data;
}

// ============================
// COACHES
// ============================

export interface CoachData {
  id: number;
  userId: number;
  organizationId: number | null;
  specialization: string | null;
  experience: string | null;
  certification: string | null;
  bio: string | null;
  salary: number | null;
  isActive: boolean;
  hasPersonalProfile: boolean;
  paymentAlias: string | null;
  paymentNotes: string | null;
  defaultFeeAmount: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    isActive: boolean;
  };
  sports: { id: number; name: string }[];
  students: { id: number; firstName: string; lastName: string; isActive: boolean }[];
}

export interface CreateCompleteCoachData {
  email: string;
  password: string;
  fullName: string;
  organizationId?: number;
  sportIds?: number[];
  specialization?: string;
  experience?: string;
  certification?: string;
  bio?: string;
  isActive?: boolean;
}

export async function getCoaches(): Promise<CoachData[]> {
  const { data } = await api.get("/coaches");
  return data;
}

export async function getCoach(id: number): Promise<CoachData> {
  const { data } = await api.get(`/coaches/${id}`);
  return data;
}

export async function createCompleteCoach(
  dto: CreateCompleteCoachData
): Promise<CoachData> {
  const { data } = await api.post("/coaches/complete", dto);
  return data;
}

export async function updateCoach(
  id: number,
  dto: Partial<CoachData & { sportIds?: number[] }>
): Promise<CoachData> {
  const { data } = await api.patch(`/coaches/${id}`, dto);
  return data;
}

export async function toggleCoachActive(id: number): Promise<CoachData> {
  const { data } = await api.patch(`/coaches/${id}/toggle-active`);
  return data;
}

export async function getSports(): Promise<{ id: number; name: string }[]> {
  const { data } = await api.get("/sports");
  return data;
}

// ============================
// DASHBOARD / STATS
// ============================

export interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  expiringTrials: number;
  totalStudents: number;
  totalCoaches: number;
  monthlyRevenue: { usd: number; ars: number };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get("/organizations/admin/dashboard");
  return data;
}

// ============================
// UPLOAD
// ============================

export async function uploadImage(
  file: File,
  folder: string = "fit-finance/organizations"
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(
    `/upload/image?folder=${encodeURIComponent(folder)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
}

export default api;
