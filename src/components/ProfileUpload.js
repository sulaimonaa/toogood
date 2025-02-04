import { useState } from "react";
import axios from "axios";

const ProfileUpload = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!image) {
            setMessage("Please select an image first.");
            return;
        }

        const formData = new FormData();
        formData.append("profileImage", image);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:5000/upload-agent-profile", formData, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });

            setMessage(response.data.message);
        } catch (error) {
            console.error("Upload error:", error);
            setMessage("Error uploading image.");
        }
    };

    return (
        <div>
            <h2>Upload Profile Image</h2>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            {preview && <img src={preview} alt="Preview" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />}
            <button onClick={handleUpload}>Upload</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ProfileUpload;
