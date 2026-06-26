import { createAdminClient } from './supabase/admin';

export async function hashPassword(password: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('crypt_password', {
    password_text: password,
  });
  if (error) {
    const encoder = new TextEncoder();
    const data_buf = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data_buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return data;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('verify_password', {
    password_text: password,
    password_hash: hash,
  });
  if (error) {
    const computed = await hashPassword(password);
    return computed === hash;
  }
  return data;
}
