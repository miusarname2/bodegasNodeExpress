var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import axios from "axios";
import { con } from "../database/atlas.js";
import { plainToClass } from "class-transformer";
import { Cellars } from "../storage/cellars.js";
import { limitGrt } from "../limit/config.js";
import { ErrorHandler } from "../storage/errorHandle.js";
import { verifLimiter } from "../middleware/verifLimiter.js";
const bodega = express.Router();
bodega.get("/", limitGrt(), verifLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.rateLimit)
        return;
    console.log(req.rateLimit);
    let db = yield con();
    console.log(db);
    let usuario = db.collection("bodegas");
    let result = yield usuario.find({}).toArray();
    res.send(result);
}));
bodega.get("/bodegas-ordenadas-alfabeticamente", limitGrt(), verifLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resp = yield axios.get("http://localhost:3002/bodegas");
        const toSend = resp.data.sort((a, b) => a.nombre.localeCompare(b.nombre)); // Obtén los datos de response
        res.json(toSend); // Envía solo los datos relevantes en la respuesta JSON
    }
    catch (error) {
        console.error(error);
        console.log(error.errInfo.details.schemaRulesNotSatisfied);
        let errorhandl = new ErrorHandler(error);
        res.send(errorhandl.handerErrorSucess);
    }
}));
bodega.post("/", limitGrt(), verifLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.rateLimit)
        return;
    try {
        var { CREATED_BY, NAME, RESPONSIBLE_NUMBER, STATUS, UPDATED_BY } = plainToClass(Cellars, req.body);
        console.log(req.rateLimit);
        let db = yield con();
        let bodegas = db.collection("bodegas");
        let result = yield bodegas.insertOne({
            nombre: NAME,
            id_responsable: RESPONSIBLE_NUMBER,
            estado: STATUS,
            created_by: CREATED_BY,
            update_by: UPDATED_BY,
        });
        if (!result.insertedId)
            res.status(500).send(JSON.stringify({ "Status": 500, "message": "bad" }));
        res.status(201).send(JSON.stringify({ "Status": 201, "message": "success" }));
    }
    catch (error) {
        console.error(error);
        if (error.errInfo.details.schemaRulesNotSatisfied) {
            console.log(error.errInfo.details.schemaRulesNotSatisfied);
            let errorhandl = new ErrorHandler(error);
            res.send(errorhandl.handerErrorSucess);
        }
        else {
            res.status(500).send(JSON.stringify({ "status": 500, "message": error }));
        }
    }
}));
export default bodega;
