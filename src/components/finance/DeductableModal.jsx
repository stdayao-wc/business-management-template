"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/common/Modal";

import {
    createExpense,
    EXPENSE_TYPES,
} from "@/services/finance";

import { toast } from "sonner";

const defaultForm = {
    expenseType:
        EXPENSE_TYPES.EMPLOYEE_SALARY,
    description: "",
    salaryMonth: "",
    amount: "",
    employeeName: "",
    supplierName: "",
    notes: "",
};

const fieldClass =
    "w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-500";

const labelClass =
    "mb-2 block text-sm font-medium";

export default function DeductableModal({
    open,
    user,
    onClose,
    onSuccess,
}) {
    const [form, setForm] =
        useState(defaultForm);

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {
        if (open) {
            setForm(defaultForm);
        }
    }, [open]);

    function handleChange(event) {
        const {
            name,
            value,
        } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!user?.id) {
            toast.error(
                "Unable to identify the current user."
            );

            return;
        }

        try {
            setSaving(true);

        let description =
            form.description;

        if (
            form.expenseType ===
            EXPENSE_TYPES.EMPLOYEE_SALARY
        ) {
            if (!form.salaryMonth) {
                throw new Error(
                    "Salary month is required."
                );
            }

            const [year, month] =
                form.salaryMonth.split("-");

            const salaryDate = new Date(
                Number(year),
                Number(month) - 1,
                1
            );

            const formattedMonth =
                salaryDate.toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        year: "numeric",
                    }
                );

            description =
                `Salary - ${formattedMonth}`;
        }

        await createExpense({
            expenseType:
                form.expenseType,

            description,

            amount: Number(form.amount),

            employeeName:
                form.expenseType ===
                EXPENSE_TYPES.EMPLOYEE_SALARY
                    ? form.employeeName
                    : null,

            supplierName:
                form.expenseType ===
                EXPENSE_TYPES.BUY_FROM_SUPPLIER
                    ? form.supplierName
                    : null,

            notes: form.notes,

            createdBy: user.id,
        });

            toast.success(
                "Deductable recorded successfully."
            );

            await onSuccess?.();

            onClose();
        } catch (error) {
            console.error(
                "Failed to create expense:",
                error
            );

            toast.error(
                error?.message ||
                    "Unable to record deductable."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            open={open}
            title="Add Deductable"
            onClose={
                saving
                    ? undefined
                    : onClose
            }
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >

                {/* Expense Type */}

                <div>
                    <label
                        className={labelClass}
                    >
                        Expense Type
                    </label>

                    <select
                        name="expenseType"
                        value={
                            form.expenseType
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            fieldClass
                        }
                        disabled={saving}
                    >
                        <option
                            value={
                                EXPENSE_TYPES.EMPLOYEE_SALARY
                            }
                        >
                            Employee Salary
                        </option>

                        <option
                            value={
                                EXPENSE_TYPES.BUY_FROM_SUPPLIER
                            }
                        >
                            Buy From Supplier
                        </option>

                        <option
                            value={
                                EXPENSE_TYPES.OTHER
                            }
                        >
                            Other
                        </option>
                    </select>
                </div>

                {/* Employee Salary */}

                {form.expenseType ===
                    EXPENSE_TYPES.EMPLOYEE_SALARY && (
                    <>
                        <div>
                            <label className={labelClass}>
                                Employee Name
                            </label>

                            <input
                                type="text"
                                name="employeeName"
                                value={form.employeeName}
                                onChange={handleChange}
                                placeholder="Enter employee name"
                                className={fieldClass}
                                disabled={saving}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Salary Month
                            </label>

                            <input
                                type="month"
                                name="salaryMonth"
                                value={form.salaryMonth}
                                onChange={handleChange}
                                className={fieldClass}
                                disabled={saving}
                                required
                            />
                        </div>
                    </>
                )}

                {/* Supplier */}

                {form.expenseType ===
                    EXPENSE_TYPES.BUY_FROM_SUPPLIER && (
                    <>
                        <div>
                            <label className={labelClass}>
                                Supplier Name
                            </label>

                            <input
                                type="text"
                                name="supplierName"
                                value={form.supplierName}
                                onChange={handleChange}
                                placeholder="Enter supplier name"
                                className={fieldClass}
                                disabled={saving}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Description
                            </label>

                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="What was purchased?"
                                className={fieldClass}
                                disabled={saving}
                                required
                            />
                        </div>
                    </>
                )}

                {/* Other */}

                {form.expenseType ===
                    EXPENSE_TYPES.OTHER && (
                    <div>
                        <label className={labelClass}>
                            Description
                        </label>

                        <input
                            type="text"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="What was this expense for?"
                            className={fieldClass}
                            disabled={saving}
                            required
                        />
                    </div>
                )}

                {/* Amount */}

                <div>
                    <label
                        className={
                            labelClass
                        }
                    >
                        Amount
                    </label>

                    <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={
                            handleChange
                        }
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        className={
                            fieldClass
                        }
                        disabled={
                            saving
                        }
                        required
                    />
                </div>

                {/* Notes */}

                <div>
                    <label
                        className={
                            labelClass
                        }
                    >
                        Notes
                    </label>

                    <textarea
                        name="notes"
                        value={
                            form.notes
                        }
                        onChange={
                            handleChange
                        }
                        rows={3}
                        placeholder="Optional notes"
                        className={
                            fieldClass
                        }
                        disabled={
                            saving
                        }
                    />
                </div>

                {/* Actions */}

                <div className="flex justify-end gap-3 border-t pt-4">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg border px-5 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : "Record Deductable"}
                    </button>

                </div>

            </form>
        </Modal>
    );
}