import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../types';
import { GoogleGenAI, Modality } from "@google/genai";

interface AddProductFormProps {
    onAddProduct: (newProductData: Omit<Product, 'id'>) => void;
    productToEdit?: Product | null;
    onUpdateProduct?: (updatedProduct: Product) => void;
    onCancelEdit?: () => void;
}

const initialFormState = {
    name: '',
    price: '',
    unit: '',
    description: '',
    imageUrl: '',
};

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, productToEdit, onUpdateProduct, onCancelEdit }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!productToEdit;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: productToEdit.name,
                price: String(productToEdit.price),
                unit: productToEdit.unit,
                description: productToEdit.description,
                imageUrl: productToEdit.imageUrl,
            });
            setImagePreview(productToEdit.imageUrl);
        } else {
            setFormData(initialFormState);
            setImagePreview(null);
        }
        setError(''); // Clear errors when switching modes
    }, [productToEdit, isEditing]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to JPEG
                    
                    setFormData(prev => ({...prev, imageUrl: dataUrl}));
                    setImagePreview(dataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateImage = async () => {
        if (!formData.name) {
            setError('Please enter a product name to generate an image.');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `A professional, clean product shot of "${formData.name}". ${formData.description || ''}. Centered on a white background.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: prompt }],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const part = response.candidates?.[0]?.content?.parts?.[0];
            if (part && part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                setFormData(prev => ({ ...prev, imageUrl }));
                setImagePreview(imageUrl);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                 throw new Error('Image generation failed. The model may have refused the prompt.');
            }

        } catch (err) {
            console.error("Image generation failed:", err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during image generation.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, price, unit, description, imageUrl } = formData;
        if (!name || !price || !unit || !imageUrl) {
            setError('Please fill in all required fields and provide an image.');
            return;
        }

        const productData = {
            name,
            price: parseFloat(price),
            unit,
            description,
            imageUrl,
        };

        if (isEditing && onUpdateProduct && productToEdit) {
            onUpdateProduct({ ...productData, id: productToEdit.id });
        } else {
            onAddProduct(productData);
            // Reset form only when adding a new product
            setFormData(initialFormState);
            setImagePreview(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        setError('');
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{isEditing ? 'Edit Product' : 'Add a New Product'}</h2>
            <p className="text-slate-500 mb-6">{isEditing ? 'Update the details for your product below.' : 'Fill in the details below to add a product to your store.'}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Product Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-slate-600 mb-1">Price (₹)</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required min="0" step="0.01" />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-slate-600 mb-1">Unit</label>
                            <input type="text" name="unit" id="unit" value={formData.unit} onChange={handleChange} placeholder="e.g., kg, pack" className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400"></textarea>
                </div>
                
                <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-600">Product Image</label>
                        {!isEditing && (
                             <button
                                type="button"
                                onClick={handleGenerateImage}
                                disabled={!formData.name || isGenerating}
                                className="text-sm font-semibold text-primary hover:text-primary-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : '✨ Generate with AI'}
                            </button>
                        )}
                     </div>
                     <div className="mt-1 flex items-center space-x-6">
                         <div className="shrink-0 relative">
                            {imagePreview ? (
                                <img className="h-20 w-20 object-cover rounded-lg" src={imagePreview} alt="Current product" />
                            ) : (
                                <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8l4.09 4.09a2 2 0 01.59 1.41V28m0 0l-10-10-8 8-4-4m12 6l-4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                            {isGenerating && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                     <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                         </div>
                         <label className="block">
                             <span className="sr-only">Choose product photo</span>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                         </label>
                     </div>
                </div>


                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <div className="pt-4 border-t flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                    <button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {isEditing ? 'Update Product' : 'Add Product'}
                    </button>
                    {isEditing && onCancelEdit && (
                        <button type="button" onClick={onCancelEdit} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddProductForm;
