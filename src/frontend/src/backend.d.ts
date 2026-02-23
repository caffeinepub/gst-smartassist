import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface T__1 {
    subscriptionExpiry?: bigint;
    name: string;
    plan: Plan;
    role: Role;
    businessName?: string;
    email: string;
    gstin?: string;
}
export interface T__4 {
    title: string;
    fullContent: string;
    isPremiumOnly: boolean;
    shortDescription: string;
}
export interface T__3 {
    title: string;
    userEmail?: string;
    dueDateType: Type;
    notificationDate?: bigint;
    reminderEnabled: boolean;
    dueDate: bigint;
    description: string;
}
export interface T__2 {
    customerName: string;
    status: string;
    itemTotal: number;
    userEmail: string;
    pdfLink?: string;
    customerPhone: string;
    createdDate: bigint;
    gstAmount: number;
    grandTotal: number;
    invoiceNumber: string;
    itemName: string;
    quantity: bigint;
    gstSlab: Slab;
    price: number;
}
export interface T {
    status: Status;
    userEmail: string;
    queryDescription: string;
    name: string;
    createdDate: bigint;
    fileUpload?: string;
    phone: string;
}
export interface T__5 {
    displayOrder: bigint;
    explanation?: string;
    correctAnswer?: string;
    quizQuestion?: string;
    description: string;
    category: Category;
    topicTitle: string;
}
export interface T__6 {
    isSaved: boolean;
    userEmail: string;
    cgst: number;
    sgst: number;
    gstAmount: number;
    totalAmount: number;
    timestamp: bigint;
    baseAmount: number;
    gstSlab: Slab;
    isInclusive: boolean;
}
export enum Category {
    itc = "itc",
    filing = "filing",
    gstBasics = "gstBasics"
}
export enum Plan {
    premium = "premium",
    free = "free"
}
export enum Role {
    admin = "admin",
    user = "user"
}
export enum Slab {
    slab12 = "slab12",
    slab18 = "slab18",
    slab28 = "slab28",
    slab5 = "slab5"
}
export enum Status {
    closed = "closed",
    assigned = "assigned",
    pending = "pending"
}
export enum Type {
    gstFiling = "gstFiling",
    custom = "custom",
    advanceTax = "advanceTax"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomReminder(title: string, description: string, dueDate: bigint, reminderEnabled: boolean): Promise<T__3>;
    createGstCalculation(userEmail: string, baseAmount: number, gstSlab: Slab, isInclusive: boolean): Promise<T__6>;
    createInvoice(userEmail: string, customerName: string, customerPhone: string, itemName: string, quantity: bigint, price: number, gstSlab: Slab): Promise<T__2 | null>;
    deleteCalculation(userEmail: string, timestamp: bigint): Promise<boolean>;
    deleteInvoice(invoiceNumber: string): Promise<boolean>;
    getAllCaLeads(): Promise<Array<T>>;
    getAllLearningContent(): Promise<Array<T__5>>;
    getCalculationsByUser(userEmail: string): Promise<Array<T__6>>;
    getCallerUserProfile(): Promise<T__1 | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLearningContentByCategory(category: Category): Promise<Array<T__5>>;
    getTaxTips(): Promise<Array<T__4>>;
    getUpcomingDueDates(): Promise<Array<T__3>>;
    getUserCaLeads(): Promise<Array<T>>;
    getUserCustomReminders(): Promise<Array<T__3>>;
    getUserInvoices(userEmail: string): Promise<Array<T__2>>;
    getUserProfile(user: Principal): Promise<T__1 | null>;
    isCallerAdmin(): Promise<boolean>;
    preloadLearningContent(): Promise<void>;
    preloadStatutoryDueDates(): Promise<void>;
    preloadTaxTips(): Promise<void>;
    saveCallerUserProfile(profile: T__1): Promise<void>;
    submitCaLead(name: string, phone: string, queryDescription: string, fileUpload: string | null): Promise<T>;
    updateCaLeadStatus(leadKey: string, newStatus: Status): Promise<boolean>;
}
