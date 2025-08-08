import bcrypt from 'bcryptjs';

export async function verifyPassword(password) {
  // Pour la production, vous pouvez hasher le mot de passe une fois et le stocker
  const hashedPassword = '$2a$10$YourHashedPasswordHere'; // Remplacez par votre hash
  return bcrypt.compare(password, hashedPassword);
}

// Fonction utilitaire pour hasher le mot de passe initial
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}