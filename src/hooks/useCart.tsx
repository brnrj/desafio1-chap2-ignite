import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const dataCart = [...cart];
      const checkProdAlreadyExist = dataCart.find((product) => Number(product.id) === Number(productId));
      const { data: { amount: stockAmount } } = await api.get(`/stock/${productId}`);
      const currentAmount = checkProdAlreadyExist ? checkProdAlreadyExist.amount : 0;
      const amount = currentAmount + 1;

      if (checkProdAlreadyExist) {
        checkProdAlreadyExist.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`)
        const newProduct = {
          ...product.data,
          amount: 1,
        }
        dataCart.push(newProduct);
      }
      
      if(amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
      }
      setCart(dataCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(dataCart))

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
