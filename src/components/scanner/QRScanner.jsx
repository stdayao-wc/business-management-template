"use client";

import { useEffect, useRef, useState } from "react";

import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
} from "html5-qrcode";

export default function QRScanner({
    open,
    onScan,
    onClose,
}) {
    const scannerRef = useRef(null);
    const handledScanRef = useRef(false);
    const fileInputRef = useRef(null);

    const [mode, setMode] = useState("choice");
    const [cameraError, setCameraError] =
        useState(null);
    const [fileError, setFileError] =
        useState(null);
    const [scanningFile, setScanningFile] =
        useState(false);

    /*
     * Reset the scanner whenever the modal opens.
     */
    useEffect(() => {
        if (!open) {
            return;
        }

        handledScanRef.current = false;

        setMode("choice");
        setCameraError(null);
        setFileError(null);
        setScanningFile(false);
    }, [open]);

    /*
     * Stop the camera when the component closes
     * or changes away from camera mode.
     */
    useEffect(() => {
        if (!open || mode !== "camera") {
            return;
        }

        let scanner;

        async function startScanner() {
            try {
                handledScanRef.current = false;
                setCameraError(null);

                scanner = new Html5Qrcode(
                    "qr-scanner"
                );

                scannerRef.current = scanner;

                await scanner.start(
                    {
                        facingMode: "environment",
                    },
                    {
                        fps: 10,
                        qrbox: {
                            width: 250,
                            height: 250,
                        },
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.QR_CODE,
                        ],
                    },
                    async (decodedText) => {
                        if (
                            handledScanRef.current
                        ) {
                            return;
                        }

                        handledScanRef.current =
                            true;

                        try {
                            await scanner.stop();
                        } catch {
                            // Scanner may already be stopped.
                        }

                        try {
                            scanner.clear();
                        } catch {
                            // Scanner may already be cleared.
                        }

                        scannerRef.current =
                            null;

                        onScan(decodedText);
                    },
                    () => {
                        // Ignore normal scan failures.
                    }
                );
            } catch (error) {
                console.error(
                    "QR camera failed:",
                    error
                );

                setCameraError(
                    "Unable to access the camera. Check your browser permissions."
                );
            }
        }

        startScanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .catch(() => {})
                    .finally(() => {
                        try {
                            scannerRef.current?.clear();
                        } catch {
                            // Ignore cleanup errors.
                        }

                        scannerRef.current = null;
                    });
            }
        };
    }, [open, mode, onScan]);

    /*
     * Scan an uploaded QR image.
     */
    async function handleFileChange(event) {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setFileError(null);
        setScanningFile(true);

        try {
            const scanner =
                new Html5Qrcode(
                    "qr-file-scanner"
                );

            const decodedText =
                await scanner.scanFile(
                    file,
                    false
                );

            try {
                scanner.clear();
            } catch {
                // Ignore cleanup errors.
            }

            onScan(decodedText);
        } catch (error) {
            console.error(
                "QR file scan failed:",
                error
            );

            setFileError(
                "No QR code could be found in this image."
            );
        } finally {
            setScanningFile(false);

            /*
             * Clear the input so selecting the same
             * image again triggers onChange.
             */
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    function handleClose() {
        if (scannerRef.current) {
            scannerRef.current
                .stop()
                .catch(() => {})
                .finally(() => {
                    try {
                        scannerRef.current?.clear();
                    } catch {
                        // Ignore cleanup errors.
                    }

                    scannerRef.current = null;
                });
        }

        onClose();
    }

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                {/* Header */}

                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Scan QR Code
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Scan using your camera or upload
                        an image containing a QR code.
                    </p>
                </div>

                {/* Choice */}

                {mode === "choice" && (
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() =>
                                setMode("camera")
                            }
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
                        >
                            Use Camera
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setMode("file");
                                setFileError(null);
                            }}
                            className="w-full rounded-lg border px-4 py-3 font-medium transition hover:bg-gray-50"
                        >
                            Upload QR Image
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full rounded-lg border px-4 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Camera */}

                {mode === "camera" && (
                    <div className="space-y-4">
                        <div
                            id="qr-scanner"
                            className="overflow-hidden rounded-xl"
                        />

                        {cameraError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {cameraError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setMode("choice")
                                }
                                className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* File upload */}

                {mode === "file" && (
                    <div className="space-y-4">
                        <div
                            id="qr-file-scanner"
                            className="hidden"
                        />

                        <label
                            htmlFor="qr-file-input"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition hover:bg-gray-50"
                        >
                            <span className="font-medium">
                                {scanningFile
                                    ? "Scanning image..."
                                    : "Choose QR image"}
                            </span>

                            <span className="mt-1 text-sm text-gray-500">
                                PNG, JPG, or other image
                            </span>
                        </label>

                        <input
                            ref={fileInputRef}
                            id="qr-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={scanningFile}
                            className="hidden"
                        />

                        {fileError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {fileError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setMode("choice")
                                }
                                disabled={scanningFile}
                                className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={scanningFile}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition hover:bg-gray-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}