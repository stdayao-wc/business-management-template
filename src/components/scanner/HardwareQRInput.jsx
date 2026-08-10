"use client";

import { useEffect, useRef } from "react";

export default function HardwareQRInput({
    onScan,
}) {
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function handleKeyDown(event) {
        if (event.key !== "Enter") {
            return;
        }

        const value =
            inputRef.current?.value
                ?.trim();

        if (!value) {
            return;
        }

        onScan(value);

        inputRef.current.value = "";
    }

    return (
        <input
            ref={inputRef}
            type="text"
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="absolute h-0 w-0 opacity-0"
            aria-label="QR scanner input"
        />
    );
}