import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Todo = () => {
  const [inputText, setInputText] = useState(""); // inputText is the value of the input field
  const [items, setItems] = useState([]); // items is an array of todo items
  const [error, setError] = useState(false); // error is a boolean to show an error message

  function handleRemove(index) { // Remove an item from the items array
    if (window.confirm("Are you sure you want to delete this item?")) { // Ask for confirmation
      setItems((prevItems) => { // Update the items array
        const newItems = [...prevItems]; // Create a new array from the previous items array
        newItems.splice(index, 1); // Remove the item at the given index
        return newItems; // Return the new items array
      });
      toast.error("Item removed successfully"); // Show a success message
    }
  }

  function addItem() { // Add a new item to the items array
    if (inputText.trim() === "") { // Check if the input text is empty
      setError(true); // Set the error state to true
      return;
    }
    setError(false); // Reset the error state
    setItems((prevItems) => [...prevItems, inputText]); // Add the input text to the items array
    setInputText(""); // Reset the input text
    toast.success("Item added successfully"); // Show a success message
  }

  function handleKeyPress(e) { // Handle the Enter key press event
    if (e.key === "Enter") { // Check if the key pressed is Enter
      addItem(); // Add a new item
    }
  }

  return (
    <div
      className="
    max-w-md mx-auto p-4 bg-purple-300 rounded-lg shadow-lg mt-8 
    "
    >
      <h1
        className="
      text-2xl font-bold text-center mb-4
      "
      >
        Todo List
      </h1>
      <div
        className="
      flex items-center mb-4
      "
      >
        <input
          type="text"
          className={`
          flex-1 p-2 border-2 rounded
            ${error ? "border-red-500" : ""}`} // Add a red border if there is an error
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new item"
        />
        <button
          onClick={addItem}
          className="
          bg-purple-500 text-white px-4 py-2 rounded ml-2        
          "
        >
          Add
        </button>
      </div>
      {error && (
        <div
          className="
          text-red-500 text-sm mb-4
        "
        >
          Please enter a valid item
        </div>
      )}
      <ul
        className="
        p-0 m-0 list-none
      "
      >
        {items.map((item, index) => (
          <li
            key={index}
            className="
            bg-white p-2 mb-2 flex justify-between items-center      
            "
          >
            {item}
            <button
              className="
              bg-red-500 text-white px-4 py-2 rounded
              "
              onClick={() => handleRemove(index)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      ></ToastContainer>
    </div>
  );
};

export default Todo;
