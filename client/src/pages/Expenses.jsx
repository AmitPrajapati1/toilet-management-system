import { useState } from "react";
import GenericCrud from "./GenericCrud";

const expenseCategories = [
    "Electricity",
    "Water",
    "Cleaning Supplies",
    "Toilet Cleaning",
    "Maintenance",
    "Plumbing",
    "Repair",
    "Sanitation",
    "Toilet Paper",
    "Soap & Handwash",
    "Cleaning Equipment",
    "Staff Salary",
    "Pest Control",
    "Waste Management",
    "Miscellaneous / Other",
];

export default function Expenses() {
    const [category, setCategory] = useState("");

    return (
        <GenericCrud
            title="Expenses"
            path="expenses"
            fields={[
                {
                    key: "category",
                    label: "Expense Category",
                    type: "select",
                    required: true,
                    col: "col-md-6",
                    options: expenseCategories,
                    onChange: setCategory,
                },

                ...(category === "Miscellaneous / Other"
                    ? [
                          {
                              key: "customExpense",
                              label: "Custom Expense",
                              placeholder:
                                  "Enter custom expense name",
                              required: true,
                              col: "col-md-6",
                          },
                      ]
                    : []),

                {
                    key: "description",
                    label: "Description",
                    placeholder:
                        "Enter expense details",
                    col: "col-md-6",
                },

                {
                    key: "amount",
                    label: "Amount",
                    type: "number",
                    min: "0",
                    required: true,
                    col: "col-md-6",
                },

                {
                    key: "date",
                    label: "Date",
                    type: "date",
                    required: true,
                    col: "col-md-6",
                },
            ]}
        />
    );
}