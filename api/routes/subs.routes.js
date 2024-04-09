import authJwt from "./../middleware/authJwt.js";
import { allSubs } from '../controllers/subs.controller.js'

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/subs/all",
    [authJwt.verifyToken, authJwt.isAdmin],
    allSubs
  );
};
