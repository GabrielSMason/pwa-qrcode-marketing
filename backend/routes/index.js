import auth from "./AuthRoutes.js";
import qrcode from "./QrCodeRoutes.js";
import { salvarSubscription, listarSubscriptions } from "../controllers/PushController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const routes = (app) => {
    app.route("/").get((req, res) => {
        res.status(200).send("Backend Promoção Biscoitos X");
    });

    app.use(auth);
    app.use(qrcode);

    app.post("/subscribe", authMiddleware, salvarSubscription);
    app.get("/subscriptions", listarSubscriptions);
};

export default routes;