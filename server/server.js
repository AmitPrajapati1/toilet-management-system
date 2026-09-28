
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================================================
   FAMILY MEMBER SCHEMA
========================================================= */

const familyMemberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        relation: {
            type: String,
            trim: true,
        },

        gender: {
            type: String,
            trim: true,
        },
    },
    {
        _id: true,
    }
);

/* =========================================================
   FAMILY SCHEMA
========================================================= */

const familySchema = new mongoose.Schema(
    {
        /*
         * Family ID:
         * - Automatically generated
         * - Starts from 1
         * - Unique
         * - Cannot be changed
         */
        familyId: {
            type: Number,
            required: true,
            unique: true,
            immutable: true,
        },

        headName: {
            type: String,
            required: true,
            trim: true,
        },

        mobile: {
            type: String,
            trim: true,
        },

        houseNo: {
            type: String,
            trim: true,
        },

        address: {
            type: String,
            trim: true,
        },

        active: {
            type: Boolean,
            default: true,
        },

        members: {
            type: [familyMemberSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   FAMILY PAYMENT SCHEMA
========================================================= */

const paymentSchema = new mongoose.Schema(
    {
        familyId: {
            type: Number,
            required: true,
        },

        month: {
            type: String,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        method: {
            type: String,
            trim: true,
        },

        paidDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   INDIVIDUAL PAYMENT SCHEMA
========================================================= */

const individualSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        method: {
            type: String,
            trim: true,
        },

        collector: {
            type: String,
            trim: true,
        },

        note: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   EXPENSE SCHEMA
========================================================= */

const expenseSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            trim: true,
        },

        customExpense: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        date: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   STAFF SCHEMA
========================================================= */

const staffSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        mobile: {
            type: String,
            trim: true,
        },

        role: {
            type: String,
            trim: true,
        },

        salary: {
            type: Number,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   CLEANING SCHEMA
========================================================= */

const cleaningSchema = new mongoose.Schema(
    {
        date: {
            type: String,
        },

        cleaner: {
            type: String,
            trim: true,
        },

        area: {
            type: String,
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   MAINTENANCE SCHEMA
========================================================= */

const maintenanceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        priority: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   SETTINGS SCHEMA
========================================================= */

const settingSchema = new mongoose.Schema(
    {
        familyMonthlyFee: {
            type: Number,
            default: 120,
            min: 0,
        },

        individualUsageFee: {
            type: Number,
            default: 5,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   COUNTER SCHEMA
========================================================= */

const counterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },

        value: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================================
   MODELS
========================================================= */

const Family = mongoose.model("Family", familySchema);

const FamilyPayment = mongoose.model(
    "FamilyPayment",
    paymentSchema
);

const Individual = mongoose.model(
    "Individual",
    individualSchema
);

const Expense = mongoose.model(
    "Expense",
    expenseSchema
);

const Staff = mongoose.model(
    "Staff",
    staffSchema
);

const Cleaning = mongoose.model(
    "Cleaning",
    cleaningSchema
);

const Maintenance = mongoose.model(
    "Maintenance",
    maintenanceSchema
);

const Setting = mongoose.model(
    "Setting",
    settingSchema
);

const Counter = mongoose.model(
    "Counter",
    counterSchema
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
    res.json({
        message: "API is running",
    });
});

/* =========================================================
   GET NEXT FAMILY ID
========================================================= */

async function getNextFamilyId() {
    const counter = await Counter.findOneAndUpdate(
        {
            name: "familyId",
        },
        {
            $inc: {
                value: 1,
            },
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );

    return counter.value;
}

/* =========================================================
   TOTALS
========================================================= */

async function totals() {
    const [
        familyPayments,
        individualPayments,
        expenses,
    ] = await Promise.all([
        FamilyPayment.find(),
        Individual.find(),
        Expense.find(),
    ]);

    const familyIncome = familyPayments.reduce(
        (sum, item) =>
            sum + Number(item.amount || 0),
        0
    );

    const individualIncome = individualPayments.reduce(
        (sum, item) =>
            sum + Number(item.amount || 0),
        0
    );

    const totalExpenses = expenses.reduce(
        (sum, item) =>
            sum + Number(item.amount || 0),
        0
    );

    const income =
        familyIncome +
        individualIncome;

    const balance =
        income -
        totalExpenses;

    return {
        familyIncome,
        individualIncome,
        expenses: totalExpenses,
        income,
        balance,
    };
}

/* =========================================================
   DASHBOARD
========================================================= */

app.get("/api/dashboard", async (req, res) => {
    try {
        const [
            activeFamilies,
            families,
            familyPayments,
            individualPayments,
            expensesData,
        ] = await Promise.all([
            Family.countDocuments({
                active: true,
            }),

            Family.find({
                active: true,
            }).select(
                "headName members"
            ),

            FamilyPayment.find(),

            Individual.find(),

            Expense.find(),
        ]);

        /* -----------------------------------------
           FAMILY HEADS
        ----------------------------------------- */

        const totalFamilyHeads =
            activeFamilies;

        /* -----------------------------------------
           FAMILY MEMBERS
           Excludes family heads
        ----------------------------------------- */

        const totalFamilyMembers =
            families.reduce(
                (total, family) => {
                    return (
                        total +
                        (
                            Array.isArray(
                                family.members
                            )
                                ? family.members.length
                                : 0
                        )
                    );
                },
                0
            );

        /* -----------------------------------------
           TOTAL FAMILY INCOME
        ----------------------------------------- */

        const familyIncome =
            familyPayments.reduce(
                (sum, payment) =>
                    sum +
                    Number(
                        payment.amount || 0
                    ),
                0
            );

        /* -----------------------------------------
           TOTAL INDIVIDUAL INCOME
        ----------------------------------------- */

        const individualIncome =
            individualPayments.reduce(
                (sum, payment) =>
                    sum +
                    Number(
                        payment.amount || 0
                    ),
                0
            );

        /* -----------------------------------------
           CURRENT DATE
        ----------------------------------------- */

        const now = new Date();

        /* -----------------------------------------
           CURRENT WEEK
           Monday -> Sunday
        ----------------------------------------- */

        const startOfWeek =
            new Date(now);

        const day =
            startOfWeek.getDay();

        const daysFromMonday =
            day === 0
                ? 6
                : day - 1;

        startOfWeek.setDate(
            startOfWeek.getDate() -
                daysFromMonday
        );

        startOfWeek.setHours(
            0,
            0,
            0,
            0
        );

        const endOfWeek =
            new Date(startOfWeek);

        endOfWeek.setDate(
            endOfWeek.getDate() + 7
        );

        /* -----------------------------------------
           CURRENT MONTH
        ----------------------------------------- */

        const startOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const endOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                1
            );

        /* -----------------------------------------
           WEEKLY FAMILY INCOME
        ----------------------------------------- */

        const weeklyFamilyIncome =
            familyPayments.reduce(
                (sum, payment) => {
                    const paymentDate =
                        new Date(
                            payment.paidDate ||
                                payment.createdAt
                        );

                    if (
                        paymentDate >=
                            startOfWeek &&
                        paymentDate <
                            endOfWeek
                    ) {
                        return (
                            sum +
                            Number(
                                payment.amount ||
                                    0
                            )
                        );
                    }

                    return sum;
                },
                0
            );

        /* -----------------------------------------
           WEEKLY INDIVIDUAL INCOME
        ----------------------------------------- */

        const weeklyIndividualIncome =
            individualPayments.reduce(
                (sum, payment) => {
                    const paymentDate =
                        new Date(
                            payment.createdAt
                        );

                    if (
                        paymentDate >=
                            startOfWeek &&
                        paymentDate <
                            endOfWeek
                    ) {
                        return (
                            sum +
                            Number(
                                payment.amount ||
                                    0
                            )
                        );
                    }

                    return sum;
                },
                0
            );

        /* -----------------------------------------
           MONTHLY FAMILY INCOME
        ----------------------------------------- */

        const monthlyFamilyIncome =
            familyPayments.reduce(
                (sum, payment) => {
                    const paymentDate =
                        new Date(
                            payment.paidDate ||
                                payment.createdAt
                        );

                    if (
                        paymentDate >=
                            startOfMonth &&
                        paymentDate <
                            endOfMonth
                    ) {
                        return (
                            sum +
                            Number(
                                payment.amount ||
                                    0
                            )
                        );
                    }

                    return sum;
                },
                0
            );

        /* -----------------------------------------
           MONTHLY INDIVIDUAL INCOME
        ----------------------------------------- */

        const monthlyIndividualIncome =
            individualPayments.reduce(
                (sum, payment) => {
                    const paymentDate =
                        new Date(
                            payment.createdAt
                        );

                    if (
                        paymentDate >=
                            startOfMonth &&
                        paymentDate <
                            endOfMonth
                    ) {
                        return (
                            sum +
                            Number(
                                payment.amount ||
                                    0
                            )
                        );
                    }

                    return sum;
                },
                0
            );

        /* -----------------------------------------
           WEEKLY TOTAL
        ----------------------------------------- */

        const weeklyIncome =
            weeklyFamilyIncome +
            weeklyIndividualIncome;

        /* -----------------------------------------
           MONTHLY TOTAL
        ----------------------------------------- */

        const monthlyIncome =
            monthlyFamilyIncome +
            monthlyIndividualIncome;

        /* -----------------------------------------
           TOTAL EXPENSES
        ----------------------------------------- */

        const expenses =
            expensesData.reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount || 0
                    ),
                0
            );

        /* -----------------------------------------
           TOTAL INCOME
        ----------------------------------------- */

        const income =
            familyIncome +
            individualIncome;

        /* -----------------------------------------
           BALANCE
        ----------------------------------------- */

        const balance =
            income -
            expenses;

        /* -----------------------------------------
           RESPONSE
        ----------------------------------------- */

        res.json({
            families: activeFamilies,

            totalFamilyHeads,

            totalFamilyMembers,

            familyIncome,

            individualIncome,

            weeklyFamilyIncome,

            weeklyIndividualIncome,

            weeklyIncome,

            monthlyFamilyIncome,

            monthlyIndividualIncome,

            monthlyIncome,

            expenses,

            income,

            balance,
        });
    } catch (error) {
        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            message:
                error.message,
        });
    }
});

/* =========================================================
   FAMILY ROUTES
========================================================= */

/* GET ALL FAMILIES */

app.get(
    "/api/families",
    async (req, res) => {
        try {
            const families =
                await Family.find()
                    .sort({
                        familyId: 1,
                    });

            res.json(families);
        } catch (error) {
            res.status(500).json({
                message:
                    error.message,
            });
        }
    }
);

/* GET SINGLE FAMILY */

app.get(
    "/api/families/:id",
    async (req, res) => {
        try {
            const family =
                await Family.findById(
                    req.params.id
                );

            if (!family) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Family not found",
                    });
            }

            res.json(family);
        } catch (error) {
            res.status(400).json({
                message:
                    error.message,
            });
        }
    }
);

/* CREATE FAMILY */

app.post(
    "/api/families",
    async (req, res) => {
        try {
            const body = {
                ...req.body,
            };

            /* Family ID must never come from frontend */

            delete body.familyId;

            if (
                !body.headName ||
                !String(
                    body.headName
                ).trim()
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Family Head Name is required",
                    });
            }

            /* Validate members */

            if (
                Array.isArray(
                    body.members
                )
            ) {
                const invalidMember =
                    body.members.some(
                        (member) =>
                            !member.name ||
                            !String(
                                member.name
                            ).trim()
                    );

                if (
                    invalidMember
                ) {
                    return res
                        .status(400)
                        .json({
                            message:
                                "Every family member must have a name",
                        });
                }

                /* Remove unwanted old fields */

                body.members =
                    body.members.map(
                        (member) => ({
                            name: String(
                                member.name
                            ).trim(),

                            relation:
                                member.relation ||
                                "",

                            gender:
                                member.gender ||
                                "",
                        })
                    );
            }

            /* Generate Family ID */

            const familyId =
                await getNextFamilyId();

            body.familyId =
                familyId;

            const family =
                await Family.create(
                    body
                );

            res.status(201).json(
                family
            );
        } catch (error) {
            console.error(
                "Create family error:",
                error
            );

            res.status(400).json({
                message:
                    error.message,
            });
        }
    }
);

/* UPDATE FAMILY */

app.put(
    "/api/families/:id",
    async (req, res) => {
        try {
            const body = {
                ...req.body,
            };

            /*
             * IMPORTANT:
             * Family ID can NEVER be changed.
             */

            delete body._id;
            delete body.familyId;

            if (
                !body.headName ||
                !String(
                    body.headName
                ).trim()
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Family Head Name is required",
                    });
            }

            /* Validate members */

            if (
                Array.isArray(
                    body.members
                )
            ) {
                const invalidMember =
                    body.members.some(
                        (member) =>
                            !member.name ||
                            !String(
                                member.name
                            ).trim()
                    );

                if (
                    invalidMember
                ) {
                    return res
                        .status(400)
                        .json({
                            message:
                                "Every family member must have a name",
                        });
                }

                body.members =
                    body.members.map(
                        (member) => ({
                            _id:
                                member._id,

                            name: String(
                                member.name
                            ).trim(),

                            relation:
                                member.relation ||
                                "",

                            gender:
                                member.gender ||
                                "",
                        })
                    );
            }

            const family =
                await Family.findByIdAndUpdate(
                    req.params.id,
                    body,
                    {
                        new: true,
                        runValidators: true,
                    }
                );

            if (!family) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Family not found",
                    });
            }

            res.json(family);
        } catch (error) {
            console.error(
                "Update family error:",
                error
            );

            res.status(400).json({
                message:
                    error.message,
            });
        }
    }
);

