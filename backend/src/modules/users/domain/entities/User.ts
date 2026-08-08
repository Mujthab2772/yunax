export type UserRole = 'customer' | 'admin';

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  addresses?: any[];
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public name: string | null,
    public role: UserRole = 'customer',
    public isBanned: boolean = false,
    public addresses: any[] = []
  ) {}

  /**
   * Compares a plain text password with the stored hash.
   * Implementation will typically use bcrypt in the Application/Domain Service layer,
   * but encapsulating the signature here defines the behavior clearly.
   */
  public async validatePassword(plainPassword: string): Promise<boolean> {
    throw new Error('Method not implemented.'); // Will be implemented with bcrypt later
  }

  /**
   * Returns a safe representation of the User without sensitive data.
   * Use this whenever sending User data out to the Presentation Layer (Frontend).
   */
  public toDTO(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      addresses: this.addresses,
    };
  }
}
