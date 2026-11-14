'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocationState } from './LocationContext';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  affiliation?: string;
  role?: string;
  createdAt: string;
}

export interface SavedInvestigation {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  mainLocation: LocationState;
  secondaryLocation?: LocationState;
  selectedCategory: string;
  selectedVariable: string;
  forecastHorizonMonths?: number;
  confidenceLevel?: number;
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  notes?: string;
  tags?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  savedInvestigations: SavedInvestigation[];
  activeInvestigationId: string | null;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  saveInvestigation: (params: {
    title: string;
    description?: string;
    mainLocation: LocationState;
    secondaryLocation?: LocationState;
    selectedCategory?: string;
    selectedVariable?: string;
    forecastHorizonMonths?: number;
    confidenceLevel?: number;
    chatMessages?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
    notes?: string;
    tags?: string[];
  }) => Promise<SavedInvestigation>;
  loadInvestigation: (id: string) => SavedInvestigation | null;
  deleteInvestigation: (id: string) => Promise<void>;
  updateInvestigationNotes: (id: string, notes: string) => Promise<void>;
  refreshInvestigations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase client singleton reference
const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedInvestigations, setSavedInvestigations] = useState<SavedInvestigation[]>([]);
  const [activeInvestigationId, setActiveInvestigationId] = useState<string | null>(null);

  // Track currently active user ID to prevent redundant auth event re-renders
  const currentUserIdRef = React.useRef<string | null>(null);

  // Load user profile from Supabase user object & profiles table
  const fetchUserProfile = useCallback(async (authUser: any): Promise<UserProfile | null> => {
    if (!authUser) return null;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const name =
        profile?.full_name ||
        authUser.user_metadata?.full_name ||
        authUser.email?.split('@')[0] ||
        'Researcher';

      return {
        id: authUser.id,
        name,
        email: authUser.email || '',
        avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
        affiliation: profile?.institution || 'SpaceGeoAI Research Community',
        role: profile?.role || 'Lead Earth-System Trend Detective',
        createdAt: profile?.created_at || authUser.created_at || new Date().toISOString(),
      };
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Researcher',
        email: authUser.email || '',
        role: 'Earth-System Researcher',
        createdAt: authUser.created_at || new Date().toISOString(),
      };
    }
  }, []);

  // Load investigations from Supabase or localStorage
  const loadInvestigationsForUser = useCallback(async (userId?: string) => {
    try {
      if (userId && isSupabaseConfigured) {
        // 1. Try querying saved_investigations table first
        const { data: invData, error: invErr } = await supabase
          .from('saved_investigations')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!invErr && invData && invData.length > 0) {
          const mapped: SavedInvestigation[] = invData.map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            mainLocation: {
              name: row.main_location_name,
              coordinates: [row.main_location_lng, row.main_location_lat],
              radiusKm: row.main_location_radius_km || 100,
              isRadiusLocked: true,
              boundingBox: row.main_location_bbox || undefined,
            },
            secondaryLocation: row.secondary_location_name
              ? {
                  name: row.secondary_location_name,
                  coordinates: [row.secondary_location_lng, row.secondary_location_lat],
                  radiusKm: row.secondary_location_radius_km || 100,
                  isRadiusLocked: true,
                }
              : undefined,
            selectedCategory: row.selected_category || 'Vegetation & Biosphere',
            selectedVariable: row.selected_variable || 'ndvi',
            forecastHorizonMonths: row.forecast_horizon_months || 24,
            confidenceLevel: row.confidence_level || 95,
            chatMessages: Array.isArray(row.chat_messages) ? row.chat_messages : [],
            notes: row.notes || '',
            tags: row.tags || [],
          }));

          setSavedInvestigations(mapped);
          return;
        }

        // 2. Fallback: check research_projects + research_plans table
        const { data: projData, error: projErr } = await supabase
          .from('research_projects')
          .select('*, research_plans(plan_json)')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!projErr && projData && projData.length > 0) {
          const mapped: SavedInvestigation[] = projData.map((row: any) => {
            const plan = row.research_plans?.[0]?.plan_json || {};
            return {
              id: row.id,
              title: row.title,
              description: row.description || '',
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              mainLocation: plan.mainLocation || {
                name: 'Investigation Location',
                coordinates: [0, 0],
                radiusKm: 100,
                isRadiusLocked: true,
              },
              secondaryLocation: plan.secondaryLocation,
              selectedCategory: plan.selectedCategory || 'Vegetation & Biosphere',
              selectedVariable: plan.selectedVariable || 'ndvi',
              forecastHorizonMonths: plan.forecastHorizonMonths || 24,
              confidenceLevel: plan.confidenceLevel || 95,
              chatMessages: plan.chatMessages || [],
              notes: plan.notes || '',
              tags: plan.tags || [],
            };
          });

          setSavedInvestigations(mapped);
          return;
        }
      }

      // 3. Fallback: load from localStorage
      const stored = localStorage.getItem('esa_saved_investigations');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedInvestigations(Array.isArray(parsed) ? parsed : []);
      } else {
        setSavedInvestigations([]);
      }
    } catch (err) {
      console.warn('Could not load investigations from database, checking local cache:', err);
      try {
        const stored = localStorage.getItem('esa_saved_investigations');
        if (stored) setSavedInvestigations(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Sync session on mount and listen to auth changes
  useEffect(() => {
    let isMounted = true;

    async function handleSessionUser(authUser: any) {
      if (!isMounted) return;
      if (authUser) {
        if (currentUserIdRef.current === authUser.id) return;
        currentUserIdRef.current = authUser.id;
        const profile = await fetchUserProfile(authUser);
        if (isMounted) {
          setUser(profile);
          await loadInvestigationsForUser(authUser.id);
        }
      } else {
        if (currentUserIdRef.current === null && user === null) return;
        currentUserIdRef.current = null;
        if (isMounted) {
          try {
            const localUser = localStorage.getItem('esa_user_profile');
            setUser(localUser ? JSON.parse(localUser) : null);
          } catch {
            setUser(null);
          }
          await loadInvestigationsForUser();
        }
      }
    }

    async function initAuth() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          await handleSessionUser(session?.user);
        } else {
          const localUser = localStorage.getItem('esa_user_profile');
          if (localUser && isMounted) setUser(JSON.parse(localUser));
          await loadInvestigationsForUser();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth state changes without triggering re-render cascades
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      const newUserId = session?.user?.id || null;
      if (newUserId !== currentUserIdRef.current) {
        await handleSessionUser(session?.user);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserProfile, loadInvestigationsForUser]);

  // Sign In with real Supabase Auth
  const signIn = async (email: string, password?: string) => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback for offline local development
        const localProfile: UserProfile = {
          id: `usr-${Date.now().toString(36)}`,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email,
          role: 'Earth-System Researcher',
          createdAt: new Date().toISOString(),
        };
        setUser(localProfile);
        localStorage.setItem('esa_user_profile', JSON.stringify(localProfile));
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'SpaceApps2026!',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        currentUserIdRef.current = data.user.id;
        const profile = await fetchUserProfile(data.user);
        setUser(profile);
        await loadInvestigationsForUser(data.user.id);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  // Sign Up with real Supabase Auth
  const signUp = async (name: string, email: string, password?: string) => {
    try {
      if (!isSupabaseConfigured) {
        const localProfile: UserProfile = {
          id: `usr-${Date.now().toString(36)}`,
          name,
          email,
          role: 'Earth-System Researcher',
          createdAt: new Date().toISOString(),
        };
        setUser(localProfile);
        localStorage.setItem('esa_user_profile', JSON.stringify(localProfile));
        return { success: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || 'SpaceApps2026!',
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      let activeUser = data.user;

      // Email confirmation is intentionally bypassed: if Supabase withheld the
      // session, confirm the account server-side and sign in immediately so the
      // user lands straight in the portal.
      if (activeUser && !data.session) {
        const effectivePassword = password || 'SpaceApps2026!';
        try {
          const confirmRes = await fetch('/api/auth/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: activeUser.id, email }),
          });
          if (confirmRes.ok) {
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email,
              password: effectivePassword,
            });
            if (signInData?.user) {
              activeUser = signInData.user;
            }
          }
        } catch (confirmErr) {
          console.warn('Automatic account confirmation deferred:', confirmErr);
        }
      }

      // Upsert profile record in profiles table
      if (activeUser) {
        currentUserIdRef.current = activeUser.id;
        try {
          await supabase.from('profiles').upsert({
            id: activeUser.id,
            full_name: name,
            institution: 'SpaceGeoAI Research Community',
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Profile record auto-insert deferred:', dbErr);
        }

        const profile = await fetchUserProfile(activeUser);
        setUser(profile);
        await loadInvestigationsForUser(activeUser.id);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  // Password reset via Supabase Auth
  const forgotPassword = async (email: string) => {
    try {
      if (isSupabaseConfigured) {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/sign-in` : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (error) {
          return { success: false, message: error.message };
        }
      }
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${email}. Check your inbox.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Could not dispatch reset email.',
      };
    }
  };

  // Sign Out
  const signOut = async () => {
    currentUserIdRef.current = null;
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch {}
    setUser(null);
    try {
      localStorage.removeItem('esa_user_profile');
    } catch {}
  };

  // Update Profile in Supabase
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      if (isSupabaseConfigured) {
        const updates: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (data.name !== undefined) updates.full_name = data.name;
        if (data.affiliation !== undefined) updates.institution = data.affiliation;
        if (data.avatar !== undefined) updates.avatar_url = data.avatar;

        await supabase.from('profiles').update(updates).eq('id', user.id);
      }
    } catch (err) {
      console.warn('Could not update profile in DB:', err);
    }

    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem('esa_user_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Delete Account
  const deleteAccount = async () => {
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('saved_investigations').delete().eq('user_id', user.id);
      } catch {}
      try {
        await supabase.from('research_projects').delete().eq('user_id', user.id);
      } catch {}
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setSavedInvestigations([]);
    setActiveInvestigationId(null);
    try {
      localStorage.removeItem('esa_user_profile');
      localStorage.removeItem('esa_saved_investigations');
    } catch {}
  };

  // Save Investigation to Supabase & localStorage
  const saveInvestigation = async (params: {
    title: string;
    description?: string;
    mainLocation: LocationState;
    secondaryLocation?: LocationState;
    selectedCategory?: string;
    selectedVariable?: string;
    forecastHorizonMonths?: number;
    confidenceLevel?: number;
    chatMessages?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
    notes?: string;
    tags?: string[];
  }): Promise<SavedInvestigation> => {
    if (!user) {
      throw new Error('Registration required: Guest accounts do not have save permissions. Please register or sign in to save investigations.');
    }

    const localId = `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    let generatedId = localId;

    const newInv: SavedInvestigation = {
      id: generatedId,
      title: params.title || `Investigation: ${params.mainLocation.name}`,
      description: params.description || `Analysis of ${params.selectedVariable || 'Earth variable'} around ${params.mainLocation.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mainLocation: params.mainLocation,
      secondaryLocation: params.secondaryLocation,
      selectedCategory: params.selectedCategory || 'Vegetation & Biosphere',
      selectedVariable: params.selectedVariable || 'ndvi',
      forecastHorizonMonths: params.forecastHorizonMonths || 24,
      confidenceLevel: params.confidenceLevel || 95,
      chatMessages: params.chatMessages || [],
      notes: params.notes || '',
      tags: params.tags || ['Earth-Observation', 'Trend-Detective'],
    };

    // Attempt persistence to Supabase if logged in
    if (user?.id && isSupabaseConfigured) {
      try {
        // Try saved_investigations table first
        const { data: invRow, error: invErr } = await supabase
          .from('saved_investigations')
          .insert({
            user_id: user.id,
            title: newInv.title,
            description: newInv.description,
            notes: newInv.notes,
            tags: newInv.tags,
            main_location_name: newInv.mainLocation.name,
            main_location_lng: newInv.mainLocation.coordinates[0],
            main_location_lat: newInv.mainLocation.coordinates[1],
            main_location_radius_km: newInv.mainLocation.radiusKm,
            main_location_bbox: newInv.mainLocation.boundingBox,
            secondary_location_name: newInv.secondaryLocation?.name,
            secondary_location_lng: newInv.secondaryLocation?.coordinates[0],
            secondary_location_lat: newInv.secondaryLocation?.coordinates[1],
            secondary_location_radius_km: newInv.secondaryLocation?.radiusKm,
            selected_category: newInv.selectedCategory,
            selected_variable: newInv.selectedVariable,
            forecast_horizon_months: newInv.forecastHorizonMonths,
            confidence_level: newInv.confidenceLevel,
            chat_messages: newInv.chatMessages,
          })
          .select('id')
          .maybeSingle();

        if (invRow?.id) {
          generatedId = invRow.id;
          newInv.id = invRow.id;
        } else if (invErr) {
          // Fallback to research_projects & research_plans table
          const { data: projRow } = await supabase
            .from('research_projects')
            .insert({
              user_id: user.id,
              title: newInv.title,
              description: newInv.description,
              research_question: `Analysis of ${newInv.selectedVariable} in ${newInv.mainLocation.name}`,
              status: 'completed',
              is_public: false,
            })
            .select('id')
            .maybeSingle();

          if (projRow?.id) {
            generatedId = projRow.id;
            newInv.id = projRow.id;
            await supabase.from('research_plans').insert({
              project_id: projRow.id,
              plan_json: newInv,
            });
          }
        }
      } catch (err) {
        console.warn('Database save deferred to local cache:', err);
      }
    }

    setSavedInvestigations(prev => {
      const updated = [newInv, ...prev.filter(i => i.id !== newInv.id)];
      try {
        localStorage.setItem('esa_saved_investigations', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveInvestigationId(newInv.id);
    return newInv;
  };

  // Load Investigation by ID
  const loadInvestigation = (id: string): SavedInvestigation | null => {
    const found = savedInvestigations.find(inv => inv.id === id);
    if (found) {
      setActiveInvestigationId(found.id);
      return found;
    }
    return null;
  };

  // Delete Investigation
  const deleteInvestigation = async (id: string) => {
    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase.from('saved_investigations').delete().eq('id', id);
        await supabase.from('research_projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Could not delete from DB:', err);
      }
    }

    setSavedInvestigations(prev => {
      const updated = prev.filter(inv => inv.id !== id);
      try {
        localStorage.setItem('esa_saved_investigations', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (activeInvestigationId === id) {
      setActiveInvestigationId(null);
    }
  };

  // Update Notes on Investigation
  const updateInvestigationNotes = async (id: string, notes: string) => {
    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase.from('saved_investigations').update({ notes }).eq('id', id);
      } catch {}
    }

    setSavedInvestigations(prev => {
      const updated = prev.map(inv =>
        inv.id === id ? { ...inv, notes, updatedAt: new Date().toISOString() } : inv
      );
      try {
        localStorage.setItem('esa_saved_investigations', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const refreshInvestigations = async () => {
    if (user?.id) {
      await loadInvestigationsForUser(user.id);
    } else {
      await loadInvestigationsForUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        savedInvestigations,
        activeInvestigationId,
        signIn,
        signUp,
        forgotPassword,
        signOut,
        updateProfile,
        deleteAccount,
        saveInvestigation,
        loadInvestigation,
        deleteInvestigation,
        updateInvestigationNotes,
        refreshInvestigations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
