-- Helper function for password hashing (uses pgcrypto)
CREATE OR REPLACE FUNCTION crypt_password(password_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password_text, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function for password verification
CREATE OR REPLACE FUNCTION verify_password(password_text TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN crypt(password_text, password_hash) = password_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
