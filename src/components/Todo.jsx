import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Todo = () => {
  // State for input text, items, error messages, and modal visibility
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Load todos from local storage on component mount
  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem("todos"));
    if (storedItems) {
      setItems(storedItems);
    }
  }, []);

  // Save todos to local storage whenever items change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(items));
  }, [items]);

  // Function to handle item removal
  const handleRemove = () => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems.splice(itemToRemove, 1); // Remove the selected item
      return newItems;
    });
    setShowModal(false); // Close the modal
    toast.error("Item removed successfully"); // Show a toast message
  };

  // Function to set up removal confirmation
  const confirmRemove = (index) => {
    setItemToRemove(index);
    setShowModal(true); // Show the confirmation modal
  };

  // Function to add or update items
  const addItem = () => {
    if (inputText.trim() === "") {
      setError(true); // Set error if input is empty
      return;
    }
    setError(false); // Clear error
    if (itemToEdit !== null) {
      // Editing an existing item
      setItems((prevItems) => {
        const newItems = [...prevItems];
        newItems[itemToEdit].text = inputText; // Update item text
        return newItems;
      });
      setItemToEdit(null); // Clear edit state
    } else {
      // Adding a new item
      setItems((prevItems) => [...prevItems, { text: inputText, completed: false }]);
    }
    setInputText(""); // Reset input field
    toast.success("Item added/updated successfully"); // Show success message
  };

  // Handle key press for adding items
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addItem(); // Call addItem if Enter is pressed
    }
  };

  // Toggle the completion status of an item
  const toggleCompletion = (index) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[index].completed = !newItems[index].completed; // Toggle completed state
      return newItems;
    });
  };

  // Set up the item for editing
  const editItem = (index) => {
    setInputText(items[index].text); // Populate input with current item text
    setItemToEdit(index); // Set the item index for editing
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-5 text-purple-700">Todo List</h1>
        <div className="flex items-center mb-4">
          <input
            type="text"
            className={`flex-1 p-2 border-2 rounded-md transition-colors duration-300 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)} // Update input text
            onKeyPress={handleKeyPress} // Handle Enter key press
            placeholder="Add a new item"
          />
          <button
            onClick={addItem} // Call addItem on click
            className="bg-purple-600 text-white px-4 py-2 rounded-md ml-2 transition-transform duration-300 hover:scale-105"
          >
            {itemToEdit !== null ? "Update" : "Add"} {/* Change button text based on state */}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mb-4">Please enter a valid item</div>}
        <ul className="p-0 m-0 list-none">
          {items.map((item, index) => (
            <li
              key={index}
              className={`bg-gray-100 p-3 mb-2 flex justify-between items-center rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ${
                item.completed ? "line-through text-gray-500" : ""
              }`}
            >
              <span onClick={() => toggleCompletion(index)} className="cursor-pointer">
                {item.text} {/* Display item text */}
              </span>
              <div>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2 transition-transform duration-300 hover:scale-105"
                  onClick={() => editItem(index)} // Call editItem on click
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded-md transition-transform duration-300 hover:scale-105"
                  onClick={() => confirmRemove(index)} // Call confirmRemove on click
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Custom Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">Confirm Removal</h2>
              <p>Are you sure you want to delete this item?</p>
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2"
                  onClick={() => setShowModal(false)} // Close modal
                >
                  Cancel
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                  onClick={handleRemove} // Confirm removal
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

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
        />
      </div>
    </div>
  );
};

export default Todo;
