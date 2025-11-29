
import React from 'react';
import { ProductOrder } from '../types';

interface ProductCardProps {
  order: ProductOrder;
  onQuantityChange: (productId: number | string, newQuantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ order, onQuantityChange }) => {
  const { product, quantity } = order;

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg bg-slate-50">
      <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
      <div className="flex-grow">
        <h4 className="font-semibold text-slate-800">{product.name}</h4>
        <p className="text-sm text-slate-500">{product.description}</p>
        <p className="text-md font-bold text-primary">₹{product.price.toFixed(2)} / {product.unit}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button 
            type="button" 
            onClick={() => onQuantityChange(product.id, quantity - 1)}
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Decrease quantity of ${product.name}`}
        >
          -
        </button>
        <input 
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value) || 0)}
            className="w-12 text-center border rounded-md py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-700 text-white border-slate-500"
            min="0"
            aria-label={`Quantity of ${product.name}`}
        />
        <button 
            type="button" 
            onClick={() => onQuantityChange(product.id, quantity + 1)}
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Increase quantity of ${product.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ProductCard;