import Link from "next/link";

import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Create your DiskartePinoyTV account
                    </p>
                </div>

                <SignupForm />

                <div className="mt-6 text-center">
                </div>
            </div>
        </main>
    );
}