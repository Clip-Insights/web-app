
const Contact = () => {
  const handleButtonClick = () => {
    window.open('https://clipinsights.org/contact/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="mx-4 my-6 p-4 rounded-3xl text-center"
      style={{
        background: 'linear-gradient(180deg, #F1F2FF 0%, rgba(239, 240, 255, 0.2) 100%)',
      }}
    >
      <h3 className="text-lg font-semibold mb-4">Any Query?</h3>
      <p className="text-sm text-gray-500 mb-10">
        Lets connect with us for any query or solution.
      </p>
      <button className="bg-customPrimary text-white px-6 py-2 rounded-md font-medium" onClick={handleButtonClick}>
        Contact Us
      </button>
    </div>
  );
};

export default Contact;
