import { Link, useLocation } from "react-router-dom";
import { readPlanSelection, withPlanSelection } from "../../utils/planSelection";
import signup_png from "/images/signup.png";
import { ToastContainer } from "react-toastify";

const SignupSuccess = () => {
  const selection = readPlanSelection(useLocation().search);
  return (
    <div className="flex flex-col w-full md:flex-row justify-around items-center min-h-92vh p-8">
      {/* Image Section */}
      <div className="hidden md:flex w-full max-w-md h-96 justify-center items-center">
        <img
          src={signup_png}
          alt="Signup Success Illustration"
          className="rounded-lg max-w-full h-full object-cover"
        />
      </div>

      {/* Message Section */}
      <div className="w-full max-w-md mr-8 mb-8 md:mb-0">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Signup Successful!</h2>
        <p className="text-gray-600 mb-4">
          Kindly confirm your confirmation email to activate your account.
        </p>
        <p className="text-gray-700 text-sm">
          Already verified?{" "}
          <Link to={withPlanSelection("/login", selection)} className="text-customPrimary hover:underline">
            Login
          </Link>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
};

export default SignupSuccess;