/* DELETE FAMILY */

app.delete(
    "/api/families/:id",
    async (req, res) => {
        try {
            const family =
                await Family.findByIdAndDelete(
                    req.params.id
                );

            if (!family) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Family not found",
                    });
            }

            res.json({
                message:
                    "Family deleted successfully",
            });
        } catch (error) {
            res.status(400).json({
                message:
                    error.message,
            });
        }
    }
);

/* =========================================================
   GENERIC CRUD FUNCTION
========================================================= */

function crud(
    path,
    Model
) {
    /* GET */

    app.get(
        `/api/${path}`,
        async (req, res) => {
            try {
                const items =
                    await Model.find()
                        .sort({
                            createdAt: -1,
                        });

                res.json(items);
            } catch (error) {
                res.status(500).json({
                    message:
                        error.message,
                });
            }
        }
    );

    /* POST */

    app.post(
        `/api/${path}`,
        async (req, res) => {
            try {
                const item =
                    await Model.create(
                        req.body
                    );

                res.status(201).json(
                    item
                );
            } catch (error) {
                console.error(
                    `Create ${path} error:`,
                    error
                );

                res.status(400).json({
                    message:
                        error.message,
                });
            }
        }
    );

    /* PUT */

    app.put(
        `/api/${path}/:id`,
        async (req, res) => {
            try {
                const item =
                    await Model.findByIdAndUpdate(
                        req.params.id,
                        req.body,
                        {
                            new: true,
                            runValidators: true,
                        }
                    );

                if (!item) {
                    return res
                        .status(404)
                        .json({
                            message:
                                "Record not found",
                        });
                }

                res.json(item);
            } catch (error) {
                res.status(400).json({
                    message:
                        error.message,
                });
            }
        }
    );

    /* DELETE */

    app.delete(
        `/api/${path}/:id`,
        async (req, res) => {
            try {
                const item =
                    await Model.findByIdAndDelete(
                        req.params.id
                    );

                if (!item) {
                    return res
                        .status(404)
                        .json({
                            message:
                                "Record not found",
                        });
                }

                res.json({
                    message:
                        "Deleted successfully",
                });
            } catch (error) {
                res.status(400).json({
                    message:
                        error.message,
                });
            }
        }
    );
}

