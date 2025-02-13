import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileUpload = () => {
    const [agent_image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const [agentId, setAgentId] = useState(null); 

    useEffect(() => {
        // Get agentId from localStorage or authenticated user details
        const storedAgentId = localStorage.getItem("agentId"); 
        if (storedAgentId) {
            setAgentId(storedAgentId);
        } else {
            setMessage("Agent ID not found. Please log in again.");
        }
    }, []);

    const handleUpload = async () => {
        if (!agent_image) {
            setMessage("Please select an image first.");
            return;
        }

        if (!agentId) {
            setMessage("Agent ID is missing. Please log in again.");
            return;
        }

        const formData = new FormData();
        formData.append("agent_image", agent_image); // Ensure this matches backend

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:5000/agents/upload-agent-profile", formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            setMessage(response.data.message || "Image uploaded successfully.");
            setTimeout(() => navigate('/', 2000));
        } catch (error) {
            console.error("Upload error:", error);
            setMessage("Error uploading image.");
        }
    };

    return (
        <div className="container vw-100 vh-100 d-flex flex-column align-items-center justify-content-center gap-3">
            <h2 className="mb-3">Upload Profile Image</h2>
            <input type="file" onChange={handleFileChange} accept="image/*" className="mb-3"/>
            {preview && <img src={preview} alt="Preview" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />}
            <button onClick={handleUpload} className="bg-primary border-0 rounded-pill py-2 px-5 text-white">Upload</button>
            {message && <p className="mt-3">{message}</p>}
        <div>
          <button onClick={() => navigate(-1)} className="btn bg-secondary-subtle rounded-pill">Go Back</button>
        </div>
        </div>
    );
};

export default ProfileUpload;
