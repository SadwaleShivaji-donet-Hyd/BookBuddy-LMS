import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
    HomeIcon, 
    BookOpenIcon, 
    UserGroupIcon, 
    ArrowLeftOnRectangleIcon, 
    PlusIcon, 
    TrashIcon,
    PencilSquareIcon // Added Edit Icon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Track if we are editing or adding
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);

    const [bookForm, setBookForm] = useState({ 
        title: '', author: '', isbn: '', genre: '', totalCopies: 1 
    });
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await api.get('/Books'); 
            if (response.data.isSuccess) {
                setBooks(response.data.result || []);
            }
        } catch (error) {
            toast.error("Failed to load books");
        }
    };

    // --- OPEN MODAL FOR ADDING ---
    const openAddModal = () => {
        setIsEditMode(false);
        setBookForm({ title: '', author: '', isbn: '', genre: '', totalCopies: 1 });
        setIsModalOpen(true);
    };

    // --- OPEN MODAL FOR EDITING ---
    const openEditModal = (book) => {
        setIsEditMode(true);
        setCurrentBookId(book.bookId);
        // Populate form with existing data
        setBookForm({ 
            title: book.title, 
            author: book.author, 
            isbn: book.isbn, 
            genre: book.genre, 
            totalCopies: book.totalCopies 
        });
        setIsModalOpen(true);
    };

    // --- HANDLE SAVE (CREATE OR UPDATE) ---
    const handleSaveBook = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                // UPDATE EXISTING BOOK
                // Backend expects the full object including BookId for PUT
                const payload = { ...bookForm, bookId: currentBookId };
                await api.put('/Books', payload);
                toast.success("Book Updated Successfully");
            } else {
                // CREATE NEW BOOK
                await api.post('/Books', bookForm);
                toast.success("Book Added Successfully");
            }
            setIsModalOpen(false);
            fetchBooks(); // Refresh list
        } catch (error) {
            toast.error(isEditMode ? "Failed to update book" : "Failed to add book");
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await api.delete(`/Books/${id}`);
            toast.success("Book deleted");
            fetchBooks();
        } catch (error) {
            toast.error("Failed to delete book");
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* SIDEBAR */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold flex items-center gap-2">
                    <span>📚</span> BookBuddy
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <button className="flex items-center gap-3 w-full px-4 py-3 bg-indigo-600 rounded-lg text-white">
                        <BookOpenIcon className="h-6 w-6" /> Manage Books
                    </button>
                    {/* Placeholder buttons */}
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg transition">
                        <UserGroupIcon className="h-6 w-6" /> Users
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg transition">
                        <HomeIcon className="h-6 w-6" /> Dashboard
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg">
                        <ArrowLeftOnRectangleIcon className="h-6 w-6" /> Logout
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Book Inventory</h1>
                    <button 
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition"
                    >
                        <PlusIcon className="h-5 w-5" /> Add New Book
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Author</th>
                                <th className="p-4">Category</th>
                                <th className="p-4 text-center">Stock</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {books.length > 0 ? books.map((book) => (
                                <tr key={book.bookId} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-900">{book.title}</td>
                                    <td className="p-4">{book.author}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">{book.genre}</span></td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {book.availableCopies} / {book.totalCopies}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-3">
                                        {/* EDIT BUTTON */}
                                        <button 
                                            onClick={() => openEditModal(book)}
                                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition"
                                            title="Edit Book"
                                        >
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        {/* DELETE BUTTON */}
                                        <button 
                                            onClick={() => handleDelete(book.bookId)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                                            title="Delete Book"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">No books found. Add one to get started!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL (REUSED FOR ADD & EDIT) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {isEditMode ? 'Edit Book Details' : 'Add New Book'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSaveBook} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={bookForm.title} onChange={(e) => setBookForm({...bookForm, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={bookForm.author} onChange={(e) => setBookForm({...bookForm, author: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                                    <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        value={bookForm.isbn} onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                                    <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        value={bookForm.genre} onChange={(e) => setBookForm({...bookForm, genre: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies (Stock)</label>
                                <input type="number" min="0" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={bookForm.totalCopies} onChange={(e) => setBookForm({...bookForm, totalCopies: parseInt(e.target.value)})} />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition mt-2">
                                {isEditMode ? 'Update Book' : 'Save Book'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;


//outdated 