/* =========================================================
   CRUD ROUTES
========================================================= */

crud(
    "family-payments",
    FamilyPayment
);

crud(
    "individual",
    Individual
);

crud(
    "expenses",
    Expense
);

crud(
    "staff",
    Staff
);

crud(
    "cleaning",
    Cleaning
);

crud(
    "maintenance",
    Maintenance
);

/* =========================================================
   SETTINGS
========================================================= */

/* GET SETTINGS */

app.get(
    "/api/settings",
    async (req, res) => {
        try {
            let settings =
                await Setting.findOne();

            if (!settings) {
                settings =
                    await Setting.create({
                        familyMonthlyFee: 120,
                        individualUsageFee: 5,
                    });
            }

            res.json(settings);
        } catch (error) {
            res.status(500).json({
                message:
                    error.message,
            });
        }
    }
);

/* UPDATE SETTINGS */

app.put(
    "/api/settings",
    async (req, res) => {
        try {
            const settings =
                await Setting.findOneAndUpdate(
                    {},
                    {
                        familyMonthlyFee:
                            Number(
                                req.body
                                    .familyMonthlyFee
                            ),

                        individualUsageFee:
                            Number(
                                req.body
                                    .individualUsageFee
                            ),
                    },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                    }
                );

            res.json(settings);
        } catch (error) {
            res.status(400).json({
                message:
                    error.message,
            });
        }
    }
);

