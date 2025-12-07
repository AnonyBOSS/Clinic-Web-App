module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/Downloads/ClincsManagmentSystem/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractToken",
    ()=>extractToken,
    "generateToken",
    ()=>generateToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
;
// Load env secret with type safety
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET is not set. Please define it in your environment variables.');
}
const JWT_SECRET = secret;
function generateToken(payload, expiresIn = '30d') {
    const options = {
        expiresIn
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, options);
}
function verifyToken(token) {
    try {
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
        return decoded;
    } catch  {
        return null;
    }
}
function extractToken(authHeader) {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
    return null;
}
}),
"[project]/Downloads/ClincsManagmentSystem/lib/auth-request.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAuthUserFromRequest",
    ()=>getAuthUserFromRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/lib/auth.ts [app-route] (ecmascript)");
;
function getAuthUserFromRequest(req) {
    // 1) Try cookie first
    let token = req.cookies.get('auth_token')?.value ?? null;
    // 2) If no cookie, fall back to Authorization header
    if (!token) {
        const authHeader = req.headers.get('authorization');
        token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractToken"])(authHeader);
    }
    if (!token) return null;
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
    if (!payload) return null;
    return payload;
}
}),
"[externals]/mongoose [external] (mongoose, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongoose", () => require("mongoose"));

module.exports = mod;
}),
"[project]/Downloads/ClincsManagmentSystem/lib/db/connection.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectDB",
    ()=>connectDB
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinics-booking';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
let cached = /*TURBOPACK member replacement*/ __turbopack_context__.g;
if (!cached.mongoose) {
    cached.mongoose = {
        conn: null,
        promise: null
    };
}
async function connectDB() {
    if (cached.mongoose.conn) {
        return cached.mongoose.conn;
    }
    if (!cached.mongoose.promise) {
        const opts = {
            bufferCommands: false
        };
        cached.mongoose.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connect(MONGODB_URI, opts).then((mongoose)=>{
            return mongoose;
        });
    }
    try {
        cached.mongoose.conn = await cached.mongoose.promise;
    } catch (e) {
        cached.mongoose.promise = null;
        throw e;
    }
    return cached.mongoose.conn;
}
}),
"[project]/Downloads/ClincsManagmentSystem/models/Appointment.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const AppointmentSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    patient_id: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"].Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor_id: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"].Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    clinic_id: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"].Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    room_id: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"].Types.ObjectId,
        ref: 'Room',
        required: true
    },
    slot_id: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"].Types.ObjectId,
        ref: 'Slot',
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: [
            'booked',
            'confirmed',
            'cancelled',
            'completed'
        ],
        default: 'booked'
    },
    notes: String,
    payment: {
        amount: {
            type: Number,
            required: true
        },
        method: {
            type: String,
            enum: [
                'cash',
                'card'
            ],
            required: true
        },
        transaction_id: String,
        status: {
            type: String,
            enum: [
                'pending',
                'paid',
                'refunded',
                'failed'
            ],
            default: 'pending'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});
// Create indexes for faster queries
AppointmentSchema.index({
    doctor_id: 1,
    createdAt: -1
});
AppointmentSchema.index({
    patient_id: 1,
    createdAt: -1
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.Appointment || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model('Appointment', AppointmentSchema);
}),
"[project]/Downloads/ClincsManagmentSystem/app/api/appointments/patient/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$auth$2d$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/lib/auth-request.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$db$2f$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/lib/db/connection.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$models$2f$Appointment$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/models/Appointment.ts [app-route] (ecmascript)");
;
;
;
;
async function GET(req) {
    try {
        const authUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$auth$2d$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthUserFromRequest"])(req);
        if (!authUser) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'Unauthorized'
            }, {
                status: 401
            });
        }
        if (authUser.role !== 'patient') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'Forbidden'
            }, {
                status: 403
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$db$2f$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDB"])();
        // adjust field names if your model uses patient_id / doctor_id etc.
        const appointments = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$models$2f$Appointment$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
            patient: authUser.id
        }).populate('doctor', 'full_name specializations').sort({
            createdAt: -1
        }).lean();
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            appointments
        });
    } catch (error) {
        console.error('[PATIENT_APPOINTMENTS_ERROR]', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d86da56d._.js.map