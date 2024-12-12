import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AccountCard({ account, onUpdateTitle }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(account.lms_name || "Unknown LMS");

    const handleCourseClick = (course) => {
        router.push(`/course/${course.id}`);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        if (title !== account.lms_name) {
            onUpdateTitle(account.account_id, title);
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
                {account.lms_name === "Canvas" && (
                    <Image
                        src="/images/Canvas_logo_red.png"
                        alt="Canvas Logo"
                        width={40}
                        height={40}
                        className="mr-4"
                    />
                )}
                <div className="flex items-center flex-grow">
                    {isEditing ? (
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className="flex-grow border-b-2 border-blue-500 focus:outline-none"
                        />
                    ) : (
                        <h2 className="text-xl font-semibold text-gray-700 flex-grow">
                            {title}
                        </h2>
                    )}
                    {isEditing ? (
                        <button
                            onClick={handleSaveClick}
                            className="ml-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            onClick={handleEditClick}
                            className="ml-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
            <p className="text-gray-600">
                LMS URL: {account.api_base_url || "N/A"}
            </p>
            <h3 className="text-lg font-semibold mt-4">Courses:</h3>
            <ul className="list-none">
                {account.courses && account.courses.length > 0 ? (
                    account.courses
                        .filter((course) => course.name && course.id) // Filter unnamed or invalid courses
                        .map((course) => (
                            <li key={`${account.account_id}-${course.id}`}>
                                <button
                                    onClick={() => handleCourseClick(course)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 my-2"
                                >
                                    {course.name} ({course.course_code})
                                </button>
                            </li>
                        ))
                ) : (
                    <p className="text-gray-500">No courses available</p>
                )}
            </ul>
        </div>
    );
}