/* =========================================================
   REPORTS
========================================================= */

app.get(
    "/api/reports",
    async (req, res) => {
        try {
            const [
                familyPayments,
                individualPayments,
                expenses,
            ] = await Promise.all([
                FamilyPayment.find().sort({
                    paidDate: -1,
                }),

                Individual.find().sort({
                    createdAt: -1,
                }),

                Expense.find().sort({
                    createdAt: -1,
                }),
            ]);

            const familyIncome =
                familyPayments.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.amount || 0
                        ),
                    0
                );

            const individualIncome =
                individualPayments.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.amount || 0
                        ),
                    0
                );

            const totalExpenses =
                expenses.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.amount || 0
                        ),
                    0
                );

            const totalIncome =
                familyIncome +
                individualIncome;

            const balance =
                totalIncome -
                totalExpenses;

            res.json({
                familyIncome,

                individualIncome,

                totalIncome,

                expenses:
                    totalExpenses,

                balance,

                familyPayments,

                individualPayments,

                expenseRecords:
                    expenses,
            });
        } catch (error) {
            res.status(500).json({
                message:
                    error.message,
            });
        }
    }
);

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "MongoDB connected"
        );

        /*
         * Make sure Family ID counter exists.
         *
         * For a fresh database:
         * Counter starts at 0.
         * First family gets ID 1.
         */

        let counter =
            await Counter.findOne({
                name: "familyId",
            });

        if (!counter) {
            /*
             * Check whether numeric family
             * records already exist.
             */

            const lastFamily =
                await Family.findOne()
                    .sort({
                        familyId: -1,
                    })
                    .select(
                        "familyId"
                    );

            const startingValue =
                lastFamily &&
                Number.isFinite(
                    lastFamily.familyId
                )
                    ? lastFamily.familyId
                    : 0;

            counter =
                await Counter.create({
                    name: "familyId",
                    value: startingValue,
                });

            console.log(
                `Family ID counter initialized at ${startingValue}`
            );
        }

        console.log(
            "Family ID system ready"
        );

        app.listen(
            PORT,
            () => {
                console.log(
                    `Server running at http://localhost:${PORT}`
                );
            }
        );
    } catch (error) {
        console.error(
            "MongoDB connection error:",
            error.message
        );
    }
}

startServer();