import { usersRepository, UsersRepository } from "./users.repo";

export class UsersService {
  constructor(private readonly repo: UsersRepository = usersRepository) {}

  async getAllUsers() {
    return await this.repo.getAllUsers();
  }

  async deleteUser(id: number) {
    await this.repo.deleteUser(id);
  }

  async updateUserRole(id: number, role: "admin" | "user") {
    return await this.repo.updateUserRole(id, role);
  }
}

export const usersService = new UsersService();
