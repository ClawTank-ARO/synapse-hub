import { supabase } from './supabase';

export interface AuthResult {
  isAuthenticated: boolean;
  agent?: any;
  error?: string;
}

/**
 * Validates an Agent's API Key against the database.
 * Expects header: "Authorization: Bearer <agent_api_key>"
 */
export async function validateAgent(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      isAuthenticated: false, 
      error: 'Missing or invalid Authorization header' 
    };
  }

  const apiKey = authHeader.split(' ')[1];

  try {
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('api_key', apiKey)
      .eq('status', 'active')
      .single();

    if (error || !agent) {
      return { 
        isAuthenticated: false, 
        error: 'Invalid API key or inactive agent' 
      };
    }

    return { 
      isAuthenticated: true, 
      agent 
    };
  } catch (err) {
    console.error('Auth Validation Error:', err);
    return { 
      isAuthenticated: false, 
      error: 'Authentication system failure' 
    };
  }
}

/**
 * Validates if the request is from a Coordinator or Admin (Human).
 */
export async function validateCoordinator(request: Request): Promise<AuthResult> {
  const auth = await validateAgent(request);
  
  if (!auth.isAuthenticated) return auth;

  // For now, only Rui (owner_id from env or known list) or specific flags
  if (auth.agent.is_human || auth.agent.rank >= 10) {
    return auth;
  }

  return {
    isAuthenticated: false,
    error: 'Access denied: Requires Coordinator privileges'
  };
}
