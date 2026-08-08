import { Request, Response, NextFunction } from 'express';
import { ListUsers } from '../../application/use-cases/ListUsers';
import { CreateUserByAdmin } from '../../application/use-cases/CreateUserByAdmin';
import { UpdateUserByAdmin } from '../../application/use-cases/UpdateUserByAdmin';
import { DeleteUser } from '../../application/use-cases/DeleteUser';

export class AdminUserController {
  constructor(
    private readonly listUsers: ListUsers,
    private readonly createUserByAdmin: CreateUserByAdmin,
    private readonly updateUserByAdmin: UpdateUserByAdmin,
    private readonly deleteUser: DeleteUser
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.listUsers.execute();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.createUserByAdmin.execute(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.updateUserByAdmin.execute(req.params.id as string, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteUser.execute(req.params.id as string);
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  };
}
