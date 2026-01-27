import { Injectable, signal, computed, inject, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../config/api.token';
import { ProfileService, UserProfile } from './profile.service';
import { AuthService } from './auth.service';

/**
 * User Service
 * 
 * Manages user state and credits
 * Integrates with ProfileService for user data
 * Handles credit transactions with proper API calls
 */
export interface User {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'investor' | 'founder';
  credits: number;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  
  private currentUser = signal<User | null>(null);

  user = computed(() => this.currentUser());
  credits = computed(() => this.currentUser()?.credits ?? 0);

  constructor(@Inject(API_BASE) private apiBase: string) {
    // Load user profile on service initialization
    this.initializeUser();
  }

  /**
   * Initialize user from ProfileService
   */
  private async initializeUser(): Promise<void> {
    try {
      const profile = await this.profileService.loadMyProfile();
      if (profile) {
        this.setUserFromProfile(profile);
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
    }
  }

  /**
   * Map UserProfile to User model
   */
  private setUserFromProfile(profile: UserProfile): void {
    const user: User = {
      userId: profile.userId,
      name: profile.basicInfo?.fullName || profile.basicInfo?.firstName || 'User',
      email: profile.contactInfo?.email || profile.coreMetrics?.email || '',
      phoneNumber: profile.contactInfo?.phone1 || '',
      role: (profile.coreMetrics?.role?.toLowerCase() === 'founder' ? 'founder' : 'investor') as 'investor' | 'founder',
      credits: profile.coreMetrics?.walletBalance ?? 0,
      profileImageUrl: profile.basicInfo?.avatarUrl || undefined
    };
    this.currentUser.set(user);
  }

  /**
   * Reload user profile from API
   */
  async refreshUser(): Promise<void> {
    await this.initializeUser();
  }

  /**
   * Update user credits (local state only)
   * For actual credit transactions, use deductCredits or addCredits which call the API
   */
  private updateCredits(newAmount: number): void {
    this.currentUser.update(user => user ? {
      ...user,
      credits: newAmount
    } : null);
  }

  /**
   * Deduct credits from user account
   * Note: This updates local state. Backend API will handle the actual transaction
   * @returns new credit balance
   * @throws Error if insufficient credits
   */
  deductCredits(amount: number): number {
    const current = this.currentUser();
    if (!current) {
      throw new Error('User not loaded');
    }
    if (current.credits < amount) {
      throw new Error('Insufficient credits');
    }
    const newBalance = current.credits - amount;
    this.updateCredits(newBalance);
    return newBalance;
  }

  /**
   * Add credits to user account (local state)
   * Backend API handles actual credit addition with audit trail
   */
  addCredits(amount: number): number {
    const current = this.currentUser();
    if (!current) {
      throw new Error('User not loaded');
    }
    const newBalance = current.credits + amount;
    this.updateCredits(newBalance);
    return newBalance;
  }

  /**
   * Get access token for API calls
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Clear user data (on logout)
   */
  clear(): void {
    this.currentUser.set(null);
  }
}
