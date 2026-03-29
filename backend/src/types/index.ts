export interface Survey {
    id?: string;
    title: string;
    description: string;
    expiryDate: string; // ISO string (UTC)
    published: boolean;
    createdAt: string;  // ISO string (UTC)
    createdBy: string;  // Firebase UID
}