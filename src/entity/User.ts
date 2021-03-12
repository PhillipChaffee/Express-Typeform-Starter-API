import {Entity, PrimaryGeneratedColumn, Column, Index, OneToMany} from "typeorm";
import {Habit} from "./Habits/Habit";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index({unique: true})
    providerId: string;

    @Column()
    displayName: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    photoUrl: string;

    @OneToMany(() => Habit, habit => habit.user)
    habits: Habit[];

}
