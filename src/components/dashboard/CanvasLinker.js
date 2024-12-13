import React, { useState } from "react";

const CanvasLinker = ({ onLinkSuccess }) => {
    const [canvasToken, setCanvasToken] = useState("");
    const [linkingError, setLinkingError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleLinkCanvasAccount = async (e) => {
        e.preventDefault();
        setLinkingError("");
        setSuccessMessage("");

        if (!canvasToken.trim()) {
            setLinkingError("Canvas token is required.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/linked-accounts/auth/canvas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ token: canvasToken }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to link Canvas account.");
            }

            const data = await response.json();
            setSuccessMessage(data.message);
            setCanvasToken("");
            if (onLinkSuccess) {
                onLinkSuccess();
            }
        } catch (error) {
            console.error("Error linking Canvas account:", error.message);
            setLinkingError(error.message);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Link Canvas Account
            </h2>
            <form onSubmit={handleLinkCanvasAccount} className="space-y-4">
                <input
                    type="text"
                    placeholder="Enter Canvas Token"
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring focus:ring-blue-300"
                >
                    Link Canvas Account
                </button>
            </form>
            {linkingError && (
                <p className="text-red-500 mt-2">{linkingError}</p>
            )}
            {successMessage && (
                <p className="text-green-500 mt-2">{successMessage}</p>
            )}
        </div>
    );
};

export default CanvasLinker;
