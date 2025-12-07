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
"[project]/Downloads/ClincsManagmentSystem/models/Patient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
const PatientSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    full_name: {
        type: String,
        required: [
            true,
            'Please provide a full name'
        ]
    },
    phone: {
        type: String,
        required: [
            true,
            'Please provide a phone number'
        ]
    },
    email: {
        type: String,
        required: [
            true,
            'Please provide an email'
        ],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [
            true,
            'Please provide a password'
        ],
        minlength: 6,
        select: false
    },
    insurance_info: {
        type: String
    },
    medical_summary: {
        type: String
    },
    emergency_contact: {
        name: String,
        phone: String,
        relation: String
    }
}, {
    timestamps: true
});
// Hash password before saving
PatientSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].genSalt(10);
    this.password = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(this.password, salt);
});
// Method to compare password
PatientSchema.methods.comparePassword = async function(enteredPassword) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(enteredPassword, this.password);
};
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.Patient || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model('Patient', PatientSchema);
}),
"[project]/Downloads/ClincsManagmentSystem/models/Doctor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
const DoctorSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    full_name: {
        type: String,
        required: [
            true,
            'Please provide a full name'
        ]
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        required: [
            true,
            'Please provide an email'
        ],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [
            true,
            'Please provide a password'
        ],
        minlength: 6,
        select: false
    },
    qualifications: [
        String
    ],
    specializations: {
        type: [
            String
        ],
        default: []
    },
    clinic_affiliations: [
        {
            type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"].Types.ObjectId,
            ref: 'Clinic'
        }
    ],
    schedule_days: [
        {
            day: String,
            start_time: String,
            end_time: String
        }
    ]
}, {
    timestamps: true
});
// Hash password before saving
DoctorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].genSalt(10);
    this.password = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(this.password, salt);
});
// Method to compare password
DoctorSchema.methods.comparePassword = async function(enteredPassword) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(enteredPassword, this.password);
};
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.Doctor || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model('Doctor', DoctorSchema);
}),
"[project]/Downloads/ClincsManagmentSystem/app/api/auth/me/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$auth$2d$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/lib/auth-request.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$db$2f$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/lib/db/connection.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$models$2f$Patient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/models/Patient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$models$2f$Doctor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ClincsManagmentSystem/models/Doctor.ts [app-route] (ecmascript)");
;
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
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$lib$2f$db$2f$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDB"])();
        if (authUser.role === 'patient') {
            const patient = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$models$2f$Patient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(authUser.id).lean();
            if (!patient) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    message: 'Patient not found'
                }, {
                    status: 404
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                user: {
                    id: patient._id.toString(),
                    role: 'patient',
                    full_name: patient.full_name,
                    email: patient.email,
                    phone: patient.phone
                }
            });
        }
        if (authUser.role === 'doctor') {
            const doctor = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$models$2f$Doctor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findById(authUser.id).lean();
            if (!doctor) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    message: 'Doctor not found'
                }, {
                    status: 404
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                user: {
                    id: doctor._id.toString(),
                    role: 'doctor',
                    full_name: doctor.full_name,
                    email: doctor.email,
                    specializations: doctor.specializations
                }
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ClincsManagmentSystem$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: 'Unsupported role'
        }, {
            status: 400
        });
    } catch (error) {
        console.error('[AUTH_ME_ERROR]', error);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__58e16f91._.js.map