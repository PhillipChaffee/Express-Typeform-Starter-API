import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";

export class UserController {
    private userRepository = getRepository(User);

    async current(request: Request, response: Response, next: NextFunction) {
        if (!request.user) {
            response.sendStatus(401);
        }

        response.json(request.user);
    }

    async all(request: Request, response: Response, next: NextFunction) {
        return await this.userRepository.find({
            select: ["id", "displayName", "photoUrl"]
        });
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const user = await this.userRepository.findOne({
            where: {id: request.params.id},
            select: ["id", "displayName", "photoUrl"]
        });

        if (!user) {
            response.sendStatus(404);
        }

        return user;
    }
}