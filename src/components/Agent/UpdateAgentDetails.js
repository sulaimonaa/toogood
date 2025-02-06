import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const UpdateAgentForm = () => {
  const [formData, setFormData] = useState({
    agent_name: "",
    agent_phone: "",
    agent_email: "",
    agent_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [agentImage, setAgentImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Unauthorized: Please log in.");
          setLoading(false);
          navigate('/login');
          return;
        }

        const response = await axios.get("http://localhost:5000/agents/details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          agent_name: response.data.agent_name,
          agent_phone: response.data.agent_phone,
          agent_email: response.data.agent_email,
          agent_password: ""
        });

        const resp = await fetch("http://localhost:5000/agents/agent-profile", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await resp.json();
      if (data.agent_image) {
          setAgentImage(`http://localhost:5000${data.agent_image}`); 
      } else {
          setAgentImage(null);
      }

      } catch (error) {
        setMessage("Error fetching agent details");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Unauthorized: Please log in.");
        return;
      }

      const response = await axios.put("http://localhost:5000/agents/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(response.data.success || response.data.message);
      setTimeout(() => navigate('/', 2000));
    } catch (error) {
      setMessage("Error updating details");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">Update Profile</h2>
      {message && <p className="text-center text-red-500">{message}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="agent_name"
            value={formData.agent_name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            name="agent_phone"
            value={formData.agent_phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="text"
            name="agent_email"
            value={formData.agent_email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            name="agent_password"
            value={formData.agent_password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update
        </button>
      </form>
      {/* upload image */}
      { !agentImage ? (<FaUserCircle />) : (<img src={agentImage} alt="Agent Profile" className="w-25 rounded" />)}
      <Link to='../upload-profile' className="bg-primary border-0 rounded-full p-2 text-white">Change Profile Image</Link>
    </div>
  );
};

export default UpdateAgentForm;
