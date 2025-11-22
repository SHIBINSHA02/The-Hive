// services/types.ts
import React from 'react';

export interface User {
    name: string;
    email: string;
}

export enum ProjectStatus {
    ACTIVE = 'Active',
    COMPLETED = 'Completed',
    ON_HOLD = 'On Hold',
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: ProjectStatus;
    progress: number;
    members: number;
    lastUpdated: string;
}

export interface NavItem {
    label: string;
    href: string;
}

export interface Feature {
    title: string;
    description: string;
    icon: React.ReactNode;
}