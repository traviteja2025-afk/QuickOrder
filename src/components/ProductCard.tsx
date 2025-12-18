
import React from 'react';
import { ProductOrder } from '../types';

interface ProductCardProps {
  order: ProductOrder;
  onQuantityChange: (productId: number | string, newQuantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ order, onQuantityChange }) => {
  const { product, quantity } = order;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        {quantity > 0 && (
            <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-fade-in">
                {quantity} in cart
            </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
            <h4 className="font-bold text-slate-800 line-clamp-1">{product.name}</h4>
            <span className="text-primary font-black shrink-0">₹{product.price}</span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-grow">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.unit}</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                    type="button" 
                    onClick={() => onQuantityChange(product.id, quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-700"
                    disabled={quantity === 0}
                    aria-label={`Decrease quantity of ${product.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-800">{quantity}</span>
                <button 
                    type="button" 
                    onClick={() => onQuantityChange(product.id, quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-primary hover:text-white transition-colors shadow-sm"
                    aria-label={`Increase quantity of ${product.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
