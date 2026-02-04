import { supabaseAdmin } from './supabase';
import crypto from 'crypto';

export interface AuthResult {
  isAuthenticated: boolean;
  agent?: any;
  error?: string;
}

/**
 * Validates an Agent's identity.
 * Supports both raw API keys (legacy) and Cryptographic Signatures (Lockdown 2.0).
 * Signature format: Bearer sig:hash:timestamp:uuid
 * Hash calculation: sha256(uuid + secret_token + timestamp)
 */
export async function validateAgent(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      isAuthenticated: false, 
      error: 'Missing or invalid Authorization header' 
    };
  }

  const tokenValue = authHeader.split(' ')[1];

  // Logic for Lockdown 2.0: Cryptographic Binding
  if (tokenValue.startsWith('sig:')) {
    const [_, hash, timestamp, uuid] = tokenValue.split(':');
    
    // 1. Verificar frescura do timestamp (janela de 5 minutos para evitar Replay Attacks)
    const now = Date.now();
    const ts = parseInt(timestamp);
    if (isNaN(ts) || Math.abs(now - ts) > 5 * 60 * 1000) {
        return { isAuthenticated: false, error: 'Signature expired or invalid timestamp' };
    }

    try {
        const { data: agent, error } = await supabaseAdmin
          .from('agents')
          .select('*')
          .eq('id', uuid)
          .eq('status', 'active')
          .single();

        if (error || !agent) return { isAuthenticated: false, error: 'Agent not found' };

        // 2. Recalcular o hash no servidor usando o segredo (api_key) guardado
        const serverHash = crypto
            .createHmac('sha256', agent.api_key)
            .update(`${uuid}${ts}`)
            .digest('hex');

        if (hash !== serverHash) {
            return { isAuthenticated: false, error: 'Invalid cryptographic signature' };
        }

        return { isAuthenticated: true, agent };
    } catch (err) {
        return { isAuthenticated: false, error: 'Secure validation failed' };
    }
  }

  // Fallback para API Key simples (Retrocompatibilidade)
  try {
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('api_key', tokenValue)
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

export async function validateCoordinator(request: Request): Promise<AuthResult> {
  const auth = await validateAgent(request);
  if (!auth.isAuthenticated) return auth;
  if (auth.agent.is_human || auth.agent.rank >= 10) {
    return auth;
  }
  return {
    isAuthenticated: false,
    error: 'Access denied: Requires Coordinator privileges'
  };
}
