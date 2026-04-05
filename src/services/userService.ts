import prisma from "../utils/db";
import { hashPassword, verifyPassword } from "../utils/password";
import { UserInput, UserUpdateInput, LoginInput } from "../utils/validation";

type DbUser = {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type UserUpdateData = {
  email?: string;
  name?: string;
  role?: string;
  status?: string;
};

export class UserService {
  async createUser(input: UserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: "VIEWER",
        status: "ACTIVE",
      },
    });

    return this.sanitizeUser(user);
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const validPassword = await verifyPassword(input.password, user.password);

    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("User account is inactive");
    }

    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        role: user.role,
      })
    ).toString("base64");

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return this.sanitizeUser(user);
  }

  async getAllUsers(skip: number = 0, take: number = 10) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return {
      users: users.map((user: DbUser) => this.sanitizeUser(user)),
      total,
      skip,
      take,
    };
  }

  async updateUser(id: number, input: UserUpdateInput) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: UserUpdateData = {};

    if (input.email) {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing && existing.id !== id) {
        throw new Error("Email already in use");
      }
      updateData.email = input.email;
    }

    if (input.name) updateData.name = input.name;
    if (input.role) updateData.role = input.role;
    if (input.status) updateData.status = input.status;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.sanitizeUser(updated);
  }

  async deleteUser(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: "User deleted successfully" };
  }

  private sanitizeUser(user: DbUser) {
    const { password, ...rest } = user;
    return rest;
  }
}

export const userService = new UserService();
