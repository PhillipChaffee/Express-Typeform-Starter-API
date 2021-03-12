import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import {User} from "./entity/User";

createConnection().then(async connection => {

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // cors
    const cors = require('cors');
    app.use(cors({
        origin: ['http://localhost:3000'],
        credentials: true,
    }));

    // set up authentication / session management
    let cookieParser = require('cookie-parser');
    app.use(cookieParser());

    let session = require('express-session');
    app.use(session({
        secret: 'YOUR_SECRET_HERE',
        cookie: {
            secure: false,
        }
    }));

    let passport = require('passport');
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        let userRepository = getRepository(User);
        userRepository.findOneOrFail(id)
            .then(user => done(null, user))
            .catch(reason => done(reason, null))
    });

    let GoogleStrategy = require('passport-google-oauth20').Strategy;

    passport.use(new GoogleStrategy({
            clientID: "YOUR_CLIENT_ID_HERE",
            clientSecret: "YOUR_CLIENT_SECRET_HERE",
            callbackURL: "http://localhost:5000/auth/google/callback",
        },
        function (accessToken, refreshToken, profile, done) {
            let userRepository = getRepository(User);
            userRepository.findOne({where: {providerId: profile.id}}).then(user => {
                if (!user) {
                    user = {
                        providerId: profile.id,
                        email: profile.emails && profile.emails.length !== 0 ? profile.emails[0].value : '',
                        displayName: profile.displayName,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        photoUrl: profile.photos && profile.photos.length !== 0 ? profile.photos[0].value : '',
                    } as User;

                    userRepository.save(user).then(user => {
                        return done(null, user);
                    });
                } else {
                    return done(null, user);
                }
            })
        }
    ));

    app.get('/auth/google',
        passport.authenticate('google', {scope: ['profile']}));

    app.get('/auth/google/callback',
        passport.authenticate('google', {failureRedirect: '/'}),
        function (req, res) {
            res.redirect('http://localhost:3000');
        });

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    // setup express app here
    // ...

    // start express server
    app.listen(5000);

    // insert new users for test
    // await connection.manager.save(connection.manager.create(User, {
    //     firstName: "Timber",
    //     lastName: "Saw",
    //     age: 27
    // }));
    // await connection.manager.save(connection.manager.create(User, {
    //     firstName: "Phantom",
    //     lastName: "Assassin",
    //     age: 24
    // }));

    console.log("Express server has started on port 5000. Open http://localhost:5000/users to see results");

}).catch(error => console.log(error));
