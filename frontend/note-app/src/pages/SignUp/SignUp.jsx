import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import PasswordInput from "../../components/Input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../helper";
import axiosInstance from "../../axiosInstance";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter password.");
      return;
    }
    if (!confirmPassword) {
      setError("Please enter confirm paswword.");
      return;
    }
    if (password != confirmPassword) {
      setError("Password and confirm password not match.");
      return;
    }

    setError("");

    //signup
    try {
      const response = await axiosInstance.post("/create-user", {
        name: name,
        email: email,
        password: password,
      });

      if (response.data && response.data.error) {
        setError(response.data.message);
        return;
      }

      if (response.data) {
        navigate("/login");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Unexpected error occurered. Please try again later");
      }
    }
  };
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7">SignUp</h4>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              placeholder="Your name here..."
              className="input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="email">Email</label>
            <input
              type="text"
              placeholder="Your email here..."
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="Password">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label htmlFor="ConfirmPassword">Confirm Password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Create Account
            </button>
            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
