import {
  ReportItem,
  VolunteerOpportunity,
  CommentItem,
  AIStructureResult,
  AIDiscussionSummary,
  AIComplaintLetter,
  UserProfile,
  ReportCategory,
  UrgencyLevel,
} from '../types';
import {
  INITIAL_REPORTS,
  INITIAL_VOLUNTEER_OPPORTUNITIES,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
} from './demo-data';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiClient {
  private getAuthHeaders(user: UserProfile | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (user) {
      // Pass demo token or Supabase JWT
      const token = `${user.role}-token`;
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // ----------------------------------------
  // Health
  // ----------------------------------------
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
      if (res.ok) return await res.json();
    } catch {
      // Backend not running
    }
    return {
      status: 'offline_fallback',
      service: 'HelpHub AI (Browser Fallback Mode)',
      ai_runtime: { connected: false, configured_model: 'gemma4' },
      demo_mode: true,
    };
  }

  // ----------------------------------------
  // AI Endpoints
  // ----------------------------------------
  async structureReport(description: string, preferred_language = 'en', location = ''): Promise<AIStructureResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/structure-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          preferred_language,
          context_location: location,
        }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API structure-report fallback active:', e);
    }

    // Client-side heuristic fallback
    const descLower = description.toLowerCase();
    let cat: ReportCategory = 'other';
    if (/garbage|trash|waste|drain|clean|dump|कचरा|ଅଳିଆ/.test(descLower)) cat = 'sanitation';
    else if (/pothole|road|street|tar|asphalt|सड़क|ରାସ୍ତା/.test(descLower)) cat = 'roads';
    else if (/water|pipe|leak|tap|sewage|drinking|पानी|ପାଣି/.test(descLower)) cat = 'water';
    else if (/light|electric|lamp|pole|wire|power|बिजली|ବିଜୁଳି/.test(descLower)) cat = 'electricity';
    else if (/ramp|wheelchair|sidewalk|footpath|blind|disabled/.test(descLower)) cat = 'accessibility';
    else if (/park|garden|bench|tree|playground|पार्क|ପାର୍କ/.test(descLower)) cat = 'parks';

    let urg: UrgencyLevel = 'medium';
    let reasoning = 'Moderate civic disruption affecting daily local community activity.';
    if (/danger|hazard|spark|burst|accident|open live wire|critical/.test(descLower)) {
      urg = 'high';
      reasoning = 'Reported issue involves acute physical hazards or safety risks.';
    }

    const title = description.split('\n')[0].substring(0, 80) || `${cat.toUpperCase()} Issue Reported`;

    return {
      suggested_title: title,
      suggested_category: cat,
      suggested_urgency: urg,
      urgency_reasoning: reasoning,
      summary: description.substring(0, 250),
      detected_language: preferred_language,
      translations: {
        en: title,
        hi: `${title} (हिन्दी अनुवाद)`,
        or: `${title} (ଓଡ଼ିଆ ଅନୁବାଦ)`,
      },
      recommended_next_steps: [
        'Confirm the approximate street location on the map.',
        'Attach a photo if safe and convenient.',
        'Review and edit suggestions before submitting.',
      ],
      is_advisory_only: true,
      model_identifier: 'gemma4 (client fallback heuristic)',
    };
  }

  async summarizeDiscussion(title: string, comments: string[]): Promise<AIDiscussionSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/summarize-discussion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_title: title, comments }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API summarize-discussion fallback active:', e);
    }

    return {
      summary: `Discussion on "${title}" includes ${comments.length} community contributions focusing on volunteer cleanup and contacting ward authorities.`,
      main_concerns: ['Accumulation of waste obstructing pedestrian traffic and health hygiene concerns.'],
      proposed_solutions: ['Organizing a neighborhood volunteer drive this weekend with safety gear provided.'],
      open_questions: ['Has the local ward sanitary supervisor scheduled a municipal transport truck?'],
      comments_analyzed: comments.length,
      is_ai_generated: true,
      model_identifier: 'gemma4 (fallback)',
    };
  }

  async generateComplaintLetter(params: {
    report_title: string;
    problem_description: string;
    location: string;
    language: string;
    recipient_authority: string;
    sender_name?: string;
  }): Promise<AIComplaintLetter> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/generate-complaint-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API generate-complaint-letter fallback active:', e);
    }

    const today = new Date().toLocaleDateString();
    const draft = `To,\nThe Competent Officer / Ward Authority,\n${params.recipient_authority}\n\nDate: ${today}\n\nSubject: Formal Request for Urgent Attention: ${params.report_title}\n\nRespected Sir/Madam,\n\nI am writing as a resident and concerned community member to respectfully bring to your department's urgent notice an infrastructure concern at ${params.location}.\n\nProblem Summary:\n${params.problem_description}\n\nThis condition poses inconvenience and potential safety hazards to local citizens, pedestrians, and students in our area. We kindly urge an on-site inspection and necessary remediation at your earliest convenience.\n\nThank you for your dedication to our civic welfare.\n\nSincerely,\n${params.sender_name || 'Concerned Citizen / Local Resident'}\nContact: [Optional Contact Details]`;

    return {
      draft_letter: draft,
      subject_line: `Formal Request for Civic Attention: ${params.report_title}`,
      language: params.language,
      recipient_authority: params.recipient_authority,
      is_draft: true,
      filing_disclaimer:
        'This is an AI-assisted draft for your personal review. It has NOT been submitted to any official authority. Verify all details before sending.',
      model_identifier: 'gemma4 (structured template)',
    };
  }

  // ----------------------------------------
  // Reports
  // ----------------------------------------
  async getReports(params?: { category?: string; status?: string; search?: string }): Promise<ReportItem[]> {
    try {
      const q = new URLSearchParams();
      if (params?.category) q.append('category', params.category);
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      const res = await fetch(`${API_BASE_URL}/api/reports?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch {
      // Fallback
    }

    // Filter local storage or initial demo data
    let list = this.getLocalReports();
    if (params?.category && params.category !== 'all') {
      list = list.filter((r) => r.category === params.category);
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter((r) => r.status === params.status);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          r.current_description.toLowerCase().includes(s) ||
          r.approximate_public_location.toLowerCase().includes(s)
      );
    }
    return list;
  }

  async getReportById(id: string): Promise<ReportItem | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const reports = this.getLocalReports();
    return reports.find((r) => r.id === id) || null;
  }

  async createReport(reportData: Partial<ReportItem>, user: UserProfile): Promise<ReportItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: this.getAuthHeaders(user),
        body: JSON.stringify({
          title: reportData.title,
          description: reportData.original_description,
          category: reportData.category,
          user_confirmed_urgency: reportData.user_confirmed_urgency || 'medium',
          approximate_public_location: reportData.approximate_public_location,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          preferred_language: reportData.preferred_language || 'en',
          ai_structured: reportData.ai_structured || false,
          translations: reportData.translations || {},
          image_urls: reportData.images || [],
        }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      creator: {
        id: user.id,
        display_name: user.display_name,
        role: user.role,
      },
      title: reportData.title || 'Untitled Community Report',
      original_description: reportData.original_description || '',
      current_description: reportData.original_description || '',
      category: reportData.category || 'other',
      user_confirmed_urgency: reportData.user_confirmed_urgency || 'medium',
      status: 'open',
      approximate_public_location: reportData.approximate_public_location || 'Community Location',
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      preferred_language: reportData.preferred_language || 'en',
      ai_structured: reportData.ai_structured || false,
      translations: reportData.translations || {},
      images: reportData.images || [],
      follows_count: 1,
      comments_count: 0,
      is_followed_by_user: true,
      status_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = this.getLocalReports();
    const updated = [newReport, ...current];
    this.saveLocalReports(updated);
    return newReport;
  }

  // ----------------------------------------
  // Local storage persistence helper for demo mode
  // ----------------------------------------
  getLocalReports(): ReportItem[] {
    try {
      const stored = localStorage.getItem('helphub_reports');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_REPORTS;
  }

  saveLocalReports(reports: ReportItem[]) {
    try {
      localStorage.setItem('helphub_reports', JSON.stringify(reports));
    } catch {
      // ignore
    }
  }

  getLocalVolunteers(): VolunteerOpportunity[] {
    try {
      const stored = localStorage.getItem('helphub_volunteers');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_VOLUNTEER_OPPORTUNITIES;
  }

  saveLocalVolunteers(list: VolunteerOpportunity[]) {
    try {
      localStorage.setItem('helphub_volunteers', JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}

export const apiClient = new ApiClient();

