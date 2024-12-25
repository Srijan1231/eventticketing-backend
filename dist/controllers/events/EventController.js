var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { createEvent, createEventTableFunction, deleteEventByID, findAllEvent, findEventByID, updateEventByID, } from "../../models/pg/events/model.js";
import EventMetaData from "../../models/mongodb/Schema/EventMetaData.js";
// This is for core data
const postEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createEventTableFunction();
        const result = yield createEvent(req.body);
        console.log(result);
        if (result.id) {
            const { metadata } = req.body;
            if (metadata && typeof metadata === "object") {
                try {
                    yield EventMetaData.create({
                        eventId: result.id,
                        metadata,
                    });
                }
                catch (metaError) {
                    console.log("Error creating event metadata:", metaError);
                }
            }
            return res.json({
                status: "success",
                message: "Event created",
            });
        }
        res.json({
            status: "Error",
            message: "Unable to create Event",
        });
    }
    catch (error) {
        if (error.code === "23505") {
            // Unique constraint violation error code in PostgreSQL
            return res.status(409).json({
                status: "error",
                message: "Duplicate event: an event with the same name, date, and location already exists.",
            });
        }
    }
});
const getEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const event = id ? yield findEventByID(id) : yield findAllEvent();
        return res.json({
            status: "success",
            message: "Here is events",
            event,
        });
    }
    catch (error) {
        next(error);
    }
});
const updateEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { id, newFields } = _a, rest = __rest(_a, ["id", "newFields"]);
        const result = yield updateEventByID(id, Object.assign({}, rest));
        if (result === null || result === void 0 ? void 0 : result.id) {
            const updatedMetaEvent = yield EventMetaData.findOneAndUpdate({ eventId: result.id }, { $set: Object.assign({}, newFields) }, { new: true, upsert: true });
            console.log("Event metadata updated:", updatedMetaEvent);
            return res.status(200).json({
                status: "success",
                message: "Event update successfully",
            });
        }
        return res.status(500).json({
            status: "error",
            message: "Error updating events",
        });
    }
    catch (error) {
        next(error);
    }
});
const deleteEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield deleteEventByID(id);
        if (result === null || result === void 0 ? void 0 : result.id) {
            const deleteEventMetaData = yield EventMetaData.findOneAndDelete({
                eventId: result.id,
            });
            console.log("Event metadata deleted:", deleteEventMetaData);
            return res.json({
                status: "success",
                message: "Event deleted",
            });
        }
        return res.json({
            status: "error",
            message: "Unable to delete event",
        });
    }
    catch (error) {
        next(error);
    }
});
// This is for  metadata
export { postEvent, getEvents, updateEvents, deleteEvents };
