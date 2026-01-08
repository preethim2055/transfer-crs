import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService
  ) {}

  async register(userData: any) {
    const { first_name, last_name, email, password, role } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)`;
    return await this.entityManager.query(sql, [first_name, last_name, email, hashedPassword, role || 'USER']);
  }

  async login(loginData: any) {
    const { email, password, role } = loginData;

    
    const sql = `SELECT * FROM users WHERE email = ? AND role = ?`;
    const users = await this.entityManager.query(sql, [email, role]);

    if (users.length === 0) throw new UnauthorizedException('Invalid credentials');

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');


    const payload = { sub: user.id, role: user.role };
    return {
      token: this.jwtService.sign(payload),
      role: user.role
    };
  }
}